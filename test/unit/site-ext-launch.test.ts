import { describe, expect, it, vi } from 'vitest';

/** Launch day: the same build with a store URL. Everything turns on from `extAvailable()` alone. */
const STORE = 'https://chromewebstore.google.com/detail/xtracticle/abcdefghijklmnopabcdefghijklmnop';

vi.mock('../../src/lib/ext', async importOriginal => {
  const real = await importOriginal<typeof import('../../src/lib/ext')>();
  return {
    ...real,
    EXT_STORE_URL: STORE,
    extAvailable: (base: string = STORE) => real.extAvailable(base, ''),
    chromeListed: (base: string = STORE) => real.chromeListed(base),
    storeUrl: (spot: Parameters<typeof real.storeUrl>[0], base: string = STORE) => real.storeUrl(spot, base),
  };
});

const { PAGES } = await import('../../site/pages');
const { renderPage, renderSitemap } = await import('../../site/render');
const { EXT_PAGE_PATHS } = await import('../../src/lib/ext');

const TEMPLATE = '<html lang="en"><head><!--xt:config--><!--xt:head--></head><body><div id="root"><!--xt:shell--></div><!--xt:content--></body></html>';

describe('with only the Chrome Web Store listing', () => {
  it('has no Edge button anywhere and keeps the Chrome-family browser note', () => {
    const home = renderPage(TEMPLATE, PAGES.find(p => p.isHome && p.lang === 'en')!);
    expect(home).not.toContain('xt-ext-edge');
    expect(home).toContain('For Chrome, Edge, Brave and Opera on a computer.');
    expect(home).toContain('class="xt-btn xt-ext-install xt-ext-chrome"');
    // the head script decides on Chrome only: no xt-edge class
    expect(home).toContain('C=true,E=false');
    const ext = PAGES.find(p => p.group === 'chrome-extension' && p.lang === 'en')!;
    expect(renderPage(TEMPLATE, ext)).toContain('C=true,E=false');
  });
});

describe('with a store URL', () => {
  it('builds the seven extension pages, in the sitemap and the footer', () => {
    const ext = PAGES.filter(p => p.group === 'chrome-extension');
    expect(ext).toHaveLength(7);
    const sitemap = renderSitemap();
    for (const p of ext) expect(sitemap).toContain(`<loc>https://xtracticle.com${p.path}</loc>`);
    const en = renderPage(TEMPLATE, ext.find(p => p.lang === 'en')!);
    expect(en).toContain('hreflang="tr" href="https://xtracticle.com/tr/chrome-eklentisi"');
    expect(en).toContain('<meta name="robots" content="index, follow');
    expect(en).toContain(`${STORE}?utm_source=xtracticle&amp;utm_medium=site&amp;utm_campaign=ext_page`);
    const home = renderPage(TEMPLATE, PAGES.find(p => p.isHome && p.lang === 'tr')!);
    expect(home).toContain(`href="${EXT_PAGE_PATHS.tr}"`);
  });

  it('puts the extension section first on every home page and drops the grid one-liner', () => {
    for (const home of PAGES.filter(p => p.isHome && !p.noindex)) {
      const html = renderPage(TEMPLATE, home);
      const content = html.indexOf('class="xt-content"');
      const ext = html.indexOf('<section class="xt-ext"');
      expect(ext, home.lang).toBeGreaterThan(content);
      expect(html.slice(content, ext)).not.toContain('<section');
      expect(html).not.toContain('data-xt-ext-cta="home"');
      expect(html).toContain('utm_campaign=ext_section');
      expect(html).toContain('class="xt-btn xt-ext-installed"');
    }
  });

  it('adds the extension line and FAQ entry to /pro in all seven languages, linking the language page', () => {
    const pro = PAGES.filter(p => p.path === '/pro' || /^\/[a-z]{2}\/pro$/.test(p.path));
    expect(pro).toHaveLength(7);
    for (const p of pro) {
      const html = renderPage(TEMPLATE, p);
      const lang = p.lang as keyof typeof EXT_PAGE_PATHS;
      expect(html, lang).toContain(`<li><strong><a href="${EXT_PAGE_PATHS[lang]}">`);
      expect(p.faq!.some(f => /Chrome/.test(f.q)), lang).toBe(true);
      // the existing install-call slot is untouched
      expect(html).toContain('data-xt-ext-cta="pro"');
    }
  });
});
