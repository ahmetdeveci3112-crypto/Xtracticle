import { useEffect, useState } from 'react';
import { track } from './analytics';

/**
 * Xtracticle Pro state for the app (see src/shared/pro.ts for the Worker side).
 *
 * `/api/pro/me` is asked at most once per page load, and only when the readable `xt_pro_hint`
 * cookie says a Pro cookie may exist: free visitors (nearly everyone) cost no Worker request.
 * The answer is kept in memory and in sessionStorage for 10 minutes.
 */

export type ProPlan = 'monthly' | 'yearly' | 'lifetime' | 'pro';

export interface ProState {
  pro: boolean;
  plan?: ProPlan;
  expiresAt?: string;
  /** True until the first answer (or the decision that no request is needed). */
  loading: boolean;
}

export type ActivateError = 'invalid_key' | 'activation_limit' | 'upstream' | 'unavailable' | 'rate_limited' | 'network';
export type ActivateResult = { ok: true; plan: ProPlan } | { ok: false; error: ActivateError };

const SESSION_KEY = 'xt_pro_state';
const SESSION_TTL_MS = 10 * 60 * 1000;
const HINT_COOKIE = 'xt_pro_hint';
/** Fired by the static /pro page's activation form so the app refreshes without a reload. */
const CHANGE_EVENT = 'xt:pro';

let state: ProState = { pro: false, loading: true };
let started = false;
const listeners = new Set<(s: ProState) => void>();

function set(next: ProState) {
  state = next;
  listeners.forEach(l => l(next));
}

function hasHint(): boolean {
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith(`${HINT_COOKIE}=`));
  } catch {
    return false;
  }
}

function readSession(): ProState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v || typeof v.at !== 'number' || Date.now() - v.at > SESSION_TTL_MS) return null;
    return { pro: !!v.pro, plan: v.plan, expiresAt: v.expiresAt, loading: false };
  } catch {
    return null;
  }
}

function writeSession(s: ProState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ pro: s.pro, plan: s.plan, expiresAt: s.expiresAt, at: Date.now() }));
  } catch { /* private mode */ }
}

function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

async function refresh(): Promise<void> {
  if (!hasHint()) {
    clearSession();
    set({ pro: false, loading: false });
    return;
  }
  try {
    const res = await fetch('/api/pro/me', { credentials: 'same-origin', cache: 'no-store' });
    const body: any = res.ok ? await res.json() : null;
    const next: ProState = body?.pro ? { pro: true, plan: body.plan, expiresAt: body.expiresAt, loading: false } : { pro: false, loading: false };
    writeSession(next);
    set(next);
  } catch {
    // Offline or blocked: keep whatever we had, but stop loading.
    set({ ...state, loading: false });
  }
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  const cached = readSession();
  if (cached && (cached.pro === hasHint())) set(cached);
  else void refresh();
  window.addEventListener(CHANGE_EVENT, () => {
    clearSession();
    void refresh();
  });
}

/** Current Pro state; re-renders when it changes. */
export function usePro(): ProState {
  const [s, setS] = useState(state);
  useEffect(() => {
    start();
    setS(state);
    listeners.add(setS);
    return () => void listeners.delete(setS);
  }, []);
  return s;
}

/** Snapshot for code outside React (exports). */
export const proState = () => state;

export async function activate(key: string): Promise<ActivateResult> {
  let res: Response;
  try {
    res = await fetch('/api/pro/activate', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key.trim() }),
    });
  } catch {
    track('pro_activate', { ok: false, error: 'network' });
    return { ok: false, error: 'network' };
  }
  const body: any = await res.json().catch(() => null);
  if (res.ok && body?.pro) {
    const next: ProState = { pro: true, plan: body.plan, expiresAt: body.expiresAt, loading: false };
    writeSession(next);
    set(next);
    track('pro_activate', { ok: true, plan: body.plan });
    return { ok: true, plan: body.plan };
  }
  const error: ActivateError =
    res.status === 503 ? 'unavailable'
    : res.status === 429 ? 'rate_limited'
    : body?.error === 'activation_limit' ? 'activation_limit'
    : res.status === 401 ? 'invalid_key'
    : 'upstream';
  track('pro_activate', { ok: false, error });
  return { ok: false, error };
}

export async function logout(): Promise<void> {
  track('pro_signout');
  try {
    await fetch('/api/pro/logout', { method: 'POST', credentials: 'same-origin' });
  } catch { /* the cookie clears next time */ }
  clearSession();
  set({ pro: false, loading: false });
}
