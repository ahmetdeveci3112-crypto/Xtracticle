import { describe, expect, it } from 'vitest';
import { bookmarkMutationId, fixText, parseGraphql } from '../../extension/src/x/graphql';
import { fixture } from './ext-fixtures';

const bookmarks = fixture('bookmarks.json');
const folder = fixture('bookmarks-folder.json');
const detail = fixture('tweet-detail.json');
const article = fixture('tweet-result-article.json');

const ID = (n: number) => `18900000000000${String(n).padStart(5, '0')}`;
const byId = (r: ReturnType<typeof parseGraphql>, n: number) => r.tweets.find(t => t.id === ID(n))!;

describe('parseGraphql: Bookmarks timeline', () => {
  const r = parseGraphql(bookmarks);

  it('keeps bookmark order, sortIndex and cursors', () => {
    expect(r.recognized).toBe(true);
    expect(r.tweets.map(t => t.id)).toEqual([101, 102, 103, 104, 105, 107, 108].map(ID));
    expect(r.entries[0]).toEqual({ id: ID(101), sortIndex: '1859000000000000099' });
    expect(r.entries.map(e => e.id)).toEqual(r.tweets.map(t => t.id));
    expect(r.cursors).toEqual({ top: 'SYNTHCURSORTOP', bottom: 'SYNTHCURSORBOTTOM' });
  });

  it('reports tombstones (with id and sortIndex) and promoted entries as skipped', () => {
    expect(r.skipped).toEqual([
      { id: ID(106), reason: 'tombstone', sortIndex: '1859000000000000095' },
      { id: ID(190), reason: 'promoted', sortIndex: '1859000000000000093' },
    ]);
  });

  it('expands t.co links, drops the media link, decodes entities, photo ?name=orig', () => {
    const t = byId(r, 101);
    expect(t.text).toBe('Reading list for the weekend & beyond: https://example.com/reading');
    expect(t.url).toBe(`https://x.com/ada_example/status/${ID(101)}`);
    expect(t.author).toEqual({ name: 'Ada Example', screen_name: 'ada_example', avatar_url: 'https://pbs.twimg.com/profile_images/1000000001/ada_200x200.jpg' });
    expect(t.media?.photos).toEqual([{ url: 'https://pbs.twimg.com/media/SYNTHPHOTO101.jpg?name=orig', width: 1600, height: 1200, altText: 'A stack of books on a wooden table' }]);
    expect(t.created_at).toMatch(/^\w{3} \w{3} \d\d \d\d:\d\d:\d\d \+0000 2026$/);
    expect(t.views).toBe(1101);
    expect(t.likes).toBe(141);
  });

  it('uses note_tweet for long posts (old user shape)', () => {
    const t = byId(r, 102);
    expect(t.author.screen_name).toBe('grace_sample');
    expect(t.text.startsWith('This is a long post that goes past the old limit.\n\nSecond paragraph, with a link https://example.org/notes and')).toBe(true);
    expect(t.text).toContain('5 < 6 & done.');
    expect(t.text).not.toContain('t.co');
    expect(t.text).not.toContain('i/web/status');
  });

  it('maps quotes one level deep', () => {
    const t = byId(r, 103);
    expect(t.quote?.id).toBe(ID(99));
    expect(t.quote?.url).toBe(`https://x.com/lin_placeholder/status/${ID(99)}`);
    expect(t.quote?.text).toBe('Original thought, with a picture');
    expect(t.quote?.media?.photos?.[0]).toMatchObject({ url: 'https://pbs.twimg.com/media/SYNTHPHOTO099.jpg?name=orig', altText: '' });
    expect(t.quote?.quote).toBeNull();
  });

  it('unwraps TweetWithVisibilityResults; video = highest-bitrate mp4; gif type', () => {
    const v = byId(r, 104);
    expect(v.text).toBe('Launch clip');
    expect(v.media?.videos).toEqual([
      { url: 'https://video.twimg.com/amplify_video/1890000000000050401/vid/avc1/1280x720/SYNTHHIGH.mp4?tag=14', thumbnail_url: 'https://pbs.twimg.com/amplify_video_thumb/1890000000000050401/img/SYNTHTHUMB.jpg', duration: 12.345, type: 'video' },
    ]);
    const g = byId(r, 105);
    expect(g.media?.videos?.[0]).toMatchObject({ url: 'https://video.twimg.com/tweet_video/SYNTHGIF.mp4', type: 'gif', duration: 0 });
    expect(g.media?.photos).toBeUndefined();
  });

  it('keeps an Article preview as a one-block article marked preview', () => {
    const a = byId(r, 107);
    expect(a.text).toBe('http://x.com/i/article/1890000000000077701');
    expect(a.article).toMatchObject({ id: '1890000000000077701', title: 'A Short Field Guide', preview: true });
    expect(a.article.content.blocks).toHaveLength(1);
    expect(a.article.content.blocks[0].text).toBe('A preview of the article body as the timeline shows it.');
    expect(a.article.cover_media.media_info.original_img_url).toBe('https://pbs.twimg.com/media/SYNTHCOVER.jpg');
  });

  it('drops the hidden reply mentions (display_text_range)', () => {
    const t = byId(r, 108);
    expect(t.text).toBe('Thanks, that helps a lot.');
    expect(t.replying_to_status).toBe(ID(104));
  });

  it('reads other bookmark timelines by shape, not by path', () => {
    const f = parseGraphql(folder);
    expect(f.tweets.map(t => t.id)).toEqual([ID(111), ID(112)]);
    expect(f.cursors.bottom).toBe('SYNTHCURSOR2');
  });
});

describe('parseGraphql: TweetDetail and TweetResultByRestId', () => {
  it('maps the conversation; only top-level entries count as entries', () => {
    const r = parseGraphql(detail);
    expect(r.tweets.map(t => t.id)).toEqual([ID(201), ID(202), ID(203)]);
    expect(r.entries.map(e => e.id)).toEqual([ID(201), ID(202)]);
    expect(r.tweets[1].replying_to_status).toBe(ID(201));
    expect(r.tweets[2].text).toBe('Agreed!');
    expect(r.cursors.bottom).toBe('SYNTHDETAILBOTTOM');
  });

  it('keeps the full Draft.js content of an Article', () => {
    const r = parseGraphql(article);
    expect(r.tweets).toHaveLength(1);
    const a = r.tweets[0].article;
    expect(a.preview).toBeUndefined();
    expect(a.title).toBe('Notes on Building Small Tools');
    expect(a.content.blocks.length).toBeGreaterThan(10);
    expect(Array.isArray(a.content.entityMap)).toBe(true);
    expect(a.media_entities[0].media_info.original_img_url).toBe('https://pbs.twimg.com/media/SYNTHART1.jpg');
  });

  it('maps a repost to its original', () => {
    const orig = (bookmarks as any).data.bookmark_timeline_v2.timeline.instructions[0].entries[0].content.itemContent.tweet_results.result;
    const rt = { data: { tweetResult: { result: { __typename: 'Tweet', rest_id: '1890000000000099999', legacy: { full_text: 'RT @ada_example: …', retweeted_status_result: { result: orig } } } } } };
    expect(parseGraphql(rt).tweets.map(t => t.id)).toEqual([ID(101)]);
  });
});

describe('parseGraphql: broken input never throws', () => {
  const cases: [string, unknown][] = [
    ['null', null],
    ['string', 'nope'],
    ['empty object', {}],
    ['data null', { data: null }],
    ['instructions not an array', { data: { t: { instructions: 'x' } } }],
    ['garbage entries', { data: { t: { instructions: [null, 1, 'a', { entries: [null, 5, { content: null }, { content: { itemContent: { __typename: 'TimelineTweet', tweet_results: { result: { __typename: 'Tweet', rest_id: 'abc', legacy: {} } } } } }] }] } } }],
    ['legacy missing', { data: { tweetResult: { result: { __typename: 'Tweet', rest_id: '1' } } } }],
    ['unknown typename', { data: { tweetResult: { result: { __typename: 'Card', rest_id: '1', legacy: {} } } } }],
    ['media wrong types', { data: { tweetResult: { result: { __typename: 'Tweet', rest_id: '1', legacy: { full_text: 5, entities: { urls: 'x', media: [1, null, { type: 'photo' }] }, extended_entities: { media: 'x' } }, core: 'x' } } } }],
    ['cyclic-looking deep nesting', { data: { a: { b: { c: { d: { e: { f: { g: { h: { instructions: [] } } } } } } } } } }],
  ];
  for (const [name, input] of cases) {
    it(name, () => {
      const r = parseGraphql(input);
      expect(Array.isArray(r.tweets)).toBe(true);
      for (const t of r.tweets) expect(t.id).toMatch(/^\d+$/);
    });
  }

  it('marks a body without instructions as not recognized (X format change → parse_fail later)', () => {
    expect(parseGraphql({ data: { something_new: { items: [] } } }).recognized).toBe(false);
    expect(parseGraphql(bookmarks).recognized).toBe(true);
  });

  it('a post with a broken text field still maps with empty text', () => {
    const r = parseGraphql({ data: { tweetResult: { result: { __typename: 'Tweet', rest_id: '42', legacy: { full_text: 5 } } } } });
    expect(r.tweets[0]).toMatchObject({ id: '42', text: '', author: { name: '', screen_name: '' }, url: 'https://x.com/i/status/42' });
  });
});

describe('fixText and bookmark mutations', () => {
  it('follows FxTwitter link rules', () => {
    expect(fixText('a https://t.co/abcdefghij b https://t.co/klmnopqrst', [{ url: 'https://t.co/abcdefghij', expanded_url: 'https://e.com/x' }])).toBe('a https://e.com/x b');
    expect(fixText('x &lt;y&gt; &amp;amp;', [])).toBe('x <y> &amp;');
  });

  it('reads tweet_id from the mutation variables', () => {
    expect(bookmarkMutationId(JSON.stringify({ variables: { tweet_id: ID(101) }, queryId: 'q' }))).toBe(ID(101));
    expect(bookmarkMutationId('{"variables":{"tweet_id":"12a"}}')).toBeNull();
    expect(bookmarkMutationId('not json')).toBeNull();
    expect(bookmarkMutationId(undefined)).toBeNull();
  });
});
