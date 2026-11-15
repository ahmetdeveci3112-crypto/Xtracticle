#!/usr/bin/env node
/**
 * End-to-end test of the capture path (docs/chrome-extension-plan.md, A8 step 5):
 *   x.com page → hook.js (fetch + XHR) → content.js → capture:posts → SW → IndexedDB `xtracticle`.
 *
 * x.com is played by Playwright (`context.route('https://x.com/**')`): one page with buttons for the
 * page's own fetch / XHR calls, GraphQL answers from extension/test/fixtures (synthetic). The SW talks
 * to a small local stand-in for xtracticle.com (config.json with an extra op name, /api/pro/me), so this
 * test needs neither wrangler nor the network. The archive is read back through the SW's message API
 * from an extension page, the way the popup and /saved will.
 *
 * Also checked: the page still gets its fetch body and its XHR readyState sequence; an op not in the
 * list (HomeTimeline) and a forged message are not stored; the archive switch; delete / clear; the Pro
 * cache after /api/pro/me with X-Xt-Client: ext.
 *
 *   node extension/test/e2e/capture-test.mjs      (also run by npm run test:e2e via cookie-test.mjs)
 *   XT_CAPTURE_PORT=8796 (default) · XT_TEST_HEADED=1 shows the browser
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const fixtures = path.resolve(here, '../fixtures');
const PORT = Number(process.env.XT_CAPTURE_PORT || 8796);
const BASE = `http://127.0.0.1:${PORT}`;
const ACCOUNT = '424242';
const ID = n => `18900000000000${String(n).padStart(5, '0')}`;
const fixture = f => fs.readFileSync(path.join(fixtures, f), 'utf8');

/** A one-post Bookmarks answer, built from the folder fixture with a new id (for the archive-off check). */
function singlePost(n) {
  const j = JSON.parse(fixture('bookmarks-folder.json'));
  const e = j.data.bookmark_collection_timeline.timeline.instructions[0].entries[0];
  const t = e.content.itemContent.tweet_results.result;
  t.rest_id = ID(n);
  t.legacy.id_str = ID(n);
  e.entryId = `tweet-${ID(n)}`;
  j.data.bookmark_collection_timeline.timeline.instructions[0].entries = [e];
  return JSON.stringify(j);
}

const PAGE = `<!doctype html><html><head><title>x.com stand-in</title></head><body><p>x.com stand-in</p>
<script>
  window.xtTest = {
    async fetchGql(op, extra, init) {
      const r = await fetch('/i/api/graphql/SYNTHQID/' + op + '?variables=%7B%7D' + (extra || ''), init || { credentials: 'include' });
      const text = await r.text();
      return { status: r.status, length: text.length, ok: r.ok, json: (() => { try { return Object.keys(JSON.parse(text)); } catch { return null; } })() };
    },
    xhrGql(op, body) {
      return new Promise(resolve => {
        const x = new XMLHttpRequest();
        const states = [];
        x.onreadystatechange = () => states.push(x.readyState);
        x.onload = () => resolve({ status: x.status, states, length: x.responseText.length });
        x.onerror = () => resolve({ error: true, states });
        x.open(body ? 'POST' : 'GET', 'https://x.com/i/api/graphql/SYNTHQID/' + op);
        if (body) x.setRequestHeader('content-type', 'application/json');
        x.send(body || null);
      });
    },
    forge(msg) { window.postMessage(msg, location.origin); },
  };
</script></body></html>`;

function startSiteStandIn(state) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, BASE);
    if (url.pathname === '/ext/config.json') {
      state.configReads++;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ schema: 1, minVersion: '0.1.0', ops: { bookmarks: ['BookmarksV9'] }, flags: { capture: true, detect: false, saveMenu: true } }));
    }
    if (url.pathname === '/api/pro/me') {
      state.proMe.push({ client: req.headers['x-xt-client'] || null });
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end('{"pro":false}');
    }
    res.writeHead(404).end();
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function poll(fn, check, ms = 10000) {
  const until = Date.now() + ms;
  let last;
  while (Date.now() < until) {
    last = await fn();
    if (check(last)) return last;
    await new Promise(r => setTimeout(r, 150));
  }
  return last;
}

/**
 * Runs the scenario. `expect(scope, label, ok, detail)` records a failure; returns the raw observations.
 */
export async function runCaptureTest({ log = () => {}, expect, headless = !process.env.XT_TEST_HEADED } = {}) {
  const r = {};
  const S = 'capture';
  const state = { configReads: 0, proMe: [] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xt-capture-test-'));
  const extDir = path.join(tmp, 'ext');
  let server;
  let context;
  try {
    server = await startSiteStandIn(state);
    log(`building a dev extension against ${BASE}`);
    const b = spawnSync('node', ['extension/build.mjs', '--dev', `--out=${extDir}`], { cwd: root, encoding: 'utf8', env: { ...process.env, XT_BASE: BASE } });
    if (b.status !== 0) throw new Error(`extension build failed:\n${b.stdout}\n${b.stderr}`);
    const version = JSON.parse(fs.readFileSync(path.join(extDir, 'manifest.json'), 'utf8')).version;

    context = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(tmp, 'profile-')), {
      channel: 'chromium',
      headless,
      args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`],
    });
    let [sw] = context.serviceWorkers();
    if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 15000 });
    const extId = new URL(sw.url()).hostname;

    // SW start: config.json merged into storage, /api/pro/me cached.
    r.storage = await poll(
      () => sw.evaluate(() => chrome.storage.local.get(['xtConfig', 'pro'])),
      s => s.xtConfig?.ops?.bookmarks?.includes('BookmarksV9') && s.pro,
    );
    expect(S, 'config.json op names merged into storage', !!r.storage.xtConfig?.ops?.bookmarks?.includes('BookmarksV9'), r.storage.xtConfig);
    expect(S, 'config not outdated (minVersion 0.1.0)', r.storage.xtConfig?.outdated === false && r.storage.xtConfig?.flags?.capture === true, r.storage.xtConfig);
    expect(S, 'Pro cache written without a key', r.storage.pro?.pro === false && typeof r.storage.pro?.checkedAt === 'number' && !('key' in (r.storage.pro || {})), r.storage.pro);
    expect(S, '/api/pro/me called with X-Xt-Client: ext', state.proMe.length >= 1 && state.proMe.every(p => p.client === 'ext'), state.proMe);

    // x.com stand-in.
    await context.addCookies([{ name: 'twid', value: `u%3D${ACCOUNT}`, domain: '.x.com', path: '/', secure: true, sameSite: 'Lax' }]);
    const gqlBodies = {
      Bookmarks: fixture('bookmarks.json'),
      BookmarksV9: fixture('bookmarks-folder.json'),
      TweetDetail: fixture('tweet-detail.json'),
      HomeTimeline: singlePost(555),
      CreateBookmark: '{"data":{"tweet_bookmark_put":"Done"}}',
      DeleteBookmark: '{"data":{"tweet_bookmark_delete":"Done"}}',
    };
    await context.route('https://x.com/**', route => {
      const u = new URL(route.request().url());
      const m = u.pathname.match(/^\/i\/api\/graphql\/[^/]+\/([A-Za-z0-9_]+)$/);
      if (m) {
        const body = u.searchParams.get('extra') === 'new' ? singlePost(556) : gqlBodies[m[1]];
        return route.fulfill({ status: body ? 200 : 404, contentType: 'application/json', body: body || '{}' });
      }
      return route.fulfill({ status: 200, contentType: 'text/html', body: PAGE });
    });

    const page = await context.newPage();
    await page.goto('https://x.com/i/bookmarks');
    r.hookMarker = await page.evaluate(() => typeof window.fetch === 'function' && window.fetch.name);
    const ext = await context.newPage();
    await ext.goto(`chrome-extension://${extId}/popup.html`);
    const send = msg => ext.evaluate(m => chrome.runtime.sendMessage(m), msg);
    const status = () => send({ type: 'saved:status', accountId: ACCOUNT });

    // 1. Bookmarks via fetch: page still reads the body.
    r.fetchBookmarks = await page.evaluate(() => window.xtTest.fetchGql('Bookmarks'));
    expect(S, 'page fetch still gets its body', r.fetchBookmarks.status === 200 && r.fetchBookmarks.length === gqlBodies.Bookmarks.length && r.fetchBookmarks.json?.includes('data'), r.fetchBookmarks);
    r.status1 = await poll(status, s => s?.data?.posts >= 7);
    expect(S, 'Bookmarks (fetch): 7 posts and 7 bookmark rows', r.status1?.data?.posts === 7 && r.status1?.data?.bookmarks === 7, r.status1);
    expect(S, 'lastSyncAt set', typeof r.status1?.data?.lastSyncAt === 'string', r.status1);

    // 2. Remote op name via XHR: readyState sequence untouched.
    r.xhrFolder = await page.evaluate(() => window.xtTest.xhrGql('BookmarksV9'));
    expect(S, 'page XHR keeps readyState 1→2→3→4 and its body', JSON.stringify(r.xhrFolder.states) === '[1,2,3,4]' && r.xhrFolder.status === 200 && r.xhrFolder.length === gqlBodies.BookmarksV9.length, r.xhrFolder);
    r.status2 = await poll(status, s => s?.data?.posts >= 9);
    expect(S, 'BookmarksV9 (XHR, name from config.json): 9 posts', r.status2?.data?.posts === 9 && r.status2?.data?.bookmarks === 9, r.status2);

    // 3. Not listened / forged: nothing new.
    await page.evaluate(() => window.xtTest.fetchGql('HomeTimeline'));
    await page.evaluate(([tag]) => {
      window.xtTest.forge({ tag, op: 'Bookmarks', body: JSON.stringify({ data: { tweetResult: { result: { __typename: 'Tweet', rest_id: 'not-a-number', legacy: { full_text: 'x' } } } } }) });
      window.xtTest.forge({ tag: 'other', op: 'Bookmarks', body: '{}' });
    }, ['xtracticle:hook:1']);
    await new Promise(res => setTimeout(res, 800));
    r.status3 = await status();
    expect(S, 'HomeTimeline and forged messages store nothing', r.status3?.data?.posts === 9, r.status3);

    // 4. TweetDetail is not archived by itself; CreateBookmark (XHR POST) then archives the post.
    await page.evaluate(() => window.xtTest.fetchGql('TweetDetail'));
    await new Promise(res => setTimeout(res, 500));
    r.status4a = await status();
    expect(S, 'TweetDetail alone stores nothing', r.status4a?.data?.posts === 9, r.status4a);
    r.xhrAdd = await page.evaluate(id => window.xtTest.xhrGql('CreateBookmark', JSON.stringify({ variables: { tweet_id: id }, queryId: 'SYNTHQID' })), ID(202));
    r.status4 = await poll(status, s => s?.data?.posts >= 10);
    expect(S, 'CreateBookmark archives the post seen in TweetDetail', r.status4?.data?.posts === 10 && r.status4?.data?.bookmarks === 10, r.status4);

    // 5. DeleteBookmark (fetch POST) → removed_by_user; the copy stays.
    await page.evaluate(id => window.xtTest.fetchGql('DeleteBookmark', '', { method: 'POST', body: JSON.stringify({ variables: { tweet_id: id } }) }), ID(101));
    r.status5 = await poll(status, s => s?.data?.bookmarks === 9);
    expect(S, 'DeleteBookmark: 9 active rows, post kept', r.status5?.data?.bookmarks === 9 && r.status5?.data?.posts === 10, r.status5);

    // 6. The message API the popup and /saved use.
    r.list = await send({ type: 'saved:list', cursor: 0, filter: 'all', accountId: ACCOUNT });
    const items = r.list?.data?.items || [];
    expect(S, 'saved:list: 10 summaries, total 10, no next page', items.length === 10 && r.list.data.total === 10 && r.list.data.next === null, r.list);
    expect(S, 'saved:list: removed row shows removed_by_user', items.find(i => i.id === ID(101))?.state === 'removed_by_user', items.find(i => i.id === ID(101)));
    r.get = await send({ type: 'saved:get', id: ID(102) });
    expect(S, 'saved:get: long post text from note_tweet', r.get?.data?.tweet?.text?.includes('https://example.org/notes') && r.get?.data?.source === 'bookmark', r.get?.data?.tweet?.text?.slice(0, 80));
    r.dump = await send({ type: 'saved:export' });
    const rows = r.dump?.data?.bookmarks || [];
    expect(S, 'export: posts + rows with accountId from twid', r.dump?.data?.format === 'xtracticle-archive' && r.dump.data.extVersion === version && rows.length === 10 && rows.every(b => b.accountId === ACCOUNT), { n: rows.length, v: r.dump?.data?.extVersion });
    expect(S, 'export: sortIndex kept from the timeline', rows.find(b => b.id === ID(102))?.sortIndex === '1859000000000000098', rows.find(b => b.id === ID(102)));
    expect(S, 'export: HomeTimeline post absent', !r.dump?.data?.posts?.some(p => p.id === ID(555)));

    // 7. Archive off → nothing written; on again → written.
    r.off = await send({ type: 'settings:set', settings: { archive: false } });
    await page.evaluate(() => window.xtTest.fetchGql('Bookmarks', '&extra=new'));
    await new Promise(res => setTimeout(res, 800));
    r.status7 = await status();
    expect(S, 'archive off: nothing stored', r.off?.data?.archive === false && r.status7?.data?.posts === 10 && r.status7?.data?.archive === false, r.status7);
    await send({ type: 'settings:set', settings: { archive: true } });
    await page.evaluate(() => window.xtTest.fetchGql('Bookmarks', '&extra=new'));
    r.status7b = await poll(status, s => s?.data?.posts >= 11);
    expect(S, 'archive on again: stored', r.status7b?.data?.posts === 11, r.status7b);

    // 8. Delete one, then everything.
    r.del = await send({ type: 'saved:delete', ids: [ID(101)] });
    r.status8 = await status();
    expect(S, 'saved:delete removes post and rows', r.del?.data?.deleted === 1 && r.status8?.data?.posts === 10, r.status8);
    r.bad = await send({ type: 'saved:delete', ids: ['x'] });
    expect(S, 'saved:delete rejects bad ids', r.bad?.ok === false, r.bad);
    await send({ type: 'saved:clear' });
    r.status9 = await status();
    expect(S, 'saved:clear empties the archive', r.status9?.data?.posts === 0 && r.status9?.data?.bookmarks === 0 && r.status9?.data?.lastSyncAt === null, r.status9);

    // 9. Pro through the API (cache fresh → no second call within 10 min; refresh forces one).
    const before = state.proMe.length;
    r.proGet = await send({ type: 'pro:get' });
    const afterGet = state.proMe.length;
    await new Promise(res => setTimeout(res, 5200)); // 5-second floor for pro:refresh
    r.proRefresh = await send({ type: 'pro:refresh' });
    expect(S, 'pro:get answers from the cache', r.proGet?.ok && r.proGet.data.pro === false && afterGet === before, { r: r.proGet, before, afterGet });
    expect(S, 'pro:refresh calls the site again', r.proRefresh?.ok && state.proMe.length === afterGet + 1, { n: state.proMe.length });
  } finally {
    await context?.close().catch(() => {});
    await new Promise(res => (server ? server.close(res) : res()));
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
    await runCaptureTest({ log: (...a) => console.error('·', ...a), expect });
  } catch (err) {
    failures.push(`run error: ${err.stack || err}`);
  }
  if (failures.length) {
    console.error(`\n✗ capture test: ${failures.length} failure(s)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.error('\n✓ capture test: every expectation held');
}
