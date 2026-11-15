import { isSavedPath } from '../shared/bridge';
import { COUNTER_EVENTS, isCounterEvent, type CounterEvent, type SiteEvent } from '../shared/events';

type Params = Record<string, string | number | boolean | undefined>;

/**
 * GA4 event helper — `gtag` is stubbed in index.html and loaded after `load`. Event names: src/shared/events.ts.
 *
 * The /saved page loads no GA (docs/chrome-extension-plan.md, owner decision 9): there, events on the
 * counter whitelist go to the Worker's anonymous counter instead and everything else is dropped.
 */
export function track(event: SiteEvent, params: Params = {}) {
  if (typeof location !== 'undefined' && isSavedPath(location.pathname)) {
    if (isCounterEvent(event)) {
      const key = COUNTER_EVENTS[event];
      countEvent(event, key ? params[key] : undefined);
    }
    return;
  }
  try {
    (window as any).gtag?.('event', event, params);
  } catch {
    /* analytics must never break the app */
  }
}

/** One anonymous daily count (`POST /api/ext/event`, src/shared/ext.ts). Only the name and one short parameter leave the page. */
export function countEvent(name: CounterEvent, param?: string | number | boolean) {
  const p = typeof param === 'string' && /^[a-z0-9_+-]{1,24}$/.test(param) ? param : undefined;
  try {
    void fetch('/api/ext/event', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', 'X-Xt-Client': 'web' },
      body: JSON.stringify(p ? { name, param: p } : { name }),
    }).catch(() => {});
  } catch {
    /* never break the app */
  }
}
