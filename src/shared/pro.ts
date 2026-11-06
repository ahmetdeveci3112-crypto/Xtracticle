/**
 * Xtracticle Pro: a paid tier unlocked by a Gumroad license key — no accounts, no database.
 *
 *   POST /api/pro/activate { key }  → verifies the key with Gumroad's public license API and
 *                                     sets the signed, HttpOnly `xt_pro` cookie
 *   GET  /api/pro/me                → { pro, plan, expiresAt } from the cookie (re-verified once a day)
 *   POST /api/pro/logout            → clears the cookie
 *   GET  /api/pro/config            → { available, checkout: { monthly, yearly, lifetime } } for the /pro page
 *
 * The cookie is base64url(payload) + "." + base64url(HMAC-SHA256(payload)). The payload holds the
 * license key AES-GCM-encrypted (so a leaked cookie never shows the key), the plan, an expiry and the
 * time of the last successful Gumroad check. Both keys are derived from PRO_COOKIE_SECRET with HKDF.
 * Everything here is WebCrypto only: the free Workers plan allows 10 ms of CPU per request.
 *
 * Gumroad's verify endpoint (https://gumroad.com/help/article/76-license-keys) needs no token:
 * POST https://api.gumroad.com/v2/licenses/verify with form fields product_id, license_key and
 * increment_uses_count answers 200 { success: true, uses, purchase } or 404 { success: false }
 * for a key that does not belong to that product. Refunds, chargebacks, lost disputes and ended
 * memberships are flags on `purchase` — Gumroad keeps answering 200 for them, so they are checked
 * here. Two products carry Pro: the membership (monthly / yearly) and the one-off lifetime product;
 * a key is tried against the membership first, then lifetime.
 *
 * Gumroad has no device activations. The `uses` counter is incremented only by /activate (never by
 * the daily recheck or the Bearer path) and a key activated more than MAX_USES times is refused, so
 * a key posted publicly stops working; the owner resets the counter in the Gumroad sales dashboard.
 */

export interface ProEnv {
  /** Gumroad product IDs (shown in the License key block of each product). Either empty = Pro is not for sale: /api/pro/* answers 503. */
  GUMROAD_PRODUCT_MEMBERSHIP?: string;
  GUMROAD_PRODUCT_LIFETIME?: string;
  /** Checkout links for the three cards on /pro, passed through by /api/pro/config. */
  GUMROAD_URL_MONTHLY?: string;
  GUMROAD_URL_YEARLY?: string;
  GUMROAD_URL_LIFETIME?: string;
  /** Testing only: replaces https://api.gumroad.com. */
  GUMROAD_API_BASE?: string;
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
  /** Unix seconds of the last successful verification against Gumroad. */
  chk: number;
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
/** /activate calls beyond this many on one key answer activation_limit (the counter lives at Gumroad). */
const MAX_USES = 10;
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
  if (!(p.exp > now / 1000)) return null;
  return { k: p.k, p: p.p, exp: p.exp, chk: p.chk };
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

/* ─── Gumroad ─── */

/** The subset of `purchase` from /v2/licenses/verify that decides access. */
interface Purchase {
  product_id?: string;
  recurrence?: string;
  refunded?: boolean;
  chargebacked?: boolean;
  disputed?: boolean;
  dispute_won?: boolean;
  subscription_ended_at?: string | null;
  subscription_cancelled_at?: string | null;
  subscription_failed_at?: string | null;
}
type Product = 'membership' | 'lifetime';
/* Plain shape (not a discriminated union): tsconfig.worker.json is not strict, so `!v.ok` would not narrow. */
interface Verification {
  ok: boolean;
  plan?: ProPlan;
  purchase?: Purchase;
  /** Gumroad's activation counter for the key (after the increment, when one was requested). */
  uses?: number;
  reason?: 'invalid' | 'upstream';
  /** HTTP status from Gumroad when the reason is 'upstream' (0 = network error / timeout). */
  status?: number;
}

const gumroadBase = (env: ProEnv) => (env.GUMROAD_API_BASE || 'https://api.gumroad.com').replace(/\/+$/, '');
const VERIFY_PATH = '/v2/licenses/verify';

/** Unexpected Gumroad answer: log the status (never the key) so production failures can be diagnosed. */
function upstream(res: Response | null, product: Product): Verification {
  const status = res ? res.status : 0;
  console.log(JSON.stringify({ pro: 'gumroad', path: VERIFY_PATH, product, status }));
  res?.body?.cancel().catch(() => {});
  return { ok: false, reason: 'upstream', status };
}

async function readJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * One verify call for one product. 404 (or a 200 without success) = the key is not this product's;
 * 200 with success = Gumroad knows the key, and `granted` decides whether it still pays for Pro.
 */
async function verifyProduct(env: ProEnv, product: Product, key: string, increment: boolean, timeoutMs: number): Promise<Verification> {
  const productId = product === 'lifetime' ? env.GUMROAD_PRODUCT_LIFETIME! : env.GUMROAD_PRODUCT_MEMBERSHIP!;
  const form = new URLSearchParams({ product_id: productId, license_key: key, increment_uses_count: increment ? 'true' : 'false' });
  let res: Response;
  try {
    res = await fetch(gumroadBase(env) + VERIFY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'User-Agent': USER_AGENT },
      body: form.toString(),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    console.log(JSON.stringify({ pro: 'gumroad', path: VERIFY_PATH, product, error: err instanceof Error ? err.message : String(err) }));
    return { ok: false, reason: 'upstream', status: 0 };
  }
  if (res.status === 404) {
    res.body?.cancel().catch(() => {});
    return { ok: false, reason: 'invalid' };
  }
  if (!res.ok) return upstream(res, product);
  const data = await readJson(res);
  if (!data || typeof data !== 'object') return { ok: false, reason: 'upstream', status: res.status };
  if (data.success !== true) return { ok: false, reason: 'invalid' };
  const purchase: Purchase = data.purchase && typeof data.purchase === 'object' ? data.purchase : {};
  const uses = typeof data.uses === 'number' ? data.uses : undefined;
  if (!granted(purchase)) return { ok: false, reason: 'invalid', uses };
  return { ok: true, plan: planFor(product, purchase), purchase, uses };
}

/**
 * Verifies a key against the membership product, then the lifetime one (two POSTs at most).
 * Stops at the first Gumroad failure: if the membership check is down, lifetime is too.
 */
async function verifyKey(env: ProEnv, key: string, increment: boolean, timeoutMs: number): Promise<Verification> {
  const m = await verifyProduct(env, 'membership', key, increment, timeoutMs);
  if (m.ok || m.reason === 'upstream') return m;
  const l = await verifyProduct(env, 'lifetime', key, increment, timeoutMs);
  if (l.ok || l.reason === 'upstream') return l;
  // Both say invalid: keep the `uses` of the one that knew the key (a refunded sale, say).
  return m.uses !== undefined ? m : l;
}

/** A timestamp field that is set and already in the past; Gumroad's membership fields hold the end date. */
function ended(ts: string | null | undefined, nowMs: number): boolean {
  if (!ts) return false;
  const t = Date.parse(ts);
  return Number.isNaN(t) || t <= nowMs;
}

/**
 * Paid and still paying: not refunded, not charged back, no dispute lost, and the membership (if any)
 * has not ended, failed to renew or passed its cancellation date. A cancellation whose date is still
 * ahead keeps access until then (the cookie expires at that date, see cookieExp).
 */
function granted(p: Purchase, nowMs = Date.now()): boolean {
  if (p.refunded === true || p.chargebacked === true) return false;
  if (p.disputed === true && p.dispute_won !== true) return false;
  if (p.subscription_ended_at || p.subscription_failed_at) return false;
  if (ended(p.subscription_cancelled_at, nowMs)) return false;
  return true;
}

function planFor(product: Product, p: Purchase): ProPlan {
  if (product === 'lifetime') return 'lifetime';
  return p.recurrence === 'yearly' ? 'yearly' : 'monthly';
}

/** Cookie expiry: 30 days, or the membership's cancellation date if sooner. */
function cookieExp(p: Purchase | undefined, nowSec: number): number {
  let exp = nowSec + COOKIE_SECONDS;
  if (p?.subscription_cancelled_at) {
    const t = Math.floor(Date.parse(p.subscription_cancelled_at) / 1000);
    if (t > nowSec && t < exp) exp = t;
  }
  return exp;
}

const stateOf = (p: Payload): ProState => ({ pro: true, plan: p.p, expiresAt: new Date(p.exp * 1000).toISOString() });

const available = (env: ProEnv) => !!env.GUMROAD_PRODUCT_MEMBERSHIP && !!env.GUMROAD_PRODUCT_LIFETIME && !!secretOf(env);

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

/** A Bearer verdict with what Watch needs: the plan and the key itself (never stored, only hashed by the caller). */
export interface BearerDetail {
  result: BearerResult;
  plan?: ProPlan;
  key?: string;
}

const BEARER_CACHE = new Map<string, { pro: boolean; plan?: ProPlan; until: number }>();

/**
 * `Authorization: Bearer <license key>` on the agent endpoints (/mcp, /api/markdown): verified
 * against Gumroad without touching the uses counter, with the verdict cached in memory for an hour
 * (five minutes for bad keys). Only a hash of the key is kept.
 */
export async function bearerPro(request: Request, env: ProEnv): Promise<BearerResult> {
  return (await bearerProDetail(request, env)).result;
}

export async function bearerProDetail(request: Request, env: ProEnv): Promise<BearerDetail> {
  const auth = request.headers.get('Authorization') || '';
  const m = /^Bearer\s+(\S+)\s*$/i.exec(auth);
  if (!m) return { result: 'none' };
  const key = m[1];
  if (!KEY_RE.test(key)) return { result: 'invalid' };
  if (!available(env)) return { result: 'invalid' };
  const id = b64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(`${env.GUMROAD_PRODUCT_MEMBERSHIP}\n${env.GUMROAD_PRODUCT_LIFETIME}\n${key}`))));
  const now = Date.now();
  const hit = BEARER_CACHE.get(id);
  const fromHit = (h: { pro: boolean; plan?: ProPlan }): BearerDetail => (h.pro ? { result: 'pro', plan: h.plan || 'pro', key } : { result: 'invalid' });
  if (hit && hit.until > now) return fromHit(hit);
  const v = await verifyKey(env, key, false, BEARER_TIMEOUT_MS);
  if (!v.ok && v.reason === 'upstream') return hit ? fromHit(hit) : { result: 'upstream' };
  if (BEARER_CACHE.size >= BEARER_CACHE_MAX) BEARER_CACHE.clear();
  BEARER_CACHE.set(id, { pro: v.ok, plan: v.plan, until: now + (v.ok ? BEARER_OK_MS : BEARER_BAD_MS) });
  return v.ok ? { result: 'pro', plan: v.plan || 'pro', key } : { result: 'invalid' };
}

/**
 * The license key and plan behind a valid Pro cookie (signature, expiry and decryption only, no
 * network). Watch hashes the key to find the caller's watches; the key itself is never stored.
 */
export async function proKeyFromRequest(request: Request, env: ProEnv): Promise<{ key: string; plan: ProPlan } | null> {
  const secret = secretOf(env);
  if (!secret) return null;
  const raw = readCookie(request, COOKIE);
  if (!raw) return null;
  const payload = await verifyCookie(raw, secret);
  if (!payload) return null;
  const key = await decryptKey(payload.k, secret);
  return key ? { key, plan: payload.p } : null;
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
          ? { monthly: env.GUMROAD_URL_MONTHLY || '', yearly: env.GUMROAD_URL_YEARLY || '', lifetime: env.GUMROAD_URL_LIFETIME || '' }
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
    // The only call that increments Gumroad's uses counter: it counts activations per key.
    const v = await verifyKey(env, key, true, ACTIVATE_TIMEOUT_MS);
    if (!v.ok) {
      console.log(JSON.stringify({ pro: 'activate', ok: false, reason: v.reason, status: v.status, uses: v.uses, ms: Date.now() - started }));
      if (v.reason === 'upstream' && v.status === 429) return json({ error: 'rate_limited' }, 429, { 'Retry-After': '60' });
      return v.reason === 'upstream' ? json({ error: 'upstream' }, 502) : json({ error: 'invalid_key' }, 401);
    }
    if (typeof v.uses === 'number' && v.uses > MAX_USES) {
      console.log(JSON.stringify({ pro: 'activate', ok: false, reason: 'limit', plan: v.plan, uses: v.uses, ms: Date.now() - started }));
      return json({ error: 'activation_limit' }, 401);
    }
    const nowSec = Math.floor(Date.now() / 1000);
    const payload: Payload = { k: await encryptKey(key, secret), p: v.plan || 'pro', exp: cookieExp(v.purchase, nowSec), chk: nowSec };
    console.log(JSON.stringify({ pro: 'activate', ok: true, plan: payload.p, uses: v.uses, ms: Date.now() - started }));
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
  const v: Verification = key ? await verifyKey(env, key, false, RECHECK_TIMEOUT_MS) : { ok: false, reason: 'invalid' };
  if (v.ok) {
    const fresh: Payload = { ...payload, p: v.plan || 'pro', exp: cookieExp(v.purchase, nowSec), chk: nowSec };
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
  // Gumroad unreachable: keep trusting the cookie until its own expiry.
  return json({ ...stateOf(payload), stale: true });
}

function withCookie(request: Request, cookie: string, state: ProState): Response {
  const headers = cookieHeaders(request, cookie);
  headers.set('Content-Type', JSON_HEADERS['Content-Type']);
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(state), { status: 200, headers });
}
