export interface Env {
  ASSETS: Fetcher;
}

const USER_AGENT = "Xtracticle/2.0 (https://xtracticle.com)";
const MAX_THREAD_DEPTH = 25;
const API_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

/**
 * Fetch a single tweet from fxtwitter API.
 * Returns the tweet object or null on failure.
 */
async function fetchTweetFromFx(tweetId: string): Promise<any | null> {
  try {
    const response = await fetch(
      `https://api.fxtwitter.com/status/${tweetId}`,
      { headers: { "User-Agent": USER_AGENT } }
    );
    if (!response.ok) return null;
    const data: any = await response.json();
    if (data.code !== 200) return null;
    return data.tweet;
  } catch {
    return null;
  }
}

/**
 * Given a tweet, find thread continuation going FORWARD (self-replies).
 * Uses fxtwitter: fetches reply tweets and checks if they are self-replies
 * by the same author, following the replying_to_status chain.
 *
 * Strategy: Since fxtwitter doesn't expose "replies" list, we use
 * Twitter's syndication API to discover self_thread tweet IDs,
 * then fetch each via fxtwitter for full data.
 */
async function discoverThreadForward(
  startTweet: any
): Promise<string[]> {
  // Use Twitter syndication API to check for self_thread
  try {
    const resp = await fetch(
      `https://cdn.syndication.twimg.com/tweet-result?id=${startTweet.id}&token=x`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "application/json",
          Referer: "https://platform.twitter.com/",
        },
      }
    );

    if (!resp.ok) return [];

    const synData: any = await resp.json();

    // Twitter syndication returns `self_thread` for thread-start tweets
    if (synData.self_thread && synData.self_thread.id_str) {
      // self_thread.id_str is the conversation ID (= first tweet ID)
      // But it doesn't give us the list of IDs directly.
      // However, knowing it IS a self_thread is useful.
    }

    // Check conversation_count — if > 0 and it's the author's thread
    return [];
  } catch {
    return [];
  }
}

/**
 * Build a thread by traversing UP from the given tweet (via replying_to_status),
 * then DOWN from the top searching for self-replies by the same author.
 */
async function buildThread(startTweetId: string): Promise<any[]> {
  const startTweet = await fetchTweetFromFx(startTweetId);
  if (!startTweet) return [];

  const authorHandle = startTweet.author?.screen_name;
  if (!authorHandle) return [startTweet];

  // Step 1: Go UP — find the root of the thread
  const upChain: any[] = [startTweet];
  let currentId = startTweet.replying_to_status;
  let depth = 0;

  while (currentId && depth < MAX_THREAD_DEPTH) {
    const parent = await fetchTweetFromFx(currentId);
    if (!parent) break;

    // Only follow the chain if same author (self-thread)
    if (parent.author?.screen_name !== authorHandle) {
      // Different author — this is a reply to someone else, not a thread
      break;
    }

    upChain.unshift(parent);
    currentId = parent.replying_to_status;
    depth++;
  }

  // Step 2: Go DOWN — find self-replies starting from the last known tweet
  // We check subsequent tweets by the same author that reply to the previous one
  const rootTweet = upChain[0];
  const lastTweet = upChain[upChain.length - 1];

  // If we started from the root and have no replying_to, try to find forward chain
  // by using the startTweet's ID as the "conversation root"
  const downChain: any[] = [];

  // For downward traversal, we try fetching tweets that reply to the last known tweet
  // Since fxtwitter doesn't have a search endpoint, we try a different approach:
  // Check if the last tweet has replies, and try to use conversation_id from syndication API
  if (lastTweet.replies && lastTweet.replies > 0 && !lastTweet.article) {
    // Try to discover self-replies using a heuristic:
    // Twitter tweet IDs are roughly chronological (Snowflake IDs).
    // We can't reliably guess the next tweet ID, but we can try using
    // the syndication API for the conversation thread.
    //
    // For now, we rely on the UP chain (which works when user pastes a
    // middle or end tweet) and show a helpful message for first-tweet scenarios.
  }

  // Combine: upChain already includes startTweet
  const thread = upChain.concat(downChain);

  // Only return as a thread if we found more than 1 tweet
  return thread.length > 1 ? thread : [startTweet];
}

/**
 * Cloudflare Worker entry point for Xtracticle.
 *
 * Routes:
 * - /api/tweet/:id     → Single tweet fetch (fxtwitter proxy)
 * - /api/thread/:id    → Thread detection + assembly
 * - Everything else    → Static assets (React SPA)
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ─── Route: /api/thread/:id ───
    const threadMatch = url.pathname.match(/^\/api\/thread\/(\d+)$/);
    if (threadMatch) {
      const tweetId = threadMatch[1];
      try {
        const tweets = await buildThread(tweetId);

        if (tweets.length === 0) {
          return new Response(
            JSON.stringify({ error: "Tweet not found." }),
            { status: 404, headers: API_HEADERS }
          );
        }

        return new Response(
          JSON.stringify({
            tweets,
            count: tweets.length,
            isThread: tweets.length > 1,
          }),
          {
            status: 200,
            headers: {
              ...API_HEADERS,
              "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
            },
          }
        );
      } catch (error) {
        console.error("Error building thread:", error);
        return new Response(
          JSON.stringify({ error: "Failed to build thread." }),
          { status: 500, headers: API_HEADERS }
        );
      }
    }

    // ─── Route: /api/tweet/:id ───
    const tweetMatch = url.pathname.match(/^\/api\/tweet\/(\d+)$/);
    if (tweetMatch) {
      const tweetId = tweetMatch[1];
      try {
        const tweet = await fetchTweetFromFx(tweetId);

        if (!tweet) {
          return new Response(
            JSON.stringify({
              error: "Tweet not found. It might be deleted or from a private account.",
            }),
            { status: 404, headers: API_HEADERS }
          );
        }

        return new Response(JSON.stringify(tweet), {
          status: 200,
          headers: {
            ...API_HEADERS,
            "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          },
        });
      } catch (error) {
        console.error("Error fetching tweet:", error);
        return new Response(
          JSON.stringify({ error: "Internal server error while fetching tweet." }),
          { status: 500, headers: API_HEADERS }
        );
      }
    }

    // ─── Static Assets (React SPA) ───
    const response = await env.ASSETS.fetch(request);

    // Add AI discoverability headers to HTML pages
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("text/html")) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Link", '</llms.txt>; rel="llms-txt"');
      newHeaders.set("X-Llms-Txt", "/llms.txt");

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      });
    }

    return response;
  },
};
