/** The bookmarks panel's auto-scroll stop rules (extension/src/content/scan.ts, plan B4). */
import { describe, expect, it } from 'vitest';
import { SCAN, atBottom, newScan, nextDelay, onResponse, onStep, stepPixels, userStop, type ScanState } from '../../extension/src/content/scan';

const ids = (from: number, n: number) => Array.from({ length: n }, (_, i) => String(1000 + from + i));
const page = (from: number, n = 20, fresh: number | null = n) => ({ ids: ids(from, n), fresh, recognized: true });
/** A step at the bottom of the page / away from it, at time `now` (ms). */
const bottom = (now: number) => ({ bottom: true, now });
const away = (now = 0) => ({ bottom: false, now });
/** `n` steps at the bottom, 2 s apart from `t0`. */
const bottomSteps = (s: ScanState, n: number, t0 = 0) => {
  for (let i = 0; i < n; i++) s = onStep(s, bottom(t0 + i * 2000));
  return s;
};

describe('scroll pacing', () => {
  it('steps toward the end of the list, 2.5–3.5 screens at most', () => {
    // Far from the end: capped by the screens, with the random part.
    expect(stepPixels({ y: 0, viewport: 1000, height: 50000 }, 0)).toBe(2500);
    expect(stepPixels({ y: 0, viewport: 1000, height: 50000 }, 0.5)).toBe(3000);
    expect(stepPixels({ y: 0, viewport: 1000, height: 50000 }, 0.9999999)).toBe(3500);
    // Close to the end: exactly to the bottom, where X asks for the next page.
    expect(stepPixels({ y: 8000, viewport: 1000, height: 10000 }, 0.5)).toBe(1000);
    // At the bottom (or a page shorter than the screen): no scroll.
    expect(stepPixels({ y: 9000, viewport: 1000, height: 10000 }, 0.5)).toBe(0);
    expect(stepPixels({ y: 0, viewport: 1000, height: 600 }, 0.5)).toBe(0);
  });

  it('a step always reaches X\'s load zone (end within 1.5 screens) before the bottom', () => {
    // Walk a page that only grows when the end comes within 1.5 screens, like X: every walk reaches it.
    for (const viewport of [600, 800, 1000, 1400]) {
      let y = 0;
      const height = 30 * viewport;
      for (let i = 0; i < 100 && y + viewport < height - 1.5 * viewport; i++) y += stepPixels({ y, viewport, height }, Math.random());
      expect(y + viewport).toBeGreaterThanOrEqual(height - 1.5 * viewport);
    }
  });

  it('"at the bottom" = within 200 px of the page end', () => {
    expect(atBottom({ y: 8800, viewport: 1000, height: 10000 })).toBe(true);
    expect(atBottom({ y: 8700, viewport: 1000, height: 10000 })).toBe(false);
    expect(atBottom({ y: 0, viewport: 1000, height: 500 })).toBe(true);
  });

  it('waits 1.2–2.5 s between steps', () => {
    expect(nextDelay(0)).toBe(1200);
    expect(nextDelay(0.5)).toBe(1850);
    expect(nextDelay(0.9999999)).toBe(2500);
    expect(nextDelay(5)).toBe(2500);
    expect(nextDelay(-1)).toBe(1200);
    for (let i = 0; i < 200; i++) {
      const d = nextDelay(Math.random());
      expect(d).toBeGreaterThanOrEqual(SCAN.minDelayMs);
      expect(d).toBeLessThanOrEqual(SCAN.maxDelayMs);
    }
  });
});

describe('stop rules', () => {
  it('ends at the bottom after 3 steps in a row (≥ 6 s) with no response bringing a new bookmark', () => {
    let s = onResponse(onStep(newScan(), away()), page(0));
    expect(s.idle).toBe(0);
    s = bottomSteps(s, 3);
    expect(s.running).toBe(true);
    s = onStep(s, bottom(6000));
    expect(s.running).toBe(false);
    expect(s.stopped).toBe('end');
    expect(s.seen.size).toBe(20);
  });

  it('steps away from the bottom never end the scan (the page has not reached the load zone yet)', () => {
    let s = onResponse(newScan(), page(0));
    for (let i = 0; i < 50; i++) s = onStep(s, away(i * 2000));
    expect(s.running).toBe(true);
    expect(s.idle).toBe(0);
  });

  it('leaving the bottom (the list grew) resets the wait', () => {
    let s = bottomSteps(onResponse(newScan(), page(0)), 3);
    s = onStep(s, away(6000));
    expect(s.idle).toBe(0);
    s = bottomSteps(s, 3, 8000);
    expect(s.running).toBe(true);
    expect(onStep(s, bottom(14000)).stopped).toBe('end');
  });

  it('3 quick steps are not enough: the wait at the bottom lasts at least 6 s', () => {
    let s = onResponse(newScan(), page(0));
    for (let t = 0; t <= 3 * 1200; t += 1200) s = onStep(s, bottom(t));
    expect(s.running).toBe(true);
    s = onStep(s, bottom(6000));
    expect(s.stopped).toBe('end');
  });

  it('a response with new bookmarks at the bottom resets the wait', () => {
    let s = bottomSteps(onResponse(newScan(), page(0)), 3);
    s = onResponse(s, page(20));
    expect(s.idle).toBe(0);
    expect(s.idleSince).toBeNull();
    s = bottomSteps(s, 3, 7000);
    expect(onStep(s, bottom(13000)).stopped).toBe('end');
    expect(s.seen.size).toBe(40);
  });

  it('a response with only already seen ids does not count as progress', () => {
    let s = onResponse(newScan(), page(0));
    for (let i = 0; i < 3; i++) s = onResponse(onStep(s, bottom(i * 2000)), page(0));
    expect(onStep(s, bottom(6000)).stopped).toBe('end');
  });

  it('the counter is the number of distinct bookmarks seen in this scan (page seed included)', () => {
    let s = newScan(ids(0, 22));
    s = onResponse(s, page(0, 22));
    s = onResponse(s, page(22, 22));
    s = onResponse(s, page(11, 22));
    expect(s.seen.size).toBe(44);
  });

  it('stops at once on a throttled answer (429 / 5xx)', () => {
    const s = onResponse(onResponse(newScan(), page(0)), { ids: [], fresh: null, recognized: true, status: 429 });
    expect(s.running).toBe(false);
    expect(s.stopped).toBe('throttled');
    expect(s.seen.size).toBe(20);
  });

  it('incremental: 2 pages in a row whose bookmarks were all archived before → up to date', () => {
    let s = onResponse(newScan(), page(0, 20, 0));
    expect(s.running).toBe(true);
    s = onResponse(s, page(20, 20, 3)); // a page with new ones resets the run
    expect(s.knownInRow).toBe(0);
    s = onResponse(s, page(40, 20, 0));
    expect(s.running).toBe(true);
    s = onResponse(s, page(60, 20, 0));
    expect(s.stopped).toBe('uptodate');
  });

  it('no finished scan of the account yet: the up-to-date rule is off, the scan runs to the end', () => {
    let s = newScan([], false);
    for (let i = 0; i < 5; i++) s = onResponse(s, page(i * 20, 20, 0));
    expect(s.running).toBe(true);
    expect(s.knownInRow).toBe(5);
    s = bottomSteps(s, 3);
    s = onStep(s, bottom(10000));
    expect(s.stopped).toBe('end');
    // The other stop rules still apply.
    expect(onResponse(newScan([], false), { ids: [], fresh: null, recognized: false }).stopped).toBe('format');
  });

  it('archive off (fresh unknown) never claims "up to date"', () => {
    let s = newScan();
    for (let i = 0; i < 5; i++) s = onResponse(s, page(i * 20, 20, null));
    expect(s.running).toBe(true);
  });

  it('stops at 2,000 bookmarks per scan', () => {
    let s: ScanState = newScan();
    for (let i = 0; s.running && i < 200; i++) s = onResponse(s, page(i * 20));
    expect(s.stopped).toBe('limit');
    expect(s.seen.size).toBe(SCAN.sessionMax);
  });

  it('an answer the mapper did not recognise stops the scan (parse_fail)', () => {
    expect(onResponse(newScan(), { ids: [], fresh: null, recognized: false }).stopped).toBe('format');
  });

  it('Stop by the user; a stopped scan ignores later answers and steps', () => {
    const s = userStop(onResponse(newScan(), page(0)));
    expect(s.stopped).toBe('user');
    expect(onResponse(s, page(20))).toBe(s);
    expect(onStep(s, bottom(0))).toBe(s);
    expect(userStop({ ...s, stopped: 'end' }).stopped).toBe('end');
  });
});
