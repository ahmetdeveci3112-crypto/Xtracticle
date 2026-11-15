/**
 * MAIN-world script on x.com, document_start (docs/chrome-extension-plan.md, B3).
 *
 * Phase 2 wraps fetch / XMLHttpRequest here and forwards the response bodies of the GraphQL
 * operations listed in public/ext/config.json to content.js with window.postMessage. It never
 * changes a request, reads headers or stores anything.
 *
 * Placeholder for now: it only marks that it ran, so the manifest wiring can be checked.
 */
(() => {
  const root = document.documentElement as HTMLElement | null;
  if (root) root.dataset.xtHook = '1';
})();
