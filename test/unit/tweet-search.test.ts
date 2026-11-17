import { describe, expect, it } from 'vitest';
import { googleSearchUrl, handleFrom, xQuery, xSearchUrl } from '../../src/components/TweetSearch';

describe('Tweet Finder search builder', () => {
  it('reads a handle from @names, profile links and post links', () => {
    expect(handleFrom('@NASA')).toBe('NASA');
    expect(handleFrom('＠NASA')).toBe('NASA');
    expect(handleFrom('nasa_hubble')).toBe('nasa_hubble');
    expect(handleFrom('https://x.com/NASA')).toBe('NASA');
    expect(handleFrom('twitter.com/NASA/status/123')).toBe('NASA');
    expect(handleFrom('https://mobile.twitter.com/@NASA?lang=en')).toBe('NASA');
  });

  it('rejects things that are not an account', () => {
    expect(handleFrom('')).toBe('');
    expect(handleFrom('hello world')).toBe('');
    expect(handleFrom('https://x.com/search?q=a')).toBe('');
    expect(handleFrom('https://x.com/i/web/status/1')).toBe('');
    expect(handleFrom('https://example.com/NASA')).toBe('');
    expect(handleFrom('waytoolonghandle_1234')).toBe('');
  });

  it('builds the X query and drops invalid dates', () => {
    expect(xQuery('NASA', ' "Artemis" ', '2022-11-01', '2022-12-01')).toBe('from:NASA "Artemis" since:2022-11-01 until:2022-12-01');
    expect(xQuery('NASA', '', '', '')).toBe('from:NASA');
    expect(xQuery('NASA', '', 'yesterday', '')).toBe('from:NASA');
    expect(xSearchUrl('from:NASA "a b"')).toBe('https://x.com/search?q=from%3ANASA%20%22a%20b%22&src=typed_query&f=live');
  });

  it('builds a Google query over both hosts with after/before', () => {
    const u = new URL(googleSearchUrl('NASA', 'moon', '2020-01-01', ''));
    expect(u.hostname).toBe('www.google.com');
    expect(u.searchParams.get('q')).toBe('(site:x.com/NASA/status OR site:twitter.com/NASA/status) moon after:2020-01-01');
  });
});
