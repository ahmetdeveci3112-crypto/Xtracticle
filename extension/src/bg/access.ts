/**
 * Which sender may send which message to the service worker (contract: extension/src/messages.ts).
 * Pure, so it is unit-tested; bg/sw.ts calls it with the real `chrome.runtime.MessageSender`.
 */
import { isSavedPath } from '../../../src/shared/bridge';
import type { MsgType } from '../messages';

export interface SenderInfo {
  /** chrome.runtime.id of the sender; must be ours. */
  id?: string;
  /** Page URL of a content script, or the extension page URL. */
  url?: string;
  /** Present for content scripts (and extension pages opened in a tab). */
  tab?: unknown;
}

const X_CONTENT: readonly MsgType[] = ['capture:posts', 'pro:get', 'pro:refresh', 'saved:status', 'saved:has', 'settings:get', 'thread:get', 'event:track', 'scan:state', 'scan:done'];
const SITE_ANY: readonly MsgType[] = ['pro:get', 'pro:refresh', 'saved:status', 'lang:set'];
const SITE_SAVED: readonly MsgType[] = ['saved:list', 'saved:get', 'saved:delete'];
const X_HOSTS = new Set(['x.com', 'twitter.com', 'mobile.x.com', 'mobile.twitter.com']);

export function isAllowed(type: MsgType, sender: SenderInfo, extensionId: string, siteOrigin: string): boolean {
  if (!sender || sender.id !== extensionId || typeof sender.url !== 'string') return false;
  let u: URL;
  try {
    u = new URL(sender.url);
  } catch {
    return false;
  }
  if (u.protocol === 'chrome-extension:' && u.hostname === extensionId) return true; // popup and our own pages
  if (u.protocol === 'https:' && X_HOSTS.has(u.hostname)) return X_CONTENT.includes(type);
  if (u.origin === siteOrigin) return SITE_ANY.includes(type) || (SITE_SAVED.includes(type) && isSavedPath(u.pathname));
  return false;
}
