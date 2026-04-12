import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, type Plugin} from 'vite';

/**
 * Post-build plugin: inlines CSS into HTML <style> tags.
 * Eliminates render-blocking CSS request and JS→CSS dependency chain.
 * The CSS is ~6KB gzipped — fits within the 14KB initial TCP congestion window.
 */
function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-css-to-html',
    enforce: 'post',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const htmlPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(htmlPath)) return;

      let html = fs.readFileSync(htmlPath, 'utf-8');

      // Find all CSS <link> tags and inline them
      const cssLinkRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/[^"]+\.css)"\s*\/?>/g;
      let match;

      while ((match = cssLinkRegex.exec(html)) !== null) {
        const cssHref = match[1]; // e.g., /assets/index-JJhOtVz-.css
        const cssFilePath = path.join(distDir, cssHref);

        if (fs.existsSync(cssFilePath)) {
          const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
          html = html.replace(match[0], `<style>${cssContent}</style>`);
          // Remove the CSS file since it's now inlined
          fs.unlinkSync(cssFilePath);
        }
      }

      fs.writeFileSync(htmlPath, html, 'utf-8');
    },
  };
}

const USER_AGENT = 'Xtracticle/2.0 (https://xtracticle.com)';
const MAX_THREAD_DEPTH = 25;

async function fetchTweetFromFx(tweetId: string): Promise<any | null> {
  try {
    const response = await fetch(`https://api.fxtwitter.com/status/${tweetId}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!response.ok) return null;
    const data: any = await response.json();
    if (data.code !== 200) return null;
    return data.tweet;
  } catch {
    return null;
  }
}

async function buildThread(startTweetId: string): Promise<any[]> {
  const startTweet = await fetchTweetFromFx(startTweetId);
  if (!startTweet) return [];

  const authorHandle = startTweet.author?.screen_name;
  if (!authorHandle) return [startTweet];

  // Go UP — find the root of the self-thread
  const upChain: any[] = [startTweet];
  let currentId = startTweet.replying_to_status;
  let depth = 0;

  while (currentId && depth < MAX_THREAD_DEPTH) {
    const parent = await fetchTweetFromFx(currentId);
    if (!parent) break;
    if (parent.author?.screen_name !== authorHandle) break;
    upChain.unshift(parent);
    currentId = parent.replying_to_status;
    depth++;
  }

  return upChain.length > 1 ? upChain : [startTweet];
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    inlineCssPlugin(),
    // Local dev API proxy — mimics Cloudflare Worker behavior
    {
      name: 'api-proxy',
      configureServer(server) {
        // ─── /api/tweet/:id ───
        server.middlewares.use('/api/tweet/', async (req, res) => {
          const tweetId = req.url?.replace('/', '').split('?')[0];

          if (!tweetId || !/^\d+$/.test(tweetId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid Tweet ID format.' }));
            return;
          }

          try {
            const tweet = await fetchTweetFromFx(tweetId);
            if (!tweet) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Tweet not found.' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(tweet));
          } catch (err) {
            console.error('Error fetching tweet:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error.' }));
          }
        });

        // ─── /api/thread/:id ───
        server.middlewares.use('/api/thread/', async (req, res) => {
          const tweetId = req.url?.replace('/', '').split('?')[0];

          if (!tweetId || !/^\d+$/.test(tweetId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid Tweet ID format.' }));
            return;
          }

          try {
            const tweets = await buildThread(tweetId);
            if (tweets.length === 0) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Tweet not found.' }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              tweets,
              count: tweets.length,
              isThread: tweets.length > 1,
            }));
          } catch (err) {
            console.error('Error building thread:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to build thread.' }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
