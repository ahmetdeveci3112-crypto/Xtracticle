/**
 * The service worker's message API: content.js (x.com), bridge.js (xtracticle.com) and the popup talk to
 * the SW only through these `chrome.runtime.sendMessage` messages. The SW is the only writer of the
 * archive and the Pro cache; callers never touch IndexedDB or chrome.storage.local.pro themselves.
 *
 * Who may send what (bg/sw.ts → `isAllowed`):
 *   popup / extension pages   everything
 *   content.js on x.com       capture:posts, pro:get, pro:refresh, saved:status, saved:has, settings:get,
 *                             thread:get, event:track, scan:state, scan:done
 *   bridge.js on the site     pro:get, pro:refresh, saved:status, lang:set; on /saved also saved:list,
 *                             saved:get, saved:delete
 *
 * Every reply is `{ ok: true, data }` or `{ ok: false, error }` (error is a short code).
 */
import type { SavedFilter, SavedSummary } from '../../src/shared/bridge';
import type { FxTweet } from '../../src/shared/fx';

export type PostSource = 'bookmark' | 'manual' | 'like' | 'own';

/** content.js → SW after it mapped one GraphQL response. */
export interface CapturePayload {
  /** The signed-in X account (`twid` cookie); null = posts are kept, bookmark rows are not. */
  accountId: string | null;
  source: PostSource;
  tweets: FxTweet[];
  /** Bookmark rows to upsert (Bookmarks timeline order). */
  entries?: { id: string; sortIndex: string | null }[];
  /** DeleteBookmark: the user removed these bookmarks. */
  removed?: string[];
  /** Tombstones on the Bookmarks timeline: X itself says these are no longer available. */
  gone?: { id: string; sortIndex: string | null }[];
}

export interface Settings {
  /** Local archive of captured posts (default on, owner decision 4). Off = nothing is written. */
  archive: boolean;
  /** Anonymous daily counters (POST /api/ext/event, bg/events.ts). Default on; off drops the queue. */
  counter: boolean;
  /** The popup's one-line notice about the local archive was dismissed (owner decision 4). */
  noticeSeen: boolean;
}

/** thread:get: the site's GET /api/thread/:id. `status` 404 = not public / not found; 0 = network error. */
export interface ThreadReply {
  status: number;
  tweets: FxTweet[] | null;
}

/** event:track: one counter event (names from src/shared/events.ts COUNTER_EVENTS). */
export interface TrackedEvent {
  name: string;
  param?: string;
}

export interface ProView {
  /** Pro right now (a network error keeps the last answer for 7 days). */
  pro: boolean;
  plan: string | null;
  /** Last successful /api/pro/me answer, ISO; null = never. */
  checkedAt: string | null;
  /** The last attempt failed and `pro` comes from the cache. */
  offline: boolean;
}

export interface SavedStatus {
  posts: number;
  /** Active bookmark rows of the account (the last seen account when none is given). */
  bookmarks: number;
  /** Bookmark rows in state missing or unavailable. */
  unavailable: number;
  lastSyncAt: string | null;
  archive: boolean;
}

export interface SavedPage {
  items: SavedSummary[];
  /** Cursor for the next page; null = last page. */
  next: number | null;
  total: number;
}

export interface StoredPost {
  id: string;
  tweet: FxTweet;
  thread?: FxTweet[];
  source: PostSource;
  capturedAt: string;
  updatedAt: string;
}

export interface ArchiveExport {
  format: 'xtracticle-archive';
  version: 1;
  exportedAt: string;
  extVersion: string;
  posts: StoredPost[];
  bookmarks: unknown[];
}

export type Msg =
  | { type: 'pro:get' }
  | { type: 'pro:refresh' }
  | { type: 'pro:activate'; key: string }
  | { type: 'pro:logout' }
  | { type: 'capture:posts'; capture: CapturePayload }
  | { type: 'saved:list'; cursor?: number; filter?: SavedFilter; accountId?: string }
  | { type: 'saved:get'; id: string }
  | { type: 'saved:delete'; ids: string[] }
  | { type: 'saved:status'; accountId?: string }
  | { type: 'saved:has'; ids: string[] }
  | { type: 'thread:get'; id: string }
  | { type: 'event:track'; event: TrackedEvent }
  | { type: 'lang:set'; lang: string }
  | { type: 'saved:clear' }
  | { type: 'scan:state'; accountId: string }
  | { type: 'scan:done'; accountId: string }
  | { type: 'saved:export' }
  | { type: 'settings:get' }
  | { type: 'settings:set'; settings: Partial<Settings> };

export type MsgType = Msg['type'];

export interface Replies {
  'pro:get': ProView;
  'pro:refresh': ProView;
  'pro:activate': ProView;
  'pro:logout': ProView;
  /** `fresh`: bookmark rows that did not exist before this capture (incremental scan stop rule). */
  'capture:posts': { stored: number; bookmarks: number; fresh: number; disabled: boolean };
  'saved:list': SavedPage;
  'saved:get': StoredPost | null;
  'saved:delete': { deleted: number };
  'saved:status': SavedStatus;
  /** The ids, of those asked, that have a stored copy. */
  'saved:has': { ids: string[] };
  'thread:get': ThreadReply;
  'event:track': { queued: boolean };
  'lang:set': { lang: string; changed: boolean };
  'saved:clear': { cleared: true };
  /** When a scan last reached the end of the account's bookmarks list (ISO); null = never. */
  'scan:state': { fullScanAt: string | null };
  /** A scan stopped at the end of the list: remembers it for the account. */
  'scan:done': { fullScanAt: string };
  'saved:export': ArchiveExport;
  'settings:get': Settings;
  'settings:set': Settings;
}

export type Reply<T> = { ok: true; data: T } | { ok: false; error: string };

export const MSG_TYPES: readonly MsgType[] = [
  'pro:get', 'pro:refresh', 'pro:activate', 'pro:logout', 'capture:posts',
  'saved:list', 'saved:get', 'saved:delete', 'saved:status', 'saved:has', 'saved:clear', 'saved:export', 'scan:state', 'scan:done',
  'settings:get', 'settings:set', 'thread:get', 'event:track', 'lang:set',
];

/** Typed sendMessage for content.js / bridge.js / popup. Never rejects: a sleeping or reloading SW gives `{ ok: false }`. */
export async function send<M extends Msg>(m: M): Promise<Reply<Replies[M['type']]>> {
  try {
    const r = (await chrome.runtime.sendMessage(m)) as Reply<Replies[M['type']]> | undefined;
    return r && typeof r === 'object' && 'ok' in r ? r : { ok: false, error: 'no_reply' };
  } catch {
    return { ok: false, error: 'unreachable' };
  }
}
