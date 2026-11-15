/**
 * The archive panel on a post X cannot show (docs/chrome-extension-plan.md, M3): "this post doesn't
 * exist / account suspended / page not found". Within a second of the signal (X's error state on a status
 * URL, anchors.ts, or the TweetDetail answer, gone.ts) a small closable panel offers:
 *   Wayback Machine (the capture nearest the post's date) · archive.today · Open saved copy (when the local
 *   archive has it) · See the account's archive (the site's deleted-tweet finder for @handle).
 */
import { MARK_SVG } from '../../../src/shared/brand';
import { archiveLinks, snowflakeDate, waybackSnapshot } from '../../../src/shared/url';
import { XT_BASE } from '../config';
import { finderUrl, parseStatusUrl, savedUrl } from '../links';
import { send } from '../messages';
import { errorStateShown, postRendered } from './anchors';
import { goneOnPage, waybackTs } from './gone';
import { L, createHost, el, lang_, onLang } from './ui';

const CSS = `
:host { position: fixed; inset-block-end: 20px; inset-inline-end: 20px; z-index: 2147483000; }
.p {
  width: 300px; max-width: calc(100vw - 40px); padding: 14px 16px;
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  background: var(--xt-surface); color: var(--text-primary);
  box-shadow: 0 6px 24px rgba(0,0,0,.14); font-size: 14px; line-height: 1.4;
}
.h { display: flex; align-items: flex-start; gap: 8px; }
.m { flex: none; display: inline-flex; width: 22px; height: 22px; border-radius: 6px; align-items: center; justify-content: center; background: var(--accent); color: var(--bg-primary); }
.m svg { width: 14px; height: 14px; }
.t { font-weight: 600; margin: 1px 0 10px; }
.x { margin-inline-start: auto; flex: none; width: 28px; height: 28px; margin-block-start: -4px; border: 0; border-radius: 999px; background: transparent; color: var(--text-secondary); cursor: pointer; font-size: 18px; line-height: 1; }
.x:hover { background: var(--xt-hover); }
ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
a { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 8px; margin: 0 -8px; border-radius: var(--radius-sm); text-decoration: none; }
a:hover { background: var(--xt-hover); }
a .hint { color: var(--text-tertiary); font-size: 12px; }
a.saved { font-weight: 600; }
`;

export function startGonePanel() {
  let h: ReturnType<typeof createHost> | null = null;
  /** The status id the panel is shown for (or was closed for). */
  let shownFor: string | null = null;
  let closedFor: string | null = null;
  /** Ids the TweetDetail answer said are gone. */
  const goneIds = new Set<string>();
  let hasCopy = false;
  let checkTimer: ReturnType<typeof setInterval> | null = null;

  function render(handle: string, id: string) {
    if (!h) {
      h = createHost('xt-gone', CSS);
      document.documentElement.appendChild(h.host);
    }
    const root = h.root;
    root.querySelector('.p')?.remove();
    const p = el('section', { class: 'p', role: 'region', 'aria-label': L().unavailable });
    const head = el('div', { class: 'h' });
    const mark = el('span', { class: 'm', 'aria-hidden': 'true' });
    mark.innerHTML = MARK_SVG(14);
    const t = el('p', { class: 't' }, L().unavailable);
    const x = el('button', { class: 'x', type: 'button', 'aria-label': L().close }, '×');
    x.addEventListener('click', () => {
      closedFor = id;
      hide();
    });
    head.append(mark, t, x);
    const links = archiveLinks(id, handle);
    const date = snowflakeDate(id);
    const host = date && date >= new Date('2024-05-17') ? 'x.com' : 'twitter.com';
    const wayback = date ? waybackSnapshot(waybackTs(date), `https://${host}/${handle}/status/${id}`) : links.wayback;
    const ul = el('ul');
    const item = (href: string, label: string, cls = '', onClick?: () => void) => {
      const a = el('a', { href, target: '_blank', rel: 'noopener', class: cls });
      a.append(el('span', {}, label), el('span', { class: 'hint', 'aria-hidden': 'true' }, '↗'));
      if (onClick) a.addEventListener('click', onClick);
      const li = el('li');
      li.appendChild(a);
      ul.appendChild(li);
    };
    if (hasCopy) item(savedUrl(XT_BASE, lang_(), 'gone_panel', id), L().openSaved, 'saved', () => void send({ type: 'event:track', event: { name: 'saved_open' } }));
    item(wayback, L().wayback);
    item(links.archiveToday, L().archiveToday);
    item(finderUrl(XT_BASE, lang_(), handle, 'gone_panel'), L().accountArchive);
    p.append(head, ul);
    p.addEventListener('keydown', e => e.stopPropagation());
    root.appendChild(p);
    h.host.hidden = false;
  }

  const hide = () => {
    if (h) h.host.hidden = true;
    shownFor = null;
  };

  async function show(handle: string, id: string) {
    if (shownFor === id || closedFor === id) return;
    shownFor = id;
    hasCopy = false;
    render(handle, id);
    const r = await send({ type: 'saved:has', ids: [id] });
    if (r.ok && r.data.ids.includes(id) && shownFor === id) {
      hasCopy = true;
      render(handle, id);
    }
  }

  function check() {
    const post = parseStatusUrl(location.href);
    if (!post) {
      if (shownFor) hide();
      return;
    }
    if (shownFor && shownFor !== post.id) hide();
    const page = goneOnPage({ onStatusPage: true, errorState: errorStateShown(document), postRendered: postRendered(document, post.id) });
    if (page || goneIds.has(post.id)) void show(post.handle, post.id);
  }

  /** content/index.ts: a TweetDetail answer said this id is gone. Checked at once, so the panel is up within a second. */
  function onGone(id: string) {
    goneIds.add(id);
    check();
  }

  /** Called on start and on every SPA navigation: polls the page for X's error state for a few seconds. */
  function route() {
    if (checkTimer) clearInterval(checkTimer);
    check();
    if (!parseStatusUrl(location.href)) return;
    let n = 0;
    checkTimer = setInterval(() => {
      check();
      if (++n >= 40 || shownFor) {
        clearInterval(checkTimer!);
        checkTimer = null;
      }
    }, 250);
  }

  onLang(() => {
    const post = parseStatusUrl(location.href);
    if (shownFor && post) render(post.handle, post.id);
  });

  return { route, onGone, restyle: () => h?.restyle() };
}
