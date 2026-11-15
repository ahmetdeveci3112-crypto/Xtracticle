#!/usr/bin/env node
/**
 * Post-build check for the extension package (docs/chrome-extension-plan.md, B2):
 *   - every file the manifest names exists
 *   - permissions stay as narrow as planned (no tabs, cookies, webRequest, scripting, <all_urls>, …)
 *   - no remote code: no external <script src>, no eval( / new Function( / import("http…")
 *   - content scripts are self-contained (no import / export statements)
 *   - the store build carries no localhost access
 *   - the zipped package is under 5 MB
 *
 *   node scripts/check-ext.mjs [dir]   (default extension/dist)
 */
import fs from 'node:fs';
import path from 'node:path';
import { zipSync } from 'fflate';

const dir = path.resolve(process.argv[2] || 'extension/dist');
const problems = [];
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const exists = f => fs.existsSync(path.join(dir, f));

if (!exists('manifest.json')) {
  console.error(`✗ extension check: no manifest.json in ${dir} (run npm run build:ext first)`);
  process.exit(1);
}
const manifest = JSON.parse(read('manifest.json'));

/* ─── Files named by the manifest ─── */
const named = new Set();
const add = f => f && named.add(f);
Object.values(manifest.icons || {}).forEach(add);
Object.values(manifest.action?.default_icon || {}).forEach(add);
add(manifest.action?.default_popup);
add(manifest.background?.service_worker);
for (const cs of manifest.content_scripts || []) (cs.js || []).concat(cs.css || []).forEach(add);
for (const f of named) if (!exists(f)) problems.push(`manifest names ${f}, which is missing`);

/* ─── Permissions ─── */
if (manifest.manifest_version !== 3) problems.push('manifest_version must be 3');
const FORBIDDEN = ['tabs', 'cookies', 'webRequest', 'webRequestBlocking', 'scripting', 'downloads', 'activeTab', 'history', 'management', 'debugger', '<all_urls>'];
const perms = [...(manifest.permissions || []), ...(manifest.optional_permissions || [])];
for (const p of perms) if (FORBIDDEN.includes(p)) problems.push(`forbidden permission: ${p}`);
const hosts = [...(manifest.host_permissions || []), ...(manifest.content_scripts || []).flatMap(cs => cs.matches || [])];
for (const h of hosts) if (h === '<all_urls>' || /^\*:\/\/\*\//.test(h) || /^https?:\/\/\*\//.test(h)) problems.push(`host pattern too broad: ${h}`);
if (manifest.web_accessible_resources) problems.push('web_accessible_resources is not expected');
if (manifest.externally_connectable) problems.push('externally_connectable is not expected');
const storeBuild = !/\(dev\)/.test(manifest.name);
if (storeBuild && hosts.some(h => /localhost|127\.0\.0\.1/.test(h))) problems.push('store build grants localhost access');

/* ─── Code ─── */
const files = fs.readdirSync(dir, { recursive: true }).map(String).filter(f => fs.statSync(path.join(dir, f)).isFile());
const contentScripts = new Set((manifest.content_scripts || []).flatMap(cs => cs.js || []));
for (const f of files) {
  if (f.endsWith('.js')) {
    const code = read(f);
    if (/\beval\s*\(/.test(code)) problems.push(`${f}: eval(`);
    if (/\bnew\s+Function\s*\(/.test(code)) problems.push(`${f}: new Function(`);
    if (/\bimport\s*\(\s*["'`]https?:/.test(code)) problems.push(`${f}: remote dynamic import`);
    if (/\bimportScripts\s*\(/.test(code)) problems.push(`${f}: importScripts(`);
    if (contentScripts.has(f) && (/^\s*import[\s{*"']/m.test(code) || /^\s*export\s/m.test(code) || /\bimport\s*\(/.test(code))) {
      problems.push(`${f}: content scripts must not import or export`);
    }
    if (storeBuild && /localhost:\d+|127\.0\.0\.1/.test(code)) problems.push(`${f}: localhost URL in the store build`);
  }
  if (f.endsWith('.html')) {
    const html = read(f);
    for (const [, src] of html.matchAll(/<script[^>]*\bsrc=["']([^"']+)["']/g)) if (/^(https?:)?\/\//.test(src)) problems.push(`${f}: remote script ${src}`);
    if (/<script(?![^>]*\bsrc=)[^>]*>\s*\S/.test(html)) problems.push(`${f}: inline script (blocked by the extension CSP)`);
  }
}

/* ─── Size ─── */
const zip = zipSync(Object.fromEntries(files.map(f => [f, new Uint8Array(fs.readFileSync(path.join(dir, f)))])), { level: 9 });
const MB = 1024 * 1024;
if (zip.length > 5 * MB) problems.push(`zipped package is ${(zip.length / MB).toFixed(2)} MB (limit 5 MB)`);

if (problems.length) {
  console.error(`\n✗ extension check failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`✓ extension ${manifest.version}: ${files.length} files, ${named.size} named by the manifest, zip ${(zip.length / 1024).toFixed(1)} KB, permissions [${(manifest.permissions || []).join(', ')}]`);
