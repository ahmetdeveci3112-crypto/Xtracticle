/**
 * "Best X Articles" — a weekly, hand-reviewed selection built from site/curated/*.json.
 * We only publish the title, author and our own one-line summary, and link to the
 * original post (plus our download page). Issues with any empty summary are skipped,
 * so a half-finished week can't go live by accident.
 */
import fs from 'node:fs';
import path from 'node:path';
import { GITHUB, type SitePage } from './blocks';

interface CuratedItem {
  id: string;
  handle: string;
  author: string;
  title: string;
  lang: string;
  topic: string;
  summary: string;
}

interface Issue {
  week: string; // ISO week, e.g. "2026-W40"
  published: string; // YYYY-MM-DD
  intro: string;
  items: CuratedItem[];
}

const DIR = path.resolve(process.cwd(), 'site/curated');
const HUB = '/best-x-articles';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const LANG_BADGE: Record<string, string> = { zh: '中文', ar: 'العربية', ja: '日本語', es: 'Español', pt: 'Português', tr: 'Türkçe' };

function loadIssues(): Issue[] {
  if (!fs.existsSync(DIR)) return [];
  const issues: Issue[] = [];
  for (const file of fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort()) {
    const issue = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')) as Issue;
    const incomplete = issue.items.filter(i => !i.summary?.trim() || !i.title?.trim());
    if (incomplete.length) {
      console.warn(`[curated] skipping ${file}: ${incomplete.length} item(s) without a title/summary`);
      continue;
    }
    issues.push(issue);
  }
  return issues.sort((a, b) => b.week.localeCompare(a.week));
}

const slug = (issue: Issue) => issue.week.toLowerCase();
const weekLabel = (issue: Issue) => {
  const [year, w] = issue.week.split('-W');
  return `Week ${Number(w)}, ${year}`;
};

function itemsHtml(issue: Issue): string {
  return `<ol class="xt-curated">${issue.items
    .map(item => {
      const local = `/${item.handle}/status/${item.id}`;
      const onX = `https://x.com/${item.handle}/status/${item.id}`;
      const badges = [item.topic, LANG_BADGE[item.lang]].filter(Boolean).map(b => `<span class="xt-chip">${esc(b!)}</span>`).join(' ');
      return `
  <li>
    <div class="xt-curated-meta">${badges}</div>
    <h3><a href="${local}">${esc(item.title)}</a></h3>
    <p class="xt-curated-by">by ${esc(item.author)} · <a href="https://x.com/${item.handle}" rel="nofollow noopener" target="_blank">@${esc(item.handle)}</a></p>
    <p>${esc(item.summary)}</p>
    <p class="xt-curated-actions"><a href="${local}">Save as PDF, Markdown or EPUB →</a><a href="${onX}" rel="nofollow noopener" target="_blank">Read on X ↗</a></p>
  </li>`;
    })
    .join('')}
</ol>`;
}

function itemListLd(issue: Issue, url: string): unknown {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best X Articles — ${weekLabel(issue)}`,
    url,
    itemListElement: issue.items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.title,
      url: `https://x.com/${item.handle}/status/${item.id}`,
    })),
  };
}

const ABOUT = `
<section>
  <h2>How we pick</h2>
  <p>Every week we look at the X Articles readers saved with Xtracticle and pick the ones worth your time, by hand. We show only the
  title, the author and a one-line summary in our own words, and link to the original on X — the writing belongs to its authors.
  Know a great X Article? <a href="${GITHUB}/issues/new?title=Article+suggestion" rel="noopener">Suggest it on GitHub</a>.</p>
</section>`;

/** Top picks of the newest issue, for the teaser on every home page. */
export function latestPicks(count = 3) {
  const latest = loadIssues()[0];
  if (!latest) return null;
  return {
    week: weekLabel(latest),
    total: latest.items.length,
    items: latest.items.slice(0, count).map(i => ({
      title: i.title,
      author: i.author,
      handle: i.handle,
      local: `/${i.handle}/status/${i.id}`,
    })),
  };
}

export function curatedPages(): SitePage[] {
  const issues = loadIssues();
  if (!issues.length) return [];
  const latest = issues[0];
  const SITE = 'https://xtracticle.com';

  const hub: SitePage = {
    id: 'best',
    group: 'best',
    path: HUB,
    file: 'best-x-articles.html',
    lang: 'en',
    title: `Best X Articles This Week — ${weekLabel(latest)} | Xtracticle`,
    description: `${latest.intro} Hand-picked long-form X (Twitter) Articles with a one-line summary each — read them on X or save them as PDF, Markdown or EPUB.`.slice(0, 300),
    h1: 'Best X Articles This Week',
    sub: `${weekLabel(latest)} — ${latest.intro}`,
    primary: 'pdf',
    nav: 'Best X Articles',
    sections: `
<section>
  <h2>${weekLabel(latest)}</h2>
  ${itemsHtml(latest)}
</section>
${
  issues.length > 1
    ? `<section>
  <h2>Previous weeks</h2>
  <ul>${issues
    .slice(1)
    .map(i => `<li><a href="${HUB}/${slug(i)}">${weekLabel(i)}</a> — ${esc(i.items.map(x => x.title).slice(0, 2).join(' · '))}…</li>`)
    .join('')}</ul>
</section>`
    : ''
}
${ABOUT}`,
    faq: [],
    jsonLd: [itemListLd(latest, SITE + HUB)],
  };

  const issuePages: SitePage[] = issues.map((issue, i) => ({
    id: `best-${slug(issue)}`,
    group: `best-${slug(issue)}`,
    path: `${HUB}/${slug(issue)}`,
    file: `best-x-articles/${slug(issue)}.html`,
    lang: 'en',
    // The newest issue is identical to the hub, so it points there until it's archived.
    canonical: i === 0 ? SITE + HUB : undefined,
    title: `Best X Articles — ${weekLabel(issue)} | Xtracticle`,
    description: `${issue.intro} Hand-picked X Articles for ${weekLabel(issue)}.`.slice(0, 300),
    h1: `Best X Articles — ${weekLabel(issue)}`,
    sub: issue.intro,
    primary: 'pdf',
    nav: '',
    sections: `
<section>
  ${itemsHtml(issue)}
  <p><a href="${HUB}">← This week’s picks</a></p>
</section>
${ABOUT}`,
    faq: [],
    jsonLd: [itemListLd(issue, `${SITE}${HUB}/${slug(issue)}`)],
  }));

  return [hub, ...issuePages];
}
