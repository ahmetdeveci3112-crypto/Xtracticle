export interface Env {
  ASSETS: Fetcher;
}

/**
 * Cloudflare Worker entry point for Xtracticle.
 *
 * Handles two responsibilities:
 * 1. API proxy: /api/tweet/:id → fetches from fxtwitter.com with edge caching
 * 2. Static assets: Everything else → served from the ASSETS binding (React SPA)
 *
 * AI Discoverability:
 * - HTML pages include llms.txt link header for AI agents
 * - /llms.txt and /llms-full.txt served as static assets
 * - Comprehensive JSON-LD structured data in index.html
 * - Full noscript fallback content for crawlers that don't execute JS
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/tweet\/(\d+)$/);

    // ─── Static Assets (React SPA) ───
    if (!match) {
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
    }

    // ─── API: /api/tweet/:id ───
    const tweetId = match[1];

    try {
      const response = await fetch(
        `https://api.fxtwitter.com/status/${tweetId}`,
        {
          headers: {
            "User-Agent":
              "Xtracticle/2.0 (https://xtracticle.com)",
          },
        }
      );

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error:
              response.status === 404
                ? "Tweet not found. It might be deleted or from a private account."
                : "Failed to fetch tweet data from X.",
          }),
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      const data: any = await response.json();

      if (data.code !== 200) {
        return new Response(
          JSON.stringify({
            error: data.message || "Failed to fetch tweet data.",
          }),
          {
            status: data.code || 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      return new Response(JSON.stringify(data.tweet), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error fetching tweet:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error while fetching tweet.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
