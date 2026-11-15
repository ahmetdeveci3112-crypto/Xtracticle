/**
 * Turns one hook.js message into the capture:posts payload for the service worker (pure; unit-tested).
 * The message is untrusted page data: content/index.ts has already checked source, tag and size.
 */
import type { FxTweet } from '../../../src/shared/fx';
import type { CapturePayload } from '../messages';
import { bookmarkMutationId, parseGraphql, type GqlResult } from '../x/graphql';
import { categoryOf, type HookMessage, type XtConfig } from '../x/ops';

/** Posts seen recently on this tab (TweetDetail, Bookmarks), so CreateBookmark can archive the post at once. */
export class RecentPosts {
  private map = new Map<string, FxTweet>();
  constructor(private max = 300) {}
  add(tweets: FxTweet[]) {
    for (const t of tweets) {
      this.map.delete(t.id);
      this.map.set(t.id, t);
      if (this.map.size > this.max) this.map.delete(this.map.keys().next().value as string);
    }
  }
  get(id: string) {
    return this.map.get(id);
  }
  get size() {
    return this.map.size;
  }
}

/** The signed-in account id from the `twid` cookie ("u%3D123" → "123"), or null. */
export function accountFromCookie(cookie: string): string | null {
  const m = /(?:^|;\s*)twid=([^;]*)/.exec(cookie || '');
  if (!m) return null;
  let v = m[1];
  try {
    v = decodeURIComponent(v);
  } catch {
    return null;
  }
  const id = /^"?u=(\d{1,25})"?$/.exec(v);
  return id ? id[1] : null;
}

export interface Handled {
  /** For the SW; null = nothing to store. */
  capture: CapturePayload | null;
  /** The mapped response, when there was one (for counters / later UI). */
  result: GqlResult | null;
}

export function handleHookMessage(m: HookMessage, config: XtConfig, accountId: string | null, recent: RecentPosts): Handled {
  const none: Handled = { capture: null, result: null };
  if (!config.flags.capture) return none;
  const cat = categoryOf(config.ops, m.op);
  if (!cat || cat === 'user') return none;

  if (cat === 'bookmarkAdd' || cat === 'bookmarkRemove') {
    const id = bookmarkMutationId(m.req);
    if (!id) return none;
    if (cat === 'bookmarkRemove') return { capture: { accountId, source: 'bookmark', tweets: [], removed: [id] }, result: null };
    const t = recent.get(id);
    // Bookmarked from a post we have not seen in a listened response: it is archived on the next Bookmarks visit.
    return t ? { capture: { accountId, source: 'bookmark', tweets: [t], entries: [{ id, sortIndex: null }] }, result: null } : none;
  }

  let json: unknown;
  try {
    json = JSON.parse(m.body);
  } catch {
    return none;
  }
  const result = parseGraphql(json);
  recent.add(result.tweets);
  if (cat === 'detail') return { capture: null, result }; // kept for the Save menu; archived only when the user saves it

  const gone = result.skipped.filter(s => s.id && (s.reason === 'tombstone' || s.reason === 'unavailable')).map(s => ({ id: s.id as string, sortIndex: s.sortIndex }));
  if (!result.tweets.length && !gone.length) return { capture: null, result };
  const top = new Set(result.entries.map(e => e.id));
  return {
    capture: { accountId, source: 'bookmark', tweets: result.tweets.filter(t => top.has(t.id)), entries: result.entries, gone },
    result,
  };
}
