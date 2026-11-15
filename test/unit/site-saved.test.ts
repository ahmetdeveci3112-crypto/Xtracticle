import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import type { SavedSummary } from '../../src/shared/bridge';
import { canOpen, exportScope, freeGoneIds, handleOf, postToTweets, searchSummaries, summariesCsv } from '../../src/lib/saved';
import { inlineScriptHashes } from '../../site/plugin';
import { withoutAnalytics } from '../../site/render';
import { PAGES } from '../../site/pages';

const s = (id: number, state: SavedSummary['state'] = 'active', date = `2026-0${(id % 9) + 1}-01T00:00:00Z`): SavedSummary => ({
  id: String(id),
  author: 'jack',
  title: `Post ${id}`,
  date,
  state,
});

describe('free / Pro rules', () => {
  const items = [s(1), s(2, 'unavailable', '2026-01-01T00:00:00Z'), s(3, 'missing', '2026-05-01T00:00:00Z'), s(4, 'unavailable', '2026-03-01T00:00:00Z'), s(5, 'unavailable', '2026-04-01T00:00:00Z'), s(6, 'removed_by_user')];
  it('opens the 3 newest unavailable copies for free', () => {
    const free = freeGoneIds(items);
    expect([...free].sort()).toEqual(['3', '4', '5']);
    expect(canOpen(items[1], false, free)).toBe(false);
    expect(canOpen(items[1], true, free)).toBe(true);
    expect(canOpen(items[0], false, free)).toBe(true);
    expect(canOpen(items[5], false, free)).toBe(true);
  });
  it('free export: no locked copies, at most 100; Pro: everything', () => {
    const many = Array.from({ length: 250 }, (_, i) => s(i + 100));
    expect(exportScope(many, false, new Set())).toHaveLength(100);
    expect(exportScope(many, true, new Set())).toHaveLength(250);
    const free = freeGoneIds(items);
    expect(exportScope(items, false, free).map(x => x.id)).toEqual(['1', '3', '4', '5', '6']);
  });
});

describe('search, handles, CSV', () => {
  it('searches title, author and id', () => {
    const items = [s(1), { ...s(2), author: 'Someone', title: 'Rust tips' }];
    expect(searchSummaries(items, 'rust').map(x => x.id)).toEqual(['2']);
    expect(searchSummaries(items, '@someone').map(x => x.id)).toEqual(['2']);
    expect(searchSummaries(items, '1')).toHaveLength(1);
    expect(searchSummaries(items, '  ')).toHaveLength(2);
  });
  it('only uses real handles in links', () => {
    expect(handleOf({ author: '@jack' })).toBe('jack');
    expect(handleOf({ author: 'Jack Dorsey' })).toBeNull();
  });
  it('writes a spreadsheet-safe CSV', () => {
    const csv = summariesCsv([{ ...s(7), title: '=HYPERLINK("x") "quoted"' }]);
    expect(csv.startsWith('\uFEFFid,author,title,date,state,url\r\n')).toBe(true);
    expect(csv).toContain(`"'=HYPERLINK(""x"") ""quoted"""`);
    expect(csv).toContain('"https://x.com/jack/status/7"');
  });
});

describe('postToTweets (untrusted copies)', () => {
  const t = { id: '10', text: 'hello', created_at: 'x', url: 'u', author: { name: 'J', screen_name: 'jack' } };
  it('takes one FxTweet or a thread', () => {
    expect(postToTweets(t)).toHaveLength(1);
    expect(postToTweets({ ...t, thread: [t, { ...t, id: '11' }] })).toHaveLength(2);
  });
  it('rejects malformed copies', () => {
    expect(postToTweets(null)).toBeNull();
    expect(postToTweets({ id: 10 })).toBeNull();
    expect(postToTweets({ id: '10', author: 'jack' })).toBeNull();
    expect(postToTweets({ ...t, id: '1; drop' })).toBeNull();
    expect(postToTweets({ ...t, text: 42 })?.[0].text).toBe('');
  });
});

describe('/saved page build', () => {
  it('exists in all 7 languages, noindex and without analytics', () => {
    const saved = PAGES.filter(p => p.group === 'saved');
    expect(saved.map(p => p.path).sort()).toEqual(['/ar/saved', '/es/saved', '/ja/saved', '/pt/saved', '/saved', '/tr/saved', '/zh/saved']);
    expect(saved.every(p => p.noindex && p.noAnalytics)).toBe(true);
  });
  it('strips GA and the inline font onload handler', () => {
    const tpl = `<head>\n    <!-- Google Analytics: stub now -->\n    <script>\n      gtag('config', 'G-1');\n    </script>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2" media="print" onload="this.media='all'" /></head>`;
    const out = withoutAnalytics(tpl);
    expect(out).not.toContain('gtag');
    expect(out).not.toContain('onload');
    expect(out).toContain('<link rel="stylesheet" href="https://fonts.googleapis.com/css2" />');
  });
  it('hashes inline scripts the way CSP does, skipping external and JSON ones', () => {
    const html = '<script>var a=1</script><script type="module" src="/x.js"></script><script type="application/ld+json">{}</script>';
    const want = `'sha256-${createHash('sha256').update('var a=1').digest('base64')}'`;
    expect(inlineScriptHashes(html)).toEqual([want]);
  });
});
