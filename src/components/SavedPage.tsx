import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, Archive, ArrowLeft, Check, Copy, Download, ExternalLink, FileJson, FileSpreadsheet, FileText, Loader2, Lock, Puzzle, Search, Trash2,
} from 'lucide-react';
import { savedText, translations, langInfo, type Lang } from '../i18n';
import type { SavedSummary } from '../shared/bridge';
import { buildDoc, fileBaseName, frontMatter, type XDoc } from '../shared/convert';
import { archiveLinks } from '../shared/url';
import { countEvent, track } from '../lib/analytics';
import {
  EXT_STORE_URL,
  createBridgeClient,
  extInstalled,
  isDesktopChromiumNow,
  listAllSaved,
  parseSavedHash,
  storeUrl,
  type BridgeClient,
} from '../lib/ext';
import { canOpen, exportScope, freeGoneIds, handleOf, isGone, postToTweets, postUrl, searchSummaries, summariesCsv } from '../lib/saved';
import DocPreview from './DocPreview';

/**
 * /saved — the bookmark copies the browser extension keeps in this browser (docs/chrome-extension-plan.md, A5).
 *
 * Data comes only over the extension bridge (src/lib/ext.ts) into page memory: summaries 200 at a time,
 * a full post only when it is opened or exported. Nothing is written to localStorage, the server or the URL
 * (the URL holds `?view=removed` and `#id=<post id>` only). No GA here: `track()` sends whitelisted names
 * to the anonymous Worker counter.
 *
 * Free / Pro (owner decisions 2 and 3): exports hold the latest 100 for free, everything with Pro; of the
 * unavailable copies, the list, archive links and the 3 newest full copies are free, the rest and their export Pro.
 */

type Phase = 'detect' | 'noext' | 'loading' | 'ready' | 'error';
type View = 'all' | 'removed';
type ExportKind = 'zip' | 'md' | 'json' | 'csv';

const PAGE_SIZE = 50;
const FETCH_CONCURRENCY = 4;

const readView = (): View => (new URLSearchParams(location.search).get('view') === 'removed' ? 'removed' : 'all');
const today = () => new Date().toISOString().slice(0, 10);

const btnBase = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium focus-ring disabled:opacity-60 disabled:cursor-wait';
const secondaryStyle = { backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' };
const primaryStyle = { backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' };
const linkClass = 'underline underline-offset-2 font-medium rounded focus-ring';

export default function SavedPage({ lang, pro }: { lang: Lang; pro: boolean }) {
  const s = savedText[lang];
  const t = translations[lang];
  const locale = langInfo(lang).locale;

  const client = useRef<BridgeClient | null>(null);
  const toDoc = useCallback(
    (post: Record<string, unknown> | null): XDoc | null => {
      const tweets = postToTweets(post);
      if (!tweets) return null;
      try {
        return buildDoc(tweets, t.labels, locale);
      } catch {
        return null;
      }
    },
    [t, locale],
  );
  const [phase, setPhase] = useState<Phase>('detect');
  const [bridgeUp, setBridgeUp] = useState(false);
  const [view, setView] = useState<View>(readView);
  const [items, setItems] = useState<SavedSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [openId, setOpenId] = useState<string | null>(() => parseSavedHash(location.hash));
  const [exporting, setExporting] = useState<ExportKind | null>(null);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const loadRun = useRef(0);
  const opened = useRef(false);

  useEffect(() => {
    let live = true;
    void extInstalled(1200).then(ok => {
      if (!live) return;
      if (!ok) return setPhase('noext');
      try {
        client.current = createBridgeClient();
        setPhase('loading');
        setBridgeUp(true);
      } catch {
        setPhase('error');
      }
    });
    return () => {
      live = false;
      client.current?.close();
      client.current = null;
    };
  }, []);

  const load = useCallback(async (v: View) => {
    const c = client.current;
    if (!c) return;
    const run = ++loadRun.current;
    setPhase('loading');
    setItems([]);
    setTotal(0);
    try {
      await listAllSaved(c, v === 'removed' ? 'removed' : 'all', (list, n) => {
        if (run !== loadRun.current) return;
        setItems(list);
        setTotal(n);
      });
      if (run !== loadRun.current) return;
      setPhase('ready');
      if (!opened.current) {
        opened.current = true;
        countEvent('saved_open');
      }
    } catch {
      if (run === loadRun.current) setPhase('error');
    }
  }, []);

  // (Re)load whenever the bridge is up or the view changes.
  useEffect(() => {
    if (bridgeUp) void load(view);
  }, [bridgeUp, view, load]);

  useEffect(() => {
    const onHash = () => setOpenId(parseSavedHash(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const switchView = (v: View) => {
    if (v === view) return;
    history.replaceState(null, '', location.pathname + (v === 'removed' ? '?view=removed' : ''));
    setOpenId(null);
    setView(v);
    setPageNo(0);
  };

  const free = useMemo(() => freeGoneIds(items), [items]);
  const shown = useMemo(() => searchSummaries(items, q), [items, q]);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const page = Math.min(pageNo, pages - 1);
  const rows = shown.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  useEffect(() => setPageNo(0), [q]);

  /* ─── Export ─── */
  const runExport = async (kind: ExportKind) => {
    const c = client.current;
    if (!c || exporting) return;
    const scope = exportScope(shown, pro, free);
    if (!scope.length) return;
    setExporting(kind);
    setNote(null);
    track('download', { format: `saved_${kind}` });
    try {
      const ex = await import('../lib/export');
      const base = `xtracticle-saved-${today()}`;
      if (kind === 'csv') {
        ex.saveText(summariesCsv(scope), `${base}.csv`, 'text/csv');
        setNote({ text: s.exportDone.replace('{n}', String(scope.length)), ok: true });
        return;
      }
      const posts: { summary: SavedSummary; post: Record<string, unknown> }[] = [];
      let done = 0;
      let next = 0;
      setNote({ text: s.exportProgress.replace('{done}', '0').replace('{total}', String(scope.length)), ok: true });
      const worker = async () => {
        while (next < scope.length) {
          const summary = scope[next++];
          try {
            const post = await c.getSaved(summary.id);
            if (post) posts.push({ summary, post });
          } catch { /* skipped */ }
          done++;
          setNote({ text: s.exportProgress.replace('{done}', String(done)).replace('{total}', String(scope.length)), ok: true });
        }
      };
      await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker));
      // Keep the list order, not the order the answers came back in.
      const order = new Map(scope.map((x, i) => [x.id, i]));
      posts.sort((a, b) => order.get(a.summary.id)! - order.get(b.summary.id)!);

      if (kind === 'json') {
        const json = JSON.stringify(posts.map(p => ({ ...p.summary, url: postUrl(p.summary), post: p.post })), null, 2);
        ex.saveText(json, `${base}.json`, 'application/json');
      } else {
        const docs: { base: string; markdown: string }[] = [];
        for (const p of posts) {
          const doc = toDoc(p.post);
          if (doc) docs.push({ base: fileBaseName(doc), markdown: frontMatter(doc) + doc.md });
        }
        if (kind === 'zip') ex.saveBlob(await ex.buildBatchZip(docs), `${base}.zip`);
        else ex.saveText(docs.map(d => d.markdown).join('\n\n---\n\n'), `${base}.md`, 'text/markdown');
      }
      setNote({ text: s.exportDone.replace('{n}', String(posts.length)), ok: true });
    } catch {
      setNote({ text: s.exportFailed, ok: false });
    } finally {
      setExporting(null);
    }
  };


  const openItem = (id: string) => {
    location.hash = `id=${id}`;
  };
  const closeItem = () => {
    if (parseSavedHash(location.hash)) history.pushState(null, '', location.pathname + location.search);
    setOpenId(null);
  };

  /* ─── Render ─── */
  if (phase === 'detect') return null;
  if (phase === 'noext') return <NoExtension lang={lang} />;

  if (openId) {
    const summary = items.find(x => x.id === openId) || null;
    // Wait for the list: whether a copy may be opened depends on its state (free / Pro).
    if (!summary)
      return (
        <div className="mb-10">
          <button type="button" onClick={closeItem} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium rounded focus-ring" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            {s.back}
          </button>
          {phase === 'ready' || phase === 'error' ? (
            <p role="alert" className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
              {phase === 'error' ? s.noAnswer : s.notFound}
            </p>
          ) : (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>{s.loading}</p>
          )}
        </div>
      );
    return (
      <SavedItem
        key={openId}
        id={openId}
        summary={summary}
        allowed={canOpen(summary, pro, free)}
        lang={lang}
        client={client.current}
        toDoc={toDoc}
        onBack={closeItem}
        onDeleted={id => {
          setItems(list => list.filter(x => x.id !== id));
          setTotal(n => Math.max(0, n - 1));
          closeItem();
          setNote({ text: s.deleted, ok: true });
        }}
      />
    );
  }

  const scopeCount = exportScope(shown, pro, free).length;
  const exportLocked = !pro && view === 'removed';

  return (
    <div className="max-w-2xl mx-auto mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex p-1 rounded-xl text-xs font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }} role="group">
          {(['all', 'removed'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => switchView(v)}
              className="px-3 py-1.5 rounded-lg"
              style={view === v ? { backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' } : { color: 'var(--text-secondary)' }}
              aria-pressed={view === v}
            >
              {v === 'all' ? s.viewAll : s.viewRemoved}
            </button>
          ))}
        </div>
        {phase !== 'error' && (
          <p className="text-sm tabular-nums" style={{ color: 'var(--text-secondary)' }} aria-live="polite">
            {phase === 'loading' && <Loader2 className="inline w-3.5 h-3.5 me-1.5 animate-spin" aria-hidden="true" />}
            {s.count.replace('{n}', (phase === 'loading' ? items.length : total || items.length).toLocaleString(locale))}
          </p>
        )}
      </div>

      <label className="relative block mb-4">
        <span className="sr-only">{s.search}</span>
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={s.search}
          autoComplete="off"
          className="w-full ps-11 pe-4 py-3 rounded-2xl text-sm input-glow focus-ring"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
      </label>

      {view === 'removed' && <p className="text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>{s.unavailableNote}</p>}

      {phase === 'error' && (
        <div role="alert" className="p-4 rounded-xl flex items-start gap-3 mb-4" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-sm">
            <p className="font-medium">{s.noAnswer}</p>
            <button type="button" className={`${linkClass} mt-2`} onClick={() => void load(view)}>{s.retry}</button>
          </div>
        </div>
      )}

      {phase === 'loading' && !items.length && (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>{s.loading}</p>
      )}

      {phase === 'ready' && !items.length && (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>{view === 'removed' ? s.emptyRemoved : s.empty}</p>
      )}

      {items.length > 0 && !shown.length && (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>{s.noMatch.replace('{q}', q.trim())}</p>
      )}

      {rows.length > 0 && (
        <ul className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }} data-saved-list>
          {rows.map(item => (
            <Row key={item.id} item={item} lang={lang} locale={locale} allowed={canOpen(item, pro, free)} onOpen={() => openItem(item.id)} />
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-3 flex items-center justify-center gap-3 text-sm" aria-label={s.page.replace('{p}', String(page + 1)).replace('{n}', String(pages))}>
          <button type="button" className={`${btnBase} btn-secondary`} style={secondaryStyle} disabled={page === 0} onClick={() => setPageNo(page - 1)}>
            {s.prev}
          </button>
          <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {s.page.replace('{p}', String(page + 1)).replace('{n}', String(pages))}
          </span>
          <button type="button" className={`${btnBase} btn-secondary`} style={secondaryStyle} disabled={page >= pages - 1} onClick={() => setPageNo(page + 1)}>
            {s.next}
          </button>
        </nav>
      )}

      {!pro && view === 'removed' && items.some(x => !canOpen(x, false, free)) && (
        <ProNote text={s.locked} cta={s.proCta} href={t.proPath} />
      )}

      {items.length > 0 && (
        <section className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{s.exportH}</p>
          {exportLocked ? (
            <ProNote text={s.exportRemovedPro} cta={s.proCta} href={t.proPath} />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {([
                  ['zip', <Archive key="i" className="w-3.5 h-3.5" />, s.exportZip],
                  ['md', <Download key="i" className="w-3.5 h-3.5" />, s.exportMd],
                  ['json', <FileJson key="i" className="w-3.5 h-3.5" />, s.exportJson],
                  ['csv', <FileSpreadsheet key="i" className="w-3.5 h-3.5" />, s.exportCsv],
                ] as const).map(([k, icon, label], i) => (
                  <button
                    key={k}
                    type="button"
                    disabled={!!exporting || phase !== 'ready' || !scopeCount}
                    onClick={() => void runExport(k)}
                    className={`${btnBase} ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}
                    style={i === 0 ? primaryStyle : secondaryStyle}
                  >
                    {exporting === k ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {(pro ? s.exportPro : s.exportFree).replace('{n}', shown.length.toLocaleString(locale))}
                {!pro && (
                  <>
                    {' '}
                    <a href={t.proPath} className={linkClass}>{s.proCta}</a>
                  </>
                )}
              </p>
            </>
          )}
        </section>
      )}

      {note && (
        <p className="mt-3 text-sm" role="status" style={{ color: note.ok ? 'var(--text-secondary)' : 'var(--error-text)' }}>{note.text}</p>
      )}

      <p className="mt-8 text-xs flex items-start gap-2" style={{ color: 'var(--text-tertiary)' }}>
        <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        <span>{s.privacy}</span>
      </p>
    </div>
  );
}

function ProNote({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <p className="mt-4 px-3 py-2.5 rounded-lg text-sm flex items-start gap-2" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
      <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
      <span>
        {text}{' '}
        <a href={href} className={linkClass} style={{ color: 'var(--text-primary)' }}>{cta}</a>
      </span>
    </p>
  );
}

function ArchiveLinks({ item }: { item: SavedSummary }) {
  const a = archiveLinks(item.id, handleOf(item) || 'i');
  const cls = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium btn-secondary focus-ring';
  return (
    <>
      <a href={a.wayback} target="_blank" rel="noopener noreferrer nofollow" className={cls} style={secondaryStyle}>
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
        Wayback Machine
      </a>
      <a href={a.archiveToday} target="_blank" rel="noopener noreferrer nofollow" className={cls} style={secondaryStyle}>
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
        archive.today
      </a>
    </>
  );
}

function Row({ item, lang, locale, allowed, onOpen }: { item: SavedSummary; lang: Lang; locale: string; allowed: boolean; onOpen: () => void }) {
  const s = savedText[lang];
  const gone = isGone(item.state);
  const date = Date.parse(item.date);
  const handle = handleOf(item);
  return (
    <li className="px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 history-item" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="min-w-0 flex-1 basis-60">
        <p className="text-sm font-medium truncate" dir="auto">{item.title || (handle ? `@${handle}` : item.id)}</p>
        <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
          <bdi dir="ltr">{handle ? `@${handle}` : item.author}</bdi>
          {Number.isFinite(date) && <> · {new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}</>}
          {item.state !== 'active' && (
            <>
              {' · '}
              <span style={{ color: gone ? 'var(--error-text)' : undefined }}>{s.state[item.state]}</span>
            </>
          )}
        </p>
      </div>
      <span className="flex flex-wrap gap-2">
        {gone && <ArchiveLinks item={item} />}
        {allowed ? (
          <button type="button" onClick={onOpen} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold btn-secondary focus-ring" style={secondaryStyle}>
            <FileText className="w-3 h-3" aria-hidden="true" />
            {s.open}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs" style={{ color: 'var(--text-tertiary)' }} title={s.locked}>
            <Lock className="w-3 h-3" aria-hidden="true" />
            Pro
          </span>
        )}
      </span>
    </li>
  );
}

function SavedItem({
  id, summary, allowed, lang, client, toDoc, onBack, onDeleted,
}: {
  id: string;
  summary: SavedSummary;
  allowed: boolean;
  lang: Lang;
  client: BridgeClient | null;
  toDoc: (post: Record<string, unknown> | null) => XDoc | null;
  onBack: () => void;
  onDeleted: (id: string) => void;
}) {
  const s = savedText[lang];
  const t = translations[lang];
  const [doc, setDoc] = useState<XDoc | null | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!allowed || !client) return;
    let live = true;
    client.getSaved(id).then(
      post => live && setDoc(toDoc(post)),
      () => live && setFailed(true),
    );
    return () => void (live = false);
  }, [id, allowed, client, toDoc]);

  useEffect(() => {
    if (doc) document.title = `${doc.title} — Xtracticle`;
    return () => void (document.title = s.title);
  }, [doc, s.title]);

  const markdown = doc ? frontMatter(doc) + doc.md : '';
  const handle = doc?.author.handle || handleOf(summary) || 'i';
  const gone = isGone(summary.state);

  return (
    <div className="mb-10">
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium rounded focus-ring" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
        {s.back}
      </button>

      {!allowed && (
        <div className="card rounded-3xl p-6 md:p-8">
          <p className="font-medium mb-2" dir="auto">{summary.title || `@${handle}`}</p>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{s.unavailableNote}</p>
          <div className="flex flex-wrap gap-2">
            <ArchiveLinks item={summary} />
          </div>
          <ProNote text={s.locked} cta={s.proCta} href={t.proPath} />
        </div>
      )}

      {allowed && (failed || doc === null) && (
        <p role="alert" className="p-4 rounded-xl text-sm" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
          {failed ? s.noAnswer : s.notFound}
        </p>
      )}

      {allowed && doc === undefined && !failed && (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 className="inline w-4 h-4 me-1.5 animate-spin" aria-hidden="true" />
          {t.loadingPreview}
        </p>
      )}

      {allowed && doc && (
        <div className="card rounded-3xl p-6 md:p-10 animate-slide-up">
          <div className="flex flex-col gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="min-w-0">
              <p className="font-semibold truncate">{doc.author.name}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <bdi dir="ltr">@{doc.author.handle}</bdi>
                {summary.state !== 'active' && <> · <span style={{ color: gone ? 'var(--error-text)' : undefined }}>{s.state[summary.state]}</span></>}
              </p>
            </div>
            {gone && (
              <div className="flex flex-wrap gap-2">
                <ArchiveLinks item={summary} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`${btnBase} btn-primary`}
                style={primaryStyle}
                onClick={async () => {
                  track('download', { format: 'saved_md' });
                  const ex = await import('../lib/export');
                  ex.saveText(markdown, `${fileBaseName(doc)}.md`, 'text/markdown');
                }}
              >
                <Download className="w-3.5 h-3.5" />
                {t.md}
              </button>
              <button
                type="button"
                className={`${btnBase} btn-secondary`}
                style={secondaryStyle}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(markdown);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    track('copy', { kind: doc.kind });
                  } catch { /* clipboard blocked */ }
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5 animate-check" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t.copied : t.copy}
              </button>
              {!gone && (
                <a href={`/${handle}/status/${id}`} className={`${btnBase} btn-secondary`} style={secondaryStyle}>
                  <FileText className="w-3.5 h-3.5" />
                  {s.openOnSite}
                </a>
              )}
              {!gone && (
                <a href={`https://x.com/${handle}/status/${id}`} target="_blank" rel="noopener noreferrer" className={`${btnBase} btn-secondary`} style={secondaryStyle}>
                  <ExternalLink className="w-3.5 h-3.5" />
                  {s.openOnX}
                </a>
              )}
              {!confirm ? (
                <button type="button" className={`${btnBase} btn-secondary`} style={secondaryStyle} onClick={() => setConfirm(true)}>
                  <Trash2 className="w-3.5 h-3.5" />
                  {s.deleteCopy}
                </button>
              ) : (
                <span className="inline-flex flex-wrap items-center gap-2 text-sm" role="group">
                  <span style={{ color: 'var(--text-secondary)' }}>{s.deleteConfirm}</span>
                  <button
                    type="button"
                    className={`${btnBase}`}
                    style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
                    onClick={() => {
                      client?.deleteSaved([id]);
                      onDeleted(id);
                    }}
                  >
                    {s.deleteYes}
                  </button>
                  <button type="button" className={`${btnBase} btn-secondary`} style={secondaryStyle} onClick={() => setConfirm(false)}>
                    {s.cancel}
                  </button>
                </span>
              )}
            </div>
          </div>
          <DocPreview doc={doc} id="xt-saved-preview" loadingLabel={t.loadingPreview} />
        </div>
      )}
    </div>
  );
}

function NoExtension({ lang }: { lang: Lang }) {
  const s = savedText[lang];
  const href = storeUrl('saved');
  const desktop = isDesktopChromiumNow();
  return (
    <div className="max-w-2xl mx-auto mb-10 card rounded-3xl p-6 md:p-8" data-saved-noext>
      <div className="flex items-start gap-3">
        <Puzzle className="w-6 h-6 shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-xl font-semibold mb-2">{s.noExtH}</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{s.noExtText}</p>
          {EXT_STORE_URL && href && desktop ? (
            <a href={href} target="_blank" rel="noopener" className={`${btnBase} btn-primary`} style={primaryStyle}>
              <Puzzle className="w-3.5 h-3.5" aria-hidden="true" />
              {s.ctaInstall}
            </a>
          ) : (
            !EXT_STORE_URL && <p className="text-sm font-medium">{s.noExtSoon}</p>
          )}
          <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{s.noExtBrowser}</p>
        </div>
      </div>
    </div>
  );
}
