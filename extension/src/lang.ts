/**
 * The extension's language (docs/chrome-extension-plan.md, A6): it follows the site. The bridge writes the
 * site's choice to chrome.storage.local.lang (through the SW); until the site was opened once, the browser's
 * UI language is mapped onto the site's 7 languages. Pure helpers + one storage read.
 */
import { LANGS, type Lang } from '../../src/shared/bridge';
import { extText, type ExtStrings } from '../../src/i18n';

export const LANG_KEY = 'lang';

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** "pt-BR" → pt, "zh-TW" → zh, "ar-EG" → ar; anything else → en. */
export function mapUiLang(ui: unknown): Lang {
  const base = typeof ui === 'string' ? ui.trim().toLowerCase().split(/[-_]/)[0] : '';
  return isLang(base) ? base : 'en';
}

/** The stored site language when valid, else the browser's. */
export const pickLang = (stored: unknown, ui: unknown): Lang => (isLang(stored) ? stored : mapUiLang(ui));

/**
 * The site's own choice on one of its pages: the `xtracticle_lang` localStorage key (JSON string, set by the
 * language switcher, site/render.ts `K`), else the page's `<html lang>` (pt-BR → pt). Null when neither is one of ours.
 */
export function siteLang(storedJson: string | null, htmlLang: string | null): Lang | null {
  if (storedJson) {
    try {
      const v = JSON.parse(storedJson);
      if (isLang(v)) return v;
    } catch {
      /* not JSON */
    }
  }
  if (htmlLang) {
    const base = htmlLang.trim().toLowerCase().split(/[-_]/)[0];
    if (isLang(base)) return base;
  }
  return null;
}

/** `{n}`-style placeholders. */
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

export const stringsFor = (lang: Lang): ExtStrings => extText[lang] || extText.en;

export async function currentLang(): Promise<Lang> {
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
  return pickLang(stored, ui);
}
