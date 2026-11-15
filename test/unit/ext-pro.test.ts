import { describe, expect, it } from 'vitest';
import { PRO_CHECK_INTERVAL_MS, PRO_FORCE_FLOOR_MS, PRO_GRACE_MS, afterCheck, needsCheck, parseMe, parseProCache, proActive, viewOf, type ProCache } from '../../extension/src/bg/pro';

const T0 = 1_800_000_000_000;
const pro: ProCache = { pro: true, plan: 'monthly', checkedAt: T0, triedAt: T0 };

describe('Pro cache rules (A2)', () => {
  it('checks at most every 10 minutes, refresh within a 5-second floor', () => {
    expect(needsCheck(null, T0)).toBe(true);
    expect(needsCheck(pro, T0 + PRO_CHECK_INTERVAL_MS - 1)).toBe(false);
    expect(needsCheck(pro, T0 + PRO_CHECK_INTERVAL_MS)).toBe(true);
    expect(needsCheck(pro, T0 + 1000, true)).toBe(false);
    expect(needsCheck(pro, T0 + PRO_FORCE_FLOOR_MS, true)).toBe(true);
    expect(needsCheck({ ...pro, triedAt: T0 + 60_000 }, T0 + PRO_CHECK_INTERVAL_MS)).toBe(false); // a failed try also spaces the next one
    expect(needsCheck(pro, T0 - 1)).toBe(true); // clock went back
  });

  it('pro:false switches Pro off at once', () => {
    const next = afterCheck(pro, { kind: 'ok', pro: false, plan: 'monthly' }, T0 + 1);
    expect(next).toEqual({ pro: false, plan: null, checkedAt: T0 + 1, triedAt: T0 + 1 });
    expect(proActive(next, T0 + 2)).toBe(false);
  });

  it('a network error keeps the last answer for 7 days after the last successful check', () => {
    let c = afterCheck(pro, { kind: 'error' }, T0 + 3600_000);
    expect(c.checkedAt).toBe(T0);
    expect(proActive(c, T0 + PRO_GRACE_MS - 1)).toBe(true);
    c = afterCheck(c, { kind: 'error' }, T0 + PRO_GRACE_MS);
    expect(proActive(c, T0 + PRO_GRACE_MS)).toBe(false);
    expect(viewOf(c, T0 + PRO_GRACE_MS)).toEqual({ pro: false, plan: null, checkedAt: new Date(T0).toISOString(), offline: true });
  });

  it('no cache + error = free; the view says offline', () => {
    const c = afterCheck(null, { kind: 'error' }, T0);
    expect(proActive(c, T0)).toBe(false);
    expect(viewOf(c, T0)).toEqual({ pro: false, plan: null, checkedAt: null, offline: true });
    expect(viewOf(null, T0)).toEqual({ pro: false, plan: null, checkedAt: null, offline: false });
  });

  it('parses only well-formed answers and caches', () => {
    expect(parseMe({ pro: true, plan: 'yearly', expiresAt: 'x' })).toEqual({ pro: true, plan: 'yearly' });
    expect(parseMe({ pro: 'yes' })).toBeNull();
    expect(parseMe(null)).toBeNull();
    expect(parseProCache({ pro: true, plan: 'x', checkedAt: 5 })).toEqual({ pro: true, plan: 'x', checkedAt: 5, triedAt: 5 });
    expect(parseProCache({ pro: true, key: 'SECRET' })).toBeNull();
    // The cache never carries a key.
    expect(Object.keys(afterCheck(null, { kind: 'ok', pro: true, plan: 'monthly' }, T0)).sort()).toEqual(['checkedAt', 'plan', 'pro', 'triedAt']);
  });
});
