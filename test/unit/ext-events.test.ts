import { describe, expect, it } from 'vitest';
import { acceptedEvents, handleExt } from '../../src/shared/ext';
import { COUNTER_EVENTS, countBucket } from '../../src/shared/events';

const post = (body: unknown, client: string | null = 'ext', path = '/api/ext/event') =>
  new Request(`https://xtracticle.com${path}`, {
    method: 'POST',
    headers: client ? { 'X-Xt-Client': client, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

/** Records what the handler sends to D1. */
function fakeDb() {
  const calls: unknown[][] = [];
  const db = {
    prepare: (sql: string) => ({ bind: (...args: unknown[]) => ({ sql, args }) }),
    batch: async (stmts: { sql: string; args: unknown[] }[]) => {
      for (const s of stmts) calls.push(s.args);
      return [];
    },
  };
  return { db: db as any, calls };
}

describe('acceptedEvents (whitelist)', () => {
  it('keeps whitelisted names and their one parameter', () => {
    expect(acceptedEvents({ name: 'download', param: 'pdf', v: '3.0.0' })).toEqual([{ name: 'download', param: 'pdf', version: '3.0.0' }]);
    expect(acceptedEvents({ name: 'ext_install' })).toEqual([{ name: 'ext_install', param: '', version: '' }]);
  });
  it('drops unknown names and prototype keys', () => {
    for (const name of ['pro_activate', 'evil', '__proto__', 'constructor', 'toString', '', 42]) {
      expect(acceptedEvents({ name }), String(name)).toEqual([]);
    }
  });
  it('clears parameters that are not kept or not well formed', () => {
    expect(acceptedEvents({ name: 'copy', param: 'thread' })[0].param).toBe('');
    expect(acceptedEvents({ name: 'download', param: 'https://x.com/a/status/1' })[0].param).toBe('');
    expect(acceptedEvents({ name: 'download', param: 'A'.repeat(30) })[0].param).toBe('');
    expect(acceptedEvents({ name: 'download', param: 'pdf', v: 'v1; drop' })[0].version).toBe('');
  });
  it('takes at most 25 events from a batch', () => {
    const events = Array.from({ length: 40 }, () => ({ name: 'copy' }));
    expect(acceptedEvents({ events })).toHaveLength(25);
  });
  it('every whitelisted event keeps at most one parameter', () => {
    for (const v of Object.values(COUNTER_EVENTS)) expect(v === null || typeof v === 'string').toBe(true);
  });
  it('countBucket never reports an exact count', () => {
    expect([0, 1, 10, 11, 100, 101, 500, 2000, 2001].map(countBucket)).toEqual(['0', '1-10', '1-10', '11-100', '11-100', '101-500', '101-500', '501-2000', '2000+']);
  });
});

describe('handleExt', () => {
  it('ignores other paths', async () => {
    expect(await handleExt(post({ name: 'copy' }, 'ext', '/api/thread/1'), {})).toBeNull();
  });
  it('needs POST and an app client header', async () => {
    expect((await handleExt(new Request('https://xtracticle.com/api/ext/event'), {}))!.status).toBe(405);
    expect((await handleExt(post({ name: 'copy' }, null), {}))!.status).toBe(403);
    expect((await handleExt(post({ name: 'copy' }, 'mcp'), {}))!.status).toBe(403);
  });
  it('rejects bodies with no valid event', async () => {
    expect((await handleExt(post({ name: 'nope' }), {}))!.status).toBe(400);
    expect((await handleExt(post('not json'), {}))!.status).toBe(400);
    expect((await handleExt(post({ name: 'copy', pad: 'x'.repeat(9000) }), {}))!.status).toBe(400);
  });
  it('answers 204 without a database', async () => {
    expect((await handleExt(post({ name: 'copy' }), {}))!.status).toBe(204);
  });
  it('writes one row per key with the summed count and the caller surface; no IP or URL', async () => {
    const { db, calls } = fakeDb();
    const res = await handleExt(
      post({ v: '3.0.0', events: [{ name: 'download', param: 'pdf' }, { name: 'download', param: 'pdf' }, { name: 'copy' }, { name: 'bad' }] }),
      { WATCH_DB: db },
    );
    expect(res!.status).toBe(204);
    const day = new Date().toISOString().slice(0, 10);
    expect(calls).toEqual([
      [day, 'ext', 'download', 'pdf', '3.0.0', 2],
      [day, 'ext', 'copy', '', '3.0.0', 1],
    ]);
    const { db: db2, calls: calls2 } = fakeDb();
    await handleExt(post({ name: 'saved_open' }, 'web'), { WATCH_DB: db2 });
    expect(calls2[0][1]).toBe('web');
  });
  it('still answers 204 when the database write fails', async () => {
    const db = { prepare: () => ({ bind: () => ({}) }), batch: async () => { throw new Error('no such table'); } };
    expect((await handleExt(post({ name: 'copy' }), { WATCH_DB: db as any }))!.status).toBe(204);
  });
});
