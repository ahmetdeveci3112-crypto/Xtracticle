import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';
import { handleApi } from './src/shared/api';
import { sitePages } from './site/plugin';

/**
 * Post-build plugin: inlines CSS into every generated HTML page.
 * Eliminates the render-blocking CSS request and JS→CSS dependency chain.
 */
function inlineCssPlugin(): Plugin {
  return {
    name: 'inline-css-to-html',
    enforce: 'post',
    apply: 'build',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const htmlFiles = (fs.readdirSync(distDir, { recursive: true }) as string[])
        .filter(f => f.endsWith('.html'))
        .map(f => path.join(distDir, f));
      const cssLinkRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/[^"]+\.css)"\s*\/?>/g;

      for (const htmlPath of htmlFiles) {
        let html = fs.readFileSync(htmlPath, 'utf-8');
        html = html.replace(cssLinkRegex, (tag, href: string) => {
          const cssPath = path.join(distDir, href);
          if (!fs.existsSync(cssPath)) return tag;
          return `<style>${fs.readFileSync(cssPath, 'utf-8')}</style>`;
        });
        fs.writeFileSync(htmlPath, html, 'utf-8');
      }
      // Keep the CSS files: lazy chunks (jspdf, export…) list them as preload
      // dependencies, and a missing file makes those dynamic imports fail.
    },
  };
}

/** Local dev API — runs the exact same handler as the Cloudflare Worker. */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        try {
          const response = await handleApi(new Request(`http://localhost${req.url}`, { method: req.method }));
          if (!response) return next();
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error('Dev API error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Internal server error.' }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi(), sitePages(), inlineCssPlugin()],
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
