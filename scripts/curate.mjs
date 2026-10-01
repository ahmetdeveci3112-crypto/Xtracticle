#!/usr/bin/env node
/**
 * Scaffold a "Best X Articles" issue:
 *
 *   npm run curate -- 2026-W41 https://x.com/user/status/123 https://x.com/other/status/456 …
 *
 * Fetches title/author/language for each link from FxTwitter and writes
 * site/curated/2026-w41.json with empty `summary` and `topic` fields.
 * Fill those in (one sentence, in your own words), then build — issues with
 * an empty summary are skipped automatically, so nothing half-done goes live.
 */
import fs from 'node:fs';
import path from 'node:path';

const [week, ...links] = process.argv.slice(2);
if (!/^\d{4}-W\d{2}$/.test(week || '') || !links.length) {
  console.error('Usage: npm run curate -- 2026-W41 <x.com post link> [more links…]');
  process.exit(1);
}

const file = path.resolve('site/curated', `${week.toLowerCase()}.json`);
if (fs.existsSync(file)) {
  console.error(`${file} already exists — edit it directly or delete it first.`);
  process.exit(1);
}

const items = [];
for (const link of links) {
  const id = link.match(/status(?:es)?\/(\d+)/)?.[1] || (/^\d+$/.test(link) ? link : null);
  if (!id) {
    console.warn(`skip (not a post link): ${link}`);
    continue;
  }
  const res = await fetch(`https://api.fxtwitter.com/status/${id}`, { headers: { 'User-Agent': 'Xtracticle/3.0 (https://xtracticle.com)' } });
  const data = await res.json().catch(() => null);
  const t = data?.tweet;
  if (!t) {
    console.warn(`skip (not found): ${link}`);
    continue;
  }
  if (!t.article) console.warn(`note: ${link} is not an X Article (regular post/thread) — keep only if intended`);
  items.push({
    id: String(t.id),
    handle: t.author.screen_name,
    author: t.author.name,
    title: (t.article?.title || t.text.split('\n')[0]).trim(),
    lang: t.lang || '',
    topic: '',
    summary: '',
  });
  console.log(`✓ ${t.author.screen_name}: ${(t.article?.title || t.text).slice(0, 70)}`);
}

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(
  file,
  JSON.stringify({ week, published: new Date().toISOString().slice(0, 10), intro: '', items }, null, 2) + '\n',
);
console.log(`\nWrote ${file} — now fill in "intro", and "topic" + one-sentence "summary" for each item.`);
