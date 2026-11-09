import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import { bearerProDetail, proKeyFromRequest, type ProEnv, type ProPlan } from '../pro';
import type { FxEnv } from '../fx';

/**
 * Xtracticle Pro "Watch" — shared types, the D1 binding and identity helpers.
 * Schema: migrations/0001_watch.sql. Product notes: docs/pro-watch-plan.md, API: docs/watch-api.md.
 */

export interface WatchEnv extends ProEnv, FxEnv {
  /** D1 binding (wrangler.json `d1_databases`). Missing = Watch answers 503 and the cron does nothing. */
  WATCH_DB?: D1Database;
  /** Cloudflare Email Service binding (wrangler.json `send_email`). Preferred sender when present. */
  EMAIL?: CfEmailBinding;
  /** Resend API key (secret). Fallback sender when the EMAIL binding is missing; neither = e-mails are logged and skipped. */
  RESEND_API_KEY?: string;
  /** From address for Watch e-mails, e.g. "Xtracticle <watch@xtracticle.com>". */
  WATCH_EMAIL_FROM?: string;
  /** Handles polled per cron run (default 5). */
  WATCH_BATCH?: string;
  /** Public origin for links in e-mails (default https://xtracticle.com). */
  WATCH_PUBLIC_ORIGIN?: string;
  /** Testing only: replaces https://web.archive.org for the Wayback copy lookup. */
  CDX_BASE_URL?: string;
  /** Free trial: live trials (pending + active) allowed at once (default 300). Full = POST /api/watch/trial answers trial_full. */
  WATCH_TRIAL_MAX?: string;
  /** Kill switch: "1" stops new trials (config.available = false, POST and verify refuse). Running trials continue. */
  WATCH_TRIAL_DISABLED?: string;
  /** Per-IP limiter for POST /api/watch/trial (wrangler.json `ratelimits`, 3 per 60 s). */
  TRIAL_LIMITER?: RateLimiter;
}

/** The part of a Workers `ratelimits` binding we use (structural: src/shared is also compiled by the frontend tsconfig). */
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

/** The part of the Cloudflare Email Service `send_email` binding we use (structured send). */
export interface CfEmailBinding {
  send(message: {
    to: string;
    from: string | { email: string; name?: string };
    subject: string;
    text?: string;
    html?: string;
    headers?: Record<string, string>;
  }): Promise<{ messageId?: string }>;
}

export type WatchMode = 'deleted' | 'new' | 'both';
export type WatchStatus = 'active' | 'paused' | 'protected' | 'gone';
export type EventType = 'deleted' | 'new' | 'protected' | 'gone' | 'renamed';

export interface WatchRow {
  id: string;
  key_hash: string;
  handle: string;
  mode: WatchMode;
  email: string | null;
  email_verified: number;
  feed_token: string;
  unsub_token: string;
  created_at: string;
  last_polled_at: string | null;
  fail_count: number;
  status: WatchStatus;
}

export interface SnapshotRow {
  handle: string;
  post_id: string;
  text: string;
  created_at: string | null;
  media_json: string | null;
  parent_id: string | null;
  author_name: string | null;
  first_seen_at: string;
  last_seen_at: string;
}

export interface EventRow {
  id: string;
  handle: string;
  type: EventType;
  post_id: string | null;
  payload_json: string;
  detected_at: string;
}

/** Media links of a stored post (files are never downloaded). */
export interface StoredMedia {
  photos?: { url: string; altText?: string }[];
  videos?: { url: string; thumbnail_url?: string }[];
}

/** payload_json of a `deleted` or `new` event: the post as last seen. */
export interface PostPayload {
  text: string;
  createdAt: string | null;
  media: StoredMedia | null;
  parentId: string | null;
  authorName: string | null;
  /** Wayback Machine copy of the post, when one existed before the deletion. */
  wayback?: string;
}

export type TrialStatus = 'pending' | 'active' | 'ended';
export type TrialEndReason = 'expired' | 'user';

/** migrations/0002_trials.sql */
export interface TrialRow {
  id: string;
  email_hash: string;
  email: string | null;
  handle: string;
  mode: WatchMode;
  status: TrialStatus;
  verify_token: string | null;
  verify_expires_at: string | null;
  manage_token: string;
  unsub_token: string;
  watch_id: string | null;
  created_at: string;
  verified_at: string | null;
  expires_at: string | null;
  reminder_sent_at: string | null;
  ended_at: string | null;
  end_reason: TrialEndReason | null;
  /** Site language the trial was started from (migrations/0003_trial_lang.sql); picks the e-mail language and the /pro page. */
  lang: string;
}

export const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[A-Za-z]{2,}$/;
export const MODES: WatchMode[] = ['deleted', 'new', 'both'];
export const RETENTION_DAYS = 90;
export const LIMIT_MEMBERSHIP = 5;
export const LIMIT_LIFETIME = 2;
/** Free trial: one account, 14 days; the verification link lives 24 h. */
export const TRIAL_DAYS = 14;
export const TRIAL_ACCOUNTS = 1;
export const TRIAL_VERIFY_HOURS = 24;
export const TRIAL_MAX_DEFAULT = 300;
/** watches.key_hash of a trial watch: this prefix + trials.id. License hashes are hex, so they never collide. */
export const TRIAL_KEY_PREFIX = 'trial:';
export const trialKeyHash = (trialId: string) => TRIAL_KEY_PREFIX + trialId;
export const isTrialKeyHash = (keyHash: string) => keyHash.startsWith(TRIAL_KEY_PREFIX);
/** Events a watch shows in GET /api/watch and in the trial view. */
export const RECENT_EVENTS = 20;

export const nowIso = () => new Date().toISOString();
export const isoAgo = (ms: number, now = Date.now()) => new Date(now - ms).toISOString();

export const watchLimit = (plan: ProPlan | undefined): number => (plan === 'lifetime' ? LIMIT_LIFETIME : LIMIT_MEMBERSHIP);

/** Event types a watch in this mode receives. Status events (protected/gone/renamed) go to every mode. */
export function typesForMode(mode: WatchMode): EventType[] {
  const status: EventType[] = ['protected', 'gone', 'renamed'];
  if (mode === 'deleted') return ['deleted', ...status];
  if (mode === 'new') return ['new', ...status];
  return ['deleted', 'new', ...status];
}

/* ─── Random tokens ─── */

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 32 random bytes as base64url (43 chars): feed, unsubscribe and e-mail verification tokens. */
export const randomToken = () => b64url(crypto.getRandomValues(new Uint8Array(32)));
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
export const newId = () => crypto.randomUUID();

/* ─── Identity: key hash ─── */

const HASH_KEYS = new Map<string, Promise<CryptoKey>>();

function hashKeyFor(secret: string): Promise<CryptoKey> {
  let k = HASH_KEYS.get(secret);
  if (!k) {
    k = (async () => {
      const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'HKDF', false, ['deriveKey']);
      return crypto.subtle.deriveKey(
        { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode('xtracticle-watch-key-hash') },
        base,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
    })();
    HASH_KEYS.set(secret, k);
  }
  return k;
}

/** HMAC-SHA256 of the license key under a key derived from PRO_COOKIE_SECRET (HKDF, like pro.ts). Hex. */
export async function hashLicenseKey(key: string, secret: string): Promise<string> {
  const mac = await hashKeyFor(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', mac, enc.encode(key)));
  let hex = '';
  for (let i = 0; i < sig.length; i++) hex += sig[i].toString(16).padStart(2, '0');
  return hex;
}

/** Trial e-mails: lower-cased and trimmed (nothing more: the one-trial rule is a courtesy limit, not a wall). */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** HMAC of the normalized address under the same derived key, domain-separated from license hashes. Hex. */
export const hashTrialEmail = (email: string, secret: string) => hashLicenseKey(`trial-email:${normalizeEmail(email)}`, secret);

export interface WatchIdentity {
  keyHash: string;
  plan: ProPlan;
  /** True when the caller authenticated with a Bearer key (no X-Xt-Client check). */
  bearer: boolean;
}

/* Plain shape (not a discriminated union): tsconfig.worker.json is not strict, so `!r.ok` would not narrow. */
export interface IdentityResult {
  ok: boolean;
  id?: WatchIdentity;
  status?: number;
  error?: string;
}

/**
 * Who is calling: the Pro cookie (SPA) or `Authorization: Bearer <license key>` (agents, MCP later).
 * The Bearer header wins when present so a stale cookie never hides a key problem.
 */
export async function identify(request: Request, env: WatchEnv): Promise<IdentityResult> {
  const secret = env.PRO_COOKIE_SECRET;
  if (!secret) return { ok: false, status: 503, error: 'pro_unavailable' };
  if (request.headers.get('Authorization')) {
    const b = await bearerProDetail(request, env);
    if (b.result === 'upstream') return { ok: false, status: 502, error: 'upstream' };
    if (b.result !== 'pro' || !b.key) return { ok: false, status: 401, error: 'invalid_key' };
    return { ok: true, id: { keyHash: await hashLicenseKey(b.key, secret), plan: b.plan || 'pro', bearer: true } };
  }
  const c = await proKeyFromRequest(request, env);
  if (!c) return { ok: false, status: 402, error: 'pro_required' };
  if (request.headers.get('X-Xt-Client') !== 'web') return { ok: false, status: 403, error: 'forbidden' };
  return { ok: true, id: { keyHash: await hashLicenseKey(c.key, secret), plan: c.plan, bearer: false } };
}

/* ─── Small D1 helpers ─── */

export const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...JSON_HEADERS, ...extra } });
}

/** `?, ?, ?` for an IN (...) list. */
export const marks = (n: number) => Array.from({ length: n }, () => '?').join(', ');

const MAX_BODY = 4096;

/** The JSON body of a request as a plain object; null when missing, too large or not an object. */
export async function readBody(request: Request): Promise<any | null> {
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return null;
    const body = text ? JSON.parse(text) : {};
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}

/** The handle's latest events that a watch in `mode` receives, newest first; `since`/`until` bound detected_at (trial views). */
export async function recentEvents(db: D1Database, handle: string, mode: WatchMode, limit: number, since?: string | null, until?: string | null): Promise<EventRow[]> {
  const types = typesForMode(mode);
  const bounds = (since ? ' AND detected_at >= ?' : '') + (until ? ' AND detected_at <= ?' : '');
  const args: (string | number)[] = [handle, ...types];
  if (since) args.push(since);
  if (until) args.push(until);
  args.push(limit);
  return (
    await db
      .prepare(`SELECT * FROM events WHERE handle = ? AND type IN (${marks(types.length)})${bounds} ORDER BY detected_at DESC LIMIT ?`)
      .bind(...args)
      .all<EventRow>()
  ).results;
}

export function parsePayload(e: Pick<EventRow, 'payload_json'>): Partial<PostPayload> {
  try {
    const p = JSON.parse(e.payload_json);
    return p && typeof p === 'object' ? p : {};
  } catch {
    return {};
  }
}

export const postUrl = (handle: string, id: string) => `https://x.com/${handle}/status/${id}`;

/** First `max` characters on one line, without cutting a surrogate pair. */
export function excerpt(text: string, max = 200): string {
  const line = (text || '').replace(/\s+/g, ' ').trim();
  if (line.length <= max) return line;
  let cut = line.slice(0, max);
  const last = cut.charCodeAt(cut.length - 1);
  if (last >= 0xd800 && last <= 0xdbff) cut = cut.slice(0, -1);
  return cut.trimEnd() + '…';
}

/**
 * Blocklist enforcement, in one batch: pause every watch on a blocklisted handle and delete its
 * stored posts and events. Run by the cron each time and by the owner's SQL step (docs/watch-api.md).
 */
export function blocklistStatements(db: D1Database): D1PreparedStatement[] {
  return [
    db.prepare("UPDATE watches SET status = 'paused' WHERE status <> 'paused' AND handle IN (SELECT handle FROM blocklist)"),
    db.prepare('DELETE FROM snapshots WHERE handle IN (SELECT handle FROM blocklist)'),
    db.prepare('DELETE FROM events WHERE handle IN (SELECT handle FROM blocklist)'),
  ];
}
