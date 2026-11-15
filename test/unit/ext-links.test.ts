/** Links the extension opens on xtracticle.com (extension/src/links.ts) and its language choice (lang.ts). */
import { describe, expect, it } from 'vitest';
import { FINDER_PATHS, finderUrl, parseStatusUrl, proUrl, savedUrl, statusUrl } from '../../extension/src/links';
import { fill, mapUiLang, pickLang } from '../../extension/src/lang';
import { LANGS } from '../../src/shared/bridge';
import { parseDlHash, parseSavedHash, savedPath } from '../../src/lib/ext';
import { extText } from '../../src/i18n';

const B = 'https://xtracticle.com';
const UTM = (m: string) => `utm_source=extension&utm_medium=${m}&utm_campaign=credit`;

describe('site links', () => {
  it('post page: no language prefix (the site has none for posts), #dl= for the site to download', () => {
    const u = statusUrl(B, 'jack', '20', 'save_menu', 'pdf');
    expect(u).toBe(`${B}/jack/status/20?${UTM('save_menu')}#dl=pdf`);
    expect(parseDlHash(new URL(u).hash)).toBe('pdf');
    expect(statusUrl(`${B}/`, 'jack', '20', 'save_menu')).toBe(`${B}/jack/status/20?${UTM('save_menu')}`);
    expect(statusUrl(B, 'bad handle!', 'x', 'save_menu')).toBe(`${B}/i/status/0?${UTM('save_menu')}`);
  });

  it('/saved in every language, #id= the site reads', () => {
    for (const l of LANGS) {
      const u = new URL(savedUrl(B, l, 'popup', '123'));
      expect(u.pathname).toBe(savedPath(l));
      expect(parseSavedHash(u.hash)).toBe('123');
      expect(u.searchParams.get('utm_source')).toBe('extension');
    }
    expect(savedUrl(B, 'tr', 'bookmarks_panel')).toBe(`${B}/tr/saved?${UTM('bookmarks_panel')}`);
    expect(savedUrl(B, 'en', 'popup', 'evil')).toBe(`${B}/saved?${UTM('popup')}`);
  });

  it('/pro and the finder per language', () => {
    expect(proUrl(B, 'en', 'popup')).toBe(`${B}/pro?${UTM('popup')}`);
    expect(proUrl(B, 'ja', 'popup')).toBe(`${B}/ja/pro?${UTM('popup')}`);
    expect(finderUrl(B, 'en', 'jack', 'gone_panel')).toBe(`${B}/deleted-tweet-finder?link=%40jack&${UTM('gone_panel')}`);
    expect(finderUrl(B, 'tr', 'jack', 'gone_panel')).toBe(`${B}/tr/silinen-tweetleri-bulma?link=%40jack&${UTM('gone_panel')}`);
    expect(new URL(finderUrl(B, 'es', 'jack', 'gone_panel')).searchParams.get('link')).toBe('@jack');
    expect(finderUrl(B, 'en', 'no/pe', 'gone_panel')).toBe(`${B}/deleted-tweet-finder?${UTM('gone_panel')}`);
    expect(Object.keys(FINDER_PATHS).sort()).toEqual([...LANGS].sort());
  });

  it('x.com post URLs', () => {
    expect(parseStatusUrl('https://x.com/jack/status/20')).toEqual({ handle: 'jack', id: '20' });
    expect(parseStatusUrl('https://twitter.com/jack/status/20/photo/1')).toEqual({ handle: 'jack', id: '20' });
    expect(parseStatusUrl('/jack/status/20?s=1')).toEqual({ handle: 'jack', id: '20' });
    expect(parseStatusUrl('https://mobile.x.com/jack/statuses/20')).toEqual({ handle: 'jack', id: '20' });
    expect(parseStatusUrl('https://x.com/i/bookmarks')).toBeNull();
    expect(parseStatusUrl('https://x.com/i/status/20')).toBeNull();
    expect(parseStatusUrl('https://evil.com/jack/status/20')).toBeNull();
    expect(parseStatusUrl('nonsense', 'nope')).toBeNull();
  });
});

describe('language', () => {
  it('browser UI language mapped to the 7 site languages', () => {
    expect(mapUiLang('pt-BR')).toBe('pt');
    expect(mapUiLang('zh_TW')).toBe('zh');
    expect(mapUiLang('ar-EG')).toBe('ar');
    expect(mapUiLang('TR')).toBe('tr');
    expect(mapUiLang('de-DE')).toBe('en');
    expect(mapUiLang(undefined)).toBe('en');
  });
  it('the site choice wins', () => {
    expect(pickLang('ja', 'tr-TR')).toBe('ja');
    expect(pickLang('xx', 'tr-TR')).toBe('tr');
    expect(pickLang(null, 'fr')).toBe('en');
  });
  it('every language has every string, placeholders intact', () => {
    const keys = Object.keys(extText.en).sort();
    for (const l of LANGS) {
      expect(Object.keys(extText[l]).sort(), l).toEqual(keys);
      for (const k of keys) {
        const v = (extText[l] as unknown as Record<string, string>)[k];
        expect(v.trim(), `${l}.${k}`).not.toBe('');
        const ph = (s: string) => (s.match(/\{\w+\}/g) || []).sort();
        expect(ph(v), `${l}.${k}`).toEqual(ph((extText.en as unknown as Record<string, string>)[k]));
      }
    }
    expect(fill('{b} · {u} · {x}', { b: 3, u: 0 })).toBe('3 · 0 · {x}');
  });
});
