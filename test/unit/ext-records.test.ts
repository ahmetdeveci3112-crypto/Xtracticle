import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, buildExport, markGone, markRemoved, mergeBookmark, mergePost, pageOf, sanitizeCapture, sanitizeSettings, sanitizeTweet, summarize, fullScanKey, isFullScanKey, FULL_SCAN_PREFIX, type BookmarkRow } from '../../extension/src/bg/records';
import type { StoredPost } from '../../extension/src/messages';
import { parseGraphql } from '../../extension/src/x/graphql';
import type { FxTweet } from '../../src/shared/fx';
import { fixture } from './ext-fixtures';

const tweets = parseGraphql(fixture('bookmarks.json')).tweets;
const t101 = tweets[0];
const article = tweets.find(t => t.article)!;
const A = '2026-11-01T10:00:00.000Z';
const B = '2026-11-02T10:00:00.000Z';

describe('posts', () => {
  it('keeps capturedAt and source, refreshes data and updatedAt', () => {
    const first = mergePost(undefined, t101, 'bookmark', A);
    expect(first).toEqual({ id: t101.id, tweet: t101, source: 'bookmark', capturedAt: A, updatedAt: A });
    const changed = { ...t101, likes: 999 };
    const second = mergePost(first, changed, 'manual', B);
    expect(second).toMatchObject({ capturedAt: A, updatedAt: B, source: 'bookmark' });
    expect(second.tweet.likes).toBe(999);
  });

  it('a preview never replaces a stored full Article body', () => {
    const full = { ...article, article: { ...article.article, preview: undefined, content: { blocks: [{ type: 'unstyled', text: 'full body' }] } } };
    const stored = mergePost(undefined, full, 'bookmark', A);
    const next = mergePost(stored, article, 'bookmark', B);
    expect(next.tweet.article.content.blocks[0].text).toBe('full body');
    expect(mergePost(mergePost(undefined, article, 'bookmark', A), full, 'bookmark', B).tweet.article.content.blocks[0].text).toBe('full body');
  });
});

describe('bookmark rows', () => {
  const row = mergeBookmark(undefined, '42', { id: t101.id, sortIndex: '9' }, A);

  it('a new row is active; seeing it again keeps firstSeenAt and reactivates', () => {
    expect(row).toEqual({ accountId: '42', id: t101.id, sortIndex: '9', firstSeenAt: A, lastSeenAt: A, state: 'active', missingSince: null, checks: 0, checkedAt: null, seenByUserAt: null });
    const gone = markGone(row, B);
    expect(gone).toMatchObject({ state: 'unavailable', missingSince: B });
    const back = mergeBookmark({ ...gone, checks: 2 }, '42', { id: t101.id, sortIndex: null }, B);
    expect(back).toMatchObject({ state: 'active', firstSeenAt: A, lastSeenAt: B, sortIndex: '9', checks: 0, missingSince: null });
  });

  it("the user's own removal stays removed_by_user even if X later shows a tombstone", () => {
    const removed = markRemoved(row, B);
    expect(removed.state).toBe('removed_by_user');
    expect(markGone(removed, B)).toBe(removed);
  });
});

describe('summaries and pages', () => {
  it('summarises within the bridge limits', () => {
    const p: StoredPost = { id: t101.id, tweet: t101, source: 'bookmark', capturedAt: A, updatedAt: A };
    const s = summarize(p);
    expect(s).toEqual({ id: t101.id, author: 'ada_example', title: 'Reading list for the weekend & beyond:', date: new Date(t101.created_at).toISOString(), state: 'active' });
    expect(summarize({ ...p, id: article.id, tweet: article }, 'unavailable')).toMatchObject({ title: 'A Short Field Guide', state: 'unavailable' });
    const empty = summarize({ ...p, tweet: { ...t101, text: '', created_at: 'garbage' } });
    expect(empty).toMatchObject({ title: '@ada_example', date: A });
    expect(summarize({ ...p, tweet: { ...t101, text: 'x'.repeat(2000) } }).title.length).toBeLessThanOrEqual(400);
  });

  it('pages by 200 with a numeric cursor', () => {
    const all = Array.from({ length: 450 }, (_, i) => i);
    expect(pageOf(all, 0)).toMatchObject({ next: 200, total: 450 });
    expect(pageOf(all, 400)).toMatchObject({ items: all.slice(400), next: null });
    expect(pageOf(all, -5).items[0]).toBe(0);
    expect(pageOf([], 0)).toEqual({ items: [], next: null, total: 0 });
  });

  it('export carries posts and rows as they are', () => {
    const e = buildExport([], [] as BookmarkRow[], A, '0.1.0');
    expect(e).toEqual({ format: 'xtracticle-archive', version: 1, exportedAt: A, extVersion: '0.1.0', posts: [], bookmarks: [] });
  });
});

describe('re-validation of what content.js sends', () => {
  it('passes mapped posts through unchanged where convert.ts reads them', () => {
    for (const t of tweets) {
      const s = sanitizeTweet(t)!;
      expect(s.text).toBe(t.text);
      expect(s.url).toBe(t.url);
      expect(s.media).toEqual(t.media);
      expect(s.quote?.text).toBe(t.quote?.text);
      expect(s.article).toEqual(t.article);
    }
  });

  it('drops posts and fields that are not what they claim', () => {
    expect(sanitizeTweet({ ...t101, id: '12x' })).toBeNull();
    expect(sanitizeTweet({ ...t101, text: 5 })).toBeNull();
    expect(sanitizeTweet({ ...t101, author: null })).toBeNull();
    expect(sanitizeTweet(null)).toBeNull();
    const odd = sanitizeTweet({ ...t101, url: 'javascript:alert(1)', author: { name: 'n', screen_name: '../evil', avatar_url: 'http://insecure' }, media: { photos: [{ url: 'javascript:x' }, { url: 'https://ok/1.jpg' }] } } as unknown as FxTweet)!;
    expect(odd.url).toBe(`https://x.com/i/status/${t101.id}`);
    expect(odd.author).toEqual({ name: 'n', screen_name: '', avatar_url: undefined });
    expect(odd.media?.photos).toEqual([{ url: 'https://ok/1.jpg', width: undefined, height: undefined, altText: '' }]);
    expect(sanitizeTweet({ ...t101, text: 'x', article: undefined, quote: { ...t101, quote: t101 } } as FxTweet)!.quote!.quote).toBeNull();
  });

  it('capture payloads', () => {
    expect(sanitizeCapture({ accountId: '42', source: 'bookmark', tweets, entries: [{ id: t101.id, sortIndex: '9' }, { id: 'bad' }] })).toMatchObject({
      accountId: '42', source: 'bookmark', entries: [{ id: t101.id, sortIndex: '9' }], removed: [], gone: [],
    });
    expect(sanitizeCapture({ accountId: 'u=42', source: 'weird', tweets: [t101] })).toMatchObject({ accountId: null, source: 'manual' });
    expect(sanitizeCapture({ accountId: '42', removed: [t101.id, 'x'] })).toMatchObject({ removed: [t101.id], tweets: [] });
    expect(sanitizeCapture({ accountId: '42', tweets: [{ id: 'x' }] })).toBeNull();
    expect(sanitizeCapture('nope')).toBeNull();
    expect(sanitizeCapture({ tweets: Array.from({ length: 500 }, () => t101) })!.tweets).toHaveLength(200);
  });

  it('settings: archive defaults on, only booleans change it', () => {
    const D = { archive: true, counter: true, noticeSeen: false };
    expect(DEFAULT_SETTINGS).toEqual(D);
    expect(sanitizeSettings(undefined, DEFAULT_SETTINGS)).toEqual(D);
    expect(sanitizeSettings({ archive: false }, DEFAULT_SETTINGS)).toEqual({ ...D, archive: false });
    expect(sanitizeSettings({ archive: 'no' }, { ...D, archive: false })).toEqual({ ...D, archive: false });
    expect(sanitizeSettings({ counter: false, noticeSeen: true }, DEFAULT_SETTINGS)).toEqual({ archive: true, counter: false, noticeSeen: true });
    // Settings stored by 0.1.0 had only `archive`.
    expect(sanitizeSettings(undefined, { archive: false } as never)).toEqual({ ...D, archive: false });
  });
});

describe('full-scan meta key', () => {
  it('is per account and recognisable, so "delete all" can find every one', () => {
    expect(fullScanKey('123')).toBe('fullScan:123');
    expect(fullScanKey('123')).not.toBe(fullScanKey('456'));
    expect(isFullScanKey(fullScanKey('123'))).toBe(true);
    expect(isFullScanKey('lastSyncAt')).toBe(false);
    expect(isFullScanKey('lastAccountId')).toBe(false);
    expect(FULL_SCAN_PREFIX).toBe('fullScan:');
  });
});
