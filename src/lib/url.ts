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

export function shareUrl(handle: string, id: string) {
  return `${location.origin}/${handle || 'i'}/status/${id}`;
}
