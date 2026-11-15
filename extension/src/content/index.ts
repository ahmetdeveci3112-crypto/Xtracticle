/**
 * ISOLATED-world content script on x.com (docs/chrome-extension-plan.md, B3).
 *
 * Runs at document_start (not document_idle) so its listener exists before X's first GraphQL calls:
 * hook.js forwards responses as they arrive and a message posted before this script runs is lost.
 *
 * Data path only in this phase: hook.js message → checks (same window, tag, size, op name; post ids
 * are checked by the mapper and again by the SW) → x/graphql.ts → capture:posts to the SW.
 * The UI (Save menu, bookmarks panel) comes in the next phases.
 */
import { send } from '../messages';
import { XT_VERSION } from '../config';
import { isHookMessage, OPS_TAG, parseStoredConfig, type HookMessage, type OpsMessage, type XtConfig } from '../x/ops';
import { accountFromCookie, handleHookMessage, RecentPosts } from './capture';

(() => {
  const CONFIG_KEY = 'xtConfig';
  const MAX_QUEUE = 30;
  let config: XtConfig = parseStoredConfig(null, XT_VERSION);
  let ready = false;
  const queue: HookMessage[] = [];
  const recent = new RecentPosts();

  const pushOps = () => {
    const msg: OpsMessage = { tag: OPS_TAG, ops: config.ops };
    window.postMessage(msg, location.origin);
  };

  const process = (m: HookMessage) => {
    const { capture } = handleHookMessage(m, config, accountFromCookie(document.cookie), recent);
    if (capture) void send({ type: 'capture:posts', capture });
  };

  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin) return;
    if (!isHookMessage(event.data)) return;
    const m = event.data;
    if (!ready) {
      if (queue.length < MAX_QUEUE) queue.push(m);
      return;
    }
    process(m);
  });

  const apply = (stored: unknown) => {
    config = parseStoredConfig(stored, XT_VERSION);
    pushOps();
  };

  chrome.storage.local
    .get(CONFIG_KEY)
    .then(r => apply(r[CONFIG_KEY]))
    .catch(() => pushOps())
    .finally(() => {
      ready = true;
      for (const m of queue.splice(0)) process(m);
    });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes[CONFIG_KEY]) apply(changes[CONFIG_KEY].newValue);
  });
})();
