/**
 * Every DOM selector the extension uses on x.com, in one file (docs/chrome-extension-plan.md, B4).
 * When X changes its markup, this is the only file to touch. X's `data-testid` attributes are the most
 * stable hooks it has; none of these selectors reads text, so they work in every interface language.
 *
 * Checked against x.com markup as of Nov 2026 from public knowledge; re-check on the live site
 * (see the report's manual checks).
 */

export const SEL = {
  /** One post in a timeline or a conversation. */
  article: 'article[data-testid="tweet"]',
  /** The row of reply / repost / like / bookmark / share buttons inside a post. */
  actionBar: 'div[role="group"]',
  /** Buttons that tell an action bar apart from other groups. */
  actionButtons: '[data-testid="reply"], [data-testid="like"], [data-testid="unlike"], [data-testid="bookmark"], [data-testid="removeBookmark"]',
  /** The post's own permalink is the status link wrapping its timestamp. */
  statusLink: 'a[href*="/status/"]',
  time: 'time',
  primaryColumn: '[data-testid="primaryColumn"]',
  /** "Hmm…this page doesn't exist", suspended / protected account, post unavailable. */
  errorState: '[data-testid="error-detail"], [data-testid="emptyState"]',
} as const;

/** Our own markers, so nothing is added twice. */
export const MARK = { slot: 'data-xt-slot' } as const;

/** Posts under `root` that have no Save button yet. */
export function articlesWithoutButton(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(SEL.article)].filter(a => !a.querySelector(`[${MARK.slot}]`));
}

/** The action bar of a post: the last role=group that holds X's own action buttons (not a quoted post's). */
export function actionBarOf(article: HTMLElement): HTMLElement | null {
  const groups = [...article.querySelectorAll<HTMLElement>(SEL.actionBar)].filter(g => g.closest(SEL.article) === article && g.querySelector(SEL.actionButtons));
  return groups.length ? groups[groups.length - 1] : null;
}

/** The post's permalink: the status link around its <time>, else the first status link of the post itself. */
export function permalinkOf(article: HTMLElement): string | null {
  const own = (a: Element) => a.closest(SEL.article) === article;
  const timed = [...article.querySelectorAll<HTMLAnchorElement>(SEL.statusLink)].find(a => own(a) && a.querySelector(SEL.time));
  if (timed) return timed.href;
  const first = [...article.querySelectorAll<HTMLAnchorElement>(SEL.statusLink)].find(own);
  return first ? first.href : null;
}

/** X's error / empty state in the main column. */
export function errorStateShown(doc: Document): boolean {
  const col = doc.querySelector(SEL.primaryColumn) || doc.body;
  return !!col?.querySelector(SEL.errorState);
}

/** A post for status `id` is rendered (the conversation loaded). */
export function postRendered(doc: Document, id: string): boolean {
  return [...doc.querySelectorAll<HTMLAnchorElement>(`${SEL.article} ${SEL.statusLink}`)].some(a => a.pathname.split('/').includes(id));
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
