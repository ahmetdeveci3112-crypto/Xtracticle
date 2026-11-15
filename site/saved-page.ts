import { savedText } from '../src/i18n';
import { savedPath } from '../src/lib/ext';
import type { Lang, SitePage } from './blocks';

/**
 * /saved (and /tr/saved, /es/saved, …): the bookmark copies the browser extension keeps in this
 * browser (docs/chrome-extension-plan.md, A5). The React app renders everything (src/components/SavedPage.tsx)
 * from data it gets over the extension bridge; nothing about it is crawlable, so the page is noindex
 * with no static sections.
 *
 * `noAnalytics`: site/render.ts strips GA from this page, and public/_headers gives it a strict CSP whose
 * script hashes are filled in at build time (site/plugin.ts) and checked by scripts/check-dist.mjs.
 */

const LANGS: Lang[] = ['en', 'tr', 'es', 'pt', 'ja', 'zh', 'ar'];

export const savedPages = (): SitePage[] =>
  LANGS.map(lang => {
    const s = savedText[lang];
    const path = savedPath(lang);
    return {
      id: lang === 'en' ? 'saved' : `${lang}-saved`,
      group: 'saved',
      path,
      file: `${path.replace(/^\//, '')}.html`,
      lang,
      noindex: true,
      noAnalytics: true,
      title: s.title,
      description: s.description,
      h1: s.h1,
      sub: s.sub,
      primary: 'md',
      nav: '',
      sections: '',
      faq: [],
    };
  });
