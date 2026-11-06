import { fxBase, type FxEnv } from './fx';
import { compareIdsDesc } from './url';

/**
 * GET /api/profile/:handle/posts — an account's latest own posts (up to 20), so the
 * batch mode can download them as one ZIP. Shared by the Worker and the Vite dev server.
 *
 * FxTwitter's profile timeline mixes in reposts of other people's posts and lists each
 * self-reply of a thread separately, so up to three pages are read and filtered down to
 * the account's own posts, with thread replies folded into their first post (the batch
 * export unrolls the thread from there). Results are cached at the edge for 15 minutes.
 *
 * Only the SPA may call it (X-Xt-Client: web), so it can't be used as a free FxTwitter proxy.
 * Returns null for any other path so the caller can continue routing.
 */

export interface ProfileEnv extends FxEnv {
  /** Kill switch: "1" turns the endpoint off. */
  PROFILE_DISABLED?: string;
}

export interface ProfilePost {
  id: string;
  url: string;
  date: string;
  text: string;
  thread: boolean;
}

export interface ProfileResult {
  handle: string;
  posts: ProfilePost[];
  count: number;
  more: boolean;
  notFound?: boolean;
}

/** The fields we read from one FxTwitter v2 status. */
export interface RawStatus {
  id?: unknown;
  text?: unknown;
  created_at?: unknown;
  created_timestamp?: unknown;
  author?: { screen_name?: unknown; name?: unknown } | null;
  replying_to?: { screen_name?: unknown; status?: unknown } | null;
  reposted_by?: unknown;
  media?: { photos?: unknown; videos?: unknown } | null;
}

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
const ID_RE = /^\d{1,25}$/;
const MAX_POSTS = 20;
const MAX_PAGES = 3;
const PAGE_SIZE = 20;
const PAGE_TIMEOUT_MS = 10_000;
/**
 * FxTwitter's profile timeline often answers 404 for accounts that exist (about 3 in 10
 * calls when tested), so a 404 or error is retried: the first page up to 3 times, later
 * pages twice, while the whole lookup is under RETRY_BEFORE_MS.
 */
const FIRST_PAGE_ATTEMPTS = 3;
const LATER_PAGE_ATTEMPTS = 2;
const RETRY_BEFORE_MS = 15_000;
const OK_SECONDS = 15 * 60;
const NOT_FOUND_SECONDS = 2 * 60;
const TEXT_CHARS = 120;
const USER_AGENT = 'Xtracticle/3.0 (+https://xtracticle.com; profile-posts)';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

/** Cloudflare's edge cache (`caches.default`) — undefined outside Workers. */
function edgeCache(): Cache | undefined {
  const c = (globalThis as any).caches;
  return c && c.default ? (c.default as Cache) : undefined;
}

/* ─── Pure helpers (exported for tests) ─── */

/** An own post kept from the timeline, before it is turned into the public shape. */
export interface OwnPost {
  id: string;
  /** Parent post ID when this is a reply to the account itself. */
  parent: string | null;
  raw: RawStatus;
}

/**
 * The account's own posts from one timeline page: no reposts, no posts by others.
 * `handleLower` must already be lower-case.
 */
export function ownPosts(results: unknown, handleLower: string): OwnPost[] {
  const out: OwnPost[] = [];
  if (!Array.isArray(results)) return out;
  for (const r of results as RawStatus[]) {
    if (!r || typeof r !== 'object' || r.reposted_by) continue;
    const id = typeof r.id === 'string' ? r.id : typeof r.id === 'number' ? String(r.id) : '';
    if (!ID_RE.test(id)) continue;
    const author = r.author?.screen_name;
    if (typeof author !== 'string' || author.toLowerCase() !== handleLower) continue;
    const rt = r.replying_to;
    // Replies to other accounts are conversation, not the account's own posts.
    if (rt && typeof rt.screen_name === 'string' && rt.screen_name.toLowerCase() !== handleLower) continue;
    const parent =
      rt && typeof rt.status === 'string' && typeof rt.screen_name === 'string' && rt.screen_name.toLowerCase() === handleLower
        ? rt.status
        : null;
    out.push({ id, parent, raw: r });
  }
  return out;
}

/**
 * Folds self-replies into their thread: a reply whose parent is also in the list is
 * dropped and its first post marked as a thread. Returns the remaining posts newest first.
 */
export function foldThreads(posts: OwnPost[]): { post: OwnPost; thread: boolean }[] {
  const byId = new Map<string, OwnPost>();
  for (const p of posts) if (!byId.has(p.id)) byId.set(p.id, p);
  const threads = new Set<string>();
  const kept: OwnPost[] = [];
  for (const p of byId.values()) {
    if (p.parent && byId.has(p.parent)) {
      // Walk up to the first post of the chain we have (bounded against cycles).
      let root = byId.get(p.parent)!;
      for (let i = 0; i < 50 && root.parent && byId.has(root.parent); i++) root = byId.get(root.parent)!;
      threads.add(root.id);
    } else {
      kept.push(p);
    }
  }
  kept.sort((a, b) => compareIdsDesc(a.id, b.id));
  return kept.map(post => ({ post, thread: threads.has(post.id) }));
}

export function isoDate(r: RawStatus): string {
  if (typeof r.created_timestamp === 'number' && r.created_timestamp > 0) return new Date(r.created_timestamp * 1000).toISOString();
  const parsed = typeof r.created_at === 'string' ? Date.parse(r.created_at) : NaN;
  return Number.isNaN(parsed) ? '' : new Date(parsed).toISOString();
}

/** First 120 characters on one line, without cutting an emoji in half. */
function snippet(text: unknown): string {
  if (typeof text !== 'string') return '';
  const line = text.replace(/\s+/g, ' ').trim();
  if (line.length <= TEXT_CHARS) return line;
  let cut = line.slice(0, TEXT_CHARS);
  const last = cut.charCodeAt(cut.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) cut = cut.slice(0, -1);
  return cut.trimEnd() + '…';
}

export function toPublic(handle: string, item: { post: OwnPost; thread: boolean }): ProfilePost {
  const { post, thread } = item;
  return {
    id: post.id,
    url: `https://x.com/${handle}/status/${post.id}`,
    date: isoDate(post.raw),
    text: snippet(post.raw.text),
    thread,
  };
}

/* ─── FxTwitter ─── */

type Page = { status: 'ok'; results: unknown; cursor: string | null } | { status: 'not_found' } | { status: 'error' };

async function fetchPage(base: string, handle: string, cursor: string | null): Promise<Page> {
  const url =
    `${base}/2/profile/${encodeURIComponent(handle)}/statuses?count=${PAGE_SIZE}` +
    (cursor ? `&cursor=${encodeURIComponent(cursor)}` : '');
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
    });
    if (res.status === 404) {
      res.body?.cancel().catch(() => {});
      return { status: 'not_found' };
    }
    if (!res.ok) {
      res.body?.cancel().catch(() => {});
      return { status: 'error' };
    }
    const data: any = await res.json();
    if (data?.code === 404) return { status: 'not_found' };
    if (data?.code !== 200 || !Array.isArray(data.results)) return { status: 'error' };
    const bottom = data.cursor?.bottom;
    return { status: 'ok', results: data.results, cursor: typeof bottom === 'string' && bottom ? bottom : null };
  } catch {
    return { status: 'error' };
  }
}

export interface TimelineOptions {
  /** Stop once this many own posts are collected (after folding, for the profile endpoint; raw for Watch). */
  maxPosts: number;
  maxPages: number;
  /** FxTwitter base URL (see fxBase). */
  base: string;
  /** Count folded threads toward maxPosts (the profile endpoint) instead of raw own posts. */
  foldForCount?: boolean;
}

export interface Timeline {
  /** 'ok' also covers a list cut short by a failing later page (`failed` is then true). */
  status: 'ok' | 'not_found' | 'error';
  own: OwnPost[];
  /** A later page failed: the list may be shorter than the account's timeline. */
  failed: boolean;
  /** The next page's cursor when the timeline continues. */
  cursor: string | null;
  pages: number;
}

/**
 * The account's latest own posts from up to `maxPages` timeline pages, with the retry policy above.
 * Shared by /api/profile/:handle/posts and the Watch poller. Never throws.
 */
export async function fetchOwnTimeline(handle: string, o: TimelineOptions): Promise<Timeline> {
  const started = Date.now();
  const h = handle.toLowerCase();
  const own: OwnPost[] = [];
  let cursor: string | null = null;
  let pages = 0;
  let failed = false;
  let status: Timeline['status'] = 'ok';

  while (pages < o.maxPages) {
    const attempts = pages === 0 ? FIRST_PAGE_ATTEMPTS : LATER_PAGE_ATTEMPTS;
    let page = await fetchPage(o.base, handle, cursor);
    for (let a = 1; a < attempts && page.status !== 'ok' && Date.now() - started < RETRY_BEFORE_MS; a++) {
      page = await fetchPage(o.base, handle, cursor);
    }
    pages++;
    if (page.status !== 'ok') {
      // A missing account answers 404 on the first page; a later failure keeps what we have.
      if (pages === 1) {
        if (page.status === 'not_found') status = 'not_found';
        else {
          status = 'error';
          failed = true;
        }
      } else {
        // The timeline doesn't end with a 404, so a later one means the list may be cut short.
        failed = true;
      }
      cursor = null;
      break;
    }
    for (const p of ownPosts(page.results, h)) own.push(p);
    cursor = page.cursor;
    const count = o.foldForCount === false ? own.length : foldThreads(own).length;
    if (count >= o.maxPosts || !cursor) break;
  }
  return { status, own, failed, cursor, pages };
}

/* ─── Handler ─── */

export async function handleProfile(
  request: Request,
  waitUntil?: (p: Promise<unknown>) => void,
  env: ProfileEnv = {},
): Promise<Response | null> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/profile\/([^/]*)\/posts\/?$/);
  if (!match) return null;
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

  let handle = '';
  try {
    handle = decodeURIComponent(match[1]).replace(/^@/, '');
  } catch { /* malformed escape → bad handle */ }
  if (!HANDLE_RE.test(handle)) return json({ error: 'bad_handle' }, 400);
  if (request.headers.get('X-Xt-Client') !== 'web') return json({ error: 'forbidden' }, 403);
  if (env.PROFILE_DISABLED === '1') return json({ error: 'disabled' }, 503);

  const h = handle.toLowerCase();
  const cache = edgeCache();
  const key = `${url.origin}/api/profile-posts/v1/${h}`;
  if (cache) {
    const hit = await cache.match(key);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set('X-Xt-Cache', 'hit');
      return new Response(hit.body, { status: 200, headers });
    }
  }

  const started = Date.now();
  const timeline = await fetchOwnTimeline(handle, { maxPosts: MAX_POSTS, maxPages: MAX_PAGES, base: fxBase(env) });
  const { pages, failed, cursor } = timeline;
  const notFound = timeline.status === 'not_found';
  const folded = foldThreads(timeline.own);
  const ms = Date.now() - started;

  if (failed && !folded.length) {
    console.log(JSON.stringify({ profile: 1, ok: false, count: 0, pages, ms }));
    return json({ error: 'upstream' }, 502, { 'Cache-Control': 'no-store' });
  }

  let body: ProfileResult;
  let ttl: number;
  if (notFound) {
    body = { handle, posts: [], count: 0, more: false, notFound: true };
    ttl = NOT_FOUND_SECONDS;
  } else {
    // The account's own spelling of its name, for the post links.
    const canonical = (folded[0]?.post.raw.author?.screen_name as string | undefined) || handle;
    const posts = folded.slice(0, MAX_POSTS).map(item => toPublic(canonical, item));
    body = { handle: canonical, posts, count: posts.length, more: folded.length > MAX_POSTS || !!cursor || failed };
    // A list cut short by a failing later page is only kept briefly.
    ttl = failed ? NOT_FOUND_SECONDS : OK_SECONDS;
  }
  console.log(JSON.stringify({ profile: 1, ok: true, count: body.count, pages, ms }));

  const text = JSON.stringify(body);
  if (cache) {
    const put = cache.put(key, new Response(text, { headers: { ...JSON_HEADERS, 'Cache-Control': `public, max-age=${ttl}` } }));
    if (waitUntil) waitUntil(put.catch(() => {}));
    else await put.catch(() => {});
  }
  return new Response(text, { status: 200, headers: { ...JSON_HEADERS, 'Cache-Control': `public, max-age=${ttl}` } });
}
