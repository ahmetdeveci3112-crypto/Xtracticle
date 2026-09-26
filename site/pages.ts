/**
 * Static, crawlable landing pages. Each page = the same React tool (mounted in
 * #root) + unique, visible HTML content targeting one search intent.
 * Rendered at build time by site/plugin.ts; nothing here ships to the client.
 */

export type ExportKey = 'md' | 'pdf' | 'epub' | 'zip' | 'txt' | 'obsidian';

export interface FAQ {
  q: string;
  a: string;
}

export interface SitePage {
  id: string;
  path: string;
  file: string;
  lang: 'en' | 'tr';
  title: string;
  description: string;
  h1: string;
  sub: string;
  primary: ExportKey;
  nav: string;
  sections: string;
  faq: FAQ[];
  noindex?: boolean;
  isHome?: boolean;
}

export const SITE = 'https://xtracticle.com';
const GITHUB = 'https://github.com/ahmetdeveci3112-crypto/Xtracticle';
const EXAMPLE = '/Write/status/1765884209527394325';

const BOOKMARKLET =
  "javascript:(function(){location.href='https://xtracticle.com/?url='+encodeURIComponent(location.href)})()";

/* ─── Shared building blocks ─── */

const steps = (items: string[]) => `<ol class="xt-steps">${items.map(i => `<li>${i}</li>`).join('')}</ol>`;

const shortcutsEn = `
<section>
  <h2>Two shortcuts that save time</h2>
  <h3>1. Swap the domain</h3>
  <p>On any post, change <code>x.com</code> to <code>xtracticle.com</code> in the address bar and press Enter:
  <code>x.com/user/status/123</code> → <code>xtracticle.com/user/status/123</code>. The post opens here, ready to download.</p>
  <h3>2. One-click bookmarklet</h3>
  <p>Drag this button to your bookmarks bar, then click it while reading any X post:
  <a class="xt-bookmarklet" href="${BOOKMARKLET}" onclick="event.preventDefault();alert('Drag this button to your bookmarks bar.')">⬇ Xtracticle</a></p>
  <p>On Android you can also install Xtracticle (Add to Home screen) and share posts to it straight from the X app.</p>
</section>`;

const shortcutsTr = `
<section>
  <h2>Zaman kazandıran iki kısayol</h2>
  <h3>1. Alan adını değiştirin</h3>
  <p>Herhangi bir gönderide adres çubuğundaki <code>x.com</code> kısmını <code>xtracticle.com</code> yapıp Enter'a basın:
  <code>x.com/kullanici/status/123</code> → <code>xtracticle.com/kullanici/status/123</code>. Gönderi burada, indirmeye hazır açılır.</p>
  <h3>2. Tek tıkla yer imi</h3>
  <p>Bu butonu yer imleri çubuğunuza sürükleyin, sonra X'te bir gönderiyi okurken tıklayın:
  <a class="xt-bookmarklet" href="${BOOKMARKLET}" onclick="event.preventDefault();alert('Bu butonu yer imleri çubuğuna sürükleyin.')">⬇ Xtracticle</a></p>
  <p>Android'de Xtracticle'ı ana ekrana ekleyerek X uygulamasından gönderileri doğrudan paylaşabilirsiniz.</p>
</section>`;

const privacyEn = `
<section>
  <h2>Privacy</h2>
  <p>No account, no login, no upload. Xtracticle fetches the public post on demand through the open-source
  <a href="https://github.com/FixTweet/FxTwitter" rel="noopener">FxTwitter</a> API and builds your file in your browser.
  We don't store the posts you extract. We use Google Analytics to count anonymous visits and downloads so we know which features matter.
  The <a href="${GITHUB}" rel="noopener">source code is on GitHub</a>.</p>
</section>`;

const privacyTr = `
<section>
  <h2>Gizlilik</h2>
  <p>Hesap yok, giriş yok, yükleme yok. Xtracticle herkese açık gönderiyi açık kaynak
  <a href="https://github.com/FixTweet/FxTwitter" rel="noopener">FxTwitter</a> API'si üzerinden anlık olarak alır ve dosyanızı tarayıcınızda oluşturur.
  Çıkardığınız gönderileri saklamayız. Hangi özelliklerin kullanıldığını anlamak için anonim ziyaret ve indirme sayılarını Google Analytics ile ölçeriz.
  <a href="${GITHUB}" rel="noopener">Kaynak kodu GitHub'da</a>.</p>
</section>`;

/* ─── Pages ─── */

const home: SitePage = {
  id: 'home',
  path: '/',
  file: 'index.html',
  lang: 'en',
  isHome: true,
  title: 'X Article Downloader — Save X Articles & Threads as PDF, Markdown | Xtracticle',
  description:
    'Download X (Twitter) articles, threads and posts as PDF, Markdown, EPUB/Kindle or text. Paste a link, get a clean file with images — free, no login, open source.',
  h1: 'X Article Downloader',
  sub: 'Download X (Twitter) articles, threads and posts as PDF, Markdown, EPUB or text — free, no login.',
  primary: 'md',
  nav: 'X Article Downloader',
  sections: `
<section>
  <h2>How to download an X article</h2>
  ${steps([
    '<strong>Copy the post link</strong> — on X tap <em>Share → Copy link</em>. Any post of a thread works.',
    '<strong>Paste it above</strong> — Xtracticle fetches the article, thread or post in a second or two.',
    '<strong>Pick a format</strong> — PDF, Markdown, EPUB/Kindle, ZIP with images or plain text.',
    '<strong>Done</strong> — or copy it, send it to Obsidian, or listen to it read aloud.',
  ])}
  <p>Want to see the result first? <a href="${EXAMPLE}">Open an example X article</a>.</p>
</section>

<section>
  <h2>Every format you need</h2>
  <div class="xt-grid">
    <div><h3><a href="/x-article-to-pdf">PDF</a></h3><p>A4, print-ready, images inline, source link and page numbers on every page.</p></div>
    <div><h3><a href="/x-article-to-markdown">Markdown (.md)</a></h3><p>Headings, bold, links, lists, quotes and images preserved. Optional YAML front-matter.</p></div>
    <div><h3><a href="/x-article-to-epub">EPUB / Kindle</a></h3><p>Read long articles on Kindle, Kobo or Apple Books — images embedded.</p></div>
    <div><h3><a href="/save-x-articles-to-obsidian">Obsidian</a></h3><p>One click opens a new note in your vault with the full article and metadata.</p></div>
    <div><h3>ZIP + images</h3><p>Markdown plus every image saved locally — a real offline archive that survives deleted posts.</p></div>
    <div><h3>Plain text</h3><p>Clean .txt for any device, script or AI tool.</p></div>
  </div>
</section>

<section>
  <h2>Articles, threads and single posts</h2>
  <p><strong>X Articles</strong> (long-form posts up to 100,000 characters) are converted block by block: headings, bold, italic,
  strikethrough, links, bullet and numbered lists, quotes, code, dividers, cover image, inline images, videos and embedded posts.</p>
  <p><strong>Threads</strong> are unrolled automatically. Paste the first, a middle or the last post — Xtracticle finds the whole
  self-thread and merges it into one numbered document. See <a href="/x-thread-to-pdf">thread to PDF</a>.</p>
  <p><strong>Single posts</strong> keep their text, line breaks, photos, videos and quoted posts. Need many at once? Switch to
  <em>Batch mode</em> and paste up to 20 links to get one ZIP.</p>
</section>

${shortcutsEn}

<section>
  <h2>Xtracticle vs. other ways to save X posts</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th><th>Screenshots / copy-paste</th></tr></thead>
    <tbody>
      <tr><td>X Articles (long-form)</td><td>✅ Full formatting</td><td>Threads focus</td><td>⚠️ Manual</td></tr>
      <tr><td>Free PDF</td><td>✅</td><td>Premium</td><td>⚠️ Images only</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>No mention or login</td><td>✅</td><td>Mention the bot or use the site</td><td>✅</td></tr>
      <tr><td>Open source</td><td>✅</td><td>❌</td><td>—</td></tr>
    </tbody>
  </table></div>
</section>

${privacyEn}`,
  faq: [
    { q: 'Is Xtracticle free?', a: 'Yes. It is free and open source, with no account, no login and no usage limits.' },
    { q: 'How do I download an X article as PDF?', a: 'Copy the post link, paste it into Xtracticle, and click PDF. The PDF includes the title, author, date, source link, all images and page numbers.' },
    { q: 'Can I download a whole Twitter thread?', a: 'Yes. Paste the link of any post in the thread — first, middle or last. Xtracticle finds every post the author wrote in that thread and merges them into one numbered document.' },
    { q: 'What is the difference between an X Article and a post?', a: 'X Articles are long-form posts with rich formatting (headings, lists, images). Regular posts are short. Xtracticle supports both, plus threads.' },
    { q: 'Can I save X articles to Obsidian or Notion?', a: 'Yes. Download the Markdown file or click the Obsidian button, which copies the article and opens a new note. Notion imports .md files directly.' },
    { q: 'Why does it say a post was not found?', a: 'The post may be deleted, from a private (protected) account, or age-restricted. Only public posts can be downloaded.' },
    { q: 'I have an x.com/i/article/… link. What do I do?', a: 'That is the article reader link. Open the article on X, tap Share → Copy link to get the post link (x.com/user/status/…), and paste that.' },
  ],
};

const pdf: SitePage = {
  id: 'pdf',
  path: '/x-article-to-pdf',
  file: 'x-article-to-pdf.html',
  lang: 'en',
  title: 'X Article to PDF — Convert X (Twitter) Articles to PDF Free | Xtracticle',
  description:
    'Convert any X (Twitter) article or post to a clean, print-ready PDF with images, source link and page numbers. Free, no login, works on iPhone, Android and desktop.',
  h1: 'X Article to PDF',
  sub: 'Turn any X (Twitter) article, thread or post into a clean, print-ready PDF — images included, no login.',
  primary: 'pdf',
  nav: 'X Article to PDF',
  sections: `
<section>
  <h2>Convert an X article to PDF in three steps</h2>
  ${steps([
    '<strong>Copy the link</strong> of the X article (Share → Copy link).',
    '<strong>Paste it above</strong> and press Extract.',
    '<strong>Click PDF</strong> — the file downloads instantly.',
  ])}
</section>

<section>
  <h2>What your PDF looks like</h2>
  <ul>
    <li><strong>A clean A4 layout</strong> — no X sidebar, buttons, replies or ads. Just the article.</li>
    <li><strong>Title, author, date and source link</strong> at the top, so the PDF is citable.</li>
    <li><strong>Cover and inline images</strong> in place, scaled to fit the page.</li>
    <li><strong>Page numbers</strong> and a clickable link back to the original post in the footer.</li>
    <li><strong>No cut-off lines</strong> — pages break between paragraphs, not through them, even for very long articles.</li>
  </ul>
</section>

<section>
  <h2>Tips</h2>
  <h3>Need selectable, searchable text?</h3>
  <p>The PDF is rendered for pixel-perfect layout. If you want to highlight or search the text, use the <a href="/x-article-to-epub">EPUB</a>
  or <a href="/x-article-to-markdown">Markdown</a> export — or press <code>Ctrl/Cmd + P</code> on the result and choose <em>Save as PDF</em>.</p>
  <h3>Threads to PDF</h3>
  <p>Paste any post of a thread and the whole thread becomes one PDF. More on <a href="/x-thread-to-pdf">thread to PDF</a>.</p>
  <h3>On iPhone</h3>
  <p>Tap PDF, then open the download from the Safari downloads list and use <em>Share → Save to Files</em> or send it to Books.</p>
</section>

${privacyEn}`,
  faq: [
    { q: 'Is the X to PDF converter free?', a: 'Yes, completely free with no watermark, no login and no limits.' },
    { q: 'Does the PDF include images?', a: 'Yes. The cover image and every inline image are included. Videos appear as a thumbnail linked to the video.' },
    { q: 'Can I convert a Twitter thread to PDF?', a: 'Yes. Paste the link of any post in the thread and Xtracticle merges the whole thread into a single PDF.' },
    { q: 'Does it work on mobile?', a: 'Yes. It runs in any modern browser on iPhone, Android, Mac, Windows and Linux.' },
    { q: 'Can I convert private or deleted posts?', a: 'No. Only public posts that are still online can be converted — which is exactly why saving a PDF copy is useful.' },
  ],
};

const markdown: SitePage = {
  id: 'markdown',
  path: '/x-article-to-markdown',
  file: 'x-article-to-markdown.html',
  lang: 'en',
  title: 'X Article to Markdown — Convert X (Twitter) Posts & Threads to .md | Xtracticle',
  description:
    'Convert X (Twitter) articles, threads and posts to clean Markdown with headings, links, lists, images and YAML front-matter. Perfect for Obsidian, Notion, GitHub and AI tools.',
  h1: 'X Article to Markdown',
  sub: 'Convert X (Twitter) articles, threads and posts to clean Markdown — formatting, links and images preserved.',
  primary: 'md',
  nav: 'X Article to Markdown',
  sections: `
<section>
  <h2>Clean Markdown, not a copy-paste mess</h2>
  <p>X Articles are stored as rich-text blocks. Xtracticle converts each block to proper Markdown so it renders correctly everywhere:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>On X</th><th>In your .md file</th></tr></thead>
    <tbody>
      <tr><td>Heading / Subheading</td><td><code>## Heading</code> / <code>### Subheading</code></td></tr>
      <tr><td>Bold, italic, strikethrough</td><td><code>**bold**</code>, <code>*italic*</code>, <code>~~strike~~</code></td></tr>
      <tr><td>Links</td><td><code>[text](https://…)</code></td></tr>
      <tr><td>Bullet / numbered lists (nested)</td><td><code>- item</code> / <code>1. item</code></td></tr>
      <tr><td>Quotes, code, dividers</td><td><code>&gt; quote</code>, fenced code, <code>---</code></td></tr>
      <tr><td>Images and videos</td><td><code>![caption](url)</code>, linked video thumbnail</td></tr>
      <tr><td>Embedded posts</td><td>Link to the embedded post</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>YAML front-matter included</h2>
  <p>Each file can start with metadata that Obsidian (Properties), Hugo, Jekyll, Astro and Dataview understand:</p>
  <pre><code>---
title: "The article title"
author: "Author Name (@handle)"
source: "https://x.com/handle/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>Don't want it? Untick <em>Add YAML front-matter</em> under the download buttons.</p>
</section>

<section>
  <h2>Great for</h2>
  <ul>
    <li><strong>Note-taking</strong> — Obsidian, Logseq, Notion, Bear, Joplin and any Markdown editor. See the <a href="/save-x-articles-to-obsidian">Obsidian guide</a>.</li>
    <li><strong>AI tools</strong> — Markdown is the cleanest context for ChatGPT, Claude, Gemini or NotebookLM: paste it to summarize, translate or ask questions.</li>
    <li><strong>Writing and publishing</strong> — quote sources in blog posts, newsletters, docs and GitHub READMEs.</li>
    <li><strong>Archiving</strong> — download <em>ZIP + images</em> to keep every image locally next to the .md file.</li>
  </ul>
</section>

${shortcutsEn}`,
  faq: [
    { q: 'How do I convert a tweet to Markdown?', a: 'Paste the post link into Xtracticle and click Markdown, or Copy to put the Markdown on your clipboard.' },
    { q: 'Are images included in the Markdown?', a: 'Yes, as image links. Choose ZIP + images to also download every image and have the Markdown point to the local copies.' },
    { q: 'Does it convert threads to Markdown?', a: 'Yes. Paste any post of a thread; all posts are merged into one numbered Markdown document.' },
    { q: 'Can I turn off the YAML front-matter?', a: 'Yes. Untick the front-matter option under the download buttons. Your choice is remembered.' },
  ],
};

const thread: SitePage = {
  id: 'thread',
  path: '/x-thread-to-pdf',
  file: 'x-thread-to-pdf.html',
  lang: 'en',
  title: 'Twitter Thread to PDF — Unroll & Save X Threads as PDF or Markdown | Xtracticle',
  description:
    'Unroll any X (Twitter) thread and save it as one PDF, Markdown, EPUB or text file. Paste any post of the thread — no bot mention, no login, free.',
  h1: 'Twitter Thread to PDF',
  sub: 'Unroll any X (Twitter) thread into one clean document — PDF, Markdown, EPUB or text. Paste any post of the thread.',
  primary: 'pdf',
  nav: 'Thread to PDF',
  sections: `
<section>
  <h2>Unroll a thread in seconds</h2>
  ${steps([
    '<strong>Copy the link</strong> of any post in the thread — the first, one in the middle, or the last.',
    '<strong>Paste it above.</strong> Xtracticle finds every post the author wrote in that thread.',
    '<strong>Download</strong> the merged, numbered thread as PDF, Markdown, EPUB or text.',
  ])}
</section>

<section>
  <h2>How thread unrolling works</h2>
  <p>A thread is a chain of posts where the author replies to themselves. Xtracticle reads that chain and keeps only the author's own
  posts, in order — replies from other people are left out. Each post is numbered (<code>1/12</code>, <code>2/12</code>…) and keeps its
  line breaks, photos, videos and quoted posts.</p>
  <p>No need to mention a bot under the thread or wait for a reply: it happens right here, privately.</p>
</section>

<section>
  <h2>Why save threads?</h2>
  <ul>
    <li><strong>Read comfortably</strong> — one continuous document instead of scrolling post by post.</li>
    <li><strong>Keep it forever</strong> — threads get deleted and accounts go private. A PDF or <em>ZIP + images</em> copy stays yours.</li>
    <li><strong>Study and share</strong> — send the PDF to your team, print it, or load the Markdown into your notes or an AI assistant.</li>
    <li><strong>On your e-reader</strong> — export to <a href="/x-article-to-epub">EPUB for Kindle</a>.</li>
  </ul>
</section>

${shortcutsEn}`,
  faq: [
    { q: 'Do I need the first tweet of the thread?', a: 'No. Paste any post of the thread and the entire thread is assembled.' },
    { q: 'Are replies from other people included?', a: 'No. Only the author’s own posts in the thread are included, in order.' },
    { q: 'Do I need to tag a bot like @threadreaderapp?', a: 'No. There is nothing to post or tag — paste the link and download.' },
    { q: 'Can I unroll a thread from a private account?', a: 'No. Only public threads are accessible.' },
  ],
};

const obsidian: SitePage = {
  id: 'obsidian',
  path: '/save-x-articles-to-obsidian',
  file: 'save-x-articles-to-obsidian.html',
  lang: 'en',
  title: 'Save X (Twitter) Articles & Threads to Obsidian — One Click | Xtracticle',
  description:
    'Clip X (Twitter) articles and threads into Obsidian as clean Markdown with properties (author, source, date, tags). One click, local images optional, free and open source.',
  h1: 'Save X Articles to Obsidian',
  sub: 'Clip X (Twitter) articles and threads into your Obsidian vault as clean Markdown with properties — in one click.',
  primary: 'obsidian',
  nav: 'X to Obsidian',
  sections: `
<section>
  <h2>From X to your vault</h2>
  ${steps([
    '<strong>Paste the post link</strong> above and press Extract.',
    '<strong>Click “Obsidian”.</strong> The Markdown is copied and Obsidian opens a new note with it.',
    '<strong>Done</strong> — title, author, source, dates and tags are already in the note properties.',
  ])}
  <p>Prefer files? Download <strong>Markdown</strong> and drop it into your vault, or <strong>ZIP + images</strong> to keep images offline in an <code>images/</code> folder next to the note.</p>
</section>

<section>
  <h2>Properties you can query</h2>
  <p>Every note gets <code>title</code>, <code>author</code>, <code>source</code>, <code>published</code>, <code>saved</code>, <code>type</code> (article, thread or post) and <code>tags</code>.
  With Dataview you can list everything you saved from X:</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>Why not a web clipper?</h2>
  <p>Generic clippers struggle with X: the page needs a login, the content loads dynamically and threads are split across many posts.
  Xtracticle reads the post data directly, so X Articles keep their headings and lists and threads arrive as one note.</p>
</section>

${shortcutsEn}`,
  faq: [
    { q: 'Nothing happens when I click Obsidian.', a: 'Obsidian must be installed on this device. The Markdown is also copied to your clipboard, so you can paste it into any note.' },
    { q: 'Does it work with Obsidian on iPhone or Android?', a: 'Yes, if the Obsidian app is installed. Otherwise use Copy or download the .md file.' },
    { q: 'How do I keep images inside my vault?', a: 'Download ZIP + images and extract it into your vault. The Markdown links point to the local images folder.' },
    { q: 'Does it work with Logseq, Notion or Bear?', a: 'Yes — download or copy the Markdown and import or paste it.' },
  ],
};

const epub: SitePage = {
  id: 'epub',
  path: '/x-article-to-epub',
  file: 'x-article-to-epub.html',
  lang: 'en',
  title: 'X Article to EPUB & Kindle — Read X (Twitter) Articles on Your E-reader | Xtracticle',
  description:
    'Convert X (Twitter) articles and threads to EPUB and send them to Kindle, Kobo, Apple Books or Google Play Books. Images embedded, free, no login.',
  h1: 'X Article to EPUB & Kindle',
  sub: 'Read long X (Twitter) articles and threads on your Kindle, Kobo or Apple Books — as a real e-book with images.',
  primary: 'epub',
  nav: 'X to Kindle / EPUB',
  sections: `
<section>
  <h2>Send an X article to your Kindle</h2>
  ${steps([
    '<strong>Paste the post link</strong> above and press Extract.',
    '<strong>Click “EPUB / Kindle”</strong> to download the e-book.',
    '<strong>Send it to Kindle</strong> with the Send to Kindle app or web page, or by emailing it to your Kindle address.',
  ])}
</section>

<section>
  <h2>A proper e-book, not a screenshot</h2>
  <ul>
    <li><strong>Reflowable text</strong> — change the font and size on your device.</li>
    <li><strong>Images embedded</strong> inside the file, so it works offline.</li>
    <li><strong>Metadata</strong> — the title and author show up correctly in your library.</li>
    <li><strong>Standard EPUB 3</strong> — works with Kindle (via Send to Kindle), Kobo, Apple Books, Google Play Books, PocketBook and Calibre.</li>
  </ul>
</section>

<section>
  <h2>Great for long reads</h2>
  <p>X Articles can be up to 100,000 characters and threads can run to dozens of posts. Reading them on an e-ink screen is easier on the eyes,
  distraction-free and works without a connection. Save a few before a flight, or build a reading list for the weekend.</p>
</section>

${privacyEn}`,
  faq: [
    { q: 'Does Kindle support EPUB?', a: 'Yes. Amazon’s Send to Kindle accepts EPUB files and converts them for your device automatically.' },
    { q: 'Can I read it in Apple Books?', a: 'Yes. Open the downloaded .epub on your iPhone, iPad or Mac and choose Books.' },
    { q: 'Are images included?', a: 'Yes, images are embedded in the EPUB. Videos are linked.' },
    { q: 'Can I convert a thread to EPUB?', a: 'Yes. Paste any post of the thread and the whole thread becomes one e-book.' },
  ],
};

const trHome: SitePage = {
  id: 'tr-home',
  path: '/tr/',
  file: 'tr/index.html',
  lang: 'tr',
  isHome: true,
  title: "X Makale İndir — X (Twitter) Makale ve Flood'larını PDF, Markdown Olarak Kaydet | Xtracticle",
  description:
    "X (Twitter) makalelerini, flood'larını ve gönderilerini PDF, Markdown, EPUB/Kindle veya metin olarak indirin. Link yapıştırın, görselli temiz dosyayı alın — ücretsiz, giriş yok.",
  h1: 'X Makale İndirici',
  sub: "X (Twitter) makalelerini, flood'larını ve gönderilerini PDF, Markdown, EPUB veya metin olarak indirin — ücretsiz, giriş gerektirmez.",
  primary: 'md',
  nav: 'Türkçe',
  sections: `
<section>
  <h2>X makalesi nasıl indirilir?</h2>
  ${steps([
    '<strong>Gönderi linkini kopyalayın</strong> — X’te <em>Paylaş → Linki kopyala</em>. Flood’un herhangi bir tweeti olur.',
    '<strong>Yukarıya yapıştırın</strong> — Xtracticle makaleyi, flood’u veya gönderiyi birkaç saniyede getirir.',
    '<strong>Format seçin</strong> — PDF, Markdown, EPUB/Kindle, görselli ZIP veya düz metin.',
    '<strong>Hepsi bu</strong> — isterseniz kopyalayın, Obsidian’a gönderin veya sesli dinleyin.',
  ])}
</section>

<section>
  <h2>İhtiyacınız olan her format</h2>
  <div class="xt-grid">
    <div><h3>PDF</h3><p>A4, yazdırmaya hazır; görseller, kaynak linki ve sayfa numaraları dahil.</p></div>
    <div><h3>Markdown (.md)</h3><p>Başlıklar, kalın/italik, linkler, listeler, alıntılar ve görseller korunur. İsteğe bağlı YAML front-matter.</p></div>
    <div><h3>EPUB / Kindle</h3><p>Uzun makaleleri Kindle, Kobo veya Apple Books’ta okuyun.</p></div>
    <div><h3>Obsidian</h3><p>Tek tıkla kasanızda makalenin tamamını ve bilgilerini içeren yeni not açılır.</p></div>
    <div><h3>ZIP + görseller</h3><p>Markdown ve tüm görseller yerel olarak — gönderi silinse bile kalıcı arşiv.</p></div>
    <div><h3>Düz metin</h3><p>Her cihaz, betik veya yapay zekâ aracı için temiz .txt.</p></div>
  </div>
</section>

<section>
  <h2>Makaleler, flood’lar ve tekil gönderiler</h2>
  <p><strong>X Makaleleri</strong> (100.000 karaktere kadar uzun gönderiler) blok blok dönüştürülür: başlıklar, kalın, italik, üstü çizili,
  linkler, madde ve numaralı listeler, alıntılar, kod, ayraçlar, kapak görseli, görseller, videolar ve gömülü gönderiler.</p>
  <p><strong>Flood’lar</strong> otomatik birleştirilir. İlk, ortadaki ya da son tweeti yapıştırın — Xtracticle yazarın flood’unun tamamını bulur
  ve numaralı tek bir belgeye dönüştürür.</p>
  <p><strong>Tekil gönderiler</strong> metnini, satır sonlarını, fotoğraflarını, videolarını ve alıntıladığı gönderiyi korur. Çok sayıda gönderi mi var?
  <em>Toplu mod</em>’a geçip 20 linke kadar yapıştırın, tek bir ZIP alın.</p>
</section>

${shortcutsTr}

${privacyTr}`,
  faq: [
    { q: 'Xtracticle ücretsiz mi?', a: 'Evet. Ücretsiz ve açık kaynak; hesap, giriş veya kullanım sınırı yok.' },
    { q: 'X makalesi PDF olarak nasıl indirilir?', a: 'Gönderi linkini kopyalayıp Xtracticle’a yapıştırın ve PDF’e tıklayın. PDF; başlık, yazar, tarih, kaynak linki, tüm görseller ve sayfa numaralarını içerir.' },
    { q: 'Flood’un tamamını indirebilir miyim?', a: 'Evet. Flood’un herhangi bir tweetinin linkini yapıştırın — ilk, orta veya son. Yazarın o flood’daki tüm tweetleri numaralı tek bir belgede birleştirilir.' },
    { q: 'X makalelerini Obsidian’a veya Notion’a kaydedebilir miyim?', a: 'Evet. Markdown dosyasını indirin veya Obsidian butonuna tıklayın. Notion .md dosyalarını doğrudan içe aktarır.' },
    { q: 'Neden “gönderi bulunamadı” diyor?', a: 'Gönderi silinmiş, gizli (korumalı) bir hesaba ait ya da yaş kısıtlamalı olabilir. Yalnızca herkese açık gönderiler indirilebilir.' },
    { q: 'Elimde x.com/i/article/… linki var, ne yapmalıyım?', a: 'Bu makale okuyucu linkidir. Makaleyi X’te açıp Paylaş → Linki kopyala diyerek gönderi linkini (x.com/kullanici/status/…) alın ve onu yapıştırın.' },
  ],
};

const notFound: SitePage = {
  id: '404',
  path: '/404',
  file: '404.html',
  lang: 'en',
  noindex: true,
  title: 'Page not found | Xtracticle',
  description: 'This page does not exist. Paste an X post link to download it as PDF, Markdown, EPUB or text.',
  h1: 'Page not found',
  sub: 'This page doesn’t exist — but you can still paste an X post link below to download it.',
  primary: 'md',
  nav: '',
  sections: '',
  faq: [],
};

/** Order = footer order. */
export const PAGES: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, trHome, notFound];

export function pageForPath(pathname: string): SitePage {
  const clean = pathname.split('?')[0].replace(/\.html$/, '');
  return PAGES.find(p => p.path === clean || (p.path.endsWith('/') && p.path === clean + '/')) || home;
}

export const GITHUB_URL = GITHUB;
