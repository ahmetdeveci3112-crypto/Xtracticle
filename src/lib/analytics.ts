/** GA4 event helper — `gtag` is stubbed in index.html and loaded after `load`. */
export function track(event: string, params: Record<string, string | number | boolean | undefined> = {}) {
  try {
    (window as any).gtag?.('event', event, params);
  } catch {
    /* analytics must never break the app */
  }
}
