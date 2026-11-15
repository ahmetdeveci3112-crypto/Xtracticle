/** The bookmarks panel's auto-scroll stop rules (extension/src/content/scan.ts, plan B4). */
import { describe, expect, it } from 'vitest';
import { SCAN, newScan, nextDelay, onResponse, onStep, stepPixels, userStop, type ScanState } from '../../extension/src/content/scan';

const ids = (from: number, n: number) => Array.from({ length: n }, (_, i) => String(1000 + from + i));
const page = (from: number, n = 20, fresh: number | null = n) => ({ ids: ids(from, n), fresh, recognized: true });

describe('scroll pacing', () => {
  it('steps ~0.9 of the viewport, every 1.2–2.5 s', () => {
    expect(stepPixels(1000)).toBe(900);
    expect(stepPixels(100)).toBe(200);
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
  it('ends after 3 steps in a row with no response bringing a new bookmark', () => {
    let s = newScan();
    s = onResponse(onStep(s), page(0));
    expect(s.idle).toBe(0);
    s = onStep(onStep(onStep(s)));
    expect(s.running).toBe(true);
    s = onStep(s);
    expect(s.running).toBe(false);
    expect(s.stopped).toBe('end');
    expect(s.seen.size).toBe(20);
  });

  it('a response with only already seen ids does not count as progress', () => {
    let s = onResponse(newScan(), page(0));
    for (let i = 0; i < 3; i++) s = onResponse(onStep(s), page(0));
    expect(onStep(s).stopped).toBe('end');
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
    expect(onStep(s)).toBe(s);
    expect(userStop({ ...s, stopped: 'end' }).stopped).toBe('end');
  });
});
