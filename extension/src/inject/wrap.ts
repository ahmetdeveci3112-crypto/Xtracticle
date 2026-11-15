/**
 * fetch / XMLHttpRequest listener for hook.js (MAIN world on x.com, document_start; plan B3).
 *
 * Contract:
 *   - only `/i/api/graphql/<id>/<Name>` URLs whose Name is in the current op list are looked at;
 *   - only 200 responses are forwarded, as text, at most MAX_BODY_CHARS, via `window.postMessage`
 *     to the page's own origin with the fixed tag HOOK_TAG;
 *   - the request body is forwarded only for the bookmark mutations (their variables carry the post id);
 *   - requests are never changed, headers never read, nothing is stored;
 *   - the page sees the same fetch promise, the same Response (we read a clone), and the same XHR
 *     events and readyState sequence (we only add one `load` listener on matching requests).
 *
 * Separate from hook.ts so it can be unit-tested against plain objects.
 */
import { DEFAULT_OPS, HOOK_TAG, MAX_BODY_CHARS, MAX_REQ_CHARS, OPS_TAG, REQUEST_BODY_CATEGORIES, categoryOf, mergeOps, opFromUrl, type HookMessage, type OpMap } from '../x/ops';

/** The parts of `window` the hook touches. */
export interface HookWindow {
  fetch?: (...args: any[]) => Promise<any>;
  XMLHttpRequest?: { prototype: any };
  location: { href: string; origin: string };
  postMessage(message: unknown, targetOrigin: string): void;
  addEventListener(type: 'message', listener: (event: { source: unknown; data: unknown }) => void): void;
}

const INSTALLED = Symbol.for('xtracticle.hook');

export function install(win: HookWindow): void {
  const w = win as HookWindow & { [INSTALLED]?: boolean };
  if (w[INSTALLED]) return;
  try {
    Object.defineProperty(w, INSTALLED, { value: true });
  } catch {
    return;
  }

  let ops: OpMap = mergeOps(DEFAULT_OPS, null);

  // content.js sends the merged names from public/ext/config.json. Names only add to the defaults.
  win.addEventListener('message', event => {
    try {
      if (event.source !== win) return;
      const d = event.data as { tag?: unknown; ops?: unknown } | null;
      if (!d || d.tag !== OPS_TAG) return;
      ops = mergeOps(DEFAULT_OPS, d.ops);
    } catch {
      /* ignore */
    }
  });

  /** Category and op of a URL we listen to, or null. */
  const match = (url: unknown) => {
    const op = opFromUrl(url, win.location.href);
    const cat = op ? categoryOf(ops, op) : null;
    return op && cat ? { op, cat, wantsBody: REQUEST_BODY_CATEGORIES.includes(cat) } : null;
  };

  const forward = (op: string, body: unknown, req: unknown) => {
    if (typeof body !== 'string' || !body || body.length > MAX_BODY_CHARS) return;
    const msg: HookMessage = { tag: HOOK_TAG, op, body };
    if (typeof req === 'string' && req.length <= MAX_REQ_CHARS) msg.req = req;
    try {
      win.postMessage(msg, win.location.origin);
    } catch {
      /* ignore */
    }
  };

  /* ─── fetch ─── */
  const origFetch = win.fetch;
  if (typeof origFetch === 'function') {
    const wrapped = function (this: unknown, ...args: any[]) {
      const p = origFetch.apply(this, args);
      try {
        const input = args[0];
        const url = typeof input === 'string' ? input : input && typeof input.href === 'string' ? input.href : input && typeof input.url === 'string' ? input.url : null;
        const m = match(url);
        if (m && p && typeof p.then === 'function') {
          const req = m.wantsBody && typeof args[1]?.body === 'string' ? args[1].body : undefined;
          p.then(
            (res: any) => {
              try {
                if (!res || res.status !== 200 || typeof res.clone !== 'function') return;
                res
                  .clone()
                  .text()
                  .then((body: string) => forward(m.op, body, req))
                  .catch(() => {});
              } catch {
                /* body already used, opaque response… */
              }
            },
            () => {},
          );
        }
      } catch {
        /* never break the page's request */
      }
      return p;
    };
    try {
      Object.defineProperty(wrapped, 'name', { value: 'fetch' });
    } catch {
      /* ignore */
    }
    win.fetch = wrapped;
  }

  /* ─── XMLHttpRequest ─── */
  const proto = win.XMLHttpRequest?.prototype;
  if (proto && typeof proto.open === 'function' && typeof proto.send === 'function') {
    const origOpen = proto.open;
    const origSend = proto.send;
    const state = new WeakMap<object, { op: string; wantsBody: boolean; req?: string; listening: boolean }>();

    function onLoad(this: any) {
      try {
        const s = state.get(this);
        if (!s || !s.op || this.status !== 200) return;
        const rt = this.responseType;
        const body = rt === '' || rt === 'text' ? this.responseText : rt === 'json' && this.response != null ? JSON.stringify(this.response) : null;
        forward(s.op, body, s.req);
      } catch {
        /* ignore */
      }
    }

    proto.open = function (this: any, ...args: any[]) {
      try {
        const m = match(typeof args[1] === 'string' ? args[1] : args[1] && typeof args[1].href === 'string' ? args[1].href : null);
        const prev = state.get(this);
        if (m) state.set(this, { op: m.op, wantsBody: m.wantsBody, listening: prev?.listening ?? false });
        else if (prev) state.set(this, { ...prev, op: '', wantsBody: false, req: undefined });
      } catch {
        /* ignore */
      }
      return origOpen.apply(this, args);
    };

    proto.send = function (this: any, ...args: any[]) {
      try {
        const s = state.get(this);
        if (s && s.op) {
          s.req = s.wantsBody && typeof args[0] === 'string' ? args[0] : undefined;
          if (!s.listening) {
            s.listening = true;
            this.addEventListener('load', onLoad);
          }
        }
      } catch {
        /* ignore */
      }
      return origSend.apply(this, args);
    };

    // A reused XHR opened again for another URL keeps its one listener; onLoad sees `op: ''` and forwards nothing.
  }
}
