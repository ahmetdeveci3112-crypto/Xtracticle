import { handleApi } from './api';
import { buildDoc, frontMatter, type Labels, type XDoc } from './convert';
import type { FxTweet } from './fx';

/**
 * Server-side document loader shared by the Markdown API (/api/markdown/:id)
 * and the MCP server (/mcp). Goes through handleApi, so it reuses the same
 * edge cache and the week-long stale copy as the web app.
 */

export const DEFAULT_LABELS: Labels = {
  author: 'Author:',
  date: 'Date:',
  source: 'Source:',
  image: 'Image',
  video: 'Video',
  embeddedPost: 'Embedded post',
  quoting: 'Quoting',
};

export type LoadResult = { doc: XDoc; stale: boolean } | { error: 'not_found' | 'upstream' };

/**
 * Converted documents are kept for an hour (the web app's raw JSON only for five minutes):
 * agents tend to re-read the same post, and every hit spares FxTwitter a request and the
 * Worker a conversion — both matter on the free Workers plan.
 */
const DOC_CACHE_SECONDS = 3600;

export async function loadDoc(
  origin: string,
  id: string,
  includeThread: boolean,
  waitUntil?: (p: Promise<unknown>) => void,
): Promise<LoadResult> {
  const cache = (globalThis as any).caches?.default as Cache | undefined;
  const docKey = new Request(`${origin}/api/doc/${includeThread ? 'thread' : 'tweet'}/${id}`);
  if (cache) {
    const hit = await cache.match(docKey);
    if (hit) return { doc: (await hit.json()) as XDoc, stale: false };
  }

  const res = await handleApi(new Request(`${origin}/api/${includeThread ? 'thread' : 'tweet'}/${id}`), waitUntil);
  if (!res || res.status === 404) return { error: 'not_found' };
  if (!res.ok) return { error: 'upstream' };
  const data = (await res.json()) as any;
  const tweets: FxTweet[] = includeThread ? data?.tweets || [] : data ? [data] : [];
  if (!tweets.length) return { error: 'not_found' };
  const doc = buildDoc(tweets, DEFAULT_LABELS, 'en-US');
  const stale = res.headers.get('X-Xt-Stale') === '1';
  if (cache && !stale) {
    const put = cache.put(
      docKey,
      new Response(JSON.stringify(doc), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${DOC_CACHE_SECONDS}` },
      }),
    );
    if (waitUntil) waitUntil(put);
    else await put;
  }
  return { doc, stale };
}

export const markdownUrl = (id: string) => `https://xtracticle.com/api/markdown/${id}`;

export interface RenderOptions {
  format: 'markdown' | 'text';
  frontMatter: boolean;
  maxChars?: number;
  offset?: number;
}

/** The document as one string, optionally cut to a window (MCP pagination). */
export function renderDoc(doc: XDoc, o: RenderOptions) {
  const full = (o.frontMatter ? frontMatter(doc) : '') + (o.format === 'text' ? doc.txt : doc.md);
  const totalChars = full.length;
  const offset = Math.min(Math.max(0, o.offset ?? 0), totalChars);
  const end = o.maxChars ? Math.min(totalChars, offset + o.maxChars) : totalChars;
  let text = full.slice(offset, end);
  const truncated = offset > 0 || end < totalChars;
  if (end < totalChars) {
    text += `\n\n> [Truncated: characters ${offset}–${end} of ${totalChars}. Call again with offset=${end}, or GET ${markdownUrl(doc.id)} for the full document.]`;
  }
  return { text, totalChars, offset, end, truncated };
}

export const ERROR_TEXT = {
  invalid: 'That is not an X (Twitter) post link or post ID. Use a link like https://x.com/user/status/123… — for an X Article, use the post link, not the x.com/i/article/… reader link.',
  not_found: 'Post not found. It may be deleted, age-restricted, or from a private account — only public posts can be read.',
  upstream: 'The upstream service is temporarily unavailable. Please try again in a minute.',
} as const;
