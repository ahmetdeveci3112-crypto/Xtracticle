import { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, Copy, Check, Loader2 } from 'lucide-react';
import type { XDoc } from '../shared/convert';
import { fileBaseName } from '../shared/convert';
import { translations, LANGS, type Lang, type Strings } from '../i18n';
import type { ShareImageMode, ShareImageTheme } from '../lib/export';
import { track } from '../lib/analytics';

const IMG_THEME_KEY = 'xtracticle_img_theme';
const IMG_MODE_KEY = 'xtracticle_img_mode';
const LANG_KEY = 'xtracticle_lang';

function loadSetting<T>(key: string, fallback: T, valid?: readonly T[]): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (valid && !valid.includes(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function saveSetting(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore private mode */
  }
}

function resolveCardStrings(t: Strings, doc: XDoc): Strings {
  // If current UI is already non-English, or user explicitly saved a language choice, respect `t`.
  if (t !== translations.en) return t;
  const saved = loadSetting<Lang | null>(LANG_KEY, null);
  if (saved && translations[saved]) return translations[saved];

  // When visiting the root `/` English page without an explicit saved language, prefer the
  // device/browser language (e.g. Chinese iPhone) or the post's own language for the image card footer.
  const prefs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language]) : [];
  for (const p of prefs) {
    const code = p?.toLowerCase().slice(0, 2) as Lang | undefined;
    if (code && LANGS.some(l => l.code === code)) return translations[code];
  }
  const docCode = doc.lang?.toLowerCase().slice(0, 2) as Lang | undefined;
  if (docCode && LANGS.some(l => l.code === docCode)) return translations[docCode];
  return t;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface ImageShareModalProps {
  doc: XDoc;
  t: Strings;
  locale: string;
  dark: boolean;
  onClose: () => void;
}

export default function ImageShareModal({ doc, t, locale, dark, onClose }: ImageShareModalProps) {
  const [theme, setTheme] = useState<ShareImageTheme>(() =>
    loadSetting<ShareImageTheme>(IMG_THEME_KEY, dark ? 'dark' : 'light', ['light', 'dark', 'warm']),
  );
  const [mode, setMode] = useState<ShareImageMode>(() =>
    loadSetting<ShareImageMode>(IMG_MODE_KEY, 'long', ['long', 'paged']),
  );

  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [progress, setProgress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const genIdRef = useRef(0);

  const cardStrings = resolveCardStrings(t, doc);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const el = document.getElementById('xt-preview');
    if (!el) return;
    const reqId = ++genIdRef.current;
    const ctrl = new AbortController();
    setBusy(true);
    setErrorMsg(null);
    setProgress(null);
    setBlobs([]);
    setDataUrls([]);

    (async () => {
      try {
        const ex = await import('../lib/export');
        const generated = await ex.buildShareImages(doc, el, {
          theme,
          mode,
          locale,
          footerTitle: cardStrings.imgFooterTitle,
          footerSubtitle: cardStrings.imgFooterSubtitle,
          signal: ctrl.signal,
          onProgress: (done, total) => {
            if (reqId === genIdRef.current && total > 1) setProgress(`${done}/${total}`);
          },
        });
        if (reqId !== genIdRef.current || ctrl.signal.aborted) return;
        const urls = await Promise.all(generated.map(blobToDataUrl));
        if (reqId !== genIdRef.current || ctrl.signal.aborted) return;
        setBlobs(generated);
        setDataUrls(urls);
        track('download_done', { format: 'image', kind: doc.kind, pages: generated.length, theme, mode });
      } catch (err) {
        if ((err as Error)?.name === 'AbortError' || ctrl.signal.aborted) return;
        console.error(err);
        if (reqId === genIdRef.current) {
          setBlobs([]);
          setDataUrls([]);
          setErrorMsg(t.exportFailed);
        }
      } finally {
        if (reqId === genIdRef.current && !ctrl.signal.aborted) {
          setBusy(false);
          setProgress(null);
        }
      }
    })();

    return () => {
      ctrl.abort();
    };
  }, [doc, theme, mode, locale, cardStrings.imgFooterTitle, cardStrings.imgFooterSubtitle, t.exportFailed]);

  const handleThemeChange = (next: ShareImageTheme) => {
    setTheme(next);
    saveSetting(IMG_THEME_KEY, next);
  };

  const handleModeChange = (next: ShareImageMode) => {
    setMode(next);
    saveSetting(IMG_MODE_KEY, next);
  };

  const handleNativeShare = async () => {
    if (!blobs.length) return;
    const base = fileBaseName(doc);
    const files = blobs.map(
      (b, i) => new File([b], `${base}${blobs.length > 1 ? `-${i + 1}` : ''}.png`, { type: 'image/png' }),
    );
    track('share', { format: 'image', kind: doc.kind, pages: files.length });
    try {
      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: doc.title,
        });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
    }
    await handleSaveAll();
  };

  const handleCopyImage = async (index = 0) => {
    const target = blobs[index];
    if (!target) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': target })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track('copy', { format: 'image', kind: doc.kind });
    } catch {
      await handleSaveAll();
    }
  };

  const handleSaveAll = async () => {
    if (!blobs.length) return;
    const { saveBlob } = await import('../lib/export');
    const base = fileBaseName(doc);
    blobs.forEach((b, i) => {
      saveBlob(b, `${base}${blobs.length > 1 ? `-${i + 1}` : ''}.png`);
    });
    track('download', { format: 'image', kind: doc.kind, pages: blobs.length });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.shareImage}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)', backdropFilter: 'blur(4px)' }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92dvh] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden animate-slide-up"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Modal Top Bar */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="text-base font-bold">{t.shareImage}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center btn-secondary focus-ring"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            aria-label={t.bannerDismiss}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Bar: Theme + Mode */}
        <div
          className="px-5 py-3 shrink-0 text-xs"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Theme pills */}
            <div
              className="inline-flex p-0.5 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              {(
                [
                  ['light', t.imgThemeLight],
                  ['dark', t.imgThemeDark],
                  ['warm', t.imgThemeWarm],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleThemeChange(k)}
                  className="px-2.5 py-1 rounded-lg font-medium transition-colors"
                  style={
                    theme === k
                      ? { backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mode pills */}
            <div
              className="inline-flex p-0.5 rounded-xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              {(
                [
                  ['long', t.imgModeLong],
                  ['paged', t.imgModePaged],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleModeChange(k)}
                  className="px-2.5 py-1 rounded-lg font-medium transition-colors"
                  style={
                    mode === k
                      ? { backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons Bar (Top for quick iPhone reach) */}
        <div
          className="px-5 py-3 flex flex-wrap items-center gap-2 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={handleNativeShare}
            disabled={busy || !blobs.length}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold btn-primary focus-ring disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            <Share2 className="w-4 h-4" />
            {t.imgShareBtn}
            {blobs.length > 1 ? ` (${blobs.length})` : ''}
          </button>

          <button
            type="button"
            onClick={() => handleCopyImage(0)}
            disabled={busy || !blobs.length}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium btn-secondary focus-ring disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? t.imgCopied : t.imgCopyBtn}
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={busy || !blobs.length}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium btn-secondary focus-ring disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
          >
            <Download className="w-4 h-4" />
            {t.imgSaveBtn}
          </button>
        </div>

        {/* Image Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <p className="text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {t.imgHoldHint}
          </p>

          {busy && (
            <div className="py-16 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-secondary)' }}>
              <Loader2 className="w-7 h-7 animate-spin" />
              <p className="text-sm font-medium">
                {t.imgGenerating} {progress || ''}
              </p>
            </div>
          )}

          {errorMsg && !busy && (
            <p className="text-center text-sm py-8" style={{ color: 'var(--error-text)' }}>
              {errorMsg}
            </p>
          )}

          {!busy &&
            dataUrls.map((src, idx) => (
              <div key={idx} className="space-y-1.5">
                {dataUrls.length > 1 && (
                  <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-secondary)' }}>
                    <span>
                      {idx + 1} / {dataUrls.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyImage(idx)}
                      className="underline underline-offset-2"
                    >
                      {t.imgCopyBtn} #{idx + 1}
                    </button>
                  </div>
                )}
                <img
                  src={src}
                  alt={`${doc.title} (${idx + 1})`}
                  className="w-full h-auto rounded-2xl mx-auto block"
                  style={{ maxWidth: '440px', boxShadow: 'var(--shadow-md)' }}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
