/**
 * The bridge's message handling, apart from the DOM so it is unit-tested (contract: src/shared/bridge.ts,
 * site client: src/lib/ext.ts). bridge/index.ts wires it to `window` and the service worker.
 *
 *   xt:pro-changed     → SW pro:refresh (re-reads /api/pro/me)
 *   xt:lang-changed    → SW lang:set (chrome.storage.local.lang)
 *   xt:saved:list      → SW saved:list → xt:saved:page   (only on /saved, `isSavedPath`)
 *   xt:saved:get       → SW saved:get  → xt:saved:post   (only on /saved; `post` null when there is no copy)
 *   xt:saved:delete    → SW saved:delete, no answer; a fresh xt:status follows
 *
 * The SW checks the path again (bg/access.ts), so a page that fakes its location gets nothing either way.
 */
import { MAX_EXT_MESSAGE_BYTES, isSavedPath, message, messageSize, type ExtMessage, type Lang, type SiteMessage } from '../../../src/shared/bridge';
import type { Msg, Replies, Reply, SavedStatus, StoredPost } from '../messages';

export interface BridgeDeps {
  send: <M extends Msg>(m: M) => Promise<Reply<Replies[M['type']]>>;
  post: (m: ExtMessage) => void;
  pathname: () => string;
}

/** `xt:status` from the SW's saved:status. */
export const statusMessage = (s: Pick<SavedStatus, 'bookmarks' | 'unavailable' | 'lastSyncAt'>): ExtMessage =>
  message<ExtMessage>({ type: 'xt:status', bookmarks: s.bookmarks, unavailable: s.unavailable, lastSyncAt: s.lastSyncAt });

/**
 * What `xt:saved:post` carries for a stored copy: the FxTweet, with the whole self-thread in `thread` when the
 * copy has one (src/lib/saved.ts postToTweets). Too large for one message → the post alone; still too large → null.
 */
export function postPayload(stored: StoredPost | null, req = 'r', id = '0'): Record<string, unknown> | null {
  if (!stored?.tweet) return null;
  const fits = (post: Record<string, unknown>) => messageSize({ xt: 1, type: 'xt:saved:post', req, id, post }) <= MAX_EXT_MESSAGE_BYTES;
  const tweet = stored.tweet as unknown as Record<string, unknown>;
  if (stored.thread?.length) {
    const withThread = { ...tweet, thread: stored.thread };
    if (fits(withThread)) return withThread;
  }
  return fits(tweet) ? tweet : null;
}

export async function sendStatus(deps: BridgeDeps): Promise<void> {
  const r = await deps.send({ type: 'saved:status' });
  if (r.ok) deps.post(statusMessage(r.data));
}

export async function handleSiteMessage(msg: SiteMessage, deps: BridgeDeps): Promise<void> {
  switch (msg.type) {
    case 'xt:pro-changed':
      await deps.send({ type: 'pro:refresh' });
      return;
    case 'xt:lang-changed':
      await deps.send({ type: 'lang:set', lang: msg.lang });
      return;
  }
  if (!isSavedPath(deps.pathname())) return;
  switch (msg.type) {
    case 'xt:saved:list': {
      const r = await deps.send({ type: 'saved:list', cursor: msg.cursor, filter: msg.filter });
      const page = r.ok ? r.data : { items: [], next: null, total: 0 };
      deps.post(message<ExtMessage>({ type: 'xt:saved:page', req: msg.req, items: page.items, next: page.next, total: page.total }));
      return;
    }
    case 'xt:saved:get': {
      const r = await deps.send({ type: 'saved:get', id: msg.id });
      deps.post(message<ExtMessage>({ type: 'xt:saved:post', req: msg.req, id: msg.id, post: r.ok ? postPayload(r.data, msg.req, msg.id) : null }));
      return;
    }
    case 'xt:saved:delete': {
      await deps.send({ type: 'saved:delete', ids: msg.ids });
      await sendStatus(deps);
      return;
    }
  }
}

/** The site page's language to hand to the SW, when the page states one. */
export type { Lang };
