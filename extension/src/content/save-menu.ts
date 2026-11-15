/**
 * The Save menu on every post (docs/chrome-extension-plan.md, A4, M1).
 *
 *   button   one small mark button at the end of each post's action bar, in its own Shadow DOM, sized and
 *            coloured like X's own action buttons (light / dim / dark)
 *   menu     one shared popover menu (top layer, so X's overflow never clips it), role=menu with arrow keys,
 *            Home / End, Escape and focus back to the button
 *   items    Download Markdown · Copy Markdown (in place, the site's own convert.ts: same file name and bytes)
 *            PDF · EPUB · ZIP · Open on Xtracticle (the post page on the site, `#dl=<fmt>` runs the download)
 *            Open saved copy (only when the archive has this post)
 *
 * Content comes from the site (`GET /api/thread/:id` through the SW). A 404 (protected / not public) falls back
 * to the copy X itself loaded on this tab (the last TweetDetail answer, RecentPosts); without one the menu says
 * so. Posts are found with the selectors in anchors.ts; a MutationObserver adds buttons to new posts at most
 * once per animation frame and never twice to the same post.
 */
import { buildDoc, fileBaseName, frontMatter } from '../../../src/shared/convert';
import type { FxTweet } from '../../../src/shared/fx';
/* Outline "save to device" glyph. Not the brand mark: the mark is bookmark-shaped
 * and would sit right next to X's own bookmark button in the action bar. */
const SAVE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M12 3.5v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/></svg>';
import { langInfo, translations } from '../../../src/i18n';
import { XT_BASE } from '../config';
import { parseStatusUrl, savedUrl, statusUrl, type OpenFormat } from '../links';
import { send } from '../messages';
import { MARK, actionBarOf, articlesWithoutButton, permalinkOf } from './anchors';
import type { RecentPosts } from './capture';
import { L, copyText, createHost, el, lang_, onLang, openTab, saveText, type Host } from './ui';

export interface SaveMenuDeps {
  recent: RecentPosts;
  account: () => string | null;
  enabled: () => boolean;
}

type Target = { handle: string; id: string; trigger: HTMLButtonElement | null };

const BUTTON_CSS = `
:host { display: inline-flex; align-items: center; }
.b {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; padding: 0; margin: 0; border: 0; border-radius: 999px;
  background: transparent; color: var(--xt-icon); cursor: pointer;
  transition: background-color .15s, color .15s;
}
.b:hover { background: var(--xt-hover); color: var(--text-primary); }
.b[aria-expanded="true"] { color: var(--text-primary); }
.b svg { width: 18px; height: 18px; display: block; }
`;

const MENU_CSS = `
[popover] {
  position: fixed; inset: auto; margin: 0; padding: 6px; min-width: 232px; max-width: min(320px, calc(100vw - 16px));
  border: 1px solid var(--border); border-radius: var(--radius-md);
  background: var(--xt-surface); color: var(--text-primary);
  box-shadow: 0 8px 28px rgba(0,0,0,.18); font-size: 14px; line-height: 1.3;
}
[role="menu"] { display: flex; flex-direction: column; }
[role="menuitem"] {
  display: flex; align-items: center; gap: 10px; width: 100%; text-align: start;
  padding: 9px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; cursor: pointer;
}
[role="menuitem"]:hover, [role="menuitem"]:focus { background: var(--xt-hover); outline: none; }
[role="menuitem"]:focus-visible { outline: 2px solid var(--text-primary); outline-offset: -2px; }
[role="menuitem"][aria-disabled="true"] { opacity: .5; cursor: default; }
.hint { margin-inline-start: auto; color: var(--text-tertiary); font-size: 12px; }
hr { border: 0; border-top: 1px solid var(--border); margin: 6px 4px; }
.status { padding: 6px 10px 4px; color: var(--text-secondary); font-size: 12.5px; }
.status:empty { display: none; }
.status.err { color: var(--error-text); }
@media (prefers-reduced-motion: no-preference) {
  [popover] { opacity: 0; translate: 0 -4px; transition: opacity .12s, translate .12s, display .12s allow-discrete, overlay .12s allow-discrete; }
  [popover]:popover-open { opacity: 1; translate: 0 0; }
  @starting-style { [popover]:popover-open { opacity: 0; translate: 0 -4px; } }
}
`;

export function startSaveMenu(deps: SaveMenuDeps) {
  const hosts = new Set<Host>();
  let menu: ReturnType<typeof buildMenu> | null = null;

  /* ─── Buttons ─── */

  function addButton(article: HTMLElement) {
    const bar = actionBarOf(article);
    const href = permalinkOf(article);
    const post = href ? parseStatusUrl(href) : null;
    if (!bar || !post) return;
    const slot = document.createElement('div');
    slot.setAttribute(MARK.slot, post.id);
    slot.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;flex:0 0 auto;';
    const h = createHost('xt-save', BUTTON_CSS);
    const b = el('button', { class: 'b', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': L().saveLabel, title: L().saveLabel });
    b.innerHTML = SAVE_ICON;
    b.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation(); // the post itself is a link: the click must not open it
      ensureMenu().toggle({ ...post, trigger: b }, e.detail === 0);
    });
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        ensureMenu().open({ ...post, trigger: b }, true);
      }
    });
    h.root.appendChild(b);
    slot.appendChild(h.host);
    bar.appendChild(slot);
    hosts.add(h);
  }

  let queued = false;
  const scan = () => {
    queued = false;
    if (!deps.enabled()) return;
    for (const a of articlesWithoutButton(document)) addButton(a);
    // Hosts whose post scrolled out of the virtual list are gone from the DOM; forget them.
    for (const h of hosts) if (!h.host.isConnected) hosts.delete(h);
  };
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  };
  new MutationObserver(schedule).observe(document.body || document.documentElement, { childList: true, subtree: true });
  schedule();

  onLang(() => {
    for (const h of hosts) h.root.querySelector('button')?.setAttribute('aria-label', L().saveLabel);
    menu?.relabel();
  });

  function restyle() {
    hosts.forEach(h => h.restyle());
    menu?.host.restyle();
  }

  function ensureMenu() {
    if (!menu) menu = buildMenu();
    return menu;
  }

  /* ─── Actions ─── */

  async function tweetsFor(id: string): Promise<{ tweets: FxTweet[]; local: boolean } | { error: 'notPublic' | 'failed' }> {
    const r = await send({ type: 'thread:get', id });
    if (r.ok && r.data.status === 200 && r.data.tweets?.length) return { tweets: r.data.tweets, local: false };
    const seen = deps.recent.get(id);
    if (seen) return { tweets: [seen], local: true };
    return { error: r.ok && (r.data.status === 404 || r.data.status === 403) ? 'notPublic' : 'failed' };
  }

  /** Markdown exactly as the site writes it: front matter (the site's default) + body; the site's file name. */
  function markdownOf(tweets: FxTweet[]) {
    const lang = lang_();
    const doc = buildDoc(tweets, translations[lang].labels, langInfo(lang).locale);
    return { name: `${fileBaseName(doc)}.md`, text: frontMatter(doc) + doc.md };
  }

  /** Keeps the saved post in the local archive (source manual), like a bookmark would. */
  function archive(id: string, tweets: FxTweet[]) {
    const focal = tweets.find(t => t.id === id) || tweets[0];
    if (focal) void send({ type: 'capture:posts', capture: { accountId: deps.account(), source: 'manual', tweets: [focal] } });
  }

  async function markdown(t: Target, mode: 'download' | 'copy', status: (s: string, err?: boolean) => void): Promise<boolean> {
    status(L().preparing);
    const got = await tweetsFor(t.id);
    if ('error' in got) {
      status(got.error === 'notPublic' ? L().notPublic : L().failed, true);
      return false;
    }
    const md = markdownOf(got.tweets);
    if (mode === 'download') saveText(md.text, md.name);
    else if (!(await copyText(md.text))) {
      status(L().failed, true);
      return false;
    }
    archive(t.id, got.tweets);
    void send({ type: 'event:track', event: mode === 'download' ? { name: 'download', param: 'md' } : { name: 'copy' } });
    status(got.local ? L().fromPage : mode === 'copy' ? L().copied : '');
    return true;
  }

  function openOnSite(t: Target, fmt?: OpenFormat) {
    openTab(statusUrl(XT_BASE, t.handle, t.id, 'save_menu', fmt));
    if (fmt) void send({ type: 'event:track', event: { name: 'download', param: fmt } });
  }

  /* ─── The shared menu ─── */

  function buildMenu() {
    const host = createHost('xt-menu', MENU_CSS);
    const pop = el('div', { popover: 'auto', id: 'm' });
    const list = el('div', { role: 'menu' });
    const statusEl = el('div', { class: 'status', role: 'status', 'aria-live': 'polite' });
    pop.append(list, statusEl);
    host.root.appendChild(pop);
    document.documentElement.appendChild(host.host);

    let target: Target | null = null;
    let busy = false;
    let enterOnOpen = false;
    let savedFor: string | null = null;

    const setStatus = (s: string, err = false) => {
      statusEl.textContent = s;
      statusEl.classList.toggle('err', err);
    };
    const items = () => [...list.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')];

    type Item = { label: () => string; hint?: string; run: (t: Target) => void | Promise<boolean | void>; keepOpen?: boolean; when?: () => boolean };
    const def: (Item | 'sep')[] = [
      { label: () => L().downloadMd, hint: '.md', run: t => markdown(t, 'download', setStatus), keepOpen: true },
      { label: () => L().copyMarkdown, run: t => markdown(t, 'copy', setStatus), keepOpen: true },
      'sep',
      { label: () => L().pdf, run: t => openOnSite(t, 'pdf'), hint: '↗' },
      { label: () => L().epub, run: t => openOnSite(t, 'epub'), hint: '↗' },
      { label: () => L().zip, run: t => openOnSite(t, 'zip'), hint: '↗' },
      'sep',
      { label: () => L().openOnSite, run: t => openOnSite(t), hint: '↗' },
      {
        label: () => L().openSaved,
        run: t => {
          openTab(savedUrl(XT_BASE, lang_(), 'save_menu', t.id));
          void send({ type: 'event:track', event: { name: 'saved_open' } });
        },
        hint: '↗',
        when: () => !!target && savedFor === target.id,
      },
    ];

    function render() {
      list.textContent = '';
      for (const d of def) {
        if (d === 'sep') {
          list.appendChild(el('hr'));
          continue;
        }
        if (d.when && !d.when()) continue;
        const b = el('button', { type: 'button', role: 'menuitem', tabindex: '-1' });
        b.append(el('span', {}, d.label()));
        if (d.hint) b.append(el('span', { class: 'hint', 'aria-hidden': 'true' }, d.hint));
        b.addEventListener('click', () => void activate(d, b));
        b.addEventListener('pointermove', () => b !== host.root.activeElement && b.focus({ preventScroll: true }));
        list.appendChild(b);
      }
    }

    async function activate(d: Item, b: HTMLButtonElement) {
      if (!target || busy) return;
      const t = target;
      busy = true;
      b.setAttribute('aria-disabled', 'true');
      try {
        const ok = await d.run(t);
        if (!d.keepOpen || ok === true) {
          // Copy shows "Copied" for a moment; a download or a new tab closes at once.
          const linger = statusEl.textContent && !statusEl.classList.contains('err') ? 900 : 0;
          setTimeout(() => close(true), linger);
        }
      } finally {
        busy = false;
        b.removeAttribute('aria-disabled');
      }
    }

    function place(trigger: HTMLElement) {
      const r = trigger.getBoundingClientRect();
      const w = pop.offsetWidth || 240;
      const h = pop.offsetHeight || 300;
      const rtl = getComputedStyle(trigger).direction === 'rtl';
      let left = rtl ? r.left : r.right - w;
      left = Math.min(Math.max(8, left), innerWidth - w - 8);
      let top = r.bottom + 4;
      if (top + h > innerHeight - 8) top = Math.max(8, r.top - h - 4);
      pop.style.left = `${Math.round(left)}px`;
      pop.style.top = `${Math.round(top)}px`;
    }

    function open(t: Target, keyboard: boolean) {
      if (pop.matches(':popover-open')) close(false);
      target = t;
      savedFor = null;
      setStatus('');
      render();
      enterOnOpen = keyboard;
      pop.showPopover();
      if (t.trigger) {
        t.trigger.setAttribute('aria-expanded', 'true');
        place(t.trigger);
      }
      if (enterOnOpen) items()[0]?.focus({ preventScroll: true });
      // "Open saved copy" appears once the archive answers.
      void send({ type: 'saved:has', ids: [t.id] }).then(r => {
        if (r.ok && r.data.ids.includes(t.id) && target === t && pop.matches(':popover-open')) {
          savedFor = t.id;
          const focused = items().indexOf(host.root.activeElement as HTMLButtonElement);
          render();
          if (focused >= 0) items()[focused]?.focus({ preventScroll: true });
          if (t.trigger) place(t.trigger);
        }
      });
    }

    function close(restore: boolean) {
      const t = target;
      if (pop.matches(':popover-open')) pop.hidePopover();
      if (restore && t?.trigger?.isConnected) t.trigger.focus({ preventScroll: true });
    }

    pop.addEventListener('toggle', e => {
      if ((e as ToggleEvent).newState === 'closed') {
        target?.trigger?.setAttribute('aria-expanded', 'false');
        if (!busy) target = null;
      }
    });

    list.addEventListener('keydown', e => {
      const all = items().filter(b => b.getAttribute('aria-disabled') !== 'true');
      const i = all.indexOf(host.root.activeElement as HTMLButtonElement);
      let next = -1;
      if (e.key === 'ArrowDown') next = (i + 1) % all.length;
      else if (e.key === 'ArrowUp') next = (i - 1 + all.length) % all.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = all.length - 1;
      else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close(true);
        return;
      } else if (e.key === 'Tab') {
        close(false);
        return;
      } else return;
      e.preventDefault();
      e.stopPropagation(); // X has its own j/k and arrow shortcuts
      all[next]?.focus({ preventScroll: true });
    });
    // Keys typed in the menu must not reach X's global shortcuts.
    pop.addEventListener('keypress', e => e.stopPropagation());

    addEventListener('scroll', () => pop.matches(':popover-open') && target?.trigger && place(target.trigger), { passive: true });

    return {
      host,
      open,
      toggle(t: Target, keyboard: boolean) {
        if (pop.matches(':popover-open') && target?.id === t.id && target.trigger === t.trigger) close(false);
        else open(t, keyboard);
      },
      relabel: () => pop.matches(':popover-open') && render(),
    };
  }

  /** The popup's "Save this post" fallback: Markdown of the post this tab shows. */
  async function saveCurrent(): Promise<{ ok: boolean; error?: string }> {
    const post = parseStatusUrl(location.href);
    if (!post) return { ok: false, error: 'not_a_post' };
    let err = '';
    const ok = await markdown({ ...post, trigger: null }, 'download', (s, e) => e && (err = s));
    return ok ? { ok } : { ok, error: err || L().failed };
  }

  return { restyle, saveCurrent };
}
