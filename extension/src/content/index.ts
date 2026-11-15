/**
 * ISOLATED-world content script on x.com (docs/chrome-extension-plan.md, B3).
 *
 * Runs at document_start (not document_idle) so its listener exists before X's first GraphQL calls:
 * hook.js forwards responses as they arrive and a message posted before this script runs is lost.
 *
 * Data path: hook.js message → checks (same window, tag, size, op name; post ids are checked by the mapper
 * and again by the SW) → x/graphql.ts → capture:posts to the SW. The same answers feed the UI:
 *   Bookmarks answers / throttled statuses → the bookmarks panel's scroll rules (bookmarks-panel.ts)
 *   TweetDetail answers                   → RecentPosts (Save menu fallback) and the archive panel (gone-panel.ts)
 *   an answer the mapper did not recognise → one parse_fail counter per operation and page load
 * The UI itself (Save menu, panels) starts once the page has a body.
 */
import { send } from '../messages';
import { XT_VERSION } from '../config';
import { parseStatusUrl } from '../links';
import { categoryOf, isHookMessage, OPS_TAG, parseStoredConfig, type HookMessage, type OpsMessage, type XtConfig } from '../x/ops';
import { bookmarksPageKind } from './anchors';
import { EXPORT_HASH, startBookmarksPanel } from './bookmarks-panel';
import type { ScanResponse } from './scan';
import { accountFromCookie, handleHookMessage, RecentPosts } from './capture';
import { goneFromDetail } from './gone';
import { startGonePanel } from './gone-panel';
import { startSaveMenu } from './save-menu';
import { initLang, watchTheme } from './ui';

(() => {
  const CONFIG_KEY = 'xtConfig';
  const MAX_QUEUE = 30;
  let config: XtConfig = parseStoredConfig(null, XT_VERSION);
  let ready = false;
  const queue: HookMessage[] = [];
  const recent = new RecentPosts();
  const parseFailSent = new Set<string>();
  // Read now, at document_start: X redirects /i/bookmarks to /i/history and the redirect drops the hash.
  const openedForExport = location.hash === EXPORT_HASH && !!bookmarksPageKind(location.pathname);

  let ui: {
    bookmarks: ReturnType<typeof startBookmarksPanel>;
    gone: ReturnType<typeof startGonePanel>;
    save: ReturnType<typeof startSaveMenu>;
  } | null = null;
  /** Gone signals and Bookmarks answers that arrived before the UI started. */
  const earlyGone = new Set<string>();
  const earlyBookmarks: ScanResponse[] = [];
  const toPanel = (r: ScanResponse) => {
    if (ui) ui.bookmarks.onBookmarksResponse(r);
    else if (earlyBookmarks.length < 20) earlyBookmarks.push(r);
  };

  const pushOps = () => {
    const msg: OpsMessage = { tag: OPS_TAG, ops: config.ops };
    window.postMessage(msg, location.origin);
  };

  const process = (m: HookMessage) => {
    const cat = categoryOf(config.ops, m.op);
    if (m.status !== undefined) {
      if (cat === 'bookmarks') toPanel({ ids: [], fresh: null, recognized: true, status: m.status });
      return;
    }
    const { capture, result, json } = handleHookMessage(m, config, accountFromCookie(document.cookie), recent);

    if (result && !result.recognized && !parseFailSent.has(m.op)) {
      parseFailSent.add(m.op);
      void send({ type: 'event:track', event: { name: 'parse_fail', param: m.op.toLowerCase().slice(0, 24) } });
    }

    if (cat === 'detail' && json !== undefined) {
      const post = parseStatusUrl(location.href);
      if (post && goneFromDetail(json, post.id, m.op)) {
        if (ui) ui.gone.onGone(post.id);
        else earlyGone.add(post.id);
      }
    }

    if (cat === 'bookmarks' && result) {
      const ids = result.entries.map(e => e.id);
      if (!capture) {
        toPanel({ ids, fresh: null, recognized: result.recognized });
        return;
      }
      void send({ type: 'capture:posts', capture }).then(r => {
        const fresh = r.ok && !r.data.disabled ? r.data.fresh : null;
        toPanel({ ids, fresh, recognized: result.recognized });
      });
      return;
    }
    if (capture) void send({ type: 'capture:posts', capture });
  };

  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin) return;
    if (!isHookMessage(event.data)) return;
    const m = event.data;
    if (!ready) {
      if (queue.length < MAX_QUEUE) queue.push(m);
      return;
    }
    process(m);
  });

  const apply = (stored: unknown) => {
    config = parseStoredConfig(stored, XT_VERSION);
    pushOps();
  };

  chrome.storage.local
    .get(CONFIG_KEY)
    .then(r => apply(r[CONFIG_KEY]))
    .catch(() => pushOps())
    .finally(() => {
      ready = true;
      for (const m of queue.splice(0)) process(m);
    });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[CONFIG_KEY]) apply(changes[CONFIG_KEY].newValue);
  });

  /* ─── UI ─── */

  const DISMISS_KEY = 'xtBookmarksButtonHidden';
  /**
   * A flag for this browser session: chrome.storage.session (the SW opens it to content scripts), else memory
   * for this tab. Never X's own localStorage / sessionStorage.
   */
  function sessionFlag(key: string) {
    let mem = false;
    return {
      get: async () => {
        try {
          return (await chrome.storage.session.get(key))[key] === true || mem;
        } catch {
          return mem;
        }
      },
      set: async (v: boolean) => {
        mem = v;
        try {
          if (v) await chrome.storage.session.set({ [key]: true });
          else await chrome.storage.session.remove(key);
        } catch {
          /* session storage closed to content scripts: memory only */
        }
      },
    };
  }

  async function startUi() {
    await initLang();
    const save = startSaveMenu({ recent, account: () => accountFromCookie(document.cookie), enabled: () => config.flags.saveMenu });
    const bookmarks = startBookmarksPanel({
      isPro: async () => {
        const r = await send({ type: 'pro:get' });
        return r.ok && r.data.pro;
      },
      account: () => accountFromCookie(document.cookie),
      dismissed: sessionFlag(DISMISS_KEY),
      openedForExport,
    });
    const gone = startGonePanel();
    ui = { save, bookmarks, gone };
    watchTheme(() => {
      save.restyle();
      bookmarks.restyle();
      gone.restyle();
    });

    // X is a single-page app: follow URL changes (pushState is not visible from this world, so poll cheaply).
    // The bookmarks panel also follows the History page's tabs, which switch without a URL change.
    let href = '';
    const route = () => {
      bookmarks.route();
      if (location.href === href) return;
      href = location.href;
      gone.route();
    };
    route();
    setInterval(route, 400);
    addEventListener('popstate', route);
    addEventListener('hashchange', route);
    for (const id of earlyGone) gone.onGone(id);
    earlyGone.clear();
    for (const r of earlyBookmarks.splice(0)) bookmarks.onBookmarksResponse(r);
  }

  // The popup's "Save this post" fallback (no tabs permission: the popup reaches this tab by its id).
  chrome.runtime.onMessage.addListener((raw, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id || sender.tab) return false;
    if (!raw || typeof raw !== 'object' || (raw as { type?: unknown }).type !== 'xt:save-current') return false;
    if (!ui) {
      sendResponse({ ok: false, error: 'not_ready' });
      return false;
    }
    ui.save.saveCurrent().then(sendResponse, () => sendResponse({ ok: false, error: 'failed' }));
    return true;
  });

  const boot = () => void startUi().catch(() => {});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
