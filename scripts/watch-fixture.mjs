#!/usr/bin/env node
/**
 * Local stand-in for FxTwitter (+ the Wayback CDX endpoint) for Watch tests. Not shipped.
 *
 *   node scripts/watch-fixture.mjs            # listens on 127.0.0.1:8798
 *   npx wrangler dev --port 8788 --test-scheduled \
 *     --var FX_BASE_URL:http://127.0.0.1:8798 --var CDX_BASE_URL:http://127.0.0.1:8798
 *
 * Serves /2/profile/:handle, /2/profile/:handle/statuses (20 per page, `cursor` = offset),
 * /2/status/:id and /cdx/search/cdx. Mutate the state between cron runs:
 *   POST /__reset                      back to the seed below
 *   POST /__add/:handle      {text}    a new post (newest id)
 *   POST /__reply/:handle    {text,parent} a self-reply
 *   POST /__delete/:handle/:id         the post answers 404 from now on
 *   POST /__protect/:handle            account becomes protected (profile 200 protected, statuses 404, status 401)
 *   POST /__gone/:handle               account answers 404 everywhere
 *   POST /__wayback/:id                CDX answers a capture for that post
 *   POST /__flaky/:n                   the next n timeline requests answer 404 (FxTwitter's flakiness)
 *   GET  /__state
 */
import http from 'node:http';

const PORT = Number(process.env.PORT || 8798);
let next = 1790000000000000000n;
const newId = () => String((next += 1000000n));
const nowAt = i => new Date(Date.UTC(2026, 10, 1, 12, 0, 0) + i * 60000);

function seed() {
  const h = {};
  const mk = (name, display, n, { protected: prot = false, exists = true } = {}) => {
    const posts = [];
    for (let i = 0; i < n; i++) {
      const id = newId();
      const d = nowAt(i);
      posts.push({
        id,
        text: `${display} post #${i + 1} ${i % 7 === 3 ? 'https://example.com/link' : ''}`.trim(),
        created_at: d.toUTCString(),
        created_timestamp: Math.floor(d.getTime() / 1000),
        parent: null,
        media: i % 10 === 5 ? { photos: [{ url: `https://pbs.twimg.com/media/${id}.jpg`, altText: 'a photo' }] } : null,
      });
    }
    h[name] = { name, display, protected: prot, exists, posts, deleted: new Set() };
  };
  mk('alice', 'Alice', 45); // 2 pages = 40 in the window, 5 older outside it
  mk('bob', 'Bob', 3);
  mk('carol', 'Carol', 2, { protected: true });
  // a self-thread on alice: reply to post #44 (second newest)
  const a = h.alice;
  const parent = a.posts[43];
  a.posts.push({ id: newId(), text: 'Alice thread part 2', created_at: nowAt(60).toUTCString(), created_timestamp: Math.floor(nowAt(60).getTime() / 1000), parent: parent.id, media: null });
  return h;
}

let handles = seed();
const wayback = new Set();
let flaky = 0;

const status = (h, p) => ({
  id: p.id,
  url: `https://x.com/${h.name}/status/${p.id}`,
  text: p.text,
  created_at: p.created_at,
  created_timestamp: p.created_timestamp,
  author: { screen_name: h.name, name: h.display, protected: h.protected },
  replying_to: p.parent ? { screen_name: h.name, status: p.parent } : null,
  media: p.media,
  lang: 'en',
});

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function findPost(id) {
  for (const h of Object.values(handles)) {
    const p = h.posts.find(p => p.id === id);
    if (p) return { h, p };
  }
  return null;
}

const server = http.createServer((req, res) => {
  let data = '';
  req.on('data', c => (data += c));
  req.on('end', () => {
    const url = new URL(req.url, 'http://x');
    const path = url.pathname;
    const body = data ? JSON.parse(data) : {};
    let m;

    // ─── mutations ───
    if (path === '/__reset') { handles = seed(); wayback.clear(); flaky = 0; return send(res, 200, { ok: true }); }
    if (path === '/__state') return send(res, 200, Object.fromEntries(Object.entries(handles).map(([k, h]) => [k, { protected: h.protected, exists: h.exists, posts: h.posts.map(p => p.id), deleted: [...h.deleted] }])));
    if ((m = path.match(/^\/__add\/(\w+)$/))) {
      const h = handles[m[1]]; const id = newId(); const d = new Date();
      h.posts.push({ id, text: body.text || `new post ${id}`, created_at: d.toUTCString(), created_timestamp: Math.floor(d.getTime() / 1000), parent: null, media: body.media || null });
      return send(res, 200, { id });
    }
    if ((m = path.match(/^\/__reply\/(\w+)$/))) {
      const h = handles[m[1]]; const id = newId(); const d = new Date();
      h.posts.push({ id, text: body.text || `reply ${id}`, created_at: d.toUTCString(), created_timestamp: Math.floor(d.getTime() / 1000), parent: body.parent, media: null });
      return send(res, 200, { id });
    }
    if ((m = path.match(/^\/__delete\/(\w+)\/(\d+)$/))) { handles[m[1]].deleted.add(m[2]); return send(res, 200, { ok: true }); }
    if ((m = path.match(/^\/__protect\/(\w+)$/))) { handles[m[1]].protected = true; return send(res, 200, { ok: true }); }
    if ((m = path.match(/^\/__gone\/(\w+)$/))) { handles[m[1]].exists = false; return send(res, 200, { ok: true }); }
    if ((m = path.match(/^\/__wayback\/(\d+)$/))) { wayback.add(m[1]); return send(res, 200, { ok: true }); }
    if ((m = path.match(/^\/__flaky\/(\d+)$/))) { flaky = Number(m[1]); return send(res, 200, { ok: true }); }

    // ─── FxTwitter ───
    if ((m = path.match(/^\/2\/profile\/(\w+)$/))) {
      const h = handles[m[1].toLowerCase()];
      if (!h || !h.exists) return send(res, 404, { code: 404, message: 'NOT_FOUND' });
      return send(res, 200, { code: 200, message: 'OK', user: { screen_name: h.name, name: h.display, protected: h.protected, id: '1', type: 'profile' } });
    }
    if ((m = path.match(/^\/2\/profile\/(\w+)\/statuses$/))) {
      const h = handles[m[1].toLowerCase()];
      if (flaky > 0) { flaky--; return send(res, 404, { code: 404, results: [], cursor: { top: null, bottom: null } }); }
      if (!h || !h.exists || h.protected) return send(res, 404, { code: 404, results: [], cursor: { top: null, bottom: null } });
      const count = Number(url.searchParams.get('count') || 20);
      const offset = Number(url.searchParams.get('cursor') || 0);
      const live = h.posts.filter(p => !h.deleted.has(p.id)).sort((a, b) => (a.id < b.id ? 1 : -1));
      const page = live.slice(offset, offset + count);
      const bottom = offset + count < live.length ? String(offset + count) : null;
      return send(res, 200, { code: 200, results: page.map(p => status(h, p)), cursor: { top: null, bottom } });
    }
    if ((m = path.match(/^\/2\/status\/(\d+)$/))) {
      const f = findPost(m[1]);
      if (!f || !f.h.exists || f.h.deleted.has(m[1])) return send(res, 404, { status: null, thread: null, author: null, code: 404 });
      if (f.h.protected) return send(res, 401, { code: 401, message: 'PRIVATE_TWEET' });
      return send(res, 200, { code: 200, message: 'OK', status: status(f.h, f.p) });
    }
    // ─── Wayback CDX ───
    if (path === '/cdx/search/cdx') {
      const target = url.searchParams.get('url') || '';
      const id = (target.match(/\/status\/(\d+)/) || [])[1];
      if (id && wayback.has(id)) return send(res, 200, [['timestamp', 'original'], ['20261101120000', `https://${target}`]]);
      return send(res, 200, '[]');
    }
    send(res, 404, { code: 404, message: 'no route' });
  });
});
server.listen(PORT, '127.0.0.1', () => console.log(`watch fixture on ${PORT}`));
