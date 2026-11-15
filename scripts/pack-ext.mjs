#!/usr/bin/env node
/**
 * Zips the store build (extension/dist, manifest at the zip root) for the Chrome Web Store:
 *   extension/release/xtracticle-<manifest.version>.zip
 * Run via `npm run pack:ext` (builds and checks first).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'extension/dist');
if (!fs.existsSync(path.join(dist, 'manifest.json'))) {
  console.error('✗ extension/dist/manifest.json missing (run npm run build:ext first)');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
const files = {};
for (const f of fs.readdirSync(dist, { recursive: true }).map(String).sort()) {
  const full = path.join(dist, f);
  if (!fs.statSync(full).isFile() || f.split(path.sep).some(p => p.startsWith('.'))) continue;
  files[f.split(path.sep).join('/')] = [new Uint8Array(fs.readFileSync(full)), { mtime: new Date('2026-01-01T00:00:00Z'), level: 9 }];
}
const outDir = path.join(root, 'extension/release');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `xtracticle-${manifest.version}.zip`);
fs.writeFileSync(out, zipSync(files));
console.log(`✓ ${path.relative(root, out)} (${(fs.statSync(out).size / 1024).toFixed(1)} KB, ${Object.keys(files).length} files)`);
