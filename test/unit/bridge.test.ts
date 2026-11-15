import { describe, expect, it } from 'vitest';
import {
  MAX_SITE_MESSAGE_BYTES,
  SAVED_PAGE_SIZE,
  SITE_ORIGIN,
  isSavedPath,
  isTrustedEvent,
  message,
  originOf,
  parseExtMessage,
  parseSiteMessage,
  type ExtMessage,
  type SiteMessage,
} from '../../src/shared/bridge';

const win = {};

describe('isTrustedEvent', () => {
  it('needs the same window and the expected origin', () => {
    expect(isTrustedEvent({ source: win, origin: SITE_ORIGIN }, win)).toBe(true);
    expect(isTrustedEvent({ source: {}, origin: SITE_ORIGIN }, win)).toBe(false);
    expect(isTrustedEvent({ source: win, origin: 'https://evil.example' }, win)).toBe(false);
    expect(isTrustedEvent({ source: win, origin: 'https://xtracticle.com.evil.example' }, win)).toBe(false);
    expect(isTrustedEvent({ source: win, origin: 'http://xtracticle.com' }, win)).toBe(false);
    expect(isTrustedEvent({ source: win, origin: 'http://localhost:8787' }, win, 'http://localhost:8787')).toBe(true);
  });
  it('originOf keeps only http(s) origins', () => {
    expect(originOf('http://localhost:8787/')).toBe('http://localhost:8787');
    expect(originOf('https://xtracticle.com/path?q')).toBe('https://xtracticle.com');
    expect(originOf('javascript:alert(1)')).toBeNull();
    expect(originOf('not a url')).toBeNull();
  });
});

describe('parseSiteMessage', () => {
  it('accepts every valid site message', () => {
    expect(parseSiteMessage({ xt: 1, type: 'xt:pro-changed' })).toEqual({ xt: 1, type: 'xt:pro-changed' });
    expect(parseSiteMessage({ xt: 1, type: 'xt:lang-changed', lang: 'tr' })).toEqual({ xt: 1, type: 'xt:lang-changed', lang: 'tr' });
    expect(parseSiteMessage({ xt: 1, type: 'xt:saved:list', req: 'r1' })).toEqual({ xt: 1, type: 'xt:saved:list', req: 'r1', cursor: 0, filter: 'all' });
    expect(parseSiteMessage({ xt: 1, type: 'xt:saved:get', req: 'r2', id: '1790000000000000000' })?.type).toBe('xt:saved:get');
    expect(parseSiteMessage({ xt: 1, type: 'xt:saved:delete', req: 'r3', ids: ['1', '2'] })).toEqual({ xt: 1, type: 'xt:saved:delete', req: 'r3', ids: ['1', '2'] });
  });
  it('drops unknown fields instead of passing them on', () => {
    expect(parseSiteMessage({ xt: 1, type: 'xt:pro-changed', key: 'secret' })).toEqual({ xt: 1, type: 'xt:pro-changed' });
  });
  it('rejects wrong envelopes, versions, types and shapes', () => {
    for (const bad of [
      null,
      'xt:pro-changed',
      [],
      { type: 'xt:pro-changed' },
      { xt: 2, type: 'xt:pro-changed' },
      { xt: 1, type: 'xt:unknown' },
      { xt: 1, type: 'xt:hello', version: '1.0.0' },
      { xt: 1, type: 'xt:lang-changed', lang: 'de' },
      { xt: 1, type: 'xt:saved:list', req: 'bad req!' },
      { xt: 1, type: 'xt:saved:list', req: 'r', cursor: -1 },
      { xt: 1, type: 'xt:saved:list', req: 'r', cursor: 1.5 },
      { xt: 1, type: 'xt:saved:list', req: 'r', filter: 'everything' },
      { xt: 1, type: 'xt:saved:get', req: 'r', id: '12abc' },
      { xt: 1, type: 'xt:saved:get', req: 'r', id: 123 },
      { xt: 1, type: 'xt:saved:delete', req: 'r', ids: [] },
      { xt: 1, type: 'xt:saved:delete', req: 'r', ids: ['1', 'x'] },
      { xt: 1, type: 'xt:saved:delete', req: 'r', ids: Array.from({ length: 501 }, (_, i) => String(i)) },
    ]) {
      expect(parseSiteMessage(bad), JSON.stringify(bad)?.slice(0, 80)).toBeNull();
    }
  });
  it('enforces the size limit', () => {
    const big = { xt: 1, type: 'xt:pro-changed', pad: 'a'.repeat(MAX_SITE_MESSAGE_BYTES) };
    expect(parseSiteMessage(big)).toBeNull();
  });
  it('rejects values that cannot be serialised', () => {
    const cyclic: any = { xt: 1, type: 'xt:pro-changed' };
    cyclic.self = cyclic;
    expect(parseSiteMessage(cyclic)).toBeNull();
  });
});

describe('parseExtMessage', () => {
  const item = { id: '1790000000000000000', author: 'jack', title: 'just setting up', date: '2026-11-01T00:00:00Z', state: 'active' };
  it('accepts every valid extension message', () => {
    expect(parseExtMessage({ xt: 1, type: 'xt:hello', version: '3.0.0' })).toEqual({ xt: 1, type: 'xt:hello', version: '3.0.0' });
    expect(parseExtMessage({ xt: 1, type: 'xt:status', bookmarks: 250, unavailable: 3, lastSyncAt: null })?.type).toBe('xt:status');
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:page', req: 'r', items: [item], next: 200, total: 250 })?.type).toBe('xt:saved:page');
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:post', req: 'r', id: item.id, post: { text: 'hi' } })?.type).toBe('xt:saved:post');
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:post', req: 'r', id: item.id, post: null })?.type).toBe('xt:saved:post');
  });
  it('rejects bad pages and posts', () => {
    expect(parseExtMessage({ xt: 1, type: 'xt:hello', version: '<script>' })).toBeNull();
    expect(parseExtMessage({ xt: 1, type: 'xt:status', bookmarks: -1, unavailable: 0, lastSyncAt: null })).toBeNull();
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:page', req: 'r', items: [{ ...item, state: 'deleted' }], next: null, total: 1 })).toBeNull();
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:page', req: 'r', items: [{ ...item, id: 'x' }], next: null, total: 1 })).toBeNull();
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:page', req: 'r', items: Array(SAVED_PAGE_SIZE + 1).fill(item), next: null, total: 1 })).toBeNull();
    expect(parseExtMessage({ xt: 1, type: 'xt:saved:post', req: 'r', id: item.id, post: [1, 2] })).toBeNull();
    expect(parseExtMessage({ xt: 1, type: 'xt:pro-changed' })).toBeNull();
  });
});

describe('helpers', () => {
  it('message() adds the envelope and round-trips', () => {
    const m = message<SiteMessage>({ type: 'xt:saved:get', req: 'a', id: '1' });
    expect(parseSiteMessage(m)).toEqual(m);
    const e = message<ExtMessage>({ type: 'xt:hello', version: '3.0.0' });
    expect(parseExtMessage(e)).toEqual(e);
  });
  it('isSavedPath only matches /saved and its language variants', () => {
    expect(isSavedPath('/saved')).toBe(true);
    expect(isSavedPath('/saved/')).toBe(true);
    expect(isSavedPath('/tr/saved')).toBe(true);
    expect(isSavedPath('/savedx')).toBe(false);
    expect(isSavedPath('/pro')).toBe(false);
    expect(isSavedPath('/de/saved')).toBe(false);
    expect(isSavedPath('/x/saved')).toBe(false);
  });
});
