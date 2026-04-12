import { useState, useEffect, useCallback } from 'react';
import { Download, FileText, AlertCircle, Loader2, FileDown, Moon, Sun, Copy, Check, Share2, Clock, X, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import html2pdf from 'html2pdf.js';

/* ─── Translations ─── */
const translations = {
  en: {
    title: "Xtracticle",
    description: "Download long-form articles and threads from X as Markdown, Text, or PDF.",
    placeholder: "Paste an X post link here…",
    fetch: "Extract",
    invalidLink: "Please enter a valid X post link.",
    fetchError: "Could not fetch the article.",
    errorOccurred: "An error occurred.",
    unknownAuthor: "Unknown Author",
    unknown: "unknown",
    articlePrefix: "Article: @",
    author: "Author:",
    date: "Date:",
    downloadMd: ".MD",
    downloadTxt: ".TXT",
    savePdf: "PDF",
    copyMd: "Copy",
    copied: "Copied!",
    share: "Share",
    attachedImages: "Attached Images",
    image: "Image",
    history: "Recent",
    clearHistory: "Clear",
    noHistory: "No recent extractions",
    threadDetected: "This post is part of a thread.",
    loadThread: "Load Full Thread",
    loadingThread: "Loading thread…",
    threadLoaded: "posts loaded",
  },
  tr: {
    title: "Xtracticle",
    description: "X'teki uzun makaleleri ve flood'ları Markdown, Metin veya PDF olarak indirin.",
    placeholder: "Bir X gönderi linkini buraya yapıştırın…",
    fetch: "Çıkar",
    invalidLink: "Geçerli bir X gönderi linki giriniz.",
    fetchError: "Makale alınamadı.",
    errorOccurred: "Bir hata oluştu.",
    unknownAuthor: "Bilinmeyen Yazar",
    unknown: "bilinmeyen",
    articlePrefix: "Makale: @",
    author: "Yazar:",
    date: "Tarih:",
    downloadMd: ".MD",
    downloadTxt: ".TXT",
    savePdf: "PDF",
    copyMd: "Kopyala",
    copied: "Kopyalandı!",
    share: "Paylaş",
    attachedImages: "Ekli Görseller",
    image: "Görsel",
    history: "Son Çıkarımlar",
    clearHistory: "Temizle",
    noHistory: "Henüz çıkarım yapılmadı",
    threadDetected: "Bu gönderi bir flood'un parçası.",
    loadThread: "Tüm Flood'u Yükle",
    loadingThread: "Flood yükleniyor…",
    threadLoaded: "gönderi yüklendi",
  }
};

/* ─── Types ─── */
interface TweetData {
  text: string;
  author: {
    name: string;
    screen_name: string;
    avatar_url: string;
  };
  created_at: string;
  replying_to_status?: string;
  media?: {
    photos?: { url: string }[];
    videos?: { url: string }[];
  };
  article?: {
    title: string;
    content: {
      blocks: {
        text: string;
        type: string;
        entityRanges?: { offset: number; length: number; key: number }[];
        inlineStyleRanges?: { offset: number; length: number; style: string }[];
      }[];
      entityMap?: any;
    };
    media_entities?: {
      media_id?: string;
      media_info?: {
        original_img_url?: string;
        preview_image?: { original_img_url?: string };
        variants?: any[];
      };
    }[];
  };
}

interface HistoryItem {
  id: string;
  url: string;
  authorName: string;
  authorHandle: string;
  title: string;
  timestamp: number;
}

/* ─── Helpers ─── */
const HISTORY_KEY = 'xtracticle_history';
const THEME_KEY = 'xtracticle_theme';
const MAX_HISTORY = 10;
const MAX_THREAD_DEPTH = 25;

function getStoredHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

function getStoredTheme(): 'dark' | 'light' | null {
  try {
    return localStorage.getItem(THEME_KEY) as any;
  } catch { return null; }
}

/* ─── App ─── */
export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweetData, setTweetData] = useState<TweetData | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [plainTextContent, setPlainTextContent] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'tr'>('en');
  const [dark, setDark] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(getStoredHistory());
  const [showHistory, setShowHistory] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadCount, setThreadCount] = useState(0);

  // Language detection
  useEffect(() => {
    if (navigator.language.startsWith('tr')) setLang('tr');
  }, []);

  // Theme initialization
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.classList.add('theme-transition');
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 400);
  };

  const t = translations[lang];

  const extractTweetId = (inputUrl: string) => {
    const match = inputUrl.match(/(?:x\.com|twitter\.com)\/(?:#!\/)?\w+\/status(?:es)?\/(\d+)/);
    return match ? match[1] : null;
  };

  const fetchTweet = async (tweetId: string): Promise<TweetData> => {
    const res = await fetch(`/api/tweet/${tweetId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t.fetchError);
    return data;
  };

  const handleFetch = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setTweetData(null);
    setMarkdownContent('');
    setPlainTextContent('');
    setThreadCount(0);

    const targetUrl = overrideUrl || url;
    const tweetId = extractTweetId(targetUrl);
    if (!tweetId) {
      setError(t.invalidLink);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchTweet(tweetId);
      setTweetData(data);
      generateMarkdown(data);

      // Save to history
      const title = data.article?.title || data.text?.slice(0, 60) || '';
      const item: HistoryItem = {
        id: tweetId,
        url: targetUrl,
        authorName: data.author?.name || t.unknownAuthor,
        authorHandle: data.author?.screen_name || t.unknown,
        title,
        timestamp: Date.now(),
      };
      const updated = [item, ...history.filter(h => h.id !== tweetId)].slice(0, MAX_HISTORY);
      setHistory(updated);
      saveHistory(updated);
    } catch (err: any) {
      setError(err.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  // Thread loading
  const loadThread = async () => {
    if (!tweetData?.replying_to_status) return;
    setThreadLoading(true);
    try {
      const tweets: TweetData[] = [tweetData];
      let currentId = tweetData.replying_to_status;
      let depth = 0;

      while (currentId && depth < MAX_THREAD_DEPTH) {
        const parent = await fetchTweet(currentId);
        tweets.unshift(parent);
        currentId = parent.replying_to_status || '';
        depth++;
      }

      setThreadCount(tweets.length);
      generateThreadMarkdown(tweets);
    } catch {
      // If thread loading fails, keep the single tweet
    } finally {
      setThreadLoading(false);
    }
  };

  const generateThreadMarkdown = (tweets: TweetData[]) => {
    const first = tweets[0];
    const authorName = first.author?.name || t.unknownAuthor;
    const authorHandle = first.author?.screen_name || t.unknown;

    let md = `# Thread: @${authorHandle}\n\n`;
    let txt = `Thread: @${authorHandle}\n\n`;
    md += `**${t.author}** ${authorName} (@${authorHandle})\n`;
    txt += `${t.author} ${authorName} (@${authorHandle})\n`;
    md += `---\n\n`;
    txt += `----------------------------------------\n\n`;

    tweets.forEach((tweet, i) => {
      md += `**${i + 1}/${tweets.length}**\n\n`;
      txt += `${i + 1}/${tweets.length}\n\n`;
      md += `${tweet.text}\n\n`;
      txt += `${tweet.text}\n\n`;

      if (tweet.media?.photos && tweet.media.photos.length > 0) {
        tweet.media.photos.forEach((photo, j) => {
          md += `![${t.image} ${j + 1}](${photo.url})\n\n`;
          txt += `[${t.image} ${j + 1}: ${photo.url}]\n\n`;
        });
      }

      if (i < tweets.length - 1) {
        md += `---\n\n`;
        txt += `----------------------------------------\n\n`;
      }
    });

    setMarkdownContent(md);
    setPlainTextContent(txt);
  };

  const generateMarkdown = useCallback((data: TweetData) => {
    const authorName = data.author?.name || t.unknownAuthor;
    const authorHandle = data.author?.screen_name || t.unknown;
    const date = new Date(data.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let md = `# ${t.articlePrefix}${authorHandle}\n\n`;
    let txt = `${t.articlePrefix}${authorHandle}\n\n`;
    md += `**${t.author}** ${authorName} (@${authorHandle})\n`;
    txt += `${t.author} ${authorName} (@${authorHandle})\n`;
    md += `**${t.date}** ${date}\n\n`;
    txt += `${t.date} ${date}\n\n`;
    md += `---\n\n`;
    txt += `----------------------------------------\n\n`;

    if (data.article) {
      if (data.article.title) {
        md += `## ${data.article.title}\n\n`;
        txt += `${data.article.title}\n\n`;
      }

      const blocks = data.article.content?.blocks || [];
      const entityMap = data.article.content?.entityMap || [];
      const mediaEntities = data.article.media_entities || [];

      blocks.forEach(block => {
        if (block.type === 'atomic') {
          if (block.entityRanges && block.entityRanges.length > 0) {
            const entityKey = block.entityRanges[0].key;
            let entity;
            if (Array.isArray(entityMap)) {
              entity = entityMap.find((e: any) => e.key == entityKey)?.value;
            } else {
              entity = entityMap[entityKey];
            }

            if (entity) {
              if (entity.type === 'DIVIDER') {
                md += `---\n\n`;
                txt += `----------------------------------------\n\n`;
              } else if (entity.type === 'MEDIA') {
                const mediaId = entity.data?.mediaItems?.[0]?.mediaId;
                const caption = entity.data?.caption || '';
                const mediaInfo = mediaEntities.find((m: any) => m.media_id === mediaId);

                let imgUrl = '';
                if (mediaInfo?.media_info?.original_img_url) {
                  imgUrl = mediaInfo.media_info.original_img_url;
                } else if (mediaInfo?.media_info?.variants) {
                  imgUrl = mediaInfo.media_info.preview_image?.original_img_url || '';
                }

                if (imgUrl) {
                  md += `![${caption}](${imgUrl})\n\n`;
                  txt += `[${t.image}: ${imgUrl}]\n\n`;
                }
              }
            }
          }
          return;
        }

        let chars = block.text.split('').map((c: string) => ({ char: c, prefixes: [] as string[], suffixes: [] as string[] }));

        (block.inlineStyleRanges || []).forEach((style: any) => {
          let tag = '';
          if (style.style === 'Bold') tag = '**';
          if (style.style === 'Italic') tag = '*';
          if (style.style === 'CODE') tag = '`';

          if (tag && style.length > 0 && style.offset < chars.length) {
            chars[style.offset].prefixes.push(tag);
            const endIndex = Math.min(style.offset + style.length - 1, chars.length - 1);
            chars[endIndex].suffixes.unshift(tag);
          }
        });

        (block.entityRanges || []).forEach((range: any) => {
          let entity;
          if (Array.isArray(entityMap)) {
            entity = entityMap.find((e: any) => e.key == range.key)?.value;
          } else {
            entity = entityMap[range.key];
          }

          if (entity && entity.type === 'LINK' && range.length > 0 && range.offset < chars.length) {
            chars[range.offset].prefixes.unshift('[');
            const endIndex = Math.min(range.offset + range.length - 1, chars.length - 1);
            chars[endIndex].suffixes.push(`](${entity.data.url})`);
          }
        });

        let formattedText = '';
        for (let i = 0; i < chars.length; i++) {
          formattedText += chars[i].prefixes.join('');
          formattedText += chars[i].char;
          formattedText += chars[i].suffixes.join('');
        }

        if (block.type === 'header-two') {
          md += `### ${formattedText}\n\n`;
          txt += `${block.text}\n\n`;
        } else if (block.type === 'header-three') {
          md += `#### ${formattedText}\n\n`;
          txt += `${block.text}\n\n`;
        } else if (block.type === 'unordered-list-item') {
          md += `- ${formattedText}\n`;
          txt += `- ${block.text}\n`;
        } else if (block.type === 'ordered-list-item') {
          md += `1. ${formattedText}\n`;
          txt += `1. ${block.text}\n`;
        } else if (block.type === 'blockquote') {
          md += `> ${formattedText}\n\n`;
          txt += `> ${block.text}\n\n`;
        } else {
          md += `${formattedText}\n\n`;
          txt += `${block.text}\n\n`;
        }
      });
    } else {
      md += `${data.text}\n\n`;
      txt += `${data.text}\n\n`;

      if (data.media?.photos && data.media.photos.length > 0) {
        md += `---\n\n### ${t.attachedImages}\n\n`;
        txt += `----------------------------------------\n\n${t.attachedImages}\n\n`;
        data.media.photos.forEach((photo, index) => {
          md += `![${t.image} ${index + 1}](${photo.url})\n\n`;
          txt += `[${t.image} ${index + 1}: ${photo.url}]\n\n`;
        });
      }
    }

    setMarkdownContent(md);
    setPlainTextContent(txt);
  }, [t, lang]);

  const downloadFile = (extension: 'md' | 'txt') => {
    const content = extension === 'md' ? markdownContent : plainTextContent;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `xtract-@${tweetData?.author?.screen_name || t.unknown}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    const shareData = {
      title: `Xtracticle — @${tweetData?.author?.screen_name}`,
      text: markdownContent.slice(0, 200),
      url: url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setJustCopied(true);
        setTimeout(() => setJustCopied(false), 2000);
      }
    } catch {}
  };

  const handlePrintPDF = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    const clone = element.cloneNode(true) as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    wrapper.style.color = '#000000';
    wrapper.style.backgroundColor = '#ffffff';

    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #000000;">${t.articlePrefix}${tweetData?.author?.screen_name || t.unknown}</h1>
      <p style="color: #555555; margin-bottom: 4px;"><strong>${t.author}</strong> ${tweetData?.author?.name || t.unknownAuthor} (@${tweetData?.author?.screen_name || t.unknown})</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #cccccc;" />
    `;

    wrapper.appendChild(header);

    clone.className = '';
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el: any) => {
      el.className = '';
      if (el.tagName === 'IMG') {
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
        el.style.borderRadius = '8px';
        el.style.marginTop = '10px';
        el.style.marginBottom = '10px';
      } else if (['H1', 'H2', 'H3'].includes(el.tagName)) {
        el.style.fontWeight = 'bold';
        el.style.marginTop = '20px';
        el.style.marginBottom = '10px';
        el.style.color = '#000000';
      } else if (el.tagName === 'P') {
        el.style.marginBottom = '10px';
        el.style.lineHeight = '1.6';
        el.style.color = '#000000';
      } else if (el.tagName === 'A') {
        el.style.color = '#2563eb';
        el.style.textDecoration = 'underline';
      } else if (el.tagName === 'UL' || el.tagName === 'OL') {
        el.style.paddingLeft = '20px';
        el.style.marginBottom = '10px';
      } else if (el.tagName === 'LI') {
        el.style.marginBottom = '5px';
      } else if (el.tagName === 'BLOCKQUOTE') {
        el.style.borderLeft = '4px solid #cccccc';
        el.style.paddingLeft = '10px';
        el.style.color = '#555555';
        el.style.fontStyle = 'italic';
        el.style.margin = '10px 0';
      } else if (el.tagName === 'HR') {
        el.style.border = '0';
        el.style.borderTop = '1px solid #cccccc';
        el.style.margin = '20px 0';
      }
    });

    wrapper.appendChild(clone);

    html2pdf().set({
      margin: 0.5,
      filename: `xtract-@${tweetData?.author?.screen_name || t.unknown}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    }).from(wrapper).save();
  };

  const handleHistoryClick = (item: HistoryItem) => {
    setUrl(item.url);
    setShowHistory(false);
    handleFetch(undefined, item.url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl flex items-center justify-center btn-secondary focus-ring"
          style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Header */}
        <header className="mb-14 text-center print:hidden animate-fade-in">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)', boxShadow: 'var(--shadow-xl)' }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path>
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t.title}
          </h1>
          <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t.description}
          </p>
        </header>

        {/* Search Form */}
        <form onSubmit={handleFetch} className="mb-6 print:hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex items-center max-w-2xl mx-auto">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-5 pr-28 py-4 rounded-2xl text-base input-glow focus-ring"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl font-semibold text-sm btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.fetch}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mt-4 p-4 rounded-xl flex items-start gap-3 max-w-2xl mx-auto animate-shake"
              style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)', border: `1px solid var(--error-border)` }}
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {/* History */}
        {history.length > 0 && !tweetData && (
          <div className="max-w-2xl mx-auto mb-12 print:hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm font-medium mb-3 btn-secondary px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Clock className="w-3.5 h-3.5" />
              {t.history}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            {showHistory && (
              <div className="rounded-xl overflow-hidden animate-slide-up" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 history-item"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title || `@${item.authorHandle}`}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                        @{item.authorHandle} · {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  onClick={clearHistory}
                  className="w-full text-center px-4 py-2.5 text-xs font-medium history-item"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t.clearHistory}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result Card */}
        {tweetData && markdownContent && (
          <div className="card rounded-3xl p-6 md:p-10 animate-slide-up print:shadow-none print:border-none print:p-0">

            {/* Author + Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 print:hidden" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-4">
                {tweetData.author?.avatar_url && (
                  <img
                    src={tweetData.author.avatar_url.replace('_normal', '_bigger')}
                    alt={tweetData.author.name}
                    className="w-12 h-12 rounded-full"
                    style={{ border: '1px solid var(--border)' }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{tweetData.author?.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{tweetData.author?.screen_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Download buttons */}
                <button
                  onClick={() => downloadFile('md')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium btn-primary"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.downloadMd}
                </button>
                <button
                  onClick={() => downloadFile('txt')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium btn-secondary"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {t.downloadTxt}
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium btn-secondary"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                >
                  <FileDown className="w-3.5 h-3.5" />
                  {t.savePdf}
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium btn-secondary"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                >
                  {justCopied ? <Check className="w-3.5 h-3.5 animate-check" /> : <Copy className="w-3.5 h-3.5" />}
                  {justCopied ? t.copied : t.copyMd}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium btn-secondary"
                  style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {t.share}
                </button>
              </div>
            </div>

            {/* Thread detection */}
            {tweetData.replying_to_status && threadCount === 0 && (
              <div
                className="mb-6 p-4 rounded-xl flex items-center justify-between gap-4"
                style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.threadDetected}</p>
                <button
                  onClick={loadThread}
                  disabled={threadLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-primary whitespace-nowrap"
                  style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
                >
                  {threadLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {threadLoading ? t.loadingThread : t.loadThread}
                </button>
              </div>
            )}

            {threadCount > 0 && (
              <div className="mb-6 text-sm font-medium px-1" style={{ color: 'var(--text-secondary)' }}>
                ✓ {threadCount} {t.threadLoaded}
              </div>
            )}

            {/* Markdown Content */}
            <div id="pdf-content" className="prose prose-neutral max-w-none prose-img:rounded-2xl prose-img:border prose-a:text-blue-600 dark:prose-a:text-blue-400">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ node, ...props }) => <img {...props} referrerPolicy="no-referrer" style={{ borderColor: 'var(--border)' }} />
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>

          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs print:hidden" style={{ color: 'var(--text-tertiary)' }}>
          <p>Xtracticle — Free & open source. No login required.</p>
          <p className="mt-1">Built by <a href="https://x.com/DvciAhmet" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>@DvciAhmet</a></p>
        </footer>

      </div>
    </div>
  );
}
