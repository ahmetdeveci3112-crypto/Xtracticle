import {
  DATASET_KEY,
  isTrustedEvent,
  message,
  parseExtMessage,
  type ExtMessage,
  type Lang,
  type SavedFilter,
  type SavedSummary,
  type SiteMessage,
} from '../shared/bridge';

/**
 * Site side of the browser extension (docs/chrome-extension-plan.md, A1, A4, A5).
 *
 * - `extInstalled()`: is the extension's bridge content script on this page?
 * - `createBridgeClient()`: request/response over `window.postMessage` with the protocol in
 *   src/shared/bridge.ts (`xt:saved:list` / `get` / `delete`, `xt:status`).
 * - `notifyProChanged()` / `notifyLangChanged()`: tell the extension the site changed state.
 * - `isDesktopChromium()`, `storeFor()`, `extCtaAllowed()`: which store a visitor gets, and when the one-line install call may show.
 * - `parseDlHash()`, `parseSavedHash()`: the `#dl=` and `#id=` deep links.
 *
 * Safe to import in Node (site/ build code reads `EXT_STORE_URL`): nothing touches the DOM at load.
 */

/**
 * Chrome Web Store listing (live since Nov 16 2026). Set to '' to hide every Chrome install call.
 */
export const EXT_STORE_URL = 'https://chromewebstore.google.com/detail/olhoofgccihgkgeklcipnokigepoimje';

/**
 * Microsoft Edge Add-ons listing (live since Nov 16 2026). Edge visitors are sent here; if it were
 * empty they would get the Chrome Web Store button (Edge installs from there too).
 */
export const EXT_EDGE_STORE_URL = 'https://microsoftedge.microsoft.com/addons/detail/hompokahpbdaljejfmjpkemhcdonabla';

const isListing = (url: string): boolean => /^https:\/\//.test(url);

/** Is the Chrome Web Store listing set? */
export const chromeListed = (chrome: string = EXT_STORE_URL): boolean => isListing(chrome);
/** Is the Edge Add-ons listing set? */
export const edgeListed = (edge: string = EXT_EDGE_STORE_URL): boolean => isListing(edge);

/**
 * The one switch for everything that promotes the extension: the home page's hero line and extension
 * section, the /chrome-extension pages (and their sitemap and footer entries) and the one-line calls.
 * All of them follow the two store URLs (either one set turns it on); while both are empty the site
 * looks as it did before the extension.
 */
export const extAvailable = (chrome: string = EXT_STORE_URL, edge: string = EXT_EDGE_STORE_URL): boolean =>
  isListing(chrome) || isListing(edge);

/** Where the bookmark export panel opens (the content script watches for this hash). */
export const BOOKMARKS_EXPORT_URL = 'https://x.com/i/bookmarks#xt-export';

export type CtaSpot = 'home' | 'finder' | 'pro' | 'saved' | 'hero' | 'section' | 'page' | 'download';

/** The store listing with our UTM tags, or '' while there is no listing. */
export function storeUrl(spot: CtaSpot, base: string = EXT_STORE_URL): string {
  if (!isListing(base)) return '';
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}utm_source=xtracticle&utm_medium=site&utm_campaign=ext_${spot}`;
}

/** The /saved page in a language (same prefix rule as every other page). */
export const savedPath = (lang: Lang | string) => (lang && lang !== 'en' ? `/${lang}/saved` : '/saved');

/** The extension's landing page in each language (es/pt/tr get native slugs, like their other pages). */
export const EXT_PAGE_PATHS: Record<Lang, string> = {
  en: '/chrome-extension',
  tr: '/tr/chrome-eklentisi',
  es: '/es/extension-de-chrome',
  pt: '/pt/extensao-do-chrome',
  ja: '/ja/chrome-extension',
  zh: '/zh/chrome-extension',
  ar: '/ar/chrome-extension',
};

/* ─── Detection ─── */

interface MiniWindow {
  addEventListener(type: 'message', fn: (e: MessageEvent) => void): void;
  removeEventListener(type: 'message', fn: (e: MessageEvent) => void): void;
  postMessage(data: unknown, targetOrigin: string): void;
}

const currentWindow = (): (MiniWindow & Window) | null => (typeof window === 'undefined' ? null : window);
const currentOrigin = () => (typeof location === 'undefined' ? '' : location.origin);

/** The extension's version when its bridge has marked <html>, else null. */
export function extVersion(): string | null {
  if (typeof document === 'undefined') return null;
  return document.documentElement.dataset[DATASET_KEY] || null;
}

/**
 * True when the extension is present. The bridge runs at document_start, so `data-xt-ext` is
 * usually set before any of our code runs; otherwise we wait briefly for its `xt:hello`.
 */
export function extInstalled(timeoutMs = 800): Promise<boolean> {
  if (extVersion()) return Promise.resolve(true);
  const win = currentWindow();
  if (!win) return Promise.resolve(false);
  return new Promise(resolve => {
    const origin = currentOrigin();
    const done = (v: boolean) => {
      clearTimeout(timer);
      win.removeEventListener('message', onMessage);
      resolve(v);
    };
    const onMessage = (e: MessageEvent) => {
      if (!isTrustedEvent(e, win, origin)) return;
      if (parseExtMessage(e.data)?.type === 'xt:hello') done(true);
    };
    const timer = setTimeout(() => done(!!extVersion()), timeoutMs);
    win.addEventListener('message', onMessage);
  });
}

/* ─── Bridge client ─── */

export interface SavedPage {
  items: SavedSummary[];
  next: number | null;
  total: number;
}

export type ExtStatus = Extract<ExtMessage, { type: 'xt:status' }>;

export interface BridgeClient {
  listSaved(cursor: number, filter: SavedFilter): Promise<SavedPage>;
  /** The full post (FxTweet-shaped, untrusted) or null when the extension has no copy. */
  getSaved(id: string): Promise<Record<string, unknown> | null>;
  /** Fire and forget: the protocol has no acknowledgement for deletes. */
  deleteSaved(ids: string[]): void;
  /** Latest `xt:status`, if one arrived. */
  status(): ExtStatus | null;
  onStatus(fn: (s: ExtStatus) => void): () => void;
  close(): void;
}

export class BridgeTimeout extends Error {
  constructor(readonly type: string) {
    super(`No answer from the extension (${type})`);
  }
}

export interface BridgeOptions {
  win?: MiniWindow;
  /** Origin the extension posts from (= this page's origin). */
  origin?: string;
  timeoutMs?: number;
}

let reqCounter = 0;
const newReq = () => `r${(++reqCounter).toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export function createBridgeClient(opts: BridgeOptions = {}): BridgeClient {
  const win = opts.win || currentWindow();
  if (!win) throw new Error('No window');
  const origin = opts.origin || currentOrigin();
  const timeoutMs = opts.timeoutMs ?? 8000;
  const pending = new Map<string, { type: string; resolve: (m: ExtMessage) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  const statusListeners = new Set<(s: ExtStatus) => void>();
  let last: ExtStatus | null = null;

  const onMessage = (e: MessageEvent) => {
    if (!isTrustedEvent(e, win, origin)) return;
    const msg = parseExtMessage(e.data);
    if (!msg) return;
    if (msg.type === 'xt:status') {
      last = msg;
      statusListeners.forEach(fn => fn(msg));
      return;
    }
    if (msg.type === 'xt:hello') return;
    const p = pending.get(msg.req);
    if (!p || p.type !== msg.type) return;
    pending.delete(msg.req);
    clearTimeout(p.timer);
    p.resolve(msg);
  };
  win.addEventListener('message', onMessage);

  const send = (m: SiteMessage) => win.postMessage(m, origin);

  function request<T extends ExtMessage>(m: SiteMessage & { req: string }, answer: T['type']): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(m.req);
        reject(new BridgeTimeout(m.type));
      }, timeoutMs);
      pending.set(m.req, { type: answer, resolve: resolve as (x: ExtMessage) => void, reject, timer });
      send(m);
    });
  }

  return {
    async listSaved(cursor, filter) {
      const r = await request<Extract<ExtMessage, { type: 'xt:saved:page' }>>(
        message<SiteMessage>({ type: 'xt:saved:list', req: newReq(), cursor, filter }) as SiteMessage & { req: string },
        'xt:saved:page',
      );
      return { items: r.items, next: r.next, total: r.total };
    },
    async getSaved(id) {
      const r = await request<Extract<ExtMessage, { type: 'xt:saved:post' }>>(
        message<SiteMessage>({ type: 'xt:saved:get', req: newReq(), id }) as SiteMessage & { req: string },
        'xt:saved:post',
      );
      return r.id === id ? r.post : null;
    },
    deleteSaved(ids) {
      if (ids.length) send(message<SiteMessage>({ type: 'xt:saved:delete', req: newReq(), ids }));
    },
    status: () => last,
    onStatus(fn) {
      statusListeners.add(fn);
      return () => void statusListeners.delete(fn);
    },
    close() {
      win.removeEventListener('message', onMessage);
      pending.forEach(p => {
        clearTimeout(p.timer);
        p.reject(new Error('closed'));
      });
      pending.clear();
      statusListeners.clear();
    },
  };
}

/** Every summary, page by page (200 each) until the extension says there is no next page. */
export async function listAllSaved(
  client: Pick<BridgeClient, 'listSaved'>,
  filter: SavedFilter,
  onPage?: (items: SavedSummary[], total: number) => void,
  maxPages = 500,
): Promise<SavedSummary[]> {
  const all: SavedSummary[] = [];
  const seen = new Set<string>();
  let cursor: number | null = 0;
  for (let i = 0; cursor !== null && i < maxPages; i++) {
    const page: SavedPage = await client.listSaved(cursor, filter);
    const fresh = page.items.filter(s => !seen.has(s.id) && !!seen.add(s.id));
    all.push(...fresh);
    onPage?.(all.slice(), page.total);
    // A cursor that does not move forward would loop forever.
    cursor = page.next !== null && page.next > cursor && page.items.length ? page.next : null;
  }
  return all;
}

/* ─── Site → extension notices ─── */

function notify(m: SiteMessage) {
  const win = currentWindow();
  if (!win) return;
  try {
    win.postMessage(m, currentOrigin());
  } catch { /* never break the caller */ }
}

/** Pro was activated or signed out on the site: the extension re-reads /api/pro/me. */
export const notifyProChanged = () => notify(message<SiteMessage>({ type: 'xt:pro-changed' }));

/** The visitor picked a site language: the extension follows it. */
export const notifyLangChanged = (lang: Lang) => notify(message<SiteMessage>({ type: 'xt:lang-changed', lang }));

/* ─── Install call ─── */

interface UaData {
  mobile?: boolean;
  brands?: { brand: string }[];
}

const CHROMIUM_BRANDS = /^(Chromium|Google Chrome|Microsoft Edge|Opera|Brave)$/;

/** Desktop Chrome, Edge, Brave or Opera: the browsers the extension installs in. */
export function isDesktopChromium(ua: string, uaData?: UaData | null): boolean {
  if (uaData && Array.isArray(uaData.brands)) {
    if (uaData.mobile) return false;
    if (uaData.brands.some(b => CHROMIUM_BRANDS.test(b.brand))) return true;
  }
  if (/Mobi|Android|iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS/i.test(ua)) return false;
  if (/Firefox\//.test(ua)) return false;
  return /\b(Chrome|Edg|OPR)\/\d/.test(ua);
}

export function isDesktopChromiumNow(): boolean {
  if (typeof navigator === 'undefined') return false;
  return isDesktopChromium(navigator.userAgent || '', (navigator as Navigator & { userAgentData?: UaData }).userAgentData);
}

/** Microsoft Edge (desktop or not; callers check `isDesktopChromium` first). Mobile Edge (EdgA, EdgiOS) has no `Edg/`. */
export function isEdge(ua: string, uaData?: UaData | null): boolean {
  if (uaData && Array.isArray(uaData.brands) && uaData.brands.some(b => b.brand === 'Microsoft Edge')) return true;
  return /\bEdg\/\d/.test(ua);
}

export type StoreBrowser = 'chrome' | 'edge';

/**
 * Which store a visitor installs from, and the link with our UTM tags; null when there is none for them.
 * Desktop Edge with an Edge listing → Edge Add-ons. Every other desktop Chromium (Chrome, Brave, Opera,
 * Vivaldi, and Edge while there is no Edge listing) → Chrome Web Store. Anyone else, or a browser whose
 * store has no listing yet (Chrome visitor while only the Edge listing exists) → null.
 * `EXT_HERO_SCRIPT` (site/ext-home.ts) makes the same decision in <head> for the static pages.
 */
export function storeFor(
  spot: CtaSpot,
  ua: string,
  uaData?: UaData | null,
  chrome: string = EXT_STORE_URL,
  edge: string = EXT_EDGE_STORE_URL,
): { browser: StoreBrowser; href: string } | null {
  if (!isDesktopChromium(ua, uaData)) return null;
  if (isEdge(ua, uaData) && edgeListed(edge)) return { browser: 'edge', href: storeUrl(spot, edge) };
  if (chromeListed(chrome)) return { browser: 'chrome', href: storeUrl(spot, chrome) };
  return null;
}

/** `storeFor` for this browser; null on the server. */
export function storeForNow(spot: CtaSpot): { browser: StoreBrowser; href: string } | null {
  if (typeof navigator === 'undefined') return null;
  return storeFor(spot, navigator.userAgent || '', (navigator as Navigator & { userAgentData?: UaData }).userAgentData);
}

/** Same pattern as PromoCard's QUIET_KEY: "Not now" keeps the install call away for a long while. */
export const EXT_CTA_QUIET_KEY = 'xtracticle_ext_cta_until';
const CTA_QUIET_MS = 180 * 24 * 3600 * 1000;

export function extCtaAllowed(): boolean {
  if (!storeForNow('home')) return false;
  try {
    return Date.now() > Number(localStorage.getItem(EXT_CTA_QUIET_KEY) || 0);
  } catch {
    return false; // no storage → no way to keep it quiet, so do not show it
  }
}

export function quietExtCta() {
  try {
    localStorage.setItem(EXT_CTA_QUIET_KEY, String(Date.now() + CTA_QUIET_MS));
  } catch { /* checked in extCtaAllowed */ }
}

/* ─── Deep links ─── */

export type DlFormat = 'pdf' | 'epub' | 'zip' | 'md';
const DL_RE = /^#dl=(pdf|epub|zip|md)$/i;

/** `#dl=pdf` (from the extension's save menu) → 'pdf'. Anything else → null. */
export function parseDlHash(hash: string): DlFormat | null {
  const m = DL_RE.exec((hash || '').trim());
  return m ? (m[1].toLowerCase() as DlFormat) : null;
}

/** `/saved#id=<post id>` → the id. */
export function parseSavedHash(hash: string): string | null {
  const m = /^#id=(\d{1,25})$/.exec((hash || '').trim());
  return m ? m[1] : null;
}
