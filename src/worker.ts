export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/tweet\/(\d+)$/);

    // Not an API route — serve static assets (React SPA)
    if (!match) {
      return env.ASSETS.fetch(request);
    }

    const tweetId = match[1];

    try {
      const response = await fetch(
        `https://api.fxtwitter.com/status/${tweetId}`,
        {
          headers: {
            "User-Agent": "Xtracticle/1.0 (https://xtracticle.ahmetdeveci3112.workers.dev)",
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
            headers: { "Content-Type": "application/json" },
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
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(JSON.stringify(data.tweet), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (error) {
      console.error("Error fetching tweet:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error while fetching tweet.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
