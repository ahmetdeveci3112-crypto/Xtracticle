import { handleApi } from './shared/api';
import type { FxTweet } from './shared/fx';
import { titleFromText } from './shared/text';

export interface Env {
  ASSETS: Fetcher;
  /** 40 requests / 10 s per client IP on /api/* (wrangler.json `ratelimits`). */
  API_LIMITER?: RateLimit;
}

/**
 * Cloudflare Worker for Xtracticle. Runs before static assets only for the
 * paths listed in wrangler.json `assets.run_worker_first`:
 *   /api/*                     → JSON API (src/shared/api.ts)
 *   /{user}/status/{id}        → app shell with per-post meta tags + preloaded data
 * Everything else is served directly from dist/ (with 404.html for unknown paths).
 */

const STATUS_PATH = /^\/(?:([A-Za-z0-9_]{1,15})|i(?:\/web)?)\/status(?:es)?\/(\d{1,25})\/?$/;
const SSR_TIMEOUT_MS = 4500;
const DEFAULT_IMAGE = 'https://xtracticle.com/og-image.png';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      if (env.API_LIMITER) {
        const ip = request.headers.get('cf-connecting-ip') || 'unknown';
        const { success } = await env.API_LIMITER.limit({ key: ip });
        if (!success) {
          return new Response(JSON.stringify({ error: 'Too many requests. Please wait a few seconds and try again.' }), {
            status: 429,
            headers: { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': '10' },
          });
        }
      }
      const res = await handleApi(request, p => ctx.waitUntil(p));
      return (
        res ??
        new Response(JSON.stringify({ error: 'Not found.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      );
    }

    const match = url.pathname.match(STATUS_PATH);
    if (match && (request.method === 'GET' || request.method === 'HEAD')) {
      return renderStatusPage(request, env, ctx, match[2]);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

/* ─── /{user}/status/{id} ─── */

async function loadThread(origin: string, id: string, ctx: ExecutionContext): Promise<FxTweet[] | null> {
  const apiResponse = handleApi(new Request(`${origin}/api/thread/${id}`), p => ctx.waitUntil(p));
  const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), SSR_TIMEOUT_MS));
  const res = await Promise.race([apiResponse, timeout]);
  if (!res || res.status !== 200) return null;
  const data: any = await res.json();
  return Array.isArray(data?.tweets) && data.tweets.length ? data.tweets : null;
}

function describe(tweets: FxTweet[]) {
  const first = tweets[0];
  const handle = first.author.screen_name;
  const clean = (s: string) => s.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  const article = first.article;
  const firstLine = titleFromText(first.text);

  let title: string;
  let description: string;
  if (article?.title) {
    title = article.title;
    description = clean(article.preview_text || '') || `An X article by ${first.author.name} (@${handle}).`;
  } else if (tweets.length > 1) {
    title = firstLine ? `${firstLine} — thread by @${handle}` : `Thread by @${handle}`;
    description = clean(first.text) || `A ${tweets.length}-post thread by @${handle}.`;
  } else {
    title = firstLine ? `${firstLine} — @${handle}` : `Post by @${handle}`;
    description = clean(first.text) || `A post by ${first.author.name} (@${handle}).`;
  }
  if (description.length > 200) description = description.slice(0, 197).trimEnd() + '…';
  else if (!/[.!?…"')\]]$/u.test(description)) description += '…';

  const image =
    article?.cover_media?.media_info?.original_img_url ||
    first.media?.photos?.[0]?.url ||
    first.media?.videos?.[0]?.thumbnail_url ||
    null;

  const kind = article ? 'Article' : tweets.length > 1 ? `Thread · ${tweets.length} posts` : 'Post';
  return { title, description, image, kind, author: `${first.author.name} (@${handle})` };
}

async function renderStatusPage(request: Request, env: Env, ctx: ExecutionContext, id: string): Promise<Response> {
  const url = new URL(request.url);
  const [shell, tweets] = await Promise.all([
    env.ASSETS.fetch(new Request(`${url.origin}/`)),
    loadThread(url.origin, id, ctx).catch(() => null),
  ]);

  const pageUrl = `${url.origin}${url.pathname}`;
  const meta = tweets ? describe(tweets) : null;
  const title = meta ? `${meta.title} | Download as PDF, Markdown — Xtracticle` : 'Download X post | Xtracticle';
  const description = meta
    ? `${meta.kind} by ${meta.author}: ${meta.description} — Download as PDF, Markdown, EPUB or text.`
    : 'Download this X post as PDF, Markdown, EPUB or text with Xtracticle.';
  const image = meta?.image || DEFAULT_IMAGE;
  const preload = tweets
    ? `<script>window.__XT_PRELOAD__=${JSON.stringify({ id, tweets }).replace(/</g, '\\u003c')}</script>`
    : '';

  const setContent = (value: string) => ({
    element(el: Element) {
      el.setAttribute('content', value);
    },
  });
  const remove = { element(el: Element) { el.remove(); } };

  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', setContent(description))
    .on('meta[name="robots"]', setContent('noindex, follow'))
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', pageUrl); } })
    .on('link[rel="alternate"][hreflang]', remove)
    .on('script[type="application/ld+json"]', remove)
    .on('meta[property="og:type"]', setContent('article'))
    .on('meta[property="og:url"]', setContent(pageUrl))
    .on('meta[property="og:title"]', setContent(meta?.title || title))
    .on('meta[property="og:description"]', setContent(description))
    .on('meta[property="og:image"]', setContent(image))
    .on('meta[property="og:image:width"]', image === DEFAULT_IMAGE ? {} : remove)
    .on('meta[property="og:image:height"]', image === DEFAULT_IMAGE ? {} : remove)
    .on('meta[property="og:image:alt"]', setContent(meta?.title || 'Xtracticle'))
    .on('meta[name="twitter:title"]', setContent(meta?.title || title))
    .on('meta[name="twitter:description"]', setContent(description))
    .on('meta[name="twitter:image"]', setContent(image))
    .on('head', { element(el) { el.append(preload, { html: true }); } })
    .transform(shell);

  const headers = new Headers(rewritten.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-cache');
  headers.set('X-Robots-Tag', 'noindex, follow');
  headers.set('Link', '</llms.txt>; rel="llms-txt"');
  return new Response(request.method === 'HEAD' ? null : rewritten.body, { status: tweets ? 200 : 404, headers });
}
