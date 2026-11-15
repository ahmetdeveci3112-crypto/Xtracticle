/**
 * Pure rules for the local archive (docs/chrome-extension-plan.md, B6): how a captured post or bookmark
 * row is merged with what is stored, how a row is summarised for /saved, and how capture messages are
 * re-validated before anything is written. bg/db.ts does the IndexedDB I/O around these.
 */
import { SAVED_PAGE_SIZE, isPostId, type SavedState, type SavedSummary } from '../../../src/shared/bridge';
import type { FxTweet } from '../../../src/shared/fx';
import { titleFromText } from '../../../src/shared/text';
import type { ArchiveExport, CapturePayload, PostSource, Settings, StoredPost } from '../messages';

export const PAGE_SIZE = SAVED_PAGE_SIZE;
export const MAX_TWEETS_PER_CAPTURE = 200;
const MAX_TWEET_JSON = 1_000_000;
const SOURCES: readonly PostSource[] = ['bookmark', 'manual', 'like', 'own'];
const ACCOUNT_RE = /^\d{1,25}$/;
const SORT_RE = /^\d{1,30}$/;

/**
 * meta key holding when a scan last reached the real end of this account's bookmarks list (ISO time).
 * Without it the incremental "up to date" stop is off: an earlier scan may have stopped half way.
 */
export const FULL_SCAN_PREFIX = 'fullScan:';
export const fullScanKey = (accountId: string) => FULL_SCAN_PREFIX + accountId;
export const isFullScanKey = (key: string) => key.startsWith(FULL_SCAN_PREFIX);

export interface BookmarkRow {
  accountId: string;
  id: string;
  sortIndex: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  state: SavedState;
  missingSince: string | null;
  checks: number;
  checkedAt: string | null;
  seenByUserAt: string | null;
}

export const DEFAULT_SETTINGS: Settings = { archive: true, counter: true, noticeSeen: false };

/* ─── Merging ─── */

/** New capture over a stored post: newest data wins, except a full Article body is never replaced by a preview. */
export function mergePost(prev: StoredPost | undefined, tweet: FxTweet, source: PostSource, now: string): StoredPost {
  let next = tweet;
  if (prev?.tweet.article && !prev.tweet.article.preview && tweet.article?.preview) next = { ...tweet, article: prev.tweet.article };
  return {
    id: tweet.id,
    tweet: next,
    ...(prev?.thread ? { thread: prev.thread } : {}),
    source: prev?.source ?? source,
    capturedAt: prev?.capturedAt ?? now,
    updatedAt: now,
  };
}

/** The post was seen on the Bookmarks timeline (or bookmarked just now): active again. */
export function mergeBookmark(prev: BookmarkRow | undefined, accountId: string, entry: { id: string; sortIndex: string | null }, now: string): BookmarkRow {
  return {
    accountId,
    id: entry.id,
    sortIndex: entry.sortIndex ?? prev?.sortIndex ?? null,
    firstSeenAt: prev?.firstSeenAt ?? now,
    lastSeenAt: now,
    state: 'active',
    missingSince: null,
    checks: 0,
    checkedAt: prev?.checkedAt ?? null,
    seenByUserAt: prev?.seenByUserAt ?? null,
  };
}

/** DeleteBookmark: the user's own removal; never reported as "no longer available". */
export function markRemoved(prev: BookmarkRow, now: string): BookmarkRow {
  return { ...prev, state: 'removed_by_user', missingSince: null, checkedAt: now };
}

/** A tombstone on the Bookmarks timeline: X says the post is gone. The stored copy is kept. */
export function markGone(prev: BookmarkRow, now: string): BookmarkRow {
  if (prev.state === 'removed_by_user') return prev;
  return { ...prev, state: 'unavailable', missingSince: prev.missingSince ?? now, lastSeenAt: now, checkedAt: now };
}

/* ─── Summaries ─── */

function isoDate(createdAt: string, fallback: string): string {
  const d = createdAt ? new Date(createdAt) : null;
  return d && !isNaN(+d) ? d.toISOString() : fallback;
}

/** One /saved row (src/shared/bridge.ts SavedSummary limits: author ≤ 64, title ≤ 400). */
export function summarize(post: StoredPost, state: SavedState = 'active'): SavedSummary {
  const t = post.tweet;
  const handle = (t.author?.screen_name || '').slice(0, 64);
  const raw = (typeof t.article?.title === 'string' && t.article.title.trim()) || titleFromText(t.text) || (t.text || '').replace(/\s+/g, ' ').trim();
  const title = (raw || (handle ? `@${handle}` : post.id)).slice(0, 400);
  return { id: post.id, author: handle, title, date: isoDate(t.created_at, post.capturedAt).slice(0, 40), state };
}

export function pageOf<T>(all: T[], cursor: number, size = PAGE_SIZE): { items: T[]; next: number | null; total: number } {
  const start = Math.max(0, Math.floor(cursor) || 0);
  const items = all.slice(start, start + size);
  const end = start + items.length;
  return { items, next: end < all.length ? end : null, total: all.length };
}

/* ─── Validation of what content.js sends ─── */

type Obj = Record<string, any>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const httpsUrl = (v: unknown): v is string => typeof v === 'string' && v.length <= 2048 && /^https:\/\//.test(v);
const optNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

function sanitizeMedia(m: unknown): FxTweet['media'] {
  if (!isObj(m)) return undefined;
  const photos = Array.isArray(m.photos)
    ? m.photos.filter((p: unknown) => isObj(p) && httpsUrl(p.url)).slice(0, 10).map((p: Obj) => ({
        url: p.url as string,
        width: optNum(p.width),
        height: optNum(p.height),
        altText: typeof p.altText === 'string' ? p.altText.slice(0, 5000) : '',
      }))
    : [];
  const videos = Array.isArray(m.videos)
    ? m.videos.filter((v: unknown) => isObj(v) && httpsUrl(v.url)).slice(0, 10).map((v: Obj) => ({
        url: v.url as string,
        thumbnail_url: httpsUrl(v.thumbnail_url) ? v.thumbnail_url : undefined,
        duration: optNum(v.duration),
        type: v.type === 'gif' ? 'gif' : 'video',
      }))
    : [];
  if (!photos.length && !videos.length) return undefined;
  return { ...(photos.length ? { photos } : {}), ...(videos.length ? { videos } : {}) };
}

/** An FxTweet from content.js, re-checked field by field; null when it is not one. */
export function sanitizeTweet(v: unknown, depth = 0): FxTweet | null {
  if (!isObj(v) || !isPostId(v.id) || typeof v.text !== 'string' || v.text.length > 100_000 || !isObj(v.author)) return null;
  try {
    if (JSON.stringify(v).length > MAX_TWEET_JSON) return null;
  } catch {
    return null;
  }
  const screen = typeof v.author.screen_name === 'string' && /^[A-Za-z0-9_]{0,50}$/.test(v.author.screen_name) ? v.author.screen_name : '';
  const replyTo = typeof v.replying_to_status === 'string' && isPostId(v.replying_to_status) ? v.replying_to_status : null;
  return {
    id: v.id,
    url: `https://x.com/${screen || 'i'}/status/${v.id}`,
    text: v.text,
    created_at: typeof v.created_at === 'string' ? v.created_at.slice(0, 64) : '',
    lang: typeof v.lang === 'string' ? v.lang.slice(0, 16) : undefined,
    replies: optNum(v.replies),
    likes: optNum(v.likes),
    views: optNum(v.views),
    replying_to_status: replyTo,
    author: {
      name: typeof v.author.name === 'string' ? v.author.name.slice(0, 200) : '',
      screen_name: screen,
      avatar_url: httpsUrl(v.author.avatar_url) ? v.author.avatar_url : undefined,
    },
    media: sanitizeMedia(v.media),
    quote: depth === 0 && v.quote ? sanitizeTweet(v.quote, 1) : null,
    article: isObj(v.article) ? v.article : undefined,
  };
}

const sortIndexOf = (v: unknown) => (typeof v === 'string' && SORT_RE.test(v) ? v : null);

function entryList(v: unknown): { id: string; sortIndex: string | null }[] {
  if (!Array.isArray(v)) return [];
  const out: { id: string; sortIndex: string | null }[] = [];
  for (const e of v.slice(0, MAX_TWEETS_PER_CAPTURE)) if (isObj(e) && isPostId(e.id)) out.push({ id: e.id, sortIndex: sortIndexOf(e.sortIndex) });
  return out;
}

/** The `capture` of a capture:posts message, re-validated; null when nothing usable is left. */
export function sanitizeCapture(raw: unknown): CapturePayload | null {
  if (!isObj(raw)) return null;
  const accountId = typeof raw.accountId === 'string' && ACCOUNT_RE.test(raw.accountId) ? raw.accountId : null;
  const source = SOURCES.includes(raw.source) ? (raw.source as PostSource) : 'manual';
  const tweets = Array.isArray(raw.tweets) ? raw.tweets.slice(0, MAX_TWEETS_PER_CAPTURE).map(t => sanitizeTweet(t)).filter((t): t is FxTweet => !!t) : [];
  const entries = entryList(raw.entries);
  const gone = entryList(raw.gone);
  const removed = Array.isArray(raw.removed) ? raw.removed.filter(isPostId).slice(0, MAX_TWEETS_PER_CAPTURE) : [];
  if (!tweets.length && !entries.length && !gone.length && !removed.length) return null;
  return { accountId, source, tweets, entries, removed, gone };
}

export function sanitizeSettings(patch: unknown, prev: Settings): Settings {
  const p = isObj(patch) ? patch : {};
  const pick = <K extends keyof Settings>(k: K): Settings[K] => (typeof p[k] === 'boolean' ? (p[k] as Settings[K]) : prev[k]);
  // Older stored settings lack the newer fields: fill them from the defaults.
  const base = { ...DEFAULT_SETTINGS, ...prev };
  return { archive: pick('archive') ?? base.archive, counter: pick('counter') ?? base.counter, noticeSeen: pick('noticeSeen') ?? base.noticeSeen };
}

export function buildExport(posts: StoredPost[], bookmarks: BookmarkRow[], now: string, extVersion: string): ArchiveExport {
  return { format: 'xtracticle-archive', version: 1, exportedAt: now, extVersion, posts, bookmarks };
}
