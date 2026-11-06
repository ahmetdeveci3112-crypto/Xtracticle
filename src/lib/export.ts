import type { XDoc } from '../shared/convert';
import { createQrDataUrl } from './qr';

/**
 * Client-side exporters. Heavy libraries (jspdf, html2canvas, fflate) are
 * dynamically imported so they never touch the initial bundle.
 */

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function saveText(text: string, filename: string, mime = 'text/plain') {
  saveBlob(new Blob([text], { type: `${mime};charset=utf-8` }), filename);
}

/* ─── Images ─── */

interface LocalImage {
  path: string;
  data: Uint8Array;
  mime: string;
}

const EXT: Record<string, string> = { 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/jpeg': 'jpg' };

async function fetchImages(urls: string[], dir = 'images'): Promise<Map<string, LocalImage>> {
  const found: (LocalImage | undefined)[] = [];
  let next = 0;
  const worker = async () => {
    while (next < urls.length) {
      const index = next++;
      const url = urls[index];
      try {
        const res = await fetch(url, { mode: 'cors', referrerPolicy: 'no-referrer' });
        if (!res.ok) continue;
        const mime = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
        const ext = EXT[mime] || 'jpg';
        found[index] = {
          path: `${dir}/${String(index + 1).padStart(2, '0')}.${ext}`,
          data: new Uint8Array(await res.arrayBuffer()),
          mime: EXT[mime] ? mime : 'image/jpeg',
        };
      } catch {
        /* keep the remote URL when an image can't be downloaded */
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, urls.length) }, worker));
  // Keep document order (the first image is the article cover).
  const result = new Map<string, LocalImage>();
  urls.forEach((url, i) => found[i] && result.set(url, found[i]!));
  return result;
}

function replaceAll(text: string, map: Map<string, LocalImage>) {
  let out = text;
  for (const [url, img] of map) out = out.split(`(${url})`).join(`(${img.path})`);
  return out;
}

/* ─── ZIP: Markdown + local images (offline archive) ─── */

export async function buildZip(doc: XDoc, markdown: string, base: string): Promise<Blob> {
  const [{ zipSync, strToU8 }, images] = await Promise.all([import('fflate'), fetchImages(doc.images)]);
  const files: Record<string, any> = {
    [`${base}/${base}.md`]: strToU8(replaceAll(markdown, images)),
  };
  for (const img of images.values()) files[`${base}/${img.path}`] = [img.data, { level: 0 }];
  return new Blob([zipSync(files, { level: 6 })], { type: 'application/zip' });
}

/** Several documents in one archive (batch mode). */
export async function buildBatchZip(entries: { base: string; markdown: string }[]): Promise<Blob> {
  const { zipSync, strToU8 } = await import('fflate');
  const files: Record<string, Uint8Array> = {};
  const used = new Set<string>();
  for (const e of entries) {
    let name = e.base;
    for (let i = 2; used.has(name); i++) name = `${e.base}-${i}`;
    used.add(name);
    files[`xtracticle/${name}.md`] = strToU8(e.markdown);
  }
  return new Blob([zipSync(files, { level: 6 })], { type: 'application/zip' });
}

/* ─── EPUB 3 (Kindle via Send-to-Kindle, Apple Books, Kobo…) ─── */

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const EPUB_CSS = `body{font-family:serif;line-height:1.6;margin:0 1em}
h1{font-size:1.6em;line-height:1.25;margin:0.6em 0}
h2{font-size:1.3em;margin:1.2em 0 0.4em}
h3{font-size:1.1em;margin:1em 0 0.3em}
img{max-width:100%;height:auto;display:block;margin:1em auto}
blockquote{margin:1em 0;padding-left:1em;border-left:3px solid #999;color:#444;font-style:italic}
pre{white-space:pre-wrap;font-size:0.85em;background:#f4f4f4;padding:0.6em}
hr{border:0;border-top:1px solid #ccc;margin:1.5em 0}
a{color:#1d4ed8}
.colophon{font-size:0.8em;color:#666;text-align:center}`;

/** Link back to the site from exported files, tagged so GA shows which format brought the visit. */
const creditUrl = (format: 'pdf' | 'epub') =>
  `https://xtracticle.com/?utm_source=${format}&utm_medium=export&utm_campaign=credit`;

const EPUB_CREDIT: Record<string, string> = {
  en: 'Saved with',
  tr: 'Kaydeden:',
  es: 'Guardado con',
  pt: 'Salvo com',
  ja: '保存:',
  zh: '保存工具：',
  ar: 'حُفظ باستخدام',
};

/** Xtracticle Pro exports carry no "Saved with Xtracticle" line. */
export interface ExportOptions {
  credit?: boolean;
}

export async function buildEpub(doc: XDoc, contentEl: HTMLElement, lang: string, opts: ExportOptions = {}): Promise<Blob> {
  const [{ zipSync, strToU8 }, images] = await Promise.all([import('fflate'), fetchImages(doc.images)]);

  const clone = contentEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('*').forEach(el => {
    el.removeAttribute('class');
    el.removeAttribute('style');
    el.removeAttribute('referrerpolicy');
    el.removeAttribute('target');
    el.removeAttribute('rel');
    el.removeAttribute('loading');
  });
  clone.querySelectorAll('img').forEach(img => {
    const local = images.get(img.getAttribute('src') || '');
    if (local) img.setAttribute('src', local.path);
    else img.replaceWith(document.createTextNode(`[${img.getAttribute('alt') || 'image'}]`));
  });

  const language = (lang || 'en').slice(0, 2);
  const colophon = document.createElement('p');
  colophon.setAttribute('class', 'colophon');
  if (opts.credit !== false) {
    colophon.append(`${EPUB_CREDIT[language] || EPUB_CREDIT.en} `);
    const creditLink = document.createElement('a');
    creditLink.setAttribute('href', creditUrl('epub'));
    creditLink.textContent = 'Xtracticle';
    colophon.append(creditLink, ' · ');
  }
  const sourceLink = document.createElement('a');
  sourceLink.setAttribute('href', doc.sourceUrl);
  sourceLink.textContent = doc.sourceUrl.replace(/^https?:\/\//, '');
  colophon.append(sourceLink);
  clone.append(document.createElement('hr'), colophon);

  const serializer = new XMLSerializer();
  const body = Array.from(clone.childNodes).map(n => serializer.serializeToString(n)).join('\n');
  const title = xml(doc.title);
  const creator = xml(`${doc.author.name} (@${doc.author.handle})`);
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const content = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head><meta charset="utf-8"/><title>${title}</title><link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>
${body}
</body>
</html>`;

  const nav = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${language}" xml:lang="${language}">
<head><meta charset="utf-8"/><title>${title}</title></head>
<body><nav epub:type="toc" id="toc"><ol><li><a href="content.xhtml">${title}</a></li></ol></nav></body>
</html>`;

  const imageItems = Array.from(images.values())
    .map((img, i) => `<item id="img${i + 1}" href="${img.path}" media-type="${img.mime}"${i === 0 && doc.kind === 'article' ? ' properties="cover-image"' : ''}/>`)
    .join('\n    ');

  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid" xml:lang="${language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:xtracticle:${doc.id}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${creator}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:source>${xml(doc.sourceUrl)}</dc:source>
    ${doc.publishedAt ? `<dc:date>${doc.publishedAt.slice(0, 10)}</dc:date>` : ''}
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
    ${imageItems}
  </manifest>
  <spine><itemref idref="content"/></spine>
</package>`;

  const container = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`;

  const files: Record<string, any> = {
    // `mimetype` must be the first entry and stored uncompressed.
    mimetype: [strToU8('application/epub+zip'), { level: 0 }],
    'META-INF/container.xml': strToU8(container),
    'OEBPS/content.opf': strToU8(opf),
    'OEBPS/nav.xhtml': strToU8(nav),
    'OEBPS/content.xhtml': strToU8(content),
    'OEBPS/style.css': strToU8(EPUB_CSS),
  };
  for (const img of images.values()) files[`OEBPS/${img.path}`] = [img.data, { level: 0 }];
  return new Blob([zipSync(files, { level: 6 })], { type: 'application/epub+zip' });
}

/* ─── PDF ─── */

const PDF_STYLES: Record<string, string> = {
  H1: 'font-size:26px;font-weight:700;line-height:1.25;margin:0 0 12px',
  H2: 'font-size:20px;font-weight:700;line-height:1.3;margin:22px 0 10px',
  H3: 'font-size:17px;font-weight:700;margin:18px 0 8px',
  H4: 'font-size:15px;font-weight:700;margin:16px 0 8px',
  P: 'margin:0 0 12px;line-height:1.65',
  UL: 'margin:0 0 12px;padding-left:22px;list-style:disc outside',
  OL: 'margin:0 0 12px;padding-left:22px;list-style:decimal outside',
  LI: 'margin:0 0 5px;line-height:1.6;display:list-item',
  BLOCKQUOTE: 'margin:12px 0;padding:2px 0 2px 14px;border-left:3px solid #cfcfcf;color:#444',
  PRE: 'white-space:pre-wrap;background:#f4f4f5;padding:10px;border-radius:6px;font-size:12px;margin:0 0 12px',
  CODE: 'font-family:ui-monospace,Menlo,monospace;font-size:0.9em',
  HR: 'border:0;border-top:1px solid #dddddd;margin:18px 0',
  A: 'color:#1d4ed8;text-decoration:underline',
  IMG: 'display:block;width:auto;max-width:100%;height:auto;margin:10px auto;border-radius:8px',
  TABLE: 'border-collapse:collapse;margin:0 0 12px',
  TD: 'border:1px solid #ddd;padding:4px 8px',
  TH: 'border:1px solid #ddd;padding:4px 8px',
};

const PAGE_W_PX = 700; // layout width; A4 content area is scaled to this
const MARGIN_MM = 14;

/**
 * Renders the preview into an A4 PDF page by page. Content is grouped at
 * block boundaries so lines are never cut; anything taller than a page is
 * sliced. This avoids the single giant canvas that silently fails (blank PDF)
 * on long articles, especially on iOS Safari.
 */
export async function buildPdf(
  doc: XDoc,
  contentEl: HTMLElement,
  onProgress?: (done: number, total: number) => void,
  opts: ExportOptions = {},
): Promise<Blob> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas-pro')]);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN_MM * 2;
  const contentH = pageH - MARGIN_MM * 2 - 6; // room for footer
  const pageHeightPx = Math.floor((PAGE_W_PX * contentH) / contentW);

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${PAGE_W_PX}px;background:#fff;color:#111;font-family:Inter,system-ui,-apple-system,sans-serif;font-size:14px;`;
  const clone = contentEl.cloneNode(true) as HTMLElement;
  clone.removeAttribute('class');
  clone.removeAttribute('id');
  clone.querySelectorAll('*').forEach(node => {
    const el = node as HTMLElement;
    el.removeAttribute('class');
    const style = PDF_STYLES[el.tagName];
    if (style) el.style.cssText = style;
    if (el.tagName === 'IMG') {
      el.removeAttribute('loading'); // lazy images never load off-screen
      el.setAttribute('crossorigin', 'anonymous');
      el.style.maxHeight = `${Math.round(pageHeightPx * 0.55)}px`;
    }
  });
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // Wait for images so heights are final (bounded, so a stuck image can't hang the export).
    await Promise.all(
      Array.from(clone.querySelectorAll('img')).map(img =>
        img.complete
          ? null
          : new Promise(r => {
              img.onload = img.onerror = r;
              setTimeout(r, 8000);
            }),
      ),
    );

    // Greedy grouping of top-level blocks into pages.
    const children = Array.from(clone.children) as HTMLElement[];
    const groups: HTMLElement[][] = [];
    let current: HTMLElement[] = [];
    let used = 0;
    for (const child of children) {
      const cs = getComputedStyle(child);
      const h = child.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
      if (used + h > pageHeightPx && current.length) {
        groups.push(current);
        current = [];
        used = 0;
      }
      current.push(child);
      used += h;
    }
    if (current.length) groups.push(current);

    // Phones (iOS Safari especially) have a small total canvas-memory budget: render at a
    // lower resolution there and free every canvas as soon as it has been used.
    const lowMemory =
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || ((navigator as any).deviceMemory ?? 8) <= 4;
    const scale = lowMemory || groups.length > 40 ? 1.5 : 2;
    const release = (c: HTMLCanvasElement) => {
      c.width = 0;
      c.height = 0;
    };

    let pageIndex = 0;
    for (const [groupIndex, group] of groups.entries()) {
      onProgress?.(groupIndex + 1, groups.length);
      const page = document.createElement('div');
      page.style.cssText = `width:${PAGE_W_PX}px;background:#fff;color:#111;padding:0;`;
      group.forEach(el => page.appendChild(el));
      host.replaceChildren(page);

      const canvas = await html2canvas(page, { scale, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const slicePx = pageHeightPx * scale;
      for (let y = 0; y < canvas.height; y += slicePx) {
        const h = Math.min(slicePx, canvas.height - y);
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = h;
        slice.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL('image/jpeg', 0.85), 'JPEG', MARGIN_MM, MARGIN_MM, contentW, (h / canvas.width) * contentW);
        release(slice);
        pageIndex++;
      }
      release(canvas);
    }

    // Footer with source, credit and page numbers (ASCII-only to stay within core fonts).
    const total = pdf.getNumberOfPages();
    const source = doc.sourceUrl.replace(/^https?:\/\//, '');
    const credit = 'xtracticle.com';
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.textWithLink(source, MARGIN_MM, pageH - 8, { url: doc.sourceUrl });
      if (opts.credit !== false) pdf.textWithLink(credit, (pageW - pdf.getTextWidth(credit)) / 2, pageH - 8, { url: creditUrl('pdf') });
      pdf.text(`${i} / ${total}`, pageW - MARGIN_MM, pageH - 8, { align: 'right' });
    }
    pdf.setProperties({ title: doc.title, author: `${doc.author.name} (@${doc.author.handle})`, subject: doc.sourceUrl, creator: 'Xtracticle (xtracticle.com)' });
    return pdf.output('blob');
  } finally {
    host.remove();
  }
}

/* ─── Obsidian ─── */

/** Copies Markdown to the clipboard and opens a new Obsidian note from it. */
export async function openInObsidian(title: string, markdown: string) {
  await navigator.clipboard.writeText(markdown);
  const name = title.replace(/[\\/:*?"<>|#^[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100) || 'X post';
  window.location.href = `obsidian://new?name=${encodeURIComponent(name)}&clipboard`;
}

/* ─── Shareable Mobile Image Cards ─── */

export type ShareImageTheme = 'light' | 'dark' | 'warm';
export type ShareImageMode = 'long' | 'paged';

export interface ShareImageOptions {
  theme: ShareImageTheme;
  mode: ShareImageMode;
  locale: string;
  footerTitle?: string;
  footerSubtitle?: string;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
}

interface CardPalette {
  outerBg: string;
  cardBg: string;
  text: string;
  muted: string;
  border: string;
  metaBg: string;
  quoteBg: string;
  footerBg: string;
  accent: string;
}

const CARD_PALETTES: Record<ShareImageTheme, CardPalette> = {
  light: {
    outerBg: '#f1f5f9',
    cardBg: '#ffffff',
    text: '#0f1419',
    muted: '#536471',
    border: '#e2e8f0',
    metaBg: '#f8fafc',
    quoteBg: '#f8fafc',
    footerBg: '#f8fafc',
    accent: '#1d9bf0',
  },
  dark: {
    outerBg: '#000000',
    cardBg: '#0f1419',
    text: '#e7e9ea',
    muted: '#8b98a5',
    border: '#2f3336',
    metaBg: '#16181c',
    quoteBg: '#16181c',
    footerBg: '#16181c',
    accent: '#1d9bf0',
  },
  warm: {
    outerBg: '#efe7da',
    cardBg: '#fbf7f0',
    text: '#2c241d',
    muted: '#786b5e',
    border: '#e6dccd',
    metaBg: '#f4ede1',
    quoteBg: '#f4ede1',
    footerBg: '#f4ede1',
    accent: '#b45309',
  },
};

const CARD_W_PX = 440;
const PAGED_BODY_H_PX = 580;

function formatDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(+d)) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function cardElementStyles(p: CardPalette, mode: ShareImageMode): Record<string, string> {
  const imgMaxH = mode === 'paged' ? `max-height:${Math.round(PAGED_BODY_H_PX * 0.78)}px;width:auto;` : 'width:100%;';
  return {
    H1: `font-size:21px;font-weight:800;line-height:1.32;margin:0 0 14px;color:${p.text}`,
    H2: `font-size:18px;font-weight:700;line-height:1.35;margin:18px 0 8px;color:${p.text}`,
    H3: `font-size:16px;font-weight:700;line-height:1.4;margin:14px 0 6px;color:${p.text}`,
    H4: `font-size:15px;font-weight:700;margin:12px 0 6px;color:${p.text}`,
    P: `margin:0 0 12px;line-height:1.68;font-size:15.5px;color:${p.text};word-break:break-word`,
    UL: `margin:0 0 12px;padding-inline-start:20px;list-style:disc outside;color:${p.text}`,
    OL: `margin:0 0 12px;padding-inline-start:20px;list-style:decimal outside;color:${p.text}`,
    LI: `margin:0 0 6px;line-height:1.62;font-size:15.5px;display:list-item;color:${p.text}`,
    BLOCKQUOTE: `margin:12px 0;padding:12px 14px;border-radius:12px;border:1px solid ${p.border};border-inline-start:3.5px solid ${p.accent};background:${p.quoteBg};color:${p.text};font-size:14.5px`,
    PRE: `white-space:pre-wrap;word-break:break-word;background:${p.quoteBg};border:1px solid ${p.border};padding:10px 12px;border-radius:10px;font-size:12.5px;margin:0 0 12px;color:${p.text}`,
    CODE: `font-family:ui-monospace,Menlo,monospace;font-size:0.9em`,
    HR: `border:0;border-top:1px dashed ${p.border};margin:16px 0`,
    A: `color:${p.accent};text-decoration:none;word-break:break-all`,
    IMG: `display:block;${imgMaxH}max-width:100%;height:auto;margin:10px auto;border-radius:12px;border:1px solid ${p.border}`,
    TABLE: `border-collapse:collapse;margin:0 0 12px;width:100%;font-size:13.5px`,
    TD: `border:1px solid ${p.border};padding:5px 8px;color:${p.text}`,
    TH: `border:1px solid ${p.border};padding:5px 8px;font-weight:700;color:${p.text}`,
  };
}

/** Pre-fetch remote image into a same-origin blob: URL with per-image timeout. Returns null on failure so html2canvas never re-requests a failed remote URL. */
async function toSafeBlobUrl(url: string, pool: string[], parentSignal?: AbortSignal): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (parentSignal?.aborted) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  const onParentAbort = () => ctrl.abort();
  parentSignal?.addEventListener('abort', onParentAbort, { once: true });
  try {
    const res = await fetch(url, { mode: 'cors', referrerPolicy: 'no-referrer', signal: ctrl.signal });
    if (!res.ok) return null;
    const blob = await res.blob();
    const objUrl = URL.createObjectURL(blob);
    pool.push(objUrl);
    return objUrl;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener('abort', onParentAbort);
  }
}

async function waitForPreviewReady(el: HTMLElement, signal?: AbortSignal) {
  for (let i = 0; i < 120; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (el.querySelector('hr') || el.children.length > 1) return;
    await new Promise(r => setTimeout(r, 50));
  }
  throw new Error('Preview content did not finish loading in time');
}

function createCardHeader(doc: XDoc, p: CardPalette, avatarUrl: string, formattedDate: string): HTMLElement {
  const header = document.createElement('div');
  header.style.cssText = `padding:22px 22px 16px;border-bottom:1px solid ${p.border};`;

  const topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;align-items:center;gap:12px;';

  if (avatarUrl) {
    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.crossOrigin = 'anonymous';
    avatar.style.cssText = `width:44px;height:44px;border-radius:9999px;object-fit:cover;flex-shrink:0;border:1px solid ${p.border};`;
    topRow.appendChild(avatar);
  } else {
    const fallback = document.createElement('div');
    fallback.textContent = (doc.author.name || doc.author.handle || 'X').slice(0, 1).toUpperCase();
    fallback.style.cssText = `width:44px;height:44px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:18px;background:${p.metaBg};color:${p.text};border:1px solid ${p.border};flex-shrink:0;`;
    topRow.appendChild(fallback);
  }

  const authorBox = document.createElement('div');
  authorBox.style.cssText = 'min-width:0;flex:1;';
  const nameEl = document.createElement('div');
  nameEl.dir = 'auto';
  nameEl.textContent = doc.author.name || doc.author.handle;
  nameEl.style.cssText = `font-size:16.5px;font-weight:700;line-height:1.25;color:${p.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
  const handleEl = document.createElement('div');
  handleEl.dir = 'ltr';
  handleEl.textContent = `@${doc.author.handle}`;
  handleEl.style.cssText = `font-size:13.5px;line-height:1.3;color:${p.muted};margin-top:2px;text-align:start;`;
  authorBox.append(nameEl, handleEl);
  topRow.appendChild(authorBox);

  const xLogo = document.createElement('div');
  xLogo.style.cssText = `color:${p.text};opacity:0.85;flex-shrink:0;`;
  xLogo.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 4.076H5.036z"></path></svg>`;
  topRow.appendChild(xLogo);

  header.appendChild(topRow);

  // Meta box in header: Published Time + Original Post URL
  const metaBox = document.createElement('div');
  metaBox.dir = 'ltr';
  metaBox.style.cssText = `margin-top:12px;padding:8px 11px;border-radius:10px;background:${p.metaBg};border:1px solid ${p.border};font-size:12px;line-height:1.55;color:${p.muted};text-align:left;`;

  if (formattedDate) {
    const timeRow = document.createElement('div');
    timeRow.textContent = `🕒 ${formattedDate}`;
    metaBox.appendChild(timeRow);
  }

  const urlRow = document.createElement('div');
  urlRow.textContent = `🔗 ${doc.sourceUrl.replace(/^https?:\/\//, '')}`;
  urlRow.style.cssText = 'word-break:break-all;';
  metaBox.appendChild(urlRow);

  header.appendChild(metaBox);
  return header;
}

function resolveFooterInfo(opts: ShareImageOptions) {
  const displayUrl =
    typeof location !== 'undefined' && location.origin ? location.origin : 'https://xtracticle.com';
  const titleText = (opts.footerTitle || 'Shared via {brand}').replace('{brand}', 'Xtracticle');
  const subText = opts.footerSubtitle || 'Convert X posts & articles to shareable images';
  return { titleText, subText, displayUrl };
}

function createCardFooter(
  p: CardPalette,
  opts: ShareImageOptions,
  pageIndex: number,
  total: number,
): HTMLElement {
  const { titleText, subText, displayUrl } = resolveFooterInfo(opts);

  const footer = document.createElement('div');
  footer.style.cssText = `padding:14px 20px;background:${p.footerBg};border-top:1px solid ${p.border};display:flex;align-items:center;justify-content:space-between;gap:14px;`;

  const leftCol = document.createElement('div');
  leftCol.style.cssText = 'min-width:0;flex:1;display:flex;flex-direction:column;gap:3px;';

  const titleRow = document.createElement('div');
  titleRow.style.cssText = 'display:flex;align-items:center;gap:8px;';

  const dot = document.createElement('span');
  dot.style.cssText = `width:7px;height:7px;border-radius:9999px;background:${p.accent};flex-shrink:0;display:inline-block;`;

  const titleEl = document.createElement('span');
  titleEl.textContent = titleText;
  titleEl.style.cssText = `font-size:13px;font-weight:700;color:${p.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
  titleRow.append(dot, titleEl);

  if (total > 1) {
    const pageEl = document.createElement('span');
    pageEl.textContent = `${pageIndex + 1} / ${total}`;
    pageEl.style.cssText = `font-size:11px;font-weight:600;color:${p.muted};padding:1px 7px;border-radius:9999px;border:1px solid ${p.border};background:${p.cardBg};flex-shrink:0;`;
    titleRow.appendChild(pageEl);
  }

  const subEl = document.createElement('div');
  subEl.textContent = subText;
  subEl.style.cssText = `font-size:11.5px;color:${p.muted};line-height:1.35;`;

  const linkEl = document.createElement('div');
  linkEl.textContent = `🔗 ${displayUrl}`;
  linkEl.style.cssText = `font-size:11.5px;font-weight:600;color:${p.accent};word-break:break-all;margin-top:1px;`;

  leftCol.append(titleRow, subEl, linkEl);
  footer.appendChild(leftCol);

  // Right side: QR code (dark modules on white background with 4-module quiet zone)
  const qrDataUrl = createQrDataUrl(displayUrl, '#0f1419', '#ffffff', 160);
  const qrBox = document.createElement('div');
  qrBox.style.cssText = `padding:3px;border-radius:10px;background:#ffffff;border:1px solid ${p.border};flex-shrink:0;display:flex;align-items:center;justify-content:center;`;
  const qrImg = document.createElement('img');
  qrImg.src = qrDataUrl;
  qrImg.style.cssText = 'width:56px;height:56px;display:block;border-radius:6px;';
  qrBox.appendChild(qrImg);
  footer.appendChild(qrBox);

  return footer;
}

/**
 * Renders the post/thread/article into one or more mobile-friendly PNG image Blobs.
 * Header contains author, published time, and original post URL; footer contains the tool link & QR code.
 */
export async function buildShareImages(doc: XDoc, contentEl: HTMLElement, opts: ShareImageOptions): Promise<Blob[]> {
  await waitForPreviewReady(contentEl, opts.signal);
  const { default: html2canvas } = await import('html2canvas-pro');
  if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const p = CARD_PALETTES[opts.theme] || CARD_PALETTES.light;
  const styles = cardElementStyles(p, opts.mode);
  const blobUrls: string[] = [];
  const contentDir = contentEl.getAttribute('dir') || 'auto';
  const contentLang = contentEl.getAttribute('lang') || (doc.lang && doc.lang !== 'zxx' ? doc.lang : '');

  const host = document.createElement('div');
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${CARD_W_PX}px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB",sans-serif;`;
  document.body.appendChild(host);

  try {
    const clone = contentEl.cloneNode(true) as HTMLElement;
    clone.removeAttribute('class');
    clone.removeAttribute('id');

    // Immediately detach remote `src` attributes on cloned images before removing `loading="lazy"`
    // so the browser does not fire uncontrolled requests outside the 4-worker prefetch queue.
    const imgEls = Array.from(clone.querySelectorAll('img'));
    for (const img of imgEls) {
      const rawSrc = img.getAttribute('src') || '';
      img.setAttribute('data-xt-src', rawSrc);
      img.removeAttribute('src');
      img.removeAttribute('loading');
    }

    // Strip the Markdown metadata header (# Title, Author/Date/Source paragraph, <hr>)
    // since the card header displays Author, Published Time, and Original URL directly.
    const topChildren = Array.from(clone.children);
    const hrIdx = topChildren.findIndex(el => el.tagName === 'HR');
    if (hrIdx > 0 && hrIdx <= 3) {
      for (let i = 0; i <= hrIdx; i++) {
        // Keep the H1 title only for X Articles (for posts/threads it duplicates the first line).
        if (i === 0 && topChildren[i].tagName === 'H1' && doc.kind === 'article') continue;
        topChildren[i].remove();
      }
    }

    clone.querySelectorAll('*').forEach(node => {
      const el = node as HTMLElement;
      el.removeAttribute('class');
      const s = styles[el.tagName];
      if (s) el.style.cssText = s;
    });

    // Convert avatar and post images to same-origin blob: URLs with bounded concurrency (4 workers) and 6s timeout.
    const rawAvatar = doc.author.avatar ? doc.author.avatar.replace('_normal', '_400x400') : '';
    const activeImgs = Array.from(clone.querySelectorAll('img'));
    let safeAvatar = '';
    const tasks: (() => Promise<void>)[] = [];
    if (rawAvatar) {
      tasks.push(async () => {
        const fetched = await toSafeBlobUrl(rawAvatar, blobUrls, opts.signal);
        safeAvatar = fetched || '';
      });
    }
    for (const img of activeImgs) {
      const src = img.getAttribute('data-xt-src') || '';
      img.removeAttribute('data-xt-src');
      if (src) {
        tasks.push(async () => {
          const fetched = await toSafeBlobUrl(src, blobUrls, opts.signal);
          if (fetched) {
            img.src = fetched;
          } else {
            const fallback = document.createElement('span');
            fallback.textContent = `[${img.getAttribute('alt') || 'image'}]`;
            fallback.style.cssText = `display:block;font-size:12px;color:${p.muted};margin:6px 0;`;
            img.replaceWith(fallback);
          }
        });
      } else {
        img.remove();
      }
    }
    let nextTask = 0;
    const runWorker = async () => {
      while (nextTask < tasks.length && !opts.signal?.aborted) {
        const idx = nextTask++;
        await tasks[idx]();
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, tasks.length) }, runWorker));
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // Measure block heights inside a container with the exact same inner body width (440 - 28 frame padding - 2 border = 410px).
    const innerCardW = CARD_W_PX - 30;
    const measureBox = document.createElement('div');
    measureBox.dir = contentDir;
    if (contentLang) measureBox.lang = contentLang;
    measureBox.style.cssText = `width:${innerCardW}px;padding:18px 22px;box-sizing:border-box;background:${p.cardBg};color:${p.text};`;
    Array.from(clone.children).forEach(ch => measureBox.appendChild(ch));
    host.appendChild(measureBox);

    await Promise.all(
      Array.from(measureBox.querySelectorAll('img')).map(img =>
        img.complete
          ? null
          : new Promise(r => {
              img.onload = img.onerror = r;
              setTimeout(r, 4000);
            }),
      ),
    );
    if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

    // In paged mode, split oversized list/blockquote blocks into smaller chunks so a single huge list doesn't create a giant card.
    if (opts.mode === 'paged') {
      const rawBlocks = Array.from(measureBox.children) as HTMLElement[];
      const splitBlocks: HTMLElement[] = [];
      for (const b of rawBlocks) {
        if ((b.tagName === 'UL' || b.tagName === 'OL' || b.tagName === 'BLOCKQUOTE') && b.offsetHeight > PAGED_BODY_H_PX && b.children.length > 1) {
          const items = Array.from(b.children) as HTMLElement[];
          const parsedStart = b.tagName === 'OL' ? parseInt(b.getAttribute('start') ?? '1', 10) : 1;
          const baseStart = Number.isNaN(parsedStart) ? 1 : parsedStart;
          let itemIndex = 0;
          let subList = b.cloneNode(false) as HTMLElement;
          let subH = 0;
          for (const item of items) {
            const ih = item.offsetHeight || 28;
            if (subH + ih > PAGED_BODY_H_PX && subList.children.length) {
              splitBlocks.push(subList);
              subList = b.cloneNode(false) as HTMLElement;
              if (b.tagName === 'OL') subList.setAttribute('start', String(baseStart + itemIndex));
              subH = 0;
            }
            subList.appendChild(item);
            subH += ih;
            itemIndex++;
          }
          if (subList.children.length) splitBlocks.push(subList);
        } else {
          splitBlocks.push(b);
        }
      }
      // Re-mount split blocks into measureBox so their offsetHeight values are live in the DOM
      measureBox.replaceChildren(...splitBlocks);
    }

    const blocks = Array.from(measureBox.children) as HTMLElement[];
    const groups: HTMLElement[][] = [];
    if (opts.mode === 'long') {
      // Single long image mode: always keep the entire document in 1 card
      groups.push(blocks);
    } else {
      let current: HTMLElement[] = [];
      let used = 0;
      for (const block of blocks) {
        const cs = getComputedStyle(block);
        const h = block.offsetHeight + parseFloat(cs.marginTop || '0') + parseFloat(cs.marginBottom || '0');
        if (used + h > PAGED_BODY_H_PX && current.length) {
          groups.push(current);
          current = [];
          used = 0;
        }
        current.push(block);
        used += h;
      }
      if (current.length) groups.push(current);
      if (!groups.length) groups.push([]);
    }

    const formattedDate = formatDateTime(doc.publishedAt);

    const blobs: Blob[] = [];
    for (const [idx, group] of groups.entries()) {
      if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      opts.onProgress?.(idx + 1, groups.length);

      const frame = document.createElement('div');
      frame.style.cssText = `width:${CARD_W_PX}px;padding:14px;box-sizing:border-box;background:${p.outerBg};`;

      const card = document.createElement('div');
      card.style.cssText = `background:${p.cardBg};color:${p.text};border:1px solid ${p.border};border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.08);`;

      card.appendChild(createCardHeader(doc, p, safeAvatar, formattedDate));

      const body = document.createElement('div');
      body.dir = contentDir;
      if (contentLang) body.lang = contentLang;
      body.style.cssText = 'padding:18px 22px 10px;';
      group.forEach(el => body.appendChild(el));
      if (body.lastElementChild) {
        (body.lastElementChild as HTMLElement).style.marginBottom = '8px';
      }
      card.appendChild(body);

      card.appendChild(createCardFooter(p, opts, idx, groups.length));
      frame.appendChild(card);
      host.replaceChildren(frame);

      // Wait for avatar and QR images inside frame
      await Promise.all(
        Array.from(frame.querySelectorAll('img')).map(img =>
          img.complete
            ? null
            : new Promise(r => {
                img.onload = img.onerror = r;
                setTimeout(r, 2000);
              }),
        ),
      );
      if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      const totalH = Math.max(frame.offsetHeight, 400);
      // Keep canvas area within iOS Safari's 16.7MP limit (14.5MP budget) and single-axis <= 32,000px.
      // Never allow a lower bound to override safeMaxScale.
      const maxScaleArea = Math.sqrt(14_500_000 / (CARD_W_PX * totalH));
      const maxScaleAxis = 32_000 / totalH;
      const safeMaxScale = Math.floor(Math.min(maxScaleArea, maxScaleAxis) * 1000) / 1000;
      const scale = Math.min(2.5, safeMaxScale);

      const canvas = await html2canvas(frame, {
        scale,
        useCORS: true,
        backgroundColor: p.outerBg,
        logging: false,
      });

      try {
        if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
        });
        if (opts.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        blobs.push(blob);
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }
    }

    return blobs;
  } finally {
    host.remove();
    blobUrls.forEach(u => URL.revokeObjectURL(u));
  }
}
