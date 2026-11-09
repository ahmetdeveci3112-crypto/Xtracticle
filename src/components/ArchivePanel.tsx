import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Archive, Check, Download, ExternalLink, Eye, FileSpreadsheet, Info, Loader2, Mail, RotateCcw, Zap } from 'lucide-react';
import type { Strings } from '../i18n';
import { waybackProfile } from '../shared/url';
import { track } from '../lib/analytics';
import TipRow, { tipAllowed } from './TipRow';

/** Archived posts of an account (GET /api/archive/:handle), shown when a profile link is pasted. */

interface ArchivePost {
  id: string;
  date?: string;
  ts: string;
  url: string;
  snapshot: string;
  captures: number;
}
interface ArchiveResult {
  handle: string;
  posts: ArchivePost[];
  total: number;
  shown: number;
  truncated: boolean;
  partial: boolean;
  stale: boolean;
  fetchedAt: string;
}

type State = { kind: 'loading' } | { kind: 'failed' } | { kind: 'done'; data: ArchiveResult };
/** "Watch @handle" (Pro): POST /api/watch from the panel. */
type WatchState = { kind: 'idle' } | { kind: 'working' } | { kind: 'ok' } | { kind: 'exists' } | { kind: 'error'; msg: string };

/** Free Watch trial (POST /api/watch/trial, docs/watch-api.md "Trial"): e-mail form inside the free-user card. */
type TrialState =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'sent'; email: string }
  | { kind: 'error'; code: TrialErr };
type TrialErr = keyof Strings['watchTrialErr'];
interface TrialConfig { available: boolean; full: boolean; disabled: boolean; days: number }

/** Puts the handle into "@{handle}" as an isolated left-to-right run, so the @ stays in front in Arabic. */
function withHandle(s: string, handle: string) {
  return s.split('@{handle}').flatMap((part, i) => (i ? [<bdi key={i} dir="ltr">@{handle}</bdi>, part] : [part]));
}

/** Fills {name} placeholders with nodes; "@{handle}" and "{email}" become isolated LTR runs. */
function fill(s: string, vals: Record<string, string>): ReactNode[] {
  return s.split(/(@?\{\w+\})/).map((part, i) => {
    const m = part.match(/^(@?)\{(\w+)\}$/);
    if (!m || !(m[2] in vals)) return part;
    const v = m[1] + vals[m[2]];
    return m[2] === 'handle' || m[2] === 'email' ? <bdi key={i} dir="ltr">{v}</bdi> : v;
  });
}

/** GET /api/watch/trial/config, fetched once per page load and only when a free-user card is shown. */
let trialConfig: Promise<TrialConfig | null> | null = null;
function loadTrialConfig() {
  trialConfig ??= fetch('/api/watch/trial/config', { headers: { 'X-Xt-Client': 'web' } })
    .then(r => (r.ok ? r.json() : null))
    .then(c => (c && typeof c.available === 'boolean' ? { ...c, days: Number(c.days) || 14 } : null))
    .catch(() => null);
  return trialConfig;
}

const TRIAL_ERRORS = new Set<string>(['trial_used', 'trial_pending', 'bad_email', 'not_found', 'protected', 'blocklisted', 'rate', 'trial_full', 'trial_disabled', 'mail_failed', 'upstream']);

/** Handles whose free Watch card was already counted as seen (once per handle per page load). */
const watchCardSeen = new Set<string>();

const CLIENT_TIMEOUT_MS = 60_000;
const SLOW_AFTER_MS = 8_000;

const rowBtn = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium focus-ring btn-secondary whitespace-nowrap';
const rowBtnStyle = { backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' };
const linkClass = 'underline underline-offset-2 font-medium focus-ring rounded';

export default function ArchivePanel({
  handle,
  t,
  locale,
  onOpenPost,
  onDownloadLatest,
  pro = false,
  proKnown = true,
}: {
  handle: string;
  t: Strings;
  locale: string;
  /** Xtracticle Pro: the Worker returns every collected post and the CSV can be downloaded. */
  pro?: boolean;
  /** False while the Pro status is still being checked: no free-user promotion until it is known. */
  proKnown?: boolean;
  onOpenPost: (id: string, handle: string) => void;
  /** Opens batch mode with this account's latest posts (works without the Wayback list). */
  onDownloadLatest?: (handle: string) => void;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const teaserTracked = useRef(false);
  const [tipOn, setTipOn] = useState(() => tipAllowed(pro));
  const [watch, setWatch] = useState<WatchState>({ kind: 'idle' });
  const [trialCfg, setTrialCfg] = useState<TrialConfig | null | undefined>(undefined);
  const [trial, setTrial] = useState<TrialState>({ kind: 'idle' });
  const [trialEmail, setTrialEmail] = useState('');

  async function startTrial() {
    if (trial.kind === 'working') return;
    const email = trialEmail.trim();
    if (!email) {
      setTrial({ kind: 'error', code: 'bad_email' });
      return;
    }
    setTrial({ kind: 'working' });
    let code: TrialErr = 'generic';
    try {
      const res = await fetch('/api/watch/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Xt-Client': 'web' },
        body: JSON.stringify({ handle, email, mode: 'both' }),
      });
      const body = await res.json().catch(() => null);
      if (res.status === 201) {
        setTrial({ kind: 'sent', email: typeof body?.email === 'string' ? body.email : email });
        track('trial_start', { ok: true, place: 'archive_panel' });
        return;
      }
      const err: string = typeof body?.error === 'string' ? body.error : String(res.status);
      if (TRIAL_ERRORS.has(err)) code = err as TrialErr;
      else if (res.status === 429) code = 'rate';
      track('trial_start', { ok: false, error: err, place: 'archive_panel' });
    } catch {
      track('trial_start', { ok: false, error: 'network', place: 'archive_panel' });
    }
    setTrial({ kind: 'error', code });
  }

  async function startWatch() {
    setWatch({ kind: 'working' });
    const e = t.watchErr;
    try {
      const res = await fetch('/api/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Xt-Client': 'web' },
        body: JSON.stringify({ handle, mode: 'deleted' }),
      });
      const body = await res.json().catch(() => null);
      if (res.status === 201) {
        setWatch({ kind: 'ok' });
        track('watch_add', { mode: 'deleted', place: 'archive_panel' });
        return;
      }
      const err: string = typeof body?.error === 'string' ? body.error : String(res.status);
      track('watch_add_error', { error: err, place: 'archive_panel' });
      if (res.status === 409) {
        setWatch({ kind: 'exists' });
        return;
      }
      const msg =
        res.status === 503 ? e.unavailable
        : err === 'not_found' || err === 'protected' || err === 'blocklisted' ? e[err]
        : err === 'limit_reached' ? e.limit_reached.replace('{limit}', String(body?.limit ?? ''))
        : e.generic;
      setWatch({ kind: 'error', msg });
    } catch {
      track('watch_add_error', { error: 'network', place: 'archive_panel' });
      setWatch({ kind: 'error', msg: e.generic });
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const started = performance.now();
    setState({ kind: 'loading' });
    setSlow(false);
    const slowTimer = setTimeout(() => active && setSlow(true), SLOW_AFTER_MS);
    const timeout = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    (async () => {
      let data: ArchiveResult | null = null;
      try {
        // `?full=1` only keeps the Pro answer out of the browser's cache entry for the free one (the cookie decides).
        const res = await fetch(`/api/archive/${encodeURIComponent(handle)}${pro ? '?full=1' : ''}`, {
          headers: { 'X-Xt-Client': 'web' },
          signal: controller.signal,
        });
        if (res.ok) {
          const body = await res.json();
          if (Array.isArray(body?.posts)) data = body as ArchiveResult;
        }
      } catch { /* network error, timeout or unmount */ }
      clearTimeout(slowTimer);
      clearTimeout(timeout);
      if (!active) return;
      const ms = Math.round(performance.now() - started);
      if (!data) {
        setState({ kind: 'failed' });
        track('archive_search', { status: 'failed', count: 0, shown: 0, partial: false, truncated: false, ms });
        return;
      }
      setState({ kind: 'done', data });
      track('archive_search', {
        status: data.stale ? 'stale' : data.posts.length ? 'ok' : 'empty',
        count: data.total,
        shown: data.shown,
        partial: data.partial,
        truncated: data.truncated,
        ms,
      });
    })();

    return () => {
      active = false;
      clearTimeout(slowTimer);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [handle, attempt, pro]);

  const data = state.kind === 'done' ? state.data : null;
  // "Showing 50 of N": only when there really are more than we list.
  const showTeaser = !pro && !!data && (data.total > data.shown || (data.truncated && data.shown >= 50));
  useEffect(() => {
    if (showTeaser && !teaserTracked.current) {
      teaserTracked.current = true;
      track('archive_pro_teaser', { action: 'view' });
    }
  }, [showTeaser]);

  const manageLink = (
    <a href={`${t.proPath}#watch`} className={linkClass} style={{ color: 'var(--text-primary)' }}>{t.watchManage}</a>
  );
  // Free users: a small card that explains Watch; with the free trial open it carries the trial form.
  const showFreeCard = !pro && proKnown && !!data;
  useEffect(() => {
    if (!showFreeCard) return;
    let live = true;
    loadTrialConfig().then(c => live && setTrialCfg(c));
    return () => { live = false; };
  }, [showFreeCard]);
  const trialOpen = !!trialCfg && trialCfg.available && !trialCfg.full && !trialCfg.disabled;
  useEffect(() => {
    const key = handle.toLowerCase();
    // Counted once the trial config is known, so the view says which card was seen.
    if (showFreeCard && trialCfg !== undefined && !watchCardSeen.has(key)) {
      watchCardSeen.add(key);
      track('watch_cta', { action: 'view', trial: trialOpen });
    }
  }, [showFreeCard, handle, trialCfg, trialOpen]);
  // A new account in the same panel starts with an empty form.
  useEffect(() => setTrial({ kind: 'idle' }), [handle]);

  // Pro: one click watches the account for deleted posts (unchanged behaviour, now inside the card).
  const proWatch =
    watch.kind === 'ok' || watch.kind === 'exists' ? (
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1" role="status" style={{ color: 'var(--text-primary)' }}>
        <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{withHandle(watch.kind === 'ok' ? t.watchAdded : t.watchExists, handle)}</span>
        {manageLink}
      </p>
    ) : (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <button
            type="button"
            onClick={startWatch}
            disabled={watch.kind === 'working'}
            aria-busy={watch.kind === 'working'}
            className={`${rowBtn} disabled:opacity-60`}
            style={rowBtnStyle}
          >
            {watch.kind === 'working'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{withHandle(t.watchCta, handle)}</span>
          </button>
          <span style={{ color: 'var(--text-secondary)' }}>{t.watchHint}</span>
        </div>
        {watch.kind === 'error' && (
          <p role="alert" style={{ color: 'var(--error-text)' }}>
            {watch.msg}{' '}{manageLink}
          </p>
        )}
      </div>
    );

  const days = String(trialCfg?.days ?? 14);
  const seePro = (
    <a
      href={`${t.proPath}#watch`}
      className={linkClass}
      style={{ color: 'var(--text-primary)' }}
      onClick={() => track('watch_cta', { action: 'click', trial: true })}
    >
      {t.watchCardCta}
    </a>
  );
  const trialForm =
    trial.kind === 'sent' ? (
      <div className="mt-2 space-y-1" role="status">
        <p className="flex items-start gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          <Mail className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span className="min-w-0 break-words">{fill(t.watchTrialSent, { email: trial.email, handle })}</span>
        </p>
        <p className="text-xs leading-relaxed ps-6" style={{ color: 'var(--text-secondary)' }}>{t.watchTrialSentHint}</p>
      </div>
    ) : (
      // Not a <form>: the panel sits inside the hero form (App.tsx), and nested forms submit the outer one.
      <div className="mt-2 space-y-1.5">
        <label htmlFor={`xt-trial-email-${handle}`} className="sr-only">{t.watchTrialEmail}</label>
        <div className="flex flex-wrap gap-2">
          <input
            id={`xt-trial-email-${handle}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            required
            dir="ltr"
            placeholder={t.watchTrialEmail}
            value={trialEmail}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                startTrial();
              }
            }}
            onChange={e => {
              setTrialEmail(e.target.value);
              if (trial.kind === 'error') setTrial({ kind: 'idle' });
            }}
            aria-invalid={trial.kind === 'error' && trial.code === 'bad_email'}
            aria-describedby={trial.kind === 'error' ? `xt-trial-msg-${handle}` : undefined}
            className="flex-[1_1_12rem] min-w-0 px-3 py-1.5 rounded-lg text-sm focus-ring"
            style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            type="button"
            onClick={startTrial}
            disabled={trial.kind === 'working'}
            aria-busy={trial.kind === 'working'}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus-ring btn-primary disabled:opacity-60 max-w-full"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            {trial.kind === 'working'
              ? <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden="true" />
              : <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
            <span className="break-words text-start">{fill(t.watchTrialCta, { handle, days })}</span>
          </button>
        </div>
        {trial.kind === 'error' && (
          <p id={`xt-trial-msg-${handle}`} role="alert" className="text-xs leading-relaxed" style={{ color: 'var(--error-text)' }}>
            {t.watchTrialErr[trial.code]}
            {trial.code === 'trial_used' && <>{' '}{seePro}</>}
          </p>
        )}
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {t.watchTrialAfter}{' '}{!(trial.kind === 'error' && trial.code === 'trial_used') && seePro}
        </p>
      </div>
    );

  const cardStyle = { backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' };
  const watchCard = pro ? (
    <div className="p-3 rounded-lg text-xs" style={cardStyle}>{proWatch}</div>
  ) : showFreeCard ? (
    <aside
      aria-labelledby={`xt-watch-card-${handle}`}
      className="flex items-start gap-3 p-3 rounded-lg"
      style={cardStyle}
    >
      <Eye className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        <h3 id={`xt-watch-card-${handle}`} className="font-semibold text-sm break-words" style={{ color: 'var(--text-primary)' }}>
          {withHandle(t.watchCardTitle, handle)}
        </h3>
        {trialOpen ? (
          <>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fill(t.watchTrialText, { days })}</p>
            {trialForm}
          </>
        ) : (
          <>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t.watchCardText}</p>
            <a
              href={`${t.proPath}#watch`}
              className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus-ring btn-primary whitespace-nowrap"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
              onClick={() => track('watch_cta', { action: 'click' })}
            >
              {t.watchCardCta}
            </a>
          </>
        )}
      </div>
    </aside>
  ) : null;

  const fallback = (
    <a
      href={waybackProfile(handle)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={linkClass}
      style={{ color: 'var(--text-primary)' }}
      onClick={() => track('archive_open', { to: 'wayback' })}
    >
      {t.viewArchivedPosts.replace('{handle}', handle)}
    </a>
  );

  return (
    <section
      aria-live="polite"
      aria-busy={state.kind === 'loading'}
      className="mt-4 max-w-2xl mx-auto rounded-xl text-sm animate-slide-up overflow-hidden"
      style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <header className="flex items-start gap-3 p-4">
        <Archive className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="font-semibold text-base break-words min-w-0">{t.archiveTitle.replace('{handle}', handle)}</h2>
            {pro && (
              <span
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[0.7rem] font-semibold leading-tight"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
                title={t.proArchiveTag}
              >
                Pro
                <Check className="w-3 h-3" strokeWidth={3} aria-hidden="true" />
                <span className="sr-only">: {t.proArchiveTag}</span>
              </span>
            )}
          </div>
          {onDownloadLatest && (
            <button
              type="button"
              onClick={() => onDownloadLatest(handle)}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold btn-primary focus-ring"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              {t.profileDownloadLatest}
            </button>
          )}

          {state.kind === 'loading' && (
            <div className="mt-2 space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <p className="flex items-start gap-2">
                <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin" aria-hidden="true" />
                <span>{t.archiveLoading}</span>
              </p>
              {slow && <p className="ps-6">{t.archiveSlow}</p>}
            </div>
          )}

          {state.kind === 'failed' && (
            <div className="mt-2 space-y-2">
              <p className="font-medium" style={{ color: 'var(--error-text)' }} role="alert">{t.archiveFailed}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <button
                  type="button"
                  onClick={() => setAttempt(a => a + 1)}
                  className={rowBtn}
                  style={rowBtnStyle}
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  {t.archiveRetry}
                </button>
                {fallback}
              </div>
            </div>
          )}

          {data && data.posts.length === 0 && (
            <div className="mt-2 space-y-2">
              <p style={{ color: 'var(--text-secondary)' }}>{t.archiveEmpty}</p>
              {data.partial && <p style={{ color: 'var(--text-secondary)' }}>{t.archivePartial}</p>}
              <p>{fallback}</p>
            </div>
          )}

          {data && data.posts.length > 0 && (
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              {t.archiveCount.replace('{n}', data.total.toLocaleString(locale))}
              {data.total > data.shown && <> · {t.archiveShowing.replace('{n}', data.shown.toLocaleString(locale))}</>}
            </p>
          )}
        </div>
      </header>

      {data && data.posts.length > 0 && (
        <>
          {watchCard && <div className="mx-4 mb-3">{watchCard}</div>}
          {data.partial && (
            <p
              className="mx-4 mb-3 px-3 py-2 rounded-lg flex items-start gap-2"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{t.archivePartial}</span>
            </p>
          )}
          <p className="mx-4 mb-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.archiveNote}</p>
          {pro && (
            <p className="mx-4 mb-3">
              <a
                href={`/api/archive/${encodeURIComponent(handle)}.csv`}
                download={`xtracticle-archive-${handle}.csv`}
                className={rowBtn}
                style={rowBtnStyle}
                onClick={() => track('pro_csv', { count: data.shown })}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" aria-hidden="true" />
                {t.proCsv}
              </a>
            </p>
          )}

          <ul style={{ borderTop: '1px solid var(--border)' }}>
            {data.posts.map(p => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 history-item"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span className="flex-1 min-w-[7rem] font-medium tabular-nums" title={p.id}>
                  {p.date
                    ? new Date(p.date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
                    : <span style={{ color: 'var(--text-tertiary)' }}>{t.archiveUnknownDate}</span>}
                </span>
                <span className="flex flex-wrap gap-2">
                  <a
                    href={p.snapshot}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={rowBtn}
                    style={rowBtnStyle}
                    onClick={() => track('archive_open', { to: 'wayback' })}
                  >
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.archiveSnapshot}
                  </a>
                  <button
                    type="button"
                    className={rowBtn}
                    style={rowBtnStyle}
                    onClick={() => {
                      track('archive_open', { to: 'live' });
                      onOpenPost(p.id, handle);
                    }}
                  >
                    <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.archiveOpenLive}
                  </button>
                </span>
              </li>
            ))}
          </ul>

          {(showTeaser || data.stale) && (
          <div className="p-4 space-y-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {showTeaser && (
              <div className="space-y-2">
                <p>
                  {t.archiveProTeaser.replace('{n}', `${data.total.toLocaleString(locale)}${data.truncated ? '+' : ''}`)}{' '}
                  <a href={t.proPath} className={linkClass} onClick={() => track('archive_pro_teaser', { action: 'link' })}>{t.proLearnMore}</a>
                </p>
                <a
                  href={t.proPath}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus-ring btn-primary whitespace-nowrap"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
                  onClick={() => track('archive_pro_teaser', { action: 'cta' })}
                >
                  {t.proUnlockCta}
                </a>
              </div>
            )}
            {data.stale && (
              <p>{t.archiveStale.replace('{date}', new Date(data.fetchedAt).toLocaleDateString(locale))}</p>
            )}
          </div>
          )}
          {tipOn && !pro && (
            <div className="px-4 pb-4">
              <TipRow t={t} place="archive_panel" short onHide={() => setTipOn(false)} />
            </div>
          )}
        </>
      )}

      {data && data.posts.length === 0 && (watchCard || data.stale) && (
        <div className="px-4 pb-4 space-y-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {watchCard}
          {data.stale && <p>{t.archiveStale.replace('{date}', new Date(data.fetchedAt).toLocaleDateString(locale))}</p>}
        </div>
      )}
    </section>
  );
}
