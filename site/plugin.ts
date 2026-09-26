import type { Plugin } from 'vite';
import { PAGES, pageForPath } from './pages';
import { renderPage, renderSitemap } from './render';

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
  };
}
