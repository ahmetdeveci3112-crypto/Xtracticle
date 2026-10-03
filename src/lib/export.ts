import type { XDoc } from '../shared/convert';

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

export async function buildEpub(doc: XDoc, contentEl: HTMLElement, lang: string): Promise<Blob> {
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
  colophon.append(`${EPUB_CREDIT[language] || EPUB_CREDIT.en} `);
  const creditLink = document.createElement('a');
  creditLink.setAttribute('href', creditUrl('epub'));
  creditLink.textContent = 'Xtracticle';
  colophon.append(creditLink, ' · ');
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
      pdf.textWithLink(credit, (pageW - pdf.getTextWidth(credit)) / 2, pageH - 8, { url: creditUrl('pdf') });
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
