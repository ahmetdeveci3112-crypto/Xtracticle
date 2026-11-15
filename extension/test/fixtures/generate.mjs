// Synthetic X GraphQL + FxTwitter fixtures for the extension's mapper tests. No real accounts, posts or media.
import fs from 'node:fs';
import path from 'node:path';

// Regenerate: node extension/test/fixtures/generate.mjs  (writes next to this file)
const out = process.argv[2] || path.dirname(new URL(import.meta.url).pathname);
fs.mkdirSync(out, { recursive: true });
const write = (f, v) => fs.writeFileSync(path.join(out, f), JSON.stringify(v, null, 2) + '\n');

const ID = n => `18900000000000${String(n).padStart(5, '0')}`;
const created = i => new Date(Date.UTC(2026, 10, 1, 9, i, 0)).toUTCString().replace(/^(\w+), (\d+) (\w+) (\d+) (.+) GMT$/, '$1 $3 $2 $5 +0000 $4');
// → "Sun Nov 01 09:00:00 +0000 2026"

const ADA = { rest: '1000000001', name: 'Ada Example', handle: 'ada_example', avatar: 'https://pbs.twimg.com/profile_images/1000000001/ada_normal.jpg', modern: true };
const GRACE = { rest: '1000000002', name: 'Grace Sample', handle: 'grace_sample', avatar: 'https://pbs.twimg.com/profile_images/1000000002/grace_normal.png', modern: false };
const LIN = { rest: '1000000003', name: 'Lin Placeholder', handle: 'lin_placeholder', avatar: 'https://pbs.twimg.com/profile_images/1000000003/lin_normal.jpg', modern: true };

function gqlUser(u) {
  const legacy = { description: '', followers_count: 10, friends_count: 5, profile_image_url_https: u.modern ? undefined : u.avatar };
  if (!u.modern) Object.assign(legacy, { name: u.name, screen_name: u.handle });
  const r = { __typename: 'User', id: Buffer.from(`User:${u.rest}`).toString('base64'), rest_id: u.rest, legacy };
  if (u.modern) {
    r.core = { name: u.name, screen_name: u.handle, created_at: 'Mon Jan 01 00:00:00 +0000 2018' };
    r.avatar = { image_url: u.avatar };
  }
  return { user_results: { result: r } };
}

function fxAuthor(u) {
  return {
    screen_name: u.handle, url: `https://x.com/${u.handle}`, id: u.rest, followers: 10, following: 5, name: u.name,
    description: '', avatar_url: u.avatar.replace('_normal.', '_200x200.'), protected: false,
  };
}

/** One synthetic post, both as X GraphQL and as FxTwitter answers it. */
function post(o) {
  const id = ID(o.n);
  const legacy = {
    bookmark_count: 3, bookmarked: true, created_at: created(o.n % 60), conversation_id_str: o.conversation || id,
    display_text_range: o.range || [0, Array.from(o.full).length],
    entities: { hashtags: [], symbols: [], timestamps: [], urls: o.urls || [], user_mentions: o.mentions || [] },
    favorite_count: 40 + o.n, favorited: false, full_text: o.full, is_quote_status: !!o.quote, lang: 'en',
    quote_count: 1, reply_count: 2, retweet_count: 4, retweeted: false, user_id_str: o.user.rest, id_str: id,
  };
  if (o.media) {
    legacy.entities.media = o.media.map(m => ({ ...m, video_info: undefined }));
    legacy.extended_entities = { media: o.media };
  }
  if (o.replyTo) Object.assign(legacy, { in_reply_to_status_id_str: o.replyTo.id, in_reply_to_screen_name: o.replyTo.handle, in_reply_to_user_id_str: o.replyTo.rest });
  if (o.quote) Object.assign(legacy, { quoted_status_id_str: o.quote.gql.rest_id, quoted_status_permalink: { url: 'https://t.co/QQQQQQQQQQ', expanded: o.quote.fx.url, display: 'x.com/…' } });
  const gql = {
    __typename: 'Tweet', rest_id: id,
    core: gqlUser(o.user),
    unmention_data: {}, edit_control: { edit_tweet_ids: [id], editable_until_msecs: '1793000000000', is_edit_eligible: true, edits_remaining: '5' },
    is_translatable: false, views: { count: String(1000 + o.n), state: 'EnabledWithCount' }, source: '<a href="https://example.com" rel="nofollow">Synthetic</a>',
    legacy,
  };
  if (o.note) gql.note_tweet = { is_expandable: true, note_tweet_results: { result: { id: Buffer.from(`NoteTweetResults:${id}`).toString('base64'), text: o.note.text, entity_set: { hashtags: [], symbols: [], urls: o.note.urls || [], user_mentions: [] } } } };
  if (o.quote) gql.quoted_status_result = { result: o.quote.gql };
  if (o.article) gql.article = { article_results: { result: o.article.gql } };

  const fx = {
    url: `https://x.com/${o.user.handle}/status/${id}`, id, text: o.fxText,
    raw_text: { text: o.full, display_text_range: legacy.display_text_range, facets: [] },
    author: fxAuthor(o.user), replies: 2, retweets: 4, likes: 40 + o.n, bookmarks: 3, quotes: 1,
    created_at: legacy.created_at, created_timestamp: Math.floor(Date.parse(legacy.created_at) / 1000), views: 1000 + o.n,
    is_note_tweet: !!o.note, community_note: null, lang: 'en',
    replying_to: o.replyTo ? { screen_name: o.replyTo.handle, status: o.replyTo.id } : null,
    replying_to_status: o.replyTo ? o.replyTo.id : null,
    twitter_card: 'tweet', color: null, provider: 'twitter', reposted_by: null,
  };
  if (o.fxMedia) fx.media = o.fxMedia;
  if (o.quote) fx.quote = o.quote.fx;
  if (o.article) fx.article = o.article.fx;
  return { id, gql, fx };
}

const photo = (key, w, h, alt, tco) => ({
  display_url: 'pic.x.com/' + tco.slice(-10), expanded_url: `https://x.com/i/status/photo/1`, id_str: key, indices: [0, 0], media_key: `3_${key}`,
  media_url_https: `https://pbs.twimg.com/media/${key}.jpg`, type: 'photo', url: tco,
  ...(alt !== undefined ? { ext_alt_text: alt } : {}),
  original_info: { width: w, height: h, focus_rects: [] }, sizes: {},
});
const fxPhoto = (key, w, h, alt) => ({ type: 'photo', id: key, url: `https://pbs.twimg.com/media/${key}.jpg?name=orig`, width: w, height: h, altText: alt ?? '' });

/* ─── Posts ─── */

const p101 = post({
  n: 101, user: ADA,
  full: 'Reading list for the weekend &amp; beyond: https://t.co/AAAAAAAAAA https://t.co/BBBBBBBBBB',
  urls: [{ display_url: 'example.com/reading', expanded_url: 'https://example.com/reading', url: 'https://t.co/AAAAAAAAAA', indices: [43, 66] }],
  media: [photo('SYNTHPHOTO101', 1600, 1200, 'A stack of books on a wooden table', 'https://t.co/BBBBBBBBBB')],
  fxText: 'Reading list for the weekend & beyond: https://example.com/reading',
  fxMedia: { all: [fxPhoto('SYNTHPHOTO101', 1600, 1200, 'A stack of books on a wooden table')], photos: [fxPhoto('SYNTHPHOTO101', 1600, 1200, 'A stack of books on a wooden table')] },
});

const noteText = 'This is a long post that goes past the old limit.\n\nSecond paragraph, with a link https://t.co/DDDDDDDDDD and a few more words.\nA single line break here, and 5 < 6 &amp; done.\n\n' + 'Filler sentence for length. '.repeat(12).trim();
const p102 = post({
  n: 102, user: GRACE,
  full: 'This is a long post that goes past the old limit.\n\nSecond paragraph, with a link https://t.co/DDDDDDDDDD and a few… https://t.co/CCCCCCCCCC',
  urls: [
    { display_url: 'example.org/notes', expanded_url: 'https://example.org/notes', url: 'https://t.co/DDDDDDDDDD', indices: [80, 103] },
    { display_url: 'x.com/i/web/status/1…', expanded_url: `https://twitter.com/i/web/status/${ID(102)}`, url: 'https://t.co/CCCCCCCCCC', indices: [118, 141] },
  ],
  note: { text: noteText, urls: [{ display_url: 'example.org/notes', expanded_url: 'https://example.org/notes', url: 'https://t.co/DDDDDDDDDD', indices: [80, 103] }] },
  fxText: noteText.replace('https://t.co/DDDDDDDDDD', 'https://example.org/notes').replace('&amp;', '&'),
});

const q099 = post({
  n: 99, user: LIN,
  full: 'Original thought, with a picture https://t.co/EEEEEEEEEE',
  media: [photo('SYNTHPHOTO099', 1200, 800, undefined, 'https://t.co/EEEEEEEEEE')],
  fxText: 'Original thought, with a picture',
  fxMedia: { all: [fxPhoto('SYNTHPHOTO099', 1200, 800)], photos: [fxPhoto('SYNTHPHOTO099', 1200, 800)] },
});
// FxTwitter's quote object is a status without a nested quote.
const quoteFx = { type: 'status', ...q099.fx };
const p103 = post({ n: 103, user: ADA, full: 'Worth reading this one.', quote: { gql: q099.gql, fx: quoteFx }, fxText: 'Worth reading this one.' });

const video104 = {
  display_url: 'pic.x.com/FFFFFFFFFF', expanded_url: 'https://x.com/i/status/video/1', id_str: '1890000000000050401', indices: [12, 35], media_key: '13_1890000000000050401',
  media_url_https: 'https://pbs.twimg.com/amplify_video_thumb/1890000000000050401/img/SYNTHTHUMB.jpg', type: 'video', url: 'https://t.co/FFFFFFFFFF',
  original_info: { width: 1280, height: 720, focus_rects: [] }, sizes: {},
  video_info: {
    aspect_ratio: [16, 9], duration_millis: 12345,
    variants: [
      { content_type: 'application/x-mpegURL', url: 'https://video.twimg.com/amplify_video/1890000000000050401/pl/SYNTH.m3u8?tag=14' },
      { bitrate: 832000, content_type: 'video/mp4', url: 'https://video.twimg.com/amplify_video/1890000000000050401/vid/avc1/640x360/SYNTHLOW.mp4?tag=14' },
      { bitrate: 2176000, content_type: 'video/mp4', url: 'https://video.twimg.com/amplify_video/1890000000000050401/vid/avc1/1280x720/SYNTHHIGH.mp4?tag=14' },
    ],
  },
};
const fxVideo104 = { url: 'https://video.twimg.com/amplify_video/1890000000000050401/vid/avc1/1280x720/SYNTHHIGH.mp4?tag=14', thumbnail_url: video104.media_url_https, duration: 12.345, width: 1280, height: 720, format: 'video/mp4', type: 'video' };
const p104 = post({ n: 104, user: GRACE, full: 'Launch clip https://t.co/FFFFFFFFFF', media: [video104], fxText: 'Launch clip', fxMedia: { all: [fxVideo104], videos: [fxVideo104] } });

const gif105 = {
  display_url: 'pic.x.com/HHHHHHHHHH', expanded_url: 'https://x.com/i/status/photo/1', id_str: '1890000000000050501', indices: [0, 23], media_key: '16_1890000000000050501',
  media_url_https: 'https://pbs.twimg.com/tweet_video_thumb/SYNTHGIF.jpg', type: 'animated_gif', url: 'https://t.co/HHHHHHHHHH',
  original_info: { width: 480, height: 270, focus_rects: [] }, sizes: {},
  video_info: { aspect_ratio: [16, 9], variants: [{ bitrate: 0, content_type: 'video/mp4', url: 'https://video.twimg.com/tweet_video/SYNTHGIF.mp4' }] },
};
const fxGif105 = { url: 'https://video.twimg.com/tweet_video/SYNTHGIF.mp4', thumbnail_url: gif105.media_url_https, duration: 0, width: 480, height: 270, format: 'video/mp4', type: 'gif' };
const p105 = post({ n: 105, user: LIN, full: 'Me when the build passes https://t.co/HHHHHHHHHH', media: [gif105], fxText: 'Me when the build passes', fxMedia: { all: [fxGif105], videos: [fxGif105] } });

const cover = { id: 'QXBpTWVkaWE6MQ==', media_key: '3_1890000000000090001', media_id: '1890000000000090001', media_info: { __typename: 'ApiImage', original_img_height: 900, original_img_width: 1600, original_img_url: 'https://pbs.twimg.com/media/SYNTHCOVER.jpg', color_info: { palette: [] } } };
const p107 = post({
  n: 107, user: ADA, full: 'https://t.co/GGGGGGGGGG',
  urls: [{ display_url: 'x.com/i/article/1890…', expanded_url: 'http://x.com/i/article/1890000000000077701', url: 'https://t.co/GGGGGGGGGG', indices: [0, 23] }],
  article: { gql: { rest_id: '1890000000000077701', id: 'QXJ0aWNsZUVudGl0eToxODkw', title: 'A Short Field Guide', preview_text: 'A preview of the article body as the timeline shows it.', cover_media: cover, lifecycle_state: { modified_at_secs: 1793000000 }, metadata: { first_published_at_secs: 1793000000 } }, fx: null },
  fxText: 'http://x.com/i/article/1890000000000077701',
});

const p108 = post({
  n: 108, user: LIN, full: '@grace_sample Thanks, that helps a lot.', range: [14, 39],
  mentions: [{ id_str: GRACE.rest, name: GRACE.name, screen_name: GRACE.handle, indices: [0, 13] }],
  replyTo: { id: ID(104), handle: GRACE.handle, rest: GRACE.rest },
  fxText: 'Thanks, that helps a lot.',
});

const entry = (p, sort) => ({
  entryId: `tweet-${p.id}`, sortIndex: sort,
  content: { entryType: 'TimelineTimelineItem', __typename: 'TimelineTimelineItem', itemContent: { itemType: 'TimelineTweet', __typename: 'TimelineTweet', tweet_results: { result: p.gql }, tweetDisplayType: 'Tweet' } },
});
const withVisibility = e => {
  const r = e.content.itemContent.tweet_results.result;
  e.content.itemContent.tweet_results.result = { __typename: 'TweetWithVisibilityResults', tweet: { ...r, __typename: undefined }, limitedActionResults: { limited_actions: [{ action: 'Reply', prompt: {} }] } };
  return e;
};
const cursor = (type, value, sort) => ({ entryId: `cursor-${type.toLowerCase()}-${sort}`, sortIndex: sort, content: { entryType: 'TimelineTimelineCursor', __typename: 'TimelineTimelineCursor', value, cursorType: type } });

const tombstone = {
  entryId: `tweet-${ID(106)}`, sortIndex: '1859000000000000095',
  content: { entryType: 'TimelineTimelineItem', __typename: 'TimelineTimelineItem', itemContent: { itemType: 'TimelineTweet', __typename: 'TimelineTweet', tweet_results: { result: { __typename: 'TweetTombstone', tombstone: { __typename: 'TextTombstone', text: { rtl: false, text: 'This Post is unavailable. Learn more', entities: [] } } } } } },
};
const promoted = {
  entryId: `promoted-tweet-${ID(190)}-abc`, sortIndex: '1859000000000000093',
  content: { entryType: 'TimelineTimelineItem', __typename: 'TimelineTimelineItem', itemContent: { itemType: 'TimelineTweet', __typename: 'TimelineTweet', tweet_results: { result: post({ n: 190, user: LIN, full: 'An ad', fxText: 'An ad' }).gql }, promotedMetadata: { advertiser_results: {} } } },
};

write('bookmarks.json', {
  data: { bookmark_timeline_v2: { timeline: { instructions: [{ type: 'TimelineAddEntries', entries: [
    entry(p101, '1859000000000000099'),
    entry(p102, '1859000000000000098'),
    entry(p103, '1859000000000000097'),
    withVisibility(entry(p104, '1859000000000000096')),
    tombstone,
    entry(p105, '1859000000000000094'),
    promoted,
    entry(p107, '1859000000000000092'),
    entry(p108, '1859000000000000091'),
    cursor('Top', 'SYNTHCURSORTOP', '1859000000000000100'),
    cursor('Bottom', 'SYNTHCURSORBOTTOM', '1859000000000000090'),
  ] }, { type: 'TimelineTerminateTimeline', direction: 'Top' }], responseObjects: { feedbackActions: [] } } } },
});

const p111 = post({ n: 111, user: GRACE, full: 'Second page post one', fxText: 'Second page post one' });
const p112 = post({ n: 112, user: ADA, full: 'Second page post two', fxText: 'Second page post two' });
write('bookmarks-folder.json', {
  data: { bookmark_collection_timeline: { timeline: { instructions: [{ type: 'TimelineAddEntries', entries: [entry(p111, '1859000000000000089'), entry(p112, '1859000000000000088'), cursor('Bottom', 'SYNTHCURSOR2', '1859000000000000087')] }] } } },
});

/* ─── TweetDetail: a self-thread (201 → 202) and a reply from someone else (203) ─── */
const p201 = post({ n: 201, user: ADA, full: '1/ A thread about small tools. https://t.co/JJJJJJJJJJ', media: [photo('SYNTHPHOTO201', 1000, 1000, 'A hammer', 'https://t.co/JJJJJJJJJJ')], fxText: '1/ A thread about small tools.', fxMedia: { all: [fxPhoto('SYNTHPHOTO201', 1000, 1000, 'A hammer')], photos: [fxPhoto('SYNTHPHOTO201', 1000, 1000, 'A hammer')] } });
const p202 = post({ n: 202, user: ADA, full: '2/ Keep them boring, keep them fixable.\n\nThat is all.', replyTo: { id: p201.id, handle: ADA.handle, rest: ADA.rest }, conversation: p201.id, fxText: '2/ Keep them boring, keep them fixable.\n\nThat is all.' });
const p203 = post({ n: 203, user: GRACE, full: '@ada_example Agreed!', range: [13, 20], replyTo: { id: p202.id, handle: ADA.handle, rest: ADA.rest }, conversation: p201.id, fxText: 'Agreed!' });
const moduleEntry = (p, sort) => ({
  entryId: `conversationthread-${p.id}`, sortIndex: sort,
  content: { entryType: 'TimelineTimelineModule', __typename: 'TimelineTimelineModule', displayType: 'VerticalConversation', items: [
    { entryId: `conversationthread-${p.id}-tweet-${p.id}`, item: { itemContent: { itemType: 'TimelineTweet', __typename: 'TimelineTweet', tweet_results: { result: p.gql }, tweetDisplayType: 'Tweet' } } },
    { entryId: `conversationthread-${p.id}-cursor-showmore-1`, item: { itemContent: { itemType: 'TimelineTimelineCursor', __typename: 'TimelineTimelineCursor', value: 'SYNTHSHOWMORE', cursorType: 'ShowMore' } } },
  ] },
});
write('tweet-detail.json', {
  data: { threaded_conversation_with_injections_v2: { instructions: [
    { type: 'TimelineClearCache' },
    { type: 'TimelineAddEntries', entries: [entry(p201, '7000000000000000003'), entry(p202, '7000000000000000002'), moduleEntry(p203, '7000000000000000001'), cursor('Bottom', 'SYNTHDETAILBOTTOM', '7000000000000000000')] },
    { type: 'TimelineTerminateTimeline', direction: 'Top' },
  ] } },
});

/* ─── TweetResultByRestId: a full X Article (content_state) ─── */
const blocks = [];
const entityMap = [];
const ent = (type, data) => (entityMap.push({ key: String(entityMap.length), value: { type, mutability: type === 'LINK' ? 'MUTABLE' : 'IMMUTABLE', data } }), entityMap.length - 1);
const block = (type, text, extra = {}) => blocks.push({ key: `b${blocks.length}`, type, text, depth: 0, inlineStyleRanges: [], entityRanges: [], data: {}, ...extra });
block('header-two', 'Why small tools');
{
  const text = 'Small tools are easy to read and easy to fix. See the guide for more.';
  const k = ent('LINK', { url: 'https://example.com/guide' });
  block('unstyled', text, { inlineStyleRanges: [{ offset: 0, length: 11, style: 'Bold' }, { offset: text.indexOf('read'), length: 4, style: 'Italic' }], entityRanges: [{ offset: text.indexOf('the guide'), length: 9, key: k }] });
}
block('atomic', ' ', { entityRanges: [{ offset: 0, length: 1, key: ent('MEDIA', { caption: 'A tidy workbench', mediaItems: [{ localMediaId: '1', mediaCategory: 'DraftTweetImage', mediaId: '1890000000000090002' }] }) }] });
block('unordered-list-item', 'One job each');
block('unordered-list-item', 'Plain files');
block('ordered-list-item', 'Write it');
block('ordered-list-item', 'Ship it');
block('code-block', 'npm run build');
block('code-block', 'npm test');
block('blockquote', 'Boring is a feature.');
block('atomic', ' ', { entityRanges: [{ offset: 0, length: 1, key: ent('DIVIDER', {}) }] });
block('atomic', ' ', { entityRanges: [{ offset: 0, length: 1, key: ent('TWEET', { tweetId: ID(101) }) }] });
block('header-three', 'Ünicode & emoji 🧰 check');
const artGql = {
  rest_id: '1890000000000077702', id: 'QXJ0aWNsZUVudGl0eToyMDI2', title: 'Notes on Building Small Tools', preview_text: 'Why small tools…',
  cover_media: cover, content_state: { blocks, entityMap },
  media_entities: [{ id: 'QXBpTWVkaWE6Mg==', media_key: '3_1890000000000090002', media_id: '1890000000000090002', media_info: { __typename: 'ApiImage', original_img_height: 600, original_img_width: 800, original_img_url: 'https://pbs.twimg.com/media/SYNTHART1.jpg' } }],
  lifecycle_state: { modified_at_secs: 1793000000 }, metadata: { first_published_at_secs: 1793000000 },
};
const artFx = { id: artGql.rest_id, title: artGql.title, preview_text: artGql.preview_text, cover_media: cover, content: { blocks, entityMap }, media_entities: artGql.media_entities, created_at: '2026-11-01T09:00:00.000Z', modified_at: '2026-11-01T09:00:00.000Z' };
const p301 = post({
  n: 301, user: ADA, full: 'https://t.co/KKKKKKKKKK',
  urls: [{ display_url: 'x.com/i/article/1890…', expanded_url: 'http://x.com/i/article/1890000000000077702', url: 'https://t.co/KKKKKKKKKK', indices: [0, 23] }],
  article: { gql: artGql, fx: artFx }, fxText: 'http://x.com/i/article/1890000000000077702',
});
write('tweet-result-article.json', { data: { tweetResult: { result: p301.gql } } });

/* ─── FxTwitter answers for the same posts (what the site's /api/thread normalises) ─── */
const v1 = p => ({ code: 200, message: 'OK', tweet: p.fx });
const v2 = (main, thread) => ({ code: 200, status: main.fx, thread: thread.map(t => t.fx), author: main.fx.author });
const fx = {};
for (const p of [p101, p102, p103, p104, p105, p108]) {
  fx[`/2/thread/${p.id}`] = v2(p, [p]);
  fx[`/status/${p.id}`] = v1(p);
}
fx[`/2/thread/${p201.id}`] = v2(p201, [p201, p202]);
fx[`/2/thread/${p202.id}`] = v2(p202, [p201, p202]);
fx[`/2/thread/${p301.id}`] = v2(p301, [p301]);
fx[`/status/${p301.id}`] = v1(p301);
write('fxtwitter.json', fx);
console.log('ok', Object.keys(fx).length);
