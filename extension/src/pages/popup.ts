/**
 * Toolbar popup (plain HTML + TS, no React; docs/chrome-extension-plan.md, A2, B2).
 *
 *   Pro         status from the SW (pro:get); key field + Activate (pro:activate) and "What is Pro?" when free,
 *               Sign out (pro:logout) when Pro. The key goes to the site only; the extension never stores it.
 *   This post   when the active tab is a post on x.com: asks that tab's content script for the Markdown
 *               (chrome.tabs.sendMessage needs no `tabs` permission; the tab URL is visible through the
 *               x.com host permission).
 *   Archive     switch (settings.archive), counts (saved:status), Open saved posts (/saved), JSON backup
 *               (saved:export, blob download), Delete all with a confirmation step in the popup.
 *   First open  one-line notice that the local archive is on (owner decision 4), with a dismiss button.
 *   Counter     switch for the anonymous counters (settings.counter).
 * Strings: src/i18n.ts extText, in the site's language (chrome.storage.local.lang) or the browser's.
 */
import { DARK, LIGHT, RADIUS, cssVars, MARK_SVG } from '../../../src/shared/brand';
import type { Lang } from '../../../src/shared/bridge';
import { XT_BASE } from '../config';
import { currentLang, fill, stringsFor } from '../lang';
import { parseStatusUrl, proUrl, savedUrl } from '../links';
import { send, type ProView, type Settings } from '../messages';

(async () => {
  const style = document.createElement('style');
  style.textContent =
    `:root { ${cssVars(LIGHT)} --radius-sm: ${RADIUS.sm}; --radius-md: ${RADIUS.md}; --radius-lg: ${RADIUS.lg}; }` +
    `@media (prefers-color-scheme: dark) { :root { ${cssVars(DARK)} color-scheme: dark; } }`;
  document.head.appendChild(style);

  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const text = (id: string, s: string) => void ($(id).textContent = s);

  $('xt-logo').innerHTML = MARK_SVG(18);
  text('xt-version', chrome.runtime.getManifest().version);

  const lang: Lang = await currentLang();
  const t = stringsFor(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  /* ─── Static labels ─── */
  text('notice-text', t.archiveNotice);
  text('notice-ok', t.gotIt);
  text('pro-on-label', t.proActive);
  text('signout', t.signOut);
  text('free-label', t.freePlan);
  text('pro-link', t.whatIsPro);
  $<HTMLAnchorElement>('pro-link').href = proUrl(XT_BASE, lang, 'popup');
  text('key-label', t.enterKey);
  $<HTMLInputElement>('key').placeholder = t.enterKey;
  text('activate', t.activate);
  text('save-this', t.saveThis);
  text('archive-label', t.localArchive);
  text('open-saved', t.openSavedList);
  $<HTMLAnchorElement>('open-saved').href = savedUrl(XT_BASE, lang, 'popup');
  text('export', t.exportJson);
  text('delete', t.deleteAll);
  text('confirm-text', t.confirmDelete);
  text('confirm-yes', t.deleteAll);
  text('confirm-no', t.cancel);
  text('counter-label', t.counter);

  const track = (name: string, param?: string) => void send({ type: 'event:track', event: param ? { name, param } : { name } });
  $('pro-link').addEventListener('click', () => track('pro_nav_click'));
  $('open-saved').addEventListener('click', () => track('saved_open'));

  /* ─── Pro ─── */
  const showPro = (v: ProView) => {
    $('pro-on').hidden = !v.pro;
    $('pro-off').hidden = v.pro;
    if (v.pro && v.plan) text('pro-on-label', `${t.proActive} · ${v.plan}`);
  };
  const keyError = (s: string) => {
    const e = $('key-error');
    e.textContent = s;
    e.hidden = !s;
  };

  $('pro-off').addEventListener('submit', async e => {
    e.preventDefault();
    const input = $<HTMLInputElement>('key');
    const key = input.value.trim();
    if (!key) return input.focus();
    const btn = $<HTMLButtonElement>('activate');
    btn.disabled = true;
    btn.textContent = t.checking;
    keyError('');
    const r = await send({ type: 'pro:activate', key });
    btn.disabled = false;
    btn.textContent = t.activate;
    if (r.ok && r.data.pro) {
      input.value = '';
      showPro(r.data);
    } else keyError(!r.ok && (r.error === 'network' || r.error === 'unreachable' || r.error === 'no_reply') ? t.networkError : t.keyError);
  });

  $('signout').addEventListener('click', async () => {
    const b = $<HTMLButtonElement>('signout');
    b.disabled = true;
    const r = await send({ type: 'pro:logout' });
    b.disabled = false;
    if (r.ok) showPro(r.data);
  });

  /* ─── Archive ─── */
  const refreshCounts = async () => {
    const s = await send({ type: 'saved:status' });
    if (!s.ok) return;
    text('counts', fill(t.savedCount, { n: s.data.posts }));
    text('counts-bm', fill(t.bookmarkCount, { b: s.data.bookmarks, u: s.data.unavailable }));
  };

  const applySettings = (s: Settings) => {
    $<HTMLInputElement>('archive').checked = s.archive;
    $<HTMLInputElement>('counter').checked = s.counter;
    $('notice').hidden = s.noticeSeen;
  };

  $('archive').addEventListener('change', async () => {
    const r = await send({ type: 'settings:set', settings: { archive: $<HTMLInputElement>('archive').checked } });
    if (r.ok) applySettings(r.data);
    void refreshCounts();
  });
  $('counter').addEventListener('change', async () => {
    const r = await send({ type: 'settings:set', settings: { counter: $<HTMLInputElement>('counter').checked } });
    if (r.ok) applySettings(r.data);
  });
  $('notice-ok').addEventListener('click', async () => {
    $('notice').hidden = true;
    await send({ type: 'settings:set', settings: { noticeSeen: true } });
  });

  $('export').addEventListener('click', async () => {
    const r = await send({ type: 'saved:export' });
    if (!r.ok) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `xtracticle-archive-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  });

  $('delete').addEventListener('click', () => {
    $('confirm').hidden = false;
    $('deleted').hidden = true;
    $('confirm-no').focus();
  });
  $('confirm-no').addEventListener('click', () => {
    $('confirm').hidden = true;
    $('delete').focus();
  });
  $('confirm-yes').addEventListener('click', async () => {
    const r = await send({ type: 'saved:clear' });
    $('confirm').hidden = true;
    if (r.ok) {
      text('deleted', t.deleted);
      $('deleted').hidden = false;
    }
    void refreshCounts();
  });

  /* ─── This post (fallback when the Save button could not be placed) ─── */
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const post = tab?.url ? parseStatusUrl(tab.url) : null;
    if (tab?.id !== undefined && post) {
      $('this-post').hidden = false;
      $('save-this').addEventListener('click', async () => {
        const err = $('save-error');
        err.hidden = true;
        const b = $<HTMLButtonElement>('save-this');
        b.disabled = true;
        b.textContent = t.preparing;
        let r: { ok?: boolean; error?: string } | undefined;
        try {
          r = await chrome.tabs.sendMessage(tab.id!, { type: 'xt:save-current' });
        } catch {
          r = { ok: false };
        }
        b.disabled = false;
        b.textContent = t.saveThis;
        if (!r?.ok) {
          err.textContent = r?.error && r.error.length > 20 ? r.error : t.failed;
          err.hidden = false;
        }
      });
    }
  } catch {
    /* no active tab info */
  }

  /* ─── Load ─── */
  const [settings, pro] = await Promise.all([send({ type: 'settings:get' }), send({ type: 'pro:get' })]);
  if (settings.ok) applySettings(settings.data);
  showPro(pro.ok ? pro.data : { pro: false, plan: null, checkedAt: null, offline: true });
  void refreshCounts();
})();
