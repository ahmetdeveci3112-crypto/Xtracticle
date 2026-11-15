#!/usr/bin/env node
/**
 * Cookie test for the extension's Pro path (docs/chrome-extension-plan.md, A2 "Uygulamada doğrula",
 * results in docs/chrome-extension-cookie-test.md).
 *
 * Question: can the extension's service worker share the site's HttpOnly, SameSite=Lax `xt_pro` cookie?
 *   (a) SW fetch(..., { credentials: 'include' }) sends the cookie,
 *   (b) a Set-Cookie answer to the SW lands in the browser's cookie jar and the site sees it,
 *   (c) both still hold with third-party cookies blocked.
 *
 * Setup it creates and tears down (nothing outside the repo and the OS temp dir is touched):
 *   - scripts/fake-gumroad.mjs on 127.0.0.1:8799 (unless one already answers there),
 *   - `wrangler dev` on localhost:$XT_TEST_PORT (default 8788) with .dev.vars and a throw-away local D1
 *     (--persist-to a temp dir, all migrations applied there),
 *   - a dev build of the extension in extension/dist-dev with XT_BASE pointing at that server,
 *   - Playwright Chromium (`channel: 'chromium'`, new headless; Chrome stable no longer loads unpacked
 *     extensions from the command line) with a fresh profile per scenario.
 * .dev.vars must point GUMROAD_API_BASE at http://127.0.0.1:8799 and use the fake product ids.
 *
 *   node extension/test/e2e/cookie-test.mjs            all scenarios + read-only production check
 *   node extension/test/e2e/cookie-test.mjs --no-prod  skip the production check
 *   XT_TEST_HEADED=1 …                                 show the browser
 *
 * Runs extension/test/e2e/capture-test.mjs and ui-test.mjs's stand-in part first (capture path, Save menu,
 * panels; no wrangler), and ui-test.mjs's real-bridge part last (the real /saved page and the popup on wrangler).
 *
 * The production check only sends GET /api/pro/me and GET /api/pro/config without a cookie.
 * Exit code 0 = every expectation held. Prints a JSON report.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { runCaptureTest } from './capture-test.mjs';
import { runRealBridgeTest, runUiStandInTest } from './ui-test.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const PORT = Number(process.env.XT_TEST_PORT || 8788);
const BASE = `http://localhost:${PORT}`;
const OTHER_SITE = `http://127.0.0.1:${PORT}`; // a different site than localhost, for the third-party control
const FAKE_GUMROAD = 'http://127.0.0.1:8799';
const PROD = 'https://xtracticle.com';
const KEY = 'TEST-GRANTED-MONTHLY';
const withProd = !process.argv.includes('--no-prod');
const headless = !process.env.XT_TEST_HEADED;
const EXT_VERSION = JSON.parse(fs.readFileSync(path.join(root, 'extension/manifest.json'), 'utf8')).version;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xt-cookie-test-'));
const children = [];
const report = { startedAt: new Date().toISOString(), base: BASE, browser: null, scenarios: {}, prod: null, failures: [] };

function log(...a) {
  console.error('·', ...a);
}

function expect(scope, label, ok, detail) {
  if (!ok) report.failures.push(`${scope}: ${label}${detail === undefined ? '' : ` (${JSON.stringify(detail)})`}`);
  return ok;
}

async function waitFor(url, ms = 60000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`timed out waiting for ${url}`);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', env: { ...process.env, CI: '1', ...opts.env } });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed:\n${r.stdout}\n${r.stderr}`);
  return r.stdout;
}

function start(cmd, args, name) {
  const child = spawn(cmd, args, { cwd: root, env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let out = '';
  child.stdout.on('data', d => (out += d));
  child.stderr.on('data', d => (out += d));
  child.on('exit', code => code && code !== 0 && log(`${name} exited ${code}\n${out.slice(-2000)}`));
  children.push(child);
  return child;
}

/* ─── Setup ─── */

async function setup() {
  if (!fs.existsSync(path.join(root, 'dist/index.html'))) {
    log('building the site (wrangler serves dist/)');
    run('npm', ['run', 'build']);
  }
  try {
    await fetch(`${FAKE_GUMROAD}/__reset`);
    log('using the fake Gumroad already on 8799 (reset)');
  } catch {
    log('starting scripts/fake-gumroad.mjs');
    start('node', ['scripts/fake-gumroad.mjs'], 'fake-gumroad');
    await waitFor(`${FAKE_GUMROAD}/__log`);
  }
  const state = path.join(tmp, 'wrangler-state');
  log('applying migrations to a throw-away local D1');
  run('npx', ['wrangler', 'd1', 'migrations', 'apply', 'xtracticle-watch', '--local', '--persist-to', state]);
  log(`starting wrangler dev on ${BASE}`);
  start('npx', ['wrangler', 'dev', '--port', String(PORT), '--persist-to', state, '--show-interactive-dev-session=false'], 'wrangler');
  await waitFor(`${BASE}/api/pro/config`, 90000);
  const config = await (await fetch(`${BASE}/api/pro/config`)).json();
  if (!config.available) throw new Error('/api/pro/config says Pro is unavailable: check .dev.vars (fake Gumroad product ids and PRO_COOKIE_SECRET)');

  log('building the dev extension');
  run('node', ['extension/build.mjs', '--dev'], { env: { XT_BASE: BASE } });
  if (withProd) run('node', ['extension/build.mjs']);
  return state;
}

/* ─── Browser ─── */

/** Chrome's "Block third-party cookies" setting, written into a fresh profile before launch. */
function blockThirdPartyCookies(profileDir) {
  const def = path.join(profileDir, 'Default');
  fs.mkdirSync(def, { recursive: true });
  const prefs = { profile: { block_third_party_cookies: true, cookie_controls_mode: 1 } };
  fs.writeFileSync(path.join(def, 'Preferences'), JSON.stringify(prefs));
}

async function launch(extDir, { block3p = false, extraArgs = [] } = {}) {
  const profile = fs.mkdtempSync(path.join(tmp, 'profile-'));
  if (block3p) blockThirdPartyCookies(profile);
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    headless,
    args: [`--disable-extensions-except=${extDir}`, `--load-extension=${extDir}`, ...extraArgs],
  });
  let [sw] = context.serviceWorkers();
  if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 15000 });
  // Counters off: the SW's own ext_install must not mix into the counts below (nor reach production from
  // the store build, which also waits a minute after install before its first batch).
  await sw.evaluate(() => chrome.storage.local.set({ settings: { archive: true, counter: false, noticeSeen: true } }));
  report.browser ??= context.browser()?.version() || (await sw.evaluate(() => navigator.userAgent));
  return { context, sw };
}

/** fetch() inside the extension's service worker, the way the extension calls the site (bg/sw.ts siteFetch). */
const swFetch = (sw, url, init = {}) =>
  sw.evaluate(
    async ({ url, init }) => {
      const r = await fetch(url, { credentials: 'include', ...init });
      const text = await r.text();
      let body = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* not JSON */
      }
      return { status: r.status, body };
    },
    { url, init },
  );

/** fetch() from the site's own page (same origin). */
const pageFetch = (page, p, init = {}) =>
  page.evaluate(
    async ({ p, init }) => {
      const r = await fetch(p, { credentials: 'same-origin', ...init });
      const text = await r.text();
      let body = text;
      try {
        body = JSON.parse(text);
      } catch {
        /* not JSON */
      }
      return { status: r.status, body };
    },
    { p, init },
  );

const proCookie = async context => (await context.cookies(BASE)).find(c => c.name === 'xt_pro') || null;

/** Control: can a cross-site iframe set a SameSite=None cookie? false = third-party cookies are blocked. */
async function thirdPartyCookieAllowed(context) {
  const page = await context.newPage();
  await page.goto(`${OTHER_SITE}/privacy`);
  await page.evaluate(src => {
    const f = document.createElement('iframe');
    f.src = src;
    document.body.appendChild(f);
    return new Promise(r => (f.onload = r));
  }, `${BASE}/api/pro/config`); // site pages send X-Frame-Options: SAMEORIGIN; API responses don't
  const frame = page.frames().find(f => f.url().startsWith(BASE));
  const allowed = await frame.evaluate(() => {
    document.cookie = 'xt3p=1; SameSite=None; Secure; Path=/';
    return document.cookie.includes('xt3p=1');
  });
  await page.close();
  return allowed;
}

async function scenario(name, opts) {
  log(`scenario ${name}`);
  const r = {};
  const { context, sw } = await launch(path.join(root, 'extension/dist-dev'), opts);
  const json = { 'Content-Type': 'application/json' };
  const ext = { 'X-Xt-Client': 'ext' };
  try {
    r.thirdPartyCookieAllowed = await thirdPartyCookieAllowed(context);

    // (b) Activate from the SW → cookie in the jar → the site sees Pro.
    r.extActivate = await swFetch(sw, `${BASE}/api/pro/activate`, { method: 'POST', headers: { ...json, ...ext }, body: JSON.stringify({ key: KEY }) });
    const c = await proCookie(context);
    r.cookieAfterExtActivate = c && { httpOnly: c.httpOnly, sameSite: c.sameSite, secure: c.secure, path: c.path, expiresInDays: Math.round((c.expires * 1000 - Date.now()) / 864e5) };
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__xtMsgs = [];
      window.addEventListener('message', e => e.source === window && e.data && e.data.xt === 1 && window.__xtMsgs.push(e.data));
    });
    await page.goto(`${BASE}/privacy`);
    r.siteMeAfterExtActivate = await pageFetch(page, '/api/pro/me');

    // (a) The SW sends the cookie: /api/pro/me and Watch with X-Xt-Client: ext.
    r.extMe = await swFetch(sw, `${BASE}/api/pro/me`);
    r.extWatchWithHeader = await swFetch(sw, `${BASE}/api/watch`, { headers: ext });
    r.extWatchWithoutHeader = await swFetch(sw, `${BASE}/api/watch`);

    // Sign out in the extension → the site is free too.
    r.extLogout = await swFetch(sw, `${BASE}/api/pro/logout`, { method: 'POST', headers: ext });
    r.siteMeAfterExtLogout = await pageFetch(page, '/api/pro/me');
    r.cookieAfterExtLogout = !!(await proCookie(context));

    // Activate on the site → the extension sees Pro.
    r.siteActivate = await pageFetch(page, '/api/pro/activate', { method: 'POST', headers: { ...json, 'X-Xt-Client': 'web' }, body: JSON.stringify({ key: KEY }) });
    r.extMeAfterSiteActivate = await swFetch(sw, `${BASE}/api/pro/me`);

    // Sign out on the site → the extension is free too.
    await pageFetch(page, '/api/pro/logout', { method: 'POST', headers: { 'X-Xt-Client': 'web' } });
    r.extMeAfterSiteLogout = await swFetch(sw, `${BASE}/api/pro/me`);

    // Bridge skeleton: <html data-xt-ext> and xt:hello.
    r.bridge = await page.evaluate(() => ({ dataset: document.documentElement.dataset.xtExt || null, messages: window.__xtMsgs.map(m => m.type) }));

    // Counter: two events from the SW.
    r.counter = [];
    for (let i = 0; i < 2; i++) {
      r.counter.push((await swFetch(sw, `${BASE}/api/ext/event`, { method: 'POST', headers: { ...json, ...ext }, body: JSON.stringify({ name: 'ext_install', v: EXT_VERSION }) })).status);
    }

    if (withProd) {
      // Read-only: no cookie exists for xtracticle.com in this fresh profile; nothing is written.
      const prod = await launch(path.join(root, 'extension/dist'), opts);
      try {
        r.prodMe = await swFetch(prod.sw, `${PROD}/api/pro/me`);
        r.prodConfig = await swFetch(prod.sw, `${PROD}/api/pro/config`);
        if (r.prodConfig.status === 200) r.prodConfig.body = { available: r.prodConfig.body.available };
      } finally {
        await prod.context.close();
      }
    }
  } finally {
    await context.close();
  }

  const s = `scenario ${name}`;
  expect(s, 'extension activation 200', r.extActivate.status === 200, r.extActivate);
  expect(s, 'xt_pro cookie in the jar, HttpOnly, SameSite=Lax', !!r.cookieAfterExtActivate && r.cookieAfterExtActivate.httpOnly && r.cookieAfterExtActivate.sameSite === 'Lax', r.cookieAfterExtActivate);
  expect(s, 'site sees Pro after extension activation', r.siteMeAfterExtActivate.body?.pro === true, r.siteMeAfterExtActivate);
  expect(s, 'SW sends the cookie (/api/pro/me pro:true)', r.extMe.body?.pro === true, r.extMe);
  expect(s, 'Watch with X-Xt-Client: ext → 200', r.extWatchWithHeader.status === 200, r.extWatchWithHeader.status);
  expect(s, 'Watch without the header → 403', r.extWatchWithoutHeader.status === 403, r.extWatchWithoutHeader.status);
  expect(s, 'extension sign-out clears the site', r.siteMeAfterExtLogout.body?.pro === false && !r.cookieAfterExtLogout, r.siteMeAfterExtLogout);
  expect(s, 'site activation 200', r.siteActivate.status === 200, r.siteActivate);
  expect(s, 'extension sees Pro after site activation', r.extMeAfterSiteActivate.body?.pro === true, r.extMeAfterSiteActivate);
  expect(s, 'site sign-out clears the extension', r.extMeAfterSiteLogout.body?.pro === false, r.extMeAfterSiteLogout);
  expect(s, 'bridge sets data-xt-ext and says xt:hello', r.bridge.dataset === EXT_VERSION && r.bridge.messages.includes('xt:hello'), r.bridge);
  expect(s, 'counter answers 204 twice', r.counter.every(x => x === 204), r.counter);
  if (withProd) {
    expect(s, 'prod /api/pro/me from the store-build SW → 200 pro:false', r.prodMe.status === 200 && r.prodMe.body?.pro === false, r.prodMe);
  }
  if (opts.block3p) expect(s, 'control: third-party cookies really are blocked', r.thirdPartyCookieAllowed === false);
  report.scenarios[name] = r;
}

/* ─── Main ─── */

let state;
try {
  log('capture test (x.com stand-in → IndexedDB)');
  const cap = await runCaptureTest({ log, expect, headless });
  report.capture = Object.fromEntries(Object.entries(cap).filter(([k]) => k.startsWith('status')).map(([k, v]) => [k, v?.data ?? v]));
} catch (err) {
  report.failures.push(`capture test error: ${err.stack || err}`);
}
try {
  log('ui test (Save menu, bookmarks panel, archive panel, counters; stand-ins)');
  const ui = await runUiStandInTest({ log, expect, headless });
  report.ui = { md: ui.md101, bookmarks: ui.panelDone?.count, gone: ui.gone?.links?.length, events: ui.events };
} catch (err) {
  report.failures.push(`ui test error: ${err.stack || err}`);
}
try {
  state = await setup();
  // Each scenario sends ~17 /api requests (the SW's own start-up GET /api/pro/me included); the Worker allows
  // 40 per 10 s per IP (API_LIMITER), so scenarios wait out the window instead of sharing it.
  const cooldown = () => new Promise(r => setTimeout(r, 10500));
  await scenario('default', {});
  await cooldown();
  await scenario('third-party-cookies-blocked', { block3p: true });
  await cooldown();
  await scenario('3pcd-phaseout-flag', { block3p: true, extraArgs: ['--test-third-party-cookie-phaseout'] });

  const out = run('npx', ['wrangler', 'd1', 'execute', 'xtracticle-watch', '--local', '--persist-to', state, '--json', '--command', 'SELECT day, surface, name, param, version, n FROM ext_events']);
  report.extEvents = JSON.parse(out)[0]?.results ?? out;
  const row = Array.isArray(report.extEvents) && report.extEvents.find(r => r.name === 'ext_install' && r.surface === 'ext');
  expect('counter', 'ext_install counted once per request (2 per scenario × 3)', row && row.n === 6, report.extEvents);

  await cooldown();
  log('real bridge test (/saved on wrangler, popup Pro)');
  const rb = await runRealBridgeTest({ base: BASE, extDir: path.join(root, 'extension/dist-dev'), key: KEY, log, expect, headless });
  report.realBridge = { status: rb.statusMsg, zipFiles: rb.zipFiles?.length, siteMe: rb.siteMe };
} catch (err) {
  report.failures.push(`setup/run error: ${err.stack || err}`);
} finally {
  // Each child leads its own process group (detached), so wrangler's workerd goes down with it.
  for (const c of children) {
    try {
      process.kill(-c.pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

report.finishedAt = new Date().toISOString();
console.log(JSON.stringify(report, null, 2));
if (report.failures.length) {
  console.error(`\n✗ cookie test: ${report.failures.length} failure(s)`);
  for (const f of report.failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.error('\n✓ cookie test: every expectation held');
