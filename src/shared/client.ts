/**
 * Which of our own front ends sent a request. The SPA sends `X-Xt-Client: web`, the browser
 * extension (docs/chrome-extension-plan.md, A2) sends `X-Xt-Client: ext`.
 *
 * The header is a CSRF guard, not authentication: a cross-site form or <img> cannot set a
 * custom header, and a cross-origin fetch that sets one needs a CORS preflight we never answer.
 * Accepting a second value does not weaken that.
 */
export const APP_CLIENTS = ['web', 'ext'] as const;
export type AppClient = (typeof APP_CLIENTS)[number];

/** The calling front end, or null when the header is missing or unknown. */
export function appClient(request: Request): AppClient | null {
  const v = request.headers.get('X-Xt-Client') || '';
  return (APP_CLIENTS as readonly string[]).includes(v) ? (v as AppClient) : null;
}

export const isAppClient = (request: Request): boolean => appClient(request) !== null;
