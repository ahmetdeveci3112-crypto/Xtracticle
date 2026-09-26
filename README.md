<div align="center">
  <img width="80" height="80" src="public/icon-192.png" alt="Xtracticle Logo"/>
  <h1>Xtracticle</h1>
  <p><strong>Download X (Twitter) Articles, threads & posts as PDF, Markdown, EPUB/Kindle, text or a ZIP with images.</strong></p>
  <p>Free, open source, no login required.</p>

  <p>
    <a href="https://www.producthunt.com/posts/xtracticle" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=xtracticle&theme=light" alt="Xtracticle - Download X articles & threads as Markdown, Text or PDF | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#seo--ai-discoverability">SEO & AI</a> •
    <a href="#api">API</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS 4"/>
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
</div>

---

**Live:** [xtracticle.com](https://xtracticle.com) — or just change `x.com` to `xtracticle.com` in any post URL.

## Features

### Export formats
| Format | What you get |
|--------|--------------|
| **PDF** | A4, print-ready; title/author/date/source header, images, page numbers, clickable source link. Rendered page by page so long articles never produce blank PDFs and lines are never cut. |
| **Markdown** | Headings, bold/italic/strikethrough, links, nested lists, quotes, code, dividers, images, video thumbnails. Optional YAML front-matter (Obsidian properties, Hugo/Jekyll/Astro). |
| **EPUB 3** | Reflowable e-book with embedded images and metadata — Kindle (Send to Kindle), Kobo, Apple Books. |
| **ZIP + images** | Markdown + every image stored locally — an offline archive that survives deleted posts. |
| **Text** | Clean `.txt`. |
| **Obsidian** | Copies the Markdown and opens a new note via `obsidian://new`. |

### Content
- 📝 **X Articles** — full Draft.js conversion: cover, inline images, videos, captions, embedded posts
- 🧵 **Threads from any post** — paste the first, a middle or the last post; the whole self-thread is assembled (other people's replies are excluded)
- 💬 **Posts** — line breaks, photos, videos and quoted posts
- 🔗 **Flexible input** — x.com, twitter.com, mobile, fxtwitter/vxtwitter/fixupx, nitter/xcancel links, `/i/web/status/`, bare IDs, links inside shared text

### Workflow
- 🔁 **URL swap** — `xtracticle.com/{user}/status/{id}` opens a post directly, with rich link previews (Open Graph) when shared
- 📚 **Batch mode** — up to 20 links → one ZIP of Markdown files
- 🔖 **Bookmarklet** and **PWA share target** (share from the X app on Android)
- 🔊 **Listen** — read aloud with the browser's text-to-speech
- 📜 **History**, 🌙 **dark mode**, 🌍 **English / Turkish**
- 📈 **Analytics events** — `extract`, `download` (format), `copy`, `share`, `listen`, `batch_extract`, errors — in GA4

## Getting Started

```bash
git clone https://github.com/ahmetdeveci3112-crypto/Xtracticle.git
cd Xtracticle
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. `/api/*` is served by the **same handler as the Worker** (`src/shared/api.ts`), and every landing page is rendered on the fly — no wrangler needed.

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server with the API |
| `npm run build` | Production build → `dist/` (all landing pages, 404, sitemap) |
| `npm run preview:worker` | Build and run the real Worker locally with `wrangler dev` (SSR status pages, 404s, `_headers`) |
| `npm run lint` | Type-check the app and the Worker |

## Deployment

Cloudflare Workers + Static Assets, deployed automatically on push to `main` (build: `npm run build`, deploy: `npx wrangler deploy`). No environment variables.

`wrangler.json`:
- `run_worker_first` — only `/api/*` and `/*/status/*` hit the Worker; everything else is served straight from the CDN
- `not_found_handling: "404-page"` — unknown URLs return a real `404` (no soft-404s)
- `public/_headers` — security headers, `Link: </llms.txt>`, immutable caching for hashed assets

## Architecture

```
Browser ──► Cloudflare
             ├─ Static assets (dist/)          /, /x-article-to-pdf, /tr/, … , 404.html, sitemap.xml
             └─ Worker (src/worker.ts)
                 ├─ /api/thread/:id, /api/tweet/:id ──► src/shared/api.ts ──► FxTwitter API
                 │                                        (edge cache, 5 min)
                 └─ /{user}/status/{id} ──► app shell + per-post OG tags + preloaded JSON (noindex)
```

```
src/
├── App.tsx              UI: extraction, exports, batch mode, deep links
├── i18n.ts              EN / TR strings
├── lib/convert.ts       Posts / threads / Draft.js articles → Markdown + text + metadata
├── lib/export.ts        PDF (jsPDF + html2canvas-pro), EPUB, ZIP (fflate), Obsidian
├── lib/url.ts           Input + path parsing
├── lib/analytics.ts     GA4 event helper
├── shared/fx.ts         FxTwitter client (v2 thread endpoint + v1 fallback), shared by Worker & dev server
├── shared/api.ts        JSON API handler with edge caching
├── shared/text.ts       Title extraction
└── worker.ts            Cloudflare Worker (API + status-page SSR)
site/
├── pages.ts             Landing page content (one page per search intent)
├── render.ts            Head/meta/JSON-LD/content/footer rendering
└── plugin.ts            Vite plugin: emits every page, 404.html and sitemap.xml
```

Heavy export libraries are dynamically imported, so the initial page only loads React + the app.

## SEO & AI Discoverability

| Layer | Implementation |
|-------|---------------|
| **Intent pages** | `/x-article-to-pdf`, `/x-article-to-markdown`, `/x-thread-to-pdf`, `/x-article-to-epub`, `/save-x-articles-to-obsidian`, `/tr/` — each with unique, visible HTML content and FAQ |
| **Crawlable content** | Content is static HTML outside the React root — no JS needed to index it |
| **Structured data** | `WebApplication`, `FAQPage` (matches visible FAQ), `BreadcrumbList` |
| **i18n** | Proper `hreflang` pair for `/` ↔ `/tr/` |
| **Share pages** | `/{user}/status/{id}` get post-specific OG/Twitter tags; `noindex, follow` |
| **Sitemap / 404** | Generated at build; real 404 status for unknown URLs |
| **AI** | [`/llms.txt`](public/llms.txt), [`/llms-full.txt`](public/llms-full.txt), AI crawlers allowed in `robots.txt` |

## API

```
GET /api/thread/:id  → { tweets: Tweet[], count, isThread }   # self-thread containing :id
GET /api/tweet/:id   → Tweet
```

`Tweet` mirrors the FxTwitter status object (`text`, `author`, `media`, `quote`, `article`, …). Responses are edge-cached for 5 minutes — please be gentle.

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes
4. Open a Pull Request

Notes:
- Landing page copy lives in `site/pages.ts`; run `npm run build` to see the generated HTML
- Keep `src/shared/*` free of DOM/Node-only APIs — it runs in both the Worker and the dev server
- Test Worker-only behavior (SSR, 404, headers) with `npm run preview:worker`

## License

MIT
