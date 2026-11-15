/**
 * IndexedDB `xtracticle` v1 (docs/chrome-extension-plan.md, B6). Only the service worker opens it.
 *
 *   posts      key id               { id, tweet: FxTweet, thread?, source, capturedAt, updatedAt }   index capturedAt
 *   bookmarks  key [accountId, id]  BookmarkRow (bg/records.ts)   indexes state, lastSeenAt, id, accountState [accountId, state]
 *   meta       key key              { key, value }   lastSyncAt, lastAccountId
 *
 * The merge rules live in bg/records.ts (pure, unit-tested); this file only reads and writes.
 * The connection is reopened whenever the SW wakes up; nothing else is cached in memory.
 */
import type { SavedFilter, SavedState, SavedSummary } from '../../../src/shared/bridge';
import { XT_VERSION } from '../config';
import type { ArchiveExport, CapturePayload, SavedPage, SavedStatus, StoredPost } from '../messages';
import { PAGE_SIZE, buildExport, fullScanKey, markGone, markRemoved, mergeBookmark, mergePost, pageOf, summarize, type BookmarkRow } from './records';

export const DB_NAME = 'xtracticle';
export const DB_VERSION = 1;

let opening: Promise<IDBDatabase> | null = null;

export function openDb(): Promise<IDBDatabase> {
  if (opening) return opening;
  opening = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('posts')) {
        const posts = db.createObjectStore('posts', { keyPath: 'id' });
        posts.createIndex('capturedAt', 'capturedAt');
      }
      if (!db.objectStoreNames.contains('bookmarks')) {
        const b = db.createObjectStore('bookmarks', { keyPath: ['accountId', 'id'] });
        b.createIndex('state', 'state');
        b.createIndex('lastSeenAt', 'lastSeenAt');
        b.createIndex('id', 'id');
        b.createIndex('accountState', ['accountId', 'state']);
      }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => {
        db.close();
        opening = null;
      };
      db.onclose = () => (opening = null);
      resolve(db);
    };
    req.onerror = () => {
      opening = null;
      reject(req.error);
    };
  });
  return opening;
}

const done = <T>(r: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });

const finished = (tx: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
  });

async function metaGet(tx: IDBTransaction, key: string): Promise<unknown> {
  const row = (await done(tx.objectStore('meta').get(key))) as { value?: unknown } | undefined;
  return row?.value ?? null;
}

/**
 * Writes one capture in one transaction. Returns how many posts and bookmark rows were written, and how many
 * of the timeline entries had no bookmark row before (`fresh`; the bookmarks panel's incremental stop rule).
 */
export async function applyCapture(c: CapturePayload, now = new Date().toISOString()): Promise<{ stored: number; bookmarks: number; fresh: number }> {
  const db = await openDb();
  const tx = db.transaction(['posts', 'bookmarks', 'meta'], 'readwrite');
  const end = finished(tx);
  const posts = tx.objectStore('posts');
  const bms = tx.objectStore('bookmarks');
  let stored = 0;
  let rows = 0;
  let fresh = 0;
  for (const t of c.tweets) {
    const prev = (await done(posts.get(t.id))) as StoredPost | undefined;
    posts.put(mergePost(prev, t, c.source, now));
    stored++;
  }
  if (c.accountId) {
    const acc = c.accountId;
    const known = new Set(c.tweets.map(t => t.id));
    for (const e of c.entries || []) {
      // A bookmark row needs a stored copy; ids without one (not in this capture, not stored before) are skipped.
      if (!known.has(e.id) && !(await done(posts.getKey(e.id)))) continue;
      const prev = (await done(bms.get([acc, e.id]))) as BookmarkRow | undefined;
      if (!prev) fresh++;
      bms.put(mergeBookmark(prev, acc, e, now));
      rows++;
    }
    for (const id of c.removed || []) {
      const prev = (await done(bms.get([acc, id]))) as BookmarkRow | undefined;
      if (prev) {
        bms.put(markRemoved(prev, now));
        rows++;
      }
    }
    for (const g of c.gone || []) {
      const prev = (await done(bms.get([acc, g.id]))) as BookmarkRow | undefined;
      if (prev) {
        bms.put(markGone(prev, now));
        rows++;
      }
    }
    const meta = tx.objectStore('meta');
    meta.put({ key: 'lastAccountId', value: acc });
    if (c.entries?.length) meta.put({ key: 'lastSyncAt', value: now });
  }
  await end;
  return { stored, bookmarks: rows, fresh };
}

async function resolveAccount(tx: IDBTransaction, accountId?: string): Promise<string | null> {
  if (accountId) return accountId;
  const v = await metaGet(tx, 'lastAccountId');
  return typeof v === 'string' ? v : null;
}

const REMOVED_STATES: SavedState[] = ['missing', 'unavailable'];

/** One /saved page: 'all' = every stored post, newest capture first; 'removed' = bookmarks no longer available. */
export async function listSaved(cursor = 0, filter: SavedFilter = 'all', accountId?: string): Promise<SavedPage> {
  const db = await openDb();
  const tx = db.transaction(['posts', 'bookmarks', 'meta'], 'readonly');
  const posts = tx.objectStore('posts');
  const bms = tx.objectStore('bookmarks');
  const acc = await resolveAccount(tx, accountId);
  const start = Math.max(0, Math.floor(cursor) || 0);

  if (filter === 'removed') {
    if (!acc) return { items: [], next: null, total: 0 };
    const rows: BookmarkRow[] = [];
    for (const s of REMOVED_STATES) rows.push(...((await done(bms.index('accountState').getAll([acc, s]))) as BookmarkRow[]));
    rows.sort((a, b) => cmpSort(b.sortIndex, a.sortIndex));
    const page = pageOf(rows, start);
    const items: SavedSummary[] = [];
    for (const r of page.items) {
      const p = (await done(posts.get(r.id))) as StoredPost | undefined;
      if (p) items.push(summarize(p, r.state));
    }
    return { items, next: page.next, total: page.total };
  }

  const total = await done(posts.count());
  const items: StoredPost[] = [];
  await new Promise<void>((resolve, reject) => {
    let skipped = start === 0;
    const req = posts.index('capturedAt').openCursor(null, 'prev');
    const pending: StoredPost[] = [];
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const cur = req.result;
      if (!cur) return resolve(void finish());
      if (!skipped) {
        skipped = true;
        cur.advance(start);
        return;
      }
      pending.push(cur.value as StoredPost);
      if (pending.length >= PAGE_SIZE) return resolve(void finish());
      cur.continue();
    };
    function finish() {
      items.push(...pending);
    }
  });
  const out: SavedSummary[] = [];
  for (const p of items) {
    const row = acc ? ((await done(bms.get([acc, p.id]))) as BookmarkRow | undefined) : undefined;
    out.push(summarize(p, row?.state ?? 'active'));
  }
  const end = start + out.length;
  return { items: out, next: end < total ? end : null, total };
}

function cmpSort(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a.length !== b.length ? a.length - b.length : a < b ? -1 : 1;
}

export async function getSaved(id: string): Promise<StoredPost | null> {
  const db = await openDb();
  return ((await done(db.transaction('posts', 'readonly').objectStore('posts').get(id))) as StoredPost | undefined) ?? null;
}

/** Which of `ids` have a stored copy (the Save menu's "Open saved copy"). */
export async function hasSaved(ids: string[]): Promise<string[]> {
  const db = await openDb();
  const posts = db.transaction('posts', 'readonly').objectStore('posts');
  const out: string[] = [];
  for (const id of ids) if (await done(posts.getKey(id))) out.push(id);
  return out;
}

/** Deletes the posts and every account's bookmark rows for them. */
export async function deleteSaved(ids: string[]): Promise<number> {
  const db = await openDb();
  const tx = db.transaction(['posts', 'bookmarks'], 'readwrite');
  const end = finished(tx);
  const posts = tx.objectStore('posts');
  const bms = tx.objectStore('bookmarks');
  let n = 0;
  for (const id of ids) {
    if (await done(posts.getKey(id))) n++;
    posts.delete(id);
    const keys = await done(bms.index('id').getAllKeys(id));
    for (const k of keys) bms.delete(k);
  }
  await end;
  return n;
}

export async function fullScanGet(accountId: string): Promise<string | null> {
  const db = await openDb();
  const v = await metaGet(db.transaction(['meta'], 'readonly'), fullScanKey(accountId));
  return typeof v === 'string' ? v : null;
}

export async function fullScanSet(accountId: string, now = new Date().toISOString()): Promise<string> {
  const db = await openDb();
  const tx = db.transaction(['meta'], 'readwrite');
  const end = finished(tx);
  tx.objectStore('meta').put({ key: fullScanKey(accountId), value: now });
  await end;
  return now;
}

/** Everything, including the `fullScan:<account>` meta rows (the whole meta store is cleared). */
export async function clearAll(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(['posts', 'bookmarks', 'meta'], 'readwrite');
  const end = finished(tx);
  tx.objectStore('posts').clear();
  tx.objectStore('bookmarks').clear();
  tx.objectStore('meta').clear();
  await end;
}

export async function savedStatus(archive: boolean, accountId?: string): Promise<SavedStatus> {
  const db = await openDb();
  const tx = db.transaction(['posts', 'bookmarks', 'meta'], 'readonly');
  const bms = tx.objectStore('bookmarks');
  const acc = await resolveAccount(tx, accountId);
  const posts = await done(tx.objectStore('posts').count());
  const count = (s: SavedState) => (acc ? done(bms.index('accountState').count([acc, s])) : Promise.resolve(0));
  const bookmarks = await count('active');
  const unavailable = (await count('missing')) + (await count('unavailable'));
  const last = await metaGet(tx, 'lastSyncAt');
  return { posts, bookmarks, unavailable, lastSyncAt: typeof last === 'string' ? last : null, archive };
}

export async function exportAll(now = new Date().toISOString()): Promise<ArchiveExport> {
  const db = await openDb();
  const tx = db.transaction(['posts', 'bookmarks'], 'readonly');
  const posts = (await done(tx.objectStore('posts').getAll())) as StoredPost[];
  const bookmarks = (await done(tx.objectStore('bookmarks').getAll())) as BookmarkRow[];
  return buildExport(posts, bookmarks, now, XT_VERSION);
}
