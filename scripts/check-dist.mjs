#!/usr/bin/env node
/**
 * Post-build integrity check: every /assets/* file referenced by the built HTML
 * or JS (script tags, modulepreload links, Vite's lazy-chunk preload lists) must
 * exist in dist/, and every page must carry its CSS inline.
 *
 * Runs as part of `npm run build`, so Cloudflare refuses to deploy a broken
 * build. Catches the Sep 2026 bug where the inlined CSS file was deleted while
 * lazy export chunks still preloaded it ("Unable to preload CSS").
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] || 'dist');
const files = fs.readdirSync(dist, { recursive: true }).map(String);
const html = files.filter(f => f.endsWith('.html'));
const js = files.filter(f => f.startsWith(`assets${path.sep}`) && f.endsWith('.js'));

const problems = [];
const ASSET_REF = /["'(\s]\/?(assets\/[\w.\-]+\.(?:js|css|woff2?|png|jpe?g|webp|svg))/g;

for (const file of [...html, ...js]) {
  const text = fs.readFileSync(path.join(dist, file), 'utf8');
  for (const [, ref] of text.matchAll(ASSET_REF)) {
    if (!fs.existsSync(path.join(dist, ref))) problems.push(`${file} → missing ${ref}`);
  }
}

for (const file of html) {
  const text = fs.readFileSync(path.join(dist, file), 'utf8');
  if (!text.includes('<style>')) problems.push(`${file} → CSS is not inlined`);
  if (/<link[^>]+rel="stylesheet"[^>]+href="\/assets\//.test(text)) problems.push(`${file} → render-blocking CSS link left in page`);
}

// /saved (docs/chrome-extension-plan.md, A5): no GA, no inline event handlers, and every inline script
// allowed by the strict CSP in _headers (hashes filled in by site/plugin.ts).
const headersPath = path.join(dist, '_headers');
const headers = fs.existsSync(headersPath) ? fs.readFileSync(headersPath, 'utf8') : '';
if (headers.includes('{{')) problems.push('_headers → unfilled placeholder');
const savedCsp = [...headers.matchAll(/^\/(?::lang\/)?saved\n\s+Content-Security-Policy: (.+)$/gm)].map(m => m[1]);
const saved = html.filter(f => /(^|[\\/])saved\.html$/.test(f));
if (saved.length && savedCsp.length < 2) problems.push('_headers → CSP for /saved and /:lang/saved missing');
for (const file of saved) {
  const text = fs.readFileSync(path.join(dist, file), 'utf8');
  if (/googletagmanager|gtag\('config'/.test(text)) problems.push(`${file} → loads Google Analytics`);
  if (/\son[a-z]+="/i.test(text)) problems.push(`${file} → inline event handler (blocked by its CSP)`);
  for (const [, attrs, body] of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/\bsrc=/.test(attrs) || /type="application\/(ld\+)?json"/.test(attrs)) continue;
    const hash = `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;
    if (!savedCsp.every(csp => csp.includes(hash))) problems.push(`${file} → inline script ${hash} not allowed by its CSP`);
  }
}

if (problems.length) {
  console.error(`\n✗ dist integrity check failed (${problems.length}):`);
  for (const p of [...new Set(problems)]) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`✓ dist integrity: ${html.length} pages, ${js.length} scripts, all asset references resolve; ${saved.length} /saved pages match their CSP`);
