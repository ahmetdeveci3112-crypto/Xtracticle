/** The extension's counter queue (extension/src/bg/events.ts): whitelist, batching, minute spacing. */
import { describe, expect, it } from 'vitest';
import { BATCH_MAX, FLUSH_INTERVAL_MS, QUEUE_MAX, batchBody, cleanEvent, dueIn, emptyQueue, enqueue, parseQueue, takeBatch } from '../../extension/src/bg/events';
import { acceptedEvents } from '../../src/shared/ext';

const T0 = 1_800_000_000_000;

describe('counter events', () => {
  it('keeps whitelisted names and only their one parameter', () => {
    expect(cleanEvent({ name: 'download', param: 'md' })).toEqual({ name: 'download', param: 'md' });
    expect(cleanEvent({ name: 'copy', param: 'thread' })).toEqual({ name: 'copy' });
    expect(cleanEvent({ name: 'bookmarks_capture', param: '2000+' })).toEqual({ name: 'bookmarks_capture', param: '2000+' });
    expect(cleanEvent({ name: 'download', param: 'https://x.com/jack/status/20' })).toEqual({ name: 'download' });
    expect(cleanEvent({ name: 'parse_fail', param: 'Bookmarks' })).toEqual({ name: 'parse_fail' }); // upper case is not a kept value
    for (const bad of [{ name: 'pro_activate' }, { name: '__proto__' }, { name: 'evil' }, null, 'download', 7]) expect(cleanEvent(bad)).toBeNull();
  });

  it('extension names the plan lists are all accepted by the Worker', () => {
    for (const name of ['ext_install', 'download', 'copy', 'bookmarks_capture', 'saved_open', 'parse_fail', 'pro_nav_click']) {
      expect(cleanEvent({ name }), name).not.toBeNull();
    }
  });
});

describe('queue', () => {
  it('nothing goes out within a minute of the last send (or of install)', () => {
    let q = emptyQueue(T0);
    q = enqueue(q, { name: 'ext_install' });
    expect(takeBatch(q, T0 + 1000)).toBeNull();
    expect(dueIn(q, T0 + 1000)).toBe(FLUSH_INTERVAL_MS - 1000);
    const t = takeBatch(q, T0 + FLUSH_INTERVAL_MS)!;
    expect(t.batch).toEqual([{ name: 'ext_install' }]);
    expect(t.rest).toEqual({ events: [], lastFlushAt: T0 + FLUSH_INTERVAL_MS });
    expect(takeBatch(enqueue(t.rest, { name: 'copy' }), T0 + FLUSH_INTERVAL_MS + 59_000)).toBeNull();
  });

  it('at most 25 per batch; the rest waits for the next minute', () => {
    let q = emptyQueue(0);
    for (let i = 0; i < 60; i++) q = enqueue(q, { name: 'download', param: 'md' });
    const a = takeBatch(q, T0)!;
    expect(a.batch).toHaveLength(BATCH_MAX);
    expect(a.rest.events).toHaveLength(35);
    expect(takeBatch(a.rest, T0 + 10)).toBeNull();
    expect(takeBatch(a.rest, T0 + FLUSH_INTERVAL_MS)!.batch).toHaveLength(BATCH_MAX);
  });

  it('is capped, drops junk, survives a clock going back', () => {
    let q = emptyQueue(0);
    for (let i = 0; i < QUEUE_MAX + 50; i++) q = enqueue(q, { name: 'copy' });
    expect(q.events).toHaveLength(QUEUE_MAX);
    expect(enqueue(q, { name: 'nope' })).toBe(q);
    expect(takeBatch({ events: [{ name: 'copy' }], lastFlushAt: T0 + 10_000 }, T0)).not.toBeNull();
    expect(takeBatch(emptyQueue(0), T0)).toBeNull();
    expect(parseQueue({ events: [{ name: 'copy' }, { name: 'evil' }, 'x'], lastFlushAt: 'no' })).toEqual({ events: [{ name: 'copy' }], lastFlushAt: 0 });
    expect(parseQueue(null)).toEqual(emptyQueue());
  });

  it('the batch body is what the Worker counts', () => {
    const body = batchBody([{ name: 'download', param: 'pdf' }, { name: 'copy' }, { name: 'ext_install' }], '0.1.0');
    expect(body).toEqual({ v: '0.1.0', events: [{ name: 'download', param: 'pdf' }, { name: 'copy' }, { name: 'ext_install' }] });
    expect(acceptedEvents(body)).toEqual([
      { name: 'download', param: 'pdf', version: '0.1.0' },
      { name: 'copy', param: '', version: '0.1.0' },
      { name: 'ext_install', param: '', version: '0.1.0' },
    ]);
  });
});
