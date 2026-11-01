import { compareIdsDesc, snowflakeDate, waybackSnapshot } from './url';

/**
 * GET /api/archive/:handle — an account's posts archived on the Wayback Machine,
 * found through the Internet Archive's CDX API. Shared by the Worker and the Vite dev server.
 *
 * CDX is slow and flaky (503s after a few seconds, successes that take 20+ s), so the
 * three hosts are queried in parallel, each retried once while time allows, and every
 * result is cached at the edge: a fresh copy for 6 h, a "last known good" copy for 30 days
 * and a short negative entry so a failing upstream isn't hammered.
 *
 * Only the SPA may call it (X-Xt-Client: web), so it can't be used as a free CDX proxy.
 * Returns null for any other path so the caller can continue routing.
 */

export interface ArchiveEnv {
  /** Kill switch: "1" turns the endpoint off. */
  ARCHIVE_DISABLED?: string;
  /** Testing only: replaces https://web.archive.org for CDX requests. */
  CDX_BASE_URL?: string;
}

/** One archived post after normalizing. `rank` 0 = plain `/status/<id>` URL, 1 = a variant. */
export interface ArchiveEntry {
  id: string;
  ts: string;
  url: string;
  captures: number;
  rank: number;
}

type SourceStatus = 'ok' | 'timeout' | 'error';

/** What the edge cache holds: the full normalized list. */
interface ArchiveSnapshot {
  posts: { id: string; ts: string; url: string; captures: number }[];
  total: number;
  truncated: boolean;
  partial: boolean;
  sources: Record<string, SourceStatus>;
  resumeKeys: Record<string, string>;
  fetchedAt: string;
}

const HOSTS = ['twitter.com', 'x.com', 'mobile.twitter.com'] as const;
const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
const ID_RE = /\/status(?:es)?\/(\d{1,25})/;
/** Media and engagement sub-pages of a post: not the post itself. */
const SUBPAGE_RE = /^\/(?:photo\/|video\/|analytics|retweets|likes|quotes)/;
const PLAIN_RE = /^https?:\/\/[^/?#]+\/[A-Za-z0-9_]{1,15}\/status(?:es)?\/\d{1,25}$/;

const FRESH_SECONDS = 6 * 3600;
const PARTIAL_SECONDS = 30 * 60;
const STALE_SECONDS = 30 * 24 * 3600;
const FAIL_SECONDS = 5 * 60;
const CDX_TIMEOUT_MS = 25_000;
const RETRY_DELAY_MS = 2_000;
const RETRY_BEFORE_MS = 12_000;
const CDX_LIMIT = 500;
const MAX_POSTS = 1500;
const FREE_POSTS = 50;
const USER_AGENT = 'Xtracticle/3.0 (+https://xtracticle.com; archive-finder)';

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

/**
 * One host's CDX JSON (`[[header], ...rows, [], [resumeKey]]`) → one entry per post ID.
 * Single pass; skips photo/video/analytics sub-pages and rows without a post ID.
 */
export function normalizeCdxRows(
  rows: unknown,
  host: string,
): { entries: ArchiveEntry[]; truncated: boolean; resumeKey?: string } {
  void host; // IDs are global across hosts; the host only labels the source
  const byId = new Map<string, ArchiveEntry>();
  let truncated = false;
  let resumeKey: string | undefined;
  if (!Array.isArray(rows)) return { entries: [], truncated };
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    if (row.length === 0) {
      // `[]` separates the rows from the resume key: there are more results.
      const next = rows[i + 1];
      truncated = true;
      if (Array.isArray(next) && typeof next[0] === 'string') resumeKey = next[0];
      break;
    }
    const ts = row[0];
    const original = row[1];
    if (typeof ts !== 'string' || typeof original !== 'string') continue;
    const m = ID_RE.exec(original);
    if (!m) continue;
    if (SUBPAGE_RE.test(original.slice(m.index + m[0].length))) continue;
    add(byId, { id: m[1], ts, url: original, captures: 1, rank: PLAIN_RE.test(original) ? 0 : 1 });
  }
  return { entries: [...byId.values()], truncated, resumeKey };
}

function add(byId: Map<string, ArchiveEntry>, e: ArchiveEntry) {
  const cur = byId.get(e.id);
  if (!cur) {
    byId.set(e.id, e);
    return;
  }
  cur.captures += e.captures;
  // Older captures usually hold the text; 2020+ captures are often empty JS shells.
  if (e.ts < cur.ts) cur.ts = e.ts;
  if (e.rank < cur.rank) {
    cur.url = e.url;
    cur.rank = e.rank;
  }
}

/** Merges the hosts' entries by post ID and sorts newest first. */
export function mergeHosts(lists: ArchiveEntry[][]): ArchiveEntry[] {
  const byId = new Map<string, ArchiveEntry>();
  for (const list of lists) for (const e of list) add(byId, { ...e });
  return [...byId.values()].sort((a, b) => compareIdsDesc(a.id, b.id));
}

/* ─── CDX ─── */

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function queryHost(
  base: string,
  host: string,
  handle: string,
  started: number,
): Promise<{ status: SourceStatus; rows?: unknown }> {
  const url =
    `${base}/cdx/search/cdx?url=${encodeURIComponent(`${host}/${handle}/status/`)}` +
    `&matchType=prefix&output=json&fl=timestamp,original&filter=statuscode:200&collapse=urlkey&limit=${CDX_LIMIT}&showResumeKey=true`;
  let status: SourceStatus = 'error';
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt === 1) {
      if (Date.now() - started >= RETRY_BEFORE_MS) break;
      await sleep(RETRY_DELAY_MS);
    }
    let retryable = false;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(CDX_TIMEOUT_MS),
      });
      if (res.ok) {
        const text = await res.text();
        // CDX answers an empty match with an empty body or `[]`.
        return { status: 'ok', rows: text.trim() ? JSON.parse(text) : [] };
      }
      res.body?.cancel().catch(() => {});
      status = 'error';
      retryable = res.status >= 500 || res.status === 429;
    } catch (err) {
      const name = (err as Error)?.name;
      status = name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'error';
      // A body that isn't JSON won't get better on a retry.
      retryable = !(err instanceof SyntaxError);
    }
    if (!retryable) break;
  }
  return { status };
}

/* ─── Handler ─── */

export async function handleArchive(
  request: Request,
  waitUntil?: (p: Promise<unknown>) => void,
  env: ArchiveEnv = {},
): Promise<Response | null> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/archive\/([^/]*)\/?$/);
  if (!match) return null;
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);

  let handle = '';
  try {
    handle = decodeURIComponent(match[1]).replace(/^@/, '');
  } catch { /* malformed escape → bad handle */ }
  if (!HANDLE_RE.test(handle)) return json({ error: 'bad_handle' }, 400);
  if (request.headers.get('X-Xt-Client') !== 'web') return json({ error: 'forbidden' }, 403);
  if (env.ARCHIVE_DISABLED === '1') return json({ error: 'disabled' }, 503);

  const h = handle.toLowerCase();
  const cache = edgeCache();
  const fullKey = `${url.origin}/api/archive-full/${h}`;
  const staleKey = `${url.origin}/api/archive-stale/${h}`;
  const failKey = `${url.origin}/api/archive-fail/${h}`;

  const read = async (key: string): Promise<any | null> => {
    if (!cache) return null;
    const hit = await cache.match(key);
    if (!hit) return null;
    try {
      return await hit.json();
    } catch {
      return null;
    }
  };
  const put = async (puts: Promise<unknown>[]) => {
    const all = Promise.all(puts).catch(() => {});
    if (waitUntil) waitUntil(all);
    else await all;
  };
  const serveStale = async (sources: Record<string, SourceStatus>): Promise<Response | null> => {
    const stale: ArchiveSnapshot | null = await read(staleKey);
    if (!stale) return null;
    return json(view(handle, { ...stale, sources }, true), 200, { 'Cache-Control': 'no-store', 'X-Xt-Stale': '1' });
  };

  const fresh: ArchiveSnapshot | null = await read(fullKey);
  if (fresh) {
    const ttl = fresh.partial ? PARTIAL_SECONDS : FRESH_SECONDS;
    const age = Math.max(0, Math.floor((Date.now() - Date.parse(fresh.fetchedAt)) / 1000));
    return json(view(handle, fresh, false), 200, { 'Cache-Control': `public, max-age=${Math.max(60, ttl - age)}` });
  }

  // A recent failure: don't ask CDX again for 5 minutes.
  const failed: { sources: Record<string, SourceStatus> } | null = await read(failKey);
  if (failed) {
    return (await serveStale(failed.sources)) ?? json({ error: 'upstream', sources: failed.sources }, 502, { 'Cache-Control': 'no-store' });
  }

  /* Fetch all hosts in parallel. */
  const started = Date.now();
  const base = (env.CDX_BASE_URL || 'https://web.archive.org').replace(/\/+$/, '');
  const settled = await Promise.allSettled(HOSTS.map(host => queryHost(base, host, handle, started)));

  const sources: Record<string, SourceStatus> = {};
  const lists: ArchiveEntry[][] = [];
  const resumeKeys: Record<string, string> = {};
  let truncated = false;
  settled.forEach((r, i) => {
    const host = HOSTS[i];
    const value = r.status === 'fulfilled' ? r.value : { status: 'error' as SourceStatus };
    sources[host] = value.status;
    if (value.status !== 'ok') return;
    const norm = normalizeCdxRows(value.rows, host);
    lists.push(norm.entries);
    if (norm.truncated) truncated = true;
    if (norm.resumeKey) resumeKeys[host] = norm.resumeKey;
  });
  const okCount = lists.length;
  const ms = Date.now() - started;

  if (okCount === 0) {
    console.log(JSON.stringify({ archive: 1, ok: false, total: 0, ms, sources }));
    const stale = await serveStale(sources);
    await put(
      cache
        ? [cache.put(failKey, json({ sources }, 200, { 'Cache-Control': `public, max-age=${FAIL_SECONDS}` }))]
        : [],
    );
    return stale ?? json({ error: 'upstream', sources }, 502, { 'Cache-Control': 'no-store' });
  }

  const merged = mergeHosts(lists);
  const partial = okCount < HOSTS.length;
  const snapshot: ArchiveSnapshot = {
    posts: merged.slice(0, MAX_POSTS).map(e => ({ id: e.id, ts: e.ts, url: e.url, captures: e.captures })),
    total: merged.length,
    truncated: truncated || merged.length > MAX_POSTS,
    partial,
    sources,
    resumeKeys,
    fetchedAt: new Date().toISOString(),
  };
  console.log(JSON.stringify({ archive: 1, ok: true, total: snapshot.total, ms, sources }));

  const ttl = partial ? PARTIAL_SECONDS : FRESH_SECONDS;
  if (cache) {
    const body = JSON.stringify(snapshot);
    const puts: Promise<unknown>[] = [
      cache.put(fullKey, new Response(body, { headers: { ...JSON_HEADERS, 'Cache-Control': `public, max-age=${ttl}` } })),
    ];
    // A partial list only replaces the 30-day copy when there is none yet.
    const keepStale = partial && (await cache.match(staleKey));
    if (!keepStale) {
      puts.push(cache.put(staleKey, new Response(body, { headers: { ...JSON_HEADERS, 'Cache-Control': `public, max-age=${STALE_SECONDS}` } })));
    }
    await put(puts);
  }
  return json(view(handle, snapshot, false), 200, { 'Cache-Control': `public, max-age=${ttl}` });
}

/** The public response: the first 50 posts with dates and snapshot links. */
function view(handle: string, s: ArchiveSnapshot, stale: boolean) {
  const posts = s.posts.slice(0, FREE_POSTS).map(p => {
    const d = snowflakeDate(p.id);
    return {
      id: p.id,
      ...(d ? { date: d.toISOString() } : {}),
      ts: p.ts,
      url: p.url,
      snapshot: waybackSnapshot(p.ts, p.url),
      captures: p.captures,
    };
  });
  return {
    handle,
    posts,
    total: s.total,
    shown: posts.length,
    truncated: s.truncated,
    partial: s.partial,
    stale,
    sources: s.sources,
    fetchedAt: s.fetchedAt,
  };
}
