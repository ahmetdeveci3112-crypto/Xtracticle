/**
 * The bookmarks panel's auto-scroll rules (docs/chrome-extension-plan.md, B4 "Hesap koruma"), as pure
 * functions so every stop rule is unit-tested. bookmarks-panel.ts drives the timer and the DOM.
 *
 *   step        ~0.9 of the viewport, every 1.2–2.5 s (random), never while the tab is hidden
 *   stop        3 steps in a row without a response bringing a new bookmark  → 'end'
 *               a listened Bookmarks answer was 429 or ≥ 500                 → 'throttled'
 *               2 pages in a row whose bookmarks were all already archived  → 'uptodate'
 *               2,000 bookmarks seen in this scan                           → 'limit'
 *               a response X sent in a shape the mapper did not recognise  → 'format'
 *               the user pressed Stop                                       → 'user'
 * The extension never calls X itself: it only scrolls the page X already shows.
 */

export const SCAN = {
  stepRatio: 0.9,
  minDelayMs: 1200,
  maxDelayMs: 2500,
  idleSteps: 3,
  knownPages: 2,
  sessionMax: 2000,
} as const;

export type StopReason = 'end' | 'throttled' | 'uptodate' | 'limit' | 'format' | 'user';

export interface ScanState {
  running: boolean;
  /** Distinct bookmark ids seen since the scan started. */
  seen: Set<string>;
  /** Steps since the last response that brought at least one new id. */
  idle: number;
  /** Pages in a row with every bookmark already archived. */
  knownInRow: number;
  stopped: StopReason | null;
}

/** `seed`: bookmarks X already loaded on the page before the scan started (they count too). */
export const newScan = (seed: Iterable<string> = []): ScanState => ({ running: true, seen: new Set([...seed].slice(0, SCAN.sessionMax)), idle: 0, knownInRow: 0, stopped: null });

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
  let next: ScanState = { ...s, seen, idle: added > 0 ? 0 : s.idle, knownInRow: allKnown ? s.knownInRow + 1 : r.ids.length ? 0 : s.knownInRow };
  if (seen.size >= SCAN.sessionMax) next = stop(next, 'limit');
  else if (next.knownInRow >= SCAN.knownPages) next = stop(next, 'uptodate');
  return next;
}

/** One scroll step was taken (call before scrolling). Returns the state, stopped when the list has ended. */
export function onStep(s: ScanState): ScanState {
  if (!s.running) return s;
  if (s.idle >= SCAN.idleSteps) return stop(s, 'end');
  return { ...s, idle: s.idle + 1 };
}

export const userStop = (s: ScanState): ScanState => stop(s, 'user');

/** 1.2–2.5 s; `rand` in [0, 1). */
export const nextDelay = (rand: number) => Math.round(SCAN.minDelayMs + Math.min(Math.max(rand, 0), 0.999999) * (SCAN.maxDelayMs - SCAN.minDelayMs));

/** Pixels to scroll for a viewport height. */
export const stepPixels = (viewport: number) => Math.max(200, Math.round(viewport * SCAN.stepRatio));
