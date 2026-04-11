export const onRequestGet: PagesFunction = async (context) => {
  const idParam = context.params.id;
  // [[id]] catch-all returns an array, take the first segment
  const tweetId = Array.isArray(idParam) ? idParam[0] : idParam;

  if (!tweetId || !/^\d+$/.test(tweetId)) {
    return new Response(
      JSON.stringify({ error: "Invalid Tweet ID format." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const response = await fetch(
      `https://api.fxtwitter.com/status/${tweetId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({
            error:
              "Tweet not found. It might be deleted or from a private account.",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to fetch tweet data from X." }),
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
        // Cache successful responses for 5 min at the edge,
        // serve stale for 10 min while revalidating in the background.
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
};
