import type { D1Database } from '@cloudflare/workers-types';
import { blocklistStatements, isoAgo, marks, nowIso, typesForMode, RETENTION_DAYS, type EventRow, type WatchEnv, type WatchRow } from './db';
import { digestEmail, emailSender, publicOrigin, type DigestItem } from './email';
import { eventTitle, toFeedEvent } from './feed';
import { excerpt, postUrl } from './db';
import { anyWantsNew, insertEvent, lookupProfile, pollHandle } from './poll';
import { fxBase } from '../fx';

/**
 * The Watch cron (every 5 minutes, wrangler.json `triggers.crons`):
 *   1. blocklist enforcement and retention pruning (cheap, bounded statements);
 *   2. up to WATCH_BATCH handles whose watches were polled more than 55 minutes ago, oldest first;
 *   3. once a day from 07:00 UTC, the e-mail digest for every verified address.
 * Every step is idempotent: a run cut short by the CPU limit is simply resumed by the next one.
 */

const POLL_AFTER_MS = 55 * 60 * 1000;
const DEFAULT_BATCH = 5;
const MAX_BATCH = 50;
const PRUNE_ROWS = 500;
const DIGEST_HOUR_UTC = 7;
/** Events older than this are not mailed (the feed still has them). */
const DIGEST_WINDOW_MS = 7 * 24 * 3600 * 1000;
const GONE_AFTER_FAILS = 3;

export async function runWatchCron(env: WatchEnv, scheduledTime = Date.now()): Promise<void> {
  const db = env.WATCH_DB;
  if (!db) {
    console.log(JSON.stringify({ watch: 'cron', skipped: 'WATCH_DB unbound' }));
    return;
  }
  const started = Date.now();
  try {
    await housekeeping(db);
    const polled = await pollBatch(db, env);
    const digest = await dailyDigest(db, env, scheduledTime);
    console.log(JSON.stringify({ watch: 'cron', polled, digest, ms: Date.now() - started }));
  } catch (err) {
    // Logged here because a thrown scheduled handler only shows "exception" in the dashboard.
    console.log(JSON.stringify({ watch: 'cron', error: err instanceof Error ? `${err.message}\n${err.stack}` : String(err), ms: Date.now() - started }));
    throw err;
  }
}

/* ─── 1. Blocklist + retention ─── */

async function housekeeping(db: D1Database): Promise<void> {
  const cutoff = isoAgo(RETENTION_DAYS * 24 * 3600 * 1000);
  await db.batch([
    ...blocklistStatements(db),
    db.prepare(`DELETE FROM snapshots WHERE rowid IN (SELECT rowid FROM snapshots WHERE last_seen_at < ? LIMIT ${PRUNE_ROWS})`).bind(cutoff),
    db.prepare(`DELETE FROM events WHERE rowid IN (SELECT rowid FROM events WHERE detected_at < ? LIMIT ${PRUNE_ROWS})`).bind(cutoff),
    db.prepare(`DELETE FROM notifications WHERE rowid IN (SELECT rowid FROM notifications WHERE sent_at < ? LIMIT ${PRUNE_ROWS})`).bind(cutoff),
    db.prepare('DELETE FROM email_tokens WHERE expires_at < ?').bind(nowIso()),
  ]);
}

/* ─── 2. Polling ─── */

interface Due {
  handle: string;
  fail_count: number;
}

async function pollBatch(db: D1Database, env: WatchEnv): Promise<Record<string, string>> {
  const batch = Math.min(MAX_BATCH, Math.max(1, parseInt(env.WATCH_BATCH || '', 10) || DEFAULT_BATCH));
  const due = (
    await db
      .prepare(
        `SELECT handle, MAX(fail_count) AS fail_count FROM watches
         WHERE status = 'active' AND (last_polled_at IS NULL OR last_polled_at < ?)
           AND handle NOT IN (SELECT handle FROM blocklist)
         GROUP BY handle ORDER BY MIN(COALESCE(last_polled_at, '')) LIMIT ?`,
      )
      .bind(isoAgo(POLL_AFTER_MS), batch)
      .all<Due>()
  ).results;

  const outcome: Record<string, string> = {};
  for (const d of due) {
    const now = nowIso();
    // Claim first: a run killed mid-poll must not make the next run start over on the same handle.
    await db.prepare("UPDATE watches SET last_polled_at = ? WHERE handle = ? AND status = 'active'").bind(now, d.handle).run();
    let r;
    try {
      r = await pollHandle(db, env, d.handle, await anyWantsNew(db, d.handle));
    } catch (err) {
      console.log(JSON.stringify({ watch: 'poll', handle: d.handle, error: err instanceof Error ? err.message : String(err) }));
      r = { result: 'error' as const };
    }
    outcome[d.handle] = r.result;
    if (r.result === 'ok') {
      await db.prepare("UPDATE watches SET fail_count = 0 WHERE handle = ? AND status = 'active'").bind(d.handle).run();
    } else if (r.result === 'protected') {
      await markStatus(db, d.handle, 'protected', now);
    } else if (r.result === 'not_found') {
      // Tell "gone" from "protected" from a flaky 404 with one profile lookup.
      const p = await lookupProfile(fxBase(env), d.handle);
      if (p.status === 'ok' && p.protected) {
        await markStatus(db, d.handle, 'protected', now);
        outcome[d.handle] = 'protected';
      } else if (p.status === 'not_found' && d.fail_count + 1 >= GONE_AFTER_FAILS) {
        await markStatus(db, d.handle, 'gone', now);
        outcome[d.handle] = 'gone';
      } else {
        await db.prepare("UPDATE watches SET fail_count = fail_count + 1 WHERE handle = ? AND status = 'active'").bind(d.handle).run();
      }
    } else {
      await db.prepare("UPDATE watches SET fail_count = fail_count + 1 WHERE handle = ? AND status = 'active'").bind(d.handle).run();
    }
    console.log(JSON.stringify({ watch: 'poll', handle: d.handle, ...r }));
  }
  return outcome;
}

/** Pauses every active watch on the handle with the given status and records one status event (only if something changed). */
async function markStatus(db: D1Database, handle: string, status: 'protected' | 'gone', now: string): Promise<void> {
  const res = await db.prepare("UPDATE watches SET status = ? WHERE handle = ? AND status = 'active'").bind(status, handle).run();
  if (res.meta.changes > 0) await insertEvent(db, handle, status, null, { handle }, now).run();
}

/* ─── 3. Daily digest ─── */

async function dailyDigest(db: D1Database, env: WatchEnv, scheduledTime: number): Promise<string> {
  const at = new Date(scheduledTime);
  if (at.getUTCHours() < DIGEST_HOUR_UTC) return 'not_yet';
  const today = at.toISOString().slice(0, 10);
  const last = await db.prepare("SELECT value FROM meta WHERE key = 'digest_date'").first<{ value: string }>();
  if (last?.value === today) return 'done';

  const watches = (await db.prepare("SELECT * FROM watches WHERE email IS NOT NULL AND email_verified = 1 ORDER BY key_hash, created_at").all<WatchRow>()).results;
  if (!watches.length) return 'no_recipients';
  const origin = publicOrigin(env);
  const since = isoAgo(DIGEST_WINDOW_MS);

  // One message per (license, address), covering all of its watches.
  const groups = new Map<string, { email: string; unsub: string; items: DigestItem[]; sent: { watchId: string; eventId: string }[] }>();
  for (const w of watches) {
    const types = typesForMode(w.mode);
    const events = (
      await db
        .prepare(
          `SELECT e.* FROM events e WHERE e.handle = ? AND e.type IN (${marks(types.length)}) AND e.detected_at > ?
             AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.watch_id = ? AND n.event_id = e.id AND n.channel = 'email')
           ORDER BY e.detected_at`,
        )
        .bind(w.handle, ...types, since, w.id)
        .all<EventRow>()
    ).results;
    if (!events.length) continue;
    const gk = `${w.key_hash}\n${w.email!.toLowerCase()}`;
    let g = groups.get(gk);
    if (!g) groups.set(gk, (g = { email: w.email!, unsub: w.unsub_token, items: [], sent: [] }));
    for (const row of events) {
      const e = toFeedEvent(row);
      g.items.push({
        handle: e.handle,
        type: e.type,
        title: eventTitle(e),
        text: e.payload.text ? excerpt(e.payload.text, 280) : '',
        url: e.postId ? postUrl(e.handle, e.postId) : undefined,
        wayback: e.payload.wayback,
        markdownUrl: e.postId ? `${origin}/api/watch/event/${e.id}.md` : undefined,
        detectedAt: e.detectedAt,
      });
      g.sent.push({ watchId: w.id, eventId: e.id });
    }
  }
  // Nothing to send: leave the day unclaimed, so an event detected later today still goes out today.
  if (!groups.size) return 'nothing_new';

  // Claim the day atomically right before sending: an interrupted run never mails twice, and a
  // run that finds the day already claimed (by a concurrent one) stops here.
  const claim = await db
    .prepare("INSERT INTO meta (key, value) VALUES ('digest_date', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value WHERE meta.value <> excluded.value")
    .bind(today)
    .run();
  if (!claim.meta.changes) return 'done';

  const sender = emailSender(env);
  if (!sender) {
    const events = [...groups.values()].reduce((n, g) => n + g.items.length, 0);
    console.log(JSON.stringify({ watch: 'digest', skipped: 'no e-mail sender configured', recipients: groups.size, events }));
    return `skipped:${groups.size}`;
  }
  let sent = 0;
  let failed = 0;
  for (const g of groups.values()) {
    const r = await sender.send({ to: g.email, ...digestEmail(origin, g.items, g.unsub) });
    if (!r.ok) {
      failed++;
      console.log(JSON.stringify({ watch: 'digest', ok: false, error: r.error }));
      continue;
    }
    sent++;
    const now = nowIso();
    const stmts = g.sent.map(s => db.prepare("INSERT OR IGNORE INTO notifications (watch_id, event_id, channel, sent_at) VALUES (?, ?, 'email', ?)").bind(s.watchId, s.eventId, now));
    for (let i = 0; i < stmts.length; i += 50) await db.batch(stmts.slice(i, i + 50));
  }
  console.log(JSON.stringify({ watch: 'digest', sent, failed }));
  return `sent:${sent}`;
}
