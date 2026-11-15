/**
 * The bookmarks panel on x.com/i/bookmarks (docs/chrome-extension-plan.md, A4, B4, M2).
 *
 * A compact panel at the bottom corner (Shadow DOM): "Scan bookmarks" scrolls the page slowly so X loads
 * the whole list, while content/index.ts archives every Bookmarks answer X sends. Stop rules: scan.ts.
 * When it ends, "Export on Xtracticle" opens /saved, where the free / Pro limit is applied (one info line
 * here for free users). It opens by itself when the URL hash is #xt-export (the site's "Export bookmarks").
 * The extension sends no request to X: it only scrolls.
 */
import { countBucket } from '../../../src/shared/events';
import { MARK_SVG } from '../../../src/shared/brand';
import { XT_BASE } from '../config';
import { fill } from '../lang';
import { savedUrl } from '../links';
import { send } from '../messages';
import { newScan, nextDelay, onResponse, onStep, stepPixels, userStop, type ScanResponse, type ScanState, type StopReason } from './scan';
import { L, createHost, el, lang_, onLang, openTab } from './ui';

export const EXPORT_HASH = '#xt-export';
export const isBookmarksPath = (p: string) => /^\/i\/bookmarks(?:\/|$)/.test(p);

const CSS = `
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
`;

export interface BookmarksPanelDeps {
  isPro: () => Promise<boolean>;
}

export function startBookmarksPanel(deps: BookmarksPanelDeps) {
  let h: ReturnType<typeof createHost> | null = null;
  let parts: { title: HTMLElement; info: HTMLElement; count: HTMLElement; scan: HTMLButtonElement; stop: HTMLButtonElement; exp: HTMLAnchorElement; close: HTMLButtonElement } | null = null;
  let state: ScanState | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let dismissed = false;
  let pro = false;
  /** Bookmark ids X loaded on this page so far (the scan starts from them). */
  let pageSeen = new Set<string>();

  function build() {
    h = createHost('xt-bookmarks', CSS);
    const p = el('section', { class: 'p', role: 'region', 'aria-label': L().exportBookmarks });
    const head = el('div', { class: 'h' });
    const mark = el('span', { class: 'm', 'aria-hidden': 'true' });
    mark.innerHTML = MARK_SVG(14);
    const title = el('span', { class: 't' });
    const close = el('button', { class: 'x', type: 'button' }, '×');
    head.append(mark, title, close);
    const info = el('p', { class: 'info' });
    const count = el('p', { class: 'count', role: 'status', 'aria-live': 'polite' });
    const row = el('div', { class: 'row' });
    const scan = el('button', { class: 'btn primary', type: 'button' });
    const stop = el('button', { class: 'btn', type: 'button', hidden: '' });
    const exp = el('a', { class: 'btn', target: '_blank', rel: 'noopener', hidden: '' });
    row.append(scan, stop, exp);
    p.append(head, info, count, row);
    h.root.appendChild(p);
    parts = { title, info, count, scan, stop, exp, close };
    scan.addEventListener('click', start);
    stop.addEventListener('click', () => finish(userStop(state!)));
    exp.addEventListener('click', () => void send({ type: 'event:track', event: { name: 'saved_open' } }));
    close.addEventListener('click', () => {
      dismissed = true;
      if (state?.running) finish(userStop(state));
      hide();
    });
    // Keys typed in the panel must not reach X's shortcuts.
    p.addEventListener('keydown', e => e.stopPropagation());
    label();
    document.documentElement.appendChild(h.host);
  }

  function label() {
    if (!parts) return;
    parts.title.textContent = L().exportBookmarks;
    parts.close.setAttribute('aria-label', L().close);
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
  }

  async function show() {
    if (!h) build();
    h!.host.hidden = false;
    pro = await deps.isPro().catch(() => false);
    label();
  }
  const hide = () => h && (h.host.hidden = true);

  /* ─── Scanning ─── */

  function start() {
    state = newScan(pageSeen);
    render();
    tick();
  }

  function tick() {
    if (!state?.running) return;
    if (document.hidden) {
      render();
      return; // resumes on visibilitychange
    }
    state = onStep(state);
    if (!state.running) return finish(state);
    window.scrollBy({ top: stepPixels(innerHeight), behavior: 'smooth' });
    render();
    timer = setTimeout(tick, nextDelay(Math.random()));
  }

  function finish(s: ScanState) {
    state = s;
    if (timer) clearTimeout(timer);
    timer = null;
    render();
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
    if (!state?.running) return;
    const next = onResponse(state, r);
    if (!next.running) finish(next);
    else {
      state = next;
      render();
    }
  }

  let lastOnPage = isBookmarksPath(location.pathname);
  let lastPath = location.pathname;
  /** Called on start and on every SPA navigation. */
  function route() {
    const onPage = isBookmarksPath(location.pathname);
    if (onPage !== lastOnPage || (onPage && location.pathname !== lastPath)) {
      // Another bookmarks folder or a new visit: start counting afresh (X reloads the list).
      if (!state?.running) pageSeen = new Set();
      lastPath = location.pathname;
    }
    lastOnPage = onPage;
    if (!onPage) {
      if (state?.running) finish(userStop(state));
      hide();
      return;
    }
    if (location.hash === EXPORT_HASH) dismissed = false;
    if (!dismissed) void show();
  }

  return { route, onBookmarksResponse, restyle: () => h?.restyle(), running: () => !!state?.running };
}
