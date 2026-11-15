/**
 * Service worker (ES module): the only writer of the archive (bg/db.ts) and of chrome.storage.local,
 * and the only place that calls xtracticle.com (docs/chrome-extension-plan.md, B3).
 *
 * The SW can be stopped at any moment, so nothing is kept in memory between messages: every handler
 * reads what it needs from storage / IndexedDB. Message contract: extension/src/messages.ts.
 */
import { isPostId, MAX_DELETE_IDS } from '../../../src/shared/bridge';
import { XT_ORIGIN, XT_VERSION } from '../config';
import { MSG_TYPES, type Msg, type Reply } from '../messages';
import { isAllowed } from './access';
import { fetchThread } from './api';
import { applyCapture, clearAll, deleteSaved, exportAll, getSaved, hasSaved, listSaved, savedStatus } from './db';
import { flush, startQueue, track } from './events';
import { activate, getPro, logout } from './pro';
import { sanitizeCapture, sanitizeTweet } from './records';
import { isLang, LANG_KEY } from '../lang';
import { refreshConfig } from './remote';
import { getSettings, setSettings } from './settings';

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason !== 'install') return;
  void (async () => {
    await chrome.storage.local.set({ installedAt: new Date().toISOString(), installedVersion: XT_VERSION });
    await startQueue();
    await track({ name: 'ext_install' });
  })().catch(() => {});
});

// Every wake-up: both calls return at once when their cache is fresh (10 min / 6 h); queued counters go out when due.
void getPro().catch(() => {});
void refreshConfig().catch(() => {});
void flush().catch(() => {});

const MAX_HAS_IDS = 100;

const ACCOUNT_RE = /^\d{1,25}$/;
const accountOf = (v: unknown) => (typeof v === 'string' && ACCOUNT_RE.test(v) ? v : undefined);

async function handle(msg: Msg): Promise<Reply<unknown>> {
  switch (msg.type) {
    case 'pro:get':
      return { ok: true, data: await getPro(false) };
    case 'pro:refresh':
      return { ok: true, data: await getPro(true) };
    case 'pro:activate': {
      const r = await activate(msg.key);
      return r.ok ? { ok: true, data: r.view } : { ok: false, error: r.error };
    }
    case 'pro:logout': {
      const r = await logout();
      return r.ok ? { ok: true, data: r.view } : { ok: false, error: r.error };
    }
    case 'capture:posts': {
      const capture = sanitizeCapture(msg.capture);
      if (!capture) return { ok: false, error: 'bad_capture' };
      const { archive } = await getSettings();
      if (!archive) return { ok: true, data: { stored: 0, bookmarks: 0, disabled: true } };
      const r = await applyCapture(capture);
      return { ok: true, data: { ...r, disabled: false } };
    }
    case 'saved:has': {
      if (!Array.isArray(msg.ids) || msg.ids.length > MAX_HAS_IDS || !msg.ids.every(isPostId)) return { ok: false, error: 'bad_ids' };
      return { ok: true, data: { ids: await hasSaved(msg.ids) } };
    }
    case 'thread:get': {
      if (!isPostId(msg.id)) return { ok: false, error: 'bad_id' };
      const r = await fetchThread(msg.id);
      const list = r.body && typeof r.body === 'object' && Array.isArray((r.body as { tweets?: unknown }).tweets) ? ((r.body as { tweets: unknown[] }).tweets) : null;
      const tweets = list ? list.slice(0, 200).map(t => sanitizeTweet(t)).filter((t): t is NonNullable<typeof t> => !!t) : null;
      return { ok: true, data: { status: r.status === 200 && !tweets?.length ? 404 : r.status, tweets: tweets?.length ? tweets : null } };
    }
    case 'event:track':
      return { ok: true, data: { queued: await track(msg.event) } };
    case 'lang:set': {
      if (!isLang(msg.lang)) return { ok: false, error: 'bad_lang' };
      const prev = (await chrome.storage.local.get(LANG_KEY))[LANG_KEY];
      if (prev !== msg.lang) await chrome.storage.local.set({ [LANG_KEY]: msg.lang });
      return { ok: true, data: { lang: msg.lang, changed: prev !== msg.lang } };
    }
    case 'saved:list': {
      const cursor = typeof msg.cursor === 'number' && Number.isInteger(msg.cursor) && msg.cursor >= 0 ? msg.cursor : 0;
      const filter = msg.filter === 'removed' ? 'removed' : 'all';
      return { ok: true, data: await listSaved(cursor, filter, accountOf(msg.accountId)) };
    }
    case 'saved:get':
      if (!isPostId(msg.id)) return { ok: false, error: 'bad_id' };
      return { ok: true, data: await getSaved(msg.id) };
    case 'saved:delete': {
      if (!Array.isArray(msg.ids) || !msg.ids.length || msg.ids.length > MAX_DELETE_IDS || !msg.ids.every(isPostId)) return { ok: false, error: 'bad_ids' };
      return { ok: true, data: { deleted: await deleteSaved(msg.ids) } };
    }
    case 'saved:status':
      return { ok: true, data: await savedStatus((await getSettings()).archive, accountOf(msg.accountId)) };
    case 'saved:clear':
      await clearAll();
      return { ok: true, data: { cleared: true } };
    case 'saved:export':
      return { ok: true, data: await exportAll() };
    case 'settings:get':
      return { ok: true, data: await getSettings() };
    case 'settings:set':
      return { ok: true, data: await setSettings(msg.settings) };
    default:
      return { ok: false, error: 'unknown_type' };
  }
}

chrome.runtime.onMessage.addListener((raw, sender, sendResponse) => {
  const msg = raw as Msg;
  if (!msg || typeof msg !== 'object' || !MSG_TYPES.includes(msg.type)) return false;
  if (!isAllowed(msg.type, sender, chrome.runtime.id, XT_ORIGIN)) {
    sendResponse({ ok: false, error: 'forbidden' });
    return false;
  }
  handle(msg).then(sendResponse, err => sendResponse({ ok: false, error: String(err?.name || 'error').slice(0, 40) }));
  return true; // async reply
});
