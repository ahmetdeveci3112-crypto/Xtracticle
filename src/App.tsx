import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from 'react';
import {
  Download, FileText, AlertCircle, Loader2, FileDown, Moon, Sun, Copy, Check, Share2, Clock, ChevronDown,
  BookOpen, Archive, Volume2, Square, Layers, Link2, Languages, X, CirclePlay,
} from 'lucide-react';
import type { FxTweet } from './shared/fx';
import { translations, LANGS, langInfo, type Lang } from './i18n';
import { buildDoc, fileBaseName, frontMatter, type XDoc } from './shared/convert';
import { parseInput, parsePath, shareUrl } from './lib/url';
import { track } from './lib/analytics';
import { demoVideo } from './shared/demo';

// Lazy-load react-markdown + remark-gfm together (~165KB saved from initial bundle)
const LazyMarkdown = lazy(() =>
  Promise.all([import('react-markdown'), import('remark-gfm')]).then(
    ([{ default: ReactMarkdown }, { default: remarkGfm }]) => ({
      default: (props: any) => <ReactMarkdown remarkPlugins={[remarkGfm]} {...props} />,
    })
  )
);

/* ─── Page config (injected per page by the build / Worker) ─── */
type ExportKey = 'md' | 'pdf' | 'epub' | 'zip' | 'txt' | 'obsidian';
interface PageConfig {
  page?: string;
  lang?: Lang | null;
  h1?: string;
  sub?: string;
  primary?: ExportKey;
  /** This page's own path, and its versions in other languages. */
  path?: string;
  alternates?: Partial<Record<Lang, string>>;
}
declare global {
  interface Window {
    __XT__?: PageConfig;
    __XT_PRELOAD__?: { id: string; tweets: FxTweet[] };
  }
}
const PAGE: PageConfig = (typeof window !== 'undefined' && window.__XT__) || {};

/* ─── Persistence ─── */
interface HistoryItem {
  id: string;
  url: string;
  authorName: string;
  authorHandle: string;
  title: string;
  kind?: XDoc['kind'];
  timestamp: number;
}

const HISTORY_KEY = 'xtracticle_history';
const THEME_KEY = 'xtracticle_theme';
/** Explicit language choice (selector, banner or a language link) — drives redirects. */
const LANG_KEY = 'xtracticle_lang';
const BANNER_KEY = 'xtracticle_lang_banner_dismissed';
const FM_KEY = 'xtracticle_frontmatter';
const MAX_HISTORY = 20;
const MAX_BATCH = 20;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* private mode */ }
}

// Status pages (/{user}/status/{id}) reuse the English home shell, so they follow the
// visitor's preference instead of the page's language.
const ON_STATUS_PAGE = typeof window !== 'undefined' && !!parsePath(window.location.pathname);

function initialLang(): Lang {
  if (PAGE.lang && !ON_STATUS_PAGE) return PAGE.lang;
  const saved = load<Lang | null>(LANG_KEY, null);
  if (saved && LANGS.some(l => l.code === saved)) return saved;
  return browserLang() || 'en';
}

/** The first browser/device language we support, if any. */
function browserLang(): Lang | null {
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const p of prefs) {
    const match = LANGS.find(l => l.code === p?.toLowerCase().slice(0, 2));
    if (match) return match.code;
  }
  return null;
}

const isHomePath = (path: string) => LANGS.some(l => l.home === path);
const isHomeLike = (path: string) => isHomePath(path) || !!parsePath(path);

/* ─── API ─── */
class ApiError extends Error {}

async function fetchThread(id: string, fallbackMsg: string, rateLimitedMsg?: string): Promise<FxTweet[]> {
  const res = await fetch(`/api/thread/${id}`);
  if (res.status === 429) throw new ApiError(rateLimitedMsg || fallbackMsg);
  let data: any = null;
  try {
    data = await res.json();
  } catch { /* non-JSON error page */ }
  if (!res.ok || !data?.tweets?.length) throw new ApiError(fallbackMsg);
  return data.tweets as FxTweet[];
}

/* ─── App ─── */
export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const t = translations[lang];
  const locale = langInfo(lang).locale;

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweets, setTweets] = useState<FxTweet[] | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState<ExportKey | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [recent, setRecent] = useState<HistoryItem[]>(() => load(HISTORY_KEY, []));
  const [showHistory, setShowHistory] = useState(false);
  const [withFrontMatter, setWithFrontMatter] = useState<boolean>(() => load(FM_KEY, true));
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [speaking, setSpeaking] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const scrollPending = useRef(false);
  const requestRef = useRef(0);

  const doc = useMemo(() => (tweets?.length ? buildDoc(tweets, t.labels, locale) : null), [tweets, t, locale]);
  const primary: ExportKey = PAGE.primary || 'md';

  /* ─── Theme ─── */
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    root.classList.add('theme-transition');
    root.classList.toggle('dark', next);
    try { localStorage.setItem(THEME_KEY, next ? 'dark' : 'light'); } catch { /* ignore */ }
    setTimeout(() => root.classList.remove('theme-transition'), 400);
  };

  /* ─── Language ─── */
  const changeLang = (next: Lang) => {
    store(LANG_KEY, next);
    // Go to this page's version in that language (status pages only switch the UI).
    if (location.pathname === PAGE.path) return void (location.href = PAGE.alternates?.[next] || langInfo(next).home);
    setLang(next);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);


  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(f => (f === msg ? null : f)), 2000);
  };

  /* ─── Extraction ─── */
  const applyResult = useCallback((id: string, list: FxTweet[], sourceInput: string, pushUrl: boolean) => {
    setTweets(list);
    const first = list[0];
    const kind: XDoc['kind'] = first.article ? 'article' : list.length > 1 ? 'thread' : 'post';
    const item: HistoryItem = {
      id,
      url: sourceInput,
      authorName: first.author?.name || '',
      authorHandle: first.author?.screen_name || '',
      title: first.article?.title || (first.text || '').slice(0, 80),
      kind,
      timestamp: Date.now(),
    };
    setRecent(prev => {
      const next = [item, ...prev.filter(h => h.id !== id)].slice(0, MAX_HISTORY);
      store(HISTORY_KEY, next);
      return next;
    });
    if (pushUrl && isHomeLike(location.pathname) && first.author?.screen_name) {
      const path = `/${first.author.screen_name}/status/${id}`;
      if (location.pathname !== path) window.history.pushState({ id }, '', path);
    }
    scrollPending.current = true;
  }, []);

  const extract = useCallback(async (input: string, opts: { pushUrl?: boolean } = {}) => {
    setError(null);
    const parsed = parseInput(input);
    if (!parsed) {
      setError(t.invalidLink);
      track('extract_error', { reason: 'invalid_link' });
      return;
    }
    if (parsed.kind === 'article-link') {
      setError(t.articleLink);
      track('extract_error', { reason: 'article_link' });
      return;
    }
    const reqId = ++requestRef.current;
    setLoading(true);
    setTweets(null);
    try {
      const list = await fetchThread(parsed.id, t.fetchError, t.rateLimited);
      if (reqId !== requestRef.current) return;
      applyResult(parsed.id, list, input, opts.pushUrl !== false);
      const first = list[0];
      track('extract', { kind: first.article ? 'article' : list.length > 1 ? 'thread' : 'post', posts: list.length, page: PAGE.page });
    } catch (err) {
      if (reqId !== requestRef.current) return;
      setError(err instanceof ApiError ? err.message : t.networkError);
      track('extract_error', { reason: err instanceof ApiError ? 'not_found' : 'network' });
    } finally {
      if (reqId === requestRef.current) setLoading(false);
    }
  }, [t, applyResult]);

  // Deep links: /{user}/status/{id}, ?url= / ?link= / ?text= (PWA share target, bookmarklet)
  useEffect(() => {
    const fromPath = parsePath(location.pathname);
    if (fromPath) {
      const preload = window.__XT_PRELOAD__;
      const input = `https://x.com/${fromPath.handle || 'i'}/status/${fromPath.id}`;
      setUrl(input);
      if (preload?.id === fromPath.id && preload.tweets?.length) {
        applyResult(fromPath.id, preload.tweets, input, false);
        track('extract', { kind: 'preloaded', posts: preload.tweets.length, page: 'status' });
      } else {
        extract(input, { pushUrl: false });
      }
      return;
    }
    const params = new URLSearchParams(location.search);
    // Share sheets put the link in different fields (often inside `text`) — search them all.
    const shared = ['url', 'link', 'text', 'title'].map(k => params.get(k)).filter(Boolean).join(' ');
    if (shared) {
      const parsed = parseInput(shared);
      const input = parsed?.kind === 'status' ? `https://x.com/${parsed.handle || 'i'}/status/${parsed.id}` : shared;
      setUrl(input);
      window.history.replaceState(null, '', location.pathname);
      extract(input);
      track('deep_link', { source: params.has('text') || params.has('link') ? 'share_target' : 'query' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back/forward between home and /{user}/status/{id}
  useEffect(() => {
    const onPop = () => {
      const p = parsePath(location.pathname);
      if (p) {
        const input = `https://x.com/${p.handle || 'i'}/status/${p.id}`;
        setUrl(input);
        extract(input, { pushUrl: false });
      } else {
        requestRef.current++;
        setTweets(null);
        setLoading(false);
        setError(null);
        setUrl('');
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [extract]);

  useEffect(() => {
    if (doc && parsePath(location.pathname)) document.title = `${doc.title} — Xtracticle`;
  }, [doc]);

  // Bring the result into view once the card has actually rendered.
  useEffect(() => {
    if (doc && !loading && scrollPending.current) {
      scrollPending.current = false;
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [doc, loading]);

  // Stop speech when the document changes
  useEffect(() => () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); }, [doc]);
  useEffect(() => setSpeaking(false), [doc]);

  /* ─── Exports ─── */
  const markdownForFile = () => (doc ? (withFrontMatter ? frontMatter(doc) : '') + doc.md : '');
  const previewEl = () => document.getElementById('xt-preview') as HTMLElement | null;

  const runExport = async (key: ExportKey) => {
    if (!doc || busy) return;
    const base = fileBaseName(doc);
    track('download', { format: key, kind: doc.kind, page: PAGE.page });
    const started = performance.now();
    try {
      const ex = await import('./lib/export');
      if (key === 'md') ex.saveText(markdownForFile(), `${base}.md`, 'text/markdown');
      else if (key === 'txt') ex.saveText(doc.txt, `${base}.txt`);
      else if (key === 'obsidian') await ex.openInObsidian(doc.title, markdownForFile());
      else {
        setBusy(key);
        const el = previewEl();
        if (key === 'zip') ex.saveBlob(await ex.buildZip(doc, markdownForFile(), base), `${base}.zip`);
        else if (key === 'epub' && el) ex.saveBlob(await ex.buildEpub(doc, el, doc.lang || lang), `${base}.epub`);
        else if (key === 'pdf' && el)
          ex.saveBlob(await ex.buildPdf(doc, el, (done, total) => total > 2 && setProgress(`${done}/${total}`)), `${base}.pdf`);
      }
      track('download_done', { format: key, kind: doc.kind, ms: Math.round(performance.now() - started) });
    } catch (err) {
      console.error(err);
      const message = String((err as Error)?.message || err).slice(0, 100);
      track('download_error', { format: key, message, words: doc.wordCount, images: doc.images.length });
      if (key === 'pdf') {
        // Never leave the user without a PDF: fall back to the browser's own "Save as PDF".
        setError(t.pdfFallback);
        setTimeout(() => window.print(), 400);
      } else {
        setError(t.exportFailed);
      }
    } finally {
      setBusy(null);
      setProgress(null);
    }
  };

  const handleCopy = async () => {
    if (!doc) return;
    try {
      await navigator.clipboard.writeText(markdownForFile());
      showFlash('copy');
      track('copy', { kind: doc.kind });
    } catch { /* clipboard blocked */ }
  };

  const handleShare = async () => {
    if (!doc) return;
    const link = shareUrl(doc.author.handle, doc.id);
    track('share', { kind: doc.kind });
    try {
      if (navigator.share) await navigator.share({ title: doc.title, text: `${doc.title} — @${doc.author.handle}`, url: link });
      else {
        await navigator.clipboard.writeText(link);
        showFlash('share');
      }
    } catch { /* cancelled */ }
  };

  const toggleSpeech = () => {
    if (!doc || !('speechSynthesis' in window)) return;
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    // Speak paragraph by paragraph — long utterances get cut off in Chrome.
    const body = doc.txt.split('\n').filter(l => l.trim() && !/^-{5,}$/.test(l) && !/^\[.*: https?:/.test(l));
    const voiceLang = doc.lang === 'tr' ? 'tr-TR' : doc.lang && doc.lang !== 'zxx' ? doc.lang : locale;
    speechSynthesis.cancel();
    body.forEach((line, i) => {
      const u = new SpeechSynthesisUtterance(line.replace(/https?:\/\/\S+/g, ''));
      u.lang = voiceLang;
      if (i === body.length - 1) u.onend = () => setSpeaking(false);
      speechSynthesis.speak(u);
    });
    setSpeaking(true);
    track('listen', { kind: doc.kind });
  };

  const clearHistory = () => {
    setRecent([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    extract(url);
  };

  /* ─── Render helpers ─── */
  const btnBase = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium focus-ring disabled:opacity-60 disabled:cursor-wait';
  const primaryStyle = { backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' };
  const secondaryStyle = { backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' };

  const exportButton = (k: ExportKey, icon: React.ReactNode, label: string, title?: string) => (
    <button
      key={k}
      type="button"
      onClick={() => runExport(k)}
      disabled={!!busy}
      title={title}
      className={`${btnBase} ${k === primary ? 'btn-primary' : 'btn-secondary'}`}
      style={k === primary ? primaryStyle : secondaryStyle}
    >
      {busy === k ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
      {busy === k ? (progress ? `${label} ${progress}` : t.working) : label}
    </button>
  );

  const h1 = (!ON_STATUS_PAGE && PAGE.h1) || t.h1;
  // First visit, browser language differs and this page exists in it → offer to switch.
  const [bannerLang, setBannerLang] = useState<Lang | null>(() => {
    if (load(LANG_KEY, null) || load(BANNER_KEY, false) || location.pathname !== PAGE.path) return null;
    const bl = browserLang();
    return bl && bl !== PAGE.lang && PAGE.alternates?.[bl] ? bl : null;
  });
  const sub = (!ON_STATUS_PAGE && PAGE.sub) || t.sub;

  return (
    <div className="relative" style={{ color: 'var(--text-primary)' }}>
      {/* Top controls */}
      <div className="absolute top-4 end-4 z-50 flex gap-2 print:hidden">
        <label
          className="relative h-10 ps-3 pe-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold btn-secondary focus-within:ring-2"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">{t.switchLang}</span>
          <select
            value={lang}
            onChange={e => changeLang(e.target.value as Lang)}
            className="bg-transparent outline-none cursor-pointer uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            {LANGS.map(l => (
              <option key={l.code} value={l.code} style={{ color: '#0a0a0a' }}>
                {l.code.toUpperCase()} · {l.name}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center btn-secondary focus-ring"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          aria-label={t.toggleTheme}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <main className="max-w-3xl mx-auto px-5 pt-16 pb-8 md:pt-24">
        {/* Header */}
        <header className="mb-10 text-center print:hidden">
          <a href={langInfo(lang).home} className="inline-flex flex-col items-center gap-3 mb-5" aria-label="Xtracticle home">
            <span className="xt-logo">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-7 h-7" width={28} height={28} fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path>
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>Xtracticle</span>
          </a>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{h1}</h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>{sub}</p>
          <button
            type="button"
            onClick={() => {
              setDemoOpen(true);
              track('demo_open', { lang, page: PAGE.page });
            }}
            className="xt-demo-btn btn-secondary focus-ring"
          >
            <CirclePlay className="w-4 h-4" aria-hidden="true" />
            {t.watchDemo}
            <span className="xt-demo-len">0:34</span>
          </button>
        </header>

        {/* Mode switch */}
        <div className="flex justify-center mb-4 print:hidden">
          <div className="inline-flex p-1 rounded-xl text-xs font-medium" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            {(['single', 'batch'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                style={mode === m ? { backgroundColor: 'var(--bg-secondary)', boxShadow: 'var(--shadow-sm)' } : { color: 'var(--text-secondary)' }}
                aria-pressed={mode === m}
              >
                {m === 'single' ? <Link2 className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
                {m === 'single' ? t.single : t.batch}
              </button>
            ))}
          </div>
        </div>

        {mode === 'batch' ? (
          <BatchPanel lang={lang} withFrontMatter={withFrontMatter} />
        ) : (
          <>
            {/* Search Form */}
            <form onSubmit={onSubmit} className="mb-3 print:hidden">
              <div className="relative flex items-center max-w-2xl mx-auto">
                <label htmlFor="xt-url" className="sr-only">{t.placeholder}</label>
                <input
                  id="xt-url"
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onPaste={e => {
                    const pasted = e.clipboardData.getData('text');
                    if (parseInput(pasted)?.kind === 'status') {
                      e.preventDefault();
                      setUrl(pasted.trim());
                      extract(pasted);
                    }
                  }}
                  placeholder={t.placeholder}
                  className="w-full ps-5 pe-28 py-4 rounded-2xl text-base input-glow focus-ring"
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-sm)' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute end-2 top-2 bottom-2 px-6 rounded-xl font-semibold text-sm btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={primaryStyle}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.extract}
                </button>
              </div>
              {error && (
                <div
                  role="alert"
                  className="mt-4 p-4 rounded-xl flex items-start gap-3 max-w-2xl mx-auto animate-shake"
                  style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </form>
            <p className="text-center text-xs mb-8 print:hidden" style={{ color: 'var(--text-tertiary)' }}>{t.urlTip}</p>

            {/* History */}
            {recent.length > 0 && !doc && !loading && (
              <div className="max-w-2xl mx-auto mb-10 print:hidden">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm font-medium mb-3 btn-secondary px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-expanded={showHistory}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {t.history}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                </button>
                {showHistory && (
                  <div className="rounded-xl overflow-hidden animate-slide-up" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                    {recent.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setUrl(item.url);
                          setShowHistory(false);
                          extract(item.url);
                        }}
                        className="w-full text-left px-4 py-3 flex items-center gap-3 history-item"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{item.title || `@${item.authorHandle}`}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                            {item.kind ? `${t.kind[item.kind]} · ` : ''}@{item.authorHandle} · {new Date(item.timestamp).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button onClick={clearHistory} className="w-full text-center px-4 py-2.5 text-xs font-medium history-item" style={{ color: 'var(--text-tertiary)' }}>
                      {t.clear}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="card rounded-3xl p-6 md:p-10 mb-8" aria-busy="true">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full animate-pulse-subtle" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-40 rounded animate-pulse-subtle" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                    <div className="h-3 w-24 rounded animate-pulse-subtle" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
                  </div>
                </div>
                {[92, 100, 84, 96, 70].map((w, i) => (
                  <div key={i} className="h-3 rounded mb-3 animate-pulse-subtle" style={{ width: `${w}%`, backgroundColor: 'var(--bg-tertiary)' }} />
                ))}
              </div>
            )}

            {/* Result */}
            {doc && !loading && (
              <div ref={resultRef} className="card rounded-3xl p-6 md:p-10 mb-8 animate-slide-up scroll-mt-6 print:shadow-none print:border-none print:p-0">
                <div className="flex flex-col gap-5 mb-8 pb-6 print:hidden" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    {doc.author.avatar && (
                      <img
                        src={doc.author.avatar.replace('_normal', '_bigger')}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full"
                        style={{ border: '1px solid var(--border)' }}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{doc.author.name}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{doc.author.handle}</p>
                    </div>
                    <div className="w-full sm:w-auto sm:ms-auto flex flex-wrap sm:justify-end gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span className="xt-chip">{t.kind[doc.kind]}{doc.kind === 'thread' ? ` · ${doc.postCount} ${t.posts}` : ''}</span>
                      <span className="xt-chip">{doc.readingMinutes} {t.minRead}</span>
                      <span className="xt-chip hidden sm:inline-flex">{doc.wordCount.toLocaleString(locale)} {t.words}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{t.downloads}</p>
                    <div className="flex flex-wrap gap-2">
                      {exportButton('md', <Download className="w-3.5 h-3.5" />, t.md)}
                      {exportButton('pdf', <FileDown className="w-3.5 h-3.5" />, t.pdf)}
                      {exportButton('epub', <BookOpen className="w-3.5 h-3.5" />, t.epub)}
                      {exportButton('zip', <Archive className="w-3.5 h-3.5" />, t.zip)}
                      {exportButton('txt', <FileText className="w-3.5 h-3.5" />, t.txt)}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>{t.actions}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={handleCopy} className={`${btnBase} btn-secondary`} style={secondaryStyle}>
                        {flash === 'copy' ? <Check className="w-3.5 h-3.5 animate-check" /> : <Copy className="w-3.5 h-3.5" />}
                        {flash === 'copy' ? t.copied : t.copy}
                      </button>
                      {exportButton('obsidian', <ObsidianIcon />, t.obsidian, t.obsidianTitle)}
                      <button type="button" onClick={handleShare} className={`${btnBase} btn-secondary`} style={secondaryStyle}>
                        {flash === 'share' ? <Check className="w-3.5 h-3.5 animate-check" /> : <Share2 className="w-3.5 h-3.5" />}
                        {flash === 'share' ? t.linkCopied : t.share}
                      </button>
                      {'speechSynthesis' in window && (
                        <button type="button" onClick={toggleSpeech} className={`${btnBase} btn-secondary`} style={secondaryStyle} aria-pressed={speaking}>
                          {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          {speaking ? t.stop : t.listen}
                        </button>
                      )}
                    </div>
                    <label className="mt-3 inline-flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={withFrontMatter}
                        onChange={e => {
                          setWithFrontMatter(e.target.checked);
                          store(FM_KEY, e.target.checked);
                        }}
                      />
                      {t.frontMatter}
                    </label>
                  </div>
                </div>

                <article
                  id="xt-preview"
                  dir="auto"
                  lang={doc.lang && doc.lang !== 'zxx' ? doc.lang : undefined}
                  className="prose prose-neutral max-w-none prose-img:rounded-2xl prose-img:border prose-headings:tracking-tight"
                >
                  <Suspense fallback={<p style={{ color: 'var(--text-tertiary)' }}>{t.loadingPreview}</p>}>
                    <LazyMarkdown
                      components={{
                        img: ({ node, ...props }: any) => (
                          <img {...props} loading="lazy" referrerPolicy="no-referrer" style={{ borderColor: 'var(--border)' }} />
                        ),
                        a: ({ node, ...props }: any) => <a {...props} target="_blank" rel="noopener noreferrer nofollow" />,
                      }}
                    >
                      {doc.md}
                    </LazyMarkdown>
                  </Suspense>
                </article>
              </div>
            )}
          </>
        )}
      </main>

      {demoOpen && <DemoModal lang={lang} closeLabel={t.closeDemo} onClose={() => setDemoOpen(false)} />}

      {bannerLang && (
        <div
          role="dialog"
          aria-live="polite"
          lang={bannerLang}
          className="fixed bottom-4 inset-x-4 z-50 mx-auto max-w-md p-4 rounded-2xl flex items-center gap-3 animate-slide-up print:hidden"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
        >
          <Languages className="w-5 h-5 shrink-0" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
          <p className="text-sm flex-1">{translations[bannerLang].bannerText}</p>
          <button
            type="button"
            onClick={() => {
              track('language_switch', { from: PAGE.lang, to: bannerLang, via: 'banner' });
              changeLang(bannerLang);
            }}
            className="px-3 py-2 rounded-lg text-sm font-semibold btn-primary whitespace-nowrap"
            style={primaryStyle}
          >
            {translations[bannerLang].bannerCta}
          </button>
          <button
            type="button"
            onClick={() => {
              store(BANNER_KEY, true);
              setBannerLang(null);
            }}
            className="p-1.5 rounded-lg btn-secondary"
            aria-label={translations[bannerLang].bannerDismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Demo video (loads only when opened) ─── */
function DemoModal({ lang, closeLabel, onClose }: { lang: Lang; closeLabel: string; onClose: () => void }) {
  const v = demoVideo(lang);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xtracticle demo"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute -top-11 end-0 p-2 rounded-lg text-white/90 hover:text-white focus-ring"
        >
          <X className="w-6 h-6" />
        </button>
        <video
          src={v.src}
          poster={v.poster}
          controls
          autoPlay
          playsInline
          className="w-full rounded-2xl"
          style={{ aspectRatio: '16 / 9', backgroundColor: '#000' }}
          onEnded={() => track('demo_complete', { lang })}
        >
          <track kind="captions" src={v.track.src} srcLang={v.track.srclang} label={v.track.label} default />
        </video>
      </div>
    </div>
  );
}

function ObsidianIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor" aria-hidden="true">
      <path d="M8.4 2.3 5.2 8.9c-.3.6-.3 1.3 0 1.9l1.6 3.3c.5 1 .6 2.1.4 3.2l-.4 2.1c-.2 1 .8 1.8 1.8 1.4l5.7-2.6c.6-.3 1.1-.7 1.4-1.3l2.9-5.4c.4-.7.3-1.6-.2-2.2L12.6 2.2c-1.2-1.3-3.4-1.1-4.2.1Z" />
    </svg>
  );
}

/* ─── Batch mode ─── */
function BatchPanel({ lang, withFrontMatter }: { lang: Lang; withFrontMatter: boolean }) {
  const t = translations[lang];
  const locale = langInfo(lang).locale;
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [results, setResults] = useState<{ input: string; ok: boolean; title?: string }[]>([]);

  const run = async () => {
    const seen = new Set<string>();
    const jobs = text
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(input => ({ input, parsed: parseInput(input) }))
      .filter(j => j.parsed?.kind === 'status' && !seen.has(j.parsed.id) && !!seen.add(j.parsed.id))
      .slice(0, MAX_BATCH);
    if (!jobs.length) {
      setProgress(t.invalidLink);
      return;
    }
    setRunning(true);
    setResults([]);
    const out: { base: string; markdown: string }[] = [];
    const res: { input: string; ok: boolean; title?: string }[] = [];
    let done = 0;
    let next = 0;
    const worker = async () => {
      while (next < jobs.length) {
        const job = jobs[next++];
        try {
          const list = await fetchThread((job.parsed as { id: string }).id, t.fetchError, t.rateLimited);
          const doc = buildDoc(list, t.labels, locale);
          out.push({ base: fileBaseName(doc), markdown: (withFrontMatter ? frontMatter(doc) : '') + doc.md });
          res.push({ input: job.input, ok: true, title: doc.title });
        } catch {
          res.push({ input: job.input, ok: false });
        }
        setProgress(t.batchProgress(++done, jobs.length));
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (out.length) {
      const ex = await import('./lib/export');
      ex.saveBlob(await ex.buildBatchZip(out), `xtracticle-${new Date().toISOString().slice(0, 10)}.zip`);
    }
    setResults(res);
    setProgress(t.batchDone(out.length, jobs.length - out.length));
    setRunning(false);
    track('batch_extract', { requested: jobs.length, ok: out.length });
  };

  return (
    <div className="max-w-2xl mx-auto mb-10 print:hidden">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={t.batchPlaceholder}
        aria-label={t.batchPlaceholder}
        rows={6}
        className="w-full p-4 rounded-2xl text-sm font-mono input-glow focus-ring resize-y"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm btn-primary focus-ring disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
          {t.batchRun}
        </button>
        {progress && <span className="text-sm" style={{ color: 'var(--text-secondary)' }} aria-live="polite">{progress}</span>}
      </div>
      {results.length > 0 && (
        <ul className="mt-4 text-sm space-y-1">
          {results.map(r => (
            <li key={r.input} className="truncate" style={{ color: r.ok ? 'var(--text-secondary)' : 'var(--error-text)' }}>
              {r.ok ? '✓' : '✗'} {r.title || r.input}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
