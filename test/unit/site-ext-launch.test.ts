import { describe, expect, it, vi } from 'vitest';

/** Launch day: the same build with a store URL. Everything turns on from `extAvailable()` alone. */
const STORE = 'https://chromewebstore.google.com/detail/xtracticle/abcdefghijklmnopabcdefghijklmnop';

vi.mock('../../src/lib/ext', async importOriginal => {
  const real = await importOriginal<typeof import('../../src/lib/ext')>();
  return {
    ...real,
    EXT_STORE_URL: STORE,
    extAvailable: (base: string = STORE) => real.extAvailable(base),
    storeUrl: (spot: Parameters<typeof real.storeUrl>[0], base: string = STORE) => real.storeUrl(spot, base),
  };
});

const { PAGES } = await import('../../site/pages');
const { renderPage, renderSitemap } = await import('../../site/render');
const { EXT_PAGE_PATHS } = await import('../../src/lib/ext');

const TEMPLATE = '<html lang="en"><head><!--xt:config--><!--xt:head--></head><body><div id="root"><!--xt:shell--></div><!--xt:content--></body></html>';

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
});
