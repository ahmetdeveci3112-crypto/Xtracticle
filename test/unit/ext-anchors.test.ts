/**
 * content/anchors.ts against two x.com DOM fixtures in a real browser (vitest runs in node and the repo has no
 * DOM library; Playwright's Chromium is already used by the extension e2e). Skipped when Chromium is missing.
 *
 *   signed in:  X's data-testid markup (article[data-testid="tweet"], <time> inside the permalink, quote card)
 *   signed out: no data-testid at all, no <time>; the date link "2:36 · 8 Mar" is the permalink (as observed
 *               on x.com/Write/status/1765884209527394325, Nov 2026), a quoted post as a nested article.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';
import { chromium, type Browser, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bookmarksPageKind } from '../../extension/src/content/anchors';

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, '../../extension/src/content/anchors.ts');
const hasBrowser = (() => {
  try {
    return fs.existsSync(chromium.executablePath());
  } catch {
    return false;
  }
})();

const MAIN = '1765884209527394325';
const QUOTED = '1765000000000000001';

const SIGNED_IN = `
<div data-testid="primaryColumn">
  <article data-testid="tweet" role="article" tabindex="0">
    <a href="/Write">Write</a>
    <a href="/Write/status/${MAIN}"><time datetime="2024-03-08T02:36:00Z">8 Mar</time></a>
    <div>Main post text</div>
    <div role="link" tabindex="0">
      <a href="/someone/status/${QUOTED}"><time datetime="2024-03-07T00:00:00Z">7 Mar</time></a>
      <div>Quoted text</div>
    </div>
    <a href="/Write/status/${MAIN}/analytics">Views</a>
    <div role="group" aria-label="551 replies">
      <button data-testid="reply"></button><button data-testid="retweet"></button><button data-testid="like"></button><button data-testid="bookmark"></button>
    </div>
  </article>
  <article data-testid="tweet" role="article" tabindex="0" id="second">
    <a href="/other/status/1765884209527394399"><time>9 Mar</time></a>
    <div role="group"><button data-testid="reply"></button><button data-testid="like"></button></div>
  </article>
</div>`;

const SIGNED_OUT = `
<main>
  <article tabindex="-1" id="main">
    <div><a href="/Write">Write</a></div>
    <div role="link" tabindex="0">An X Article cover, a link card without a status link</div>
    <article tabindex="-1" id="quote">
      <a href="/someone/status/${QUOTED}">7 Mar</a>
      <div role="group" aria-label="1 reply"><button>1</button><button>2</button><button>3</button></div>
    </article>
    <a href="/Write/status/${MAIN}">2:36 · 8 Mar</a>
    <div role="group" aria-label="Followers"><button>Follow</button></div>
    <div role="group" aria-label="551 yanıt, 680 yeniden paylaşım, … yer işaret">
      <button aria-label="551 yanıt">551</button><button aria-label="680 yeniden paylaşım. Yeniden …">680</button>
      <button aria-label="Beğeni">2K</button><button aria-label="Yer işareti"></button><button aria-label="Paylaş"></button>
    </div>
  </article>
  <article tabindex="-1" id="nobar">
    <a href="/x/status/1765884209527394400">10 Mar</a>
    <div role="group"><button>Follow</button></div>
  </article>
</main>`;

const HISTORY = (tabs: string) => `<div data-testid="primaryColumn"><h2>History</h2><div role="tablist">${tabs}</div></div>`;

describe('bookmarks page kind (pure)', () => {
  it('/i/bookmarks, its folders and /i/history', () => {
    expect(bookmarksPageKind('/i/bookmarks')).toBe('bookmarks');
    expect(bookmarksPageKind('/i/bookmarks/1765884209527394325')).toBe('bookmarks');
    expect(bookmarksPageKind('/i/history')).toBe('history');
    expect(bookmarksPageKind('/i/history/likes')).toBe('history');
    expect(bookmarksPageKind('/i/bookmarksx')).toBeNull();
    expect(bookmarksPageKind('/home')).toBeNull();
    expect(bookmarksPageKind('/Write/status/1')).toBeNull();
  });
});

describe.skipIf(!hasBrowser)('anchors on x.com markup (Chromium)', () => {
  let browser: Browser;
  let page: Page;
  const script = transformSync(fs.readFileSync(SRC, 'utf8'), { loader: 'ts', format: 'iife', globalName: 'A', target: 'chrome116' }).code;

  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
  }, 30000);
  afterAll(async () => {
    await browser?.close();
  });

  async function load(body: string) {
    await page.goto('about:blank');
    await page.setContent(`<!doctype html><html><head><base href="https://x.com/"></head><body>${body}</body></html>`);
    await page.addScriptTag({ content: script });
  }

  type Win = Window & { A: typeof import('../../extension/src/content/anchors') };
  const posts = () =>
    page.evaluate(() => {
      const A = (window as unknown as Win).A;
      return A.articlesWithoutButton(document).map(a => {
        const bar = A.actionBarOf(a);
        return { id: a.id || null, permalink: A.permalinkOf(a), bar: bar ? bar.getAttribute('aria-label') || bar.querySelectorAll('button').length : null };
      });
    });

  it('signed in: tagged posts, X action bar, the <time> permalink (not the quoted post)', async () => {
    await load(SIGNED_IN);
    const r = await posts();
    expect(r).toHaveLength(2);
    expect(r[0]).toEqual({ id: null, permalink: `https://x.com/Write/status/${MAIN}`, bar: '551 replies' });
    expect(r[1].permalink).toBe('https://x.com/other/status/1765884209527394399');
    expect(r[1].bar).toBe(2);
    expect(await page.evaluate(id => (window as unknown as Win).A.postRendered(document, id), MAIN)).toBe(true);
  });

  it('signed out (no testids, no <time>): top-level articles, the last group of 3+ buttons, the date link', async () => {
    await load(SIGNED_OUT);
    const r = await posts();
    // The nested (quoted) article is not a post of its own.
    expect(r.map(p => p.id)).toEqual(['main', 'nobar']);
    expect(r[0].permalink).toBe(`https://x.com/Write/status/${MAIN}`);
    expect(r[0].bar).toBe('551 yanıt, 680 yeniden paylaşım, … yer işaret');
    // No action bar → no button: the caller skips the post.
    expect(r[1].bar).toBeNull();
    expect(await page.evaluate(id => (window as unknown as Win).A.postRendered(document, id), MAIN)).toBe(true);
    expect(await page.evaluate(() => (window as unknown as Win).A.postRendered(document, '1')).valueOf()).toBe(false);
  });

  it('signed out: the main post above an Article view still gets its own permalink when the quote comes first', async () => {
    await load(`<article id="a">
      <article id="q"><a href="/q/status/${QUOTED}">7 Mar</a></article>
      <a href="/Write/status/${MAIN}">2:36 · 8 Mar</a>
      <div role="group"><button></button><button></button><button></button><button></button></div>
    </article>`);
    const r = await posts();
    expect(r).toEqual([{ id: 'a', permalink: `https://x.com/Write/status/${MAIN}`, bar: 4 }]);
  });

  const tabOf = (pathname: string) => page.evaluate(p => (window as unknown as Win).A.historyTabOf(document, p), pathname);

  it('/i/history: the selected tab, without reading its text', async () => {
    // Links that name the list.
    await load(HISTORY('<a role="tab" aria-selected="true" href="/i/history">Yer İşaretleri</a><a role="tab" aria-selected="false" href="/i/history/likes">Beğeni</a>'));
    expect(await tabOf('/i/history')).toBe('bookmarks');
    await load(HISTORY('<a role="tab" aria-selected="false" href="/i/history">Yer İşaretleri</a><a role="tab" aria-selected="true" href="/i/history/likes">Beğeni</a>'));
    expect(await tabOf('/i/history')).toBe('other');
    // No links: the position decides (Bookmarks is X's first, default tab).
    await load(HISTORY('<div role="presentation"><div role="tab" aria-selected="true">A</div></div><div role="presentation"><div role="tab" aria-selected="false">B</div></div>'));
    expect(await tabOf('/i/history')).toBe('bookmarks');
    await load(HISTORY('<div role="tab" aria-selected="false">A</div><div role="tab" aria-selected="true">B</div>'));
    expect(await tabOf('/i/history')).toBe('other');
    // A link inside the tab naming bookmarks wins over the position.
    await load(HISTORY('<div role="tab" aria-selected="false"><a href="/i/history/likes">B</a></div><div role="tab" aria-selected="true"><a href="/i/history/bookmarks">A</a></div>'));
    expect(await tabOf('/i/history')).toBe('bookmarks');
    // The URL decides when it names the tab.
    expect(await tabOf('/i/history/likes')).toBe('other');
    // Tabs not rendered yet.
    await load('<div data-testid="primaryColumn"><h2>History</h2></div>');
    expect(await tabOf('/i/history')).toBe('unknown');
  });
});
