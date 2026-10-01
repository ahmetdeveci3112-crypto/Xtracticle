/**
 * Static, crawlable landing pages. Each page = the same React tool (mounted in
 * #root) + unique, visible HTML content targeting one search intent.
 * Rendered at build time by site/plugin.ts; nothing here ships to the client.
 */

import { EXAMPLE, GITHUB, SITE, privacy, shortcuts, steps, type SitePage } from './blocks';
import { PAGES_TR } from './pages-tr';
import { PAGES_ES } from './pages-es';
import { PAGES_PT } from './pages-pt';
import { PAGES_JA } from './pages-ja';

export type { SitePage, FAQ, ExportKey, Lang } from './blocks';
export { SITE };

/* ─── Pages ─── */

const home: SitePage = {
  id: 'home',
  group: 'home',
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
    <div><h3><a href="/x-article-to-pdf">X article to PDF</a></h3><p>A4, print-ready, images inline, source link and page numbers on every page.</p></div>
    <div><h3><a href="/x-article-to-markdown">X article to Markdown</a></h3><p>Headings, bold, links, lists, quotes and images preserved. Optional YAML front-matter.</p></div>
    <div><h3><a href="/x-article-to-epub">X article to EPUB / Kindle</a></h3><p>Read long articles on Kindle, Kobo or Apple Books — images embedded.</p></div>
    <div><h3><a href="/save-x-articles-to-obsidian">Save X articles to Obsidian</a></h3><p>One click opens a new note in your vault with the full article and metadata.</p></div>
    <div><h3>ZIP + images</h3><p>Markdown plus every image saved locally — a real offline archive that survives deleted posts.</p></div>
    <div><h3>Plain text</h3><p>Clean .txt for any device, script or AI tool.</p></div>
  </div>
</section>

<section>
  <h2>Articles, threads and single posts</h2>
  <p><strong>X Articles</strong> (long-form posts up to 100,000 characters) are converted block by block: headings, bold, italic,
  strikethrough, links, bullet and numbered lists, quotes, code, dividers, cover image, inline images, videos and embedded posts.</p>
  <p><strong>Threads</strong> are unrolled automatically. Paste the first, a middle or the last post — Xtracticle finds the whole
  self-thread and merges it into one numbered document. Try the <a href="/x-thread-to-pdf">X thread downloader</a>.</p>
  <p><strong>Single posts</strong> keep their text, line breaks, photos, videos and quoted posts. Need many at once? Switch to
  <em>Batch mode</em> and paste up to 20 links to get one ZIP.</p>
</section>

${shortcuts('en')}

<section>
  <h2>Xtracticle vs. other ways to save X posts</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th><th>Screenshots / copy-paste</th></tr></thead>
    <tbody>
      <tr><td>X Articles (long-form)</td><td>✅ Full formatting</td><td>❌ Not supported</td><td>⚠️ Manual</td></tr>
      <tr><td>Free PDF</td><td>✅</td><td>Premium ($3/mo)</td><td>⚠️ Images only</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>No mention or login</td><td>✅</td><td>Mention the bot or use the site</td><td>✅</td></tr>
      <tr><td>Open source</td><td>✅</td><td>❌</td><td>—</td></tr>
    </tbody>
  </table></div>
  <p>Coming from Thread Reader App? See the <a href="/thread-reader-app-alternative">full comparison</a>.</p>
</section>

${privacy('en')}`,
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
  group: 'pdf',
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

${privacy('en')}`,
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
  group: 'markdown',
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

${shortcuts('en')}`,
  faq: [
    { q: 'How do I convert a tweet to Markdown?', a: 'Paste the post link into Xtracticle and click Markdown, or Copy to put the Markdown on your clipboard.' },
    { q: 'Are images included in the Markdown?', a: 'Yes, as image links. Choose ZIP + images to also download every image and have the Markdown point to the local copies.' },
    { q: 'Does it convert threads to Markdown?', a: 'Yes. Paste any post of a thread; all posts are merged into one numbered Markdown document.' },
    { q: 'Can I turn off the YAML front-matter?', a: 'Yes. Untick the front-matter option under the download buttons. Your choice is remembered.' },
  ],
};

const thread: SitePage = {
  id: 'thread',
  group: 'thread',
  path: '/x-thread-to-pdf',
  file: 'x-thread-to-pdf.html',
  lang: 'en',
  title: 'X Thread Downloader — Unroll & Save Twitter Threads as PDF or Markdown | Xtracticle',
  description:
    'Download and unroll any X (Twitter) thread as one PDF, Markdown, EPUB or text file. Paste any post of the thread — no bot mention, no login, free.',
  h1: 'X Thread Downloader',
  sub: 'Unroll any X (Twitter) thread and save it as one clean PDF, Markdown, EPUB or text file. Paste any post of the thread.',
  primary: 'pdf',
  nav: 'X Thread Downloader',
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

${shortcuts('en')}`,
  faq: [
    { q: 'Do I need the first tweet of the thread?', a: 'No. Paste any post of the thread and the entire thread is assembled.' },
    { q: 'Are replies from other people included?', a: 'No. Only the author’s own posts in the thread are included, in order.' },
    { q: 'Do I need to tag a bot like @threadreaderapp?', a: 'No. There is nothing to post or tag — paste the link and download.' },
    { q: 'Can I unroll a thread from a private account?', a: 'No. Only public threads are accessible.' },
  ],
};

const obsidian: SitePage = {
  id: 'obsidian',
  group: 'obsidian',
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

${shortcuts('en')}`,
  faq: [
    { q: 'Nothing happens when I click Obsidian.', a: 'Obsidian must be installed on this device. The Markdown is also copied to your clipboard, so you can paste it into any note.' },
    { q: 'Does it work with Obsidian on iPhone or Android?', a: 'Yes, if the Obsidian app is installed. Otherwise use Copy or download the .md file.' },
    { q: 'How do I keep images inside my vault?', a: 'Download ZIP + images and extract it into your vault. The Markdown links point to the local images folder.' },
    { q: 'Does it work with Logseq, Notion or Bear?', a: 'Yes — download or copy the Markdown and import or paste it.' },
  ],
};

const epub: SitePage = {
  id: 'epub',
  group: 'epub',
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

${privacy('en')}`,
  faq: [
    { q: 'Does Kindle support EPUB?', a: 'Yes. Amazon’s Send to Kindle accepts EPUB files and converts them for your device automatically.' },
    { q: 'Can I read it in Apple Books?', a: 'Yes. Open the downloaded .epub on your iPhone, iPad or Mac and choose Books.' },
    { q: 'Are images included?', a: 'Yes, images are embedded in the EPUB. Videos are linked.' },
    { q: 'Can I convert a thread to EPUB?', a: 'Yes. Paste any post of the thread and the whole thread becomes one e-book.' },
  ],
};


const alternative: SitePage = {
  id: 'tra-alternative',
  group: 'tra',
  path: '/thread-reader-app-alternative',
  file: 'thread-reader-app-alternative.html',
  lang: 'en',
  title: 'Free Thread Reader App Alternative — PDF, Markdown & X Articles | Xtracticle',
  description:
    'Looking for a Thread Reader App alternative? Xtracticle unrolls X threads and saves X Articles as PDF, Markdown, EPUB or text for free — no bot mention, no ads, no login.',
  h1: 'A Free Thread Reader App Alternative',
  sub: 'Unroll X threads and save X Articles as PDF, Markdown, EPUB or text — free, no bot mention, no ads, no login.',
  primary: 'pdf',
  nav: 'Thread Reader App alternative',
  sections: `
<section>
  <h2>Why people look for an alternative</h2>
  <p><a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a> is a well-known way to unroll threads:
  you mention <code>@threadreaderapp unroll</code> under a thread, or paste a link on its website. It works well for reading.
  The friction starts when you want to <strong>keep</strong> what you read:</p>
  <ul>
    <li><strong>PDF export is a Premium feature</strong> ($3/month or $30/year at the time of writing).</li>
    <li><strong>X Articles aren’t supported</strong> — their help page says the X API doesn’t provide access to Article content.</li>
    <li><strong>The free version shows ads</strong>, and there’s no Markdown, EPUB or Obsidian export.</li>
  </ul>
  <p>Xtracticle focuses on exactly that part: turning threads and long-form X Articles into files you own — for free.</p>
</section>

<section>
  <h2>Side-by-side comparison</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>Unroll threads</td><td>✅ Paste any post of the thread</td><td>✅ Mention the bot or paste a link</td></tr>
      <tr><td>X Articles (long-form)</td><td>✅ Headings, lists, images, videos</td><td>❌ Not supported</td></tr>
      <tr><td>PDF</td><td>✅ Free</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ Free, with YAML front-matter</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ Free</td><td>❌</td></tr>
      <tr><td>ZIP with images (offline archive)</td><td>✅ Free</td><td>❌</td></tr>
      <tr><td>Batch download</td><td>✅ Up to 20 links</td><td>❌</td></tr>
      <tr><td>Ads</td><td>None</td><td>On the free plan</td></tr>
      <tr><td>Posting in public / tagging a bot</td><td>Never needed</td><td>For the bot method</td></tr>
      <tr><td>Author alerts & auto-archiving</td><td>❌ Not yet</td><td>✅ Premium</td></tr>
      <tr><td>Open source</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>Checked against Thread Reader App’s <a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a> and
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">Help</a> pages in September 2026. Features change — let us know on
  <a href="${GITHUB}/issues" rel="noopener">GitHub</a> if something is out of date.</small></p>
</section>

<section>
  <h2>Switching takes ten seconds</h2>
  ${steps([
    '<strong>Copy the link</strong> of any post in the thread — no need to find the first one.',
    '<strong>Paste it above</strong> and press Extract. The whole thread is merged and numbered.',
    '<strong>Download</strong> as PDF, Markdown, EPUB or text — or send it to Obsidian.',
  ])}
</section>

<section>
  <h2>When Thread Reader App is still the better choice</h2>
  <p>If you want to <strong>unroll a thread for other people right inside X</strong> (replying with the bot so everyone in the conversation gets a
  readable link), or you want <strong>automatic alerts and archives</strong> for your favorite authors, Thread Reader App does that and
  Xtracticle doesn’t. Many people use both: Thread Reader App to read in the moment, Xtracticle to keep a copy.</p>
</section>

${shortcuts('en')}`,
  faq: [
    { q: 'Is Xtracticle really free?', a: 'Yes. Every format — PDF, Markdown, EPUB, ZIP and text — is free, with no ads, no login and no usage limits. The code is open source.' },
    { q: 'Can Xtracticle download X Articles?', a: 'Yes. Xtracticle converts X’s long-form Articles with their headings, lists, links, images and videos. This is one of the main differences from Thread Reader App.' },
    { q: 'Do I need to tag a bot?', a: 'No. Paste the link on Xtracticle; nothing is posted on X.' },
    { q: 'Can I import my Thread Reader App archive?', a: 'Not directly. You can paste the original X links (up to 20 at a time in Batch mode) to rebuild them as Markdown files.' },
  ],
};

const notFound: SitePage = {
  id: '404',
  group: '404',
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

const PAGES_EN: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];

/** Order = footer order within each language. */
export const PAGES: SitePage[] = [...PAGES_EN, ...PAGES_ES, ...PAGES_PT, ...PAGES_JA, ...PAGES_TR, notFound];

export function pageForPath(pathname: string): SitePage {
  const clean = pathname.split('?')[0].replace(/\.html$/, '');
  return PAGES.find(p => p.path === clean || (p.path.endsWith('/') && p.path === clean + '/')) || home;
}

export const GITHUB_URL = GITHUB;
