<div align="center">
  <img width="80" height="80" src="public/icon-512.png" alt="Xtracticle Logo"/>
  <h1>Xtracticle</h1>
  <p><strong>Extract and download articles, threads & posts from X as Markdown, Text, or PDF.</strong></p>
  <p>Free, open source, no login required.</p>

  <p>
    <a href="https://www.producthunt.com/posts/xtracticle" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=xtracticle&theme=light" alt="Xtracticle - Download X articles & threads as Markdown, Text or PDF | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#seo--ai-discoverability">SEO & AI</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS 4"/>
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
</div>

---

## Features

### Core
- 📥 **Three export formats** — Markdown (`.md`), Plain Text (`.txt`), and PDF
- 📝 **Full X Article support** — Parses Draft.js-based articles with headings, bold, italic, links, images, blockquotes, and lists
- 🧵 **Thread/Flood merging** — Detects multi-tweet threads and merges up to 25 posts into a single document
- 📋 **Copy to clipboard** — One-click markdown copy with visual feedback
- 🔗 **Share** — Native Web Share API on mobile, URL copy fallback on desktop
- 📜 **Extraction history** — Last 10 extractions saved in localStorage for quick re-access

### UI/UX
- 🌙 **Dark mode** — Automatic system detection + manual toggle, persisted in localStorage
- ✨ **Micro-animations** — Smooth fadeIn, slideUp, shake, pulse, and check-bounce effects
- 🔤 **Inter font** — Premium typography via Google Fonts
- 🌍 **Bilingual** — English and Turkish, auto-detected from browser language

### Infrastructure
- ⚡ **Edge-deployed** — Cloudflare Worker with zero cold start, globally distributed
- 🗄️ **Edge caching** — 5-minute cache + 10-minute stale-while-revalidate
- 🔒 **No API keys** — Uses the public [fxtwitter](https://github.com/FixTweet/FxTwitter) API
- 🔍 **SEO optimized** — JSON-LD structured data, Open Graph, Twitter Cards, noscript fallback
- 🤖 **AI discoverable** — `llms.txt`, `llms-full.txt`, FAQ schema, HTTP headers for AI agents

## Demo

**Live:** [xtracticle.com](https://xtracticle.com)

### How to use
1. Copy any X post URL (e.g. `https://x.com/username/status/123456789`)
2. Paste into Xtracticle → Click **Extract**
3. Download as `.md`, `.txt`, or `PDF` — or copy/share

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + TypeScript | UI components and state |
| **Build** | Vite 6 | Dev server + production build |
| **Styling** | TailwindCSS 4 + Typography Plugin | Design system with CSS custom properties |
| **Markdown** | react-markdown + remark-gfm | Article preview rendering |
| **PDF** | html2pdf.js | Client-side PDF generation |
| **Icons** | lucide-react | UI icon set |
| **Backend** | Cloudflare Worker | API proxy + static asset serving |
| **Hosting** | Cloudflare Workers + Assets | Edge deployment with CDN |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & Run

```bash
git clone https://github.com/ahmetdeveci3112-crypto/Xtracticle.git
cd Xtracticle
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`. The Vite config includes a local API proxy middleware that mimics the Worker behavior — no Cloudflare or wrangler needed for development.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with API proxy |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type checking |

## Deployment

Deployed on **Cloudflare Workers** with automatic GitHub integration.

### Setup

1. Connect your GitHub repo at [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/)
2. Configure build settings:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |

3. Push to `main` — Cloudflare auto-builds and deploys.

No environment variables needed. The `wrangler.json` in the repo configures everything:

```json
{
  "name": "xtracticle",
  "compatibility_date": "2024-01-01",
  "main": "src/worker.ts",
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  }
}
```

### Edge Caching

Successful tweet fetches are cached at the edge for **5 minutes** (`s-maxage=300`) with a 10-minute stale-while-revalidate window. This protects the upstream API under heavy traffic.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│              Cloudflare Workers (Edge)                │
│                                                       │
│  ┌───────────────────┐    ┌────────────────────────┐  │
│  │    Static Assets   │    │   Worker (src/worker.ts)│  │
│  │    (React SPA)     │    │   /api/tweet/:id       │  │
│  │    dist/           │◀──│   /api/thread/:id      │  │
│  └───────────────────┘    │   Edge cache (5 min)   │  │
│                            └──────────┬─────────────┘  │
│                                       │                │
└───────────────────────────────────────┼────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  fxtwitter.com    │
                              │  (Public API)     │
                              └──────────────────┘
```

### Request Flow

```
User → Paste X URL → Extract tweet ID → Worker: /api/thread/:id
                                              ↓
                                        fxtwitter API (per tweet)
                                              ↓
                                        Traverse replying_to_status chain (up to 25)
                                              ↓
                                        Return { tweets[], isThread }
                                              ↓
                                        Frontend: merge or single render
                                              ↓
                                        Download / Copy / Share
```

### Article Parsing

X articles use a Draft.js block format. The app converts these blocks to Markdown:

| Block Type | Markdown Output |
|------------|----------------|
| `header-two` | `### Heading` |
| `header-three` | `#### Heading` |
| `unstyled` | Paragraph text |
| `unordered-list-item` | `- Item` |
| `ordered-list-item` | `1. Item` |
| `blockquote` | `> Quote` |
| `atomic` (MEDIA) | `![caption](url)` |
| `atomic` (DIVIDER) | `---` |

Inline styles (`Bold`, `Italic`, `CODE`) and entity ranges (`LINK`) are processed character-by-character for precise formatting.

### Thread Detection

Threads (floods) are handled via the `/api/thread/:id` Worker endpoint:

1. **Auto-detection on extract:** Every fetch goes through `/api/thread/:id` first. If the tweet is part of a self-reply chain, the Worker traverses **upward** via `replying_to_status` (up to 25 depth), collecting all tweets by the same author.
2. **Automatic merging:** If multiple tweets are found, they're merged into a single numbered document automatically — no button click needed.
3. **Manual fallback:** If the initial fetch returns a reply tweet that wasn't auto-detected, a "Load Full Thread" button appears.
4. **Thread tip:** When the first tweet of a thread is pasted (has replies but no `replying_to_status`), a helpful tip appears: *"To download a full thread, paste the link of the last tweet."*

> **Best practice:** For threads/floods, paste the **last tweet's URL** for best results. The Worker will traverse upward and find all previous tweets in the chain.

## SEO & AI Discoverability

This project is built with maximum discoverability in mind — for both traditional search engines and AI agents/browsers.

### Search Engine Optimization

| Layer | Implementation |
|-------|---------------|
| **Structured Data** | 4 JSON-LD schemas: `WebApplication`, `HowTo`, `FAQPage`, `BreadcrumbList` |
| **Open Graph** | Full OG meta tags with `og:image` (1200×630) |
| **Twitter Card** | `summary_large_image` card |
| **Noscript Fallback** | Complete semantic HTML content for JS-disabled crawlers |
| **Hreflang** | `en` / `tr` / `x-default` language alternates |
| **Sitemap** | `sitemap.xml` with main page + AI documentation pages |
| **Robots** | `robots.txt` with explicit allow directives |

### AI Agent Discoverability

| File | Purpose |
|------|---------|
| [`/llms.txt`](public/llms.txt) | Structured Markdown summary for AI agents ([llmstxt.org](https://llmstxt.org) standard) |
| [`/llms-full.txt`](public/llms-full.txt) | Comprehensive documentation: features, API, architecture, privacy |
| **HTTP Headers** | `Link: </llms.txt>; rel="llms-txt"` and `X-Llms-Txt: /llms.txt` on all HTML responses |
| **FAQ Schema** | Question-answer pairs optimized for AI answer engines (Perplexity, ChatGPT Search, Google AI Overview) |
| **HowTo Schema** | Step-by-step usage guide in structured data |

### PWA

| Feature | Implementation |
|---------|---------------|
| **Manifest** | `manifest.json` with app name, icons, theme, share target |
| **Share Target** | Users can share X URLs directly to Xtracticle from mobile OS share sheets |
| **Theme Color** | Adaptive light/dark theme-color meta tags |
| **Apple Web App** | Full iOS home screen app support |

## Project Structure

```
Xtracticle/
├── public/
│   ├── icon-512.png          # App icon / favicon
│   ├── og-image.png          # Open Graph social preview image
│   ├── manifest.json         # PWA manifest with share_target
│   ├── robots.txt            # Crawler directives
│   ├── sitemap.xml           # Sitemap for search engines
│   ├── llms.txt              # AI agent site map (llmstxt.org standard)
│   └── llms-full.txt         # Comprehensive AI-readable documentation
├── src/
│   ├── App.tsx               # Main application (UI, state, logic)
│   ├── index.css             # Design system (CSS properties, dark mode, animations)
│   ├── main.tsx              # React entry point
│   └── worker.ts             # Cloudflare Worker (API proxy + asset serving)
├── index.html                # SPA entry (SEO meta tags, JSON-LD, noscript fallback)
├── wrangler.json             # Cloudflare Worker + Assets configuration
├── vite.config.ts            # Vite config with dev API proxy middleware
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Notes

- **Local dev** uses a Vite middleware plugin to proxy `/api/tweet/:id` and `/api/thread/:id` to fxtwitter — no wrangler needed
- **Production** uses the Cloudflare Worker (`src/worker.ts`) which handles API routing (single tweet + thread assembly) and static asset serving
- The `wrangler.json` controls the Worker + Assets deployment — do not add a `functions/` directory
- Dark mode uses CSS custom properties defined in `src/index.css`, toggled via the `.dark` class on `<html>`
- Thread traversal only goes **upward** (via `replying_to_status`). Forward/downward traversal is not supported by the fxtwitter API

## License

This project is open source and available under the [MIT License](LICENSE).
