/**
 * Content script on xtracticle.com, document_start: the site ↔ extension bridge (docs/chrome-extension-plan.md, A1).
 * Contract and validators: src/shared/bridge.ts; message handling: ./logic.ts.
 *
 *   - marks <html data-xt-ext="<version>"> and posts `xt:hello` (now and on DOMContentLoaded);
 *   - posts `xt:status` on every page after the hello (the site does not ask for it);
 *   - follows the site's language: its stored choice (`xtracticle_lang`), else <html lang>;
 *   - answers the site's messages (logic.ts), `xt:saved:*` on /saved only.
 */
import { DATASET_KEY, isTrustedEvent, message, parseSiteMessage, type ExtMessage } from '../../../src/shared/bridge';
import { XT_ORIGIN, XT_VERSION } from '../config';
import { siteLang } from '../lang';
import { send } from '../messages';
import { handleSiteMessage, sendStatus, type BridgeDeps } from './logic';

(() => {
  if (location.origin !== XT_ORIGIN) return;
  const root = document.documentElement as HTMLElement | null;
  if (root) root.dataset[DATASET_KEY] = XT_VERSION;

  const deps: BridgeDeps = {
    send,
    post: (m: ExtMessage) => window.postMessage(m, XT_ORIGIN),
    pathname: () => location.pathname,
  };

  const announce = () => {
    deps.post(message<ExtMessage>({ type: 'xt:hello', version: XT_VERSION }));
    void sendStatus(deps);
  };

  const syncLang = () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('xtracticle_lang');
    } catch {
      /* storage blocked */
    }
    const lang = siteLang(stored, document.documentElement?.getAttribute('lang') || null);
    if (lang) void send({ type: 'lang:set', lang });
  };

  window.addEventListener('message', event => {
    if (!isTrustedEvent(event, window, XT_ORIGIN)) return;
    const msg = parseSiteMessage(event.data);
    if (msg) void handleSiteMessage(msg, deps);
  });

  announce();
  // The site's scripts may load after document_start; say hello again once the page is parsed.
  if (document.readyState === 'loading')
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        announce();
        syncLang();
      },
      { once: true },
    );
  else syncLang();
})();
