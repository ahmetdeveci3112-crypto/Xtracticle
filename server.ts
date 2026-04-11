import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to fetch tweet data
  app.get("/api/tweet/:id", async (req, res) => {
    try {
      const tweetId = req.params.id;
      // We use the fxtwitter API which provides full article content
      const response = await fetch(
        `https://api.fxtwitter.com/status/${tweetId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ error: "Tweet not found. It might be deleted or from a private account." });
        }
        return res
          .status(response.status)
          .json({ error: "Failed to fetch tweet data from X." });
      }

      const data = await response.json();
      
      if (data.code !== 200) {
         return res.status(data.code || 500).json({ error: data.message || "Failed to fetch tweet data." });
      }

      res.json(data.tweet);
    } catch (error) {
      console.error("Error fetching tweet:", error);
      res.status(500).json({ error: "Internal server error while fetching tweet." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
