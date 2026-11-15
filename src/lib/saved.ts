import type { SavedState, SavedSummary } from '../shared/bridge';
import type { FxTweet } from '../shared/fx';

/**
 * Pure helpers for the /saved page (src/components/SavedPage.tsx): which copies a free visitor may
 * open, what an export contains, and the CSV. Kept out of the component so they are unit-tested.
 */

/** Free exports hold the latest 100 copies (owner decision 2). */
export const FREE_EXPORT_LIMIT = 100;
/** Free visitors see the full copy of the 3 newest unavailable posts (owner decision 3). */
export const FREE_GONE_COPIES = 3;

/** "Unavailable" for the page: confirmed unavailable, or missing from X and being checked. */
export const isGone = (state: SavedState) => state === 'unavailable' || state === 'missing';

const time = (s: SavedSummary) => {
  const t = Date.parse(s.date);
  return Number.isFinite(t) ? t : 0;
};

/** Ids of the unavailable copies a free visitor may open: the newest few by post date. */
export function freeGoneIds(items: SavedSummary[], n = FREE_GONE_COPIES): Set<string> {
  return new Set(
    items
      .filter(s => isGone(s.state))
      .sort((a, b) => time(b) - time(a))
      .slice(0, n)
      .map(s => s.id),
  );
}

/** May this copy be opened in full? */
export const canOpen = (s: SavedSummary, pro: boolean, free: Set<string>) => pro || !isGone(s.state) || free.has(s.id);

/** Case-insensitive search over title, author and id. */
export function searchSummaries(items: SavedSummary[], q: string): SavedSummary[] {
  const needle = q.trim().toLowerCase().replace(/^@/, '');
  if (!needle) return items;
  return items.filter(s => s.title.toLowerCase().includes(needle) || s.author.toLowerCase().includes(needle) || s.id === needle);
}

/**
 * What an export of the visible list holds. Pro: everything. Free: unavailable copies are Pro, except the
 * newest few that are open anyway; of the rest, the first 100 in list order (the extension lists newest first).
 */
export function exportScope(items: SavedSummary[], pro: boolean, free: Set<string>): SavedSummary[] {
  if (pro) return items;
  return items.filter(s => canOpen(s, false, free)).slice(0, FREE_EXPORT_LIMIT);
}

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
/** The summary's author as an X handle, when it is one. */
export const handleOf = (s: Pick<SavedSummary, 'author'>) => {
  const h = s.author.replace(/^@/, '');
  return HANDLE_RE.test(h) ? h : null;
};

export const postUrl = (s: SavedSummary) => `https://x.com/${handleOf(s) || 'i'}/status/${s.id}`;

const asTweet = (v: unknown): FxTweet | null => {
  if (!v || typeof v !== 'object') return null;
  const t = v as Record<string, unknown>;
  const author = t.author as Record<string, unknown> | undefined;
  if (typeof t.id !== 'string' || !/^\d{1,25}$/.test(t.id)) return null;
  if (!author || typeof author !== 'object' || typeof author.screen_name !== 'string') return null;
  return { ...(t as unknown as FxTweet), text: typeof t.text === 'string' ? t.text : '', author: { name: String(author.name ?? ''), screen_name: author.screen_name, avatar_url: typeof author.avatar_url === 'string' ? author.avatar_url : undefined } };
};

/**
 * The posts of one saved copy, ready for `buildDoc`. The extension sends an FxTweet; a copy of a whole
 * thread may carry the posts in `thread` (FxTweet[]). Anything malformed → null (the page is untrusted input).
 */
export function postToTweets(post: Record<string, unknown> | null): FxTweet[] | null {
  if (!post) return null;
  if (Array.isArray(post.thread) && post.thread.length) {
    const list = post.thread.slice(0, 200).map(asTweet);
    if (list.every(Boolean)) return list as FxTweet[];
  }
  const one = asTweet(post);
  return one ? [one] : null;
}

/** Spreadsheet-safe CSV cell: quoted, and a leading = + - @ is defused. */
function cell(v: string): string {
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${s.replace(/"/g, '""')}"`;
}

export function summariesCsv(items: SavedSummary[]): string {
  const head = ['id', 'author', 'title', 'date', 'state', 'url'];
  const rows = items.map(s => [s.id, s.author, s.title, s.date, s.state, postUrl(s)].map(cell).join(','));
  return '\uFEFF' + [head.join(','), ...rows].join('\r\n') + '\r\n';
}
