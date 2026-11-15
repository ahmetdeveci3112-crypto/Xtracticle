import { describe, expect, it } from 'vitest';
import { isAllowed } from '../../extension/src/bg/access';
import { MSG_TYPES } from '../../extension/src/messages';

const EXT = 'abcdefghijklmnopabcdefghijklmnop';
const SITE = 'https://xtracticle.com';
const s = (url: string, id = EXT) => ({ id, url, tab: {} });

describe('who may send what to the service worker', () => {
  it('the popup may send everything', () => {
    for (const t of MSG_TYPES) expect(isAllowed(t, { id: EXT, url: `chrome-extension://${EXT}/popup.html` }, EXT, SITE)).toBe(true);
  });

  it('content.js on x.com: capture and read-only status', () => {
    const allowed = MSG_TYPES.filter(t => isAllowed(t, s('https://x.com/i/bookmarks'), EXT, SITE));
    expect(allowed.sort()).toEqual(['capture:posts', 'pro:get', 'pro:refresh', 'saved:status', 'settings:get']);
    expect(isAllowed('capture:posts', s('https://twitter.com/home'), EXT, SITE)).toBe(true);
  });

  it('the site bridge: Pro status anywhere, archive data on /saved only', () => {
    expect(MSG_TYPES.filter(t => isAllowed(t, s(`${SITE}/pro`), EXT, SITE)).sort()).toEqual(['pro:get', 'pro:refresh', 'saved:status']);
    expect(MSG_TYPES.filter(t => isAllowed(t, s(`${SITE}/tr/saved#id=1`), EXT, SITE)).sort()).toEqual(['pro:get', 'pro:refresh', 'saved:delete', 'saved:get', 'saved:list', 'saved:status']);
    expect(isAllowed('pro:activate', s(`${SITE}/saved`), EXT, SITE)).toBe(false);
    expect(isAllowed('saved:export', s(`${SITE}/saved`), EXT, SITE)).toBe(false);
    expect(isAllowed('saved:list', s(`${SITE}/savedx`), EXT, SITE)).toBe(false);
  });

  it('anything else is refused', () => {
    expect(isAllowed('pro:get', s('https://x.com/home', 'otherextension'), EXT, SITE)).toBe(false);
    expect(isAllowed('pro:get', s('https://evil.example/saved'), EXT, SITE)).toBe(false);
    expect(isAllowed('pro:get', s('http://x.com/home'), EXT, SITE)).toBe(false);
    expect(isAllowed('pro:get', s(`chrome-extension://${'z'.repeat(32)}/popup.html`), EXT, SITE)).toBe(false);
    expect(isAllowed('pro:get', { id: EXT }, EXT, SITE)).toBe(false);
    expect(isAllowed('pro:get', s('not a url'), EXT, SITE)).toBe(false);
  });
});
