import { fetchThread, fetchTweet } from './fx';

/**
 * JSON API shared by the Worker and the Vite dev server.
 *   GET /api/tweet/:id   → single post
 *   GET /api/thread/:id  → { tweets, count, isThread } for the self-thread containing :id
 * Returns null for any other path so the caller can continue routing.
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};
const CACHE_SECONDS = 300;

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

/** Cloudflare's edge cache (`caches.default`) — undefined outside Workers. */
function edgeCache(): Cache | undefined {
  const c = (globalThis as any).caches;
  return c && c.default ? (c.default as Cache) : undefined;
}

export async function handleApi(request: Request, waitUntil?: (p: Promise<unknown>) => void): Promise<Response | null> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/(tweet|thread)\/([^/]+)\/?$/);
  if (!match) return null;
  if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);

  const [, kind, id] = match;
  if (!/^\d{1,25}$/.test(id)) return json({ error: 'Invalid post ID format.' }, 400);

  const cache = edgeCache();
  const cacheKey = new Request(`${url.origin}/api/${kind}/${id}`);
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  let response: Response;
  try {
    if (kind === 'tweet') {
      const tweet = await fetchTweet(id);
      response = tweet
        ? json(tweet, 200, { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` })
        : json({ error: 'Post not found. It may be deleted, age-restricted, or from a private account.' }, 404);
    } else {
      const tweets = await fetchThread(id);
      response = tweets.length
        ? json({ tweets, count: tweets.length, isThread: tweets.length > 1 }, 200, {
            'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
          })
        : json({ error: 'Post not found. It may be deleted, age-restricted, or from a private account.' }, 404);
    }
  } catch (err) {
    console.error(`Error handling /api/${kind}/${id}:`, err);
    return json({ error: 'Upstream service error. Please try again.' }, 502);
  }

  if (cache && response.status === 200) {
    const put = cache.put(cacheKey, response.clone());
    if (waitUntil) waitUntil(put);
    else await put;
  }
  return response;
}
