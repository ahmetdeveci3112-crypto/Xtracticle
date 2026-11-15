/**
 * Every link the extension opens on xtracticle.com (pure; unit-tested). Rules of the site:
 *   - post pages are `/{handle}/status/{id}` with no language prefix (src/worker.ts STATUS_PATH); the site
 *     picks the language from the visitor's stored choice;
 *   - /saved, /pro and the deleted-tweet finder have language versions (src/lib/ext.ts savedPath, site/l10n);
 *   - every link carries utm_source=extension, utm_medium=<where>, utm_campaign=credit (A6).
 */
import { savedPath } from '../../src/lib/ext';
import type { Lang } from '../../src/shared/bridge';

export type Medium = 'save_menu' | 'bookmarks_panel' | 'gone_panel' | 'popup';
export type OpenFormat = 'pdf' | 'epub' | 'zip' | 'md';

const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
const ID_RE = /^\d{1,25}$/;

const utm = (medium: Medium) => `utm_source=extension&utm_medium=${medium}&utm_campaign=credit`;
const trim = (base: string) => base.replace(/\/+$/, '');

/** `/es/pro`-style path for pages that exist in every language under the same slug. */
const prefixed = (lang: Lang, slug: string) => (lang === 'en' ? `/${slug}` : `/${lang}/${slug}`);

/** The deleted-tweet finder's path per language (site/tools-extra.ts, site/l10n/<lang>/tools.ts). */
export const FINDER_PATHS: Record<Lang, string> = {
  en: '/deleted-tweet-finder',
  tr: '/tr/silinen-tweetleri-bulma',
  es: '/es/buscador-de-tweets-borrados',
  pt: '/pt/localizador-de-tweets-apagados',
  ja: '/ja/deleted-tweet-finder',
  zh: '/zh/deleted-tweet-finder',
  ar: '/ar/deleted-tweet-finder',
};

/** A post on the site; `fmt` adds `#dl=<fmt>` so the page runs that download once (src/App.tsx). */
export function statusUrl(base: string, handle: string, id: string, medium: Medium, fmt?: OpenFormat): string {
  const h = HANDLE_RE.test(handle) ? handle : 'i';
  const safeId = ID_RE.test(id) ? id : '0';
  return `${trim(base)}/${h}/status/${safeId}?${utm(medium)}${fmt ? `#dl=${fmt}` : ''}`;
}

/** /saved in the visitor's language; `id` opens that copy (`#id=`). */
export function savedUrl(base: string, lang: Lang, medium: Medium, id?: string): string {
  return `${trim(base)}${savedPath(lang)}?${utm(medium)}${id && ID_RE.test(id) ? `#id=${id}` : ''}`;
}

export const proUrl = (base: string, lang: Lang, medium: Medium) => `${trim(base)}${prefixed(lang, 'pro')}?${utm(medium)}`;

/** The account's archived posts in the finder (`?link=@handle`, src/App.tsx). */
export function finderUrl(base: string, lang: Lang, handle: string, medium: Medium): string {
  const link = HANDLE_RE.test(handle) ? `link=${encodeURIComponent('@' + handle)}&` : '';
  return `${trim(base)}${FINDER_PATHS[lang] || FINDER_PATHS.en}?${link}${utm(medium)}`;
}

/** `{ handle, id }` of an x.com / twitter.com post URL or path, else null. */
export function parseStatusUrl(href: string, base = 'https://x.com'): { handle: string; id: string } | null {
  try {
    const u = new URL(href, base);
    if (!/^(?:www\.|mobile\.)?(?:x|twitter)\.com$/.test(u.hostname)) return null;
    const m = /^\/([A-Za-z0-9_]{1,15})\/status(?:es)?\/(\d{1,25})(?:\/|$)/.exec(u.pathname);
    if (!m || m[1] === 'i') return null;
    return { handle: m[1], id: m[2] };
  } catch {
    return null;
  }
}
