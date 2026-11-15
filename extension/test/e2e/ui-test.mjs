#!/usr/bin/env node
/**
 * End-to-end tests of the extension's UI (docs/chrome-extension-plan.md, A8 steps 7–12). Two parts:
 *
 * runUiStandInTest — x.com played by Playwright routes (pages that mimic X's markup: article[data-testid=tweet],
 * role=group action bars, primaryColumn / error-detail), xtracticle.com played by a local stand-in whose
 * /api/thread is the REAL site handler (src/shared/api.ts, loaded through Vite) answering from
 * extension/test/fixtures/fxtwitter.json. Checks:
 *   (a) Save menu: one button per post, keyboard (ArrowDown opens and enters, Escape closes and restores focus),
 *       Markdown download = the site's Markdown for the same post (buildDoc + frontMatter + fileBaseName with the
 *       site's labels), thread, copy, PDF opens the site with #dl=pdf, 404 → local fallback / clear error,
 *       light and dark theme;
 *   (b) bookmarks panel: sliding scan over stand-in Bookmarks pages, stops at the end with the right count,
 *       stops on a 429 with the "slowed down" line, incremental re-scan says "up to date", only the page's own
 *       GraphQL requests reach x.com;
 *   (c) archive panel on a gone post (X's error state + TweetDetail code 144), saved copy link, Wayback /
 *       archive.today / finder links;
 *   counters: batches reach POST /api/ext/event with X-Xt-Client: ext and no URL / handle / id.
 *
 * runRealBridgeTest — against `wrangler dev` (started by cookie-test.mjs, fake Gumroad):
 *   (d) the real /saved page + the real bridge: list, one copy, ZIP export, xt:status, /saved-only answers,
 *       xt:lang-changed;
 *   (e) popup: Pro activation → the site is Pro; screenshots of the free and Pro popup.
 *
 * Screenshots go to docs/ext-shots/. Run through `npm run test:e2e` (cookie-test.mjs), or alone:
 *   node extension/test/e2e/ui-test.mjs            stand-in part only
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unzipSync } from 'fflate';
import { chromium } from 'playwright';
import { createServer as createVite } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const fixtures = path.resolve(here, '../fixtures');
const SHOTS = path.join(root, 'docs/ext-shots');
const PORT = Number(process.env.XT_UI_PORT || 8797);
const BASE = `http://127.0.0.1:${PORT}`;
const ACCOUNT = '424242';
const ID = n => `18900000000000${String(n).padStart(5, '0')}`;
const fixture = f => fs.readFileSync(path.join(fixtures, f), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function poll(fn, check, ms = 10000, every = 150) {
  const until = Date.now() + ms;
  let last;
  while (Date.now() < until) {
    last = await fn();
    if (check(last)) return last;
    await sleep(every);
  }
  return last;
}

/* ─── The site's own modules, through Vite (TypeScript) ─── */

async function siteModules() {
  const vite = await createVite({ configFile: false, root, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] } });
  const [api, convert, i18n] = await Promise.all(['/src/shared/api.ts', '/src/shared/convert.ts', '/src/i18n.ts'].map(m => vite.ssrLoadModule(m)));
  return { vite, api, convert, i18n };
}

/** The Markdown file the site's own download writes for these posts (App.tsx: labels/locale of the language, front matter on). */
function siteMarkdown(mods, tweets, lang = 'en') {
  const { buildDoc, frontMatter, fileBaseName } = mods.convert;
  const doc = buildDoc(tweets, mods.i18n.translations[lang].labels, mods.i18n.langInfo(lang).locale);
  return { name: `${fileBaseName(doc)}.md`, text: frontMatter(doc) + doc.md };
}

/* ─── x.com stand-in pages ─── */

const ICON = '<svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8"/></svg>';
const actionBar = `<div role="group" class="bar">${['reply', 'retweet', 'like', 'bookmark'].map(t => `<div><button data-testid="${t}" aria-label="${t}">${ICON}</button></div>`).join('')}<div><button aria-label="Share post">${ICON}</button></div></div>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function articleHtml(handle, id, name, text) {
  return `<article data-testid="tweet" role="article" tabindex="0"><div class="av"></div><div class="body">
<div class="who"><b>${esc(name)}</b> <span class="muted">@${esc(handle)} · <a href="/${handle}/status/${id}"><time datetime="2025-11-12T10:00:00.000Z">Nov 12</time></a></span></div>
<div data-testid="tweetText">${esc(text)}</div>${actionBar}</div></article>`;
}

function page({ theme = 'light', title = 'X', main, script = '' }) {
  const t = theme === 'dark' ? { bg: '#000', fg: '#e7e9ea', muted: '#71767b', border: '#2f3336' } : theme === 'dim' ? { bg: 'rgb(21, 32, 43)', fg: '#f7f9f9', muted: '#8b98a5', border: '#38444d' } : { bg: '#fff', fg: '#0f1419', muted: '#536471', border: '#eff3f4' };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
body { margin: 0; background-color: ${t.bg}; color: ${t.fg}; font: 15px/1.35 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
[data-testid="primaryColumn"] { width: 600px; margin: 0 auto; min-height: 100vh; border-inline: 1px solid ${t.border}; }
h1 { font-size: 20px; margin: 0; padding: 14px 16px; border-bottom: 1px solid ${t.border}; }
article { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid ${t.border}; min-height: 84px; }
.av { flex: none; width: 40px; height: 40px; border-radius: 50%; background: ${t.border}; }
.body { flex: 1; min-width: 0; }
.muted, .muted a { color: ${t.muted}; text-decoration: none; }
[data-testid="tweetText"] { margin: 2px 0 6px; }
.bar { display: flex; justify-content: space-between; max-width: 425px; margin-inline-start: -8px; }
.bar button { display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: none; color: ${t.muted}; }
[data-testid="error-detail"] { padding: 40px 32px; } [data-testid="error-detail"] p { color: ${t.muted}; }
</style></head><body><main role="main"><div data-testid="primaryColumn">${main}</div></main>${script}</body></html>`;
}

/** A Bookmarks answer with `n` posts starting at post number `from`, newest first, and a bottom cursor. */
function bookmarksPage(from, n, cursor) {
  const j = JSON.parse(fixture('bookmarks-folder.json'));
  const tl = j.data.bookmark_collection_timeline.timeline;
  const template = tl.instructions[0].entries[0];
  const entries = [];
  for (let i = 0; i < n; i++) {
    const e = structuredClone(template);
    const id = ID(1000 + from + i);
    const t = e.content.itemContent.tweet_results.result;
    t.rest_id = id;
    t.legacy.id_str = id;
    t.legacy.full_text = `Bookmark number ${from + i}`;
    e.entryId = `tweet-${id}`;
    e.sortIndex = String(1859000000000000999n - BigInt(from + i));
    entries.push(e);
  }
  entries.push({ entryId: `cursor-bottom-${cursor}`, sortIndex: '1', content: { entryType: 'TimelineTimelineCursor', __typename: 'TimelineTimelineCursor', value: `c${cursor}`, cursorType: 'Bottom' } });
  return JSON.stringify({ data: { bookmark_timeline_v2: { timeline: { instructions: [{ type: 'TimelineAddEntries', entries }] } } } });
}

/** The bookmarks page: loads Bookmarks pages with its own fetch when the end comes into view, like X. */
function bookmarksHtml() {
  const script = `<script>
  window.xtPage = { fetches: 0, statuses: [] };
  let next = 0, loading = false;
  const list = document.getElementById('list');
  async function load() {
    if (loading) return; loading = true;
    window.xtPage.fetches++;
    try {
      const r = await fetch('/i/api/graphql/SYNTHQID/Bookmarks?variables=' + encodeURIComponent(JSON.stringify({ cursor: 'c' + next })), { credentials: 'include' });
      window.xtPage.statuses.push(r.status);
      if (r.ok) {
        const j = await r.json();
        const entries = j.data.bookmark_timeline_v2.timeline.instructions[0].entries.filter(e => e.entryId.startsWith('tweet-'));
        for (const e of entries) {
          const t = e.content.itemContent.tweet_results.result;
          const div = document.createElement('div');
          div.innerHTML = ${JSON.stringify(articleHtml('HANDLE', 'ID', 'Ada', 'TEXT'))}.replaceAll('HANDLE', 'ada_example').replaceAll('ID', t.rest_id).replace('TEXT', t.legacy.full_text);
          list.appendChild(div.firstChild);
        }
        if (entries.length) next++;
      }
    } finally { loading = false; }
  }
  load();
  addEventListener('scroll', () => { if (innerHeight + scrollY > document.body.scrollHeight - 300) load(); }, { passive: true });
</script>`;
  return page({ title: 'Bookmarks / X', main: `<h1>Bookmarks</h1><div id="list"></div>`, script });
}

/* ─── Site stand-in (xtracticle.com) ─── */

async function startSite(mods, state) {
  const FX = JSON.parse(fixture('fxtwitter.json'));
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url || String(input));
    if (url.hostname !== 'api.fxtwitter.com') return realFetch(input, init);
    const body = FX[url.pathname];
    return new Response(JSON.stringify(body ?? { code: 404 }), { status: body ? 200 : 404, headers: { 'Content-Type': 'application/json' } });
  };
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, BASE);
    state.requests.push({ path: url.pathname, client: req.headers['x-xt-client'] || null });
    if (url.pathname.startsWith('/api/thread/')) {
      const r = await mods.api.handleApi(new Request(`https://xtracticle.com${url.pathname}`));
      res.writeHead(r.status, Object.fromEntries(r.headers));
      return res.end(await r.text());
    }
    if (url.pathname === '/api/pro/me') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('{"pro":false}');
    }
    if (url.pathname === '/api/ext/event' && req.method === 'POST') {
      let body = '';
      for await (const c of req) body += c;
      state.events.push({ client: req.headers['x-xt-client'] || null, body, at: Date.now() });
      res.writeHead(204);
      return res.end();
    }
    if (url.pathname === '/ext/config.json' || url.pathname.startsWith('/api/')) return res.writeHead(404).end();
    // Site pages the menus open in a new tab (/saved, /{handle}/status/{id}): a blank page keeps the URL readable.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!doctype html><title>site stand-in</title>');
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', resolve);
  });
  return { server, restore: () => (globalThis.fetch = realFetch) };
}

async function threadOf(mods, id) {
  const r = await mods.api.handleApi(new Request(`https://xtracticle.com/api/thread/${id}`));
  return (await r.json()).tweets;
}

/* ─── Browser helpers ─── */

async function launch(extDir, tmp, headless) {
  const context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(tmp, 'profile-')), {
    channel: 'chromium',
    headless,
    viewport: { width: 1280, height: 800 },
    acceptDownloads: true,
    args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
  });
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 15000 });
  // The checks read English strings; without a site visit the extension would follow the OS language.
  await sw.evaluate(() => chrome.storage.local.set({ lang: 'en' }));
  return { context, sw, extId: new URL(sw.url()).hostname };
}

/** Evaluate inside the Shadow DOM of every `<tag>` on the page. */
const inShadow = (page, tag, fn, arg) => page.evaluate(([tag, src, arg]) => {
  const f = new Function('roots', 'arg', `return (${src})(roots, arg)`);
  return f([...document.querySelectorAll(tag)].map(h => h.shadowRoot), arg);
}, [tag, fn.toString(), arg]);

const menuState = page =>
  inShadow(page, 'xt-menu', roots => {
    const r = roots[0];
    if (!r) return { open: false };
    const pop = r.querySelector('[popover]');
    return {
      open: pop.matches(':popover-open'),
      items: [...r.querySelectorAll('[role="menuitem"]')].map(b => b.firstChild.textContent),
      focused: r.activeElement ? r.activeElement.textContent : null,
      status: r.querySelector('.status').textContent,
    };
  });

/** Clicks the Save button of the post `id` (in its own shadow root). */
const clickSave = (page, id, how = 'click') =>
  page.evaluate(([id, how]) => {
    const host = document.querySelector(`[data-xt-slot="${id}"] xt-save`);
    const b = host.shadowRoot.querySelector('button');
    if (how === 'focus') b.focus();
    else b.click();
    return true;
  }, [id, how]);

const clickItem = (page, label) =>
  inShadow(page, 'xt-menu', (roots, label) => {
    const b = [...roots[0].querySelectorAll('[role="menuitem"]')].find(x => x.firstChild.textContent === label);
    b.click();
    return !!b;
  }, label);

async function download(page, action) {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), action()]);
  const file = await d.path();
  return { name: d.suggestedFilename(), text: fs.readFileSync(file, 'utf8') };
}

/* ─── (a) (b) (c) against stand-ins ─── */

export async function runUiStandInTest({ log = () => {}, expect, headless = !process.env.XT_TEST_HEADED } = {}) {
  const r = {};
  const state = { requests: [], events: [], gql: [] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xt-ui-test-'));
  const extDir = path.join(tmp, 'ext');
  fs.mkdirSync(SHOTS, { recursive: true });
  let mods, site, context;
  try {
    mods = await siteModules();
    site = await startSite(mods, state);
    log(`building a dev extension against ${BASE}`);
    const b = spawnSync('node', ['extension/build.mjs', '--dev', `--out=${extDir}`], { cwd: root, encoding: 'utf8', env: { ...process.env, XT_BASE: BASE } });
    if (b.status !== 0) throw new Error(`extension build failed:\n${b.stdout}\n${b.stderr}`);

    const t101 = await threadOf(mods, ID(101));
    const t202 = await threadOf(mods, ID(202));
    const posts = { [ID(101)]: t101[0], [ID(202)]: t202[t202.length - 1] };
    const GONE = ID(999);
    const PROTECTED = ID(150); // not in the FxTwitter fixtures → /api/thread 404
    const throttle = { at: -1 };
    const detailBodies = {
      [GONE]: JSON.stringify({ data: {}, errors: [{ message: '_Missing: No status found with that ID.', code: 144 }] }),
      [ID(101)]: JSON.stringify({ data: {}, errors: [{ message: '_Missing: No status found with that ID.', code: 144 }] }),
      [PROTECTED]: fixture('tweet-detail.json').replaceAll(ID(201), PROTECTED),
    };

    let extId;
    ({ context, extId } = await launch(extDir, tmp, headless));
    const sw = context.serviceWorkers()[0];
    // The SW's message API is reached from an extension page (a context does not receive its own messages).
    const extPage = await context.newPage();
    await extPage.goto(`chrome-extension://${extId}/popup.html`);
    const msg = m => extPage.evaluate(m => chrome.runtime.sendMessage(m), m).catch(() => null);
    await context.addCookies([{ name: 'twid', value: `u%3D${ACCOUNT}`, domain: '.x.com', path: '/', secure: true, sameSite: 'Lax' }]);
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'https://x.com' });
    await context.route('https://x.com/**', route => {
      const u = new URL(route.request().url());
      const m = u.pathname.match(/^\/i\/api\/graphql\/[^/]+\/([A-Za-z0-9_]+)$/);
      if (m) {
        state.gql.push(m[1]);
        if (m[1] === 'Bookmarks') {
          const cursor = Number((JSON.parse(u.searchParams.get('variables') || '{}').cursor || 'c0').slice(1));
          if (cursor === throttle.at) return route.fulfill({ status: 429, contentType: 'application/json', body: '{"errors":[{"message":"Rate limit exceeded","code":88}]}' });
          const sizes = [20, 20, 20, 15];
          const from = sizes.slice(0, cursor).reduce((a, b) => a + b, 0);
          return route.fulfill({ status: 200, contentType: 'application/json', body: bookmarksPage(from, sizes[cursor] || 0, cursor + 1) });
        }
        if (m[1] === 'TweetDetail') {
          const focal = JSON.parse(u.searchParams.get('variables') || '{}').focalTweetId;
          return route.fulfill({ status: 200, contentType: 'application/json', body: detailBodies[focal] || '{"data":{}}' });
        }
        return route.fulfill({ status: 404, body: '{}' });
      }
      const theme = u.searchParams.get('theme') || 'light';
      if (u.pathname === '/i/bookmarks') return route.fulfill({ status: 200, contentType: 'text/html', body: bookmarksHtml() });
      const st = u.pathname.match(/^\/([A-Za-z0-9_]+)\/status\/(\d+)$/);
      if (st) {
        const [, handle, id] = st;
        const loadDetail = `<script>fetch('/i/api/graphql/SYNTHQID/TweetDetail?variables=' + encodeURIComponent(JSON.stringify({ focalTweetId: ${JSON.stringify(id)} })));</script>`;
        if (id === GONE || u.searchParams.get('gone') === '1')
          return route.fulfill({ status: 200, contentType: 'text/html', body: page({ theme, main: `<h1>Post</h1><div data-testid="error-detail"><h2>Hmm…this page doesn’t exist.</h2><p>Try searching for something else.</p></div>`, script: loadDetail }) });
        const text = id === PROTECTED ? 'A post from a protected account.' : 'Post';
        return route.fulfill({ status: 200, contentType: 'text/html', body: page({ theme, main: `<h1>Post</h1>${articleHtml(handle, id, 'Grace', text)}`, script: loadDetail }) });
      }
      // /home: a timeline with a single post and the last post of a self-thread.
      const main = `<h1>Home</h1>${articleHtml(t101[0].author.screen_name, ID(101), t101[0].author.name, t101[0].text)}${articleHtml(posts[ID(202)].author.screen_name, ID(202), posts[ID(202)].author.name, posts[ID(202)].text)}`;
      return route.fulfill({ status: 200, contentType: 'text/html', body: page({ theme, main }) });
    });

    const S = 'ui (a) save menu';
    const pg = await context.newPage();
    await pg.goto('https://x.com/home');
    r.buttons = await poll(() => pg.evaluate(() => document.querySelectorAll('[data-xt-slot] xt-save').length), n => n === 2);
    expect(S, 'one Save button per post, inside the action bar', r.buttons === 2, r.buttons);
    r.slotInBar = await pg.evaluate(id => !!document.querySelector(`article [role="group"] [data-xt-slot="${id}"]`), ID(101));
    expect(S, 'button sits in the post action bar', r.slotInBar);
    // MutationObserver: a post added later gets a button, an existing one is not added twice.
    await pg.evaluate(html => document.querySelector('[data-testid="primaryColumn"]').insertAdjacentHTML('beforeend', html), articleHtml('ada_example', ID(103), 'Ada', 'Worth reading this one.'));
    r.buttonsLater = await poll(() => pg.evaluate(() => document.querySelectorAll('[data-xt-slot] xt-save').length), n => n === 3);
    await sleep(300);
    r.slots103 = await pg.evaluate(id => document.querySelectorAll(`[data-xt-slot="${id}"]`).length, ID(103));
    expect(S, 'new posts get a button once', r.buttonsLater === 3 && r.slots103 === 1, { n: r.buttonsLater, slots: r.slots103 });

    // Keyboard: focus, ArrowDown opens and enters, Escape closes and gives focus back.
    await clickSave(pg, ID(101), 'focus');
    await pg.keyboard.press('ArrowDown');
    r.kbOpen = await poll(() => menuState(pg), m => m.open && m.focused);
    expect(S, 'ArrowDown opens the menu on its first item', r.kbOpen.open && r.kbOpen.focused?.startsWith('Download Markdown'), r.kbOpen);
    await pg.keyboard.press('ArrowDown');
    r.kbNext = await menuState(pg);
    await pg.keyboard.press('End');
    r.kbEnd = await menuState(pg);
    expect(S, 'arrow keys / End move through items', r.kbNext.focused?.startsWith('Copy Markdown') && r.kbEnd.focused?.startsWith(r.kbEnd.items.at(-1)), { next: r.kbNext.focused, end: r.kbEnd.focused });
    await pg.keyboard.press('Escape');
    r.kbClosed = await menuState(pg);
    r.focusBack = await pg.evaluate(id => document.activeElement === document.querySelector(`[data-xt-slot="${id}"] xt-save`) && document.activeElement.shadowRoot.activeElement?.tagName === 'BUTTON', ID(101));
    expect(S, 'Escape closes and focus returns to the button', !r.kbClosed.open && r.focusBack, { m: r.kbClosed, focus: r.focusBack });

    // Download Markdown = the site's Markdown for the same post.
    await pg.locator(`[data-xt-slot="${ID(101)}"] xt-save button`).click(); // a real pointer click (Playwright pierces open shadow roots)
    r.pointerOpen = await poll(() => menuState(pg), m => m.open);
    expect(S, 'pointer click opens the menu without moving focus into it', r.pointerOpen.open && !r.pointerOpen.focused, r.pointerOpen);
    await sleep(250); // open transition
    await pg.screenshot({ path: path.join(SHOTS, 'menu-light.png') });
    r.items = (await menuState(pg)).items;
    expect(S, 'menu items', JSON.stringify(r.items) === JSON.stringify(['Download Markdown', 'Copy Markdown', 'PDF', 'EPUB', 'ZIP', 'Open on Xtracticle']), r.items);
    const md101 = await download(pg, () => clickItem(pg, 'Download Markdown'));
    const site101 = siteMarkdown(mods, t101);
    r.md101 = { name: md101.name, same: md101.text === site101.text, len: md101.text.length };
    expect(S, 'Markdown file = the site’s file (name and bytes), single post', md101.name === site101.name && md101.text === site101.text, { got: md101.name, want: site101.name, same: r.md101.same });

    await clickSave(pg, ID(202));
    await poll(() => menuState(pg), m => m.open);
    const md202 = await download(pg, () => clickItem(pg, 'Download Markdown'));
    const site202 = siteMarkdown(mods, t202);
    expect(S, 'Markdown file = the site’s file, self-thread from its last post', md202.name === site202.name && md202.text === site202.text && t202.length === 2, { got: md202.name, want: site202.name });

    // Copy.
    await clickSave(pg, ID(101));
    await poll(() => menuState(pg), m => m.open);
    await clickItem(pg, 'Copy Markdown');
    r.copyStatus = await poll(() => menuState(pg), m => m.status === 'Copied');
    r.clip = await pg.evaluate(() => navigator.clipboard.readText()).catch(e => `error: ${e.message}`);
    expect(S, 'Copy Markdown puts the same Markdown on the clipboard', r.copyStatus.status === 'Copied' && r.clip === site101.text, { status: r.copyStatus.status, clipLen: r.clip?.length });

    // The saved post is archived (manual) → "Open saved copy" appears.
    await poll(() => menuState(pg), m => !m.open, 3000);
    await clickSave(pg, ID(101));
    r.itemsSaved = (await poll(() => menuState(pg), m => m.items?.includes('Open saved copy'))).items;
    expect(S, 'archived post offers "Open saved copy"', r.itemsSaved?.includes('Open saved copy'), r.itemsSaved);
    const [popSaved] = await Promise.all([context.waitForEvent('page'), clickItem(pg, 'Open saved copy')]);
    r.savedUrl = popSaved.url();
    await popSaved.close();
    expect(S, 'Open saved copy → /saved#id= with utm', r.savedUrl === `${BASE}/saved?utm_source=extension&utm_medium=save_menu&utm_campaign=credit#id=${ID(101)}`, r.savedUrl);

    // PDF → the site page with #dl=pdf in a new tab.
    await clickSave(pg, ID(101));
    await poll(() => menuState(pg), m => m.open);
    const [popPdf] = await Promise.all([context.waitForEvent('page'), clickItem(pg, 'PDF')]);
    r.pdfUrl = popPdf.url();
    await popPdf.close();
    expect(S, 'PDF opens the post on the site with #dl=pdf', r.pdfUrl === `${BASE}/${t101[0].author.screen_name}/status/${ID(101)}?utm_source=extension&utm_medium=save_menu&utm_campaign=credit#dl=pdf`, r.pdfUrl);

    // The popup's "Save this post" fallback: the tab's URL is visible through the x.com host permission and
    // chrome.tabs.sendMessage needs no `tabs` permission.
    await pg.goto(`https://x.com/${t101[0].author.screen_name}/status/${ID(101)}`);
    await poll(() => pg.evaluate(() => document.querySelectorAll('[data-xt-slot] xt-save').length), n => n === 1);
    const viaPopup = await download(pg, () =>
      extPage.evaluate(async () => {
        const tabs = await chrome.tabs.query({ url: 'https://x.com/*' });
        const t = tabs.find(x => /\/status\//.test(x.url || ''));
        return chrome.tabs.sendMessage(t.id, { type: 'xt:save-current' });
      }),
    );
    expect(S, 'popup fallback: "Save this post" downloads the same Markdown', viaPopup.name === site101.name && viaPopup.text === site101.text, viaPopup.name);

    // Dark theme.
    await pg.goto('https://x.com/home?theme=dark');
    await poll(() => pg.evaluate(() => document.querySelectorAll('[data-xt-slot] xt-save').length), n => n === 2);
    await pg.locator(`[data-xt-slot="${ID(101)}"] xt-save button`).click();
    await poll(() => menuState(pg), m => m.open && m.items.includes('Open saved copy'));
    await sleep(250);
    r.darkBg = await inShadow(pg, 'xt-menu', roots => getComputedStyle(roots[0].querySelector('[popover]')).backgroundColor);
    await pg.screenshot({ path: path.join(SHOTS, 'menu-dark.png') });
    expect(S, 'dark theme: the menu follows X (dark surface)', r.darkBg === 'rgb(15, 15, 15)', r.darkBg);
    await pg.keyboard.press('Escape');

    // Not public: /api/thread 404 → the copy X loaded on this tab (TweetDetail), else a clear error.
    await pg.goto(`https://x.com/grace_sample/status/${PROTECTED}`);
    await poll(() => pg.evaluate(() => document.querySelectorAll('[data-xt-slot] xt-save').length), n => n === 1);
    await sleep(400); // TweetDetail answer reaches RecentPosts
    await clickSave(pg, PROTECTED);
    await poll(() => menuState(pg), m => m.open);
    const mdLocal = await download(pg, () => clickItem(pg, 'Download Markdown'));
    r.localStatus = (await menuState(pg)).status;
    expect(S, '404 → Markdown from the copy loaded on the page', mdLocal.text.includes(PROTECTED) && /Saved from the copy loaded/.test(r.localStatus || ''), { status: r.localStatus, name: mdLocal.name });
    await pg.evaluate(html => document.querySelector('[data-testid="primaryColumn"]').insertAdjacentHTML('beforeend', html), articleHtml('nobody', ID(151), 'Nobody', 'Never loaded'));
    await poll(() => pg.evaluate(id => !!document.querySelector(`[data-xt-slot="${id}"]`), ID(151)), Boolean);
    await clickSave(pg, ID(151));
    await poll(() => menuState(pg), m => m.open);
    await clickItem(pg, 'Download Markdown');
    r.err404 = await poll(() => menuState(pg), m => /Only public posts/.test(m.status || ''));
    expect(S, '404 without a loaded copy → clear error', /Only public posts/.test(r.err404.status || ''), r.err404.status);
    await pg.keyboard.press('Escape');

    /* (b) bookmarks panel */
    const B = 'ui (b) bookmarks panel';
    const panel = () => inShadow(pg, 'xt-bookmarks', roots => {
      const r0 = roots[0];
      if (!r0 || r0.host.hidden) return { shown: false };
      return { shown: true, count: r0.querySelector('.count').textContent, info: r0.querySelector('.info').hidden ? null : r0.querySelector('.info').textContent, exp: r0.querySelector('a.btn').hidden ? null : r0.querySelector('a.btn').href };
    });
    const press = label => inShadow(pg, 'xt-bookmarks', (roots, label) => [...roots[0].querySelectorAll('button')].find(b => b.textContent === label)?.click(), label);
    state.gql.length = 0;
    await pg.goto('https://x.com/i/bookmarks#xt-export');
    r.panel0 = await poll(panel, p => p.shown);
    expect(B, '#xt-export opens the panel, free line shown', r.panel0.shown && r.panel0.info === 'Free: last 100 — Pro: all', r.panel0);
    await poll(() => pg.evaluate(() => window.xtPage.fetches), n => n >= 1);
    await sleep(500);
    await press('Scan bookmarks');
    r.scanning = await poll(panel, p => /^Scanning… \d+/.test(p.count), 4000);
    r.panelDone = await poll(panel, p => /^Done:/.test(p.count), 90000, 300);
    await pg.screenshot({ path: path.join(SHOTS, 'bookmarks-panel.png') });
    r.pageFetches = await pg.evaluate(() => window.xtPage.fetches);
    expect(B, 'live counter while scanning', /^Scanning… \d+/.test(r.scanning.count), r.scanning);
    expect(B, 'scan ends at the end of the list with the right count (75)', r.panelDone.count === 'Done: 75 bookmarks', r.panelDone);
    expect(B, '"Export on Xtracticle" → /saved with utm', r.panelDone.exp === `${BASE}/saved?utm_source=extension&utm_medium=bookmarks_panel&utm_campaign=credit`, r.panelDone.exp);
    expect(B, 'only the page’s own GraphQL requests reach x.com', state.gql.filter(o => o === 'Bookmarks').length === r.pageFetches && state.gql.every(o => o === 'Bookmarks'), { gql: state.gql.length, page: r.pageFetches });
    r.status75 = await msg({ type: 'saved:status' });
    expect(B, 'the scanned bookmarks are in the archive (75 + the saved posts)', r.status75?.data?.bookmarks === 75, r.status75?.data);

    // Incremental: everything is archived now → a second scan stops as "up to date".
    await pg.goto('https://x.com/i/bookmarks');
    await poll(panel, p => p.shown);
    await poll(() => pg.evaluate(() => window.xtPage.fetches), n => n >= 1);
    await sleep(500);
    await press('Scan bookmarks');
    r.upToDate = await poll(panel, p => /^Up to date/.test(p.count), 40000, 300);
    expect(B, 'incremental re-scan: 2 known pages → up to date', /^Up to date: \d+ bookmarks$/.test(r.upToDate.count), r.upToDate);

    // 429 on page 3 → stop with the slowed-down line.
    throttle.at = 2;
    await pg.goto('https://x.com/i/bookmarks');
    await poll(panel, p => p.shown);
    await sleep(500);
    await msg({ type: 'saved:clear' });
    await press('Scan bookmarks');
    r.throttled = await poll(panel, p => /slowed down/.test(p.count), 40000, 300);
    r.throttleFetchesAfter = await pg.evaluate(() => window.xtPage.statuses);
    expect(B, '429 → stops with "X slowed down, continue in 15 min"', r.throttled.count === 'X slowed down, continue in 15 min', r.throttled);
    throttle.at = -1;

    /* (c) archive panel */
    const C = 'ui (c) archive panel';
    const gone = () => inShadow(pg, 'xt-gone', roots => {
      const r0 = roots[0];
      if (!r0 || r0.host.hidden || !r0.querySelector('.p')) return { shown: false };
      return { shown: true, title: r0.querySelector('.t').textContent, links: [...r0.querySelectorAll('a')].map(a => ({ text: a.firstChild.textContent, href: a.href })) };
    });
    // Re-archive ID(101) so the panel can offer the saved copy.
    await pg.goto('https://x.com/home');
    await poll(() => pg.evaluate(() => document.querySelectorAll('[data-xt-slot] xt-save').length), n => n === 2);
    await clickSave(pg, ID(101));
    await poll(() => menuState(pg), m => m.open);
    await download(pg, () => clickItem(pg, 'Download Markdown'));
    const t0 = Date.now();
    await pg.goto(`https://x.com/ada_example/status/${ID(101)}?gone=1`);
    r.gone = await poll(gone, g => g.shown && g.links.length === 4, 5000, 50);
    r.goneMs = Date.now() - t0;
    await sleep(200);
    await pg.screenshot({ path: path.join(SHOTS, 'gone-panel.png') });
    const L = Object.fromEntries((r.gone.links || []).map(l => [l.text, l.href]));
    expect(C, 'panel appears on a gone post within a second of the page', r.gone.shown && r.goneMs < 2500, { ms: r.goneMs, shown: r.gone.shown });
    expect(C, 'saved copy link first', r.gone.links?.[0]?.text === 'Open saved copy' && L['Open saved copy'].endsWith(`#id=${ID(101)}`), r.gone.links?.[0]);
    expect(C, 'Wayback snapshot near the post date (twitter.com for 2025 ids)', /^https:\/\/web\.archive\.org\/web\/\d{14}\/https:\/\/(x|twitter)\.com\/ada_example\/status\//.test(L['Wayback Machine'] || ''), L['Wayback Machine']);
    expect(C, 'archive.today link', (L['archive.today'] || '').startsWith('https://archive.ph/https://'), L['archive.today']);
    expect(C, 'account archive → deleted-tweet-finder?link=@handle', L['See the account’s archive'] === `${BASE}/deleted-tweet-finder?link=%40ada_example&utm_source=extension&utm_medium=gone_panel&utm_campaign=credit`, L['See the account’s archive']);
    await inShadow(pg, 'xt-gone', roots => roots[0].querySelector('.x').click());
    r.goneClosed = await gone();
    expect(C, 'closable', !r.goneClosed.shown, r.goneClosed);
    // Detected from the TweetDetail answer too (no error state in the DOM).
    await pg.goto(`https://x.com/nobody/status/${GONE}`);
    r.gone2 = await poll(gone, g => g.shown, 4000, 50);
    expect(C, 'gone id from TweetDetail code 144', r.gone2.shown && r.gone2.links.length === 3, r.gone2);
    await pg.goto('https://x.com/home');
    r.goneOnHome = await gone();
    expect(C, 'no panel on other pages', !r.goneOnHome.shown, r.goneOnHome);

    /* counters */
    const E = 'ui counters';
    await sw.evaluate(() => chrome.storage.local.get('evq').then(r => chrome.storage.local.set({ evq: { ...(r.evq || { events: [] }), lastFlushAt: 0 } })));
    const before = state.events.length;
    await msg({ type: 'event:track', event: { name: 'copy' } });
    const sent = await poll(() => state.events, ev => ev.length > before, 8000);
    const names = sent.flatMap(e => JSON.parse(e.body).events.map(x => x.name + (x.param ? `:${x.param}` : '')));
    r.events = names;
    const gaps = sent.slice(1, -1).map((e, i) => e.at - sent[i].at); // the last batch was forced (lastFlushAt reset)
    expect(E, 'batches carry X-Xt-Client: ext, at most one a minute', sent.length >= 1 && sent.every(e => e.client === 'ext') && gaps.every(g => g >= 59_000), { clients: sent.map(e => e.client), gaps });
    expect(E, 'events counted: install, downloads, copy, saved_open, bookmarks_capture', ['ext_install', 'download:md', 'copy', 'download:pdf', 'saved_open'].every(n => names.includes(n)) && names.some(n => n.startsWith('bookmarks_capture:')), names);
    expect(E, 'no URL, handle or post id in the counter body', !/x\.com|ada_example|1890000|424242|status/.test(sent.map(e => e.body).join('')), sent[0]?.body);
    expect(E, 'at most 25 events per batch', sent.every(e => JSON.parse(e.body).events.length <= 25));
  } finally {
    await context?.close().catch(() => {});
    site?.restore();
    await new Promise(res => (site?.server ? site.server.close(res) : res()));
    await mods?.vite.close().catch(() => {});
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return r;
}

/* ─── (d) (e) against wrangler dev ─── */

/**
 * `base` is the running `wrangler dev` (cookie-test.mjs), `extDir` a dev build pointing at it, `key` a key the
 * fake Gumroad grants.
 */
export async function runRealBridgeTest({ base, extDir, key, log = () => {}, expect, headless = !process.env.XT_TEST_HEADED }) {
  const r = {};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xt-bridge-test-'));
  fs.mkdirSync(SHOTS, { recursive: true });
  const { context, sw, extId } = await launch(extDir, tmp, headless);
  let msgPage = null;
  const msg = async m => {
    if (!msgPage) {
      msgPage = await context.newPage();
      await msgPage.goto(`chrome-extension://${extId}/popup.html`);
    }
    return msgPage.evaluate(m => chrome.runtime.sendMessage(m), m).catch(() => null);
  };
  try {
    // Fill the archive through the real capture path (x.com stand-in Bookmarks page with the 7-post fixture).
    await context.addCookies([{ name: 'twid', value: `u%3D${ACCOUNT}`, domain: '.x.com', path: '/', secure: true, sameSite: 'Lax' }]);
    await context.route('https://x.com/**', route => {
      const u = new URL(route.request().url());
      if (/\/i\/api\/graphql\/[^/]+\/Bookmarks$/.test(u.pathname)) return route.fulfill({ status: 200, contentType: 'application/json', body: fixture('bookmarks.json') });
      return route.fulfill({ status: 200, contentType: 'text/html', body: page({ main: '<h1>Bookmarks</h1>', script: `<script>fetch('/i/api/graphql/Q/Bookmarks')</script>` }) });
    });
    const xp = await context.newPage();
    await xp.goto('https://x.com/i/bookmarks');
    const extPage = await context.newPage();
    await extPage.goto(`chrome-extension://${extId}/popup.html`);
    const status = () => extPage.evaluate(() => chrome.runtime.sendMessage({ type: 'saved:status' }));
    r.status = await poll(status, s => s?.data?.posts >= 7);
    await xp.close();
    log(`archive has ${r.status?.data?.posts} posts; opening ${base}/saved`);

    const D = 'bridge (d) real /saved';
    const site = await context.newPage();
    await site.addInitScript(() => {
      window.__xtMsgs = [];
      window.addEventListener('message', e => e.source === window && e.data && e.data.xt === 1 && window.__xtMsgs.push(e.data));
    });
    await site.goto(`${base}/saved`);
    await site.getByText('Reading list for the weekend', { exact: false }).first().waitFor({ timeout: 15000 });
    r.msgs = await site.evaluate(() => window.__xtMsgs.map(m => m.type));
    r.statusMsg = await site.evaluate(() => window.__xtMsgs.find(m => m.type === 'xt:status') || null);
    expect(D, 'bridge says hello and sends xt:status by itself', r.msgs.includes('xt:hello') && r.statusMsg?.bookmarks === 7, { msgs: [...new Set(r.msgs)], status: r.statusMsg });
    expect(D, 'list came over the bridge (xt:saved:list → xt:saved:page)', r.msgs.includes('xt:saved:list') && r.msgs.includes('xt:saved:page'), [...new Set(r.msgs)]);
    r.rows = await site.evaluate(() => document.body.innerText.match(/@\w+/g)?.length || 0);
    await site.screenshot({ path: path.join(SHOTS, 'saved-real-bridge.png'), fullPage: false });

    // ZIP export of the list (real buildBatchZip; every copy fetched with xt:saved:get).
    const [dl] = await Promise.all([site.waitForEvent('download', { timeout: 20000 }), site.getByRole('button', { name: /ZIP/ }).first().click()]);
    const zip = unzipSync(new Uint8Array(fs.readFileSync(await dl.path())));
    r.zipFiles = Object.keys(zip).filter(f => f.endsWith('.md'));
    expect(D, 'ZIP holds one Markdown file per saved post (7)', r.zipFiles.length === 7, r.zipFiles);
    r.getCount = await site.evaluate(() => window.__xtMsgs.filter(m => m.type === 'xt:saved:post').length);
    expect(D, 'copies fetched with xt:saved:get', r.getCount >= 7, r.getCount);

    // One copy (#id=).
    await site.goto(`${base}/saved#id=${ID(102)}`);
    await site.getByText('This is a long post', { exact: false }).first().waitFor({ timeout: 15000 });
    r.single = true;
    expect(D, 'single copy opens from #id=', r.single);

    // Data requests are answered on /saved only; xt:lang-changed reaches the extension anywhere.
    const other = await context.newPage();
    await other.goto(`${base}/privacy`);
    r.offSaved = await other.evaluate(() => new Promise(res => {
      const got = [];
      addEventListener('message', e => e.source === window && e.data?.type === 'xt:saved:page' && got.push(e.data));
      postMessage({ xt: 1, type: 'xt:saved:list', req: 'probe1', cursor: 0, filter: 'all' }, location.origin);
      postMessage({ xt: 1, type: 'xt:lang-changed', lang: 'tr' }, location.origin);
      setTimeout(() => res(got.length), 1500);
    }));
    r.lang = await poll(() => sw.evaluate(() => chrome.storage.local.get('lang').then(x => x.lang)), l => l === 'tr', 4000);
    expect(D, 'xt:saved:list on another page gets no answer', r.offSaved === 0, r.offSaved);
    expect(D, 'xt:lang-changed → chrome.storage.local.lang', r.lang === 'tr', r.lang);
    await msg({ type: 'lang:set', lang: 'en' });
    await other.close();

    // (e) Popup: free → activate → Pro; the site is Pro too.
    const E = 'popup (e) Pro';
    await msg({ type: 'settings:set', settings: { noticeSeen: false } });
    const pop = await context.newPage();
    await pop.setViewportSize({ width: 320, height: 500 });
    await pop.goto(`chrome-extension://${extId}/popup.html`);
    await pop.locator('#pro-off').waitFor({ state: 'visible' });
    await sleep(400); // switch transitions
    r.counts = await pop.locator('#counts').textContent();
    r.notice = await pop.locator('#notice').isVisible();
    await pop.screenshot({ path: path.join(SHOTS, 'popup-free.png'), fullPage: true });
    expect(E, 'free popup: key field, notice, counts', r.notice && /7 saved posts/.test(r.counts || ''), { notice: r.notice, counts: r.counts });
    await pop.locator('#notice-ok').click();
    await pop.locator('#key').fill(key);
    await pop.locator('#activate').click();
    await pop.locator('#pro-on').waitFor({ state: 'visible', timeout: 15000 });
    await sleep(300);
    await pop.screenshot({ path: path.join(SHOTS, 'popup-pro.png'), fullPage: true });
    const sitePage = await context.newPage();
    await sitePage.goto(`${base}/privacy`);
    r.siteMe = await sitePage.evaluate(() => fetch('/api/pro/me', { credentials: 'same-origin' }).then(x => x.json()));
    expect(E, 'popup activation → site /api/pro/me pro:true', r.siteMe?.pro === true, r.siteMe);
    r.noticeSaved = (await msg({ type: 'settings:get' }))?.data?.noticeSeen;
    expect(E, 'notice dismissed is remembered', r.noticeSaved === true, r.noticeSaved);

    // Delete all with the confirmation step.
    await pop.locator('#delete').click();
    r.confirmShown = await pop.locator('#confirm').isVisible();
    await pop.locator('#confirm-yes').click();
    r.afterDelete = await poll(() => msg({ type: 'saved:status' }), s => s?.data?.posts === 0, 5000);
    expect(E, 'Delete all asks first, then empties the archive', r.confirmShown && r.afterDelete?.data?.posts === 0, { confirm: r.confirmShown, after: r.afterDelete?.data });
    await pop.locator('#signout').click();
    await pop.locator('#pro-off').waitFor({ state: 'visible', timeout: 10000 });
  } finally {
    await context.close().catch(() => {});
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return r;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const failures = [];
  const expect = (scope, label, ok, detail) => {
    if (!ok) failures.push(`${scope}: ${label}${detail === undefined ? '' : ` (${JSON.stringify(detail)})`}`);
    return ok;
  };
  try {
    await runUiStandInTest({ log: (...a) => console.error('·', ...a), expect });
  } catch (err) {
    failures.push(`run error: ${err.stack || err}`);
  }
  if (failures.length) {
    console.error(`\n✗ ui test: ${failures.length} failure(s)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.error('\n✓ ui test: every expectation held');
}
