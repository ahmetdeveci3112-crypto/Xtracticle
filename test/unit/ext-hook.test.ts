/**
 * hook.js must leave fetch and XMLHttpRequest exactly as the page expects them (plan B3): same promise,
 * readable body, rejections pass through, the same XHR events and readyState sequence. These tests run
 * the real wrapper (extension/src/inject/wrap.ts) against a stand-in window; the e2e test repeats the
 * checks in Chromium on a routed x.com page.
 */
import { describe, expect, it } from 'vitest';
import { install, type HookWindow } from '../../extension/src/inject/wrap';
import { HOOK_TAG, OPS_TAG } from '../../extension/src/x/ops';

type Posted = { message: any; origin: string };

/** Minimal XHR: open/send/addEventListener + onreadystatechange, readyState 1→2→3→4 then load. */
class FakeXHR {
  static responses = new Map<string, { status: number; body: string }>();
  readyState = 0;
  status = 0;
  responseType = '';
  responseText = '';
  response: unknown = '';
  onreadystatechange: (() => void) | null = null;
  onload: (() => void) | null = null;
  private listeners: Record<string, (() => void)[]> = {};
  private url = '';
  opens = 0;
  open(_method: string, url: string) {
    this.url = url;
    this.opens++;
    this.readyState = 1;
    this.onreadystatechange?.call(this);
  }
  addEventListener(type: string, fn: () => void) {
    (this.listeners[type] ||= []).push(fn);
  }
  send(_body?: unknown) {
    const r = FakeXHR.responses.get(this.url) || { status: 404, body: '' };
    for (const s of [2, 3, 4]) {
      this.readyState = s;
      if (s === 4) {
        this.status = r.status;
        this.responseText = r.body;
        this.response = this.responseType === 'json' ? JSON.parse(r.body || 'null') : r.body;
      }
      this.onreadystatechange?.call(this);
    }
    this.onload?.call(this);
    for (const fn of this.listeners.load || []) fn.call(this);
  }
}

function makeWindow(fetchImpl: (...a: any[]) => Promise<any>) {
  const posted: Posted[] = [];
  const listeners: ((e: { source: unknown; data: unknown }) => void)[] = [];
  const XHR = class extends FakeXHR {};
  const win: HookWindow & { posted: Posted[]; emit(data: unknown, source?: unknown): void } = {
    fetch: fetchImpl,
    XMLHttpRequest: XHR,
    location: { href: 'https://x.com/i/bookmarks', origin: 'https://x.com' },
    postMessage: (message, origin) => posted.push({ message, origin }),
    addEventListener: (_t, fn) => listeners.push(fn),
    posted,
    emit(data, source = win) {
      for (const fn of listeners) fn({ source, data });
    },
  };
  return { win, XHR };
}

const flush = () => new Promise(r => setTimeout(r, 10));
const GQL = 'https://x.com/i/api/graphql/abc123/Bookmarks?variables=%7B%7D';

describe('fetch wrapper', () => {
  it('returns the very same promise and leaves the body readable for the page', async () => {
    let returned: Promise<Response> | null = null;
    const orig = (..._a: any[]) => (returned = Promise.resolve(new Response('{"data":{"ok":1}}', { status: 200 })));
    const { win } = makeWindow(orig);
    install(win);
    expect(win.fetch).not.toBe(orig);
    const p = win.fetch!(GQL, { method: 'GET' });
    expect(p).toBe(returned);
    const res = await p;
    expect(await res.json()).toEqual({ data: { ok: 1 } });
    await flush();
    expect(win.posted).toEqual([{ message: { tag: HOOK_TAG, op: 'Bookmarks', body: '{"data":{"ok":1}}' }, origin: 'https://x.com' }]);
  });

  it('passes `this` and arguments through, rejections reach the page unchanged', async () => {
    const seen: any[] = [];
    const err = new TypeError('Failed to fetch');
    const { win } = makeWindow(function (this: unknown, ...a: any[]) {
      seen.push([this, ...a]);
      return Promise.reject(err);
    });
    install(win);
    const init = { method: 'POST', body: 'x' };
    await expect(win.fetch!.call(win, GQL, init)).rejects.toBe(err);
    expect(seen[0]).toEqual([win, GQL, init]);
    await flush();
    expect(win.posted).toHaveLength(0);
  });

  it('forwards nothing for other URLs, other ops or non-200 answers', async () => {
    const { win } = makeWindow(async (url: string) => new Response('{}', { status: url.includes('Bookmarks') ? 429 : 200 }));
    install(win);
    await win.fetch!('https://x.com/i/api/graphql/abc/HomeTimeline');
    await win.fetch!('https://x.com/i/api/1.1/account/settings.json');
    await win.fetch!('https://evil.example/i/api/graphql/abc/Bookmarks');
    await win.fetch!(GQL);
    await flush();
    expect(win.posted).toHaveLength(0);
  });

  it('forwards the request body only for bookmark mutations; accepts Request and URL inputs', async () => {
    const { win } = makeWindow(async () => new Response('{"data":{}}', { status: 200 }));
    install(win);
    await win.fetch!('/i/api/graphql/q/CreateBookmark', { method: 'POST', body: '{"variables":{"tweet_id":"1"}}' });
    await win.fetch!(new URL('https://x.com/i/api/graphql/q/TweetDetail'), { body: 'not forwarded' });
    await win.fetch!(new Request('https://x.com/i/api/graphql/q/Bookmarks'));
    await flush();
    expect(win.posted.map(p => [p.message.op, p.message.req])).toEqual([
      ['CreateBookmark', '{"variables":{"tweet_id":"1"}}'],
      ['TweetDetail', undefined],
      ['Bookmarks', undefined],
    ]);
  });

  it('learns extra op names from content.js, ignores the same message from another source', async () => {
    const { win } = makeWindow(async () => new Response('{}', { status: 200 }));
    install(win);
    win.emit({ tag: OPS_TAG, ops: { bookmarks: ['NewOp'] } }, {});
    await win.fetch!('https://x.com/i/api/graphql/q/NewOp');
    await flush();
    expect(win.posted).toHaveLength(0);
    win.emit({ tag: OPS_TAG, ops: { bookmarks: ['NewOp', 'bad op'] } });
    await win.fetch!('https://x.com/i/api/graphql/q/NewOp');
    await flush();
    expect(win.posted.map(p => p.message.op)).toEqual(['NewOp']);
  });

  it('installs once', () => {
    const { win } = makeWindow(async () => new Response(''));
    install(win);
    const first = win.fetch;
    install(win);
    expect(win.fetch).toBe(first);
  });
});

describe('XMLHttpRequest wrapper', () => {
  it('keeps the readyState sequence and events, forwards the matching response', () => {
    const { win, XHR } = makeWindow(async () => new Response(''));
    FakeXHR.responses.set(GQL, { status: 200, body: '{"data":{"x":1}}' });
    install(win);
    const xhr = new XHR();
    const states: number[] = [];
    let loads = 0;
    xhr.onreadystatechange = () => states.push(xhr.readyState);
    xhr.onload = () => loads++;
    xhr.open('GET', GQL);
    xhr.send();
    expect(states).toEqual([1, 2, 3, 4]);
    expect(loads).toBe(1);
    expect(xhr.responseText).toBe('{"data":{"x":1}}');
    expect(win.posted).toEqual([{ message: { tag: HOOK_TAG, op: 'Bookmarks', body: '{"data":{"x":1}}' }, origin: 'https://x.com' }]);
  });

  it('reads responseType json, forwards the mutation body, ignores other requests', () => {
    const { win, XHR } = makeWindow(async () => new Response(''));
    const add = 'https://x.com/i/api/graphql/q/CreateBookmark';
    FakeXHR.responses.set(add, { status: 200, body: '{"data":{"tweet_bookmark_put":"Done"}}' });
    FakeXHR.responses.set('https://x.com/i/api/graphql/q/HomeTimeline', { status: 200, body: '{}' });
    install(win);
    const a = new XHR();
    a.responseType = 'json';
    a.open('POST', add);
    a.send('{"variables":{"tweet_id":"7"}}');
    const b = new XHR();
    b.open('GET', 'https://x.com/i/api/graphql/q/HomeTimeline');
    b.send();
    expect(win.posted.map(p => p.message)).toEqual([{ tag: HOOK_TAG, op: 'CreateBookmark', body: '{"data":{"tweet_bookmark_put":"Done"}}', req: '{"variables":{"tweet_id":"7"}}' }]);
  });

  it('a reused XHR opened for another URL forwards nothing and keeps one listener', () => {
    const { win, XHR } = makeWindow(async () => new Response(''));
    FakeXHR.responses.set(GQL, { status: 200, body: '{"a":1}' });
    FakeXHR.responses.set('https://x.com/other', { status: 200, body: '{"b":2}' });
    install(win);
    const x = new XHR();
    x.open('GET', GQL);
    x.send();
    x.open('GET', 'https://x.com/other');
    x.send();
    x.open('GET', GQL);
    x.send();
    expect(win.posted.map(p => p.message.body)).toEqual(['{"a":1}', '{"a":1}']);
    expect((x as any).listeners.load).toHaveLength(1);
  });

  it('non-200 XHR answers are not forwarded', () => {
    const { win, XHR } = makeWindow(async () => new Response(''));
    const url = 'https://x.com/i/api/graphql/q/TweetDetail';
    FakeXHR.responses.set(url, { status: 500, body: '{"errors":[]}' });
    install(win);
    const x = new XHR();
    x.open('GET', url);
    x.send();
    expect(x.status).toBe(500);
    expect(win.posted).toHaveLength(0);
  });
});
