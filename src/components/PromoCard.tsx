import { useEffect, useRef } from 'react';
import { track } from '../lib/analytics';
import {
  PROMO_COPY,
  PROMO_ENABLED,
  productsFor,
  promoCta,
  promoImage,
  promoLang,
  promoPrice,
  promoUrl,
  weightedShuffle,
  type PromoProduct,
} from '../shared/promo';

/**
 * One "From the maker of Xtracticle" card after a download (products in src/shared/promo.ts).
 * Free users only. It takes the coffee row's place on the first download of the day (never both, so
 * there is only one extra line under the download buttons). "Not now" or a click: 30 days.
 */

const QUIET_KEY = 'xtracticle_promo_until';
const DAY_MS = 24 * 3600 * 1000;
const NOT_NOW_MS = 30 * DAY_MS;
const CLICKED_MS = 30 * DAY_MS;

export function promoAllowed(pro: boolean): boolean {
  if (pro || !PROMO_ENABLED) return false;
  try {
    return Date.now() > Number(localStorage.getItem(QUIET_KEY) || 0);
  } catch {
    return false; // no storage → no way to keep it quiet, so do not show it at all
  }
}

function quiet(ms: number) {
  try {
    const until = Date.now() + ms;
    if (until > Number(localStorage.getItem(QUIET_KEY) || 0)) localStorage.setItem(QUIET_KEY, String(until));
  } catch { /* checked in promoAllowed */ }
}

export const pickAppPromo = (): PromoProduct => weightedShuffle(productsFor('app'))[0];

export default function PromoCard({ product, lang: uiLang, onHide }: { product: PromoProduct; lang: string; onHide: () => void }) {
  const lang = promoLang(uiLang);
  const c = PROMO_COPY[lang];
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    quiet(DAY_MS);
    track('promo_view', { spot: 'app', item: product.id });
  }, [product.id]);

  return (
    <div
      className="flex items-center gap-3 rounded-xl p-2.5 pe-3.5 text-sm animate-slide-up"
      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
    >
      <img src={promoImage(product)} alt="" width={96} height={54} className="hidden sm:block w-24 shrink-0 rounded-lg" style={{ aspectRatio: '16 / 9' }} />
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          {/* Brand in its own lang so Turkish uppercasing does not print XTRACTİCLE. */}
          {c.label.split('Xtracticle').map((part, i) => (i ? [<span key={i} lang="en">Xtracticle</span>, part] : part))}
        </p>
        <p className="leading-snug" style={{ color: 'var(--text-secondary)' }}>
          <span lang="en" className="font-semibold" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
          {' · '}
          <span className="font-medium" style={{ color: product.price ? 'var(--text-secondary)' : undefined }}>{promoPrice(product, lang)}</span>
          <span className="hidden md:inline"> — {product.pitch[lang]}</span>
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 shrink-0">
        <a
          href={promoUrl(product, 'app')}
          target="_blank"
          rel="noopener sponsored"
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold focus-ring btn-secondary whitespace-nowrap"
          style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-secondary)' }}
          onClick={() => {
            quiet(CLICKED_MS);
            track('promo_click', { spot: 'app', item: product.id });
            onHide();
          }}
        >
          {promoCta(product, lang)}
        </a>
        <button
          type="button"
          onClick={() => {
            quiet(NOT_NOW_MS);
            track('promo_dismiss', { spot: 'app', item: product.id });
            onHide();
          }}
          className="text-xs underline underline-offset-2 rounded focus-ring whitespace-nowrap"
          style={{ color: 'var(--text-secondary)' }}
        >
          {c.notNow}
        </button>
      </div>
    </div>
  );
}
