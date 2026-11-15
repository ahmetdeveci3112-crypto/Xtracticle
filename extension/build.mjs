#!/usr/bin/env node
/**
 * Builds the MV3 extension (docs/chrome-extension-plan.md, B2) with Vite's JS API.
 *
 *   node extension/build.mjs          store build → extension/dist      (XT_BASE https://xtracticle.com)
 *   node extension/build.mjs --dev    local build → extension/dist-dev  (XT_BASE http://localhost:8787,
 *                                     plus localhost host permission and bridge match for `wrangler dev`)
 *   XT_BASE=<url> overrides the base of either build.
 *   --out=<dir>                       writes somewhere else (tests build throw-away copies this way)
 *
 * Output: sw.js (one ES module), hook.js / content.js / bridge.js (separate IIFEs, no imports),
 * popup.html + popup.js + popup.css, icons/, manifest.json.
 * The extension's version comes from extension/manifest.json only (independent of the site's package.json).
 * The site build (`npm run build`) is not touched.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dev = process.argv.includes('--dev');
const base = (process.env.XT_BASE || (dev ? 'http://localhost:8787' : 'https://xtracticle.com')).replace(/\/+$/, '');
const outArg = process.argv.find(a => a.startsWith('--out='));
const outDir = outArg ? path.resolve(outArg.slice('--out='.length)) : path.join(here, dev ? 'dist-dev' : 'dist');
const sourceManifest = JSON.parse(fs.readFileSync(path.join(here, 'manifest.json'), 'utf8'));
const version = sourceManifest.version;
if (!/^\d{1,4}(\.\d{1,5}){0,3}$/.test(version || '')) {
  console.error(`✗ extension/manifest.json version is not a dotted number: ${version}`);
  process.exit(1);
}

let baseOrigin;
try {
  baseOrigin = new URL(base).origin;
} catch {
  console.error(`✗ XT_BASE is not a URL: ${base}`);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const shared = {
  configFile: false,
  root,
  publicDir: false,
  logLevel: 'warn',
  define: {
    __XT_BASE__: JSON.stringify(base),
    __XT_VERSION__: JSON.stringify(version),
  },
};

/** One entry → one self-contained file. IIFE for scripts injected into pages, ES for the module service worker. */
async function bundle(entry, fileName, format) {
  await build({
    ...shared,
    build: {
      outDir,
      emptyOutDir: false,
      target: 'chrome116',
      minify: !dev,
      sourcemap: dev ? 'inline' : false,
      copyPublicDir: false,
      reportCompressedSize: false,
      modulePreload: false,
      lib: {
        entry: path.join(here, entry),
        formats: [format],
        name: format === 'iife' ? 'xt_' + path.basename(fileName, '.js') : undefined,
        fileName: () => fileName,
      },
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
  });
}

await bundle('src/bg/sw.ts', 'sw.js', 'es');
await bundle('src/inject/hook.ts', 'hook.js', 'iife');
await bundle('src/content/index.ts', 'content.js', 'iife');
await bundle('src/bridge/index.ts', 'bridge.js', 'iife');
await bundle('src/pages/popup.ts', 'popup.js', 'iife');

for (const f of ['popup.html', 'popup.css']) fs.copyFileSync(path.join(here, 'src/pages', f), path.join(outDir, f));
fs.cpSync(path.join(here, 'icons'), path.join(outDir, 'icons'), { recursive: true });

const manifest = structuredClone(sourceManifest);
if (baseOrigin !== 'https://xtracticle.com') {
  const match = `${baseOrigin}/*`;
  manifest.name = `${manifest.name} (dev)`;
  manifest.host_permissions.push(match);
  const bridge = manifest.content_scripts.find(cs => cs.js.includes('bridge.js'));
  bridge.matches.push(match);
}
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`✓ extension ${version} built → ${path.relative(root, outDir) || outDir} (XT_BASE ${base})`);
