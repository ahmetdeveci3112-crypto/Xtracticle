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
 * Free requests get the newest 50 posts; Xtracticle Pro (cookie, see pro.ts) gets the whole list and
 * `GET /api/archive/:handle.csv`. The cache holds the full list under keys that are never served
 * directly, so each response is cut to the caller's tier when it is built.
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

/** twitter.com started redirecting to x.com on 17 May 2024. */
const X_MIGRATION_TS = '20240517';
const TWITTER_HOST_RE = /^(?:https?:\/\/)?(?:www\.|mobile\.)?twitter\.com/i;
const FRESH_SECONDS = 6 * 3600;
const PARTIAL_SECONDS = 30 * 60;
const STALE_SECONDS = 30 * 24 * 3600;
const FAIL_SECONDS = 60;
const CDX_TIMEOUT_MS = 45_000;
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
    // Since X moved to x.com, twitter.com captures only hold the "x/migrate" redirect.
    if (ts >= X_MIGRATION_TS && TWITTER_HOST_RE.test(original)) continue;
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
  // Keep the timestamp and URL of the same capture together, otherwise the
  // snapshot link points Wayback at a URL it never saved at that time.
  // Older captures usually hold the text; 2020+ captures are often empty JS shells.
  if (e.ts < cur.ts || (e.ts === cur.ts && e.rank < cur.rank)) {
    cur.ts = e.ts;
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
  /** The caller holds a valid Xtracticle Pro cookie (checked by the Worker). */
  pro = false,
): Promise<Response | null> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/archive\/([^/]*?)(\.csv)?\/?$/);
  if (!match) return null;
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
  const csv = !!match[2];

  let handle = '';
  try {
    handle = decodeURIComponent(match[1]).replace(/^@/, '');
  } catch { /* malformed escape → bad handle */ }
  if (!HANDLE_RE.test(handle)) return json({ error: 'bad_handle' }, 400);
  // The CSV is opened as a download link, which cannot carry the client header; the Pro cookie is its gate.
  if (csv) {
    if (!pro) return json({ error: 'pro_required' }, 402);
  } else if (request.headers.get('X-Xt-Client') !== 'web') {
    return json({ error: 'forbidden' }, 403);
  }
  if (env.ARCHIVE_DISABLED === '1') return json({ error: 'disabled' }, 503);

  // Free and Pro answers differ for the same URL: never let a browser or proxy reuse one for the other.
  const tier: Record<string, string> = pro ? { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } : { Vary: 'Cookie' };
  const reply = (s: ArchiveSnapshot, stale: boolean, cacheControl: string, extra: Record<string, string> = {}) => {
    const headers = { 'Cache-Control': cacheControl, ...extra, ...tier };
    if (csv) return csvResponse(handle, s, headers);
    return json(view(handle, s, stale, pro), 200, headers);
  };

  const h = handle.toLowerCase();
  const cache = edgeCache();
  const fullKey = `${url.origin}/api/archive-full/v2/${h}`;
  const staleKey = `${url.origin}/api/archive-stale/v2/${h}`;
  const failKey = `${url.origin}/api/archive-fail/v2/${h}`;

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
  const serveStale = async (sources: Record<string, SourceStatus>): Promise<Response | null> => {
    const stale: ArchiveSnapshot | null = await read(staleKey);
    if (!stale) return null;
    return reply({ ...stale, sources }, true, 'no-store', { 'X-Xt-Stale': '1' });
  };

  const fresh: ArchiveSnapshot | null = await read(fullKey);
  if (fresh) {
    const ttl = fresh.partial ? PARTIAL_SECONDS : FRESH_SECONDS;
    const age = Math.max(0, Math.floor((Date.now() - Date.parse(fresh.fetchedAt)) / 1000));
    return reply(fresh, false, `public, max-age=${Math.max(60, ttl - age)}`);
  }

  // A recent failure: don't ask CDX again for a minute.
  const failed: { sources: Record<string, SourceStatus> } | null = await read(failKey);
  if (failed) {
    return (await serveStale(failed.sources)) ?? json({ error: 'upstream', sources: failed.sources }, 502, { 'Cache-Control': 'no-store' });
  }

  /*
   * Fetch all hosts in parallel. CDX can take close to a minute, longer than
   * people wait, so the lookup runs under waitUntil: it still finishes and
   * fills the cache after the visitor gives up, and "Try again" is instant.
   */
  const refresh = async (): Promise<{ sources: Record<string, SourceStatus>; snapshot: ArchiveSnapshot | null }> => {
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
      if (cache) await cache.put(failKey, json({ sources }, 200, { 'Cache-Control': `public, max-age=${FAIL_SECONDS}` }));
      return { sources, snapshot: null };
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
      await Promise.all(puts);
    }
    return { sources, snapshot };
  };
  const work = refresh();
  if (waitUntil) waitUntil(work.catch(() => {}));
  const { sources, snapshot } = await work;
  if (!snapshot) {
    return (await serveStale(sources)) ?? json({ error: 'upstream', sources }, 502, { 'Cache-Control': 'no-store' });
  }
  const ttl = snapshot.partial ? PARTIAL_SECONDS : FRESH_SECONDS;
  return reply(snapshot, false, `public, max-age=${ttl}`);
}

/**
 * Posts from before the x.com move: ask Wayback for the twitter.com capture
 * closest to the post date. Wayback redirects to the nearest one it has, which
 * is usually the real page; later captures (and any capture we picked from a
 * truncated CDX listing) are often empty shells or "x/migrate" redirects.
 */
function snapshotLink(handle: string, p: { id: string; ts: string; url: string }, date: Date | null): string {
  const stamp = date ? date.toISOString().replace(/\D/g, '').slice(0, 14) : '';
  if (stamp && stamp < X_MIGRATION_TS) return waybackSnapshot(stamp, `https://twitter.com/${handle}/status/${p.id}`);
  return waybackSnapshot(p.ts, p.url);
}

function rows(handle: string, s: ArchiveSnapshot, all: boolean) {
  return s.posts.slice(0, all ? MAX_POSTS : FREE_POSTS).map(p => {
    const d = snowflakeDate(p.id);
    return {
      id: p.id,
      ...(d ? { date: d.toISOString() } : {}),
      ts: p.ts,
      url: p.url,
      snapshot: snapshotLink(handle, p, d),
      captures: p.captures,
    };
  });
}

/** The public response: the first 50 posts (all collected posts for Pro) with dates and snapshot links. */
function view(handle: string, s: ArchiveSnapshot, stale: boolean, all = false) {
  const posts = rows(handle, s, all);
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

/** One CSV field: quoted when needed, quotes doubled, formula-looking values neutralized. */
export function csvField(v: string): string {
  let out = v;
  if (/^[=+\-@\t\r]/.test(out)) out = `'${out}`;
  return /[",\r\n]/.test(out) ? `"${out.replace(/"/g, '""')}"` : out;
}

/** The Pro CSV: `date,snapshot_url,original_url`, UTF-8 with BOM, CRLF line ends. */
export function archiveCsv(handle: string, s: ArchiveSnapshot): string {
  const lines = ['date,snapshot_url,original_url'];
  for (const r of rows(handle, s, true)) lines.push([r.date || '', r.snapshot, r.url].map(csvField).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n';
}

function csvResponse(handle: string, s: ArchiveSnapshot, headers: Record<string, string>): Response {
  return new Response(archiveCsv(handle, s), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="xtracticle-archive-${handle}.csv"`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
