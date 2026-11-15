import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { PAGES, pageForPath } from './pages';
import { renderPage, renderSitemap } from './render';

/** Placeholder in public/_headers, replaced with the CSP hashes of the /saved pages' inline scripts. */
export const SAVED_HASHES_TOKEN = '{{SAVED_SCRIPT_HASHES}}';

/** `'sha256-…'` of every inline (executable) script in an HTML page. JSON data blocks are not scripts to CSP. */
export function inlineScriptHashes(html: string): string[] {
  const out: string[] = [];
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /type="application\/(ld\+)?json"/.test(attrs)) continue;
    out.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return out;
}

/**
 * Generates one HTML file per landing page (plus 404.html and sitemap.xml)
 * from the processed index.html template. In dev, the page matching the
 * requested path is rendered on the fly.
 */
export function sitePages(): Plugin {
  return {
    name: 'xt-site-pages',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.server) return html; // build: handled in generateBundle
        // Dev only: load CSS render-blocking (Vite otherwise injects it via JS → flash of unstyled
        // content). Production inlines the CSS into every page instead.
        const page = renderPage(html, pageForPath(ctx.originalUrl || ctx.path));
        return page.replace('</head>', '    <link rel="stylesheet" href="/src/index.css" />\n  </head>');
      },
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (!index || index.type !== 'asset') return;
        const template = String(index.source);
        for (const page of PAGES) {
          const html = renderPage(template, page);
          if (page.file === 'index.html') index.source = html;
          else this.emitFile({ type: 'asset', fileName: page.file, source: html });
        }
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: renderSitemap() });
      },
    },
    // The /saved pages run under a strict CSP (public/_headers): allow exactly their inline scripts.
    // scripts/check-dist.mjs re-checks the result after the build.
    closeBundle() {
      const dist = path.resolve(process.cwd(), 'dist');
      const headersFile = path.join(dist, '_headers');
      if (!fs.existsSync(headersFile)) return;
      const hashes = new Set<string>();
      for (const page of PAGES.filter(p => p.noAnalytics)) {
        const file = path.join(dist, page.file);
        if (fs.existsSync(file)) inlineScriptHashes(fs.readFileSync(file, 'utf8')).forEach(h => hashes.add(h));
      }
      const text = fs.readFileSync(headersFile, 'utf8');
      if (text.includes(SAVED_HASHES_TOKEN)) fs.writeFileSync(headersFile, text.split(SAVED_HASHES_TOKEN).join([...hashes].join(' ')));
    },
  };
}
