/**
 * Toolbar popup (plain HTML + TS, no React; docs/chrome-extension-plan.md, B2).
 * This phase shows the name and version only; brand tokens come from src/shared/brand.ts.
 */
import { DARK, LIGHT, RADIUS, cssVars, logoSvg } from '../../../src/shared/brand';

(() => {
  const style = document.createElement('style');
  style.textContent =
    `:root { ${cssVars(LIGHT)} --radius-lg: ${RADIUS.lg}; }` +
    `@media (prefers-color-scheme: dark) { :root { ${cssVars(DARK)} } }`;
  document.head.appendChild(style);

  const logo = document.getElementById('xt-logo');
  if (logo) logo.innerHTML = logoSvg(18);
  const version = document.getElementById('xt-version');
  if (version) version.textContent = chrome.runtime.getManifest().version;
})();
