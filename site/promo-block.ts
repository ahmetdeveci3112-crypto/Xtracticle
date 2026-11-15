import type { SitePage } from './blocks';
import {
  PROMO_COPY,
  PROMO_ENABLED,
  productsFor,
  promoCta,
  promoImage,
  promoLang,
  promoPrice,
  promoUrl,
  type PromoContext,
} from '../src/shared/promo';

/**
 * "From the maker of Xtracticle" strip (products in src/shared/promo.ts), placed by site/render.ts
 * just above the FAQ on home pages and deleted-tweet pages. Three cards, one quiet section.
 *
 * - Hidden for Pro users (`html.xt-has-pro`, set before first paint by the config script).
 * - The static HTML lists the whole pool; the small script below keeps 3 in a weighted random order
 *   on every page view, so the products rotate without any motion. Without JS the first 3 show.
 * - `promo_view` is sent once when the strip scrolls into view; clicks go out as `promo_click`
 *   (delegated `data-track` listener in render.ts, with `data-track-item`).
 */

const DELETED_GROUPS = new Set([
  'deleted-finder',
  'deleted-tracker',
  'guide-recover-deleted-tweets',
  'guide-how-to-see-deleted-tweets',
  'guide-find-tweets-on-wayback-machine',
]);

export function promoSpot(page: SitePage): PromoContext | null {
  if (!PROMO_ENABLED || page.noindex) return null;
  if (page.isHome) return 'home';
  if (DELETED_GROUPS.has(page.group)) return 'deleted';
  return null;
}

const SHOW = 3;

/** Keeps the brand name out of language-specific uppercasing (Turkish would print XTRACTİCLE). */
const brand = (html: string) => html.replace('Xtracticle', '<span lang="en">Xtracticle</span>');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Picks SHOW cards by data-w weight, reorders them, reveals them; then reports one promo_view.
const SCRIPT = `<script>(function(){var s=document.currentScript.previousElementSibling,l=s.querySelector('.xt-promo-cards'),a=[].slice.call(l.children),o=[];while(a.length){var t=0,i=0;a.forEach(function(e){t+=+e.dataset.w});var r=Math.random()*t;while(i<a.length-1&&(r-=+a[i].dataset.w)>=0)i++;o.push(a.splice(i,1)[0])}o.forEach(function(e,k){e.hidden=k>=${SHOW};l.appendChild(e)});if(!('IntersectionObserver'in window))return;var v=new IntersectionObserver(function(x){if(!x[0].isIntersecting)return;v.disconnect();if(document.documentElement.classList.contains('xt-has-pro'))return;var c=window.__XT__||{};try{window.gtag('event','promo_view',{spot:s.dataset.spot,item:o.slice(0,${SHOW}).map(function(e){return e.dataset.id}).join(','),lang:c.lang,page:c.page})}catch(e){}},{threshold:.4});v.observe(s)})()</script>`;

export function promoBlock(page: SitePage): string {
  const spot = promoSpot(page);
  if (!spot) return '';
  const lang = promoLang(page.lang);
  const c = PROMO_COPY[lang];
  const cards = productsFor(spot)
    .map((p, i) => {
      const href = promoUrl(p, spot);
      return `<li data-id="${p.id}" data-w="${p.weight}"${i >= SHOW ? ' hidden' : ''}>
    <a href="${href}" rel="noopener sponsored" target="_blank" data-track="promo_click" data-track-item="${p.id}" data-track-spot="${spot}">
      <img src="${promoImage(p)}" alt="" width="320" height="180" loading="lazy" decoding="async">
      <span class="xt-promo-name" lang="en">${esc(p.name)}</span>
      <span class="xt-promo-pitch">${esc(p.pitch[lang])}</span>
      <span class="xt-promo-foot"><span class="xt-promo-price${p.price ? '' : ' is-free'}">${esc(promoPrice(p, lang))}</span><span class="xt-promo-cta">${esc(promoCta(p, lang))} <span aria-hidden="true">${lang === 'ar' ? '←' : '→'}</span></span></span>
    </a>
  </li>`;
    })
    .join('\n  ');
  return `
<section class="xt-promo" data-spot="${spot}" aria-labelledby="xt-promo-h">
  <p class="xt-promo-label">${brand(esc(c.label))}</p>
  <h2 id="xt-promo-h">${esc(c.h2)}</h2>
  <p class="xt-promo-lead">${esc(c.lead)}</p>
  <ul class="xt-promo-cards">
  ${cards}
  </ul>
</section>${SCRIPT}`;
}
