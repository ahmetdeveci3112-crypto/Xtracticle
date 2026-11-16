import { describe, expect, it, vi } from 'vitest';

/**
 * Pre-launch state: both store URLs empty. The committed URLs are no longer empty (Edge Add-ons is live),
 * so this file pins the empty state to keep proving that nothing about the extension leaks while there
 * is no listing.
 */
vi.mock('../../src/lib/ext', async importOriginal => {
  const real = await importOriginal<typeof import('../../src/lib/ext')>();
  return {
    ...real,
    EXT_STORE_URL: '',
    EXT_EDGE_STORE_URL: '',
    extAvailable: (chrome: string = '', edge: string = '') => real.extAvailable(chrome, edge),
    chromeListed: (chrome: string = '') => real.chromeListed(chrome),
    edgeListed: (edge: string = '') => real.edgeListed(edge),
    storeUrl: (spot: Parameters<typeof real.storeUrl>[0], base: string = '') => real.storeUrl(spot, base),
  };
});

import { EXT_EDGE_STORE_URL, EXT_PAGE_PATHS, EXT_STORE_URL, extAvailable, isDesktopChromium, isEdge, storeFor, storeUrl } from '../../src/lib/ext';
import { extHeroScript } from '../../site/ext-home';
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

  it('is on when either store has a listing', () => {
    const chrome = 'https://chromewebstore.google.com/detail/x';
    const edge = 'https://microsoftedge.microsoft.com/addons/detail/y';
    expect(extAvailable('', '')).toBe(false);
    expect(extAvailable(chrome, '')).toBe(true);
    expect(extAvailable('', edge)).toBe(true);
    expect(extAvailable(chrome, edge)).toBe(true);
    expect(extAvailable('', 'edge.example/x')).toBe(false);
  });

  it('is off while both store URLs are empty', () => {
    expect(EXT_STORE_URL).toBe('');
    expect(EXT_EDGE_STORE_URL).toBe('');
    expect(extAvailable()).toBe(false);
  });

  it('committed code: Edge Add-ons is live, Chrome Web Store not yet (launch day = one line in src/lib/ext.ts)', async () => {
    const real = await vi.importActual<typeof import('../../src/lib/ext')>('../../src/lib/ext');
    expect(real.EXT_STORE_URL).toBe('');
    expect(real.EXT_EDGE_STORE_URL).toBe('https://microsoftedge.microsoft.com/addons/detail/hompokahpbdaljejfmjpkemhcdonabla');
    expect(real.extAvailable()).toBe(true);
    expect(real.chromeListed()).toBe(false);
    expect(real.extAvailable('', '')).toBe(false);
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

describe('head script (runs before first paint)', () => {
  const CHROME_URL = 'https://chromewebstore.google.com/detail/x';
  const EDGE_URL = 'https://microsoftedge.microsoft.com/addons/detail/y';
  const run = (chrome: boolean, edge: boolean, ua: string, uaData?: unknown, opts: { installed?: boolean; quietUntil?: number; noStorage?: boolean } = {}) => {
    const classes = new Set<string>();
    const document = { documentElement: { dataset: opts.installed ? { xtExt: '1.0.0' } : {}, classList: { add: (c: string) => classes.add(c) } } };
    const localStorage = {
      getItem: () => {
        if (opts.noStorage) throw new Error('blocked');
        return opts.quietUntil ? String(opts.quietUntil) : null;
      },
    };
    new Function('document', 'navigator', 'localStorage', extHeroScript(chrome, edge))(document, { userAgent: ua, userAgentData: uaData }, localStorage);
    return { on: classes.has('xt-ext-on'), edge: classes.has('xt-edge') };
  };
  const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
  const EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0';
  const FIREFOX = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:132.0) Gecko/20100101 Firefox/132.0';
  const UAS: [string, unknown][] = [
    [CHROME, undefined],
    [EDGE, undefined],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0', undefined],
    [CHROME, { mobile: false, brands: [{ brand: 'Brave' }, { brand: 'Chromium' }] }],
    [CHROME, { mobile: false, brands: [{ brand: 'Microsoft Edge' }, { brand: 'Chromium' }] }],
    [FIREFOX, undefined],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15', undefined],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36', undefined],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 EdgA/130.0.0.0', undefined],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1', undefined],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/130.0 Mobile/15E148 Safari/604.1', undefined],
    ['anything', { mobile: false, brands: [{ brand: 'Brave' }] }],
    ['anything', { mobile: true, brands: [{ brand: 'Google Chrome' }] }],
    ['anything', { mobile: true, brands: [{ brand: 'Microsoft Edge' }] }],
    ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36', { mobile: false, brands: [{ brand: 'Not?A_Brand' }] }],
  ];
  const LISTINGS: [string, string][] = [['', ''], [CHROME_URL, ''], ['', EDGE_URL], [CHROME_URL, EDGE_URL]];

  it('makes the same decision as storeFor for every browser and listing combination', () => {
    for (const [chromeUrl, edgeUrl] of LISTINGS) {
      for (const [ua, data] of UAS) {
        const store = storeFor('hero', ua, data as never, chromeUrl, edgeUrl);
        const r = run(!!chromeUrl, !!edgeUrl, ua, data);
        const label = `${chromeUrl ? 'C' : '-'}${edgeUrl ? 'E' : '-'} ${ua}`;
        expect(r.on, label).toBe(store !== null);
        expect(r.edge, label).toBe(store?.browser === 'edge');
      }
    }
  });

  it('is the old Chrome-only behaviour while only the Chrome listing exists', () => {
    for (const [ua, data] of UAS) expect(run(true, false, ua, data).on, ua).toBe(isDesktopChromium(ua, data as never));
    expect(run(true, false, EDGE).edge).toBe(false);
  });

  it('Edge gets the Edge button only with an Edge listing; a Chrome visitor never does', () => {
    expect(run(true, true, EDGE)).toEqual({ on: true, edge: true });
    expect(run(true, false, EDGE)).toEqual({ on: true, edge: false });
    expect(run(true, true, CHROME)).toEqual({ on: true, edge: false });
    expect(run(false, true, CHROME)).toEqual({ on: false, edge: false });
    expect(run(false, true, EDGE)).toEqual({ on: true, edge: true });
    expect(run(false, false, CHROME)).toEqual({ on: false, edge: false });
  });

  it('isEdge: Edg/ in the user agent or the brand; mobile Edge has neither Edg/ nor desktop Chromium', () => {
    expect(isEdge(EDGE)).toBe(true);
    expect(isEdge(CHROME)).toBe(false);
    expect(isEdge(CHROME, { brands: [{ brand: 'Microsoft Edge' }] })).toBe(true);
    expect(isEdge('x EdgA/130.0.0.0')).toBe(false);
    expect(isEdge('x EdgiOS/130.0')).toBe(false);
  });

  it('respects "Not now" and blocked storage, and always shows for an installed extension', () => {
    expect(run(true, false, CHROME, undefined, { quietUntil: Date.now() + 1e6 }).on).toBe(false);
    expect(run(true, false, CHROME, undefined, { quietUntil: Date.now() - 1e6 }).on).toBe(true);
    expect(run(true, false, CHROME, undefined, { noStorage: true }).on).toBe(false);
    expect(run(true, false, FIREFOX, undefined, { installed: true }).on).toBe(true);
    // the store swap is not tied to "Not now": the extension pages' buttons follow it too
    expect(run(true, true, EDGE, undefined, { quietUntil: Date.now() + 1e6 })).toEqual({ on: false, edge: true });
  });
});

describe('before launch (empty EXT_STORE_URL): /pro', () => {
  it('has no extension line or FAQ entry in any language', () => {
    const pro = PAGES.filter(p => p.path === '/pro' || /^\/[a-z]{2}\/pro$/.test(p.path));
    expect(pro).toHaveLength(7);
    for (const p of pro) {
      const html = renderPage(TEMPLATE, p);
      for (const path of Object.values(EXT_PAGE_PATHS)) expect(html, p.lang).not.toContain(`href="${path}"`);
      expect(p.faq!.some(f => /Chrome/.test(f.q)), p.lang).toBe(false);
    }
  });
});
