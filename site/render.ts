import { PAGES, SITE, GITHUB_URL, type Lang, type SitePage } from './pages';
import { langTag } from './blocks';
import { latestPicks } from './curated';

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

/** Per-language strings used by the page chrome (not the page content). */
const UI: Record<Lang, { locale: string; placeholder: string; button: string; faq: string; tagline: string; disclaimer: string; built: string }> = {
  en: {
    locale: 'en_US',
    placeholder: 'Paste an X post link…',
    button: 'Extract',
    faq: 'Frequently asked questions',
    tagline: 'Xtracticle — free & open-source downloader for X articles, threads and posts.',
    disclaimer: 'Not affiliated with X Corp. Public content only — please respect authors’ rights.',
    built: 'Built by',
  },
  tr: {
    locale: 'tr_TR',
    placeholder: 'Bir X gönderi linki yapıştırın…',
    button: 'Çıkar',
    faq: 'Sık sorulan sorular',
    tagline: 'Xtracticle — ücretsiz ve açık kaynak X makale, flood ve gönderi indirici.',
    disclaimer: 'X Corp. ile bağlantılı değildir. Yalnızca herkese açık içerik; lütfen yazarların haklarına saygı gösterin.',
    built: 'Geliştiren:',
  },
  es: {
    locale: 'es_ES',
    placeholder: 'Pega el enlace de un post de X…',
    button: 'Extraer',
    faq: 'Preguntas frecuentes',
    tagline: 'Xtracticle — descargador gratuito y de código abierto de artículos, hilos y posts de X.',
    disclaimer: 'Sin relación con X Corp. Solo contenido público; respeta los derechos de los autores.',
    built: 'Creado por',
  },
  pt: {
    locale: 'pt_BR',
    placeholder: 'Cole o link de um post do X…',
    button: 'Extrair',
    faq: 'Perguntas frequentes',
    tagline: 'Xtracticle — baixador gratuito e de código aberto de artigos, threads e posts do X.',
    disclaimer: 'Sem vínculo com a X Corp. Apenas conteúdo público; respeite os direitos dos autores.',
    built: 'Criado por',
  },
  ja: {
    locale: 'ja_JP',
    placeholder: 'Xのポストのリンクを貼り付け…',
    button: '取得',
    faq: 'よくある質問',
    tagline: 'Xtracticle — Xの記事・スレッド・ポストを保存できる無料のオープンソースツール。',
    disclaimer: 'X Corp.とは提携していません。公開コンテンツのみ対象です。著者の権利を尊重してください。',
    built: '開発：',
  },
  zh: {
    locale: 'zh_CN',
    placeholder: '粘贴 X 帖子链接…',
    button: '提取',
    faq: '常见问题',
    tagline: 'Xtracticle — 免费开源的 X 文章、长推和帖子下载工具。',
    disclaimer: '与 X Corp. 无关联。仅支持公开内容，请尊重作者的权利。',
    built: '开发者：',
  },
  ar: {
    locale: 'ar_AR',
    placeholder: 'الصق رابط منشور من X…',
    button: 'استخراج',
    faq: 'الأسئلة الشائعة',
    tagline: 'Xtracticle — أداة مجانية ومفتوحة المصدر لتحميل مقالات X وثريداتها ومنشوراتها.',
    disclaimer: 'غير تابع لشركة X Corp. المحتوى العام فقط، يرجى احترام حقوق الكتّاب.',
    built: 'تطوير:',
  },
};

/** Mirrors `watchDemo` in src/i18n.ts so the static shell matches the hydrated header. */
const WATCH_DEMO: Record<Lang, string> = {
  en: 'Watch the 30-second demo',
  tr: '30 saniyelik tanıtımı izle',
  es: 'Mira la demo de 30 segundos',
  pt: 'Veja a demo de 30 segundos',
  ja: '30秒のデモを見る',
  zh: '观看 30 秒演示',
  ar: 'شاهد العرض التوضيحي (30 ثانية)',
};

const LANG_NAMES: Record<Lang, string> = { en: 'English', es: 'Español', pt: 'Português', ja: '日本語', zh: '简体中文', ar: 'العربية', tr: 'Türkçe' };

const HOMES = () => PAGES.filter(p => p.isHome && !p.noindex);
const homeOf = (lang: Lang) => HOMES().find(h => h.lang === lang) || HOMES()[0];

/** Language versions of a page (same translation group), in PAGES order. */
const versions = (page: SitePage) => (page.noindex ? [] : PAGES.filter(p => p.group === page.group && !p.noindex));
const OG_IMAGE = `${SITE}/og-image.png`;

function jsonLd(page: SitePage): unknown[] {
  const blocks: unknown[] = [];
  if (page.isHome) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Xtracticle',
      alternateName: page.lang === 'en' ? ['X Article Downloader', 'X Thread to PDF', 'Tweet to Markdown'] : [page.h1],
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
        { '@type': 'ListItem', position: 1, name: 'Xtracticle', item: url(homeOf(page.lang)) },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url(page) },
      ],
    });
  }
  if (page.jsonLd) blocks.push(...page.jsonLd);
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
    tags.push(`<link rel="canonical" href="${page.canonical || url(page)}" />`);
    // Every language version lists all of them (hreflang must be reciprocal).
    const vs = versions(page);
    if (vs.length > 1) {
      for (const v of vs) tags.push(`<link rel="alternate" hreflang="${langTag(v.lang)}" href="${url(v)}" />`);
      const def = vs.find(v => v.lang === 'en') || vs[0];
      tags.push(`<link rel="alternate" hreflang="x-default" href="${url(def)}" />`);
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
    `<meta property="og:locale" content="${UI[page.lang].locale}" />`,
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
  const { placeholder, button } = UI[page.lang];
  const home = homeOf(page.lang).path;
  return `<main class="max-w-3xl mx-auto px-5 pt-16 pb-8 md:pt-24">
        <header class="mb-10 text-center">
          <a href="${home}" class="inline-flex flex-col items-center gap-3 mb-5" aria-label="Xtracticle home">
            <span class="xt-logo"><svg viewBox="0 0 24 24" aria-hidden="true" class="w-7 h-7" width="28" height="28" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path></svg></span>
            <span class="text-sm font-semibold tracking-wide" style="color:var(--text-secondary)">Xtracticle</span>
          </a>
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4">${esc(page.h1)}</h1>
          <p class="text-lg max-w-xl mx-auto" style="color:var(--text-secondary)">${esc(page.sub)}</p>
          <span class="xt-demo-btn" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/></svg>${esc(WATCH_DEMO[page.lang])}<span class="xt-demo-len">0:34</span></span>
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
  const title = UI[page.lang].faq;
  return `<section>
  <h2>${title}</h2>
  ${page.faq.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
</section>`;
}

function footer(page: SitePage): string {
  const tools = PAGES.filter(p => p.lang === page.lang && p.nav && !p.noindex).map(
    p => `<a href="${p.path}"${p.id === page.id ? ' aria-current="page"' : ''}>${esc(p.nav)}</a>`,
  );
  if (page.lang !== 'en' && latestPicks()) tools.push(`<a href="/best-x-articles" hreflang="en">${esc(PICKS_COPY[page.lang].nav)}</a>`);
  // Same page in other languages (falls back to each language's home).
  const vs = versions(page);
  const languages = HOMES().map(h => {
    const target = vs.find(v => v.lang === h.lang) || h;
    const current = target.id === page.id ? ' aria-current="page"' : '';
    return `<a href="${target.path}" hreflang="${langTag(h.lang)}" lang="${langTag(h.lang)}" data-set-lang="${h.lang}"${current}>${LANG_NAMES[h.lang]}</a>`;
  });
  const { tagline, disclaimer, built } = UI[page.lang];
  return `<footer class="xt-footer">
  <nav aria-label="Tools">${tools.join('')}</nav>
  <nav aria-label="Languages">${languages.join('')}</nav>
  <p>${tagline}</p>
  <p>${built} <a href="https://x.com/DvciAhmet" rel="noopener">@DvciAhmet</a> · <a href="${GITHUB_URL}" rel="noopener">GitHub</a> · <a href="https://www.producthunt.com/posts/xtracticle" rel="noopener">Product Hunt</a> · <a href="/llms.txt">llms.txt</a></p>
  <p>${disclaimer}</p>
</footer>`;
}

const PICKS_COPY: Record<Lang, { h2: string; all: (n: number) => string; by: string; nav: string }> = {
  en: { h2: 'This week’s best X Articles', all: n => `See all ${n} picks →`, by: 'by', nav: 'Best X Articles' },
  tr: { h2: 'Bu haftanın en iyi X makaleleri', all: n => `${n} seçkinin tamamını gör →`, by: 'yazan:', nav: 'Haftanın X makaleleri' },
  es: { h2: 'Los mejores artículos de X de la semana', all: n => `Ver las ${n} selecciones →`, by: 'por', nav: 'Mejores artículos de X' },
  pt: { h2: 'Os melhores artigos do X da semana', all: n => `Ver as ${n} escolhas →`, by: 'por', nav: 'Melhores artigos do X' },
  ja: { h2: '今週のおすすめ X 記事', all: n => `${n}本すべて見る →`, by: '著者:', nav: '今週のおすすめ X 記事' },
  zh: { h2: '本周精选 X 文章', all: n => `查看全部 ${n} 篇 →`, by: '作者：', nav: '本周精选 X 文章' },
  ar: { h2: 'أفضل مقالات X هذا الأسبوع', all: n => `عرض كل الاختيارات (${n}) ←`, by: 'بقلم', nav: 'أفضل مقالات X' },
};

/** Teaser of the newest "Best X Articles" issue, placed after the first section of home pages. */
function picksTeaser(page: SitePage): string {
  const picks = page.isHome ? latestPicks(3) : null;
  if (!picks) return '';
  const c = PICKS_COPY[page.lang];
  return `
<section class="xt-picks">
  <h2>${c.h2}</h2>
  <ol class="xt-curated">${picks.items
    .map(i => `<li><h3><a href="${i.local}">${esc(i.title)}</a></h3><p class="xt-curated-by">${c.by} ${esc(i.author)} · @${esc(i.handle)}</p></li>`)
    .join('')}</ol>
  <p><a href="/best-x-articles" hreflang="en">${c.all(picks.total)}</a></p>
</section>`;
}

function content(page: SitePage): string {
  const teaser = picksTeaser(page);
  const cut = teaser ? page.sections.indexOf('</section>') : -1;
  const sections = cut >= 0 ? page.sections.slice(0, cut + 10) + teaser + page.sections.slice(cut + 10) : page.sections;
  const body = sections + faqHtml(page);
  return (body.trim() ? `<div class="xt-content">${body}</div>\n` : '') + footer(page);
}

function config(page: SitePage): string {
  const alternates = Object.fromEntries(versions(page).map(v => [v.lang, v.path]));
  const cfg = { page: page.id, path: page.path, lang: page.lang, h1: page.h1, sub: page.sub, primary: page.primary, alternates };
  // Runs before first paint:
  //  1. a visitor who explicitly picked a language earlier is sent to this page's version in it
  //     (never on first visit, never for crawlers, only on the page's own URL — not status pages);
  //  2. clicks on language links count as an explicit pick.
  return `<script>window.__XT__=${inlineJson(cfg)};(function(){var K='xtracticle_lang',c=window.__XT__;try{var p=JSON.parse(localStorage.getItem(K)||'null');if(p&&p!==c.lang&&c.alternates[p]&&location.pathname===c.path&&!/bot|crawl|spider|slurp|preview|lighthouse/i.test(navigator.userAgent))location.replace(c.alternates[p]+location.search+location.hash)}catch(e){}document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-set-lang]');if(a)try{localStorage.setItem(K,JSON.stringify(a.getAttribute('data-set-lang')))}catch(e){}})})()</script>`;
}

export function renderPage(template: string, page: SitePage): string {
  return template
    .replace('<html lang="en">', `<html lang="${langTag(page.lang)}"${page.lang === 'ar' ? ' dir="rtl"' : ''}>`)
    .replace('<!--xt:head-->', head(page))
    .replace('<!--xt:shell-->', shell(page))
    .replace('<!--xt:content-->', content(page))
    .replace('<!--xt:config-->', config(page));
}

export function renderSitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.filter(p => !p.noindex && !p.canonical)
    .map(p => `  <url>\n    <loc>${url(p)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${p.isHome ? '1.0' : '0.8'}</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
