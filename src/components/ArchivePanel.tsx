import { useEffect, useRef, useState } from 'react';
import { Archive, Check, Download, ExternalLink, FileSpreadsheet, Info, Loader2, RotateCcw, Zap } from 'lucide-react';
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

const CLIENT_TIMEOUT_MS = 60_000;
const SLOW_AFTER_MS = 8_000;

const rowBtn = 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium focus-ring btn-secondary whitespace-nowrap';
const rowBtnStyle = { backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)' };
const linkClass = 'underline underline-offset-2 font-medium focus-ring rounded';

const PRO_INTEREST_KEY = 'xt_pro_interest';
function readProInterest(): boolean {
  try { return localStorage.getItem(PRO_INTEREST_KEY) === '1'; } catch { return false; }
}

export default function ArchivePanel({
  handle,
  t,
  locale,
  onOpenPost,
  onDownloadLatest,
  pro = false,
}: {
  handle: string;
  t: Strings;
  locale: string;
  /** Xtracticle Pro: the Worker returns every collected post and the CSV can be downloaded. */
  pro?: boolean;
  onOpenPost: (id: string, handle: string) => void;
  /** Opens batch mode with this account's latest posts (works without the Wayback list). */
  onDownloadLatest?: (handle: string) => void;
}) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const teaserTracked = useRef(false);
  const [proInterest, setProInterest] = useState(readProInterest);
  const [tipOn, setTipOn] = useState(() => tipAllowed(pro));

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
            <div className="p-4 space-y-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {showTeaser && (
                <div className="space-y-2">
                  <p>
                    {t.archiveProTeaser.replace('{n}', `${data.total.toLocaleString(locale)}${data.truncated ? '+' : ''}`)}{' '}
                    <a href={t.proPath} className={linkClass} onClick={() => track('archive_pro_teaser', { action: 'link' })}>{t.proLearnMore}</a>
                  </p>
                  {proInterest ? (
                    <p className="flex items-start gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden="true" />
                      <span>{t.proInterestThanks}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      className={rowBtn}
                      style={rowBtnStyle}
                      onClick={() => {
                        track('pro_interest', { feature: 'archive', place: 'archive_panel' });
                        try { localStorage.setItem(PRO_INTEREST_KEY, '1'); } catch { /* ignore */ }
                        setProInterest(true);
                      }}
                    >
                      {t.proInterestButton}
                    </button>
                  )}
                </div>
              )}
              {data.stale && (
                <p>{t.archiveStale.replace('{date}', new Date(data.fetchedAt).toLocaleDateString(locale))}</p>
              )}
            </div>
          )}
          {tipOn && !pro && (
            <div className={`px-4 pb-4 ${showTeaser || data.stale ? '' : 'pt-4'}`}>
              <TipRow t={t} place="archive_panel" short onHide={() => setTipOn(false)} />
            </div>
          )}
        </>
      )}

      {data && data.posts.length === 0 && data.stale && (
        <p className="px-4 pb-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {t.archiveStale.replace('{date}', new Date(data.fetchedAt).toLocaleDateString(locale))}
        </p>
      )}
    </section>
  );
}
