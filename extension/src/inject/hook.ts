/**
 * MAIN-world script on x.com, document_start (docs/chrome-extension-plan.md, B3): wraps fetch and
 * XMLHttpRequest and forwards the bodies of the listened GraphQL operations to content.js. Logic and
 * contract: ./wrap.ts.
 */
import { install } from './wrap';

(() => {
  try {
    install(window as unknown as Parameters<typeof install>[0]);
  } catch {
    /* never break x.com */
  }
})();
