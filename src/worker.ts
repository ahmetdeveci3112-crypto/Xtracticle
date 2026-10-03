import { handleApi } from './shared/api';
import { handleMarkdown } from './shared/markdown';
import { handleMcp } from './shared/mcp';
import type { FxTweet } from './shared/fx';
import { titleFromText } from './shared/text';

export interface Env {
  ASSETS: Fetcher;
  /** 40 requests / 10 s per client IP on /api/* (wrangler.json `ratelimits`). */
  API_LIMITER?: RateLimit;
  /** 20 requests / 60 s per client IP on the agent endpoints (/mcp, /api/markdown). */
  AGENT_IP_LIMITER?: RateLimit;
  /** Shared budget for all agent traffic (one key), so AI clients can't use up the Workers quota the site needs. */
  AGENT_GLOBAL_LIMITER?: RateLimit;
  /** Kill switch: set to "1" in the Cloudflare dashboard (Workers → Settings → Variables) to turn off /mcp and /api/markdown. */
  AGENTS_DISABLED?: string;
}

/**
 * Cloudflare Worker for Xtracticle. Runs before static assets only for the
 * paths listed in wrangler.json `assets.run_worker_first`:
 *   /api/*                     → JSON API (src/shared/api.ts), /api/markdown/:id (src/shared/markdown.ts)
 *   /mcp                       → remote MCP server (src/shared/mcp.ts)
 *   /{user}/status/{id}        → app shell with per-post meta tags + preloaded data
 * Everything else is served directly from dist/ (with 404.html for unknown paths).
 */

const STATUS_PATH = /^\/(?:([A-Za-z0-9_]{1,15})|i(?:\/web)?)\/status(?:es)?\/(\d{1,25})\/?$/;
const SSR_TIMEOUT_MS = 4500;
const DEFAULT_IMAGE = 'https://xtracticle.com/og-image.png';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const isMcp = url.pathname === '/mcp' || url.pathname === '/mcp/';
    const isMarkdownApi = url.pathname.startsWith('/api/markdown/');
    if ((isMcp && request.method === 'POST') || isMarkdownApi) {
      const blocked = await agentGate(request, env, isMcp);
      if (blocked) return blocked;
    }
    if (isMcp) return handleMcp(request, p => ctx.waitUntil(p));

    if (url.pathname.startsWith('/api/')) {
      if (!isMarkdownApi && (await rateLimited(request, env))) return tooManyRequests();
      const waitUntil = (p: Promise<unknown>) => ctx.waitUntil(p);
      const res = (await handleMarkdown(request, waitUntil)) ?? (await handleApi(request, waitUntil));
      return (
        res ??
        new Response(JSON.stringify({ error: 'Not found.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      );
    }

    if (url.pathname.startsWith('/video/')) return serveVideo(request, env);

    const match = url.pathname.match(STATUS_PATH);
    if (match && (request.method === 'GET' || request.method === 'HEAD')) {
      return renderStatusPage(request, env, ctx, match[2]);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

/**
 * Protects the site from AI-agent traffic (/mcp, /api/markdown): a kill switch, a per-IP
 * limit and one shared budget. On the free Workers plan every request counts toward the
 * daily quota the web app also needs, so agents get turned away first.
 */
async function agentGate(request: Request, env: Env, isMcp: boolean): Promise<Response | null> {
  if (env.AGENTS_DISABLED === '1') {
    return agentError(isMcp, 503, 'The Xtracticle MCP server and Markdown API are temporarily disabled. Please use https://xtracticle.com in a browser.');
  }
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.AGENT_IP_LIMITER && !(await env.AGENT_IP_LIMITER.limit({ key: ip })).success) {
    return agentError(isMcp, 429, 'Too many requests from your connection. Please wait a minute and try again.');
  }
  if (env.AGENT_GLOBAL_LIMITER && !(await env.AGENT_GLOBAL_LIMITER.limit({ key: 'all' })).success) {
    return agentError(isMcp, 429, 'The free Xtracticle MCP server is busy right now. Please try again in a minute.');
  }
  return null;
}

function agentError(isMcp: boolean, status: number, message: string): Response {
  const headers = {
    'Content-Type': isMcp ? 'application/json' : 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Retry-After': '60',
  };
  const body = isMcp ? JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32000, message } }) : message + '\n';
  return new Response(body, { status, headers });
}

/** 40 requests / 10 s per client IP on the web app's /api/*. */
async function rateLimited(request: Request, env: Env): Promise<boolean> {
  if (!env.API_LIMITER) return false;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const { success } = await env.API_LIMITER.limit({ key: ip });
  return !success;
}

function tooManyRequests(): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Please wait a few seconds and try again.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': '10', 'Access-Control-Allow-Origin': '*' },
  });
}

/* ─── /video/* with byte-range support ─── */

/**
 * Static assets are always served whole (200), but Safari/iOS only plays <video>
 * when the server answers Range requests with 206. Videos are small (~1.6 MB) and
 * only requested on click, so slicing the asset here is cheap.
 */
async function serveVideo(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const asset = await env.ASSETS.fetch(new Request(`${url.origin}${url.pathname}`));
  if (asset.status !== 200) return asset;

  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=86400');
  const range = request.headers.get('Range');
  if (!range) return new Response(request.method === 'HEAD' ? null : asset.body, { status: 200, headers });

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  let start = m && m[1] !== '' ? Number(m[1]) : NaN;
  let end = m && m[2] !== '' ? Number(m[2]) : size - 1;
  if (m && m[1] === '' && m[2] !== '') {
    // Suffix range: the last N bytes.
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  }
  end = Math.min(end, size - 1);
  if (!m || Number.isNaN(start) || start > end || start >= size) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), { status: 206, headers });
}

/* ─── /{user}/status/{id} ─── */

async function loadThread(origin: string, id: string, ctx: ExecutionContext): Promise<FxTweet[] | null> {
  const apiResponse = handleApi(new Request(`${origin}/api/thread/${id}`), p => ctx.waitUntil(p));
  const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), SSR_TIMEOUT_MS));
  const res = await Promise.race([apiResponse, timeout]);
  if (!res || res.status !== 200) return null;
  const data: any = await res.json();
  return Array.isArray(data?.tweets) && data.tweets.length ? data.tweets : null;
}

function describe(tweets: FxTweet[]) {
  const first = tweets[0];
  const handle = first.author.screen_name;
  const clean = (s: string) => s.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
  const article = first.article;
  const firstLine = titleFromText(first.text);

  let title: string;
  let description: string;
  if (article?.title) {
    title = article.title;
    description = clean(article.preview_text || '') || `An X article by ${first.author.name} (@${handle}).`;
  } else if (tweets.length > 1) {
    title = firstLine ? `${firstLine} — thread by @${handle}` : `Thread by @${handle}`;
    description = clean(first.text) || `A ${tweets.length}-post thread by @${handle}.`;
  } else {
    title = firstLine ? `${firstLine} — @${handle}` : `Post by @${handle}`;
    description = clean(first.text) || `A post by ${first.author.name} (@${handle}).`;
  }
  if (description.length > 200) description = description.slice(0, 197).trimEnd() + '…';
  else if (!/[.!?…"')\]]$/u.test(description)) description += '…';

  const image =
    article?.cover_media?.media_info?.original_img_url ||
    first.media?.photos?.[0]?.url ||
    first.media?.videos?.[0]?.thumbnail_url ||
    null;

  const kind = article ? 'Article' : tweets.length > 1 ? `Thread · ${tweets.length} posts` : 'Post';
  return { title, description, image, kind, author: `${first.author.name} (@${handle})` };
}

async function renderStatusPage(request: Request, env: Env, ctx: ExecutionContext, id: string): Promise<Response> {
  const url = new URL(request.url);
  const [shell, tweets] = await Promise.all([
    env.ASSETS.fetch(new Request(`${url.origin}/`)),
    loadThread(url.origin, id, ctx).catch(() => null),
  ]);

  const pageUrl = `${url.origin}${url.pathname}`;
  const meta = tweets ? describe(tweets) : null;
  const title = meta ? `${meta.title} | Download as PDF, Markdown — Xtracticle` : 'Download X post | Xtracticle';
  const description = meta
    ? `${meta.kind} by ${meta.author}: ${meta.description} — Download as PDF, Markdown, EPUB or text.`
    : 'Download this X post as PDF, Markdown, EPUB or text with Xtracticle.';
  const image = meta?.image || DEFAULT_IMAGE;
  const preload = tweets
    ? `<script>window.__XT_PRELOAD__=${JSON.stringify({ id, tweets }).replace(/</g, '\\u003c')}</script>`
    : '';

  const setContent = (value: string) => ({
    element(el: Element) {
      el.setAttribute('content', value);
    },
  });
  const remove = { element(el: Element) { el.remove(); } };

  const rewritten = new HTMLRewriter()
    .on('title', { element(el) { el.setInnerContent(title); } })
    .on('meta[name="description"]', setContent(description))
    .on('meta[name="robots"]', setContent('noindex, follow'))
    .on('link[rel="canonical"]', { element(el) { el.setAttribute('href', pageUrl); } })
    .on('link[rel="alternate"][hreflang]', remove)
    .on('script[type="application/ld+json"]', remove)
    .on('meta[property="og:type"]', setContent('article'))
    .on('meta[property="og:url"]', setContent(pageUrl))
    .on('meta[property="og:title"]', setContent(meta?.title || title))
    .on('meta[property="og:description"]', setContent(description))
    .on('meta[property="og:image"]', setContent(image))
    .on('meta[property="og:image:width"]', image === DEFAULT_IMAGE ? {} : remove)
    .on('meta[property="og:image:height"]', image === DEFAULT_IMAGE ? {} : remove)
    .on('meta[property="og:image:alt"]', setContent(meta?.title || 'Xtracticle'))
    .on('meta[name="twitter:title"]', setContent(meta?.title || title))
    .on('meta[name="twitter:description"]', setContent(description))
    .on('meta[name="twitter:image"]', setContent(image))
    .on('head', { element(el) { el.append(preload, { html: true }); } })
    .transform(shell);

  const headers = new Headers(rewritten.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-cache');
  headers.set('X-Robots-Tag', 'noindex, follow');
  headers.set('Link', '</llms.txt>; rel="llms-txt"');
  return new Response(request.method === 'HEAD' ? null : rewritten.body, { status: tweets ? 200 : 404, headers });
}
