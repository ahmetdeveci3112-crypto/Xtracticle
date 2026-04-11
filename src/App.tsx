import { useState, useEffect } from 'react';
import { Download, FileText, AlertCircle, Loader2, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// @ts-ignore
import html2pdf from 'html2pdf.js';

const translations = {
  en: {
    title: "Xtracticle",
    description: "Easily download long-form articles and threads from X as Markdown (.md), Text (.txt), or PDF files.",
    placeholder: "https://x.com/username/status/123456789...",
    fetch: "Fetch",
    invalidLink: "Please enter a valid X link.",
    fetchError: "Could not fetch the article.",
    errorOccurred: "An error occurred.",
    unknownAuthor: "Unknown Author",
    unknown: "unknown",
    articlePrefix: "Article: @",
    author: "Author:",
    date: "Date:",
    downloadMd: "Download .MD",
    downloadTxt: "Download .TXT",
    savePdf: "Save PDF",
    attachedImages: "Attached Images",
    image: "Image"
  },
  tr: {
    title: "Xtracticle",
    description: "X'teki uzun formattaki makaleleri ve flood'ları kolayca Markdown (.md), Metin (.txt) veya PDF dosyası olarak indirin.",
    placeholder: "https://x.com/kullanici/status/123456789...",
    fetch: "Getir",
    invalidLink: "Geçerli bir X linki giriniz.",
    fetchError: "Makale alınamadı.",
    errorOccurred: "Bir hata oluştu.",
    unknownAuthor: "Bilinmeyen Yazar",
    unknown: "bilinmeyen",
    articlePrefix: "Makale: @",
    author: "Yazar:",
    date: "Tarih:",
    downloadMd: ".MD İndir",
    downloadTxt: ".TXT İndir",
    savePdf: "PDF Kaydet",
    attachedImages: "Ekli Görseller",
    image: "Görsel"
  }
};

interface TweetData {
  text: string;
  author: {
    name: string;
    screen_name: string;
    avatar_url: string;
  };
  created_at: string;
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

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweetData, setTweetData] = useState<TweetData | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [plainTextContent, setPlainTextContent] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'tr'>('en');

  useEffect(() => {
    if (navigator.language.startsWith('tr')) {
      setLang('tr');
    }
  }, []);

  const t = translations[lang];

  const extractTweetId = (inputUrl: string) => {
    const match = inputUrl.match(/(?:x\.com|twitter\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
    return match ? match[3] : null;
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTweetData(null);
    setMarkdownContent('');
    setPlainTextContent('');

    const tweetId = extractTweetId(url);
    if (!tweetId) {
      setError(t.invalidLink);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tweet/${tweetId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t.fetchError);
      }

      setTweetData(data);
      generateMarkdown(data);
    } catch (err: any) {
      setError(err.message || t.errorOccurred);
    } finally {
      setLoading(false);
    }
  };

  const generateMarkdown = (data: TweetData) => {
    const authorName = data.author?.name || t.unknownAuthor;
    const authorHandle = data.author?.screen_name || t.unknown;
    const date = new Date(data.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                
                let url = '';
                if (mediaInfo?.media_info?.original_img_url) {
                  url = mediaInfo.media_info.original_img_url;
                } else if (mediaInfo?.media_info?.variants) {
                  url = mediaInfo.media_info.preview_image?.original_img_url || '';
                }
                
                if (url) {
                  md += `![${caption}](${url})\n\n`;
                  txt += `[${t.image}: ${url}]\n\n`;
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
      // Normal tweet
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
  };

  const downloadFile = (extension: 'md' | 'txt') => {
    const content = extension === 'md' ? markdownContent : plainTextContent;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xtract-@${tweetData?.author?.screen_name || t.unknown}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;
    
    const clone = element.cloneNode(true) as HTMLElement;
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    wrapper.style.color = '#000000';
    wrapper.style.backgroundColor = '#ffffff';
    
    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #000000;">${t.articlePrefix}${tweetData?.author?.screen_name || t.unknown}</h1>
      <p style="color: #555555; margin-bottom: 4px;"><strong>${t.author}</strong> ${tweetData?.author?.name || t.unknownAuthor} (@${tweetData?.author?.screen_name || t.unknown})</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #cccccc;" />
    `;
    
    wrapper.appendChild(header);

    // Remove Tailwind classes that might cause oklch issues in html2canvas
    clone.className = ''; 
    
    // Apply basic inline styles to the clone to ensure it looks good without Tailwind
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el: any) => {
      el.className = ''; // Remove all tailwind classes
      if (el.tagName === 'IMG') {
        el.style.maxWidth = '100%';
        el.style.height = 'auto';
        el.style.borderRadius = '8px';
        el.style.marginTop = '10px';
        el.style.marginBottom = '10px';
      } else if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
        el.style.fontWeight = 'bold';
        el.style.marginTop = '20px';
        el.style.marginBottom = '10px';
        el.style.color = '#000000';
      } else if (el.tagName === 'P') {
        el.style.marginBottom = '10px';
        el.style.lineHeight = '1.5';
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
    
    const opt = {
      margin:       0.5,
      filename:     `xtract-@${tweetData?.author?.screen_name || t.unknown}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(wrapper).save();
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        
        <header className="mb-12 text-center print:hidden">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white mb-6 shadow-xl shadow-black/10">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t.title}
          </h1>
          <p className="text-neutral-500 text-lg max-w-xl mx-auto">
            {t.description}
          </p>
        </header>

        <form onSubmit={handleFetch} className="mb-12 print:hidden">
          <div className="relative flex items-center max-w-2xl mx-auto">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.placeholder}
              className="w-full pl-6 pr-32 py-4 rounded-2xl border border-neutral-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-lg"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.fetch}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 flex items-start gap-3 max-w-2xl mx-auto border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        {tweetData && markdownContent && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-black/5 border border-neutral-100 animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:p-0">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-neutral-100 print:hidden">
              <div className="flex items-center gap-4">
                {tweetData.author?.avatar_url && (
                  <img 
                    src={tweetData.author.avatar_url.replace('_normal', '_bigger')} 
                    alt={tweetData.author.name}
                    className="w-14 h-14 rounded-full border border-neutral-200"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">{tweetData.author?.name}</h3>
                  <p className="text-neutral-500">@{tweetData.author?.screen_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => downloadFile('md')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadMd}</span>
                </button>
                <button
                  onClick={() => downloadFile('txt')}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t.downloadTxt}</span>
                </button>
                <button
                  onClick={handlePrintPDF}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black border border-neutral-200 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{t.savePdf}</span>
                </button>
              </div>
            </div>

            <div id="pdf-content" className="prose prose-neutral max-w-none prose-img:rounded-2xl prose-img:border prose-img:border-neutral-100 prose-a:text-blue-600">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({node, ...props}) => <img {...props} referrerPolicy="no-referrer" />
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
