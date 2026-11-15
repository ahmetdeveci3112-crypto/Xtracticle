/**
 * Every call from the extension to xtracticle.com goes through here: the site's own cookie
 * (`credentials: 'include'`, A2; verified in docs/chrome-extension-cookie-test.md) and the
 * app-client header (src/shared/client.ts). Only the service worker calls the site.
 */
import { XT_BASE } from '../config';

export function siteFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('X-Xt-Client', 'ext');
  return fetch(`${XT_BASE}${path}`, { ...init, headers, credentials: 'include', cache: 'no-store' });
}

/** JSON body of a response, or null when it is not JSON. */
export async function jsonOf(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * GET /api/thread/:id: the post (or the self-thread it belongs to) the site would show for this id.
 * `status` 0 = network error; the tweets are re-validated by the caller (bg/records.ts sanitizeTweet).
 */
export async function fetchThread(id: string): Promise<{ status: number; body: unknown }> {
  try {
    const res = await siteFetch(`/api/thread/${id}`);
    return { status: res.status, body: res.ok ? await jsonOf(res) : null };
  } catch {
    return { status: 0, body: null };
  }
}
