/**
 * Pro status (docs/chrome-extension-plan.md, A2): the one source is the site's `xt_pro` cookie; the
 * extension keeps no license key, only a cache in chrome.storage.local.pro = { pro, plan, checkedAt, triedAt }.
 *
 *   GET  /api/pro/me        on SW start, popup open (pro:get), on demand (pro:refresh); at most every 10 min
 *   POST /api/pro/activate  { key } from the popup; Set-Cookie lands in the browser's jar, the site is Pro too
 *   POST /api/pro/logout    clears the cookie for both
 *
 * Cache rules (pure functions below, unit-tested):
 *   - an answer `pro: false` switches Pro off at once;
 *   - a network or server error keeps the last answer, valid 7 days after the last successful check;
 *   - pro:refresh bypasses the 10-minute spacing but not a 5-second floor (the page can trigger it).
 */
import type { ProView } from '../messages';
import { jsonOf, siteFetch } from './api';

export interface ProCache {
  pro: boolean;
  plan: string | null;
  /** Last successful answer (ms epoch); 0 = never. */
  checkedAt: number;
  /** Last attempt, successful or not (ms epoch). */
  triedAt: number;
}

export const PRO_CHECK_INTERVAL_MS = 10 * 60 * 1000;
export const PRO_FORCE_FLOOR_MS = 5 * 1000;
export const PRO_GRACE_MS = 7 * 24 * 3600 * 1000;
const KEY = 'pro';

export type CheckOutcome = { kind: 'ok'; pro: boolean; plan: string | null } | { kind: 'error' };

export function parseProCache(v: unknown): ProCache | null {
  if (!v || typeof v !== 'object') return null;
  const c = v as Record<string, unknown>;
  if (typeof c.pro !== 'boolean' || typeof c.checkedAt !== 'number') return null;
  return { pro: c.pro, plan: typeof c.plan === 'string' ? c.plan : null, checkedAt: c.checkedAt, triedAt: typeof c.triedAt === 'number' ? c.triedAt : c.checkedAt };
}

/** Pro right now: the last successful answer said so and it is less than 7 days old. */
export function proActive(c: ProCache | null, now: number): boolean {
  return !!c && c.pro && c.checkedAt > 0 && now - c.checkedAt < PRO_GRACE_MS;
}

/** Whether to call /api/pro/me now. */
export function needsCheck(c: ProCache | null, now: number, force = false): boolean {
  if (!c) return true;
  const since = now - Math.max(c.checkedAt, c.triedAt);
  if (since < 0) return true; // clock went back
  return since >= (force ? PRO_FORCE_FLOOR_MS : PRO_CHECK_INTERVAL_MS);
}

export function afterCheck(prev: ProCache | null, outcome: CheckOutcome, now: number): ProCache {
  if (outcome.kind === 'ok') return { pro: outcome.pro, plan: outcome.pro ? outcome.plan : null, checkedAt: now, triedAt: now };
  return prev ? { ...prev, triedAt: now } : { pro: false, plan: null, checkedAt: 0, triedAt: now };
}

export function viewOf(c: ProCache | null, now: number): ProView {
  const pro = proActive(c, now);
  return {
    pro,
    plan: pro ? (c?.plan ?? null) : null,
    checkedAt: c && c.checkedAt > 0 ? new Date(c.checkedAt).toISOString() : null,
    offline: !!c && c.triedAt > c.checkedAt,
  };
}

/** `{ pro, plan }` out of a /api/pro/me or /api/pro/activate body, or null. */
export function parseMe(body: unknown): { pro: boolean; plan: string | null } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.pro !== 'boolean') return null;
  return { pro: b.pro, plan: typeof b.plan === 'string' && b.plan.length <= 32 ? b.plan : null };
}

/* ─── I/O ─── */

async function readCache(): Promise<ProCache | null> {
  const r = await chrome.storage.local.get(KEY);
  return parseProCache(r[KEY]);
}

async function writeCache(c: ProCache): Promise<void> {
  await chrome.storage.local.set({ [KEY]: c });
}

async function checkMe(): Promise<CheckOutcome> {
  try {
    const res = await siteFetch('/api/pro/me');
    if (!res.ok) return { kind: 'error' };
    const me = parseMe(await jsonOf(res));
    return me ? { kind: 'ok', ...me } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

/** The current view; asks the site first when the cache is due (or `force`, within the 5-second floor). */
export async function getPro(force = false): Promise<ProView> {
  const prev = await readCache();
  const now = Date.now();
  if (!needsCheck(prev, now, force)) return viewOf(prev, now);
  // Mark the attempt first so two wake-ups at once don't both call the site.
  if (prev) await writeCache({ ...prev, triedAt: now });
  const next = afterCheck(prev, await checkMe(), Date.now());
  await writeCache(next);
  return viewOf(next, Date.now());
}

export type ActionResult = { ok: true; view: ProView } | { ok: false; error: string };

/** POST /api/pro/activate. The key goes to the site only and is never stored here. */
export async function activate(key: unknown): Promise<ActionResult> {
  if (typeof key !== 'string' || !key.trim() || key.length > 200) return { ok: false, error: 'invalid_key' };
  let res: Response;
  try {
    res = await siteFetch('/api/pro/activate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: key.trim() }) });
  } catch {
    return { ok: false, error: 'network' };
  }
  const body = await jsonOf(res);
  const me = parseMe(body);
  if (!res.ok || !me) {
    const code = body && typeof body === 'object' && typeof (body as any).error === 'string' ? String((body as any).error).slice(0, 40) : `http_${res.status}`;
    return { ok: false, error: code };
  }
  const now = Date.now();
  const next = afterCheck(await readCache(), { kind: 'ok', ...me }, now);
  await writeCache(next);
  return { ok: true, view: viewOf(next, now) };
}

/** POST /api/pro/logout: signs out the site and the extension together. */
export async function logout(): Promise<ActionResult> {
  try {
    const res = await siteFetch('/api/pro/logout', { method: 'POST' });
    if (!res.ok) return { ok: false, error: `http_${res.status}` };
  } catch {
    return { ok: false, error: 'network' };
  }
  const now = Date.now();
  const next = afterCheck(await readCache(), { kind: 'ok', pro: false, plan: null }, now);
  await writeCache(next);
  return { ok: true, view: viewOf(next, now) };
}
