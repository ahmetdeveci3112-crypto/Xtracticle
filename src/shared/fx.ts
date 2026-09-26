/**
 * fxtwitter API client shared by the Cloudflare Worker (production) and the
 * Vite dev middleware (local). Keep this file free of DOM / Node-only APIs.
 */

export const USER_AGENT = 'Xtracticle/3.0 (https://xtracticle.com)';
const FX_BASE = 'https://api.fxtwitter.com';
const MAX_LEGACY_DEPTH = 40;

/**
 * Normalized tweet shape consumed by the frontend. It mirrors the fxtwitter v1
 * `tweet` object so both v1 and v2 responses can be used interchangeably.
 */
export interface FxTweet {
  id: string;
  url: string;
  text: string;
  created_at: string;
  lang?: string;
  replies?: number;
  likes?: number;
  views?: number;
  replying_to_status?: string | null;
  author: { name: string; screen_name: string; avatar_url?: string };
  media?: {
    photos?: { url: string; width?: number; height?: number; altText?: string }[];
    videos?: { url: string; thumbnail_url?: string; duration?: number; type?: string }[];
  };
  quote?: FxTweet | null;
  article?: any;
}

function normalize(raw: any): FxTweet | null {
  if (!raw || !raw.id) return null;
  const replyingTo =
    raw.replying_to_status ??
    (raw.replying_to && typeof raw.replying_to === 'object' ? raw.replying_to.status : null) ??
    null;
  return {
    id: String(raw.id),
    url: raw.url || `https://x.com/${raw.author?.screen_name || 'i'}/status/${raw.id}`,
    text: raw.text || '',
    created_at: raw.created_at,
    lang: raw.lang,
    replies: raw.replies,
    likes: raw.likes,
    views: raw.views,
    replying_to_status: replyingTo,
    author: {
      name: raw.author?.name || '',
      screen_name: raw.author?.screen_name || '',
      avatar_url: raw.author?.avatar_url,
    },
    media: raw.media
      ? {
          photos: raw.media.photos?.map((p: any) => ({
            url: p.url,
            width: p.width,
            height: p.height,
            altText: p.altText,
          })),
          videos: raw.media.videos?.map((v: any) => ({
            url: v.url,
            thumbnail_url: v.thumbnail_url,
            duration: v.duration,
            type: v.type,
          })),
        }
      : undefined,
    quote: raw.quote ? normalize(raw.quote) : null,
    article: raw.article || undefined,
  };
}

async function fxGet(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${FX_BASE}${path}`, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (data.code !== 200) return null;
    return data;
  } catch {
    return null;
  }
}

/** Fetch a single post (v1 endpoint, most complete article payload). */
export async function fetchTweet(id: string): Promise<FxTweet | null> {
  const data = await fxGet(`/status/${id}`);
  return data ? normalize(data.tweet) : null;
}

/**
 * Fetch the full self-thread containing `id` — works from the first, a middle,
 * or the last post. Uses fxtwitter v2 `/2/thread`, falling back to walking
 * `replying_to_status` upward via v1 if v2 is unavailable.
 */
export async function fetchThread(id: string): Promise<FxTweet[]> {
  const v2 = await fxGet(`/2/thread/${id}`);
  if (v2?.status) {
    const main = normalize(v2.status);
    const thread = (v2.thread || []).map(normalize).filter(Boolean) as FxTweet[];
    // v2 statuses sometimes omit article bodies — prefer the v1 payload then.
    if (main && thread.length <= 1) {
      if (!main.article && /\/i\/article\//.test(main.text)) {
        return [(await fetchTweet(id)) || main];
      }
      return [main];
    }
    if (thread.length > 1) return selfThreadAround(thread, main?.id ?? id);
  }
  return legacyThread(id);
}

/**
 * v2 returns the whole reply chain, which can include other people's posts
 * (e.g. when the link is a reply to someone else). Keep only the contiguous
 * run of posts by the same author around the requested post.
 */
function selfThreadAround(chain: FxTweet[], id: string): FxTweet[] {
  let index = chain.findIndex(t => t.id === id);
  if (index < 0) index = chain.length - 1;
  const handle = chain[index].author.screen_name.toLowerCase();
  const same = (t: FxTweet) => t.author.screen_name.toLowerCase() === handle;
  let start = index;
  let end = index;
  while (start > 0 && same(chain[start - 1])) start--;
  while (end < chain.length - 1 && same(chain[end + 1])) end++;
  return chain.slice(start, end + 1);
}

async function legacyThread(id: string): Promise<FxTweet[]> {
  const start = await fetchTweet(id);
  if (!start) return [];
  const handle = start.author.screen_name;
  const chain: FxTweet[] = [start];
  let parentId = start.replying_to_status;
  for (let depth = 0; parentId && depth < MAX_LEGACY_DEPTH; depth++) {
    const parent = await fetchTweet(parentId);
    if (!parent || parent.author.screen_name !== handle) break;
    chain.unshift(parent);
    parentId = parent.replying_to_status;
  }
  return chain;
}
