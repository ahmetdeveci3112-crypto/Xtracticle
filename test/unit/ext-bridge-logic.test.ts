/**
 * The bridge on xtracticle.com (extension/src/bridge/logic.ts): what each site message makes the extension do,
 * and that archive data is answered on /saved only. The site side of the same protocol is tested in
 * site-ext.test.ts; here the answers are checked with the site's own parser (parseExtMessage).
 */
import { describe, expect, it } from 'vitest';
import { handleSiteMessage, postPayload, statusMessage, type BridgeDeps } from '../../extension/src/bridge/logic';
import { siteLang } from '../../extension/src/lang';
import type { Msg, StoredPost } from '../../extension/src/messages';
import { MAX_EXT_MESSAGE_BYTES, message, parseExtMessage, parseSiteMessage, type ExtMessage, type SiteMessage } from '../../src/shared/bridge';

const ID = '1890000000000000101';
const tweet = (id = ID, text = 'hello') => ({ id, url: `https://x.com/a/status/${id}`, text, created_at: 'Wed Nov 12 10:00:00 +0000 2025', author: { name: 'A', screen_name: 'a' } });
const stored = (extra: Partial<StoredPost> = {}): StoredPost => ({ id: ID, tweet: tweet() as never, source: 'bookmark', capturedAt: '2026-11-15T00:00:00Z', updatedAt: '2026-11-15T00:00:00Z', ...extra });

function deps(path: string, replies: Partial<Record<Msg['type'], unknown>> = {}) {
  const sent: Msg[] = [];
  const posted: ExtMessage[] = [];
  const d: BridgeDeps = {
    send: (async (m: Msg) => {
      sent.push(m);
      const data = replies[m.type];
      return data === undefined ? { ok: false, error: 'x' } : { ok: true, data };
    }) as BridgeDeps['send'],
    post: m => posted.push(m),
    pathname: () => path,
  };
  return { d, sent, posted };
}

const site = (m: Record<string, unknown>) => parseSiteMessage(message<SiteMessage>(m as never))!;

describe('bridge: site → extension', () => {
  it('xt:pro-changed refreshes Pro; xt:lang-changed stores the language (any page)', async () => {
    const { d, sent, posted } = deps('/pro', { 'pro:refresh': {}, 'lang:set': {} });
    await handleSiteMessage(site({ type: 'xt:pro-changed' }), d);
    await handleSiteMessage(site({ type: 'xt:lang-changed', lang: 'tr' }), d);
    expect(sent).toEqual([{ type: 'pro:refresh' }, { type: 'lang:set', lang: 'tr' }]);
    expect(posted).toEqual([]);
  });

  it('xt:saved:list → xt:saved:page the site accepts', async () => {
    const page = { items: [{ id: ID, author: 'a', title: 'hello', date: '2025-11-12T10:00:00.000Z', state: 'active' }], next: null, total: 1 };
    const { d, sent, posted } = deps('/saved', { 'saved:list': page });
    await handleSiteMessage(site({ type: 'xt:saved:list', req: 'r1', cursor: 0, filter: 'removed' }), d);
    expect(sent).toEqual([{ type: 'saved:list', cursor: 0, filter: 'removed' }]);
    expect(parseExtMessage(posted[0])).toEqual({ xt: 1, type: 'xt:saved:page', req: 'r1', ...page });
  });

  it('xt:saved:get → xt:saved:post with the thread, or null when there is no copy', async () => {
    const thread = [tweet('1890000000000000100', 'one'), tweet(ID, 'two')];
    const { d, posted } = deps('/es/saved', { 'saved:get': stored({ thread: thread as never }) });
    await handleSiteMessage(site({ type: 'xt:saved:get', req: 'r2', id: ID }), d);
    const m = parseExtMessage(posted[0]) as Extract<ExtMessage, { type: 'xt:saved:post' }>;
    expect(m.id).toBe(ID);
    expect(m.post?.id).toBe(ID);
    expect((m.post?.thread as unknown[]).length).toBe(2);

    const none = deps('/saved', { 'saved:get': null });
    await handleSiteMessage(site({ type: 'xt:saved:get', req: 'r3', id: ID }), none.d);
    expect(parseExtMessage(none.posted[0])).toEqual({ xt: 1, type: 'xt:saved:post', req: 'r3', id: ID, post: null });
  });

  it('xt:saved:delete deletes, answers nothing but a fresh xt:status', async () => {
    const { d, sent, posted } = deps('/saved', { 'saved:delete': { deleted: 1 }, 'saved:status': { posts: 0, bookmarks: 3, unavailable: 1, lastSyncAt: null, archive: true } });
    await handleSiteMessage(site({ type: 'xt:saved:delete', req: 'r4', ids: [ID] }), d);
    expect(sent.map(m => m.type)).toEqual(['saved:delete', 'saved:status']);
    expect(posted).toEqual([{ xt: 1, type: 'xt:status', bookmarks: 3, unavailable: 1, lastSyncAt: null }]);
  });

  it('archive data is answered on /saved only', async () => {
    for (const path of ['/', '/pro', '/savedx', '/tr/pro', '/x/saved', '/deleted-tweet-finder']) {
      const { d, sent, posted } = deps(path, { 'saved:list': { items: [], next: null, total: 0 }, 'saved:get': stored() });
      await handleSiteMessage(site({ type: 'xt:saved:list', req: 'r', cursor: 0, filter: 'all' }), d);
      await handleSiteMessage(site({ type: 'xt:saved:get', req: 'r', id: ID }), d);
      await handleSiteMessage(site({ type: 'xt:saved:delete', req: 'r', ids: [ID] }), d);
      expect(sent, path).toEqual([]);
      expect(posted, path).toEqual([]);
    }
  });

  it('a failing SW still answers the site (empty page, null post), so it never waits for a timeout', async () => {
    const { d, posted } = deps('/saved');
    await handleSiteMessage(site({ type: 'xt:saved:list', req: 'r', cursor: 0, filter: 'all' }), d);
    await handleSiteMessage(site({ type: 'xt:saved:get', req: 'q', id: ID }), d);
    expect(posted.map(p => parseExtMessage(p))).toEqual([
      { xt: 1, type: 'xt:saved:page', req: 'r', items: [], next: null, total: 0 },
      { xt: 1, type: 'xt:saved:post', req: 'q', id: ID, post: null },
    ]);
  });
});

describe('bridge: payloads', () => {
  it('xt:status passes the site parser', () => {
    expect(parseExtMessage(statusMessage({ bookmarks: 5, unavailable: 2, lastSyncAt: '2026-11-15T10:00:00.000Z' }))).toEqual({ xt: 1, type: 'xt:status', bookmarks: 5, unavailable: 2, lastSyncAt: '2026-11-15T10:00:00.000Z' });
  });

  it('postPayload drops the thread, then the post, when they exceed the message limit', () => {
    const big = 'x'.repeat(Math.ceil(MAX_EXT_MESSAGE_BYTES / 4));
    const withHugeThread = stored({ thread: [tweet(ID, big), tweet('1890000000000000102', big)] as never });
    const p = postPayload(withHugeThread)!;
    expect(p.id).toBe(ID);
    expect(p.thread).toBeUndefined();
    expect(postPayload(stored({ tweet: tweet(ID, 'y'.repeat(MAX_EXT_MESSAGE_BYTES)) as never }))).toBeNull();
    expect(postPayload(null)).toBeNull();
  });
});

describe('site language', () => {
  it('the stored choice first, then <html lang>', () => {
    expect(siteLang('"tr"', 'en')).toBe('tr');
    expect(siteLang(null, 'pt-BR')).toBe('pt');
    expect(siteLang('"xx"', 'ja')).toBe('ja');
    expect(siteLang('not json', 'zh-CN')).toBe('zh');
    expect(siteLang(null, 'de')).toBeNull();
    expect(siteLang(null, null)).toBeNull();
  });
});
