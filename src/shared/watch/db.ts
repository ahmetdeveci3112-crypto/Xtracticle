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

export const HANDLE_RE = /^[A-Za-z0-9_]{1,15}$/;
export const MODES: WatchMode[] = ['deleted', 'new', 'both'];
export const RETENTION_DAYS = 90;
export const LIMIT_MEMBERSHIP = 5;
export const LIMIT_LIFETIME = 2;

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
