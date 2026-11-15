/**
 * Service worker (ES module): the only writer of the extension's storage and the only place that
 * calls xtracticle.com (docs/chrome-extension-plan.md, B3). No state is kept in memory between wake-ups.
 *
 * Skeleton for now: it records the install time. Pro status (GET /api/pro/me with the site's cookie,
 * A2), the local archive and the counter queue come in the next phases.
 */
import { XT_BASE, XT_VERSION } from '../config';

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') void chrome.storage.local.set({ installedAt: new Date().toISOString(), installedVersion: XT_VERSION });
});

/** Every call to the site goes through here: the site's own cookie and the app-client header (src/shared/client.ts). */
export function siteFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('X-Xt-Client', 'ext');
  return fetch(`${XT_BASE}${path}`, { ...init, headers, credentials: 'include' });
}
