/** Archive panel detection (extension/src/content/gone.ts) and X theme detection (content/anchors.ts). */
import { describe, expect, it } from 'vitest';
import { themeFromColor } from '../../extension/src/content/anchors';
import { goneFromDetail, goneOnPage, waybackTs } from '../../extension/src/content/gone';
import { fixture } from './ext-fixtures';

const ID = (n: number) => `18900000000000${String(n).padStart(5, '0')}`;
const detail = fixture('tweet-detail.json');

/** A TweetDetail answer whose focal entry is a tombstone. */
function tombstoned(id: string) {
  return {
    data: {
      threaded_conversation_with_injections_v2: {
        instructions: [
          {
            type: 'TimelineAddEntries',
            entries: [{ entryId: `tweet-${id}`, sortIndex: '1', content: { entryType: 'TimelineTimelineItem', itemContent: { itemType: 'TimelineTweet', __typename: 'TimelineTweet', tweet_results: { result: { __typename: 'TweetTombstone', tombstone: {} } } } } }],
          },
        ],
      },
    },
  };
}

describe('gone: from the TweetDetail answer', () => {
  it('a post that loaded is not gone', () => {
    expect(goneFromDetail(detail, ID(202))).toBe(false);
  });
  it('a tombstone entry for the page id is gone', () => {
    expect(goneFromDetail(tombstoned(ID(999)), ID(999))).toBe(true);
    expect(goneFromDetail(tombstoned(ID(999)), ID(999), 'TweetResultByRestId')).toBe(true);
  });
  it('"No status found" (code 144) with no data is gone', () => {
    expect(goneFromDetail({ data: {}, errors: [{ message: '_Missing: No status found with that ID.', code: 144 }] }, ID(1))).toBe(true);
  });
  it('a single unavailable result counts on TweetDetail only', () => {
    const body = { data: { tweetResult: { result: { __typename: 'TweetUnavailable', reason: 'Suspended' } } } };
    expect(goneFromDetail(body, ID(1), 'TweetDetail')).toBe(true);
    // TweetResultByRestId also loads quoted posts: an id-less answer says nothing about the page's post.
    expect(goneFromDetail(body, ID(1), 'TweetResultByRestId')).toBe(false);
  });
  it('unrelated errors, other posts and junk are not gone', () => {
    expect(goneFromDetail({ data: {}, errors: [{ message: 'Rate limit exceeded', code: 88 }] }, ID(1))).toBe(false);
    expect(goneFromDetail(detail, ID(555))).toBe(false);
    expect(goneFromDetail(null, ID(1))).toBe(false);
    expect(goneFromDetail('nope', ID(1))).toBe(false);
  });
});

describe('gone: from the page', () => {
  it('error state on a status page without the post', () => {
    expect(goneOnPage({ onStatusPage: true, errorState: true, postRendered: false })).toBe(true);
    expect(goneOnPage({ onStatusPage: true, errorState: true, postRendered: true })).toBe(false);
    expect(goneOnPage({ onStatusPage: false, errorState: true, postRendered: false })).toBe(false);
    expect(goneOnPage({ onStatusPage: true, errorState: false, postRendered: false })).toBe(false);
  });
  it('Wayback timestamp', () => {
    expect(waybackTs(new Date('2025-03-04T05:06:07.890Z'))).toBe('20250304050607');
  });
});

describe('X theme from the page background', () => {
  it('light, dim, dark', () => {
    expect(themeFromColor('rgb(255, 255, 255)')).toBe('light');
    expect(themeFromColor('rgb(21, 32, 43)')).toBe('dim');
    expect(themeFromColor('rgb(0, 0, 0)')).toBe('dark');
    expect(themeFromColor('rgba(0, 0, 0, 0)')).toBe('light');
    expect(themeFromColor('')).toBe('light');
    expect(themeFromColor('rgb(0 0 0 / 1)')).toBe('dark');
  });
});
