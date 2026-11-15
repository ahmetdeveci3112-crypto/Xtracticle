/**
 * X GraphQL response → FxTweet (src/shared/fx.ts), the one place that knows X's response shape
 * (docs/chrome-extension-plan.md, B4). Everything downstream (convert.ts, the archive, /saved) sees the
 * same FxTweet the site gets from /api/thread, so the Markdown is the same.
 *
 * Handles: timeline instructions (TimelineAddEntries / ReplaceEntry / PinEntry / AddToModule), items and
 * modules, cursors, `TweetWithVisibilityResults`, `TweetTombstone` / `TweetUnavailable`, reposts, long
 * posts (`note_tweet`), quotes (`quoted_status_result`), photos / videos / GIFs, X Articles (full
 * `content_state` or the preview only), the old and the 2025 user shape, single results
 * (`TweetResultByRestId`) and the bookmark mutations' variables.
 *
 * The text rules follow FxTwitter (checked against live api.fxtwitter.com answers, 15 Nov 2026):
 * t.co links become their expanded URL, the remaining t.co links (media) are dropped, `&amp; &lt; &gt;`
 * are decoded, photos get `?name=orig`, videos take the highest-bitrate MP4, avatars `_200x200`.
 *
 * Input is untrusted page data: nothing here throws, unknown shapes are skipped and counted.
 */
import type { FxTweet } from '../../../src/shared/fx';

export interface GqlEntry {
  id: string;
  /** X's timeline sort key (a decimal string); null outside timelines. */
  sortIndex: string | null;
}

export type SkipReason = 'tombstone' | 'unavailable' | 'promoted' | 'invalid';

export interface Skipped {
  /** The post id when the entry id carries one. */
  id: string | null;
  reason: SkipReason;
  sortIndex: string | null;
}

export interface GqlResult {
  /** Mapped posts, first occurrence of each id, in response order. */
  tweets: FxTweet[];
  /** One per top-level post entry, in response order (bookmark order on the Bookmarks timeline). */
  entries: GqlEntry[];
  skipped: Skipped[];
  cursors: { top: string | null; bottom: string | null };
  /** False when the body had no instructions and no single result: X may have changed the format. */
  recognized: boolean;
}

const ID_RE = /^\d{1,25}$/;
const SORT_RE = /^\d{1,30}$/;
const MAX_WALK_DEPTH = 6;
const MAX_ITEMS = 2000;

type Obj = Record<string, any>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);
const num = (v: unknown): number | undefined => {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : undefined;
};

/* ─── Text (FxTwitter's linkFixer + unescape) ─── */

function unescapeText(s: string): string {
  return s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

/** t.co → expanded URL (a `twitter.com/i/web/status` "show more" link is removed), then drop the rest (media links). */
export function fixText(text: string, urls: unknown): string {
  let out = text;
  if (Array.isArray(urls)) {
    for (const u of urls) {
      if (!isObj(u)) continue;
      const short = str(u.url);
      if (!short) continue;
      let expanded = str(u.expanded_url) || '';
      if (/^https?:\/\/(?:twitter|x)\.com\/i\/web\/status\/\w+/.test(expanded)) expanded = '';
      out = out.replace(short, expanded);
    }
  }
  out = out.replace(/ ?https:\/\/t\.co\/\w{10}/g, '');
  return unescapeText(out);
}

/** Drop the leading reply mentions X hides (display_text_range start, counted in code points). */
function fromDisplayStart(text: string, range: unknown): string {
  if (!Array.isArray(range) || typeof range[0] !== 'number' || range[0] <= 0) return text;
  return Array.from(text).slice(range[0]).join('');
}

/* ─── Result unwrapping ─── */

type Unwrapped = { tweet: Obj } | { skip: SkipReason };

/** TweetWithVisibilityResults → Tweet; tombstones and unavailable posts → skip; reposts → the original. */
export function unwrapResult(res: unknown, depth = 0): Unwrapped {
  if (!isObj(res) || depth > 3) return { skip: 'invalid' };
  const type = str(res.__typename);
  if (type === 'TweetWithVisibilityResults') return unwrapResult(res.tweet, depth + 1);
  if (type === 'TweetTombstone') return { skip: 'tombstone' };
  if (type === 'TweetUnavailable') return { skip: 'unavailable' };
  if (type && type !== 'Tweet') return { skip: 'invalid' };
  if (!ID_RE.test(String(res.rest_id ?? '')) || !isObj(res.legacy)) return { skip: 'invalid' };
  const rt = res.legacy.retweeted_status_result?.result;
  if (rt) return unwrapResult(rt, depth + 1);
  return { tweet: res };
}

/* ─── Mapping one post ─── */

function userOf(t: Obj): { name: string; screen_name: string; avatar_url?: string } {
  let u = t.core?.user_results?.result;
  if (isObj(u) && u.__typename === 'UserWithVisibilityResults') u = u.user;
  if (!isObj(u)) return { name: '', screen_name: '' };
  const screen = str(u.core?.screen_name) ?? str(u.legacy?.screen_name) ?? '';
  const name = str(u.core?.name) ?? str(u.legacy?.name) ?? '';
  const avatar = str(u.avatar?.image_url) ?? str(u.legacy?.profile_image_url_https);
  return {
    name,
    screen_name: /^[A-Za-z0-9_]{1,50}$/.test(screen) ? screen : '',
    avatar_url: avatar ? avatar.replace('_normal.', '_200x200.') : undefined,
  };
}

function bestMp4(variants: unknown): string {
  if (!Array.isArray(variants)) return '';
  let best: Obj | null = null;
  for (const v of variants) {
    if (!isObj(v) || !str(v.url) || !String(v.content_type || '').includes('mp4')) continue;
    if (!best || (num(v.bitrate) || 0) > (num(best.bitrate) || 0)) best = v;
  }
  return best ? (best.url as string) : '';
}

function mediaOf(legacy: Obj): FxTweet['media'] {
  const list = legacy.extended_entities?.media ?? legacy.entities?.media;
  if (!Array.isArray(list)) return undefined;
  const photos: NonNullable<NonNullable<FxTweet['media']>['photos']> = [];
  const videos: NonNullable<NonNullable<FxTweet['media']>['videos']> = [];
  for (const m of list) {
    if (!isObj(m)) continue;
    const src = str(m.media_url_https);
    if (m.type === 'photo' && src) {
      photos.push({
        url: src.includes('?') ? src : `${src}?name=orig`,
        width: num(m.original_info?.width),
        height: num(m.original_info?.height),
        altText: str(m.ext_alt_text) ?? '',
      });
    } else if (m.type === 'video' || m.type === 'animated_gif') {
      const url = bestMp4(m.video_info?.variants);
      if (!url) continue;
      const ms = num(m.video_info?.duration_millis);
      videos.push({
        url,
        thumbnail_url: src || undefined,
        duration: ms !== undefined ? ms / 1000 : 0,
        type: m.type === 'animated_gif' ? 'gif' : 'video',
      });
    }
  }
  if (!photos.length && !videos.length) return undefined;
  return { ...(photos.length ? { photos } : {}), ...(videos.length ? { videos } : {}) };
}

/** X Article: the full Draft.js `content_state` when the response carries it (TweetDetail), else the preview. */
function articleOf(t: Obj): any {
  const a = t.article?.article_results?.result;
  if (!isObj(a)) return undefined;
  const title = str(a.title) ?? '';
  const preview = str(a.preview_text) ?? '';
  const state = a.content_state;
  const full = isObj(state) && Array.isArray(state.blocks);
  const content = full
    ? { blocks: state.blocks, entityMap: state.entityMap ?? [] }
    : preview
      ? { blocks: [{ key: 'xtp', type: 'unstyled', text: preview, depth: 0, entityRanges: [], inlineStyleRanges: [] }], entityMap: [] }
      : undefined;
  return {
    id: str(a.rest_id) ?? str(a.id) ?? undefined,
    title,
    preview_text: preview,
    cover_media: isObj(a.cover_media) ? a.cover_media : undefined,
    content,
    media_entities: Array.isArray(a.media_entities) ? a.media_entities : [],
    ...(full ? {} : { preview: true }),
  };
}

/** One Tweet result (already unwrapped) → FxTweet; quotes one level deep, like FxTwitter. */
export function toFxTweet(t: Obj, depth = 0): FxTweet | null {
  const legacy = t.legacy;
  const id = String(t.rest_id ?? '');
  if (!ID_RE.test(id) || !isObj(legacy)) return null;
  const author = userOf(t);

  const note = t.note_tweet?.note_tweet_results?.result;
  const noteText = isObj(note) ? str(note.text) : null;
  const full = str(legacy.full_text) ?? '';
  const text = noteText !== null
    ? fixText(noteText, note.entity_set?.urls)
    : fixText(fromDisplayStart(full, legacy.display_text_range), legacy.entities?.urls);

  let quote: FxTweet | null = null;
  if (depth === 0) {
    const q = unwrapResult(t.quoted_status_result?.result);
    if ('tweet' in q) quote = toFxTweet(q.tweet, 1);
  }

  const views = num(t.views?.count);
  const replyTo = str(legacy.in_reply_to_status_id_str);
  return {
    id,
    url: `https://x.com/${author.screen_name || 'i'}/status/${id}`,
    text,
    created_at: str(legacy.created_at) ?? '',
    lang: str(legacy.lang) ?? undefined,
    replies: num(legacy.reply_count),
    likes: num(legacy.favorite_count),
    views,
    replying_to_status: replyTo && ID_RE.test(replyTo) ? replyTo : null,
    author,
    media: mediaOf(legacy),
    quote,
    article: articleOf(t),
  };
}

/* ─── Timelines ─── */

/** The post id at the end of an entry id: "tweet-1", "conversationthread-1-tweet-2", "bookmark-3"… */
function idFromEntry(entryId: string | null): string | null {
  if (!entryId) return null;
  const m = entryId.match(/(?:^|-)tweet-(\d{1,25})(?:-|$)/) || entryId.match(/(?:^|-)(\d{1,25})$/);
  return m ? m[1] : null;
}

/** Every `instructions` array and every single `tweetResult(s).result` under `data`, a few levels deep. */
function collect(node: unknown, depth: number, instructions: unknown[][], singles: unknown[]) {
  if (!isObj(node) || depth > MAX_WALK_DEPTH) return;
  for (const [k, v] of Object.entries(node)) {
    if (k === 'instructions' && Array.isArray(v)) instructions.push(v);
    else if (/^tweet_?results?$/i.test(k) && isObj(v) && 'result' in v) singles.push(v.result);
    else if (isObj(v)) collect(v, depth + 1, instructions, singles);
  }
}

export function parseGraphql(json: unknown): GqlResult {
  const out: GqlResult = { tweets: [], entries: [], skipped: [], cursors: { top: null, bottom: null }, recognized: false };
  try {
    const seen = new Set<string>();
    const instructions: unknown[][] = [];
    const singles: unknown[] = [];
    collect(isObj(json) ? json.data : null, 0, instructions, singles);
    out.recognized = instructions.length > 0 || singles.length > 0;
    let budget = MAX_ITEMS;

    const addPost = (res: unknown, entryId: string | null, sortIndex: string | null, topLevel: boolean) => {
      if (budget-- <= 0) return;
      const u = unwrapResult(res);
      if ('skip' in u) {
        out.skipped.push({ id: idFromEntry(entryId), reason: u.skip, sortIndex });
        return;
      }
      const fx = toFxTweet(u.tweet);
      if (!fx) {
        out.skipped.push({ id: idFromEntry(entryId), reason: 'invalid', sortIndex });
        return;
      }
      if (seen.has(fx.id)) return;
      seen.add(fx.id);
      out.tweets.push(fx);
      if (topLevel) out.entries.push({ id: fx.id, sortIndex });
    };

    const addCursor = (c: Obj) => {
      const value = str(c.value);
      const type = str(c.cursorType);
      if (!value || value.length > 2048) return;
      if (type === 'Top') out.cursors.top = value;
      else if (type === 'Bottom') out.cursors.bottom = value;
    };

    const addItem = (ic: unknown, entryId: string | null, sortIndex: string | null, topLevel: boolean) => {
      if (!isObj(ic)) return;
      const type = str(ic.__typename) ?? str(ic.itemType);
      if (type === 'TimelineTimelineCursor') return addCursor(ic);
      if (type !== 'TimelineTweet') return;
      if (ic.promotedMetadata || entryId?.startsWith('promoted')) {
        out.skipped.push({ id: idFromEntry(entryId), reason: 'promoted', sortIndex });
        return;
      }
      addPost(ic.tweet_results?.result, entryId, sortIndex, topLevel);
    };

    const addEntry = (e: unknown) => {
      if (!isObj(e)) return;
      const entryId = str(e.entryId);
      const sortIndex = str(e.sortIndex) && SORT_RE.test(e.sortIndex) ? (e.sortIndex as string) : null;
      const content = isObj(e.content) ? e.content : isObj(e.item) ? e.item : null;
      if (!content) return;
      const type = str(content.entryType) ?? str(content.__typename);
      if (type === 'TimelineTimelineCursor') return addCursor(content);
      if (type === 'TimelineTimelineModule') {
        if (!Array.isArray(content.items)) return;
        for (const it of content.items) if (isObj(it)) addItem(it.item?.itemContent, str(it.entryId), sortIndex, false);
        return;
      }
      if (isObj(content.itemContent)) addItem(content.itemContent, entryId, sortIndex, true);
    };

    for (const list of instructions) {
      for (const ins of list) {
        if (!isObj(ins)) continue;
        if (Array.isArray(ins.entries)) ins.entries.forEach(addEntry);
        if (isObj(ins.entry)) addEntry(ins.entry);
        if (Array.isArray(ins.moduleItems)) for (const it of ins.moduleItems) if (isObj(it)) addItem(it.item?.itemContent, str(it.entryId), null, false);
      }
    }
    for (const res of singles) addPost(res, null, null, true);
  } catch {
    /* untrusted input: whatever was mapped before the error is kept */
  }
  return out;
}

/** The post id in a CreateBookmark / DeleteBookmark request body (`{"variables":{"tweet_id":"…"}}`), or null. */
export function bookmarkMutationId(body: unknown): string | null {
  if (typeof body !== 'string' || body.length > 16384) return null;
  try {
    const j = JSON.parse(body);
    const id = isObj(j) && isObj(j.variables) ? j.variables.tweet_id : null;
    return typeof id === 'string' && ID_RE.test(id) ? id : null;
  } catch {
    return null;
  }
}
