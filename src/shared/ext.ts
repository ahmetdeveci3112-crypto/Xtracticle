import type { D1Database } from '@cloudflare/workers-types';
import { appClient } from './client';
import { COUNTER_EVENTS, isCounterEvent } from './events';

/**
 * POST /api/ext/event — anonymous daily counters for the browser extension and the /saved page
 * (docs/chrome-extension-plan.md, A6). Shared by the Worker and the Vite dev server.
 *
 * Body: one event `{ name, param?, v? }` or a batch `{ v?, events: [{ name, param? }, …] }` (≤ 25).
 *   name   one of COUNTER_EVENTS (src/shared/events.ts); anything else is dropped
 *   param  the value of that event's one kept parameter (e.g. download → format), [a-z0-9_+-]{1,24}
 *   v      the extension version, e.g. "3.0.0"
 * Each accepted event adds 1 to `ext_events(day, surface, name, param, version)`; `surface` comes from
 * `X-Xt-Client` (ext | web), which is required like on the other app endpoints.
 *
 * Nothing else is stored: no IP, no license or account id, no URL, no post id, no exact time.
 * Answers 204 (also when the WATCH_DB binding is missing, so the extension never retries), 400 for
 * a body with no valid event, 403 without the client header.
 * Returns null for any other path so the caller can continue routing.
 */

export interface ExtEnv {
  WATCH_DB?: D1Database;
}

const MAX_BODY = 8192;
const MAX_EVENTS = 25;
const PARAM_RE = /^[a-z0-9_+-]{1,24}$/;
const VERSION_RE = /^\d{1,4}(\.\d{1,5}){0,3}$/;

export interface CounterRow {
  name: string;
  param: string;
  version: string;
}

/** The events in a request body that pass the whitelist; params on events that keep none are cleared. */
export function acceptedEvents(body: unknown): CounterRow[] {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return [];
  const b = body as Record<string, unknown>;
  const version = typeof b.v === 'string' && VERSION_RE.test(b.v) ? b.v : '';
  const list: unknown[] = Array.isArray(b.events) ? b.events.slice(0, MAX_EVENTS) : [b];
  const out: CounterRow[] = [];
  for (const e of list) {
    if (!e || typeof e !== 'object') continue;
    const { name, param } = e as Record<string, unknown>;
    if (!isCounterEvent(name)) continue;
    const keeps = COUNTER_EVENTS[name] !== null;
    const p = keeps && typeof param === 'string' && PARAM_RE.test(param) ? param : '';
    out.push({ name, param: p, version });
  }
  return out;
}

const noContent = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
const error = (code: string, status: number) =>
  new Response(JSON.stringify({ error: code }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export async function handleExt(request: Request, env: ExtEnv): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== '/api/ext/event' && url.pathname !== '/api/ext/event/') return null;
  if (request.method !== 'POST') return error('method_not_allowed', 405);
  const surface = appClient(request);
  if (!surface) return error('forbidden', 403);

  let body: unknown = null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return error('bad_request', 400);
    body = JSON.parse(text);
  } catch {
    return error('bad_request', 400);
  }
  const rows = acceptedEvents(body);
  if (!rows.length) return error('unknown_event', 400);
  if (!env.WATCH_DB) return noContent();

  // Same key twice in one batch → one statement with the summed count.
  const counts = new Map<string, { row: CounterRow; n: number }>();
  for (const row of rows) {
    const k = `${row.name}\n${row.param}\n${row.version}`;
    const c = counts.get(k);
    if (c) c.n++;
    else counts.set(k, { row, n: 1 });
  }
  const day = new Date().toISOString().slice(0, 10);
  const db = env.WATCH_DB;
  const sql =
    'INSERT INTO ext_events (day, surface, name, param, version, n) VALUES (?, ?, ?, ?, ?, ?) ' +
    'ON CONFLICT (day, surface, name, param, version) DO UPDATE SET n = n + excluded.n';
  try {
    await db.batch([...counts.values()].map(({ row, n }) => db.prepare(sql).bind(day, surface, row.name, row.param, row.version, n)));
  } catch (err) {
    // A counter must never break the caller; the table may not exist yet before the migration runs.
    console.log(JSON.stringify({ ext: 'event', ok: false, error: String(err).slice(0, 200) }));
  }
  return noContent();
}
