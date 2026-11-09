import { buildDoc, fileBaseName } from '../convert';
import { DEFAULT_LABELS } from '../doc';
import type { FxTweet } from '../fx';
import { excerpt, parsePayload, postUrl, type EventRow, type PostPayload } from './db';

/** Renderers for a watch's events: RSS 2.0, JSON Feed 1.1, and one event as Markdown. */

export interface FeedEvent {
  id: string;
  handle: string;
  type: string;
  postId: string | null;
  detectedAt: string;
  payload: Partial<PostPayload>;
}

export const toFeedEvent = (e: EventRow): FeedEvent => ({
  id: e.id,
  handle: e.handle,
  type: e.type,
  postId: e.post_id,
  detectedAt: e.detected_at,
  payload: parsePayload(e),
});

export function eventTitle(e: FeedEvent): string {
  const h = `@${e.handle}`;
  switch (e.type) {
    case 'deleted':
      return e.payload.parentId ? `${h} deleted a post from a thread` : `${h} deleted a post`;
    case 'new':
      return `New post by ${h}`;
    case 'protected':
      return `${h} is now protected (watch paused)`;
    case 'gone':
      return `${h} no longer exists (watch paused)`;
    case 'renamed':
      return `${h} changed its name`;
    default:
      return `${h}: ${e.type}`;
  }
}

/**
 * The public view of an event used by GET /api/watch, the trial view and the feeds.
 * `md` is appended to the Markdown link (`?feed=<token>` for trial users, who hold no Pro identity); null = no link.
 */
export function eventView(origin: string, e: FeedEvent, md: string | null = '') {
  return {
    id: e.id,
    type: e.type,
    postId: e.postId,
    detectedAt: e.detectedAt,
    title: eventTitle(e),
    text: e.payload.text ? excerpt(e.payload.text, 280) : '',
    createdAt: e.payload.createdAt || null,
    url: e.postId ? postUrl(e.handle, e.postId) : `https://x.com/${e.handle}`,
    wayback: e.payload.wayback || null,
    markdownUrl: e.postId && md !== null ? `${origin}/api/watch/event/${e.id}.md${md}` : null,
    media: e.payload.media || null,
  };
}

const xml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

export function rssFeed(origin: string, handle: string, feedUrl: string, events: FeedEvent[], md = ''): string {
  const items = events
    .map(e => {
      const v = eventView(origin, e, md);
      const desc = [v.text, v.wayback ? `Wayback copy: ${v.wayback}` : '', v.markdownUrl ? `Markdown: ${v.markdownUrl}` : ''].filter(Boolean).join('\n\n');
      return (
        '    <item>\n' +
        `      <title>${xml(v.title)}</title>\n` +
        `      <link>${xml(v.url)}</link>\n` +
        `      <guid isPermaLink="false">${xml(e.id)}</guid>\n` +
        `      <pubDate>${new Date(e.detectedAt).toUTCString()}</pubDate>\n` +
        `      <category>${xml(e.type)}</category>\n` +
        `      <description>${xml(desc)}</description>\n` +
        (v.wayback ? `      <enclosure url="${xml(v.wayback)}" type="text/html" length="0" />\n` : '') +
        '    </item>'
      );
    })
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '  <channel>\n' +
    `    <title>Xtracticle Watch: @${xml(handle)}</title>\n` +
    `    <link>https://x.com/${xml(handle)}</link>\n` +
    `    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml" />\n` +
    `    <description>Deleted and new posts of @${xml(handle)}, detected by Xtracticle Watch.</description>\n` +
    `    <lastBuildDate>${new Date(events[0]?.detectedAt || Date.now()).toUTCString()}</lastBuildDate>\n` +
    (items ? items + '\n' : '') +
    '  </channel>\n' +
    '</rss>\n'
  );
}

export function jsonFeed(origin: string, handle: string, feedUrl: string, events: FeedEvent[], md = ''): string {
  return JSON.stringify(
    {
      version: 'https://jsonfeed.org/version/1.1',
      title: `Xtracticle Watch: @${handle}`,
      home_page_url: `https://x.com/${handle}`,
      feed_url: feedUrl,
      description: `Deleted and new posts of @${handle}, detected by Xtracticle Watch.`,
      items: events.map(e => {
        const v = eventView(origin, e, md);
        return {
          id: e.id,
          url: v.url,
          title: v.title,
          content_text: v.text || v.title,
          date_published: e.detectedAt,
          tags: [e.type],
          ...(v.wayback ? { external_url: v.wayback } : {}),
          _xtracticle: { type: e.type, postId: e.postId, postedAt: v.createdAt, wayback: v.wayback, markdownUrl: v.markdownUrl, media: v.media },
        };
      }),
    },
    null,
    2,
  );
}

/** The stored post as Markdown, through the same converter as /api/markdown. */
export function eventMarkdown(e: FeedEvent): { markdown: string; filename: string } | null {
  if (!e.postId || !('text' in e.payload)) return null;
  const p = e.payload;
  const tweet: FxTweet = {
    id: e.postId,
    url: postUrl(e.handle, e.postId),
    text: p.text || '',
    created_at: p.createdAt || '',
    author: { name: p.authorName || e.handle, screen_name: e.handle },
    media: p.media
      ? {
          photos: p.media.photos?.map(ph => ({ url: ph.url, altText: ph.altText })),
          videos: p.media.videos?.map(v => ({ url: v.url, thumbnail_url: v.thumbnail_url })),
        }
      : undefined,
  };
  const doc = buildDoc([tweet], DEFAULT_LABELS, 'en-US');
  const when = e.detectedAt.slice(0, 16).replace('T', ' ') + ' UTC';
  const note =
    e.type === 'deleted'
      ? `> Deleted post, as last seen by Xtracticle Watch. Deletion detected ${when}.` + (p.wayback ? `  \n> Wayback Machine copy: ${p.wayback}` : '')
      : `> New post detected by Xtracticle Watch ${when}.`;
  return { markdown: doc.md.replace('\n---\n', `\n---\n\n${note}\n`), filename: `${fileBaseName(doc)}.md` };
}
