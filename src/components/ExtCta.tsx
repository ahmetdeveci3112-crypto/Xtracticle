import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Puzzle } from 'lucide-react';
import { savedText, type Lang } from '../i18n';
import { track } from '../lib/analytics';
import { EXT_HOME_COPY } from '../shared/ext-copy';
import {
  BOOKMARKS_EXPORT_URL,
  createBridgeClient,
  EXT_EDGE_STORE_URL,
  chromeListed,
  edgeListed,
  extAvailable,
  extCtaAllowed,
  extInstalled,
  extVersion,
  quietExtCta,
  savedPath,
  storeForNow,
  storeUrl,
  type BridgeClient,
  type CtaSpot,
  type ExtStatus,
} from '../lib/ext';

/**
 * One quiet line about the browser extension (docs/chrome-extension-plan.md, A4; owner decision 10):
 * on the home page's tool list, under the Deleted Tweet Finder results and in the /pro feature list.
 *
 * - Extension installed: "Export bookmarks" (opens the panel on x.com) and, when the extension reported
 *   unavailable copies, "Unavailable bookmark copies (N)" → /saved?view=removed.
 * - Not installed: the install call, only on desktop Chromium, only once the store listing exists
 *   (`EXT_STORE_URL`), and gone for 180 days after "Not now". No pop-up, no banner.
 */

let bridge: BridgeClient | null = null;
/** One listener for the whole page, started at import so an early `xt:status` is not missed. */
function sharedBridge(): BridgeClient | null {
  if (typeof window === 'undefined') return null;
  try {
    return (bridge ||= createBridgeClient());
  } catch {
    return null;
  }
}
sharedBridge();

export function useExtState(): { installed: boolean | null; status: ExtStatus | null } {
  const [installed, setInstalled] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ExtStatus | null>(() => sharedBridge()?.status() ?? null);
  useEffect(() => {
    let live = true;
    void extInstalled().then(v => live && setInstalled(v));
    const off = sharedBridge()?.onStatus(s => live && setStatus(s));
    return () => {
      live = false;
      off?.();
    };
  }, []);
  return { installed, status };
}

const linkClass = 'underline underline-offset-2 font-medium rounded focus-ring';

export default function ExtCta({ lang, spot, className = '' }: { lang: Lang; spot: CtaSpot; className?: string }) {
  const s = savedText[lang];
  const { installed, status } = useExtState();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => setAllowed(extCtaAllowed()), []);

  if (installed === null) return null;
  const row = `flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${className}`;
  const style = { color: 'var(--text-secondary)' };

  if (installed) {
    const n = status?.unavailable ?? 0;
    return (
      <div className={row} style={style} data-ext-cta="installed">
        <Puzzle className="w-4 h-4 shrink-0" aria-hidden="true" />
        <a href={BOOKMARKS_EXPORT_URL} target="_blank" rel="noopener" className={linkClass} style={{ color: 'var(--text-primary)' }}>
          {s.ctaExport}
        </a>
        {n > 0 && (
          <a href={`${savedPath(lang)}?view=removed`} className={linkClass} style={{ color: 'var(--text-primary)' }}>
            {s.ctaRemoved.replace('{n}', n.toLocaleString(lang))}
          </a>
        )}
      </div>
    );
  }

  const store = storeForNow(spot);
  if (!allowed || !store) return null;
  const href = store.href;
  return (
    <div className={row} style={style} data-ext-cta="install">
      <Puzzle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0">{s.ctaText}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={linkClass}
        style={{ color: 'var(--text-primary)' }}
        onClick={() => {
          quietExtCta();
          setAllowed(false);
          track('promo_click', { spot: `ext_${spot}`, item: 'extension' });
        }}
      >
        {store.browser === 'edge' ? s.ctaInstallEdge : s.ctaInstall}
      </a>
      <button
        type="button"
        className="text-xs underline underline-offset-2 rounded focus-ring"
        onClick={() => {
          quietExtCta();
          setAllowed(false);
          track('promo_dismiss', { spot: `ext_${spot}`, item: 'extension' });
        }}
      >
        {s.ctaNotNow}
      </button>
    </div>
  );
}

/**
 * May the after-download install row show now? Desktop Chrome/Edge with a store listing, extension not
 * detected (the bridge marks <html> at document_start, so the sync check is enough after a download),
 * no "Not now" in the last 180 days, free user. Owner request 24 Nov 2026, instead of a pop-up.
 */
export function extDownloadCtaAllowed(pro: boolean): boolean {
  return !pro && !extVersion() && extCtaAllowed() && !!storeForNow('download');
}

/** The row under the download buttons, styled like the coffee row it replaces for these visitors. */
export function ExtDownloadCta({ lang, onHide }: { lang: Lang; onHide: () => void }) {
  const s = savedText[lang];
  const store = storeForNow('download');
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current || !store) return;
    viewed.current = true;
    track('promo_view', { spot: 'ext_download', item: 'extension' });
  }, [store]);
  if (!store) return null;
  const hide = (event: 'promo_click' | 'promo_dismiss') => {
    quietExtCta();
    track(event, { spot: 'ext_download', item: 'extension' });
    onHide();
  };
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3.5 py-3 text-sm animate-slide-up"
      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
      data-ext-cta="download"
    >
      <p className="flex items-start gap-2.5 flex-1 min-w-[14rem]" style={{ color: 'var(--text-secondary)' }}>
        <Puzzle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <span className="min-w-0">{s.ctaAfterDownload}</span>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <a
          href={store.href}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold focus-ring btn-secondary whitespace-nowrap"
          style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
          onClick={() => hide('promo_click')}
        >
          {store.browser === 'edge' ? s.ctaInstallEdge : s.ctaInstall}
        </a>
        <button type="button" className="text-xs underline underline-offset-2 rounded focus-ring" style={{ color: 'var(--text-secondary)' }} onClick={() => hide('promo_dismiss')}>
          {s.ctaNotNow}
        </button>
      </div>
    </div>
  );
}

/** Mounts ExtCta into the static placeholders (`data-xt-ext-cta`, site/blocks.ts `extCtaSlot`). */
export function ExtCtaSlots({ lang }: { lang: Lang }) {
  const [slots, setSlots] = useState<HTMLElement[]>([]);
  useEffect(() => setSlots(Array.from(document.querySelectorAll<HTMLElement>('[data-xt-ext-cta]'))), []);
  return (
    <>
      {slots.map(el => {
        const spot = el.dataset.xtExtCta === 'pro' ? 'pro' : 'home';
        return createPortal(
          <ExtCta lang={lang} spot={spot} className="my-4" />,
          el,
          spot,
        );
      })}
    </>
  );
}

/**
 * Home page hero: the extension as the second way in, right under the link form (owner request 15 Nov 2026).
 * Rendered only once a store listing exists (`extAvailable()`), with the same markup as the static shell
 * (site/ext-home.ts `extHeroShell`), so taking over the page moves nothing:
 * - whether the line shows: `html.xt-ext-on`, set before first paint (`EXT_HERO_SCRIPT`: installed, or desktop
 *   Chromium without "Not now");
 * - which buttons show: CSS. Installed (`html[data-xt-ext]`) → "Export bookmarks" (+ "Unavailable bookmark copies (N)"
 *   when the extension reported some); otherwise "Add to Chrome — free" ("Add to Edge — free" in Edge, when it has its own listing), one sentence and "Not now"
 *   (quiet for 180 days, shared with the other one-line calls).
 */
export function ExtHeroCta({ lang }: { lang: Lang }) {
  const s = savedText[lang];
  const c = EXT_HOME_COPY[lang];
  const { installed, status } = useExtState();
  useEffect(() => {
    // The bridge answered after first paint (rare): show the installed line too.
    if (installed) document.documentElement.classList.add('xt-ext-on');
  }, [installed]);
  if (!extAvailable()) return null;
  const n = installed ? status?.unavailable ?? 0 : 0;
  return (
    <div className="xt-ext-hero print:hidden">
      {chromeListed() && (
        <a
          href={storeUrl('hero')}
          target="_blank"
          rel="noopener"
          className="xt-ext-hero-btn xt-ext-install xt-ext-chrome focus-ring"
          onClick={() => {
            quietExtCta();
            track('promo_click', { spot: 'ext_hero', item: 'extension' });
          }}
        >
          <Puzzle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {c.heroInstall}
        </a>
      )}
      {edgeListed() && (
        <a
          href={storeUrl('hero', EXT_EDGE_STORE_URL)}
          target="_blank"
          rel="noopener"
          className="xt-ext-hero-btn xt-ext-install xt-ext-edge focus-ring"
          onClick={() => {
            quietExtCta();
            track('promo_click', { spot: 'ext_hero', item: 'extension' });
          }}
        >
          <Puzzle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {c.heroInstallEdge}
        </a>
      )}
      <a
        href={BOOKMARKS_EXPORT_URL}
        target="_blank"
        rel="noopener"
        className="xt-ext-hero-btn xt-ext-installed focus-ring"
        onClick={() => track('promo_click', { spot: 'ext_hero', item: 'ext_export' })}
      >
        <Puzzle className="w-4 h-4 shrink-0" aria-hidden="true" />
        {s.ctaExport}
      </a>
      <span className="xt-ext-install">{s.ctaText}</span>
      <button
        type="button"
        className="xt-ext-install text-xs underline underline-offset-2 rounded focus-ring"
        onClick={() => {
          quietExtCta();
          document.documentElement.classList.remove('xt-ext-on');
          track('promo_dismiss', { spot: 'ext_hero', item: 'extension' });
        }}
      >
        {s.ctaNotNow}
      </button>
      {n > 0 && (
        <a href={`${savedPath(lang)}?view=removed`} className={linkClass} style={{ color: 'var(--text-primary)' }}>
          {s.ctaRemoved.replace('{n}', n.toLocaleString(lang))}
        </a>
      )}
    </div>
  );
}
