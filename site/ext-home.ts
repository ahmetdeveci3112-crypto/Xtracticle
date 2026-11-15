import { EXT_HOME_COPY } from '../src/shared/ext-copy';
import { savedText } from '../src/i18n';
import { BOOKMARKS_EXPORT_URL, EXT_CTA_QUIET_KEY, EXT_EDGE_STORE_URL, EXT_PAGE_PATHS, EXT_STORE_URL, chromeListed, edgeListed, extAvailable, storeUrl, type CtaSpot } from '../src/lib/ext';
import type { Lang } from './blocks';

/**
 * The browser extension on the home pages: a short section placed by site/render.ts right below the
 * first screen (hero, link form, demo loop). Rendered only while `extAvailable()`.
 *
 * No script decides what shows, so nothing moves after load:
 * - extension already in this browser (`data-xt-ext` on <html>, set by its bridge at document_start):
 *   "Export bookmarks" replaces the install button;
 * - touch screens (phones, tablets): no install button, the browser note says where it works;
 * - which store: one install link per listing, `.xt-ext-chrome` and `.xt-ext-edge`; `html.xt-edge` (set before
 *   first paint by `extHeroScript`, only when an Edge listing exists) shows the Edge one and hides the Chrome one.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Install button(s) + the "already installed" button; CSS shows one of them (src/index.css, `.xt-ext-*`).
 * One install link per store listing that exists: Chrome Web Store (`xt-ext-chrome`) and Edge Add-ons (`xt-ext-edge`).
 */
export function extButtons(lang: Lang, spot: CtaSpot): string {
  const c = EXT_HOME_COPY[lang];
  const link = (cls: string, href: string, label: string) =>
    `<a class="xt-btn xt-ext-install ${cls}" href="${esc(href)}" target="_blank" rel="noopener" data-track="promo_click" data-track-item="extension" data-track-spot="ext_${spot}">${esc(label)}</a>`;
  return (
    (chromeListed() ? link('xt-ext-chrome', storeUrl(spot), c.install) : '') +
    (edgeListed() ? link('xt-ext-edge', storeUrl(spot, EXT_EDGE_STORE_URL), c.installEdge) : '') +
    `<a class="xt-btn xt-ext-installed" href="${BOOKMARKS_EXPORT_URL}" target="_blank" rel="noopener" data-track="promo_click" data-track-item="ext_export" data-track-spot="ext_${spot}">${esc(c.exportBookmarks)}</a>`
  );
}

/** The browser note under the buttons: Chrome-family list, or Edge only while there is no Chrome listing. */
export const extNote = (lang: Lang): string => (chromeListed() ? EXT_HOME_COPY[lang].note : EXT_HOME_COPY[lang].noteEdgeOnly);

/**
 * The 12-second silent loop. Fixed size (no layout shift), `preload="none"` until it is on screen, `muted playsinline`.
 * Without JS, or when the visitor asked for reduced motion, it does not play by itself: poster + native controls.
 * Otherwise the script plays it only while visible, swaps the native controls for one small Pause/Play
 * button (WCAG 2.2.2), and a pause by the visitor sticks.
 */
export function extLoopVideo(lang: Lang): string {
  const c = EXT_HOME_COPY[lang];
  return `<figure class="xt-ext-media">
    <video data-xt-loop muted loop playsinline controls preload="none" poster="/video/ext-loop.webp" width="1280" height="720" aria-label="${esc(c.video)}">
      <source src="/video/ext-loop.webm" type="video/webm">
      <source src="/video/ext-loop.mp4" type="video/mp4">
    </video>
    <button type="button" class="xt-ext-pause" aria-pressed="false" data-play="${esc(c.play)}" hidden>${esc(c.pause)}</button>
  </figure><script>(function(){var f=document.currentScript.previousElementSibling,v=f.querySelector('video'),b=f.querySelector('button'),t=b.textContent,u=false,s=false;if(!('IntersectionObserver'in window))return;try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return}catch(e){}v.removeAttribute('controls');v.muted=true;b.hidden=false;function go(){var p=v.play();if(p&&p.catch)p.catch(function(){})}b.addEventListener('click',function(){u=!u;b.setAttribute('aria-pressed',String(u));b.textContent=u?b.getAttribute('data-play'):t;if(u)v.pause();else if(s)go()});new IntersectionObserver(function(x){s=x[0].isIntersecting;if(s&&!u)go();else v.pause()},{threshold:.35}).observe(v)})()</script>`;
}

export function extHomeBlock(lang: Lang): string {
  if (!extAvailable()) return '';
  const c = EXT_HOME_COPY[lang];
  const sep = lang === 'ja' || lang === 'zh' ? '：' : ': ';
  return `
<section class="xt-ext" aria-labelledby="xt-ext-h">
  <p class="xt-ext-label">${esc(c.label)}</p>
  <h2 id="xt-ext-h">${esc(c.h2)}</h2>
  <ul class="xt-ext-points">${c.points.map(([b, rest]) => `<li><strong>${esc(b)}</strong>${sep}${esc(rest)}</li>`).join('')}</ul>
  <div class="xt-ext-actions">${extButtons(lang, 'section')}<a class="xt-ext-more" href="${EXT_PAGE_PATHS[lang]}">${esc(c.more)} <span aria-hidden="true">${lang === 'ar' ? '←' : '→'}</span></a></div>
  <p class="xt-ext-note">${esc(extNote(lang))}</p>
  ${extLoopVideo(lang)}
</section>`;
}

/* ─── Hero line under the link form ─── */

/** lucide-react `Puzzle`, as React renders it (same box: 16 × 16). */
const PUZZLE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-puzzle w-4 h-4 shrink-0" aria-hidden="true"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z"></path></svg>';

/**
 * The hero line in the static shell, identical to React's `ExtHeroCta` (src/components/ExtCta.tsx), so the
 * page does not move when the app takes over. Whether it shows is decided before first paint by
 * `EXT_HERO_SCRIPT` (class `xt-ext-on` on <html>); which buttons show, by CSS (`data-xt-ext`, touch screens).
 */
export function extHeroShell(lang: Lang): string {
  if (!extAvailable()) return '';
  const c = EXT_HOME_COPY[lang];
  const s = savedText[lang];
  return `<div class="xt-ext-hero">` +
    (chromeListed() ? `<a href="${esc(storeUrl('hero'))}" target="_blank" rel="noopener" class="xt-ext-hero-btn xt-ext-install xt-ext-chrome focus-ring">${PUZZLE}${esc(c.heroInstall)}</a>` : '') +
    (edgeListed() ? `<a href="${esc(storeUrl('hero', EXT_EDGE_STORE_URL))}" target="_blank" rel="noopener" class="xt-ext-hero-btn xt-ext-install xt-ext-edge focus-ring">${PUZZLE}${esc(c.heroInstallEdge)}</a>` : '') +
    `<a href="${BOOKMARKS_EXPORT_URL}" target="_blank" rel="noopener" class="xt-ext-hero-btn xt-ext-installed focus-ring">${PUZZLE}${esc(s.ctaExport)}</a>` +
    `<span class="xt-ext-install">${esc(s.ctaText)}</span>` +
    `<button type="button" class="xt-ext-install text-xs underline underline-offset-2 rounded focus-ring">${esc(s.ctaNotNow)}</button>` +
    `</div>`;
}

/**
 * Runs in <head> on home pages and the /chrome-extension pages (site/render.ts `config`), before first paint:
 * - `xt-ext-on`: the extension is installed, or this browser has a store to install from and "Not now" is not
 *   in effect (the hero line shows);
 * - `xt-edge`: desktop Edge while an Edge listing exists (CSS swaps the Chrome button for the Edge one).
 * `chrome` / `edge` say which listings exist. Same rules as `isDesktopChromium`, `isEdge`, `storeFor` and
 * `extCtaAllowed` in src/lib/ext.ts (test/unit/site-ext-home.test.ts runs both on the same user agents).
 */
export const extHeroScript = (chrome: boolean, edge: boolean): string =>
  `(function(){var h=document.documentElement,n=navigator,C=${chrome},E=${edge};function cr(){var d=n.userAgentData,u=n.userAgent||'';if(d&&Array.isArray(d.brands)){if(d.mobile)return false;if(d.brands.some(function(b){return/^(Chromium|Google Chrome|Microsoft Edge|Opera|Brave)$/.test(b.brand)}))return true}if(/Mobi|Android|iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS/i.test(u))return false;if(/Firefox\\//.test(u))return false;return/\\b(Chrome|Edg|OPR)\\/\\d/.test(u)}function ed(){var d=n.userAgentData;return!!(d&&Array.isArray(d.brands)&&d.brands.some(function(b){return b.brand==='Microsoft Edge'}))||/\\bEdg\\/\\d/.test(n.userAgent||'')}var q=false;try{q=Date.now()>Number(localStorage.getItem('${EXT_CTA_QUIET_KEY}')||0)}catch(e){}var m=cr(),e=m&&E&&ed();if(e)h.classList.add('xt-edge');if(h.dataset.xtExt||(q&&m&&(e||C)))h.classList.add('xt-ext-on')})()`;

/** The script for the committed listings. */
export const EXT_HERO_SCRIPT = (): string => extHeroScript(chromeListed(EXT_STORE_URL), edgeListed(EXT_EDGE_STORE_URL));
