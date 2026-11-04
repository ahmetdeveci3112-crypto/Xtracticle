import { useEffect, useRef } from 'react';
import type { Strings } from '../i18n';
import { track } from '../lib/analytics';
import { coffeeUrl } from '../shared/support';

/**
 * "Buy me a coffee" row: after a successful download and at the end of the archive panel.
 * Free users only. "Not now" keeps it away for 30 days, a click for 90 (one shared timestamp).
 */

export type TipPlace = 'after_download' | 'archive_panel';

const QUIET_KEY = 'xtracticle_tip_until';
const NOT_NOW_MS = 30 * 24 * 3600 * 1000;
const CLICKED_MS = 90 * 24 * 3600 * 1000;

/** May the row be shown right now? */
export function tipAllowed(pro: boolean): boolean {
  if (pro || !coffeeUrl('app')) return false;
  try {
    return Date.now() > Number(localStorage.getItem(QUIET_KEY) || 0);
  } catch {
    return true;
  }
}

function quiet(ms: number) {
  try {
    localStorage.setItem(QUIET_KEY, String(Date.now() + ms));
  } catch { /* private mode: it simply comes back next time */ }
}

/** Small cup in Buy Me a Coffee yellow; the footer (site/render.ts) draws the same one. */
export function CoffeeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="#FFDD00" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3v3M12 3v3" />
    </svg>
  );
}

export default function TipRow({ t, place, short = false, onHide }: { t: Strings; place: TipPlace; short?: boolean; onHide: () => void }) {
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    track('tip_view', { place });
  }, [place]);

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3.5 py-3 text-sm animate-slide-up"
      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
    >
      <p className="flex items-start gap-2.5 flex-1 min-w-[14rem]" style={{ color: 'var(--text-secondary)' }}>
        <CoffeeIcon className="w-5 h-5 shrink-0" />
        <span className="min-w-0">{short ? t.tipShort : t.tipText}</span>
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <a
          href={coffeeUrl(place === 'archive_panel' ? 'archive' : 'app')}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold focus-ring btn-secondary whitespace-nowrap"
          style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
          onClick={() => {
            quiet(CLICKED_MS);
            track('tip_click', { place });
            onHide();
          }}
        >
          {t.tipCta}
        </a>
        <button
          type="button"
          onClick={() => {
            quiet(NOT_NOW_MS);
            track('tip_dismiss', { place });
            onHide();
          }}
          className="text-xs underline underline-offset-2 rounded focus-ring whitespace-nowrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t.tipDismiss}
        </button>
      </div>
    </div>
  );
}
