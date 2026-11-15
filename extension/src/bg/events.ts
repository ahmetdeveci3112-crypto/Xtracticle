/**
 * Anonymous counters (docs/chrome-extension-plan.md, A6): event names from src/shared/events.ts, sent to
 * `POST /api/ext/event` (X-Xt-Client: ext, src/shared/ext.ts) in batches.
 *
 *   - queue in chrome.storage.local.evq = { events: [{ name, param }], lastFlushAt }
 *   - at most one batch a minute, at most 25 events per batch (the Worker's limit), queue capped at 200
 *   - the first batch goes out no earlier than a minute after install (lastFlushAt starts at install time)
 *   - settings.counter = false drops the queue and sends nothing
 *   - only whitelisted names and short [a-z0-9_+-] params: no URL, handle, post id or account id ever
 *
 * The SW may be stopped between events, so a batch that is not due yet goes out on the next event or wake-up
 * after the minute (a timer covers the case where the SW stays awake).
 */
import { COUNTER_EVENTS, isCounterEvent, type CounterEvent } from '../../../src/shared/events';
import { XT_VERSION } from '../config';
import type { TrackedEvent } from '../messages';
import { siteFetch } from './api';
import { getSettings } from './settings';

export const FLUSH_INTERVAL_MS = 60 * 1000;
export const BATCH_MAX = 25;
export const QUEUE_MAX = 200;
const PARAM_RE = /^[a-z0-9_+-]{1,24}$/;
const KEY = 'evq';

export interface QueuedEvent {
  name: CounterEvent;
  param?: string;
}

export interface EventQueue {
  events: QueuedEvent[];
  /** Last send attempt (ms epoch); 0 = never. */
  lastFlushAt: number;
}

export const emptyQueue = (now = 0): EventQueue => ({ events: [], lastFlushAt: now });

/** A whitelisted event with its one kept parameter, or null. */
export function cleanEvent(e: TrackedEvent | unknown): QueuedEvent | null {
  if (!e || typeof e !== 'object') return null;
  const { name, param } = e as Record<string, unknown>;
  if (!isCounterEvent(name)) return null;
  const keeps = COUNTER_EVENTS[name] !== null;
  return keeps && typeof param === 'string' && PARAM_RE.test(param) ? { name, param } : { name };
}

export function parseQueue(v: unknown): EventQueue {
  if (!v || typeof v !== 'object') return emptyQueue();
  const q = v as Record<string, unknown>;
  const events = Array.isArray(q.events) ? (q.events.map(cleanEvent).filter(Boolean) as QueuedEvent[]).slice(-QUEUE_MAX) : [];
  return { events, lastFlushAt: typeof q.lastFlushAt === 'number' && Number.isFinite(q.lastFlushAt) ? q.lastFlushAt : 0 };
}

/** Adds one event; the oldest are dropped past QUEUE_MAX. */
export function enqueue(q: EventQueue, e: unknown): EventQueue {
  const ev = cleanEvent(e);
  if (!ev) return q;
  return { ...q, events: [...q.events, ev].slice(-QUEUE_MAX) };
}

/** The batch to send now (≤ 25) and the queue that stays, or null when nothing is due. */
export function takeBatch(q: EventQueue, now: number, interval = FLUSH_INTERVAL_MS): { batch: QueuedEvent[]; rest: EventQueue } | null {
  if (!q.events.length) return null;
  const since = now - q.lastFlushAt;
  if (since >= 0 && since < interval) return null;
  return { batch: q.events.slice(0, BATCH_MAX), rest: { events: q.events.slice(BATCH_MAX), lastFlushAt: now } };
}

/** Milliseconds until the queue may be sent (0 = now). */
export const dueIn = (q: EventQueue, now: number, interval = FLUSH_INTERVAL_MS) => {
  const since = now - q.lastFlushAt;
  return since < 0 || since >= interval ? 0 : interval - since;
};

/** The request body (src/shared/ext.ts acceptedEvents). */
export const batchBody = (batch: QueuedEvent[], version: string) => ({ v: version, events: batch.map(e => (e.param ? { name: e.name, param: e.param } : { name: e.name })) });

/* ─── I/O ─── */

async function read(): Promise<EventQueue> {
  return parseQueue((await chrome.storage.local.get(KEY))[KEY]);
}
const write = (q: EventQueue) => chrome.storage.local.set({ [KEY]: q });

let timer: ReturnType<typeof setTimeout> | null = null;
let flushing: Promise<void> | null = null;

/** onInstalled: start the minute so the first batch waits (and a quick test profile never sends). */
export async function startQueue(now = Date.now()): Promise<void> {
  const q = await read();
  await write({ ...q, lastFlushAt: Math.max(q.lastFlushAt, now) });
}

export async function track(e: unknown): Promise<boolean> {
  if (!cleanEvent(e)) return false;
  if (!(await getSettings()).counter) return false;
  await write(enqueue(await read(), e));
  void flush();
  return true;
}

/** Sends one batch when due; otherwise sets a timer for when it is. */
export function flush(): Promise<void> {
  if (flushing) return flushing;
  flushing = (async () => {
    try {
      if (!(await getSettings()).counter) {
        await write(emptyQueue(Date.now()));
        return;
      }
      const q = await read();
      const now = Date.now();
      const take = takeBatch(q, now);
      if (!take) {
        if (q.events.length) schedule(dueIn(q, now));
        return;
      }
      await write(take.rest); // marks the attempt first: two wake-ups never send the same batch
      let ok = false;
      try {
        const res = await siteFetch('/api/ext/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(batchBody(take.batch, XT_VERSION)) });
        ok = res.status < 500; // 204, or 400 for a batch the Worker refused: either way not worth resending
      } catch {
        ok = false;
      }
      if (!ok) {
        const cur = await read();
        await write({ ...cur, events: [...take.batch, ...cur.events].slice(-QUEUE_MAX) });
      }
      if (take.rest.events.length) schedule(FLUSH_INTERVAL_MS);
    } finally {
      flushing = null;
    }
  })();
  return flushing;
}

function schedule(ms: number) {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, Math.max(1000, ms));
}
