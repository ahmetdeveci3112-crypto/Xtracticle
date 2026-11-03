/**
 * Xtracticle Pro: a paid tier unlocked by a Polar.sh license key — no accounts, no database.
 *
 *   POST /api/pro/activate { key }  → validates the key with Polar's public customer-portal API and
 *                                     sets the signed, HttpOnly `xt_pro` cookie
 *   GET  /api/pro/me                → { pro, plan, expiresAt } from the cookie (re-validated once a day)
 *   POST /api/pro/logout            → clears the cookie
 *   GET  /api/pro/config            → { available, checkout: { monthly, yearly, lifetime } } for the /pro page
 *
 * The cookie is base64url(payload) + "." + base64url(HMAC-SHA256(payload)). The payload holds the
 * license key AES-GCM-encrypted (so a leaked cookie never shows the key), the plan, an expiry and the
 * time of the last successful Polar check. Both keys are derived from PRO_COOKIE_SECRET with HKDF.
 * Everything here is WebCrypto only: the free Workers plan allows 10 ms of CPU per request.
 *
 * Polar's customer-portal endpoints (https://polar.sh/docs/features/benefits/license-keys) need no
 * token: validate answers 200 with status "granted" or 404 for unknown, revoked, disabled and expired
 * keys; activate answers 403 when a key has used up its device activations.
 */

export interface ProEnv {
  /** Polar organization ID. Empty = Pro is not for sale yet: /api/pro/* answers 503. */
  POLAR_ORG_ID?: string;
  /** Testing only: replaces https://api.polar.sh. */
  POLAR_API_BASE?: string;
  POLAR_CHECKOUT_MONTHLY?: string;
  POLAR_CHECKOUT_YEARLY?: string;
  POLAR_CHECKOUT_LIFETIME?: string;
  /** Optional: Polar benefit IDs, so the cookie can name the plan. Unknown benefit → plan "pro". */
  POLAR_BENEFIT_MONTHLY?: string;
  POLAR_BENEFIT_YEARLY?: string;
  POLAR_BENEFIT_LIFETIME?: string;
  /** Secret (wrangler secret / .dev.vars): signs and encrypts the cookie. */
  PRO_COOKIE_SECRET?: string;
}

export type ProPlan = 'monthly' | 'yearly' | 'lifetime' | 'pro';

export interface ProState {
  pro: boolean;
  plan?: ProPlan;
  /** ISO date when the cookie stops being trusted without a new check. */
  expiresAt?: string;
}

/** What the cookie carries. Field names are short because the cookie travels with every request. */
interface Payload {
  /** The license key, AES-GCM encrypted (base64url of iv + ciphertext). */
  k: string;
  p: ProPlan;
  /** Unix seconds: the cookie is dead after this. */
  exp: number;
  /** Unix seconds of the last successful validation against Polar. */
  chk: number;
  /** Polar activation ID, when the key uses device activations. */
  a?: string;
}

export const COOKIE = 'xt_pro';
/** Readable by the page (no secret inside): tells the app a Pro cookie may exist, so free visitors never call /api/pro/me. */
export const HINT_COOKIE = 'xt_pro_hint';
const COOKIE_DAYS = 30;
const COOKIE_SECONDS = COOKIE_DAYS * 24 * 3600;
const RECHECK_SECONDS = 24 * 3600;
const ACTIVATE_TIMEOUT_MS = 5_000;
const RECHECK_TIMEOUT_MS = 3_000;
const BEARER_TIMEOUT_MS = 4_000;
const BEARER_OK_MS = 60 * 60 * 1000;
const BEARER_BAD_MS = 5 * 60 * 1000;
const BEARER_CACHE_MAX = 2000;
const MIN_SECRET_LENGTH = 16;
const KEY_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{6,198}$/;
const ACTIVATION_LABEL = 'xtracticle.com';
const USER_AGENT = 'Xtracticle/3.0 (+https://xtracticle.com; pro)';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

const enc = new TextEncoder();
const dec = new TextDecoder();

/* ─── base64url ─── */

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(s)) return null;
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

/* ─── Keys (derived once per isolate and secret) ─── */

interface Keys {
  mac: CryptoKey;
  aes: CryptoKey;
}
const KEYS = new Map<string, Promise<Keys>>();

function keysFor(secret: string): Promise<Keys> {
  let k = KEYS.get(secret);
  if (!k) {
    k = (async () => {
      const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'HKDF', false, ['deriveKey']);
      const hkdf = (info: string) => ({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode(info) });
      const [mac, aes] = await Promise.all([
        crypto.subtle.deriveKey(hkdf('xtracticle-pro-cookie-mac'), base, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']),
        crypto.subtle.deriveKey(hkdf('xtracticle-pro-cookie-enc'), base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']),
      ]);
      return { mac, aes };
    })();
    KEYS.set(secret, k);
  }
  return k;
}

const secretOf = (env: ProEnv): string | null =>
  typeof env.PRO_COOKIE_SECRET === 'string' && env.PRO_COOKIE_SECRET.length >= MIN_SECRET_LENGTH ? env.PRO_COOKIE_SECRET : null;

/* ─── Cookie: sign / verify / encrypt (exported for tests) ─── */

export async function signPayload(payload: Payload, secret: string): Promise<string> {
  const { mac } = await keysFor(secret);
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', mac, enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

/** The payload of a well-formed, correctly signed and unexpired cookie; null otherwise. */
export async function verifyCookie(value: string | null | undefined, secret: string, now = Date.now()): Promise<Payload | null> {
  if (!value || value.length > 2048) return null;
  const dot = value.indexOf('.');
  if (dot <= 0 || dot === value.length - 1) return null;
  const body = value.slice(0, dot);
  const sig = unb64url(value.slice(dot + 1));
  if (!sig || sig.length !== 32) return null;
  const { mac } = await keysFor(secret);
  // subtle.verify compares in constant time.
  if (!(await crypto.subtle.verify('HMAC', mac, sig, enc.encode(body)))) return null;
  const raw = unb64url(body);
  if (!raw) return null;
  let p: any;
  try {
    p = JSON.parse(dec.decode(raw));
  } catch {
    return null;
  }
  if (!p || typeof p !== 'object' || typeof p.k !== 'string' || typeof p.exp !== 'number' || typeof p.chk !== 'number') return null;
  if (!['monthly', 'yearly', 'lifetime', 'pro'].includes(p.p)) return null;
  if (p.a !== undefined && typeof p.a !== 'string') return null;
  if (!(p.exp > now / 1000)) return null;
  return { k: p.k, p: p.p, exp: p.exp, chk: p.chk, ...(p.a ? { a: p.a } : {}) };
}

export async function encryptKey(key: string, secret: string): Promise<string> {
  const { aes } = await keysFor(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, enc.encode(key)));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv);
  out.set(ct, iv.length);
  return b64url(out);
}

export async function decryptKey(blob: string, secret: string): Promise<string | null> {
  const bytes = unb64url(blob);
  if (!bytes || bytes.length < 12 + 16) return null;
  try {
    const { aes } = await keysFor(secret);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, aes, bytes.slice(12));
    return dec.decode(pt);
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

/** `Secure` is left off for plain-http localhost so `wrangler dev` works in every browser. */
function cookieHeaders(request: Request, value: string | null): Headers {
  const host = new URL(request.url).hostname;
  const secure = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' ? '' : '; Secure';
  const h = new Headers();
  if (value === null) {
    h.append('Set-Cookie', `${COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${secure}`);
    h.append('Set-Cookie', `${HINT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax${secure}`);
  } else {
    h.append('Set-Cookie', `${COOKIE}=${value}; Max-Age=${COOKIE_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`);
    h.append('Set-Cookie', `${HINT_COOKIE}=1; Max-Age=${COOKIE_SECONDS}; Path=/; SameSite=Lax${secure}`);
  }
  return h;
}

/* ─── Polar ─── */

interface PolarKey {
  status?: string;
  expires_at?: string | null;
  benefit_id?: string;
}
/* Plain shapes (not discriminated unions): tsconfig.worker.json is not strict, so `!v.ok` would not narrow. */
interface Validation {
  ok: boolean;
  key?: PolarKey;
  reason?: 'invalid' | 'upstream';
}
interface Activation {
  ok: boolean;
  id?: string;
  key?: PolarKey;
  reason?: 'invalid' | 'limit' | 'upstream';
}

const polarBase = (env: ProEnv) => (env.POLAR_API_BASE || 'https://api.polar.sh').replace(/\/+$/, '');

async function polarPost(env: ProEnv, path: string, body: unknown, timeoutMs: number): Promise<Response | null> {
  try {
    return await fetch(`${polarBase(env)}/v1/customer-portal/license-keys/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': USER_AGENT },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return null;
  }
}

async function readJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function validateKey(env: ProEnv, key: string, activationId: string | undefined, timeoutMs: number): Promise<Validation> {
  const res = await polarPost(env, 'validate', { key, organization_id: env.POLAR_ORG_ID, ...(activationId ? { activation_id: activationId } : {}) }, timeoutMs);
  if (!res) return { ok: false, reason: 'upstream' };
  if (res.status === 404 || res.status === 403) {
    res.body?.cancel().catch(() => {});
    return { ok: false, reason: 'invalid' };
  }
  if (!res.ok) {
    res.body?.cancel().catch(() => {});
    return { ok: false, reason: 'upstream' };
  }
  const data = await readJson(res);
  if (!data || typeof data !== 'object') return { ok: false, reason: 'upstream' };
  return granted(data) ? { ok: true, key: data } : { ok: false, reason: 'invalid' };
}

async function activateKey(env: ProEnv, key: string): Promise<Activation> {
  const res = await polarPost(env, 'activate', { key, organization_id: env.POLAR_ORG_ID, label: ACTIVATION_LABEL }, ACTIVATE_TIMEOUT_MS);
  if (!res) return { ok: false, reason: 'upstream' };
  if (res.status === 404) {
    res.body?.cancel().catch(() => {});
    return { ok: false, reason: 'invalid' };
  }
  if (res.status === 403) {
    const data = await readJson(res);
    const detail = typeof data?.detail === 'string' ? data.detail.toLowerCase() : '';
    return { ok: false, reason: detail.includes('activation') || detail.includes('limit') ? 'limit' : 'invalid' };
  }
  if (!res.ok) {
    res.body?.cancel().catch(() => {});
    return { ok: false, reason: 'upstream' };
  }
  const data = await readJson(res);
  if (!data || typeof data.id !== 'string') return { ok: false, reason: 'upstream' };
  const lk = data.license_key && typeof data.license_key === 'object' ? data.license_key : {};
  return granted(lk) ? { ok: true, id: data.id, key: lk } : { ok: false, reason: 'invalid' };
}

/** "granted" and not past expires_at (subscriptions have no expires_at and are revoked instead). */
function granted(k: PolarKey): boolean {
  if (k.status !== 'granted') return false;
  if (k.expires_at) {
    const t = Date.parse(k.expires_at);
    if (Number.isNaN(t) || t <= Date.now()) return false;
  }
  return true;
}

function planFor(env: ProEnv, benefitId: string | undefined): ProPlan {
  if (!benefitId) return 'pro';
  if (benefitId === env.POLAR_BENEFIT_MONTHLY) return 'monthly';
  if (benefitId === env.POLAR_BENEFIT_YEARLY) return 'yearly';
  if (benefitId === env.POLAR_BENEFIT_LIFETIME) return 'lifetime';
  return 'pro';
}

/** Cookie expiry: 30 days, or the key's own expiry if sooner. */
function cookieExp(k: PolarKey, nowSec: number): number {
  let exp = nowSec + COOKIE_SECONDS;
  if (k.expires_at) {
    const t = Math.floor(Date.parse(k.expires_at) / 1000);
    if (t > nowSec && t < exp) exp = t;
  }
  return exp;
}

const stateOf = (p: Payload): ProState => ({ pro: true, plan: p.p, expiresAt: new Date(p.exp * 1000).toISOString() });

const available = (env: ProEnv) => !!env.POLAR_ORG_ID && !!secretOf(env);

/* ─── Public helpers for other handlers ─── */

/**
 * Pro state of a browser request from its cookie alone: signature and expiry, no network.
 * Cheap enough to call on every request that needs it.
 */
export async function proFromRequest(request: Request, env: ProEnv): Promise<ProState> {
  const secret = secretOf(env);
  if (!secret) return { pro: false };
  const raw = readCookie(request, COOKIE);
  if (!raw) return { pro: false };
  const payload = await verifyCookie(raw, secret);
  return payload ? stateOf(payload) : { pro: false };
}

export const isPro = proFromRequest;

export type BearerResult = 'none' | 'pro' | 'invalid' | 'upstream';

const BEARER_CACHE = new Map<string, { pro: boolean; until: number; activation?: string }>();

/**
 * `Authorization: Bearer <license key>` on the agent endpoints (/mcp, /api/markdown): validated
 * against Polar, with the verdict cached in memory for an hour (five minutes for bad keys).
 * Only a hash of the key is kept.
 */
export async function bearerPro(request: Request, env: ProEnv): Promise<BearerResult> {
  const auth = request.headers.get('Authorization') || '';
  const m = /^Bearer\s+(\S+)\s*$/i.exec(auth);
  if (!m) return 'none';
  const key = m[1];
  if (!KEY_RE.test(key)) return 'invalid';
  if (!available(env)) return 'invalid';
  const id = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(`${env.POLAR_ORG_ID}\n${key}`))));
  const now = Date.now();
  const hit = BEARER_CACHE.get(id);
  if (hit && hit.until > now) return hit.pro ? 'pro' : 'invalid';
  // Same order as /activate: a plain validation first, a device activation only if Polar insists on one.
  let activation = hit?.activation;
  let v = await validateKey(env, key, activation, BEARER_TIMEOUT_MS);
  if (!v.ok && v.reason === 'invalid' && !activation) {
    const a = await activateKey(env, key);
    if (a.ok && a.id) {
      activation = a.id;
      v = await validateKey(env, key, a.id, BEARER_TIMEOUT_MS);
    } else if (a.reason === 'upstream') {
      v = { ok: false, reason: 'upstream' };
    }
  }
  if (!v.ok && v.reason === 'upstream') return hit ? (hit.pro ? 'pro' : 'invalid') : 'upstream';
  if (BEARER_CACHE.size >= BEARER_CACHE_MAX) BEARER_CACHE.clear();
  BEARER_CACHE.set(id, { pro: v.ok, until: now + (v.ok ? BEARER_OK_MS : BEARER_BAD_MS), ...(activation ? { activation } : {}) });
  return v.ok ? 'pro' : 'invalid';
}

/* ─── Handler ─── */

export async function handlePro(request: Request, env: ProEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/api\/pro\/(config|activate|me|logout)\/?$/);
  if (!m) return null;
  const route = m[1];

  if (route === 'config') {
    if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
    const on = available(env);
    return json(
      {
        available: on,
        checkout: on
          ? { monthly: env.POLAR_CHECKOUT_MONTHLY || '', yearly: env.POLAR_CHECKOUT_YEARLY || '', lifetime: env.POLAR_CHECKOUT_LIFETIME || '' }
          : { monthly: '', yearly: '', lifetime: '' },
      },
      200,
      { 'Cache-Control': 'public, max-age=300' },
    );
  }

  if (!available(env)) return json({ error: 'pro_unavailable' }, 503);
  const secret = secretOf(env)!;

  if (route === 'logout') {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    const headers = cookieHeaders(request, null);
    headers.set('Content-Type', JSON_HEADERS['Content-Type']);
    headers.set('Cache-Control', 'no-store');
    return new Response(JSON.stringify({ pro: false }), { status: 200, headers });
  }

  if (route === 'activate') {
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
    let body: any = null;
    try {
      const text = await request.text();
      if (text.length > 4096) return json({ error: 'bad_request' }, 400);
      body = JSON.parse(text);
    } catch {
      return json({ error: 'bad_request' }, 400);
    }
    const key = typeof body?.key === 'string' ? body.key.trim() : '';
    if (!KEY_RE.test(key)) return json({ error: 'invalid_key' }, 401);

    const started = Date.now();
    // Keys without device activations validate directly; keys with activations enabled answer 404
    // until activated, so an activation is tried before giving up.
    let activationId: string | undefined;
    let v = await validateKey(env, key, undefined, ACTIVATE_TIMEOUT_MS);
    if (!v.ok && v.reason === 'invalid') {
      const a = await activateKey(env, key);
      if (a.ok && a.id) {
        activationId = a.id;
        v = await validateKey(env, key, a.id, ACTIVATE_TIMEOUT_MS);
      } else if (a.reason === 'limit') {
        console.log(JSON.stringify({ pro: 'activate', ok: false, reason: 'limit', ms: Date.now() - started }));
        return json({ error: 'activation_limit' }, 401);
      } else if (a.reason === 'upstream') {
        v = { ok: false, reason: 'upstream' };
      }
    }
    if (!v.ok || !v.key) {
      console.log(JSON.stringify({ pro: 'activate', ok: false, reason: v.reason, ms: Date.now() - started }));
      return v.reason === 'upstream' ? json({ error: 'upstream' }, 502) : json({ error: 'invalid_key' }, 401);
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const payload: Payload = {
      k: await encryptKey(key, secret),
      p: planFor(env, v.key.benefit_id),
      exp: cookieExp(v.key, nowSec),
      chk: nowSec,
      ...(activationId ? { a: activationId } : {}),
    };
    console.log(JSON.stringify({ pro: 'activate', ok: true, plan: payload.p, activation: !!activationId, ms: Date.now() - started }));
    return withCookie(request, await signPayload(payload, secret), stateOf(payload));
  }

  // route === 'me'
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
  const raw = readCookie(request, COOKIE);
  if (!raw) return json({ pro: false });
  const payload = await verifyCookie(raw, secret);
  if (!payload) {
    // Tampered, malformed or expired: drop it so the browser stops sending it.
    const headers = cookieHeaders(request, null);
    headers.set('Content-Type', JSON_HEADERS['Content-Type']);
    headers.set('Cache-Control', 'no-store');
    return new Response(JSON.stringify({ pro: false }), { status: 200, headers });
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec - payload.chk < RECHECK_SECONDS) return json(stateOf(payload));

  const key = await decryptKey(payload.k, secret);
  const v: Validation = key ? await validateKey(env, key, payload.a, RECHECK_TIMEOUT_MS) : { ok: false, reason: 'invalid' };
  if (v.ok && v.key) {
    const fresh: Payload = { ...payload, p: planFor(env, v.key.benefit_id), exp: cookieExp(v.key, nowSec), chk: nowSec };
    console.log(JSON.stringify({ pro: 'recheck', ok: true, plan: fresh.p }));
    return withCookie(request, await signPayload(fresh, secret), stateOf(fresh));
  }
  if (v.reason === 'invalid') {
    console.log(JSON.stringify({ pro: 'recheck', ok: false, reason: 'invalid' }));
    const headers = cookieHeaders(request, null);
    headers.set('Content-Type', JSON_HEADERS['Content-Type']);
    headers.set('Cache-Control', 'no-store');
    return new Response(JSON.stringify({ pro: false }), { status: 200, headers });
  }
  // Polar unreachable: keep trusting the cookie until its own expiry.
  return json({ ...stateOf(payload), stale: true });
}

function withCookie(request: Request, cookie: string, state: ProState): Response {
  const headers = cookieHeaders(request, cookie);
  headers.set('Content-Type', JSON_HEADERS['Content-Type']);
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(state), { status: 200, headers });
}
