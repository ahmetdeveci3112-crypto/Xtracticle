/**
 * Shared bits of the x.com UI (Save menu, bookmarks panel, archive panel): Shadow DOM hosts, the brand
 * tokens (src/shared/brand.ts) mapped onto X's light / dim / dark theme, the current language's strings,
 * small helpers for downloads and the clipboard. Everything is vanilla DOM, no framework.
 */
import { DARK, LIGHT, RADIUS, cssVars } from '../../../src/shared/brand';
import type { Lang } from '../../../src/shared/bridge';
import type { ExtStrings } from '../../../src/i18n';
import { LANG_KEY, currentLang, pickLang, stringsFor } from '../lang';
import { themeOf } from './anchors';

/* ─── Language ─── */

let lang: Lang = 'en';
let strings: ExtStrings = stringsFor('en');
const langListeners = new Set<() => void>();

export const L = () => strings;
export const lang_ = () => lang;
export const onLang = (fn: () => void) => void langListeners.add(fn);

export async function initLang(): Promise<void> {
  lang = await currentLang();
  strings = stringsFor(lang);
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[LANG_KEY]) return;
      lang = pickLang(changes[LANG_KEY].newValue, chrome.i18n.getUILanguage());
      strings = stringsFor(lang);
      langListeners.forEach(fn => fn());
    });
  } catch {
    /* extension context gone (reload) */
  }
}

/* ─── Theme ─── */

/** Brand tokens for X's theme, plus the few X-matched values (icon grey, dim background). */
export function themeVars(doc: Document = document): string {
  const t = themeOf(doc);
  const base = t === 'light' ? LIGHT : DARK;
  const extra =
    t === 'light'
      ? '--xt-icon: #536471; --xt-hover: rgba(15,20,25,0.08); --xt-surface: #ffffff;'
      : t === 'dim'
        ? '--xt-icon: #8b98a5; --xt-hover: rgba(247,249,249,0.1); --xt-surface: #1e2732; --border: #38444d;'
        : '--xt-icon: #71767b; --xt-hover: rgba(231,233,234,0.1); --xt-surface: #0f0f0f;';
  return `${cssVars(base)} --radius-sm: ${RADIUS.sm}; --radius-md: ${RADIUS.md}; --radius-lg: ${RADIUS.lg}; ${extra}`;
}

/** Common reset + tokens for a shadow root; `css` is the widget's own stylesheet. */
export function shadowStyle(css: string): string {
  return `:host { all: initial; ${themeVars()} font-family: var(--font-sans); color: var(--text-primary); }
:host([hidden]) { display: none !important; }
*, *::before, *::after { box-sizing: border-box; }
button { font: inherit; color: inherit; }
a { color: inherit; }
:focus-visible { outline: 2px solid var(--text-primary); outline-offset: 2px; }
${css}`;
}

export interface Host {
  host: HTMLElement;
  root: ShadowRoot;
  restyle(): void;
}

/** A custom-named host element with a closed-to-the-page (mode open for tests) shadow root. */
export function createHost(tag: string, css: string): Host {
  const host = document.createElement(tag);
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = shadowStyle(css);
  root.appendChild(style);
  return { host, root, restyle: () => void (style.textContent = shadowStyle(css)) };
}

/** Re-applies the theme to every host when X switches light / dim / dark (body background changes). */
export function watchTheme(onChange: () => void): void {
  let last = themeOf(document);
  const check = () => {
    const t = themeOf(document);
    if (t !== last) {
      last = t;
      onChange();
    }
  };
  if (document.body) new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
  new MutationObserver(check).observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
}

/* ─── Small helpers ─── */

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Saves text as a file from the page (blob URL; no `downloads` permission). */
export function saveText(text: string, name: string, type = 'text/markdown'): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.documentElement.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // The async fetch may have outlived the click's user activation: fall back to a selection copy.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.documentElement.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export const openTab = (url: string) => void window.open(url, '_blank', 'noopener');
