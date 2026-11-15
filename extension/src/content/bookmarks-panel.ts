/**
 * The bookmarks panel on X's bookmarks list (docs/chrome-extension-plan.md, A4, B4, M2): x.com/i/bookmarks,
 * or x.com/i/history with its Bookmarks tab selected (X now redirects /i/bookmarks there; anchors.ts).
 *
 * On that page it shows a small "Export bookmarks" button at the bottom corner (Shadow DOM), with a × that
 * hides it for the browser session (chrome.storage.session through deps, never X's storage). A click opens
 * the panel: "Scan bookmarks" scrolls the page slowly so X loads the whole list, while content/index.ts
 * archives every Bookmarks answer X sends. Stop rules: scan.ts. When it ends, "Export on Xtracticle" opens
 * /saved, where the free / Pro limit is applied (one info line here for free users). The site's "Export
 * bookmarks" link (#xt-export) opens the panel at once, but the button no longer depends on the hash
 * (X's redirect to /i/history drops it). The extension sends no request to X: it only scrolls.
 */
import { countBucket } from '../../../src/shared/events';
import { MARK_SVG } from '../../../src/shared/brand';
import { XT_BASE } from '../config';
import { fill } from '../lang';
import { savedUrl } from '../links';
import { send } from '../messages';
import { atBottom, newScan, nextDelay, onResponse, onStep, stepPixels, userStop, type ScanResponse, type ScanState, type StopReason, type ScrollPos } from './scan';
import { bookmarksPageKind, historyTabOf } from './anchors';
import { L, createHost, el, lang_, onLang } from './ui';

export const EXPORT_HASH = '#xt-export';

const CSS = `
.p { position: relative; overflow: hidden; }
.bar { position: absolute; inset-block-start: 0; inset-inline: 0; height: 2px; background: var(--border); overflow: hidden; }
.bar[hidden] { display: none; }
.bar i { position: absolute; inset-block: 0; inset-inline-start: 0; width: 100%; background: var(--accent); opacity: .55; }
.sub { margin: -4px 0 10px; font-size: 12px; color: var(--text-secondary); font-variant-numeric: tabular-nums; }
.sub[hidden] { display: none; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex: none; }
.dot[hidden] { display: none; }
@media (prefers-reduced-motion: no-preference) {
  .bar i { width: 35%; opacity: 1; animation: xt-slide 1.6s ease-in-out infinite; }
  .dot { animation: xt-pulse 1.4s ease-in-out infinite; }
}
@keyframes xt-slide { from { transform: translateX(-100%); } to { transform: translateX(290%); } }
@keyframes xt-pulse { 50% { opacity: .35; } }
:host { position: fixed; inset-block-end: 20px; inset-inline-end: 20px; z-index: 2147483000; }
.p {
  width: 288px; max-width: calc(100vw - 40px); padding: 14px 16px 14px;
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  background: var(--xt-surface); color: var(--text-primary);
  box-shadow: 0 6px 24px rgba(0,0,0,.14); font-size: 14px; line-height: 1.35;
}
.h { display: flex; align-items: center; gap: 8px; margin-block-end: 10px; }
.m { display: inline-flex; width: 22px; height: 22px; border-radius: 6px; align-items: center; justify-content: center; background: var(--accent); color: var(--bg-primary); }
.m svg { width: 14px; height: 14px; }
.t { font-weight: 600; font-size: 14px; }
.x { margin-inline-start: auto; width: 28px; height: 28px; border: 0; border-radius: 999px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 18px; line-height: 1; }
.x:hover { background: var(--xt-hover); }
.info { color: var(--text-secondary); font-size: 12.5px; margin: 0 0 10px; }
.count { font-variant-numeric: tabular-nums; font-size: 13px; margin: 0 0 10px; color: var(--text-secondary); }
.count:empty { display: none; }
.count.err { color: var(--error-text); }
.row { display: flex; gap: 8px; flex-wrap: wrap; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 14px;
  border-radius: 999px; border: 1px solid var(--border); background: transparent; cursor: pointer;
  font-weight: 600; font-size: 13.5px; text-decoration: none; color: var(--text-primary);
}
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--bg-primary); }
.btn:hover { filter: brightness(0.96); }
.btn[hidden] { display: none; }
.p[hidden], .pill[hidden] { display: none; }
.pill {
  display: inline-flex; align-items: center; gap: 2px; padding: 3px; border-radius: 999px;
  border: 1px solid var(--border); background: var(--xt-surface); color: var(--text-primary);
  box-shadow: 0 4px 16px rgba(0,0,0,.12);
}
.open { display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 12px 0 4px; border: 0; border-radius: 999px; background: transparent; cursor: pointer; font-weight: 600; font-size: 13.5px; }
.open:hover { background: var(--xt-hover); }
.pill .x { width: 26px; height: 26px; font-size: 16px; margin: 0; }
`;

export interface BookmarksPanelDeps {
  isPro: () => Promise<boolean>;
  /** The × on the button hides it for the browser session (chrome.storage.session; memory when unavailable). */
  dismissed: { get: () => Promise<boolean>; set: (v: boolean) => Promise<void> };
  /** The signed-in account (twid cookie); null = unknown, then the scan never stops as up to date. */
  account?: () => string | null;
  /** The page was first opened with #xt-export (read at document_start, before a redirect drops the hash). */
  openedForExport?: boolean;
}

export function startBookmarksPanel(deps: BookmarksPanelDeps) {
  let h: ReturnType<typeof createHost> | null = null;
  let parts: {
    panel: HTMLElement; pill: HTMLElement; dot: HTMLElement; bar: HTMLElement; sub: HTMLElement; elapsed: HTMLElement; step: HTMLElement; openLabel: HTMLElement; open: HTMLButtonElement; dismiss: HTMLButtonElement;
    title: HTMLElement; info: HTMLElement; count: HTMLElement; scan: HTMLButtonElement; stop: HTMLButtonElement; exp: HTMLAnchorElement; close: HTMLButtonElement;
  } | null = null;
  let state: ScanState | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  /** null until the session flag is read. */
  let dismissed: boolean | null = null;
  /** The panel is open (else only the small button shows). */
  let expanded = false;
  let wantOpen = !!deps.openedForExport;
  let pro = false;
  void deps.dismissed.get().then(
    v => {
      dismissed = dismissed ?? v;
      route();
    },
    () => {
      dismissed = dismissed ?? false;
      route();
    },
  );
  /** Bookmark ids X loaded on this page so far (the scan starts from them). */
  let pageSeen = new Set<string>();

  function build() {
    h = createHost('xt-bookmarks', CSS);
    const pill = el('div', { class: 'pill', role: 'region' });
    const open = el('button', { class: 'open', type: 'button', 'aria-expanded': 'false' });
    const dot = el('span', { class: 'dot', 'aria-hidden': 'true', hidden: '' });
    const pillMark = el('span', { class: 'm', 'aria-hidden': 'true' });
    pillMark.innerHTML = MARK_SVG(14);
    const openLabel = el('span', { class: 'ol' });
    open.append(pillMark, dot, openLabel);
    const dismiss = el('button', { class: 'x', type: 'button' }, '×');
    pill.append(open, dismiss);
    const p = el('section', { class: 'p', role: 'region', hidden: '' });
    const head = el('div', { class: 'h' });
    const mark = el('span', { class: 'm', 'aria-hidden': 'true' });
    mark.innerHTML = MARK_SVG(14);
    const title = el('span', { class: 't' });
    const close = el('button', { class: 'x', type: 'button' }, '×');
    head.append(mark, title, close);
    const info = el('p', { class: 'info' });
    const count = el('p', { class: 'count', role: 'status', 'aria-live': 'polite' });
    // Elapsed time is aria-hidden (a per-second update must not be read out); the step text is not live either.
    const sub = el('p', { class: 'sub', hidden: '' });
    const elapsed = el('span', { 'aria-hidden': 'true' });
    const step = el('span', { class: 'st' });
    sub.append(elapsed, ' · ', step);
    const bar = el('div', { class: 'bar', role: 'progressbar', 'aria-busy': 'true', hidden: '' });
    bar.append(el('i'));
    const row = el('div', { class: 'row' });
    const scan = el('button', { class: 'btn primary', type: 'button' });
    const stop = el('button', { class: 'btn', type: 'button', hidden: '' });
    const exp = el('a', { class: 'btn', target: '_blank', rel: 'noopener', hidden: '' });
    row.append(scan, stop, exp);
    p.append(bar, head, info, count, sub, row);
    h.root.append(pill, p);
    parts = { panel: p, pill, dot, bar, sub, elapsed, step, openLabel, open, dismiss, title, info, count, scan, stop, exp, close };
    scan.addEventListener('click', start);
    stop.addEventListener('click', () => finish(userStop(state!)));
    exp.addEventListener('click', () => void send({ type: 'event:track', event: { name: 'saved_open' } }));
    open.addEventListener('click', () => {
      setExpanded(true);
      parts?.scan.focus();
    });
    // × on the open panel folds it back into the button; × on the button hides it for this browser session.
    close.addEventListener('click', () => {
      // A running scan goes on while folded: the button shows it (dot and count).
      setExpanded(false);
      parts?.open.focus();
    });
    dismiss.addEventListener('click', () => {
      dismissed = true;
      void deps.dismissed.set(true).catch(() => {});
      hide();
    });
    // Keys typed in the panel must not reach X's shortcuts.
    for (const n of [p, pill]) n.addEventListener('keydown', e => e.stopPropagation());
    label();
    document.documentElement.appendChild(h.host);
  }

  function label() {
    if (!parts) return;
    parts.title.textContent = L().exportBookmarks;
    parts.openLabel.textContent = L().exportBookmarks;
    parts.pill.setAttribute('aria-label', L().exportBookmarks);
    parts.panel.setAttribute('aria-label', L().exportBookmarks);
    parts.close.setAttribute('aria-label', L().close);
    parts.bar.setAttribute('aria-label', L().scanning.replace('{n}', '').replace(/…\s*$/, '').trim());
    parts.dismiss.setAttribute('aria-label', L().close);
    parts.info.textContent = L().freeLimit;
    parts.info.hidden = pro;
    parts.scan.textContent = L().scanBookmarks;
    parts.stop.textContent = L().stop;
    parts.exp.textContent = L().exportOnSite;
    parts.exp.href = savedUrl(XT_BASE, lang_(), 'bookmarks_panel');
    render();
  }

  function message(): { text: string; err: boolean } {
    if (!state) return { text: '', err: false };
    const n = state.seen.size;
    if (state.running) return { text: document.hidden ? L().scanPaused : fill(L().scanning, { n }), err: false };
    const by: Record<StopReason, { text: string; err: boolean }> = {
      end: { text: fill(L().scanDone, { n }), err: false },
      uptodate: { text: fill(L().upToDate, { n }), err: false },
      user: { text: fill(L().scanStopped, { n }), err: false },
      limit: { text: fill(L().scanLimit, { n }), err: false },
      throttled: { text: L().slowedDown, err: true },
      format: { text: L().formatChanged, err: true },
    };
    return by[state.stopped || 'user'];
  }

  function render() {
    if (!parts) return;
    const m = message();
    parts.count.textContent = m.text;
    parts.count.classList.toggle('err', m.err);
    const running = !!state?.running;
    parts.scan.hidden = running;
    parts.stop.hidden = !running;
    parts.exp.hidden = !state || running || state.stopped === 'format';
    parts.exp.classList.toggle('primary', !!state && !running);
    parts.scan.classList.toggle('primary', !state || running);
    parts.bar.hidden = !running;
    parts.sub.hidden = !running;
    parts.dot.hidden = !running;
    parts.openLabel.textContent = running ? fill(L().scanPill, { n: state!.seen.size }) : L().exportBookmarks;
    if (running) {
      const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      parts.elapsed.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      parts.step.textContent = stepText();
    }
  }

  /** What the scan is doing right now, in words. */
  function stepText(): string {
    if (document.hidden) return L().scanPaused;
    if (Date.now() - lastNewAt > SLOW_MS) return L().scanSlow;
    return state && state.idle > 0 ? L().scanStepWait : L().scanStepScroll;
  }

  function setExpanded(v: boolean) {
    expanded = v;
    if (!parts) return;
    parts.panel.hidden = !v;
    parts.pill.hidden = v;
    parts.open.setAttribute('aria-expanded', String(v));
  }

  let showing = false;
  async function show() {
    if (!h) build();
    if (parts && parts.panel.hidden === expanded) setExpanded(expanded);
    if (showing) return;
    showing = true;
    h!.host.hidden = false;
    pro = await deps.isPro().catch(() => false);
    label();
  }
  const hide = () => {
    showing = false;
    if (h) h.host.hidden = true;
  };

  /* ─── Scanning ─── */

  const SLOW_MS = 10000;
  let startedAt = 0;
  /** When the last bookmark id new to this scan arrived (ms). */
  let lastNewAt = 0;
  let lastSeen = 0;
  let ticker: ReturnType<typeof setInterval> | null = null;
  let starting = false;
  async function start() {
    if (starting || state?.running) return;
    starting = true;
    try {
      // 'Up to date' needs proof that an earlier scan of this account reached the end of the list.
      const acc = deps.account?.() ?? null;
      const r = acc ? await send({ type: 'scan:state', accountId: acc }) : null;
      const incremental = !!(r && r.ok && r.data.fullScanAt);
      state = newScan(pageSeen, incremental);
    } finally {
      starting = false;
    }
    startedAt = lastNewAt = Date.now();
    lastSeen = state.seen.size;
    if (ticker) clearInterval(ticker);
    ticker = setInterval(render, 1000); // elapsed time and step text
    render();
    tick();
  }

  function tick() {
    if (!state?.running) return;
    if (document.hidden) {
      render();
      return; // resumes on visibilitychange
    }
    const pos: ScrollPos = { y: scrollY, viewport: innerHeight, height: document.documentElement.scrollHeight };
    state = onStep(state, { bottom: atBottom(pos), now: Date.now() });
    if (!state.running) return finish(state);
    const by = stepPixels(pos, Math.random());
    if (by > 0) window.scrollBy({ top: by, behavior: 'smooth' });
    render();
    timer = setTimeout(tick, nextDelay(Math.random()));
  }

  function finish(s: ScanState) {
    state = s;
    if (ticker) clearInterval(ticker);
    ticker = null;
    if (timer) clearTimeout(timer);
    timer = null;
    render();
    const acc = deps.account?.() ?? null;
    if (s.stopped === 'end' && acc) void send({ type: 'scan:done', accountId: acc });
    void send({ type: 'event:track', event: { name: 'bookmarks_capture', param: countBucket(s.seen.size) } });
  }

  document.addEventListener('visibilitychange', () => {
    if (!state?.running) return;
    if (document.hidden) {
      if (timer) clearTimeout(timer);
      timer = null;
      render();
    } else if (!timer) {
      render();
      timer = setTimeout(tick, nextDelay(Math.random()));
    }
  });

  onLang(label);

  /** content/index.ts: a listened Bookmarks answer (or a throttled status) arrived. */
  function onBookmarksResponse(r: ScanResponse) {
    if (r.status === undefined && pageSeen.size < 5000) r.ids.forEach(id => pageSeen.add(id));
    if (!sawAnswer) {
      sawAnswer = true;
      route();
    }
    if (!state?.running) return;
    const next = onResponse(state, r);
    if (next.seen.size > lastSeen) {
      lastSeen = next.seen.size;
      lastNewAt = Date.now();
    }
    if (!next.running) finish(next);
    else {
      state = next;
      render();
    }
  }

  let lastPath: string | null = null;
  let lastTab: ReturnType<typeof historyTabOf> | null = null;
  /** A Bookmarks answer arrived since this path was entered (x.com/i/history before its tabs render). */
  let sawAnswer = false;
  /** The URL whose #xt-export was already acted on (the timer must not reopen the panel every tick). */
  let hashHref = '';

  /** Whether the bookmarks list is on screen now. Cheap: called on every SPA navigation and every 400 ms. */
  function onList(): boolean {
    const path = location.pathname;
    const kind = bookmarksPageKind(path);
    if (path !== lastPath) {
      // Another page or bookmarks folder: X reloads the list, count afresh.
      if (!state?.running) pageSeen = new Set();
      sawAnswer = false;
      lastPath = path;
      lastTab = null;
    }
    if (kind === 'bookmarks') return true;
    if (kind !== 'history') return false;
    const tab = historyTabOf(document, path);
    // Back from the Likes tab: X loads the bookmarks list again.
    if (tab === 'bookmarks' && lastTab === 'other' && !state?.running) pageSeen = new Set();
    if (tab !== 'unknown') lastTab = tab;
    return tab === 'bookmarks' || (tab === 'unknown' && sawAnswer);
  }

  /** Called on start, on every SPA navigation and on a timer (the History tabs switch without a navigation). */
  function route() {
    const on = onList();
    if (!on) {
      if (state?.running) finish(userStop(state));
      if (showing) hide();
      expanded = false;
      return;
    }
    if (location.hash === EXPORT_HASH && location.href !== hashHref) {
      hashHref = location.href;
      wantOpen = true;
    }
    if (wantOpen) {
      wantOpen = false;
      dismissed = false;
      void deps.dismissed.set(false).catch(() => {});
      expanded = true;
    }
    if (dismissed === null || dismissed) {
      if (showing) hide();
      return;
    }
    void show();
  }

  return { route, onBookmarksResponse, restyle: () => h?.restyle(), running: () => !!state?.running };
}
