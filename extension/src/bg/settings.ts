/** chrome.storage.local.settings: `{ archive }` (local archive, default on; owner decision 4). */
import type { Settings } from '../messages';
import { DEFAULT_SETTINGS, sanitizeSettings } from './records';

const KEY = 'settings';

export async function getSettings(): Promise<Settings> {
  const r = await chrome.storage.local.get(KEY);
  return sanitizeSettings(r[KEY], DEFAULT_SETTINGS);
}

export async function setSettings(patch: unknown): Promise<Settings> {
  const next = sanitizeSettings(patch, await getSettings());
  await chrome.storage.local.set({ [KEY]: next });
  return next;
}
