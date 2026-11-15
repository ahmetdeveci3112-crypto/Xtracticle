/**
 * Every DOM selector the extension uses on x.com, in one file (docs/chrome-extension-plan.md, B4).
 * When X changes its markup, this is the only file to touch. X's `data-testid` attributes are the most
 * stable hooks it has; none of these selectors reads text, so they work in every interface language.
 *
 * Checked against x.com markup as of Nov 2026 from public knowledge; re-check on the live site
 * (see the report's manual checks).
 */

export const SEL = {
  /** One post in a timeline or a conversation (signed-in markup). */
  article: 'article[data-testid="tweet"]',
  /** Signed-out markup has no data-testid at all: any <article> is a post (nested ones are quoted posts). */
  anyArticle: 'article',
  /** The row of reply / repost / like / bookmark / share buttons inside a post. */
  actionBar: '[role="group"]',
  /** Buttons that tell an action bar apart from other groups. */
  actionButtons: '[data-testid="reply"], [data-testid="like"], [data-testid="unlike"], [data-testid="bookmark"], [data-testid="removeBookmark"]',
  /** The post's own permalink is the status link wrapping its timestamp. */
  statusLink: 'a[href*="/status/"]',
  time: 'time',
  /** A quoted post inside a post: a nested article, or X's clickable card (role=link that is not a link). */
  quoteCard: 'article, [role="link"]:not(a)',
  primaryColumn: '[data-testid="primaryColumn"]',
  /** "Hmm…this page doesn't exist", suspended / protected account, post unavailable. */
  errorState: '[data-testid="error-detail"], [data-testid="emptyState"]',
  /** Tabs of a page (x.com/i/history: Bookmarks | Likes). */
  tab: '[role="tab"]',
  tabList: '[role="tablist"]',
} as const;

/** Signed-out action bars have no testids: an action bar is a group of at least this many buttons. */
const MIN_BAR_BUTTONS = 3;
const STATUS_PATH = /\/status\/\d+/;

/** Our own markers, so nothing is added twice. */
export const MARK = { slot: 'data-xt-slot' } as const;

/**
 * Every post under `root`. Signed in: X's `article[data-testid="tweet"]`. Signed out (no testids on the page):
 * every top-level <article>; an article nested in another one is a quoted post, not a post of its own.
 */
export function postsIn(root: ParentNode): HTMLElement[] {
  const doc = (root as Node).ownerDocument || (root as Document);
  const tagged = !!doc.querySelector?.(SEL.article);
  const all = [...root.querySelectorAll<HTMLElement>(tagged ? SEL.article : SEL.anyArticle)];
  return all.filter(a => !a.parentElement?.closest(SEL.anyArticle));
}

/** Posts under `root` that have no Save button yet. */
export function articlesWithoutButton(root: ParentNode): HTMLElement[] {
  return postsIn(root).filter(a => !a.querySelector(`[${MARK.slot}]`));
}

/** Inside a quoted post of `article` (a nested article or a role=link card), not in the post itself. */
function inQuote(node: Element, article: HTMLElement): boolean {
  const q = node.closest(SEL.quoteCard);
  return !!q && q !== article && article.contains(q);
}

/**
 * The action bar of a post: the last role=group of the post itself (not a quoted post's) that holds X's
 * action buttons; without testids (signed out), the last such group with at least 3 buttons. None → null.
 */
export function actionBarOf(article: HTMLElement): HTMLElement | null {
  // A group inside a nested (quoted) article belongs to that article; quote cards have no action bar.
  const groups = [...article.querySelectorAll<HTMLElement>(SEL.actionBar)].filter(g => g.closest(SEL.anyArticle) === article);
  const tagged = groups.filter(g => g.querySelector(SEL.actionButtons));
  const pick = tagged.length ? tagged : groups.filter(g => g.querySelectorAll('button').length >= MIN_BAR_BUTTONS);
  return pick.length ? pick[pick.length - 1] : null;
}

/**
 * The post's permalink: the status link around its <time>; else (signed out: the date link has no <time>)
 * the first /status/<id> link of the post that is not inside a quoted post. Falls back to any own status link.
 */
export function permalinkOf(article: HTMLElement): string | null {
  const own = [...article.querySelectorAll<HTMLAnchorElement>(SEL.statusLink)].filter(a => a.closest(SEL.anyArticle) === article && STATUS_PATH.test(a.pathname));
  const outside = own.filter(a => !inQuote(a, article));
  const timed = outside.find(a => a.querySelector(SEL.time));
  const pick = timed || outside[0] || own.find(a => a.querySelector(SEL.time)) || own[0];
  return pick ? pick.href : null;
}

/* ─── The bookmarks list ─── */

/**
 * Which page holds the bookmarks list: x.com/i/bookmarks (and /i/bookmarks/<folderId>), or x.com/i/history,
 * where X now redirects /i/bookmarks ("History": a Bookmarks tab, selected by default, and a Likes tab).
 */
export function bookmarksPageKind(pathname: string): 'bookmarks' | 'history' | null {
  if (/^\/i\/bookmarks(?:\/|$)/.test(pathname)) return 'bookmarks';
  if (/^\/i\/history(?:\/|$)/.test(pathname)) return 'history';
  return null;
}

/** The text-free hint of a tab's link: its href, or the href of a link inside / around it. */
function tabHref(tab: Element): string {
  const a = tab.matches('a[href]') ? tab : tab.querySelector('a[href]') || tab.closest('a[href]');
  return (a?.getAttribute('href') || '').toLowerCase();
}

/**
 * The selected tab of x.com/i/history, without reading any text (every interface language):
 *   - a sub-path or the selected tab's link that names bookmarks / likes decides;
 *   - otherwise its position: the first tab is Bookmarks (X's default), any other is not.
 * 'unknown' while X has not rendered the tabs yet.
 */
export function historyTabOf(doc: Document, pathname: string): 'bookmarks' | 'other' | 'unknown' {
  const sub = pathname.replace(/^\/i\/history\/?/, '').toLowerCase();
  if (/bookmark/.test(sub)) return 'bookmarks';
  if (/like|favorite/.test(sub)) return 'other';
  const col = doc.querySelector(SEL.primaryColumn) || doc;
  const lists = [...col.querySelectorAll(SEL.tabList)];
  for (const list of lists.length ? lists : [col]) {
    const tabs = [...list.querySelectorAll(SEL.tab)];
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    if (i < 0) continue;
    const href = tabHref(tabs[i]);
    if (/bookmark/.test(href)) return 'bookmarks';
    if (/like|favorite/.test(href)) return 'other';
    return i === 0 ? 'bookmarks' : 'other';
  }
  return 'unknown';
}

/** X's error / empty state in the main column. */
export function errorStateShown(doc: Document): boolean {
  const col = doc.querySelector(SEL.primaryColumn) || doc.body;
  return !!col?.querySelector(SEL.errorState);
}

/** A post for status `id` is rendered (the conversation loaded). */
export function postRendered(doc: Document, id: string): boolean {
  return postsIn(doc).some(p => [...p.querySelectorAll<HTMLAnchorElement>(SEL.statusLink)].some(a => a.pathname.split('/').includes(id)));
}

/** X's colour theme from the page background: light (white), dim (#15202b) or dark (black). */
export function themeOf(doc: Document): 'light' | 'dim' | 'dark' {
  const bg = doc.body ? getComputedStyle(doc.body).backgroundColor : '';
  return themeFromColor(bg);
}

export function themeFromColor(css: string): 'light' | 'dim' | 'dark' {
  const m = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?/.exec(css || '');
  if (!m || (m[4] !== undefined && Number(m[4]) === 0)) return 'light';
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum > 128) return 'light';
  return b - r > 10 ? 'dim' : 'dark';
}
