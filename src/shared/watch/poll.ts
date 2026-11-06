import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
import { fxBase } from '../fx';
import { fetchOwnTimeline, isoDate, type OwnPost, type RawStatus } from '../profile';
import { compareIdsDesc, snowflakeDate, waybackSnapshot } from '../url';
import {
  marks,
  newId,
  nowIso,
  type EventType,
  type PostPayload,
  type SnapshotRow,
  type StoredMedia,
  type WatchEnv,
  type WatchMode,
} from './db';

/**
 * One poll of one handle: fetch the latest own posts, compare with the stored snapshot, confirm
 * deletions one by one, write snapshots and events. Pure functions are exported for tests.
 *
 * Detection rule — a snapshot post counts as a deletion candidate only when it is missing from
 * the fetch AND newer than the oldest post the fetch still contains (it should have been inside
 * the window); every candidate is confirmed with a single-status lookup, and a post that is only
 * older than the window is dropped from the snapshot without an event. A fetched post is "new"
 * only when its ID is newer than every post already known for the handle (a post that merely
 * re-enters the window, or a thread reply whose root fell off, is stored silently).
 */

export const WINDOW_POSTS = 40;
export const WINDOW_PAGES = 2;
/** Deletion confirmations per handle per run. */
export const MAX_CONFIRMATIONS = 10;
const STATUS_TIMEOUT_MS = 8_000;
const PROFILE_TIMEOUT_MS = 8_000;
const CDX_TIMEOUT_MS = 4_000;
const USER_AGENT = 'Xtracticle/3.0 (+https://xtracticle.com; watch)';

/* ─── Shapes ─── */

export interface FetchedPost {
  id: string;
  parentId: string | null;
  text: string;
  createdAt: string | null;
  media: StoredMedia | null;
  authorName: string | null;
}

export function toFetched(p: OwnPost): FetchedPost {
  const r = p.raw;
  return {
    id: p.id,
    parentId: p.parent,
    text: typeof r.text === 'string' ? r.text : '',
    createdAt: isoDate(r) || null,
    media: storedMedia(r),
    authorName: typeof r.author?.name === 'string' ? r.author.name : null,
  };
}

function storedMedia(r: RawStatus): StoredMedia | null {
  const m = r.media;
  if (!m || typeof m !== 'object') return null;
  const out: StoredMedia = {};
  if (Array.isArray(m.photos)) {
    const photos = m.photos
      .filter((p: any) => p && typeof p.url === 'string')
      .map((p: any) => ({ url: p.url as string, ...(typeof p.altText === 'string' && p.altText ? { altText: p.altText as string } : {}) }));
    if (photos.length) out.photos = photos;
  }
  if (Array.isArray(m.videos)) {
    const videos = m.videos
      .filter((v: any) => v && typeof v.url === 'string')
      .map((v: any) => ({ url: v.url as string, ...(typeof v.thumbnail_url === 'string' ? { thumbnail_url: v.thumbnail_url as string } : {}) }));
    if (videos.length) out.videos = videos;
  }
  return out.photos || out.videos ? out : null;
}

export interface Known {
  post_id: string;
  parent_id: string | null;
}

export interface Diff {
  /** Fetched posts not stored yet (all are inserted). */
  unseen: FetchedPost[];
  /** Subset of `unseen` that gets a `new` event: thread roots newer than everything known. */
  fresh: FetchedPost[];
  /** Known IDs missing from the fetch that should have been inside the window, newest first. */
  candidates: string[];
  /** Fetched IDs that were already known (last_seen_at refresh). */
  seen: string[];
}

/** The comparison at the heart of the poller. `known` may be empty (first poll → everything unseen, nothing fresh). */
export function diff(known: Known[], fetched: FetchedPost[]): Diff {
  const knownIds = new Set(known.map(k => k.post_id));
  const fetchedIds = new Set(fetched.map(f => f.id));
  let maxKnown: string | null = null;
  for (const k of known) if (!maxKnown || compareIdsDesc(k.post_id, maxKnown) < 0) maxKnown = k.post_id;
  let minPresent: string | null = null;
  for (const f of fetched) if (!minPresent || compareIdsDesc(f.id, minPresent) > 0) minPresent = f.id;

  const unseen = fetched.filter(f => !knownIds.has(f.id));
  const fresh = maxKnown ? unseen.filter(f => !f.parentId && compareIdsDesc(f.id, maxKnown!) < 0) : [];
  const seen = fetched.filter(f => knownIds.has(f.id)).map(f => f.id);
  const candidates = minPresent
    ? known
        .map(k => k.post_id)
        .filter(id => !fetchedIds.has(id) && compareIdsDesc(id, minPresent!) < 0)
        .sort(compareIdsDesc)
    : [];
  return { unseen, fresh, candidates, seen };
}

/* ─── FxTwitter lookups ─── */

export type StatusVerdict = 'exists' | 'deleted' | 'protected' | 'unknown';

async function statusOnce(base: string, id: string): Promise<StatusVerdict> {
  try {
    const res = await fetch(`${base}/2/status/${id}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });
    if (res.status === 404) {
      res.body?.cancel().catch(() => {});
      return 'deleted';
    }
    if (res.status === 401) {
      res.body?.cancel().catch(() => {});
      return 'protected';
    }
    if (!res.ok) {
      res.body?.cancel().catch(() => {});
      return 'unknown';
    }
    const data: any = await res.json();
    if (data?.code === 404) return 'deleted';
    if (data?.code === 401) return 'protected';
    return data?.code === 200 && data.status ? 'exists' : 'unknown';
  } catch {
    return 'unknown';
  }
}

/** One confirmation lookup; a 404 is asked a second time, since FxTwitter sometimes answers 404 for posts that exist. */
export async function confirmStatus(base: string, id: string): Promise<StatusVerdict> {
  const first = await statusOnce(base, id);
  if (first !== 'deleted') return first;
  const second = await statusOnce(base, id);
  return second === 'unknown' ? 'deleted' : second;
}

export type ProfileVerdict = { status: 'ok'; protected: boolean; screenName: string } | { status: 'not_found' } | { status: 'error' };

/** `/2/profile/:handle` — exists? protected? Used on create and to tell "gone" from "protected" after a timeline 404. */
export async function lookupProfile(base: string, handle: string): Promise<ProfileVerdict> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${base}/2/profile/${encodeURIComponent(handle)}`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(PROFILE_TIMEOUT_MS),
      });
      if (res.status === 404) {
        res.body?.cancel().catch(() => {});
        if (attempt === 0) continue; // the flaky-404 retry
        return { status: 'not_found' };
      }
      if (!res.ok) {
        res.body?.cancel().catch(() => {});
        continue;
      }
      const data: any = await res.json();
      if (data?.code === 404) {
        if (attempt === 0) continue;
        return { status: 'not_found' };
      }
      const u = data?.user;
      if (data?.code !== 200 || !u || typeof u !== 'object') continue;
      return { status: 'ok', protected: u.protected === true, screenName: typeof u.screen_name === 'string' ? u.screen_name : handle };
    } catch {
      /* retry once */
    }
  }
  return { status: 'error' };
}

/** An existing Wayback Machine capture of the post, if any (best effort, short timeout). */
export async function waybackCopy(env: WatchEnv, handle: string, id: string): Promise<string | undefined> {
  const base = (env.CDX_BASE_URL || 'https://web.archive.org').replace(/\/+$/, '');
  const date = snowflakeDate(id);
  const host = date && date >= new Date('2024-05-17') ? 'x.com' : 'twitter.com';
  const original = `${host}/${handle}/status/${id}`;
  const url = `${base}/cdx/search/cdx?url=${encodeURIComponent(original)}&output=json&fl=timestamp,original&filter=statuscode:200&limit=1`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(CDX_TIMEOUT_MS) });
    if (!res.ok) {
      res.body?.cancel().catch(() => {});
      return undefined;
    }
    const text = await res.text();
    const rows = text.trim() ? JSON.parse(text) : [];
    const row = Array.isArray(rows) ? rows[1] : null;
    if (!Array.isArray(row) || typeof row[0] !== 'string' || typeof row[1] !== 'string') return undefined;
    return waybackSnapshot(row[0], row[1]);
  } catch {
    return undefined;
  }
}

/* ─── D1 writes ─── */

export function insertSnapshot(db: D1Database, handle: string, p: FetchedPost, now: string): D1PreparedStatement {
  return db
    .prepare(
      'INSERT OR IGNORE INTO snapshots (handle, post_id, text, created_at, media_json, parent_id, author_name, first_seen_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(handle, p.id, p.text, p.createdAt, p.media ? JSON.stringify(p.media) : null, p.parentId, p.authorName, now, now);
}

export function insertEvent(db: D1Database, handle: string, type: EventType, postId: string | null, payload: unknown, now: string): D1PreparedStatement {
  return db
    .prepare('INSERT OR IGNORE INTO events (id, handle, type, post_id, payload_json, detected_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(newId(), handle, type, postId, JSON.stringify(payload), now);
}

export const payloadOf = (p: FetchedPost | SnapshotRow, wayback?: string): PostPayload =>
  'post_id' in p
    ? {
        text: p.text,
        createdAt: p.created_at,
        media: p.media_json ? (JSON.parse(p.media_json) as StoredMedia) : null,
        parentId: p.parent_id,
        authorName: p.author_name,
        ...(wayback ? { wayback } : {}),
      }
    : { text: p.text, createdAt: p.createdAt, media: p.media, parentId: p.parentId, authorName: p.authorName, ...(wayback ? { wayback } : {}) };

/** Fetches the window and stores it as the baseline (no events). Used on create. Returns false when the timeline could not be read. */
export async function seedHandle(db: D1Database, env: WatchEnv, handle: string): Promise<boolean> {
  const t = await fetchOwnTimeline(handle, { maxPosts: WINDOW_POSTS, maxPages: WINDOW_PAGES, base: fxBase(env), foldForCount: false });
  if (t.status !== 'ok') return false;
  const now = nowIso();
  const stmts = t.own.map(p => insertSnapshot(db, handle, toFetched(p), now));
  if (stmts.length) await db.batch(stmts);
  return true;
}

/* ─── The poll ─── */

export interface PollResult {
  result: 'ok' | 'not_found' | 'protected' | 'error';
  seeded?: boolean;
  fresh?: number;
  deleted?: number;
  checked?: number;
  dropped?: number;
}

/**
 * Polls one handle. `wantNew` says whether any watch on the handle wants `new` events.
 * Status changes (protected/gone) are left to the caller, which owns the watches rows.
 */
export async function pollHandle(db: D1Database, env: WatchEnv, handle: string, wantNew: boolean): Promise<PollResult> {
  const base = fxBase(env);
  const t = await fetchOwnTimeline(handle, { maxPosts: WINDOW_POSTS, maxPages: WINDOW_PAGES, base, foldForCount: false });
  if (t.status === 'not_found') return { result: 'not_found' };
  if (t.status === 'error') return { result: 'error' };
  const fetched = t.own.map(toFetched);
  const now = nowIso();

  const known = (await db.prepare('SELECT post_id, parent_id FROM snapshots WHERE handle = ?').bind(handle).all<Known>()).results;
  if (!known.length) {
    // No baseline (first poll, or pruned while unwatched): store the window silently.
    if (fetched.length) await db.batch(fetched.map(p => insertSnapshot(db, handle, p, now)));
    return { result: 'ok', seeded: true };
  }

  const d = diff(known, fetched);
  const stmts: D1PreparedStatement[] = [];
  for (const p of d.unseen) stmts.push(insertSnapshot(db, handle, p, now));
  if (d.seen.length) {
    stmts.push(db.prepare(`UPDATE snapshots SET last_seen_at = ? WHERE handle = ? AND post_id IN (${marks(d.seen.length)})`).bind(now, handle, ...d.seen));
  }
  if (wantNew) for (const p of d.fresh) stmts.push(insertEvent(db, handle, 'new', p.id, payloadOf(p), now));
  if (stmts.length) await db.batch(stmts);

  // Deletion candidates: confirm one by one, newest first, at most MAX_CONFIRMATIONS per run.
  const ids = d.candidates.slice(0, MAX_CONFIRMATIONS);
  let deleted = 0;
  let dropped = 0;
  let protectedNow = false;
  if (ids.length) {
    const rows = (await db.prepare(`SELECT * FROM snapshots WHERE handle = ? AND post_id IN (${marks(ids.length)})`).bind(handle, ...ids).all<SnapshotRow>()).results;
    const byId = new Map(rows.map(r => [r.post_id, r]));
    for (const id of ids) {
      const verdict = await confirmStatus(base, id);
      if (verdict === 'unknown') continue;
      if (verdict === 'protected') {
        protectedNow = true;
        break;
      }
      const row = byId.get(id);
      const when = nowIso();
      if (verdict === 'deleted' && row) {
        const wayback = await waybackCopy(env, handle, id);
        await db.batch([
          insertEvent(db, handle, 'deleted', id, payloadOf(row, wayback), when),
          db.prepare('DELETE FROM snapshots WHERE handle = ? AND post_id = ?').bind(handle, id),
        ]);
        deleted++;
      } else {
        // Still online: it only left the ~40-post window. Stop tracking it (we keep only the window).
        await db.prepare('DELETE FROM snapshots WHERE handle = ? AND post_id = ?').bind(handle, id).run();
        dropped++;
      }
    }
  }
  return { result: protectedNow ? 'protected' : 'ok', fresh: wantNew ? d.fresh.length : 0, deleted, checked: ids.length, dropped };
}

/** Whether any active watch on the handle wants `new` events. */
export async function anyWantsNew(db: D1Database, handle: string): Promise<boolean> {
  const row = await db
    .prepare("SELECT 1 AS x FROM watches WHERE handle = ? AND status = 'active' AND mode IN ('new', 'both') LIMIT 1")
    .bind(handle)
    .first<{ x: number }>();
  return !!row;
}

export const modeWantsNew = (mode: WatchMode) => mode === 'new' || mode === 'both';
