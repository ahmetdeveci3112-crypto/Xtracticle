import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Local dev API proxy — mimics the Cloudflare Pages Function behavior
    {
      name: 'api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/tweet/', async (req, res) => {
          const tweetId = req.url?.replace('/', '').split('?')[0];

          if (!tweetId || !/^\d+$/.test(tweetId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid Tweet ID format.' }));
            return;
          }

          try {
            const response = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
            const data: any = await response.json();

            if (!response.ok) {
              res.writeHead(response.status, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: response.status === 404
                  ? 'Tweet not found. It might be deleted or from a private account.'
                  : 'Failed to fetch tweet data from X.'
              }));
              return;
            }

            if (data.code !== 200) {
              res.writeHead(data.code || 500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: data.message || 'Failed to fetch tweet data.' }));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data.tweet));
          } catch (err) {
            console.error('Error fetching tweet:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error while fetching tweet.' }));
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
});
