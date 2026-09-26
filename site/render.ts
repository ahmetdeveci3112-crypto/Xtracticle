import { PAGES, SITE, GITHUB_URL, type SitePage } from './pages';

/**
 * Fills the markers in index.html for one page:
 *   <!--xt:head-->     title, meta, canonical, hreflang, OG/Twitter, JSON-LD
 *   <!--xt:shell-->    static header (matches the React header → no layout shift)
 *   <!--xt:content-->  crawlable content + footer
 *   <!--xt:config-->   window.__XT__ page config for the React app
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** JSON for inline <script> — never allow `</script>` to terminate early. */
const inlineJson = (v: unknown) => JSON.stringify(v).replace(/</g, '\\u003c');

const url = (p: SitePage) => SITE + p.path;
const OG_IMAGE = `${SITE}/og-image.png`;

function jsonLd(page: SitePage): unknown[] {
  const blocks: unknown[] = [];
  if (page.isHome) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Xtracticle',
      alternateName: page.lang === 'tr' ? ['X Makale İndirici'] : ['X Article Downloader', 'X Thread to PDF', 'Tweet to Markdown'],
      url: url(page),
      description: page.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      inLanguage: page.lang,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Download X Articles as PDF, Markdown, EPUB, text or ZIP with images',
        'Unroll full threads from any post of the thread',
        'Send to Obsidian with YAML front-matter',
        'Batch download up to 20 posts as a ZIP',
        'Read aloud (text-to-speech)',
        'No login, free and open source',
      ],
      image: OG_IMAGE,
      screenshot: OG_IMAGE,
      softwareVersion: '3.0',
      creator: { '@type': 'Person', name: 'Ahmet Deveci', url: 'https://x.com/DvciAhmet' },
      sameAs: [GITHUB_URL, 'https://www.producthunt.com/posts/xtracticle'],
    });
  } else if (!page.noindex) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Xtracticle', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url(page) },
      ],
    });
  }
  if (page.faq.length) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    });
  }
  return blocks;
}

function head(page: SitePage): string {
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    page.noindex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />`,
  ];
  if (!page.noindex) {
    tags.push(`<link rel="canonical" href="${url(page)}" />`);
    if (page.isHome) {
      const en = PAGES.find(p => p.id === 'home')!;
      const tr = PAGES.find(p => p.id === 'tr-home')!;
      tags.push(
        `<link rel="alternate" hreflang="en" href="${url(en)}" />`,
        `<link rel="alternate" hreflang="tr" href="${url(tr)}" />`,
        `<link rel="alternate" hreflang="x-default" href="${url(en)}" />`,
      );
    }
  }
  tags.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="Xtracticle" />`,
    `<meta property="og:url" content="${url(page)}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Xtracticle — X Article Downloader" />`,
    `<meta property="og:locale" content="${page.lang === 'tr' ? 'tr_TR' : 'en_US'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  );
  for (const block of jsonLd(page)) tags.push(`<script type="application/ld+json">${inlineJson(block)}</script>`);
  return tags.join('\n    ');
}

/** Mirrors the React header markup/classes so hydration causes no layout shift. */
function shell(page: SitePage): string {
  const placeholder = page.lang === 'tr' ? 'Bir X gönderi linki yapıştırın…' : 'Paste an X post link…';
  const button = page.lang === 'tr' ? 'Çıkar' : 'Extract';
  return `<main class="max-w-3xl mx-auto px-5 pt-16 pb-8 md:pt-24">
        <header class="mb-10 text-center">
          <a href="${page.lang === 'tr' ? '/tr/' : '/'}" class="inline-flex flex-col items-center gap-3 mb-5" aria-label="Xtracticle home">
            <span class="xt-logo"><svg viewBox="0 0 24 24" aria-hidden="true" class="w-7 h-7" width="28" height="28" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path></svg></span>
            <span class="text-sm font-semibold tracking-wide" style="color:var(--text-secondary)">Xtracticle</span>
          </a>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">${esc(page.h1)}</h1>
          <p class="text-lg max-w-xl mx-auto" style="color:var(--text-secondary)">${esc(page.sub)}</p>
        </header>
        <div class="flex justify-center mb-4"><div class="inline-flex p-1 rounded-xl text-xs font-medium" style="background-color:var(--bg-tertiary);border:1px solid var(--border);height:2.25rem;width:13rem"></div></div>
        <div class="relative flex items-center max-w-2xl mx-auto mb-3">
          <input type="text" disabled placeholder="${esc(placeholder)}" class="w-full pl-5 pr-28 py-4 rounded-2xl text-base" style="background-color:var(--bg-secondary);border:1px solid var(--border);color:var(--text-primary)" />
          <button disabled class="absolute right-2 top-2 bottom-2 px-6 rounded-xl font-semibold text-sm" style="background-color:var(--accent);color:var(--bg-primary);opacity:.7">${button}</button>
        </div>
      </main>`;
}

function faqHtml(page: SitePage): string {
  if (!page.faq.length) return '';
  const title = page.lang === 'tr' ? 'Sık sorulan sorular' : 'Frequently asked questions';
  return `<section>
  <h2>${title}</h2>
  ${page.faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
</section>`;
}

function footer(page: SitePage): string {
  const links = PAGES.filter(p => p.nav && !p.noindex && p.lang === 'en')
    .map(p => `<a href="${p.path}"${p.id === page.id ? ' aria-current="page"' : ''}>${esc(p.nav)}</a>`);
  links.push(page.lang === 'tr' ? `<a href="/" hreflang="en">English</a>` : `<a href="/tr/" hreflang="tr">Türkçe</a>`);
  const tagline = page.lang === 'tr'
    ? 'Xtracticle — ücretsiz ve açık kaynak X makale, flood ve gönderi indirici.'
    : 'Xtracticle — free & open-source downloader for X articles, threads and posts.';
  const disclaimer = page.lang === 'tr'
    ? 'X Corp. ile bağlantılı değildir. Yalnızca herkese açık içerik; lütfen yazarların haklarına saygı gösterin.'
    : 'Not affiliated with X Corp. Public content only — please respect authors’ rights.';
  return `<footer class="xt-footer">
  <nav aria-label="Tools">${links.join('')}</nav>
  <p>${tagline}</p>
  <p>Built by <a href="https://x.com/DvciAhmet" rel="noopener">@DvciAhmet</a> · <a href="${GITHUB_URL}" rel="noopener">GitHub</a> · <a href="https://www.producthunt.com/posts/xtracticle" rel="noopener">Product Hunt</a> · <a href="/llms.txt">llms.txt</a></p>
  <p>${disclaimer}</p>
</footer>`;
}

function content(page: SitePage): string {
  const body = page.sections + faqHtml(page);
  return (body.trim() ? `<div class="xt-content">${body}</div>\n` : '') + footer(page);
}

function config(page: SitePage): string {
  const cfg = { page: page.id, lang: page.lang, h1: page.h1, sub: page.sub, primary: page.primary };
  return `<script>window.__XT__=${inlineJson(cfg)}</script>`;
}

export function renderPage(template: string, page: SitePage): string {
  return template
    .replace('<html lang="en">', `<html lang="${page.lang}">`)
    .replace('<!--xt:head-->', head(page))
    .replace('<!--xt:shell-->', shell(page))
    .replace('<!--xt:content-->', content(page))
    .replace('<!--xt:config-->', config(page));
}

export function renderSitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.filter(p => !p.noindex)
    .map(p => `  <url>\n    <loc>${url(p)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.isHome ? '1.0' : '0.8'}</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
