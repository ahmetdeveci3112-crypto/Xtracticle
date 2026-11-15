/**
 * The extension's language (docs/chrome-extension-plan.md, A6): it follows the site. The bridge writes the
 * site's choice to chrome.storage.local.lang (through the SW), and only an explicit one (`siteLang`).
 *
 * Order, first that applies:
 *   1. chrome.storage.local.lang: the site's saved choice, an `xt:lang-changed`, or a language-prefixed page;
 *   2. on x.com, X's own interface language (<html lang>): the user picked it for the very page our UI sits
 *      in (or X derived it from the browser), so the Save menu never differs from the X around it;
 *   3. the browser's UI language (chrome.i18n.getUILanguage), mapped onto the site's 7 languages;
 *   4. English.
 * X's language goes before the browser's because it is the more specific choice: a Turkish X in an English
 * Chrome is read in Turkish. It is never stored: only the site sets the stored language.
 */
import { LANGS, type Lang } from '../../src/shared/bridge';
import { extText, type ExtStrings } from '../../src/i18n';

export const LANG_KEY = 'lang';

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** "pt-BR" → pt, "zh-TW" → zh, "ar-EG" → ar; anything else → en. */
export const mapUiLang = (ui: unknown): Lang => langOf(ui) || 'en';

/** One of ours from a language tag ("tr-TR" → tr), else null (no English default). */
export function langOf(tag: unknown): Lang | null {
  const base = typeof tag === 'string' ? tag.trim().toLowerCase().split(/[-_]/)[0] : '';
  return isLang(base) ? base : null;
}

/** The stored site language when valid, else X's interface language (on x.com), else the browser's. */
export const pickLang = (stored: unknown, ui: unknown, xLang?: unknown): Lang => (isLang(stored) ? stored : langOf(xLang) || mapUiLang(ui));

/**
 * The site's explicit choice on one of its pages, or null when the page states none:
 *   - the `xtracticle_lang` localStorage key (JSON string, written by the language switcher, site/render.ts `K`);
 *   - else a language-prefixed path (/tr/saved → tr).
 * An unprefixed page's default `<html lang="en">` is NOT a choice (a Turkish user may open /saved without ever
 * picking a language), so it is not read at all.
 */
export function siteLang(storedJson: string | null, pathname: string | null): Lang | null {
  if (storedJson) {
    try {
      const v = JSON.parse(storedJson);
      if (isLang(v)) return v;
    } catch {
      /* not JSON */
    }
  }
  const m = /^\/([a-z]{2})(?:\/|$)/.exec(pathname || '');
  return m && isLang(m[1]) ? m[1] : null;
}

/** `{n}`-style placeholders. */
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

export const stringsFor = (lang: Lang): ExtStrings => extText[lang] || extText.en;

/** The extension's language now; `xLang` is X's <html lang> when called on x.com. */
export async function currentLang(xLang?: string | null): Promise<Lang> {
  let stored: unknown = null;
  try {
    stored = (await chrome.storage.local.get(LANG_KEY))[LANG_KEY];
  } catch {
    /* storage unavailable */
  }
  let ui = 'en';
  try {
    ui = chrome.i18n.getUILanguage();
  } catch {
    /* not in an extension context */
  }
  return pickLang(stored, ui, xLang);
}
