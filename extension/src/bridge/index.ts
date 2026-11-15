/**
 * Content script on xtracticle.com, document_start: the site ↔ extension bridge (docs/chrome-extension-plan.md, A1).
 * Contract and validators: src/shared/bridge.ts.
 *
 * This phase only announces the extension: `data-xt-ext="<version>"` on <html> and one `xt:hello`.
 * Incoming site messages are validated and otherwise ignored until the /saved and Pro sync steps.
 */
import { DATASET_KEY, isTrustedEvent, message, parseSiteMessage, type ExtMessage } from '../../../src/shared/bridge';
import { XT_ORIGIN, XT_VERSION } from '../config';

(() => {
  if (location.origin !== XT_ORIGIN) return;
  const root = document.documentElement as HTMLElement | null;
  if (root) root.dataset[DATASET_KEY] = XT_VERSION;

  const hello = () => window.postMessage(message<ExtMessage>({ type: 'xt:hello', version: XT_VERSION }), XT_ORIGIN);
  hello();

  window.addEventListener('message', event => {
    if (!isTrustedEvent(event, window, XT_ORIGIN)) return;
    const msg = parseSiteMessage(event.data);
    if (!msg) return;
    // Later phases: xt:pro-changed → SW re-reads /api/pro/me; xt:lang-changed → storage; xt:saved:* on /saved only.
  });

  // The site's scripts may load after document_start; answer again once the page is parsed.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hello, { once: true });
})();
