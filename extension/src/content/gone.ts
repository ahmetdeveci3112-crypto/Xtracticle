/**
 * "This post is unavailable" detection for the archive panel (pure; unit-tested). Two signals:
 *   1. the page: X's error / empty state is on a status page (anchors.ts reads the DOM);
 *   2. the data: the listened TweetDetail answer has no post for the page's id but a tombstone / unavailable
 *      result or X's "No status found" error (code 144).
 */
import { parseGraphql } from '../x/graphql';

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);

/** X's error codes for a post that does not exist / is not visible. */
const GONE_CODES = new Set([144, 34, 63, 179, 421, 422]);
const GONE_MSG = /no status found|not ?found|unavailable|suspended|protected/i;

function hasGoneError(json: unknown): boolean {
  if (!isObj(json) || !Array.isArray(json.errors)) return false;
  return json.errors.some(e => isObj(e) && ((typeof e.code === 'number' && GONE_CODES.has(e.code)) || (typeof e.message === 'string' && GONE_MSG.test(e.message))));
}

/**
 * True when a detail answer says the post `id` is gone. `op` is the operation name: only TweetDetail answers
 * are about the page's own post when they carry no id (TweetResultByRestId also loads quoted posts).
 */
export function goneFromDetail(json: unknown, id: string, op = 'TweetDetail'): boolean {
  const r = parseGraphql(json);
  if (r.tweets.some(t => t.id === id)) return false;
  if (r.skipped.some(s => s.id === id && (s.reason === 'tombstone' || s.reason === 'unavailable'))) return true;
  if (op !== 'TweetDetail') return false;
  if (r.tweets.length) return false;
  if (hasGoneError(json)) return true;
  return r.skipped.length > 0 && r.skipped.every(s => s.reason === 'tombstone' || s.reason === 'unavailable');
}

/** The page signals (anchors.ts) on a status URL. */
export interface PageSignals {
  onStatusPage: boolean;
  errorState: boolean;
  /** An `article` for the page's own post is rendered. */
  postRendered: boolean;
}

export const goneOnPage = (s: PageSignals) => s.onStatusPage && s.errorState && !s.postRendered;

/** `YYYYMMDDhhmmss` for a Wayback timestamp. */
export const waybackTs = (d: Date) => d.toISOString().replace(/[-:T]/g, '').slice(0, 14);
