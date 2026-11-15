import type { SiteEvent } from '../shared/events';

/** GA4 event helper — `gtag` is stubbed in index.html and loaded after `load`. Event names: src/shared/events.ts. */
export function track(event: SiteEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  try {
    (window as any).gtag?.('event', event, params);
  } catch {
    /* analytics must never break the app */
  }
}
