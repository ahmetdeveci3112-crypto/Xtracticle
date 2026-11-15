/**
 * The bookmarks panel's auto-scroll rules (docs/chrome-extension-plan.md, B4 "Hesap koruma"), as pure
 * functions so every stop rule is unit-tested. bookmarks-panel.ts drives the timer and the DOM.
 *
 *   step        toward the end of the list, 2.5–3.5 screens at most (random), every 1.2–2.5 s (random),
 *               never while the tab is hidden. X asks for the next Bookmarks page only when the end of the
 *               list comes within ~1.5 screens (seen on x.com, Nov 2026), so short steps never got there in time.
 *   stop        at the bottom of the page, 3 steps in a row (and ≥ 6 s) with no
 *               response bringing a new bookmark                            → 'end'
 *               a listened Bookmarks answer was 429 or ≥ 500                 → 'throttled'
 *               2 pages in a row whose bookmarks were all already archived  → 'uptodate'
 *                 (only when an earlier scan of this account reached the end of the list)
 *               2,000 bookmarks seen in this scan                           → 'limit'
 *               a response X sent in a shape the mapper did not recognise  → 'format'
 *               the user pressed Stop                                       → 'user'
 * The extension never calls X itself: it only scrolls the page X already shows.
 */

export const SCAN = {
  /** A step is at most this many screens, plus up to `stepJitter` more (random). */
  stepScreens: 2.5,
  stepJitter: 1,
  /** Within this many px of the page's bottom counts as "at the bottom". */
  bottomSlack: 200,
  minDelayMs: 1200,
  maxDelayMs: 2500,
  idleSteps: 3,
  idleMs: 6000,
  knownPages: 2,
  sessionMax: 2000,
} as const;

export type StopReason = 'end' | 'throttled' | 'uptodate' | 'limit' | 'format' | 'user';

export interface ScanState {
  running: boolean;
  /** Distinct bookmark ids seen since the scan started. */
  seen: Set<string>;
  /** Steps taken at the bottom of the page since the last response that brought at least one new id. */
  idle: number;
  /** When the first of those steps was taken (ms), null while idle is 0. */
  idleSince: number | null;
  /** The 'uptodate' rule applies: an earlier scan of this account reached the end of the list. */
  incremental: boolean;
  /** Pages in a row with every bookmark already archived. */
  knownInRow: number;
  stopped: StopReason | null;
}

/**
 * `seed`: bookmarks X already loaded on the page before the scan started (they count too).
 * `incremental`: false until a scan of the account has reached the list's end (then 'uptodate' never fires).
 */
export const newScan = (seed: Iterable<string> = [], incremental = true): ScanState => ({ running: true, seen: new Set([...seed].slice(0, SCAN.sessionMax)), idle: 0, idleSince: null, incremental, knownInRow: 0, stopped: null });

/** One listened Bookmarks response during the scan. */
export interface ScanResponse {
  /** Top-level bookmark ids of the page, in order. */
  ids: string[];
  /** Of those, how many had no archived row before (from the SW); null = unknown (archive off). */
  fresh: number | null;
  /** The mapper recognised the body (GqlResult.recognized). */
  recognized: boolean;
  /** Set for a status-only message: 429 / 5xx. */
  status?: number;
}

const stop = (s: ScanState, reason: StopReason): ScanState => ({ ...s, running: false, stopped: s.stopped ?? reason });

export function onResponse(s: ScanState, r: ScanResponse): ScanState {
  if (!s.running) return s;
  if (r.status !== undefined) return stop(s, 'throttled');
  if (!r.recognized) return stop(s, 'format');
  const seen = new Set(s.seen);
  let added = 0;
  for (const id of r.ids) {
    if (seen.size >= SCAN.sessionMax) break;
    if (!seen.has(id)) {
      seen.add(id);
      added++;
    }
  }
  const allKnown = r.ids.length > 0 && r.fresh === 0;
  let next: ScanState = { ...s, seen, idle: added > 0 ? 0 : s.idle, idleSince: added > 0 ? null : s.idleSince, knownInRow: allKnown ? s.knownInRow + 1 : r.ids.length ? 0 : s.knownInRow };
  if (seen.size >= SCAN.sessionMax) next = stop(next, 'limit');
  else if (next.incremental && next.knownInRow >= SCAN.knownPages) next = stop(next, 'uptodate');
  return next;
}

/** Where the page is: scrollY, innerHeight, document.documentElement.scrollHeight. */
export interface ScrollPos {
  y: number;
  viewport: number;
  height: number;
}

export const atBottom = (p: ScrollPos) => p.y + p.viewport >= p.height - SCAN.bottomSlack;

/**
 * One scroll step is about to be taken (call before scrolling), `at` = atBottom() before it. Waiting for X
 * only counts at the bottom: away from it the list has not run out, the page just has not reached the end yet.
 * Returns the state, stopped when the list has ended.
 */
export function onStep(s: ScanState, at: { bottom: boolean; now: number }): ScanState {
  if (!s.running) return s;
  if (!at.bottom) return s.idle ? { ...s, idle: 0, idleSince: null } : s;
  if (s.idle >= SCAN.idleSteps && s.idleSince !== null && at.now - s.idleSince >= SCAN.idleMs) return stop(s, 'end');
  return { ...s, idle: s.idle + 1, idleSince: s.idleSince ?? at.now };
}

export const userStop = (s: ScanState): ScanState => stop(s, 'user');

/** 1.2–2.5 s; `rand` in [0, 1). */
export const nextDelay = (rand: number) => Math.round(SCAN.minDelayMs + clamp01(rand) * (SCAN.maxDelayMs - SCAN.minDelayMs));

/** Pixels to scroll: to the bottom of the page, but at most 2.5–3.5 screens (`rand` in [0, 1)). 0 at the bottom. */
export const stepPixels = (p: ScrollPos, rand: number) =>
  Math.round(Math.min(Math.max(p.height - p.viewport - p.y, 0), p.viewport * (SCAN.stepScreens + clamp01(rand) * SCAN.stepJitter)));

const clamp01 = (r: number) => Math.min(Math.max(r, 0), 0.999999);
