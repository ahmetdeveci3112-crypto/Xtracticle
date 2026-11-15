import { describe, expect, it, vi } from 'vitest';

/** Only the Edge Add-ons listing exists: Chrome visitors get no button, and the copy says Edge only. */
const EDGE = 'https://microsoftedge.microsoft.com/addons/detail/hompokahpbdaljejfmjpkemhcdonabla';

vi.mock('../../src/lib/ext', async importOriginal => {
  const real = await importOriginal<typeof import('../../src/lib/ext')>();
  return {
    ...real,
    EXT_STORE_URL: '',
    EXT_EDGE_STORE_URL: EDGE,
    extAvailable: () => true,
    chromeListed: () => false,
    edgeListed: () => true,
    storeUrl: (spot: Parameters<typeof real.storeUrl>[0], base: string = '') => real.storeUrl(spot, base),
  };
});

const { PAGES } = await import('../../site/pages');
const { renderPage } = await import('../../site/render');
const { extHeroScript } = await import('../../site/ext-home');

const TEMPLATE = '<html lang="en"><head><!--xt:config--><!--xt:head--></head><body><div id="root"><!--xt:shell--></div><!--xt:content--></body></html>';

describe('with only the Edge Add-ons listing', () => {
  it('home pages have the Edge button only, an Edge-only note and an Edge-only head script', () => {
    const html = renderPage(TEMPLATE, PAGES.find(p => p.isHome && p.lang === 'en')!);
    expect(html).toContain('xt-ext-edge');
    expect(html).not.toContain('xt-ext-chrome');
    expect(html).not.toContain('chromewebstore');
    expect(html).toContain('For Microsoft Edge on a computer.');
    expect(html).not.toContain('Chrome, Edge, Brave and Opera');
    expect(html).toContain(extHeroScript(false, true));
  });

  it('the extension page says Edge only in the steps, the call and the FAQ', () => {
    const p = PAGES.find(x => x.group === 'chrome-extension' && x.lang === 'en')!;
    const html = renderPage(TEMPLATE, p);
    expect(html).toContain('<strong>Add the extension</strong> to Microsoft Edge');
    expect(html).toContain('Works in Microsoft Edge on a computer.');
    expect(html).not.toContain('Chrome, Edge, Brave');
    expect(p.faq.find(f => f.a.includes('Edge'))!.a).toMatch(/^Microsoft Edge on a computer/);
  });
});
