/**
 * Analytics event names shared by the site and the browser extension (docs/chrome-extension-plan.md, A6).
 *
 * The site sends these to GA4 (`src/lib/analytics.ts` → `track()`, which only accepts a `SiteEvent`).
 * The static pages' inline scripts (site/pro-page.ts, site/render.ts `data-track`, site/promo-block.ts)
 * cannot import this file; test/unit/events.test.ts checks that every name they use is listed here.
 *
 * Inside the extension (on x.com) nothing goes to GA: events are counted by the Worker
 * (`POST /api/ext/event`, src/shared/ext.ts) under the same names, so a "download" means the same
 * thing in both reports. Only the names in `COUNTER_EVENTS` are accepted there.
 */

/** Every GA4 event the site sends today. Adding a name here is all a new `track()` call needs. */
export const SITE_EVENTS = [
  // Finder / extraction (src/App.tsx)
  'profile_input',
  'extract',
  'extract_error',
  'deep_link',
  'profile_posts',
  'tweet_search',
  'batch_extract',
  // Output (src/App.tsx)
  'download',
  'download_done',
  'download_error',
  'copy',
  'share',
  'listen',
  // Navigation and demo (src/App.tsx)
  'pro_nav_click',
  'demo_open',
  'demo_complete',
  'error_link',
  'language_switch',
  // Tips and promos (src/components/TipRow.tsx, PromoCard.tsx, site/promo-block.ts)
  'tip_view',
  'tip_click',
  'tip_dismiss',
  'promo_view',
  'promo_click',
  'promo_dismiss',
  // Pro (src/lib/pro.ts, site/pro-page.ts, site/home-pro.ts)
  'pro_view',
  'pro_activate',
  'pro_signout',
  'pro_checkout_click',
  'pro_checkout_success',
  'pro_csv',
  'home_pro_click',
  // Archive finder (src/components/ArchivePanel.tsx)
  'archive_search',
  'archive_open',
  'archive_pro_teaser',
  // Watch and its trial (ArchivePanel.tsx, site/pro-page.ts)
  'watch_cta',
  'watch_view',
  'watch_add',
  'watch_add_error',
  'watch_delete',
  'watch_email_set',
  'watch_feed_copy',
  'watch_now_click',
  'watch_prefill',
  'trial_view',
  'trial_cta',
  'trial_start',
  'trial_resend',
  'trial_mode',
  'trial_notice',
  'trial_end',
  'trial_keep_click',
] as const;
export type SiteEvent = (typeof SITE_EVENTS)[number];

/** Events that exist only in the extension (A6). */
export const EXT_ONLY_EVENTS = [
  'ext_install',
  'bookmarks_capture',
  'saved_open',
  'removed_found',
  'parse_fail',
] as const;
export type ExtOnlyEvent = (typeof EXT_ONLY_EVENTS)[number];

/**
 * The Worker counter's whitelist: event name → the one parameter whose value is kept (or null).
 * Site names keep their GA4 meaning; the parameter is the same one the site sends to GA.
 */
export const COUNTER_EVENTS = {
  download: 'format',
  copy: null,
  extract: 'kind',
  watch_cta: 'action',
  pro_nav_click: null,
  profile_input: 'input',
  ext_install: null,
  bookmarks_capture: 'bucket',
  saved_open: null,
  removed_found: null,
  parse_fail: 'op',
} as const satisfies Partial<Record<SiteEvent | ExtOnlyEvent, string | null>>;
export type CounterEvent = keyof typeof COUNTER_EVENTS;

export const isCounterEvent = (name: unknown): name is CounterEvent =>
  typeof name === 'string' && Object.prototype.hasOwnProperty.call(COUNTER_EVENTS, name);

/** Where an event happened. On the site this rides along as a GA4 parameter (`surface: 'ext'` after an extension link). */
export type Surface = 'web' | 'ext';

/** `bookmarks_capture` reports a bucket, never an exact count. */
export function countBucket(n: number): string {
  if (!(n > 0)) return '0';
  if (n <= 10) return '1-10';
  if (n <= 100) return '11-100';
  if (n <= 500) return '101-500';
  if (n <= 2000) return '501-2000';
  return '2000+';
}
