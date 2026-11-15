import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { COUNTER_EVENTS, EXT_ONLY_EVENTS, SITE_EVENTS } from '../../src/shared/events';

const root = path.resolve(__dirname, '../..');
const read = (dir: string) =>
  fs
    .readdirSync(path.join(root, dir), { recursive: true })
    .map(String)
    .filter(f => /\.(ts|tsx)$/.test(f))
    .map(f => fs.readFileSync(path.join(root, dir, f), 'utf8'))
    .join('\n');

describe('event names', () => {
  const known = new Set<string>([...SITE_EVENTS, ...EXT_ONLY_EVENTS]);

  it('has no duplicates and no overlap between site and extension-only names', () => {
    expect(new Set(SITE_EVENTS).size).toBe(SITE_EVENTS.length);
    for (const e of EXT_ONLY_EVENTS) expect(SITE_EVENTS as readonly string[]).not.toContain(e);
  });

  it('lists every event the static pages send from inline scripts', () => {
    const site = read('site');
    const used = new Set<string>();
    for (const [, n] of site.matchAll(/\bg\('([a-z_]+)'/g)) used.add(n); // site/pro-page.ts helper
    for (const [, n] of site.matchAll(/data-track="([a-z_]+)"/g)) used.add(n); // site/render.ts delegated listener
    for (const [, n] of site.matchAll(/gtag\('event',\s*'([a-z_]+)'/g)) used.add(n);
    used.delete('event');
    used.delete('event_name'); // the placeholder in render.ts's comment
    expect(used.size).toBeGreaterThan(10);
    for (const n of used) expect(known, n).toContain(n);
  });

  it('lists every event the SPA sends (track() is typed too; this catches dynamic names)', () => {
    const app = read('src');
    for (const [, n] of app.matchAll(/\btrack\('([a-z_]+)'/g)) expect(known, n).toContain(n);
  });

  it('counter whitelist uses known names only', () => {
    for (const n of Object.keys(COUNTER_EVENTS)) expect(known, n).toContain(n);
  });
});
