import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { configDue } from '../../extension/src/bg/remote';
import {
  CONFIG_TTL_MS, DEFAULT_FLAGS, DEFAULT_OPS, HOOK_TAG, MAX_BODY_CHARS, categoryOf, compareVersions, effectiveConfig,
  isHookMessage, mergeOps, opFromUrl, parseRemoteConfig, parseStoredConfig,
} from '../../extension/src/x/ops';

describe('opFromUrl', () => {
  it('reads the operation name from X GraphQL URLs only', () => {
    expect(opFromUrl('https://x.com/i/api/graphql/AbC-12_x/Bookmarks?variables=%7B%7D')).toBe('Bookmarks');
    expect(opFromUrl('/i/api/graphql/q1/TweetDetail?x=1', 'https://x.com/home')).toBe('TweetDetail');
    expect(opFromUrl('https://twitter.com/i/api/graphql/q1/CreateBookmark')).toBe('CreateBookmark');
    expect(opFromUrl('https://evil.example/i/api/graphql/q1/Bookmarks')).toBeNull();
    expect(opFromUrl('http://x.com/i/api/graphql/q1/Bookmarks')).toBeNull();
    expect(opFromUrl('https://x.com/i/api/1.1/jot/client_event.json')).toBeNull();
    expect(opFromUrl('https://x.com/i/api/graphql/q1/Bookmarks/extra')).toBeNull();
    expect(opFromUrl(undefined)).toBeNull();
    expect(opFromUrl('::bad', 'also bad')).toBeNull();
  });
});

describe('config merge', () => {
  it('adds remote names to the defaults, drops invalid ones, caps each category', () => {
    const m = mergeOps(DEFAULT_OPS, { bookmarks: ['BookmarksV2', 'bad name', 5, '<script>'], detail: 'x', unknown: ['Foo'] });
    expect(m.bookmarks).toEqual([...DEFAULT_OPS.bookmarks, 'BookmarksV2']);
    expect(m.detail).toEqual(DEFAULT_OPS.detail);
    expect(mergeOps(DEFAULT_OPS, { user: Array.from({ length: 50 }, (_, i) => `Op${i}`) }).user).toHaveLength(20);
    expect(categoryOf(m, 'BookmarksV2')).toBe('bookmarks');
    expect(categoryOf(m, 'HomeTimeline')).toBeNull();
  });

  it('parses the shipped public/ext/config.json', () => {
    const real = JSON.parse(readFileSync(new URL('../../public/ext/config.json', import.meta.url), 'utf8'));
    const parsed = parseRemoteConfig(real);
    expect(parsed).not.toBeNull();
    const eff = effectiveConfig(parsed, '9.9.9', 1);
    for (const cat of Object.keys(DEFAULT_OPS) as (keyof typeof DEFAULT_OPS)[]) expect(eff.ops[cat]).toEqual(expect.arrayContaining(DEFAULT_OPS[cat]));
  });

  it('minVersion above the extension version switches every flag off', () => {
    const remote = parseRemoteConfig({ schema: 1, minVersion: '0.2.0', flags: { capture: true } });
    expect(effectiveConfig(remote, '0.1.0', 1)).toMatchObject({ outdated: true, flags: { capture: false, detect: false, saveMenu: false } });
    expect(effectiveConfig(remote, '0.2.0', 1)).toMatchObject({ outdated: false, flags: { capture: true } });
    expect(effectiveConfig(parseRemoteConfig({ schema: 1, flags: { capture: false, detect: true, junk: true } }), '0.1.0', 1).flags).toEqual({ capture: false, detect: true, saveMenu: true });
    expect(parseRemoteConfig({ schema: 2 })).toBeNull();
    expect(parseRemoteConfig(null)).toBeNull();
  });

  it('compares dotted versions numerically', () => {
    expect(compareVersions('0.1.0', '3.0.0')).toBe(-1);
    expect(compareVersions('0.10.0', '0.9.9')).toBe(1);
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
  });

  it('stored config round-trips and garbage falls back to defaults', () => {
    const eff = effectiveConfig(parseRemoteConfig({ schema: 1, minVersion: '0.1.0', ops: { bookmarks: ['BookmarksV9'] }, flags: { saveMenu: false } }), '0.1.0', 123);
    expect(parseStoredConfig(JSON.parse(JSON.stringify(eff)), '0.1.0')).toEqual(eff);
    expect(parseStoredConfig('junk', '0.1.0')).toEqual({ ops: mergeOps(DEFAULT_OPS, null), flags: DEFAULT_FLAGS, minVersion: null, outdated: false, fetchedAt: null });
  });

  it('re-reads config.json at most every 6 hours, failed reads retried after 30 minutes', () => {
    const now = 10 * CONFIG_TTL_MS;
    expect(configDue(null, null, now)).toBe(true);
    expect(configDue(now - CONFIG_TTL_MS + 1000, null, now)).toBe(false);
    expect(configDue(now - CONFIG_TTL_MS, null, now)).toBe(true);
    expect(configDue(null, now - 60_000, now)).toBe(false);
    expect(configDue(null, now - 31 * 60_000, now)).toBe(true);
    expect(configDue(now, now, now, true)).toBe(true);
  });
});

describe('hook message checks', () => {
  it('accepts only the fixed tag, a valid op name and bounded strings', () => {
    expect(isHookMessage({ tag: HOOK_TAG, op: 'Bookmarks', body: '{}' })).toBe(true);
    expect(isHookMessage({ tag: HOOK_TAG, op: 'Bookmarks', body: '{}', req: '{}' })).toBe(true);
    expect(isHookMessage({ tag: 'other', op: 'Bookmarks', body: '{}' })).toBe(false);
    expect(isHookMessage({ tag: HOOK_TAG, op: 'Book marks', body: '{}' })).toBe(false);
    expect(isHookMessage({ tag: HOOK_TAG, op: 'Bookmarks', body: {} })).toBe(false);
    expect(isHookMessage({ tag: HOOK_TAG, op: 'Bookmarks', body: '{}', req: 5 })).toBe(false);
    expect(isHookMessage({ tag: HOOK_TAG, op: 'Bookmarks', body: 'x'.repeat(MAX_BODY_CHARS + 1) })).toBe(false);
    expect(isHookMessage(null)).toBe(false);
    expect(isHookMessage([HOOK_TAG])).toBe(false);
  });
});
