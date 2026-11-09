import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import { fxBase } from '../fx';
import {
  EMAIL_RE,
  HANDLE_RE,
  MODES,
  RECENT_EVENTS,
  TOKEN_RE,
  TRIAL_ACCOUNTS,
  TRIAL_DAYS,
  TRIAL_MAX_DEFAULT,
  TRIAL_VERIFY_HOURS,
  excerpt,
  hashTrialEmail,
  json,
  marks,
  newId,
  normalizeEmail,
  nowIso,
  postUrl,
  randomToken,
  readBody,
  recentEvents,
  trialKeyHash,
  typesForMode,
  type EventRow,
  type TrialEndReason,
  type TrialRow,
  type WatchEnv,
  type WatchMode,
  type WatchRow,
} from './db';
import { emailSender, publicOrigin, trialEndedEmail, trialReminderEmail, trialVerificationEmail, type DigestItem, type DigestTrial } from './email';
import { PRO_PATHS, isMailLang } from './mail-copy';
import { eventTitle, eventView, toFeedEvent } from './feed';
import { lookupProfile, seedHandle } from './poll';

/**
 * Xtracticle Watch free trial: one public X account for TRIAL_DAYS days, no license, double opt-in e-mail.
 * Contract: docs/watch-api.md, "Trial". Schema: migrations/0002_trials.sql.
 *
 *   GET    /api/watch/trial/config          { available, full, days, maxAccounts, modes }
 *   POST   /api/watch/trial                 { handle, email, mode? } → pending trial + verification e-mail
 *   GET    /api/watch/trial/verify/:token   e-mail link: creates the watch, starts the clock, redirects to /pro
 *   GET    /api/watch/trial/:manageToken    the trial's state and recent events
 *   PATCH  /api/watch/trial/:manageToken    { mode }
 *   DELETE /api/watch/trial/:manageToken    end the trial (pending: cancel the request)
 *
 * The trial's watch is a normal row in `watches` with key_hash = 'trial:' + trial id, so the cron polls it like
 * a paid watch (polling is per handle and shared) and the digest mails it; license callers never see it because
 * their key_hash is a hex HMAC. Load guards (owner's condition): WATCH_TRIAL_MAX live trials, TRIAL_LIMITER per IP
 * on POST, WATCH_TRIAL_DISABLED kill switch.
 */

const DAY_MS = 24 * 3600 * 1000;
/** The reminder goes out this long before expiry (day 12 of 14). */
const REMINDER_BEFORE_MS = 2 * DAY_MS;
/** Expiries / reminders handled per cron run (each may send an e-mail). */
const LIFECYCLE_PER_RUN = 20;
/** Events listed in the "trial ended" e-mail. */
const ENDED_MAIL_EVENTS = 20;

const trialMax = (env: WatchEnv) => Math.max(0, parseInt(env.WATCH_TRIAL_MAX || '', 10) || TRIAL_MAX_DEFAULT);
const disabled = (env: WatchEnv) => env.WATCH_TRIAL_DISABLED === '1';
const expiryOf = (verifiedAt: string) => new Date(Date.parse(verifiedAt) + TRIAL_DAYS * DAY_MS).toISOString();

export async function handleTrial(request: Request, env: WatchEnv, db: D1Database, path: string, url: URL): Promise<Response> {
  let m: RegExpMatchArray | null;
  if (path === '/api/watch/trial/config') return config(env, db);
  if ((m = path.match(/^\/api\/watch\/trial\/verify\/([^/]+)$/))) return verify(request, env, db, m[1]);
  if (path === '/api/watch/trial') {
    if (request.method === 'POST') return start(request, env, db);
    return json({ error: 'method_not_allowed' }, 405);
  }
  if ((m = path.match(/^\/api\/watch\/trial\/([^/]+)$/))) {
    if (!TOKEN_RE.test(m[1])) return json({ error: 'not_found' }, 404);
    if (request.method === 'GET') return view(db, m[1], url.origin);
    if (request.method === 'PATCH') return patch(request, db, m[1], url.origin);
    if (request.method === 'DELETE') return end(request, db, m[1]);
    return json({ error: 'method_not_allowed' }, 405);
  }
  return json({ error: 'not_found' }, 404);
}

/* ─── Helpers ─── */

const liveCount = async (db: D1Database, statuses: string[]) =>
  (await db.prepare(`SELECT COUNT(*) AS n FROM trials WHERE status IN (${statuses.map(s => `'${s}'`).join(', ')})`).first<{ n: number }>())?.n ?? 0;

const byManageToken = (db: D1Database, token: string) => db.prepare('SELECT * FROM trials WHERE manage_token = ?').bind(token).first<TrialRow>();

/** The SPA sends this header; without it a trial could be started from any page on the web. */
const fromSite = (request: Request) => request.headers.get('X-Xt-Client') === 'web';

const redirect = (q: string, hash = '', lang?: string | null) =>
  new Response(null, { status: 302, headers: { Location: `${PRO_PATHS[isMailLang(lang) ? lang : 'en']}?trial=${q}${hash}`, 'Cache-Control': 'no-store' } });

function daysLeft(expiresAt: string | null, now = Date.now()): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / DAY_MS));
}

async function trialEvents(db: D1Database, t: TrialRow, limit: number): Promise<EventRow[]> {
  if (!t.verified_at) return [];
  return recentEvents(db, t.handle, t.mode, limit, t.verified_at, t.ended_at);
}

/** Same filter as trialEvents, as a count. */
async function trialEventCount(db: D1Database, t: TrialRow): Promise<number> {
  if (!t.verified_at) return 0;
  const types = typesForMode(t.mode);
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM events WHERE handle = ? AND type IN (${marks(types.length)}) AND detected_at >= ?${t.ended_at ? ' AND detected_at <= ?' : ''}`)
    .bind(t.handle, ...types, t.verified_at, ...(t.ended_at ? [t.ended_at] : []))
    .first<{ n: number }>();
  return row?.n ?? 0;
}

async function trialView(db: D1Database, t: TrialRow, origin: string) {
  const w = t.watch_id ? await db.prepare('SELECT * FROM watches WHERE id = ?').bind(t.watch_id).first<WatchRow>() : null;
  const events = await trialEvents(db, t, RECENT_EVENTS);
  // Markdown links need a credential; the feed token is the trial user's. None once the watch is gone.
  const md = w ? `?feed=${w.feed_token}` : null;
  return {
    status: t.status,
    handle: t.handle,
    mode: t.mode,
    email: t.email,
    days: TRIAL_DAYS,
    createdAt: t.created_at,
    verifiedAt: t.verified_at,
    expiresAt: t.expires_at,
    daysLeft: t.status === 'active' ? daysLeft(t.expires_at) : null,
    endedAt: t.ended_at,
    endReason: t.end_reason,
    watch: w
      ? {
          status: w.status,
          lastPolledAt: w.last_polled_at,
          feedUrl: `${origin}/api/watch/feed/${w.feed_token}.xml`,
          jsonFeedUrl: `${origin}/api/watch/feed/${w.feed_token}.json`,
        }
      : null,
    recent: events.map(e => eventView(origin, toFeedEvent(e), md)),
  };
}

/* ─── Routes ─── */

async function config(env: WatchEnv, db: D1Database): Promise<Response> {
  const off = disabled(env);
  const full = off ? false : (await liveCount(db, ['pending', 'active'])) >= trialMax(env);
  return json({ available: !off && !full, disabled: off, full, days: TRIAL_DAYS, maxAccounts: TRIAL_ACCOUNTS, modes: MODES });
}

async function start(request: Request, env: WatchEnv, db: D1Database): Promise<Response> {
  if (!fromSite(request)) return json({ error: 'forbidden' }, 403);
  if (disabled(env)) return json({ error: 'trial_disabled' }, 503);
  if (!env.PRO_COOKIE_SECRET) return json({ error: 'pro_unavailable' }, 503);
  if (env.TRIAL_LIMITER) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await env.TRIAL_LIMITER.limit({ key: ip })).success) return json({ error: 'rate' }, 429, { 'Retry-After': '60' });
  }
  const body = await readBody(request);
  if (!body) return json({ error: 'bad_request' }, 400);
  const rawHandle = typeof body.handle === 'string' ? body.handle.trim().replace(/^@/, '') : '';
  if (!HANDLE_RE.test(rawHandle)) return json({ error: 'bad_handle' }, 422);
  const handle = rawHandle.toLowerCase();
  const mode: WatchMode = body.mode === undefined ? 'both' : body.mode;
  if (!MODES.includes(mode)) return json({ error: 'bad_mode' }, 422);
  const email = typeof body.email === 'string' ? normalizeEmail(body.email) : '';
  if (!EMAIL_RE.test(email)) return json({ error: 'bad_email' }, 422);
  const lang = isMailLang(body.lang) ? body.lang : 'en';

  // One trial per address, ever; a pending request blocks a second one until it is verified or expires.
  const emailHash = await hashTrialEmail(email, env.PRO_COOKIE_SECRET);
  const existing = await db.prepare('SELECT status FROM trials WHERE email_hash = ?').bind(emailHash).first<{ status: string }>();
  if (existing) return json({ error: existing.status === 'pending' ? 'trial_pending' : 'trial_used' }, 409);
  if ((await liveCount(db, ['pending', 'active'])) >= trialMax(env)) return json({ error: 'trial_full' }, 503);
  if (await db.prepare('SELECT 1 AS x FROM blocklist WHERE handle = ?').bind(handle).first()) return json({ error: 'blocklisted' }, 422);

  // Same validation as POST /api/watch: the account must exist and be public.
  const profile = await lookupProfile(fxBase(env), handle);
  if (profile.status === 'not_found') return json({ error: 'not_found' }, 422);
  if (profile.status === 'error') return json({ error: 'upstream' }, 502);
  if (profile.protected) return json({ error: 'protected' }, 422);

  const now = nowIso();
  const t: TrialRow = {
    id: newId(),
    email_hash: emailHash,
    email,
    handle,
    mode,
    status: 'pending',
    verify_token: randomToken(),
    verify_expires_at: new Date(Date.now() + TRIAL_VERIFY_HOURS * 3600 * 1000).toISOString(),
    manage_token: randomToken(),
    unsub_token: randomToken(),
    watch_id: null,
    created_at: now,
    verified_at: null,
    expires_at: null,
    reminder_sent_at: null,
    ended_at: null,
    end_reason: null,
    lang,
  };
  try {
    await db
      .prepare(
        'INSERT INTO trials (id, email_hash, email, handle, mode, status, verify_token, verify_expires_at, manage_token, unsub_token, created_at, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(t.id, t.email_hash, t.email, t.handle, t.mode, t.status, t.verify_token, t.verify_expires_at, t.manage_token, t.unsub_token, t.created_at, t.lang)
      .run();
  } catch (err) {
    // Two requests racing on the same address: the unique index decides.
    if (/UNIQUE/i.test(String(err))) {
      const other = await db.prepare('SELECT status FROM trials WHERE email_hash = ?').bind(emailHash).first<{ status: string }>();
      return json({ error: other?.status === 'pending' ? 'trial_pending' : 'trial_used' }, 409);
    }
    throw err;
  }

  // Awaited (not waitUntil): a failed send is reported and the request is taken back so the address can retry.
  const sender = emailSender(env);
  if (sender) {
    const r = await sender.send({ to: email, ...trialVerificationEmail(publicOrigin(env), handle, TRIAL_DAYS, t.verify_token!, t.manage_token, t.lang) });
    console.log(JSON.stringify({ watch: 'trial_verify_mail', ok: r.ok, error: r.error }));
    if (!r.ok) {
      await db.prepare('DELETE FROM trials WHERE id = ?').bind(t.id).run();
      return json({ error: 'mail_failed' }, 502);
    }
  } else {
    // Local development only (production has the EMAIL binding): the link is logged instead of sent.
    console.log(JSON.stringify({ watch: 'trial_verify_mail', skipped: 'no e-mail sender configured', verifyToken: t.verify_token, manageToken: t.manage_token }));
  }
  console.log(JSON.stringify({ watch: 'trial_start', handle, mode }));
  return json({ status: 'pending', handle, mode, email, days: TRIAL_DAYS, verifyExpiresAt: t.verify_expires_at }, 201);
}

async function verify(request: Request, env: WatchEnv, db: D1Database, token: string): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
  if (!TOKEN_RE.test(token)) return redirect('verify_failed');
  const t = await db.prepare("SELECT * FROM trials WHERE verify_token = ? AND status = 'pending'").bind(token).first<TrialRow>();
  if (!t) return redirect('verify_failed');
  if (!t.verify_expires_at || t.verify_expires_at < nowIso()) {
    await db.prepare("DELETE FROM trials WHERE id = ? AND status = 'pending'").bind(t.id).run();
    return redirect('verify_failed', '', t.lang);
  }
  if (disabled(env)) return redirect('disabled', '', t.lang);
  // The cap counts pending requests too at start; at verification only what actually gets polled.
  if ((await liveCount(db, ['active'])) >= trialMax(env)) return redirect('full', '', t.lang);
  if (await db.prepare('SELECT 1 AS x FROM blocklist WHERE handle = ?').bind(t.handle).first()) {
    await db.prepare("DELETE FROM trials WHERE id = ? AND status = 'pending'").bind(t.id).run();
    return redirect('verify_failed', '', t.lang);
  }

  const now = nowIso();
  const w: WatchRow = {
    id: newId(),
    key_hash: trialKeyHash(t.id),
    handle: t.handle,
    mode: t.mode,
    email: t.email,
    email_verified: t.email ? 1 : 0,
    feed_token: randomToken(),
    unsub_token: t.unsub_token,
    created_at: now,
    last_polled_at: null,
    fail_count: 0,
    status: 'active',
  };
  // Baseline, as in POST /api/watch: only when nobody else watches the handle yet.
  const known = await db.prepare('SELECT 1 AS x FROM snapshots WHERE handle = ? LIMIT 1').bind(t.handle).first();
  let seeded = !!known;
  if (!known) seeded = await seedHandle(db, env, t.handle);
  w.last_polled_at = seeded && !known ? now : null;
  try {
    // One atomic batch: the trial row flips to active together with its watch (or neither does).
    await db.batch([
      db
        .prepare(
          'INSERT INTO watches (id, key_hash, handle, mode, email, email_verified, feed_token, unsub_token, created_at, last_polled_at, fail_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(w.id, w.key_hash, w.handle, w.mode, w.email, w.email_verified, w.feed_token, w.unsub_token, w.created_at, w.last_polled_at, w.fail_count, w.status),
      db
        .prepare("UPDATE trials SET status = 'active', verified_at = ?, expires_at = ?, watch_id = ?, verify_token = NULL, verify_expires_at = NULL WHERE id = ? AND status = 'pending'")
        .bind(now, expiryOf(now), w.id, t.id),
    ]);
  } catch (err) {
    // The same link opened twice at once: the first click created the watch (UNIQUE key_hash+handle).
    if (/UNIQUE/i.test(String(err))) {
      const again = await db.prepare('SELECT status FROM trials WHERE id = ?').bind(t.id).first<{ status: string }>();
      if (again?.status === 'active') return redirect('verified', `#t=${t.manage_token}`, t.lang);
    }
    throw err;
  }
  console.log(JSON.stringify({ watch: 'trial_verified', handle: t.handle, mode: t.mode, seeded, shared: !!known }));
  return redirect('verified', `#t=${t.manage_token}`, t.lang);
}

async function view(db: D1Database, token: string, origin: string): Promise<Response> {
  const t = await byManageToken(db, token);
  if (!t) return json({ error: 'not_found' }, 404);
  return json(await trialView(db, t, origin));
}

async function patch(request: Request, db: D1Database, token: string, origin: string): Promise<Response> {
  if (!fromSite(request)) return json({ error: 'forbidden' }, 403);
  const t = await byManageToken(db, token);
  if (!t) return json({ error: 'not_found' }, 404);
  const body = await readBody(request);
  if (!body) return json({ error: 'bad_request' }, 400);
  if (body.mode !== undefined) {
    if (!MODES.includes(body.mode)) return json({ error: 'bad_mode' }, 422);
    if (t.status === 'ended') return json({ error: 'trial_ended' }, 409);
    t.mode = body.mode;
    const stmts = [db.prepare('UPDATE trials SET mode = ? WHERE id = ?').bind(t.mode, t.id)];
    if (t.watch_id) stmts.push(db.prepare('UPDATE watches SET mode = ? WHERE id = ?').bind(t.mode, t.watch_id));
    await db.batch(stmts);
  }
  return json(await trialView(db, t, origin));
}

async function end(request: Request, db: D1Database, token: string): Promise<Response> {
  if (!fromSite(request)) return json({ error: 'forbidden' }, 403);
  const t = await byManageToken(db, token);
  if (!t) return json({ error: 'not_found' }, 404);
  if (t.status === 'pending') {
    // Cancelling an unverified request frees the address (no trial was used).
    await db.prepare("DELETE FROM trials WHERE id = ? AND status = 'pending'").bind(t.id).run();
    return json({ ok: true, status: 'cancelled' });
  }
  if (t.status === 'active') {
    const claimed = await claimEnd(db, t.id, 'user', nowIso());
    if (claimed) await db.batch(endStatements(db, t));
    console.log(JSON.stringify({ watch: 'trial_end', handle: t.handle, reason: 'user' }));
  }
  return json({ ok: true, status: 'ended' });
}

/* ─── Ending a trial ─── */

/** Flips an active trial to ended; false when another request or cron run got there first. */
async function claimEnd(db: D1Database, id: string, reason: TrialEndReason, now: string): Promise<boolean> {
  const r = await db
    .prepare("UPDATE trials SET status = 'ended', ended_at = ?, end_reason = ? WHERE id = ? AND status = 'active'")
    .bind(now, reason, id)
    .run();
  return r.meta.changes > 0;
}

/**
 * Removes the trial's watch (and the handle's snapshot when nobody else watches it) and forgets the address.
 * Events stay: they are per handle and pruned after 90 days anyway, so a Pro watch added later still shows them.
 */
function endStatements(db: D1Database, t: TrialRow): D1PreparedStatement[] {
  const stmts: D1PreparedStatement[] = [];
  if (t.watch_id) {
    stmts.push(
      db.prepare('DELETE FROM notifications WHERE watch_id = ?').bind(t.watch_id),
      db.prepare('DELETE FROM email_tokens WHERE watch_id = ?').bind(t.watch_id),
      db.prepare('DELETE FROM watches WHERE id = ?').bind(t.watch_id),
      db.prepare('DELETE FROM snapshots WHERE handle = ? AND NOT EXISTS (SELECT 1 FROM watches WHERE handle = ?)').bind(t.handle, t.handle),
    );
  }
  stmts.push(db.prepare('UPDATE trials SET email = NULL WHERE id = ?').bind(t.id));
  return stmts;
}

/* ─── Cron steps (called from cron.ts) ─── */

/** Bounded statements for every run: expired unverified requests, and orphaned trial watches (a run that died mid-expiry). */
export function trialHousekeeping(db: D1Database): D1PreparedStatement[] {
  return [
    db.prepare("DELETE FROM trials WHERE status = 'pending' AND verify_expires_at < ?").bind(nowIso()),
    db.prepare("DELETE FROM watches WHERE key_hash LIKE 'trial:%' AND id NOT IN (SELECT watch_id FROM trials WHERE status = 'active' AND watch_id IS NOT NULL)"),
    db.prepare("UPDATE trials SET email = NULL WHERE status = 'ended' AND email IS NOT NULL"),
  ];
}

/** A digest-style item without a Markdown link: once the trial is over there is no credential left to open one. */
function toItem(e: EventRow): DigestItem {
  const f = toFeedEvent(e);
  return {
    handle: f.handle,
    type: f.type,
    title: eventTitle(f),
    text: f.payload.text ? excerpt(f.payload.text, 280) : '',
    url: f.postId ? postUrl(f.handle, f.postId) : undefined,
    wayback: f.payload.wayback,
    detectedAt: f.detectedAt,
  };
}

/**
 * Expires trials whose 14 days are over (watch removed, one "trial ended" e-mail) and sends the one reminder
 * two days before expiry. Each trial is claimed before its e-mail goes out, so a repeated run never mails twice.
 */
export async function trialLifecycle(db: D1Database, env: WatchEnv, now = Date.now()): Promise<{ ended: number; reminded: number }> {
  const origin = publicOrigin(env);
  const sender = emailSender(env);
  const nowStr = new Date(now).toISOString();
  let ended = 0;
  let reminded = 0;

  const expired = (await db.prepare("SELECT * FROM trials WHERE status = 'active' AND expires_at <= ? ORDER BY expires_at LIMIT ?").bind(nowStr, LIFECYCLE_PER_RUN).all<TrialRow>()).results;
  for (const t of expired) {
    if (!(await claimEnd(db, t.id, 'expired', nowStr))) continue;
    t.ended_at = nowStr;
    // Gather what the trial caught before the watch (and its feed token) is gone.
    const events = await trialEvents(db, t, ENDED_MAIL_EVENTS);
    const total = events.length < ENDED_MAIL_EVENTS ? events.length : await trialEventCount(db, t);
    await db.batch(endStatements(db, t));
    ended++;
    if (!t.email) continue; // unsubscribed
    if (!sender) {
      console.log(JSON.stringify({ watch: 'trial_ended_mail', skipped: 'no e-mail sender configured', handle: t.handle, events: total }));
      continue;
    }
    const r = await sender.send({ to: t.email, ...trialEndedEmail(origin, t.handle, events.map(toItem), total, t.unsub_token, t.lang) });
    console.log(JSON.stringify({ watch: 'trial_ended_mail', handle: t.handle, ok: r.ok, error: r.error, events: total }));
  }

  const soon = (
    await db
      .prepare("SELECT * FROM trials WHERE status = 'active' AND reminder_sent_at IS NULL AND email IS NOT NULL AND expires_at > ? AND expires_at <= ? LIMIT ?")
      .bind(nowStr, new Date(now + REMINDER_BEFORE_MS).toISOString(), LIFECYCLE_PER_RUN)
      .all<TrialRow>()
  ).results;
  for (const t of soon) {
    const claim = await db.prepare('UPDATE trials SET reminder_sent_at = ? WHERE id = ? AND reminder_sent_at IS NULL').bind(nowStr, t.id).run();
    if (!claim.meta.changes) continue;
    reminded++;
    const left = daysLeft(t.expires_at, now) ?? 0;
    const caught = await trialEventCount(db, t);
    if (!sender) {
      console.log(JSON.stringify({ watch: 'trial_reminder_mail', skipped: 'no e-mail sender configured', handle: t.handle, daysLeft: left, events: caught }));
      continue;
    }
    const r = await sender.send({ to: t.email!, ...trialReminderEmail(origin, t.handle, left, t.expires_at!, caught, t.manage_token, t.unsub_token, t.lang) });
    console.log(JSON.stringify({ watch: 'trial_reminder_mail', handle: t.handle, ok: r.ok, error: r.error }));
  }
  return { ended, reminded };
}

/** For the digest: days left and manage token per trial watch id (only active trials). */
export async function activeTrialsByWatch(db: D1Database, now = Date.now()): Promise<Map<string, DigestTrial>> {
  const rows = (
    await db
      .prepare("SELECT watch_id, expires_at, manage_token, lang FROM trials WHERE status = 'active' AND watch_id IS NOT NULL")
      .all<{ watch_id: string; expires_at: string; manage_token: string; lang: string }>()
  ).results;
  return new Map(rows.map(r => [r.watch_id, { daysLeft: daysLeft(r.expires_at, now) ?? 0, manageToken: r.manage_token, lang: r.lang }]));
}
