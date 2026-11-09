import type { CfEmailBinding, WatchEnv } from './db';
import { PRO_PATHS, isMailLang, mailCopy, type MailCopy } from './mail-copy';

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
  /** Site language the trial was started in (trials.lang); English when missing. */
  lang?: string;
}

/** Where a trial user manages the trial (the SPA reads the token from the hash; it never reaches the server or analytics). */
export const trialManageUrl = (origin: string, manageToken: string, lang?: string) => `${origin}${proUrlPath(lang)}#t=${manageToken}`;

const proUrlPath = (lang?: string | null) => PRO_PATHS[isMailLang(lang) ? lang : 'en'];
const unsubHeaders = (unsub: string) => ({ 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' });
const at = (handle: string) => '@' + handle;
/** Arabic mail reads right to left. */
const dirWrap = (lang: string | null | undefined, html: string) => (lang === 'ar' ? `<div dir="rtl" style="text-align:right">${html}</div>` : html);
const bold = (handle: string) => `<b>@${escapeHtml(handle)}</b>`;

/** The event title in the reader's language (the stored title is English). */
function itemTitle(i: DigestItem, c: MailCopy): string {
  const f = (c.title as Record<string, ((h: string) => string) | undefined>)[i.type];
  return f ? f(at(i.handle)) : i.title;
}

function itemLines(i: DigestItem, c: MailCopy): string[] {
  const lines = [`• ${itemTitle(i, c)} (${i.detectedAt.slice(0, 16).replace('T', ' ')} UTC)`];
  if (i.text) lines.push(`  ${i.text}`);
  if (i.url) lines.push(`  ${i.url}`);
  if (i.wayback) lines.push(`  ${c.waybackCopy}: ${i.wayback}`);
  if (i.markdownUrl) lines.push(`  Markdown: ${i.markdownUrl}`);
  lines.push('');
  return lines;
}

function itemBlock(i: DigestItem, c: MailCopy): string {
  return (
    `<li style="margin:0 0 14px"><b>${escapeHtml(itemTitle(i, c))}</b> <span style="color:#666">${escapeHtml(i.detectedAt.slice(0, 16).replace('T', ' '))} UTC</span>` +
    (i.text ? `<br>${escapeHtml(i.text)}` : '') +
    (i.url ? `<br><a href="${escapeHtml(i.url)}">${escapeHtml(i.url)}</a>` : '') +
    (i.wayback ? `<br><a href="${escapeHtml(i.wayback)}">${escapeHtml(c.waybackCopy)}</a>` : '') +
    (i.markdownUrl ? `${i.wayback ? ' · ' : '<br>'}<a href="${escapeHtml(i.markdownUrl)}">Markdown</a>` : '') +
    '</li>'
  );
}

export function digestEmail(origin: string, items: DigestItem[], unsubToken: string, trial?: DigestTrial): Omit<EmailMessage, 'to'> {
  const c = mailCopy(trial?.lang);
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const pro = `${origin}${proUrlPath(trial?.lang)}`;
  const manage = trial ? trialManageUrl(origin, trial.manageToken, trial.lang) : `${origin}/pro`;
  const manageLabel = trial ? c.manageTrial : c.manageWatches;
  const handles = [...new Set(items.map(i => at(i.handle)))].join(', ');
  const lines: string[] = [c.digestIntro(items.length, handles), ''];
  const blocks: string[] = [];
  for (const i of items) {
    lines.push(...itemLines(i, c));
    blocks.push(itemBlock(i, c));
  }
  if (trial) lines.push(`${c.trialLeft(trial.daysLeft)} — ${c.keepWithPro}: ${pro}`, '');
  lines.push(`${manageLabel}: ${manage}`, `${c.stopEmails}: ${unsub}`);
  const html =
    `<p>${escapeHtml(c.digestIntro(items.length, handles))}</p>` +
    `<ul style="padding-left:18px">${blocks.join('')}</ul>` +
    (trial ? `<p><b>${escapeHtml(c.trialLeft(trial.daysLeft))}</b> — <a href="${escapeHtml(pro)}">${escapeHtml(c.keepWithPro)}</a></p>` : '') +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(manage)}">${escapeHtml(manageLabel)}</a> · <a href="${escapeHtml(unsub)}">${escapeHtml(c.stopEmails)}</a></p>`;
  return { subject: c.digestSubject(items.length, handles), text: lines.join('\n'), html: dirWrap(trial?.lang, html), headers: unsubHeaders(unsub) };
}

/* ─── Trial e-mails (language: trials.lang, see mail-copy.ts) ─── */

export function trialVerificationEmail(origin: string, handle: string, days: number, verifyToken: string, manageToken: string, lang?: string): Omit<EmailMessage, 'to'> {
  const c = mailCopy(lang);
  const link = `${origin}/api/watch/trial/verify/${verifyToken}`;
  const manage = trialManageUrl(origin, manageToken, lang);
  const text = [c.verifyIntro(days, at(handle)), '', link, '', c.verifyNote, '', `${c.verifyManageText}: ${manage}`].join('\n');
  const html =
    `<p>${escapeHtml(c.verifyIntro(days, '\u0000')).replace('\u0000', bold(handle))}</p>` +
    `<p><a href="${escapeHtml(link)}">${escapeHtml(c.verifyCta)}</a></p>` +
    `<p style="color:#666;font-size:13px">${escapeHtml(c.verifyNote)}</p>` +
    `<p style="color:#666;font-size:13px">${escapeHtml(c.verifyManageHtml('\u0000')).replace('\u0000', `<a href="${escapeHtml(manage)}">${escapeHtml(c.here)}</a>`)}</p>`;
  return { subject: c.verifySubject(at(handle)), text, html: dirWrap(lang, html) };
}

export function trialReminderEmail(
  origin: string,
  handle: string,
  daysLeft: number,
  endsAt: string,
  caught: number,
  manageToken: string,
  unsubToken: string,
  lang?: string,
): Omit<EmailMessage, 'to'> {
  const c = mailCopy(lang);
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const pro = `${origin}${proUrlPath(lang)}`;
  const manage = trialManageUrl(origin, manageToken, lang);
  const when = endsAt.slice(0, 16).replace('T', ' ') + ' UTC';
  const caughtText = caught === 0 ? c.none : c.events(caught);
  const text = [
    c.reminderIntro(at(handle), daysLeft, when, caughtText),
    '',
    `${c.reminderCta(at(handle))}: ${pro}`,
    '',
    `${c.reminderManage}: ${manage}`,
    `${c.stopEmails}: ${unsub}`,
  ].join('\n');
  const html =
    `<p>${escapeHtml(c.reminderIntro('\u0000', daysLeft, when, caughtText)).replace('\u0000', bold(handle))}</p>` +
    `<p><a href="${escapeHtml(pro)}">${escapeHtml(c.reminderCta(at(handle)))}</a></p>` +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(manage)}">${escapeHtml(c.manageTrial)}</a> · <a href="${escapeHtml(unsub)}">${escapeHtml(c.stopEmails)}</a></p>`;
  return { subject: c.reminderSubject(at(handle), daysLeft), text, html: dirWrap(lang, html), headers: unsubHeaders(unsub) };
}

export function trialEndedEmail(origin: string, handle: string, items: DigestItem[], total: number, unsubToken: string, lang?: string): Omit<EmailMessage, 'to'> {
  const c = mailCopy(lang);
  const unsub = `${origin}/api/watch/unsubscribe/${unsubToken}`;
  const pro = `${origin}${proUrlPath(lang)}`;
  const caught = total === 0 ? c.none : c.events(total);
  const lines = [c.endedIntro(at(handle)), '', c.endedCaught(caught, items.length > 0), ''];
  for (const i of items) lines.push(...itemLines(i, c));
  if (total > items.length) lines.push(c.more(total - items.length), '');
  lines.push(`${c.endedCta(at(handle))}: ${pro}`, c.endedNote(at(handle)), '', `${c.stopEmails}: ${unsub}`);
  const html =
    `<p>${escapeHtml(c.endedIntro('\u0000')).replace('\u0000', bold(handle))}</p>` +
    `<p>${escapeHtml(c.endedCaught(caught, items.length > 0))}</p>` +
    (items.length ? `<ul style="padding-left:18px">${items.map(i => itemBlock(i, c)).join('')}</ul>` : '') +
    (total > items.length ? `<p>${escapeHtml(c.more(total - items.length))}</p>` : '') +
    `<p><a href="${escapeHtml(pro)}">${escapeHtml(c.endedCta(at(handle)))}</a><br>` +
    `<span style="color:#666;font-size:13px">${escapeHtml(c.endedNote(at(handle)))}</span></p>` +
    `<p style="color:#666;font-size:13px"><a href="${escapeHtml(unsub)}">${escapeHtml(c.stopEmails)}</a></p>`;
  return { subject: c.endedSubject(at(handle)), text: lines.join('\n'), html: dirWrap(lang, html), headers: unsubHeaders(unsub) };
}
