import { EXT_HOME_COPY } from '../src/shared/ext-copy';
import { savedText } from '../src/i18n';
import { BOOKMARKS_EXPORT_URL, EXT_CTA_QUIET_KEY, EXT_PAGE_PATHS, extAvailable, storeUrl, type CtaSpot } from '../src/lib/ext';
import type { Lang } from './blocks';

/**
 * The browser extension on the home pages: a short section placed by site/render.ts right below the
 * first screen (hero, link form, demo loop). Rendered only while `extAvailable()`.
 *
 * No script decides what shows, so nothing moves after load:
 * - extension already in this browser (`data-xt-ext` on <html>, set by its bridge at document_start):
 *   "Export bookmarks" replaces the install button;
 * - touch screens (phones, tablets): no install button, the browser note says where it works.
 */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Install button + the "already installed" button; CSS shows one of them (src/index.css, `.xt-ext-*`). */
export function extButtons(lang: Lang, spot: CtaSpot, label = EXT_HOME_COPY[lang].install): string {
  const c = EXT_HOME_COPY[lang];
  return (
    `<a class="xt-btn xt-ext-install" href="${esc(storeUrl(spot))}" target="_blank" rel="noopener" data-track="promo_click" data-track-item="extension" data-track-spot="ext_${spot}">${esc(label)}</a>` +
    `<a class="xt-btn xt-ext-installed" href="${BOOKMARKS_EXPORT_URL}" target="_blank" rel="noopener" data-track="promo_click" data-track-item="ext_export" data-track-spot="ext_${spot}">${esc(c.exportBookmarks)}</a>`
  );
}

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
  <p class="xt-ext-note">${esc(c.note)}</p>
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
    `<a href="${esc(storeUrl('hero'))}" target="_blank" rel="noopener" class="xt-ext-hero-btn xt-ext-install focus-ring">${PUZZLE}${esc(c.heroInstall)}</a>` +
    `<a href="${BOOKMARKS_EXPORT_URL}" target="_blank" rel="noopener" class="xt-ext-hero-btn xt-ext-installed focus-ring">${PUZZLE}${esc(s.ctaExport)}</a>` +
    `<span class="xt-ext-install">${esc(s.ctaText)}</span>` +
    `<button type="button" class="xt-ext-install text-xs underline underline-offset-2 rounded focus-ring">${esc(s.ctaNotNow)}</button>` +
    `</div>`;
}

/**
 * Runs in <head> on home pages (site/render.ts `config`): `xt-ext-on` when the extension is installed,
 * or on desktop Chromium while "Not now" is not in effect. Same rules as `isDesktopChromium` and
 * `extCtaAllowed` in src/lib/ext.ts (test/unit/site-ext-home.test.ts runs both on the same user agents).
 */
export const EXT_HERO_SCRIPT = `(function(){var h=document.documentElement,n=navigator;function cr(){var d=n.userAgentData,u=n.userAgent||'';if(d&&Array.isArray(d.brands)){if(d.mobile)return false;if(d.brands.some(function(b){return/^(Chromium|Google Chrome|Microsoft Edge|Opera|Brave)$/.test(b.brand)}))return true}if(/Mobi|Android|iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS/i.test(u))return false;if(/Firefox\\//.test(u))return false;return/\\b(Chrome|Edg|OPR)\\/\\d/.test(u)}var q=false;try{q=Date.now()>Number(localStorage.getItem('${EXT_CTA_QUIET_KEY}')||0)}catch(e){}if(h.dataset.xtExt||(q&&cr()))h.classList.add('xt-ext-on')})()`;
