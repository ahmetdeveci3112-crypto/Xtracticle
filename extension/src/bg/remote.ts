/**
 * public/ext/config.json → chrome.storage.local.xtConfig (docs/chrome-extension-plan.md, B4):
 * extra GraphQL operation names, flags and minVersion, read at most every 6 hours on SW wake-up.
 * content.js reads the stored result; it never fetches the config itself.
 * A failed read keeps the last stored config (or the built-in defaults).
 */
import { XT_BASE, XT_VERSION } from '../config';
import { CONFIG_TTL_MS, effectiveConfig, parseRemoteConfig, parseStoredConfig, type XtConfig } from '../x/ops';

export const CONFIG_KEY = 'xtConfig';
const TRIED_KEY = 'xtConfigTriedAt';
/** After a failed read, wait this long before the next try. */
const RETRY_MS = 30 * 60 * 1000;

export async function readConfig(): Promise<XtConfig> {
  const r = await chrome.storage.local.get(CONFIG_KEY);
  return parseStoredConfig(r[CONFIG_KEY], XT_VERSION);
}

/** Pure: is a new read due? */
export function configDue(fetchedAt: number | null, triedAt: number | null, now: number, force = false): boolean {
  if (force) return true;
  if (fetchedAt !== null && now - fetchedAt >= 0 && now - fetchedAt < CONFIG_TTL_MS) return false;
  if (triedAt !== null && now - triedAt >= 0 && now - triedAt < RETRY_MS) return false;
  return true;
}

export async function refreshConfig(force = false): Promise<XtConfig> {
  const r = await chrome.storage.local.get([CONFIG_KEY, TRIED_KEY]);
  const current = parseStoredConfig(r[CONFIG_KEY], XT_VERSION);
  const now = Date.now();
  const tried = typeof r[TRIED_KEY] === 'number' ? (r[TRIED_KEY] as number) : null;
  if (!configDue(current.fetchedAt, tried, now, force)) return current;
  await chrome.storage.local.set({ [TRIED_KEY]: now });
  try {
    const res = await fetch(`${XT_BASE}/ext/config.json`, { cache: 'no-store', credentials: 'omit' });
    if (!res.ok) return current;
    const remote = parseRemoteConfig(await res.json());
    if (!remote) return current;
    const next = effectiveConfig(remote, XT_VERSION, now);
    await chrome.storage.local.set({ [CONFIG_KEY]: next });
    return next;
  } catch {
    return current;
  }
}
