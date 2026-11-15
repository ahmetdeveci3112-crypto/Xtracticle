import { describe, expect, it, vi } from 'vitest';
import { message, SAVED_PAGE_SIZE, type ExtMessage, type SavedSummary } from '../../src/shared/bridge';
import {
  BridgeTimeout,
  createBridgeClient,
  isDesktopChromium,
  listAllSaved,
  parseDlHash,
  parseSavedHash,
  savedPath,
  storeFor,
  storeUrl,
} from '../../src/lib/ext';

const ORIGIN = 'https://xtracticle.com';

/** A window with a fake extension behind it: `answer` maps each site request to the extension's reply. */
function fakeWindow(answer?: (msg: any) => unknown) {
  const listeners = new Set<(e: any) => void>();
  const sent: any[] = [];
  const win: any = {
    addEventListener: (_t: string, fn: (e: any) => void) => listeners.add(fn),
    removeEventListener: (_t: string, fn: (e: any) => void) => listeners.delete(fn),
    postMessage: (data: any, target: string) => {
      sent.push({ data, target });
      const reply = answer?.(data);
      if (reply) queueMicrotask(() => emit(reply));
    },
  };
  const emit = (data: unknown, origin = ORIGIN, source: unknown = win) => listeners.forEach(fn => fn({ data, origin, source }));
  return { win, sent, emit, listeners };
}

const summary = (i: number): SavedSummary => ({ id: String(1000 + i), author: 'jack', title: `Post ${i}`, date: '2026-01-01T00:00:00Z', state: 'active' });

describe('bridge client', () => {
  it('lists, gets and deletes with the shared protocol', async () => {
    const { win, sent } = fakeWindow(m => {
      if (m.type === 'xt:saved:list') return message<ExtMessage>({ type: 'xt:saved:page', req: m.req, items: [summary(1)], next: null, total: 1 });
      if (m.type === 'xt:saved:get') return message<ExtMessage>({ type: 'xt:saved:post', req: m.req, id: m.id, post: { id: m.id, text: 'hi' } });
      return null;
    });
    const c = createBridgeClient({ win, origin: ORIGIN });
    const page = await c.listSaved(0, 'removed');
    expect(page).toEqual({ items: [summary(1)], next: null, total: 1 });
    expect(sent[0].data).toMatchObject({ xt: 1, type: 'xt:saved:list', cursor: 0, filter: 'removed' });
    expect(sent[0].target).toBe(ORIGIN);
    expect(sent[0].data.req).toMatch(/^[A-Za-z0-9_-]{1,40}$/);
    expect(await c.getSaved('1001')).toEqual({ id: '1001', text: 'hi' });
    c.deleteSaved(['1001', '1002']);
    expect(sent.at(-1).data).toMatchObject({ type: 'xt:saved:delete', ids: ['1001', '1002'] });
    c.deleteSaved([]);
    expect(sent).toHaveLength(3);
    c.close();
  });

  it('ignores answers from another origin, another window, or with a wrong shape', async () => {
    vi.useFakeTimers();
    const { win, emit } = fakeWindow();
    const c = createBridgeClient({ win, origin: ORIGIN, timeoutMs: 1000 });
    const p = c.listSaved(0, 'all');
    const good = (r: string) => message<ExtMessage>({ type: 'xt:saved:page', req: r, items: [], next: null, total: 0 });
    // We do not know the req id here; any answer with a different id must be ignored as well.
    emit(good('other'), ORIGIN);
    emit(good('other'), 'https://evil.example');
    emit(good('other'), ORIGIN, {});
    emit({ xt: 1, type: 'xt:saved:page', req: 'x', items: 'nope' });
    vi.advanceTimersByTime(1001);
    await expect(p).rejects.toBeInstanceOf(BridgeTimeout);
    c.close();
    vi.useRealTimers();
  });

  it('takes the answer that matches the request id only', async () => {
    const replies: any[] = [];
    const { win, emit } = fakeWindow(m => {
      replies.push(m);
      return null;
    });
    const c = createBridgeClient({ win, origin: ORIGIN });
    const p = c.getSaved('42');
    const req = replies[0].req;
    emit(message<ExtMessage>({ type: 'xt:saved:post', req: 'nope', id: '42', post: { wrong: true } }));
    emit(message<ExtMessage>({ type: 'xt:saved:page', req, items: [], next: null, total: 0 }));
    emit(message<ExtMessage>({ type: 'xt:saved:post', req, id: '42', post: { id: '42' } }));
    await expect(p).resolves.toEqual({ id: '42' });
    c.close();
  });

  it('keeps the latest xt:status and tells listeners', () => {
    const { win, emit } = fakeWindow();
    const c = createBridgeClient({ win, origin: ORIGIN });
    const seen: number[] = [];
    const off = c.onStatus(s => seen.push(s.unavailable));
    emit(message<ExtMessage>({ type: 'xt:status', bookmarks: 250, unavailable: 3, lastSyncAt: null }));
    emit(message<ExtMessage>({ type: 'xt:status', bookmarks: 250, unavailable: 4, lastSyncAt: '2026-11-15T10:00:00Z' }), 'https://evil.example');
    expect(seen).toEqual([3]);
    expect(c.status()?.bookmarks).toBe(250);
    off();
    emit(message<ExtMessage>({ type: 'xt:status', bookmarks: 1, unavailable: 9, lastSyncAt: null }));
    expect(seen).toEqual([3]);
    c.close();
  });

  it('close() stops listening and rejects what is pending', async () => {
    const { win, listeners } = fakeWindow();
    const c = createBridgeClient({ win, origin: ORIGIN });
    const p = c.getSaved('1');
    c.close();
    await expect(p).rejects.toThrow('closed');
    expect(listeners.size).toBe(0);
  });
});

describe('listAllSaved', () => {
  it('walks 200-item pages until next is null', async () => {
    const all = Array.from({ length: 450 }, (_, i) => summary(i));
    const cursors: number[] = [];
    const client = {
      listSaved: async (cursor: number) => {
        cursors.push(cursor);
        const items = all.slice(cursor, cursor + SAVED_PAGE_SIZE);
        const next = cursor + SAVED_PAGE_SIZE < all.length ? cursor + SAVED_PAGE_SIZE : null;
        return { items, next, total: all.length };
      },
    };
    const sizes: number[] = [];
    const out = await listAllSaved(client, 'all', items => sizes.push(items.length));
    expect(out).toHaveLength(450);
    expect(cursors).toEqual([0, 200, 400]);
    expect(sizes).toEqual([200, 400, 450]);
  });

  it('stops on a cursor that does not move and drops duplicates', async () => {
    let calls = 0;
    const client = { listSaved: async () => (calls++, { items: [summary(1), summary(1)], next: 0, total: 2 }) };
    const out = await listAllSaved(client, 'all');
    expect(calls).toBe(1);
    expect(out).toHaveLength(1);
  });
});

describe('#dl= and #id= deep links', () => {
  it('parses the four formats only', () => {
    expect(parseDlHash('#dl=pdf')).toBe('pdf');
    expect(parseDlHash('#dl=EPUB')).toBe('epub');
    expect(parseDlHash('#dl=zip')).toBe('zip');
    expect(parseDlHash('#dl=md')).toBe('md');
    expect(parseDlHash('#dl=txt')).toBeNull();
    expect(parseDlHash('#dl=pdf&x=1')).toBeNull();
    expect(parseDlHash('dl=pdf')).toBeNull();
    expect(parseDlHash('')).toBeNull();
  });
  it('parses a saved post id', () => {
    expect(parseSavedHash('#id=1765884209527394325')).toBe('1765884209527394325');
    expect(parseSavedHash('#id=abc')).toBeNull();
    expect(parseSavedHash('#id=1;alert(1)')).toBeNull();
  });
});

describe('browser detection', () => {
  const UA = {
    chromeMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    edgeWin: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0',
    operaWin: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 OPR/126.0.0.0',
    firefox: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.1 Safari/605.1.15',
    chromeAndroid: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36',
    chromeIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 19_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/142.0.0.0 Mobile/15E148 Safari/604.1',
    ipadSafari: 'Mozilla/5.0 (iPad; CPU OS 19_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.1 Mobile/15E148 Safari/604.1',
  };
  it('shows the call on desktop Chrome, Edge, Opera (and Brave via its brand)', () => {
    expect(isDesktopChromium(UA.chromeMac)).toBe(true);
    expect(isDesktopChromium(UA.edgeWin)).toBe(true);
    expect(isDesktopChromium(UA.operaWin)).toBe(true);
    expect(isDesktopChromium(UA.chromeMac, { mobile: false, brands: [{ brand: 'Brave' }, { brand: 'Chromium' }] })).toBe(true);
  });
  it('hides it on Firefox, Safari and every phone or tablet', () => {
    expect(isDesktopChromium(UA.firefox)).toBe(false);
    expect(isDesktopChromium(UA.safari)).toBe(false);
    expect(isDesktopChromium(UA.chromeAndroid)).toBe(false);
    expect(isDesktopChromium(UA.chromeAndroid, { mobile: true, brands: [{ brand: 'Google Chrome' }] })).toBe(false);
    expect(isDesktopChromium(UA.chromeIos)).toBe(false);
    expect(isDesktopChromium(UA.ipadSafari)).toBe(false);
  });
});

describe('which store a visitor gets', () => {
  const CH = 'https://chromewebstore.google.com/detail/abc';
  const ED = 'https://microsoftedge.microsoft.com/addons/detail/def?x=1';
  const chrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36';
  const edge = chrome.replace('Safari/537.36', 'Safari/537.36 Edg/142.0.0.0');
  const opera = chrome.replace('Safari/537.36', 'Safari/537.36 OPR/126.0.0.0');
  const firefox = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0';
  const phone = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36 EdgA/142.0.0.0';
  const brave = { mobile: false, brands: [{ brand: 'Brave' }, { brand: 'Chromium' }] };

  it('Edge → Edge Add-ons when it has a listing, with UTM tags kept (and & after an existing ?)', () => {
    expect(storeFor('hero', edge, undefined, CH, ED)).toEqual({
      browser: 'edge',
      href: `${ED}&utm_source=xtracticle&utm_medium=site&utm_campaign=ext_hero`,
    });
    expect(storeFor('page', chrome, { brands: [{ brand: 'Microsoft Edge' }], mobile: false }, CH, ED)?.browser).toBe('edge');
  });
  it('Chrome, Brave, Opera → Chrome Web Store', () => {
    for (const [ua, data] of [[chrome], [opera], [chrome, brave]] as const) {
      expect(storeFor('pro', ua, data, CH, ED)).toEqual({
        browser: 'chrome',
        href: `${CH}?utm_source=xtracticle&utm_medium=site&utm_campaign=ext_pro`,
      });
    }
  });
  it('Edge falls back to the Chrome Web Store while there is no Edge listing', () => {
    expect(storeFor('home', edge, undefined, CH, '')?.browser).toBe('chrome');
  });
  it('a browser whose store has no listing gets nothing (Chrome while only the Edge listing exists)', () => {
    expect(storeFor('home', chrome, undefined, '', ED)).toBeNull();
    expect(storeFor('home', opera, undefined, '', ED)).toBeNull();
    expect(storeFor('home', edge, undefined, '', ED)?.browser).toBe('edge');
  });
  it('nothing leaks while both listings are empty', () => {
    for (const ua of [chrome, edge, opera, firefox, phone]) expect(storeFor('home', ua, undefined, '', '')).toBeNull();
  });
  it('Firefox, Safari and phones (including mobile Edge) get nothing', () => {
    for (const ua of [firefox, phone]) expect(storeFor('home', ua, undefined, CH, ED)).toBeNull();
    expect(storeFor('home', chrome, { mobile: true, brands: [{ brand: 'Microsoft Edge' }] }, CH, ED)).toBeNull();
  });
});

describe('links', () => {
  it('store URL is empty until there is a listing, then carries UTM tags', () => {
    expect(storeUrl('home')).toBe('');
    expect(storeUrl('pro', 'https://chromewebstore.google.com/detail/abc')).toBe(
      'https://chromewebstore.google.com/detail/abc?utm_source=xtracticle&utm_medium=site&utm_campaign=ext_pro',
    );
  });
  it('saved path follows the language prefix rule', () => {
    expect(savedPath('en')).toBe('/saved');
    expect(savedPath('tr')).toBe('/tr/saved');
  });
});
