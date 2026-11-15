import { describe, expect, it, vi } from 'vitest';

/** Launch day with both listings: Chrome Web Store and Edge Add-ons. */
const STORE = 'https://chromewebstore.google.com/detail/xtracticle/abcdefghijklmnopabcdefghijklmnop';
const EDGE = 'https://microsoftedge.microsoft.com/addons/detail/hompokahpbdaljejfmjpkemhcdonabla';

vi.mock('../../src/lib/ext', async importOriginal => {
  const real = await importOriginal<typeof import('../../src/lib/ext')>();
  return {
    ...real,
    EXT_STORE_URL: STORE,
    EXT_EDGE_STORE_URL: EDGE,
    extAvailable: (base: string = STORE) => real.extAvailable(base, EDGE),
    chromeListed: (base: string = STORE) => real.chromeListed(base),
    edgeListed: (base: string = EDGE) => real.edgeListed(base),
    storeUrl: (spot: Parameters<typeof real.storeUrl>[0], base: string = STORE) => real.storeUrl(spot, base),
  };
});
const { PAGES } = await import('../../site/pages');
const { renderPage } = await import('../../site/render');
const { extHeroScript } = await import('../../site/ext-home');

const TEMPLATE = '<html lang="en"><head><!--xt:config--><!--xt:head--></head><body><div id="root"><!--xt:shell--></div><!--xt:content--></body></html>';
const UTM = (spot: string) => `utm_source=xtracticle&amp;utm_medium=site&amp;utm_campaign=ext_${spot}`;

describe('with both store listings', () => {
  it('home pages carry both install links (Chrome and Edge) in the section and the hero shell, with UTM tags', () => {
    for (const home of PAGES.filter(p => p.isHome && !p.noindex)) {
      const html = renderPage(TEMPLATE, home);
      expect(html, home.lang).toContain(`href="${STORE}?${UTM('section')}"`);
      expect(html, home.lang).toContain(`href="${EDGE}?${UTM('section')}"`);
      expect(html, home.lang).toContain('xt-ext-install xt-ext-chrome');
      expect(html, home.lang).toContain('xt-ext-install xt-ext-edge');
    }
    const en = renderPage(TEMPLATE, PAGES.find(p => p.isHome && p.lang === 'en')!);
    expect(en).toContain('>Add to Chrome — free</a>');
    expect(en).toContain('>Add to Edge — free</a>');
    expect(en).toContain(`href="${EDGE}?${UTM('hero')}"`);
    const tr = renderPage(TEMPLATE, PAGES.find(p => p.isHome && p.lang === 'tr')!);
    expect(tr).toContain('Edge’e ekle — ücretsiz');
  });

  it('the head script (with the Edge class) is on home and /chrome-extension pages, built for both listings', () => {
    const script = extHeroScript(true, true);
    for (const p of PAGES.filter(p => (p.isHome && !p.noindex) || p.group === 'chrome-extension')) {
      expect(renderPage(TEMPLATE, p), p.path).toContain(script);
    }
  });

  it('the extension pages carry both buttons and say which store each browser uses', () => {
    const ext = PAGES.filter(p => p.group === 'chrome-extension');
    expect(ext).toHaveLength(7);
    for (const p of ext) {
      const html = renderPage(TEMPLATE, p);
      expect(html, p.lang).toContain(`href="${STORE}?${UTM('page')}"`);
      expect(html, p.lang).toContain(`href="${EDGE}?${UTM('page')}"`);
      expect(p.faq.some(f => f.a.includes('Edge')), p.lang).toBe(true);
    }
    const en = ext.find(p => p.lang === 'en')!;
    expect(en.faq.find(f => f.a.includes('Edge'))!.a).toContain('Edge from Microsoft Edge Add-ons');
  });
});
