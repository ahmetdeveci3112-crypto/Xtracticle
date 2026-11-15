/**
 * Site ↔ extension bridge contract (docs/chrome-extension-plan.md, A1).
 *
 * The extension's `bridge.js` content script runs on xtracticle.com. Both sides talk through
 * `window.postMessage` on the page's own window; this module is imported by the site and by the
 * extension so the two can never disagree about a message's shape.
 *
 * Every message is an envelope `{ xt: BRIDGE_VERSION, type, ...fields }`. A receiver accepts it only when
 *   - `event.source === window` and `event.origin` is the expected site origin (`isTrustedEvent`),
 *   - it is not larger than the limit for its direction (`MAX_SITE_MESSAGE_BYTES` / `MAX_EXT_MESSAGE_BYTES`),
 *   - its fields match the schema for its type (`parseSiteMessage` / `parseExtMessage`).
 * Data requests (`xt:saved:*`) are answered only on the /saved page (`isSavedPath`).
 * Anything that fails a check is dropped silently: the page is untrusted input for the extension
 * and the other way round.
 */

export const BRIDGE_VERSION = 1;

/** Production origin. The dev extension build also trusts its own XT_BASE (e.g. http://localhost:8787). */
export const SITE_ORIGIN = 'https://xtracticle.com';

/** Site → extension messages carry ids and small options only. */
export const MAX_SITE_MESSAGE_BYTES = 16 * 1024;
/** Extension → site messages carry up to one page of summaries or one full post. */
export const MAX_EXT_MESSAGE_BYTES = 2 * 1024 * 1024;
/** Summaries per `xt:saved:page`. */
export const SAVED_PAGE_SIZE = 200;
/** Ids per `xt:saved:delete`. */
export const MAX_DELETE_IDS = 500;

/** `dataset` key the bridge sets on <html> (`data-xt-ext="<version>"`). */
export const DATASET_KEY = 'xtExt';

/* ─── Message types ─── */

export const LANGS = ['en', 'tr', 'es', 'pt', 'ja', 'zh', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export type SavedFilter = 'all' | 'removed';

/** Site → extension. */
export type SiteMessage =
  | { xt: 1; type: 'xt:pro-changed' }
  | { xt: 1; type: 'xt:lang-changed'; lang: Lang }
  | { xt: 1; type: 'xt:saved:list'; req: string; cursor: number; filter: SavedFilter }
  | { xt: 1; type: 'xt:saved:get'; req: string; id: string }
  | { xt: 1; type: 'xt:saved:delete'; req: string; ids: string[] };

export type SavedState = 'active' | 'removed_by_user' | 'missing' | 'unavailable';

/** One row of the /saved list. The full post is fetched with `xt:saved:get` when opened. */
export interface SavedSummary {
  id: string;
  author: string;
  title: string;
  /** ISO 8601. */
  date: string;
  state: SavedState;
}

/** Extension → site. `post` is an FxTweet-shaped object; the site renders it as untrusted data. */
export type ExtMessage =
  | { xt: 1; type: 'xt:hello'; version: string }
  | { xt: 1; type: 'xt:status'; bookmarks: number; unavailable: number; lastSyncAt: string | null }
  | { xt: 1; type: 'xt:saved:page'; req: string; items: SavedSummary[]; next: number | null; total: number }
  | { xt: 1; type: 'xt:saved:post'; req: string; id: string; post: Record<string, unknown> | null };

export type SiteMessageType = SiteMessage['type'];
export type ExtMessageType = ExtMessage['type'];

/* ─── Checks ─── */

const ID_RE = /^\d{1,25}$/;
const REQ_RE = /^[A-Za-z0-9_-]{1,40}$/;
const VERSION_RE = /^\d{1,4}(\.\d{1,5}){0,3}$/;
const SAVED_STATES: readonly string[] = ['active', 'removed_by_user', 'missing', 'unavailable'];

export const isPostId = (v: unknown): v is string => typeof v === 'string' && ID_RE.test(v);
const isReq = (v: unknown): v is string => typeof v === 'string' && REQ_RE.test(v);
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 1e7;
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const shortText = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;

/** The origin of an XT_BASE-style URL; null when it is not http(s). */
export function originOf(base: string): string | null {
  try {
    const u = new URL(base);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : null;
  } catch {
    return null;
  }
}

/** True when a MessageEvent came from this very window and the expected origin. */
export function isTrustedEvent(
  event: { source: unknown; origin: string },
  win: unknown,
  expectedOrigin: string = SITE_ORIGIN,
): boolean {
  return event.source === win && event.origin === expectedOrigin;
}

/** The JSON size of a message in bytes (UTF-16 length is a safe upper bound for the limit); Infinity when it can't be serialised. */
export function messageSize(data: unknown): number {
  try {
    const s = JSON.stringify(data);
    return typeof s === 'string' ? s.length * 2 : Infinity;
  } catch {
    return Infinity;
  }
}

/** Data requests are only answered on /saved (and the language variants, e.g. /tr/saved). */
export const isSavedPath = (pathname: string) => /^(?:\/(?:tr|es|pt|ja|zh|ar))?\/saved(?:\/|$)/.test(pathname);

const envelope = (data: unknown): data is Record<string, unknown> & { type: string } =>
  isObject(data) && data.xt === BRIDGE_VERSION && typeof data.type === 'string';

/** A validated site → extension message, or null. */
export function parseSiteMessage(data: unknown): SiteMessage | null {
  if (!envelope(data) || messageSize(data) > MAX_SITE_MESSAGE_BYTES) return null;
  switch (data.type) {
    case 'xt:pro-changed':
      return { xt: 1, type: data.type };
    case 'xt:lang-changed':
      return (LANGS as readonly unknown[]).includes(data.lang) ? { xt: 1, type: data.type, lang: data.lang as Lang } : null;
    case 'xt:saved:list': {
      const cursor = data.cursor ?? 0;
      const filter = data.filter ?? 'all';
      if (!isReq(data.req) || !isCount(cursor) || (filter !== 'all' && filter !== 'removed')) return null;
      return { xt: 1, type: data.type, req: data.req, cursor, filter };
    }
    case 'xt:saved:get':
      return isReq(data.req) && isPostId(data.id) ? { xt: 1, type: data.type, req: data.req, id: data.id } : null;
    case 'xt:saved:delete': {
      const ids = data.ids;
      if (!isReq(data.req) || !Array.isArray(ids) || !ids.length || ids.length > MAX_DELETE_IDS || !ids.every(isPostId)) return null;
      return { xt: 1, type: data.type, req: data.req, ids: [...ids] };
    }
    default:
      return null;
  }
}

function parseSummary(v: unknown): SavedSummary | null {
  if (!isObject(v)) return null;
  const { id, author, title, date, state } = v;
  if (!isPostId(id) || !shortText(author, 64) || !shortText(title, 400) || !shortText(date, 40) || !SAVED_STATES.includes(state as string)) return null;
  return { id, author, title, date, state: state as SavedState };
}

/** A validated extension → site message, or null. */
export function parseExtMessage(data: unknown): ExtMessage | null {
  if (!envelope(data) || messageSize(data) > MAX_EXT_MESSAGE_BYTES) return null;
  switch (data.type) {
    case 'xt:hello':
      return typeof data.version === 'string' && VERSION_RE.test(data.version) ? { xt: 1, type: data.type, version: data.version } : null;
    case 'xt:status': {
      const { bookmarks, unavailable } = data;
      const raw = data.lastSyncAt ?? null;
      if (!isCount(bookmarks) || !isCount(unavailable) || !(raw === null || shortText(raw, 40))) return null;
      const lastSyncAt: string | null = raw === null ? null : (raw as string);
      return { xt: 1, type: data.type, bookmarks, unavailable, lastSyncAt };
    }
    case 'xt:saved:page': {
      const { req, items, total } = data;
      const rawNext = data.next ?? null;
      if (!isReq(req) || !Array.isArray(items) || items.length > SAVED_PAGE_SIZE || !isCount(total) || !(rawNext === null || isCount(rawNext))) return null;
      const next: number | null = rawNext === null ? null : (rawNext as number);
      const parsed = items.map(parseSummary);
      if (parsed.some(s => !s)) return null;
      return { xt: 1, type: data.type, req, items: parsed as SavedSummary[], next, total };
    }
    case 'xt:saved:post': {
      const raw = data.post ?? null;
      if (!isReq(data.req) || !isPostId(data.id) || !(raw === null || isObject(raw))) return null;
      const post = raw === null ? null : (raw as Record<string, unknown>);
      return { xt: 1, type: data.type, req: data.req, id: data.id, post };
    }
    default:
      return null;
  }
}

type WithoutEnvelope<T> = T extends unknown ? Omit<T, 'xt'> : never;

/** Builds an envelope; the type parameter keeps senders honest. */
export function message<T extends SiteMessage | ExtMessage>(m: WithoutEnvelope<T>): T {
  return { xt: BRIDGE_VERSION, ...m } as T;
}
