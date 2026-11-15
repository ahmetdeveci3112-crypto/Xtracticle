/**
 * Markdown parity (docs/chrome-extension-plan.md, A4 "Eşitlik güvencesi"): the same post read by the
 * extension from X's GraphQL response and by the site from FxTwitter via /api/thread gives the same
 * document, byte for byte.
 *
 * The site side is the real handler (src/shared/api.ts → fx.ts normalize) with FxTwitter answered from
 * extension/test/fixtures/fxtwitter.json; the extension side is x/graphql.ts plus the SW's re-validation
 * (bg/records.ts sanitizeTweet), i.e. exactly what is stored in the archive.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { sanitizeTweet } from '../../extension/src/bg/records';
import { parseGraphql } from '../../extension/src/x/graphql';
import { handleApi } from '../../src/shared/api';
import { buildDoc, fileBaseName, frontMatter } from '../../src/shared/convert';
import { DEFAULT_LABELS } from '../../src/shared/doc';
import type { FxTweet } from '../../src/shared/fx';
import { fixture } from './ext-fixtures';

const FX = fixture('fxtwitter.json') as Record<string, unknown>;
const ID = (n: number) => `18900000000000${String(n).padStart(5, '0')}`;

beforeAll(() => {
  vi.stubGlobal('fetch', async (input: string | URL | Request) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    if (url.hostname !== 'api.fxtwitter.com') throw new Error(`unexpected fetch ${url}`);
    const body = FX[url.pathname];
    return new Response(JSON.stringify(body ?? { code: 404 }), { status: body ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  });
});
afterAll(() => vi.unstubAllGlobals());

async function siteThread(id: string): Promise<FxTweet[]> {
  const res = await handleApi(new Request(`https://xtracticle.com/api/thread/${id}`));
  expect(res?.status).toBe(200);
  return ((await res!.json()) as { tweets: FxTweet[] }).tweets;
}

const ext = (json: unknown) => parseGraphql(json).tweets.map(t => sanitizeTweet(t)!);
const fromBookmarks = ext(fixture('bookmarks.json'));
const fromDetail = ext(fixture('tweet-detail.json'));
const fromArticle = ext(fixture('tweet-result-article.json'));
const pick = (list: FxTweet[], n: number) => list.find(t => t.id === ID(n))!;

function expectSameDoc(extTweets: FxTweet[], siteTweets: FxTweet[]) {
  for (const locale of ['en-US', 'tr-TR', 'ja-JP']) {
    const a = buildDoc(extTweets, DEFAULT_LABELS, locale);
    const b = buildDoc(siteTweets, DEFAULT_LABELS, locale);
    expect(a.md).toBe(b.md);
    expect(a.txt).toBe(b.txt);
    expect(fileBaseName(a)).toBe(fileBaseName(b));
    expect(frontMatter(a)).toBe(frontMatter(b));
    expect(a.images).toEqual(b.images);
  }
}

describe('extension Markdown = site Markdown (/api/thread)', () => {
  const singles: [string, number][] = [
    ['post with link, entity and photo', 101],
    ['long post (note_tweet)', 102],
    ['quote with photo', 103],
    ['video (TweetWithVisibilityResults)', 104],
    ['GIF', 105],
    ['reply with hidden mention', 108],
  ];
  for (const [name, n] of singles) {
    it(name, async () => {
      const site = await siteThread(ID(n));
      expect(site).toHaveLength(1);
      expectSameDoc([pick(fromBookmarks, n)], site);
    });
  }

  it('self-thread from TweetDetail', async () => {
    const site = await siteThread(ID(202));
    expect(site.map(t => t.id)).toEqual([ID(201), ID(202)]);
    expectSameDoc([pick(fromDetail, 201), pick(fromDetail, 202)], site);
  });

  it('X Article with the full Draft.js body', async () => {
    const site = await siteThread(ID(301));
    expectSameDoc([pick(fromArticle, 301)], site);
    const doc = buildDoc([pick(fromArticle, 301)], DEFAULT_LABELS, 'en-US');
    expect(doc.kind).toBe('article');
    expect(doc.md).toContain('**Small tools** are easy to *read* and easy to fix. See [the guide](https://example.com/guide) for more.');
    expect(doc.md).toContain('```\nnpm run build\nnpm test\n```');
  });

  it('the fields convert.ts reads match field by field', async () => {
    for (const n of [101, 103, 104]) {
      const [s] = await siteThread(ID(n));
      const e = pick(fromBookmarks, n);
      expect(e.text).toBe(s.text);
      expect(e.url).toBe(s.url);
      expect(e.created_at).toBe(s.created_at);
      expect(e.author).toEqual(s.author);
      expect(e.media?.photos ?? []).toEqual(s.media?.photos ?? []);
      expect((e.media?.videos ?? []).map(v => [v.url, v.thumbnail_url, v.type])).toEqual((s.media?.videos ?? []).map(v => [v.url, v.thumbnail_url, v.type]));
      expect(e.quote?.url ?? null).toBe(s.quote?.url ?? null);
    }
  });
});
