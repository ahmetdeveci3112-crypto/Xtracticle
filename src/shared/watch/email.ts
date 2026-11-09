import type { CfEmailBinding, WatchEnv } from './db';

/**
 * Outbound e-mail for Watch (verification links, daily digests). Cloudflare Email Service
 * (`send_email` binding EMAIL) when bound, Resend's HTTP API as a fallback.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Extra headers, e.g. List-Unsubscribe. */
  headers?: Record<string, string>;
}

export interface EmailSender {
  readonly name: string;
  send(msg: EmailMessage): Promise<{ ok: boolean; id?: string; error?: string }>;
}

const RESEND_URL = 'https://api.resend.com/emails';
const SEND_TIMEOUT_MS = 10_000;
export const DEFAULT_FROM = 'Xtracticle <watch@xtracticle.com>';

export function resendSender(apiKey: string, from: string): EmailSender {
  return {
    name: 'resend',
    async send(msg) {
      try {
        const res = await fetch(RESEND_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, text: msg.text, html: msg.html, headers: msg.headers }),
          signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        });
        const data: any = await res.json().catch(() => null);
        if (!res.ok) return { ok: false, error: `resend ${res.status}: ${data?.message || data?.name || 'error'}` };
        return { ok: true, id: typeof data?.id === 'string' ? data.id : undefined };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}

/** "Name <addr@host>" → { name, email }; a bare address stays as is. */
function parseFrom(from: string): { email: string; name?: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { email: m[2], name: m[1] || undefined } : { email: from.trim() };
}

/** Cloudflare Email Service (Workers Paid; the sending domain must be onboarded in the dashboard). */
export function cloudflareSender(binding: CfEmailBinding, from: string): EmailSender {
  const sender = parseFrom(from);
  return {
    name: 'cloudflare',
    async send(msg) {
      const base = { to: msg.to, from: sender, subject: msg.subject, text: msg.text, html: msg.html };
      try {
        const r = await binding.send(msg.headers ? { ...base, headers: msg.headers } : base);
        return { ok: true, id: r?.messageId };
      } catch (err: any) {
        // A header the service does not allow (e.g. List-Unsubscribe): send once more without custom headers.
        if (msg.headers && typeof err?.code === 'string' && err.code.startsWith('E_HEADER')) {
          try {
            const r = await binding.send(base);
            return { ok: true, id: r?.messageId };
          } catch (err2: any) {
            return { ok: false, error: `cloudflare ${err2?.code || ''}: ${err2?.message || String(err2)}` };
          }
        }
        return { ok: false, error: `cloudflare ${err?.code || ''}: ${err?.message || String(err)}` };
      }
    },
  };
}

/** The configured sender: the Cloudflare EMAIL binding, else Resend, else null (callers log and skip). */
export function emailSender(env: WatchEnv): EmailSender | null {
  const from = env.WATCH_EMAIL_FROM || DEFAULT_FROM;
  if (env.EMAIL) return cloudflareSender(env.EMAIL, from);
  if (env.RESEND_API_KEY) return resendSender(env.RESEND_API_KEY, from);
  return null;
}

export const publicOrigin = (env: WatchEnv) => (env.WATCH_PUBLIC_ORIGIN || 'https://xtracticle.com').replace(/\/+$/, '');

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/* ─── Templates ─── */

export function verificationEmail(origin: string, handle: string, token: string): Omit<EmailMessage, 'to'> {
  const link = `${origin}/api/watch/verify/${token}`;
  const text = [
    `Confirm this address to receive Xtracticle Watch e-mails for @${handle}.`,
    '',
    link,
    '',
    'The link works for 24 hours. If you did not ask for this, ignore this message: nothing is sent to an unconfirmed address.',
  ].join('\n');
  const html =
    `<p>Confirm this address to receive Xtracticle Watch e-mails for <b>@${escapeHtml(handle)}</b>.</p>` +
    `<p><a href="${escapeHtml(link)}">Confirm e-mail address</a></p>` +
    `<p style="color:#666;font-size:13px">The link works for 24 hours. If you did not ask for this, ignore this message: nothing is sent to an unconfirmed address.</p>`;
  return { subject: `Confirm Watch e-mails for @${handle}`, text, html };
}

export interface DigestItem {
  handle: string;
  type: string;
  title: string;
  text: string;
  url?: string;
  wayback?: string;
  markdownUrl?: string;
  detectedAt: string;
}

export function digestEmail(origin: string, items: DigestItem[], unsubToken: string): Omit<EmailMessage, 'to'> {
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const handles = [...new Set(items.map(i => '@' + i.handle))].join(', ');
  const lines: string[] = [`Xtracticle Watch: ${items.length} event${items.length === 1 ? '' : 's'} for ${handles}.`, ''];
  const blocks: string[] = [];
  for (const i of items) {
    lines.push(`• ${i.title} (${i.detectedAt.slice(0, 16).replace('T', ' ')} UTC)`);
    if (i.text) lines.push(`  ${i.text}`);
    if (i.url) lines.push(`  ${i.url}`);
    if (i.wayback) lines.push(`  Wayback copy: ${i.wayback}`);
    if (i.markdownUrl) lines.push(`  Markdown: ${i.markdownUrl}`);
    lines.push('');
    blocks.push(
      `<li style="margin:0 0 14px"><b>${escapeHtml(i.title)}</b> <span style="color:#666">${escapeHtml(i.detectedAt.slice(0, 16).replace('T', ' '))} UTC</span>` +
        (i.text ? `<br>${escapeHtml(i.text)}` : '') +
        (i.url ? `<br><a href="${escapeHtml(i.url)}">${escapeHtml(i.url)}</a>` : '') +
        (i.wayback ? `<br><a href="${escapeHtml(i.wayback)}">Wayback copy</a>` : '') +
        (i.markdownUrl ? `${i.wayback ? ' · ' : '<br>'}<a href="${escapeHtml(i.markdownUrl)}">Markdown</a>` : '') +
        '</li>',
    );
  }
  lines.push(`Manage your watches: ${origin}/pro`, `Stop these e-mails: ${unsub}`);
  const html =
    `<p>Xtracticle Watch: ${items.length} event${items.length === 1 ? '' : 's'} for ${escapeHtml(handles)}.</p>` +
    `<ul style="padding-left:18px">${blocks.join('')}</ul>` +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(origin)}/pro">Manage your watches</a> · <a href="${escapeHtml(unsub)}">Stop these e-mails</a></p>`;
  return {
    subject: `Watch digest: ${items.length} event${items.length === 1 ? '' : 's'} for ${handles}`,
    text: lines.join('\n'),
    html,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
