import { describe, expect, it } from 'vitest';
import { EXT_PAGE_PATHS, EXT_STORE_URL, extAvailable, isDesktopChromium, storeUrl } from '../../src/lib/ext';
import { EXT_HERO_SCRIPT } from '../../site/ext-home';
import { extPages } from '../../site/ext-page';
import { PAGES } from '../../site/pages';
import { renderPage, renderSitemap } from '../../site/render';

/** Before launch (EXT_STORE_URL empty) nothing about the extension may reach the site's pages. */

const TEMPLATE = '<html lang="en"><head><!--xt:config--><!--xt:head--></head><body><div id="root"><!--xt:shell--></div><!--xt:content--></body></html>';
const home = (lang: string) => PAGES.find(p => p.isHome && p.lang === lang)!;

describe('extAvailable', () => {
  it('follows the store URL', () => {
    expect(extAvailable('')).toBe(false);
    expect(extAvailable('chromewebstore.google.com/detail/x')).toBe(false);
    expect(extAvailable('https://chromewebstore.google.com/detail/xtracticle/abc')).toBe(true);
    expect(storeUrl('hero', '')).toBe('');
    expect(storeUrl('hero', 'https://chromewebstore.google.com/detail/x')).toBe(
      'https://chromewebstore.google.com/detail/x?utm_source=xtracticle&utm_medium=site&utm_campaign=ext_hero',
    );
  });

  it('is off in the committed code (launch day = one line in src/lib/ext.ts)', () => {
    expect(EXT_STORE_URL).toBe('');
    expect(extAvailable()).toBe(false);
  });
});

describe('site while the store URL is empty', () => {
  it('has no extension pages, sitemap entries or footer links', () => {
    expect(PAGES.some(p => p.group === 'chrome-extension')).toBe(false);
    const sitemap = renderSitemap();
    for (const path of Object.values(EXT_PAGE_PATHS)) expect(sitemap).not.toContain(`xtracticle.com${path}<`);
    const html = renderPage(TEMPLATE, home('en'));
    for (const path of Object.values(EXT_PAGE_PATHS)) expect(html).not.toContain(`href="${path}"`);
    expect(html).not.toContain('class="xt-ext"');
    expect(html).not.toContain('/video/ext-loop');
  });

  it('keeps the one-line slot in the format grid', () => {
    const html = renderPage(TEMPLATE, home('en'));
    expect(html).toContain('data-xt-ext-cta="home"');
  });
});

describe('home page order (all seven languages)', () => {
  for (const lang of ['en', 'tr', 'es', 'pt', 'ja', 'zh', 'ar']) {
    it(lang, () => {
      const html = renderPage(TEMPLATE, home(lang));
      const at = (needle: string) => {
        const i = html.indexOf(needle);
        expect(i, needle).toBeGreaterThan(-1);
        return i;
      };
      const content = at('class="xt-content"');
      const grid = at('class="xt-grid"');
      const pro = at('class="xt-home-pro"');
      const faq = at('<details>');
      const footer = at('class="xt-footer"');
      expect(content).toBeLessThan(grid);
      // Pro comes after the grid and the section that follows it, never before the free tool's sections.
      const sectionsBeforePro = html.slice(content, pro).split('</section>').length - 1;
      expect(sectionsBeforePro).toBe(3);
      expect(grid).toBeLessThan(pro);
      expect(pro).toBeLessThan(faq);
      const promo = html.indexOf('class="xt-promo"');
      if (promo > -1) expect(promo).toBeGreaterThan(faq);
      expect(faq).toBeLessThan(footer);
    });
  }
});

describe('/chrome-extension pages (built only after launch)', () => {
  const pages = extPages();

  it('one per language, linked as a group, on the agreed paths', () => {
    expect(pages.map(p => p.lang).sort()).toEqual(['ar', 'en', 'es', 'ja', 'pt', 'tr', 'zh']);
    expect(new Set(pages.map(p => p.group))).toEqual(new Set(['chrome-extension']));
    for (const p of pages) {
      expect(p.path).toBe(EXT_PAGE_PATHS[p.lang]);
      expect(p.file).toBe(`${p.path.slice(1)}.html`);
      expect(p.noindex).toBeFalsy();
      expect(PAGES.some(q => q.path === p.path)).toBe(false); // no clash with an existing page
    }
    expect(EXT_PAGE_PATHS.tr).toBe('/tr/chrome-eklentisi');
  });

  it('titles fit in 60 characters, descriptions in 155', () => {
    for (const p of pages) {
      expect(p.title.length, `${p.lang} title: ${p.title}`).toBeLessThanOrEqual(60);
      expect(p.description.length, `${p.lang} description`).toBeLessThanOrEqual(155);
      expect(p.description.length).toBeGreaterThan(p.lang === 'ja' || p.lang === 'zh' ? 60 : 110);
    }
  });

  it('links privacy, Pro and the saved page in the page language, with screenshots of fixed size', () => {
    for (const p of pages) {
      expect(p.sections).toMatch(/href="\/(\w\w\/)?(privacy|gizlilik|privacidad|privacidade)"/);
      expect(p.sections).toContain(`href="${p.lang === 'en' ? '/pro' : `/${p.lang}/pro`}"`);
      expect(p.sections).toContain(`href="${p.lang === 'en' ? '/saved' : `/${p.lang}/saved`}"`);
      expect(p.sections).not.toMatch(/\{(pro|privacy|saved)\}/);
      const imgs = p.sections.match(/<img [^>]+>/g) || [];
      expect(imgs.length).toBe(5);
      for (const img of imgs) expect(img).toMatch(/width="1280" height="800" alt="[^"]+" loading="lazy"/);
      expect(p.sections).toMatch(/<video data-xt-loop muted loop playsinline controls preload="none" poster="[^"]+" width="1280" height="720"/);
      expect(p.faq.length).toBeGreaterThanOrEqual(6);
    }
  });
});

describe('hero line script (runs before first paint)', () => {
  const run = (ua: string, uaData?: unknown, opts: { installed?: boolean; quietUntil?: number; noStorage?: boolean } = {}) => {
    const classes = new Set<string>();
    const document = { documentElement: { dataset: opts.installed ? { xtExt: '1.0.0' } : {}, classList: { add: (c: string) => classes.add(c) } } };
    const localStorage = {
      getItem: () => {
        if (opts.noStorage) throw new Error('blocked');
        return opts.quietUntil ? String(opts.quietUntil) : null;
      },
    };
    new Function('document', 'navigator', 'localStorage', EXT_HERO_SCRIPT)(document, { userAgent: ua, userAgentData: uaData }, localStorage);
    return classes.has('xt-ext-on');
  };
  const UAS: [string, unknown][] = [
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', undefined],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0', undefined],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:132.0) Gecko/20100101 Firefox/132.0', undefined],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', undefined],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36', undefined],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1', undefined],
    ['anything', { mobile: false, brands: [{ brand: 'Brave' }] }],
    ['anything', { mobile: true, brands: [{ brand: 'Google Chrome' }] }],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36', { mobile: false, brands: [{ brand: 'Not?A_Brand' }] }],
  ];
  it('agrees with isDesktopChromium', () => {
    for (const [ua, data] of UAS) expect(run(ua, data), ua).toBe(isDesktopChromium(ua, data as never));
  });
  it('respects "Not now" and blocked storage like extCtaAllowed, and always shows for an installed extension', () => {
    const chrome = UAS[0][0];
    expect(run(chrome, undefined, { quietUntil: Date.now() + 1e6 })).toBe(false);
    expect(run(chrome, undefined, { quietUntil: Date.now() - 1e6 })).toBe(true);
    expect(run(chrome, undefined, { noStorage: true })).toBe(false);
    expect(run(UAS[2][0], undefined, { installed: true })).toBe(true);
  });
});
