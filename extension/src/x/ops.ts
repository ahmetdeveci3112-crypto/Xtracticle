/**
 * The X GraphQL operations the extension listens to (docs/chrome-extension-plan.md, B4), and the
 * wire format between hook.js (MAIN world) and content.js (ISOLATED world).
 *
 * Matching is by operation NAME (`/i/api/graphql/<queryId>/<Name>`), never by query id, so X rotating
 * its query ids does not break anything. When X renames an operation, public/ext/config.json lists the
 * new name and the service worker merges it in (bg/remote.ts, at most every 6 hours).
 *
 * Imported by hook.js too: keep this file free of chrome.* and DOM-only APIs.
 */

export const OP_CATEGORIES = ['bookmarks', 'detail', 'bookmarkAdd', 'bookmarkRemove', 'user'] as const;
export type OpCategory = (typeof OP_CATEGORIES)[number];
export type OpMap = Record<OpCategory, string[]>;

/** Built-in names; the same set public/ext/config.json carries on 15 Nov 2026. */
export const DEFAULT_OPS: OpMap = {
  bookmarks: ['Bookmarks', 'BookmarkFolderTimeline', 'BookmarkSearchTimeline'],
  detail: ['TweetDetail', 'TweetResultByRestId'],
  bookmarkAdd: ['CreateBookmark'],
  bookmarkRemove: ['DeleteBookmark'],
  user: ['UserByScreenName'],
};

export interface Flags {
  /** Read GraphQL responses and archive bookmarks. */
  capture: boolean;
  /** Bookmark-removal detection (phase 2). */
  detect: boolean;
  /** The Save menu on posts (next phase). */
  saveMenu: boolean;
}

export const DEFAULT_FLAGS: Flags = { capture: true, detect: false, saveMenu: true };
const FLAG_KEYS = Object.keys(DEFAULT_FLAGS) as (keyof Flags)[];

/** Categories whose request body (the mutation variables) is forwarded too; for all others only the response. */
export const REQUEST_BODY_CATEGORIES: readonly OpCategory[] = ['bookmarkAdd', 'bookmarkRemove'];

/**
 * Categories whose throttling answers (429, ≥ 500) are reported too, as a status-only message with an empty
 * body: the bookmarks panel stops scrolling when X slows down (plan B4).
 */
export const STATUS_CATEGORIES: readonly OpCategory[] = ['bookmarks'];
export const isThrottleStatus = (s: unknown): s is number => typeof s === 'number' && Number.isInteger(s) && (s === 429 || (s >= 500 && s <= 599));

/** How often the service worker re-reads public/ext/config.json. */
export const CONFIG_TTL_MS = 6 * 3600 * 1000;

const OP_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const MAX_NAMES_PER_CATEGORY = 20;
const GRAPHQL_PATH_RE = /^\/i\/api\/graphql\/[A-Za-z0-9_-]{1,64}\/([A-Za-z][A-Za-z0-9_]{0,63})\/?$/;
const X_HOSTS = new Set(['x.com', 'twitter.com', 'mobile.x.com', 'mobile.twitter.com']);

export const isOpName = (v: unknown): v is string => typeof v === 'string' && OP_NAME_RE.test(v);

/** The operation name of an X GraphQL URL (absolute or relative to `base`), or null. */
export function opFromUrl(url: unknown, base?: string): string | null {
  if (typeof url !== 'string' || !url || url.length > 8192) return null;
  try {
    const u = new URL(url, base);
    if (u.protocol !== 'https:' || !X_HOSTS.has(u.hostname)) return null;
    const m = u.pathname.match(GRAPHQL_PATH_RE);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** Union of two op maps; invalid names are dropped, each category keeps at most 20 names. */
export function mergeOps(base: OpMap, extra: unknown): OpMap {
  const out = {} as OpMap;
  const x = extra && typeof extra === 'object' && !Array.isArray(extra) ? (extra as Record<string, unknown>) : {};
  for (const cat of OP_CATEGORIES) {
    const names = new Set(base[cat].filter(isOpName));
    const more = x[cat];
    if (Array.isArray(more)) for (const n of more) if (isOpName(n)) names.add(n);
    out[cat] = [...names].slice(0, MAX_NAMES_PER_CATEGORY);
  }
  return out;
}

/** Which category an operation name belongs to (first match in OP_CATEGORIES order), or null. */
export function categoryOf(ops: OpMap, name: string): OpCategory | null {
  for (const cat of OP_CATEGORIES) if (ops[cat].includes(name)) return cat;
  return null;
}

/* ─── Remote config (public/ext/config.json) ─── */

export interface RemoteConfig {
  schema: 1;
  minVersion: string | null;
  ops: unknown;
  flags: Partial<Flags>;
}

/** What content.js reads from chrome.storage.local.xtConfig. */
export interface XtConfig {
  ops: OpMap;
  flags: Flags;
  minVersion: string | null;
  /** This extension is older than `minVersion`: every flag is off until it updates. */
  outdated: boolean;
  /** When config.json was last read successfully (ms), null = built-in defaults only. */
  fetchedAt: number | null;
}

const VERSION_RE = /^\d{1,4}(\.\d{1,5}){0,3}$/;

/** -1 / 0 / 1 for dotted numeric versions ("0.1.0" < "3.0.0"); missing parts count as 0. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

/** A validated config.json, or null for anything with another schema or shape. */
export function parseRemoteConfig(json: unknown): RemoteConfig | null {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return null;
  const j = json as Record<string, unknown>;
  if (j.schema !== 1) return null;
  const minVersion = typeof j.minVersion === 'string' && VERSION_RE.test(j.minVersion) ? j.minVersion : null;
  const flags: Partial<Flags> = {};
  if (j.flags && typeof j.flags === 'object' && !Array.isArray(j.flags)) {
    const f = j.flags as Record<string, unknown>;
    for (const k of FLAG_KEYS) if (typeof f[k] === 'boolean') flags[k] = f[k] as boolean;
  }
  return { schema: 1, minVersion, ops: j.ops, flags };
}

/** Defaults + remote names and flags. A remote minVersion above `version` switches every flag off. */
export function effectiveConfig(remote: RemoteConfig | null, version: string, fetchedAt: number | null): XtConfig {
  const ops = mergeOps(DEFAULT_OPS, remote?.ops);
  const minVersion = remote?.minVersion ?? null;
  const outdated = !!minVersion && VERSION_RE.test(version) && compareVersions(version, minVersion) < 0;
  const flags: Flags = { ...DEFAULT_FLAGS, ...(remote?.flags || {}) };
  if (outdated) for (const k of FLAG_KEYS) flags[k] = false;
  return { ops, flags, minVersion, outdated, fetchedAt };
}

/** A stored XtConfig read back from chrome.storage (re-validated: storage is ours, but be strict). */
export function parseStoredConfig(v: unknown, version: string): XtConfig {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return effectiveConfig(null, version, null);
  const s = v as Record<string, unknown>;
  const fetchedAt = typeof s.fetchedAt === 'number' ? s.fetchedAt : null;
  return effectiveConfig(
    { schema: 1, minVersion: typeof s.minVersion === 'string' && VERSION_RE.test(s.minVersion) ? s.minVersion : null, ops: s.ops, flags: parseRemoteConfig({ schema: 1, flags: s.flags })?.flags || {} },
    version,
    fetchedAt,
  );
}

/* ─── hook.js ↔ content.js wire format ─── */

/** hook.js → content.js: one GraphQL response. */
export const HOOK_TAG = 'xtracticle:hook:1';
/** content.js → hook.js: the merged operation names. */
export const OPS_TAG = 'xtracticle:ops:1';
/** Largest response body forwarded (UTF-16 code units). A Bookmarks page of 20 posts is ~0.3–1 MB. */
export const MAX_BODY_CHARS = 8_000_000;
/** Largest request body forwarded (mutation variables only). */
export const MAX_REQ_CHARS = 16_384;

export interface HookMessage {
  tag: typeof HOOK_TAG;
  op: string;
  /** Response text (JSON). */
  body: string;
  /** Request body, only for REQUEST_BODY_CATEGORIES. */
  req?: string;
  /** Set (429 or 5xx) on a status-only message for STATUS_CATEGORIES; `body` is then ''. */
  status?: number;
}

export interface OpsMessage {
  tag: typeof OPS_TAG;
  ops: OpMap;
}

/** Shape check for a message claiming to come from hook.js. The page can post the same thing: it is still untrusted data. */
export function isHookMessage(d: unknown): d is HookMessage {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return false;
  const m = d as Record<string, unknown>;
  return (
    m.tag === HOOK_TAG &&
    isOpName(m.op) &&
    typeof m.body === 'string' &&
    m.body.length <= MAX_BODY_CHARS &&
    (m.req === undefined || (typeof m.req === 'string' && m.req.length <= MAX_REQ_CHARS)) &&
    (m.status === undefined || (isThrottleStatus(m.status) && m.body === ''))
  );
}
