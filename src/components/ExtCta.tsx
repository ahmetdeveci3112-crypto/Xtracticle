import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Puzzle } from 'lucide-react';
import { savedText, type Lang } from '../i18n';
import { track } from '../lib/analytics';
import {
  BOOKMARKS_EXPORT_URL,
  createBridgeClient,
  extCtaAllowed,
  extInstalled,
  quietExtCta,
  savedPath,
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

  const href = storeUrl(spot);
  if (!allowed || !href) return null;
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
        {s.ctaInstall}
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
