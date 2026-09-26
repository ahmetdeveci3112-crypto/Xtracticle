import type { FxTweet } from '../shared/fx';
import { titleFromText } from '../shared/text';

/**
 * Converts fxtwitter posts (single post, self-thread, or X Article) into a
 * portable document: Markdown + plain text + metadata used by every exporter.
 */

export interface Labels {
  author: string;
  date: string;
  source: string;
  image: string;
  video: string;
  embeddedPost: string;
  quoting: string;
}

export interface XDoc {
  kind: 'article' | 'thread' | 'post';
  id: string;
  title: string;
  author: { name: string; handle: string; avatar?: string };
  sourceUrl: string;
  publishedAt: string | null;
  lang?: string;
  /** Header (title, author, date, source) + body. */
  md: string;
  txt: string;
  /** Body only, without the metadata header. */
  bodyMd: string;
  images: string[];
  postCount: number;
  wordCount: number;
  readingMinutes: number;
}

/* ─── Small builders ─── */

class Out {
  md: string[] = [];
  txt: string[] = [];
  images: string[] = [];
  push(md: string, txt: string = md) {
    this.md.push(md);
    this.txt.push(txt);
  }
  image(url: string, alt: string, L: Labels) {
    if (!url) return;
    this.images.push(url);
    this.push(`![${escapeAlt(alt)}](${url})`, `[${L.image}: ${url}]`);
  }
  video(url: string, thumb: string | undefined, L: Labels) {
    if (!url) return;
    if (thumb) {
      this.images.push(thumb);
      this.push(`[![▶ ${L.video}](${thumb})](${url})`, `[${L.video}: ${url}]`);
    } else {
      this.push(`[▶ ${L.video}](${url})`, `[${L.video}: ${url}]`);
    }
  }
}

const TXT_RULE = '----------------------------------------';

function escapeAlt(s: string) {
  return s.replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim();
}

/** Keep single line breaks from posts (Markdown would otherwise merge them). */
function hardBreaks(text: string) {
  return text
    .split(/\n{2,}/)
    .map(p => p.split('\n').join('  \n'))
    .join('\n\n');
}

function quoteLines(text: string) {
  return text
    .split('\n')
    .map(l => (l.trim() ? `> ${l}` : '>'))
    .join('\n');
}

function countWords(text: string) {
  const m = text.replace(/!\[[^\]]*\]\([^)]*\)|\]\([^)]*\)|https?:\/\/\S+/g, ' ').match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

/* ─── Draft.js (X Articles) ─── */

interface Block {
  text: string;
  type: string;
  depth?: number;
  entityRanges?: { offset: number; length: number; key: number | string }[];
  inlineStyleRanges?: { offset: number; length: number; style: string }[];
}

function entityLookup(entityMap: any) {
  return (key: number | string) => {
    if (!entityMap) return undefined;
    if (Array.isArray(entityMap)) return entityMap.find((e: any) => String(e.key) === String(key))?.value;
    return entityMap[key];
  };
}

const STYLE_TAGS: Record<string, string> = { Bold: '**', BOLD: '**', Italic: '*', ITALIC: '*', Strikethrough: '~~', STRIKETHROUGH: '~~', CODE: '`' };

/** Apply inline styles + links to a block's text, character-range aware. */
function formatInline(block: Block, getEntity: (k: number | string) => any): string {
  const chars = Array.from(block.text); // code points, not UTF-16 units
  const units = block.text; // Draft.js offsets are UTF-16 based
  // Map UTF-16 offset → code point index
  const cpIndex: number[] = [];
  let cp = 0;
  for (let i = 0; i < units.length; i++) {
    cpIndex[i] = cp;
    const code = units.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      cpIndex[i + 1] = cp;
      i++;
    }
    cp++;
  }
  cpIndex[units.length] = cp;

  const pre: string[][] = chars.map(() => []);
  const post: string[][] = chars.map(() => []);

  const range = (offset: number, length: number): [number, number] | null => {
    let start = cpIndex[Math.min(offset, units.length)];
    let end = cpIndex[Math.min(offset + length, units.length)] - 1;
    // Markdown emphasis can't start/end on whitespace — shrink the range.
    while (start <= end && /\s/.test(chars[start])) start++;
    while (end >= start && /\s/.test(chars[end])) end--;
    return start <= end ? [start, end] : null;
  };

  for (const s of block.inlineStyleRanges || []) {
    const tag = STYLE_TAGS[s.style];
    const r = tag ? range(s.offset, s.length) : null;
    if (!r) continue;
    pre[r[0]].push(tag);
    post[r[1]].unshift(tag);
  }
  for (const er of block.entityRanges || []) {
    const entity = getEntity(er.key);
    if (entity?.type !== 'LINK' || !entity.data?.url) continue;
    const r = range(er.offset, er.length);
    if (!r) continue;
    pre[r[0]].unshift('[');
    post[r[1]].push(`](${entity.data.url})`);
  }

  let out = '';
  chars.forEach((c, i) => {
    out += pre[i].join('') + c + post[i].join('');
  });
  return out.replace(/\n/g, '  \n');
}

function mediaUrlFor(mediaId: string | undefined, mediaEntities: any[]) {
  const m = mediaEntities.find((x: any) => String(x.media_id) === String(mediaId));
  const info = m?.media_info;
  if (!info) return { image: '', video: '' };
  const image = info.original_img_url || info.preview_image?.original_img_url || '';
  let video = '';
  if (Array.isArray(info.variants)) {
    const mp4 = info.variants
      .filter((v: any) => (v.content_type || '').includes('mp4') && v.url)
      .sort((a: any, b: any) => (b.bit_rate || 0) - (a.bit_rate || 0));
    video = mp4[0]?.url || '';
  }
  return { image, video };
}

function renderArticle(article: any, out: Out, L: Labels) {
  const blocks: Block[] = article.content?.blocks || [];
  const getEntity = entityLookup(article.content?.entityMap);
  const mediaEntities: any[] = article.media_entities || [];

  const cover = article.cover_media?.media_info?.original_img_url;
  if (cover) out.image(cover, article.title || '', L);

  let olCounters: number[] = [];
  let inCode = false;
  let codeBuf: string[] = [];
  let prevType = '';

  const flushCode = () => {
    if (!inCode) return;
    out.push('```\n' + codeBuf.join('\n') + '\n```', codeBuf.join('\n'));
    inCode = false;
    codeBuf = [];
  };

  blocks.forEach(block => {
    const type = block.type;
    const depth = Math.max(0, block.depth || 0);
    const isList = type === 'unordered-list-item' || type === 'ordered-list-item';

    if (type !== 'code-block') flushCode();
    if (type !== 'ordered-list-item' && prevType === 'ordered-list-item' && !isList) olCounters = [];

    // Lists are emitted as consecutive lines; join them with a single newline.
    const listContinuation = isList && (prevType === 'unordered-list-item' || prevType === 'ordered-list-item');
    const emit = (md: string, txt: string) => {
      if (listContinuation) {
        out.md[out.md.length - 1] += '\n' + md;
        out.txt[out.txt.length - 1] += '\n' + txt;
      } else out.push(md, txt);
    };

    if (type === 'atomic') {
      const entity = block.entityRanges?.length ? getEntity(block.entityRanges[0].key) : undefined;
      if (entity?.type === 'DIVIDER') out.push('---', TXT_RULE);
      else if (entity?.type === 'MEDIA') {
        const caption = entity.data?.caption || '';
        for (const item of entity.data?.mediaItems || []) {
          const { image, video } = mediaUrlFor(item.mediaId, mediaEntities);
          if (video) out.video(video, image, L);
          else if (image) out.image(image, caption, L);
        }
        if (caption) out.push(`*${caption.trim()}*`, caption.trim());
      } else if (entity?.type === 'TWEET' && entity.data?.tweetId) {
        const link = `https://x.com/i/status/${entity.data.tweetId}`;
        out.push(`> 🔗 ${L.embeddedPost}: ${link}`, `[${L.embeddedPost}: ${link}]`);
      }
      prevType = type;
      return;
    }

    if (type === 'code-block') {
      inCode = true;
      codeBuf.push(block.text);
      prevType = type;
      return;
    }

    if (!block.text.trim()) {
      prevType = type;
      return;
    }

    const md = formatInline(block, getEntity).trimEnd();
    const plain = block.text.trimEnd();
    const indent = '  '.repeat(depth);

    switch (type) {
      case 'header-one':
      case 'header-two':
        out.push(`## ${md}`, plain.toUpperCase());
        break;
      case 'header-three':
      case 'header-four':
      case 'header-five':
      case 'header-six':
        out.push(`### ${md}`, plain);
        break;
      case 'unordered-list-item':
        emit(`${indent}- ${md}`, `${indent}• ${plain}`);
        break;
      case 'ordered-list-item': {
        olCounters = olCounters.slice(0, depth + 1);
        olCounters[depth] = (olCounters[depth] || 0) + 1;
        const n = olCounters[depth];
        emit(`${indent}${n}. ${md}`, `${indent}${n}. ${plain}`);
        break;
      }
      case 'blockquote':
        out.push(quoteLines(md.replace(/ {2}\n/g, '\n')), `“${plain}”`);
        break;
      default:
        out.push(md, plain);
    }
    prevType = type;
  });
  flushCode();
}

/* ─── Regular posts ─── */

function renderPostBody(t: FxTweet, out: Out, L: Labels) {
  if (t.text) out.push(hardBreaks(t.text), t.text);
  t.media?.photos?.forEach((p, i) => out.image(p.url, p.altText || `${L.image} ${i + 1}`, L));
  t.media?.videos?.forEach(v => out.video(v.url, v.thumbnail_url, L));
  if (t.quote) {
    const q = t.quote;
    const qHead = `**${q.author.name}** (@${q.author.screen_name})`;
    const qBody = q.article?.title ? `**${q.article.title}**` : q.text;
    const qMedia = (q.media?.photos || []).map(p => `![${L.image}](${p.url})`).join('\n');
    q.media?.photos?.forEach(p => out.images.push(p.url));
    out.push(
      quoteLines(`${L.quoting} ${qHead}\n\n${qBody}${qMedia ? '\n\n' + qMedia : ''}\n\n${q.url}`),
      `${L.quoting} ${q.author.name} (@${q.author.screen_name}):\n“${q.article?.title || q.text}”\n${q.url}`,
    );
  }
}

/* ─── Public API ─── */

export function buildDoc(tweets: FxTweet[], L: Labels, locale: string): XDoc {
  const first = tweets[0];
  const isThread = tweets.length > 1;
  const kind: XDoc['kind'] = first.article ? 'article' : isThread ? 'thread' : 'post';
  const handle = first.author.screen_name || 'unknown';
  const name = first.author.name || handle;

  const title =
    (kind === 'article' && first.article?.title?.trim()) ||
    titleFromText(first.text) ||
    `@${handle}`;

  const out = new Out();
  if (kind === 'article') {
    renderArticle(first.article, out, L);
  } else if (isThread) {
    tweets.forEach((t, i) => {
      out.push(`**${i + 1}/${tweets.length}**`, `${i + 1}/${tweets.length}`);
      renderPostBody(t, out, L);
      if (i < tweets.length - 1) out.push('---', TXT_RULE);
    });
  } else {
    renderPostBody(first, out, L);
  }

  const date = first.created_at ? new Date(first.created_at) : null;
  const dateStr = date && !isNaN(+date)
    ? date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';
  const sourceUrl = `https://x.com/${handle}/status/${first.id}`;

  const headerMd = [
    `# ${title}`,
    [
      `**${L.author}** ${name} ([@${handle}](https://x.com/${handle}))`,
      dateStr && `**${L.date}** ${dateStr}`,
      `**${L.source}** ${sourceUrl}`,
    ].filter(Boolean).join('  \n'),
    '---',
  ];
  const headerTxt = [
    title,
    [`${L.author} ${name} (@${handle})`, dateStr && `${L.date} ${dateStr}`, `${L.source} ${sourceUrl}`].filter(Boolean).join('\n'),
    TXT_RULE,
  ];

  const bodyMd = out.md.join('\n\n');
  const wordCount = countWords(out.txt.join(' '));
  return {
    kind,
    id: first.id,
    title,
    author: { name, handle, avatar: first.author.avatar_url },
    sourceUrl,
    publishedAt: date && !isNaN(+date) ? date.toISOString() : null,
    lang: first.lang,
    md: [...headerMd, bodyMd].join('\n\n') + '\n',
    txt: [...headerTxt, out.txt.join('\n\n')].join('\n\n') + '\n',
    bodyMd,
    images: Array.from(new Set(out.images)),
    postCount: tweets.length,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 230)),
  };
}

/** YAML front-matter for Obsidian / static-site generators. */
export function frontMatter(doc: XDoc): string {
  const q = (s: string) => JSON.stringify(s);
  return [
    '---',
    `title: ${q(doc.title)}`,
    `author: ${q(`${doc.author.name} (@${doc.author.handle})`)}`,
    `source: ${q(doc.sourceUrl)}`,
    doc.publishedAt && `published: ${doc.publishedAt.slice(0, 10)}`,
    `saved: ${new Date().toISOString().slice(0, 10)}`,
    `type: ${doc.kind}`,
    `tags: [x, ${doc.kind}]`,
    '---',
  ].filter(Boolean).join('\n') + '\n\n';
}

export function slugify(text: string, max = 60) {
  const s = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.slice(0, max).replace(/-+$/, '');
}

export function fileBaseName(doc: XDoc) {
  const slug = slugify(doc.title);
  return slug ? `${doc.author.handle}-${slug}` : `${doc.author.handle}-${doc.id}`;
}
