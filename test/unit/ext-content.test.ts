import { describe, expect, it } from 'vitest';
import { RecentPosts, accountFromCookie, handleHookMessage } from '../../extension/src/content/capture';
import { HOOK_TAG, effectiveConfig, parseRemoteConfig, type HookMessage } from '../../extension/src/x/ops';
import { fixture } from './ext-fixtures';

const ID = (n: number) => `18900000000000${String(n).padStart(5, '0')}`;
const config = effectiveConfig(null, '0.1.0', null);
const msg = (op: string, body: unknown, req?: unknown): HookMessage => ({ tag: HOOK_TAG, op, body: typeof body === 'string' ? body : JSON.stringify(body), ...(req ? { req: JSON.stringify(req) } : {}) });

describe('twid cookie', () => {
  it('reads the account id', () => {
    expect(accountFromCookie('lang=en; twid=u%3D1234567890; ct0=abc')).toBe('1234567890');
    expect(accountFromCookie('twid="u=42"')).toBe('42');
    expect(accountFromCookie('twid=u%3Dabc')).toBeNull();
    expect(accountFromCookie('xtwid=u%3D1')).toBeNull();
    expect(accountFromCookie('twid=%E0%A4%A')).toBeNull();
    expect(accountFromCookie('')).toBeNull();
  });
});

describe('hook message → capture:posts', () => {
  it('Bookmarks: posts, rows in order, tombstones as gone', () => {
    const recent = new RecentPosts();
    const { capture } = handleHookMessage(msg('Bookmarks', fixture('bookmarks.json')), config, '42', recent);
    expect(capture?.accountId).toBe('42');
    expect(capture?.source).toBe('bookmark');
    expect(capture?.tweets.map(t => t.id)).toEqual([101, 102, 103, 104, 105, 107, 108].map(ID));
    expect(capture?.entries?.[0]).toEqual({ id: ID(101), sortIndex: '1859000000000000099' });
    expect(capture?.gone).toEqual([{ id: ID(106), sortIndex: '1859000000000000095' }]);
    expect(recent.size).toBe(7);
  });

  it('TweetDetail is remembered, not archived; CreateBookmark then archives the post', () => {
    const recent = new RecentPosts();
    expect(handleHookMessage(msg('TweetDetail', fixture('tweet-detail.json')), config, '42', recent).capture).toBeNull();
    const add = handleHookMessage(msg('CreateBookmark', '{"data":{"tweet_bookmark_put":"Done"}}', { variables: { tweet_id: ID(202) } }), config, '42', recent).capture;
    expect(add?.tweets.map(t => t.id)).toEqual([ID(202)]);
    expect(add?.entries).toEqual([{ id: ID(202), sortIndex: null }]);
    expect(handleHookMessage(msg('CreateBookmark', '{}', { variables: { tweet_id: ID(999) } }), config, '42', recent).capture).toBeNull();
  });

  it('DeleteBookmark marks the row removed', () => {
    const r = handleHookMessage(msg('DeleteBookmark', '{"data":{"tweet_bookmark_delete":"Done"}}', { variables: { tweet_id: ID(101) } }), config, '42', new RecentPosts());
    expect(r.capture).toEqual({ accountId: '42', source: 'bookmark', tweets: [], removed: [ID(101)] });
  });

  it('ignores unknown ops, the user op, bad JSON, and everything when capture is off', () => {
    const recent = new RecentPosts();
    expect(handleHookMessage(msg('HomeTimeline', fixture('bookmarks.json')), config, '42', recent).capture).toBeNull();
    expect(handleHookMessage(msg('UserByScreenName', '{}'), config, '42', recent).capture).toBeNull();
    expect(handleHookMessage(msg('Bookmarks', '{not json'), config, '42', recent).capture).toBeNull();
    expect(handleHookMessage(msg('Bookmarks', { data: {} }), config, '42', recent).capture).toBeNull();
    const off = effectiveConfig(parseRemoteConfig({ schema: 1, flags: { capture: false } }), '0.1.0', 1);
    expect(handleHookMessage(msg('Bookmarks', fixture('bookmarks.json')), off, '42', recent).capture).toBeNull();
  });

  it('remote op names are honoured', () => {
    const cfg = effectiveConfig(parseRemoteConfig({ schema: 1, ops: { bookmarks: ['BookmarksV9'] } }), '0.1.0', 1);
    expect(handleHookMessage(msg('BookmarksV9', fixture('bookmarks-folder.json')), cfg, null, new RecentPosts()).capture?.tweets).toHaveLength(2);
  });

  it('RecentPosts stays bounded', () => {
    const r = new RecentPosts(2);
    const t = (id: string) => ({ id }) as any;
    r.add([t('1'), t('2'), t('3')]);
    expect(r.size).toBe(2);
    expect(r.get('1')).toBeUndefined();
    expect(r.get('3')).toBeDefined();
  });
});
