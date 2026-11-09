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

/** Trial-only additions to the digest: the countdown footer and the manage link instead of /pro. */
export interface DigestTrial {
  daysLeft: number;
  manageToken: string;
}

/** Where a trial user manages the trial (the SPA reads the token from the hash; it never reaches the server or analytics). */
export const trialManageUrl = (origin: string, manageToken: string) => `${origin}/pro#t=${manageToken}`;

function itemLines(i: DigestItem): string[] {
  const lines = [`• ${i.title} (${i.detectedAt.slice(0, 16).replace('T', ' ')} UTC)`];
  if (i.text) lines.push(`  ${i.text}`);
  if (i.url) lines.push(`  ${i.url}`);
  if (i.wayback) lines.push(`  Wayback copy: ${i.wayback}`);
  if (i.markdownUrl) lines.push(`  Markdown: ${i.markdownUrl}`);
  lines.push('');
  return lines;
}

function itemBlock(i: DigestItem): string {
  return (
    `<li style="margin:0 0 14px"><b>${escapeHtml(i.title)}</b> <span style="color:#666">${escapeHtml(i.detectedAt.slice(0, 16).replace('T', ' '))} UTC</span>` +
    (i.text ? `<br>${escapeHtml(i.text)}` : '') +
    (i.url ? `<br><a href="${escapeHtml(i.url)}">${escapeHtml(i.url)}</a>` : '') +
    (i.wayback ? `<br><a href="${escapeHtml(i.wayback)}">Wayback copy</a>` : '') +
    (i.markdownUrl ? `${i.wayback ? ' · ' : '<br>'}<a href="${escapeHtml(i.markdownUrl)}">Markdown</a>` : '') +
    '</li>'
  );
}

export function digestEmail(origin: string, items: DigestItem[], unsubToken: string, trial?: DigestTrial): Omit<EmailMessage, 'to'> {
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const manage = trial ? trialManageUrl(origin, trial.manageToken) : `${origin}/pro`;
  const handles = [...new Set(items.map(i => '@' + i.handle))].join(', ');
  const lines: string[] = [`Xtracticle Watch: ${items.length} event${items.length === 1 ? '' : 's'} for ${handles}.`, ''];
  const blocks: string[] = [];
  for (const i of items) {
    lines.push(...itemLines(i));
    blocks.push(itemBlock(i));
  }
  let trialLine = '';
  if (trial) {
    trialLine = `Trial: ${trial.daysLeft} day${trial.daysLeft === 1 ? '' : 's'} left — keep watching with Pro: ${origin}/pro`;
    lines.push(trialLine, '');
  }
  lines.push(`${trial ? 'Manage your trial' : 'Manage your watches'}: ${manage}`, `Stop these e-mails: ${unsub}`);
  const html =
    `<p>Xtracticle Watch: ${items.length} event${items.length === 1 ? '' : 's'} for ${escapeHtml(handles)}.</p>` +
    `<ul style="padding-left:18px">${blocks.join('')}</ul>` +
    (trial ? `<p><b>${escapeHtml(trialLine.replace(/ — .*$/, ''))}</b> — <a href="${escapeHtml(origin)}/pro">keep watching with Pro</a></p>` : '') +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(manage)}">${trial ? 'Manage your trial' : 'Manage your watches'}</a> · <a href="${escapeHtml(unsub)}">Stop these e-mails</a></p>`;
  return {
    subject: `Watch digest: ${items.length} event${items.length === 1 ? '' : 's'} for ${handles}`,
    text: lines.join('\n'),
    html,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

/* ─── Trial e-mails ─── */

export function trialVerificationEmail(origin: string, handle: string, days: number, verifyToken: string, manageToken: string): Omit<EmailMessage, 'to'> {
  const link = `${origin}/api/watch/trial/verify/${verifyToken}`;
  const manage = trialManageUrl(origin, manageToken);
  const text = [
    `Confirm this address to start your free ${days}-day Xtracticle Watch trial for @${handle}.`,
    '',
    link,
    '',
    'The link works for 24 hours. Nothing is checked and nothing is sent until you confirm. If you did not ask for this, ignore this message.',
    '',
    `After confirming, you can see what the trial caught, change what it watches or end it here: ${manage}`,
  ].join('\n');
  const html =
    `<p>Confirm this address to start your free ${days}-day Xtracticle Watch trial for <b>@${escapeHtml(handle)}</b>.</p>` +
    `<p><a href="${escapeHtml(link)}">Confirm e-mail address and start the trial</a></p>` +
    `<p style="color:#666;font-size:13px">The link works for 24 hours. Nothing is checked and nothing is sent until you confirm. If you did not ask for this, ignore this message.</p>` +
    `<p style="color:#666;font-size:13px">After confirming, you can see what the trial caught, change what it watches or end it <a href="${escapeHtml(manage)}">here</a>.</p>`;
  return { subject: `Confirm your Xtracticle Watch trial for @${handle}`, text, html };
}

export function trialReminderEmail(origin: string, handle: string, daysLeft: number, endsAt: string, caught: number, manageToken: string, unsubToken: string): Omit<EmailMessage, 'to'> {
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const manage = trialManageUrl(origin, manageToken);
  const when = endsAt.slice(0, 16).replace('T', ' ') + ' UTC';
  const dayWord = `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
  const text = [
    `Your free Xtracticle Watch trial for @${handle} ends in ${dayWord} (${when}). So far it caught ${caught} event${caught === 1 ? '' : 's'}.`,
    '',
    `Keep watching @${handle} and up to 4 more accounts with Xtracticle Pro: ${origin}/pro`,
    '',
    `Trial status, mode and ending it early: ${manage}`,
    `Stop these e-mails: ${unsub}`,
  ].join('\n');
  const html =
    `<p>Your free Xtracticle Watch trial for <b>@${escapeHtml(handle)}</b> ends in <b>${dayWord}</b> (${escapeHtml(when)}). So far it caught ${caught} event${caught === 1 ? '' : 's'}.</p>` +
    `<p><a href="${escapeHtml(origin)}/pro">Keep watching @${escapeHtml(handle)} and up to 4 more accounts with Xtracticle Pro</a></p>` +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(manage)}">Manage your trial</a> · <a href="${escapeHtml(unsub)}">Stop these e-mails</a></p>`;
  return {
    subject: `Your Watch trial for @${handle} ends in ${dayWord}`,
    text,
    html,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

export function trialEndedEmail(origin: string, handle: string, items: DigestItem[], total: number, unsubToken: string): Omit<EmailMessage, 'to'> {
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const caught = total === 0 ? 'no events' : `${total} event${total === 1 ? '' : 's'}`;
  const lines = [`Your free Xtracticle Watch trial for @${handle} has ended; the account is no longer checked.`, '', `During the trial Watch caught ${caught}${items.length ? ':' : '.'}`, ''];
  for (const i of items) lines.push(...itemLines(i));
  if (total > items.length) lines.push(`… and ${total - items.length} more.`, '');
  lines.push(
    `Keep watching @${handle} with Xtracticle Pro: ${origin}/pro`,
    `Events are kept for 90 days after they were detected, so everything above stays visible if you add @${handle} with Pro.`,
    '',
    `Stop these e-mails: ${unsub}`,
  );
  const html =
    `<p>Your free Xtracticle Watch trial for <b>@${escapeHtml(handle)}</b> has ended; the account is no longer checked.</p>` +
    `<p>During the trial Watch caught ${caught}${items.length ? ':' : '.'}</p>` +
    (items.length ? `<ul style="padding-left:18px">${items.map(itemBlock).join('')}</ul>` : '') +
    (total > items.length ? `<p>… and ${total - items.length} more.</p>` : '') +
    `<p><a href="${escapeHtml(origin)}/pro">Keep watching @${escapeHtml(handle)} with Xtracticle Pro</a><br>` +
    `<span style="color:#666;font-size:13px">Events are kept for 90 days after they were detected, so everything above stays visible if you add @${escapeHtml(handle)} with Pro.</span></p>` +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(unsub)}">Stop these e-mails</a></p>`;
  return {
    subject: `Your Watch trial for @${handle} has ended`,
    text: lines.join('\n'),
    html,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
