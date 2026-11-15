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
