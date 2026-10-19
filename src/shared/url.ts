/**
 * Input parsing: accepts post links from x.com / twitter.com and popular
 * mirrors (fxtwitter, vxtwitter, fixupx, nitter, xcancel, xtracticle), links
 * embedded in shared text, and bare numeric post IDs.
 */

export type ParsedInput =
  | { kind: 'status'; id: string; handle?: string }
  | { kind: 'article-link' }
  | null;

const HOSTS = '(?:x|twitter|fxtwitter|vxtwitter|fixupx|fixvx|xcancel|nitter|xtracticle)\\.[a-z.]+';
const STATUS_RE = new RegExp(
  `(?<![\\w-])(?:(?:www|mobile)\\.)?${HOSTS}\\/(?:#!\\/)?(?:([A-Za-z0-9_]{1,15})|i(?:\\/web)?)\\/status(?:es)?\\/(\\d{1,25})`,
  'i',
);
const ARTICLE_RE = new RegExp(`${HOSTS}\\/(?:[A-Za-z0-9_]{1,15}|i)\\/article\\/\\d+`, 'i');

export function parseInput(input: string): ParsedInput {
  const text = (input || '').trim();
  if (!text) return null;
  if (/^\d{5,25}$/.test(text)) return { kind: 'status', id: text };
  const m = text.match(STATUS_RE);
  if (m) return { kind: 'status', id: m[2], handle: m[1] && m[1] !== 'i' ? m[1] : undefined };
  if (ARTICLE_RE.test(text)) return { kind: 'article-link' };
  return null;
}

/** `/{handle}/status/{id}` or `/i/web/status/{id}` on our own domain. */
export function parsePath(pathname: string): { id: string; handle?: string } | null {
  const m = pathname.match(/^\/(?:([A-Za-z0-9_]{1,15})|i(?:\/web)?)\/status(?:es)?\/(\d{1,25})\/?$/);
  return m ? { id: m[2], handle: m[1] && m[1] !== 'i' ? m[1] : undefined } : null;
}

/** What a non-post input looks like, for the error message and analytics. Never returns the input itself. */
export type InputKind =
  | { kind: 'profile'; handle: string }
  | { kind: 'empty' | 'x_other' | 'non_x_url' | 'text' };

const RESERVED = new Set([
  'i', 'home', 'explore', 'search', 'notifications', 'messages', 'settings', 'hashtag', 'compose', 'intent',
  'share', 'login', 'logout', 'signup', 'tos', 'privacy', 'about', 'download', 'jobs', 'communities', 'lists',
]);
const X_URL_RE = new RegExp(`(?:https?:\\/\\/)?(?:(?:www|mobile)\\.)?(?<![\\w-])${HOSTS}(?:\\/(?:#!\\/)?([A-Za-z0-9_]{1,15}))?(?=[\\/?#\\s]|$)`, 'i');

export function classifyInput(input: string): InputKind {
  const text = (input || '').trim();
  if (!text) return { kind: 'empty' };
  const handleOnly = text.match(/^@([A-Za-z0-9_]{1,15})$/);
  if (handleOnly) return { kind: 'profile', handle: handleOnly[1] };
  const m = text.match(X_URL_RE);
  if (m) return m[1] && !RESERVED.has(m[1].toLowerCase()) ? { kind: 'profile', handle: m[1] } : { kind: 'x_other' };
  return /https?:\/\/|www\./i.test(text) ? { kind: 'non_x_url' } : { kind: 'text' };
}

/** Approximate post date from the ID (snowflake), or null for pre-2010 IDs. */
export function snowflakeDate(id: string): Date | null {
  try {
    const ms = Number(BigInt(id) >> 22n) + 1288834974657;
    return id.length >= 15 ? new Date(ms) : null;
  } catch {
    return null;
  }
}

/**
 * Archive lookups for a post that can't be fetched. Captures live under the
 * URL that was current when the post was archived: twitter.com before X
 * switched links to x.com (May 2024), x.com after.
 */
export function archiveLinks(id: string, handle: string) {
  const date = snowflakeDate(id);
  const host = date && date >= new Date('2024-05-17') ? 'x.com' : 'twitter.com';
  const post = `${host}/${handle}/status/${id}`;
  return {
    wayback: `https://web.archive.org/web/*/${post}*`,
    archiveToday: `https://archive.ph/https://${post}`,
  };
}

/** Wayback Machine's list of every archived post URL of an account. */
export const waybackProfile = (handle: string) => `https://web.archive.org/web/*/twitter.com/${handle}/status/*`;
