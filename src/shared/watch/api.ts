import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import { fxBase } from '../fx';
import {
  HANDLE_RE,
  MODES,
  TOKEN_RE,
  blocklistStatements,
  identify,
  isoAgo,
  json,
  marks,
  newId,
  nowIso,
  randomToken,
  typesForMode,
  watchLimit,
  type EventRow,
  type WatchEnv,
  type WatchIdentity,
  type WatchMode,
  type WatchRow,
} from './db';
import { emailSender, publicOrigin, verificationEmail } from './email';
import { eventMarkdown, eventView, jsonFeed, rssFeed, toFeedEvent } from './feed';
import { lookupProfile, seedHandle } from './poll';

/**
 * /api/watch/* — Xtracticle Pro account monitoring (contract: docs/watch-api.md).
 *
 *   GET    /api/watch                      the caller's watches with recent events
 *   POST   /api/watch { handle, mode }     add a watch (validates the account, seeds the baseline)
 *   PATCH  /api/watch/:id { mode?, email? } change mode; set (double opt-in) or clear the e-mail
 *   DELETE /api/watch/:id
 *   GET    /api/watch/verify/:token        e-mail confirmation link (redirects to /pro)
 *   GET    /api/watch/unsubscribe/:token   confirmation page; POST = one-click unsubscribe
 *   GET    /api/watch/feed/:token.xml|json RSS 2.0 / JSON Feed (the token is the secret)
 *   GET    /api/watch/event/:id.md         a stored post as Markdown (Pro, must watch the handle)
 *
 * Identity: the Pro cookie (plus X-Xt-Client: web) or Authorization: Bearer <license key>.
 * Returns null for any other path so the Worker continues routing.
 */

const RECENT_EVENTS = 20;
const FEED_EVENTS = 50;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[A-Za-z]{2,}$/;
const VERIFY_HOURS = 24;
const MAX_BODY = 4096;

export async function handleWatch(request: Request, env: WatchEnv, waitUntil?: (p: Promise<unknown>) => void): Promise<Response | null> {
  const url = new URL(request.url);
  if (!/^\/api\/watch(?:\/|$)/.test(url.pathname)) return null;
  const path = url.pathname.replace(/\/+$/, '');
  const db = env.WATCH_DB;
  if (!db) return json({ error: 'watch_unavailable' }, 503);

  let m: RegExpMatchArray | null;
  if ((m = path.match(/^\/api\/watch\/feed\/([^/.]+)\.(xml|json)$/))) return feed(request, db, url.origin, m[1], m[2] as 'xml' | 'json');
  if ((m = path.match(/^\/api\/watch\/verify\/([^/]+)$/))) return verify(request, db, m[1]);
  if ((m = path.match(/^\/api\/watch\/unsubscribe\/([^/]+)$/))) return unsubscribe(request, db, m[1]);

  const who = await identify(request, env);
  if (!who.ok || !who.id) return json({ error: who.error || 'forbidden' }, who.status || 403);
  const id = who.id;

  if ((m = path.match(/^\/api\/watch\/event\/([^/.]+)\.md$/))) return eventMd(request, db, id, m[1]);
  if (path === '/api/watch') {
    if (request.method === 'GET') return list(db, id, url.origin);
    if (request.method === 'POST') return create(request, db, env, id, url.origin);
    return json({ error: 'method_not_allowed' }, 405);
  }
  if ((m = path.match(/^\/api\/watch\/([0-9a-f-]{36})$/))) {
    if (request.method === 'PATCH') return patch(request, db, env, id, m[1], url.origin, waitUntil);
    if (request.method === 'DELETE') return remove(db, id, m[1]);
    return json({ error: 'method_not_allowed' }, 405);
  }
  return json({ error: 'not_found' }, 404);
}

/* ─── Helpers ─── */

async function readBody(request: Request): Promise<any | null> {
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return null;
    const body = text ? JSON.parse(text) : {};
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}

async function recentEvents(db: D1Database, handle: string, mode: WatchMode, limit: number): Promise<EventRow[]> {
  const types = typesForMode(mode);
  return (
    await db
      .prepare(`SELECT * FROM events WHERE handle = ? AND type IN (${marks(types.length)}) ORDER BY detected_at DESC LIMIT ?`)
      .bind(handle, ...types, limit)
      .all<EventRow>()
  ).results;
}

function watchView(origin: string, w: WatchRow, events: EventRow[]) {
  return {
    id: w.id,
    handle: w.handle,
    mode: w.mode,
    email: w.email,
    emailVerified: !!w.email_verified,
    status: w.status,
    createdAt: w.created_at,
    lastPolledAt: w.last_polled_at,
    feedUrl: `${origin}/api/watch/feed/${w.feed_token}.xml`,
    jsonFeedUrl: `${origin}/api/watch/feed/${w.feed_token}.json`,
    recent: events.map(e => eventView(origin, toFeedEvent(e))),
  };
}

const ownWatch = (db: D1Database, id: WatchIdentity, watchId: string) =>
  db.prepare('SELECT * FROM watches WHERE id = ? AND key_hash = ?').bind(watchId, id.keyHash).first<WatchRow>();

/* ─── Routes ─── */

async function list(db: D1Database, id: WatchIdentity, origin: string): Promise<Response> {
  const rows = (await db.prepare('SELECT * FROM watches WHERE key_hash = ? ORDER BY created_at').bind(id.keyHash).all<WatchRow>()).results;
  const watches = [];
  for (const w of rows) watches.push(watchView(origin, w, await recentEvents(db, w.handle, w.mode, RECENT_EVENTS)));
  return json({ limit: watchLimit(id.plan), plan: id.plan, watches });
}

async function create(request: Request, db: D1Database, env: WatchEnv, id: WatchIdentity, origin: string): Promise<Response> {
  const body = await readBody(request);
  if (!body) return json({ error: 'bad_request' }, 400);
  const raw = typeof body.handle === 'string' ? body.handle.trim().replace(/^@/, '') : '';
  if (!HANDLE_RE.test(raw)) return json({ error: 'bad_handle' }, 422);
  const handle = raw.toLowerCase();
  const mode: WatchMode = body.mode === undefined ? 'both' : body.mode;
  if (!MODES.includes(mode)) return json({ error: 'bad_mode' }, 422);

  if (await db.prepare('SELECT 1 AS x FROM blocklist WHERE handle = ?').bind(handle).first()) return json({ error: 'blocklisted' }, 422);
  const limit = watchLimit(id.plan);
  const count = (await db.prepare('SELECT COUNT(*) AS n FROM watches WHERE key_hash = ?').bind(id.keyHash).first<{ n: number }>())?.n ?? 0;
  if (await db.prepare('SELECT 1 AS x FROM watches WHERE key_hash = ? AND handle = ?').bind(id.keyHash, handle).first()) {
    return json({ error: 'exists' }, 409);
  }
  if (count >= limit) return json({ error: 'limit_reached', limit }, 422);

  // One profile lookup: the account must exist and be public.
  const profile = await lookupProfile(fxBase(env), handle);
  if (profile.status === 'not_found') return json({ error: 'not_found' }, 422);
  if (profile.status === 'error') return json({ error: 'upstream' }, 502);
  if (profile.protected) return json({ error: 'protected' }, 422);

  const now = nowIso();
  const w: WatchRow = {
    id: newId(),
    key_hash: id.keyHash,
    handle,
    mode,
    email: null,
    email_verified: 0,
    feed_token: randomToken(),
    unsub_token: randomToken(),
    created_at: now,
    last_polled_at: null,
    fail_count: 0,
    status: 'active',
  };
  // Baseline: only when nobody else watches the handle yet (its snapshot is shared and already current).
  const known = await db.prepare('SELECT 1 AS x FROM snapshots WHERE handle = ? LIMIT 1').bind(handle).first();
  let seeded = !!known;
  if (!known) seeded = await seedHandle(db, env, handle);
  // A fresh baseline counts as a poll; otherwise the cron seeds silently on its first visit.
  w.last_polled_at = seeded && !known ? now : null;
  try {
    await db
      .prepare(
        'INSERT INTO watches (id, key_hash, handle, mode, email, email_verified, feed_token, unsub_token, created_at, last_polled_at, fail_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(w.id, w.key_hash, w.handle, w.mode, w.email, w.email_verified, w.feed_token, w.unsub_token, w.created_at, w.last_polled_at, w.fail_count, w.status)
      .run();
  } catch (err) {
    // Two requests racing on the same (key, handle): the unique index wins.
    if (/UNIQUE/i.test(String(err))) return json({ error: 'exists' }, 409);
    throw err;
  }
  console.log(JSON.stringify({ watch: 'create', handle, mode, seeded, shared: !!known }));
  return json(watchView(origin, w, []), 201);
}

async function patch(
  request: Request,
  db: D1Database,
  env: WatchEnv,
  id: WatchIdentity,
  watchId: string,
  origin: string,
  waitUntil?: (p: Promise<unknown>) => void,
): Promise<Response> {
  const w = await ownWatch(db, id, watchId);
  if (!w) return json({ error: 'not_found' }, 404);
  const body = await readBody(request);
  if (!body) return json({ error: 'bad_request' }, 400);

  const stmts: D1PreparedStatement[] = [];
  if (body.mode !== undefined) {
    if (!MODES.includes(body.mode)) return json({ error: 'bad_mode' }, 422);
    w.mode = body.mode;
    stmts.push(db.prepare('UPDATE watches SET mode = ? WHERE id = ?').bind(w.mode, w.id));
  }

  let verificationSent: boolean | undefined;
  if (body.email !== undefined) {
    const email = body.email === null ? '' : typeof body.email === 'string' ? body.email.trim() : null;
    if (email === null) return json({ error: 'bad_email' }, 422);
    if (email === '') {
      w.email = null;
      w.email_verified = 0;
      stmts.push(db.prepare('UPDATE watches SET email = NULL, email_verified = 0 WHERE id = ?').bind(w.id));
      stmts.push(db.prepare('DELETE FROM email_tokens WHERE watch_id = ?').bind(w.id));
    } else if (email.toLowerCase() !== (w.email || '').toLowerCase()) {
      if (!EMAIL_RE.test(email)) return json({ error: 'bad_email' }, 422);
      // The same address already confirmed on another watch of this license: no second opt-in.
      const proven = await db
        .prepare('SELECT 1 AS x FROM watches WHERE key_hash = ? AND email_verified = 1 AND lower(email) = lower(?) LIMIT 1')
        .bind(id.keyHash, email)
        .first();
      w.email = email;
      w.email_verified = proven ? 1 : 0;
      stmts.push(db.prepare('UPDATE watches SET email = ?, email_verified = ? WHERE id = ?').bind(email, w.email_verified, w.id));
      stmts.push(db.prepare('DELETE FROM email_tokens WHERE watch_id = ?').bind(w.id));
      if (!proven) {
        const token = randomToken();
        stmts.push(
          db
            .prepare('INSERT INTO email_tokens (token, watch_id, email, expires_at) VALUES (?, ?, ?, ?)')
            .bind(token, w.id, email, new Date(Date.now() + VERIFY_HOURS * 3600 * 1000).toISOString()),
        );
        const sender = emailSender(env);
        if (sender) {
          const send = sender
            .send({ to: email, ...verificationEmail(publicOrigin(env), w.handle, token) })
            .then(r => console.log(JSON.stringify({ watch: 'verify_mail', ok: r.ok, error: r.error })));
          if (waitUntil) waitUntil(send);
          else await send;
          verificationSent = true;
        } else {
          console.log(JSON.stringify({ watch: 'verify_mail', skipped: 'RESEND_API_KEY unset' }));
          verificationSent = false;
        }
      }
    }
  }
  if (stmts.length) await db.batch(stmts);
  const view = watchView(origin, w, await recentEvents(db, w.handle, w.mode, RECENT_EVENTS));
  return json(verificationSent === undefined ? view : { ...view, verificationSent });
}

async function remove(db: D1Database, id: WatchIdentity, watchId: string): Promise<Response> {
  const w = await ownWatch(db, id, watchId);
  if (!w) return json({ error: 'not_found' }, 404);
  const stmts = [
    db.prepare('DELETE FROM notifications WHERE watch_id = ?').bind(w.id),
    db.prepare('DELETE FROM email_tokens WHERE watch_id = ?').bind(w.id),
    db.prepare('DELETE FROM watches WHERE id = ?').bind(w.id),
    // Nobody else watches the handle: its stored posts and events go now, not in 90 days.
    db.prepare('DELETE FROM snapshots WHERE handle = ? AND NOT EXISTS (SELECT 1 FROM watches WHERE handle = ?)').bind(w.handle, w.handle),
    db.prepare('DELETE FROM events WHERE handle = ? AND NOT EXISTS (SELECT 1 FROM watches WHERE handle = ?)').bind(w.handle, w.handle),
  ];
  await db.batch(stmts);
  console.log(JSON.stringify({ watch: 'delete', handle: w.handle }));
  return json({ ok: true });
}

async function verify(request: Request, db: D1Database, token: string): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405);
  const redirect = (result: string) => new Response(null, { status: 302, headers: { Location: `/pro?watch=${result}`, 'Cache-Control': 'no-store' } });
  if (!TOKEN_RE.test(token)) return redirect('verify_failed');
  const t = await db.prepare('SELECT * FROM email_tokens WHERE token = ?').bind(token).first<{ token: string; watch_id: string; email: string; expires_at: string }>();
  if (!t || t.expires_at < nowIso()) return redirect('verify_failed');
  const w = await db.prepare('SELECT * FROM watches WHERE id = ?').bind(t.watch_id).first<WatchRow>();
  const stmts = [db.prepare('DELETE FROM email_tokens WHERE token = ?').bind(token)];
  if (!w || (w.email || '').toLowerCase() !== t.email.toLowerCase()) {
    await db.batch(stmts);
    return redirect('verify_failed');
  }
  // Confirm every watch of the license that uses this address.
  stmts.push(db.prepare('UPDATE watches SET email_verified = 1 WHERE key_hash = ? AND lower(email) = lower(?)').bind(w.key_hash, t.email));
  await db.batch(stmts);
  console.log(JSON.stringify({ watch: 'verified', handle: w.handle }));
  return redirect('verified');
}

async function unsubscribe(request: Request, db: D1Database, token: string): Promise<Response> {
  if (!TOKEN_RE.test(token)) return json({ error: 'not_found' }, 404);
  if (request.method === 'GET') {
    const html =
      '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Stop Watch e-mails</title>' +
      '<body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem">' +
      '<h1 style="font-size:1.25rem">Stop Xtracticle Watch e-mails?</h1>' +
      '<p>Your watches stay in place; only the e-mail digests stop. You can add an address again on the Pro page.</p>' +
      `<form method="post" action="/api/watch/unsubscribe/${token}"><button type="submit" style="padding:.6rem 1rem;font-size:1rem">Stop e-mails</button></form></body>`;
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  const w = await db.prepare('SELECT * FROM watches WHERE unsub_token = ?').bind(token).first<WatchRow>();
  if (!w) return json({ error: 'not_found' }, 404);
  if (w.email) {
    await db.batch([
      db.prepare('UPDATE watches SET email = NULL, email_verified = 0 WHERE key_hash = ? AND lower(email) = lower(?)').bind(w.key_hash, w.email),
      db.prepare('DELETE FROM email_tokens WHERE watch_id IN (SELECT id FROM watches WHERE key_hash = ?)').bind(w.key_hash),
    ]);
  }
  console.log(JSON.stringify({ watch: 'unsubscribe', handle: w.handle }));
  const wantsHtml = (request.headers.get('Accept') || '').includes('text/html');
  if (wantsHtml) {
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Done</title><body style="font-family:system-ui;max-width:32rem;margin:4rem auto;padding:0 1rem"><p>Done. You will not receive Watch e-mails any more.</p></body>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
    );
  }
  return json({ ok: true });
}

async function feed(request: Request, db: D1Database, origin: string, token: string, format: 'xml' | 'json'): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method_not_allowed' }, 405);
  if (!TOKEN_RE.test(token)) return json({ error: 'not_found' }, 404);
  const w = await db.prepare('SELECT * FROM watches WHERE feed_token = ?').bind(token).first<WatchRow>();
  if (!w) return json({ error: 'not_found' }, 404);
  const events = (await recentEvents(db, w.handle, w.mode, FEED_EVENTS)).map(toFeedEvent);
  const feedUrl = `${origin}/api/watch/feed/${token}.${format}`;
  const body = format === 'xml' ? rssFeed(origin, w.handle, feedUrl, events) : jsonFeed(origin, w.handle, feedUrl, events);
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: {
      'Content-Type': format === 'xml' ? 'application/rss+xml; charset=utf-8' : 'application/feed+json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

async function eventMd(request: Request, db: D1Database, id: WatchIdentity, eventId: string): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method_not_allowed' }, 405);
  const e = await db.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first<EventRow>();
  if (!e) return json({ error: 'not_found' }, 404);
  const owns = await db.prepare('SELECT 1 AS x FROM watches WHERE key_hash = ? AND handle = ? LIMIT 1').bind(id.keyHash, e.handle).first();
  if (!owns) return json({ error: 'not_found' }, 404);
  const md = eventMarkdown(toFeedEvent(e));
  if (!md) return json({ error: 'no_content' }, 404);
  return new Response(request.method === 'HEAD' ? null : md.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `inline; filename="${md.filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}

/** Exported for the cron: the blocklist step shared with the owner's SQL (docs/watch-api.md). */
export { blocklistStatements };
