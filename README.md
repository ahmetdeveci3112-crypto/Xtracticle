<div align="center">
  <img width="80" height="80" src="https://img.icons8.com/fluency/96/download-2.png" alt="Xtracticle Logo"/>
  <h1>Xtracticle</h1>
  <p><strong>Download long-form articles and threads from X (formerly Twitter) as Markdown, Text, or PDF.</strong></p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#deployment">Deployment</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#contributing">Contributing</a>
  </p>

  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6"/>
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="TailwindCSS 4"/>
  <img src="https://img.shields.io/badge/Cloudflare_Pages-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages"/>
</div>

---

## Features

- 📥 **Three export formats** — Markdown (`.md`), Plain Text (`.txt`), and PDF
- 📝 **Full article support** — Parses X's Draft.js-based article format with headings, bold, italic, links, images, blockquotes, and lists
- 🐦 **Regular tweets too** — Works with standard tweets including attached images
- 🌍 **Bilingual UI** — English and Turkish (auto-detected from browser language)
- ⚡ **Edge-deployed API** — Cloudflare Workers for fast, globally distributed tweet fetching
- 🔒 **No API keys required** — Uses the public [fxtwitter](https://github.com/FixTweet/FxTwitter) API

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript |
| **Build** | Vite 6 |
| **Styling** | TailwindCSS 4 + Typography Plugin |
| **Markdown** | react-markdown + remark-gfm |
| **PDF Export** | html2pdf.js (client-side) |
| **Icons** | lucide-react |
| **API** | Cloudflare Pages Functions (Edge) |
| **Hosting** | Cloudflare Pages |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/ahmetdeveci3112-crypto/Xtracticle.git
cd Xtracticle
npm install
```

### Development

```bash
npm run dev
```

This starts both the Vite dev server and the Cloudflare Pages Function locally via [wrangler](https://developers.cloudflare.com/workers/wrangler/). The app will be available at `http://localhost:8788`.

### Build

```bash
npm run build
```

Outputs static files to `dist/`.

## Deployment

This app is designed to run on **Cloudflare Pages** with zero configuration:

1. Connect your GitHub repo to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Set build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. Deploy — Cloudflare automatically detects the `functions/` directory and deploys the API endpoint as an edge function.

That's it. No environment variables needed.

### API Caching

Successful tweet fetches are cached at the edge for **5 minutes** (`s-maxage=300`) with a 10-minute stale-while-revalidate window. This significantly reduces load on the upstream API under heavy traffic.

## How It Works

```
User pastes X URL → Frontend extracts Tweet ID → /api/tweet/:id →
Cloudflare Worker fetches from fxtwitter API → Returns tweet data →
Frontend parses Draft.js blocks → Renders Markdown preview →
User downloads as .md / .txt / .pdf
```

### Architecture

```
┌─────────────────────────────────────────────────┐
│                 Cloudflare Pages                 │
│                                                  │
│  ┌──────────────┐    ┌────────────────────────┐  │
│  │  Static Site  │    │  Pages Function (Edge) │  │
│  │  (React/Vite) │──▶│  /api/tweet/:id        │  │
│  │  dist/        │    │  functions/api/tweet/   │  │
│  └──────────────┘    └──────────┬─────────────┘  │
│                                  │                │
└──────────────────────────────────┼────────────────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │  fxtwitter.com  │
                          │  (Public API)   │
                          └────────────────┘
```

### Article Parsing

X articles use a Draft.js-based block format. The app converts these blocks to Markdown:

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

## Project Structure

```
Xtracticle/
├── functions/
│   └── api/tweet/[[id]].ts   # Cloudflare Pages Function (API proxy)
├── src/
│   ├── App.tsx               # Main application component
│   ├── index.css             # TailwindCSS v4 imports
│   └── main.tsx              # React entry point
├── index.html                # SPA entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
