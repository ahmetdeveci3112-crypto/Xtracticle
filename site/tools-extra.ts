/**
 * Extra English landing pages: "unroll twitter thread" (read-first intent) and
 * "tweet to pdf" (single-post intent). Same structure as the pages in pages.ts.
 */

import { privacy, samplePdfFigure, shortcuts, steps, type SitePage } from './blocks';

const unroll: SitePage = {
  id: 'unroll',
  group: 'unroll',
  path: '/unroll-twitter-thread',
  file: 'unroll-twitter-thread.html',
  lang: 'en',
  title: 'Unroll Twitter Thread — Read It as One Page | Xtracticle',
  description:
    'Unroll any Twitter/X thread into one clean page, instantly. Paste any post — no bot to tag, no login. Then save it as PDF, Markdown or EPUB. Free.',
  h1: 'Unroll Twitter Thread',
  sub: 'Read any X (Twitter) thread as one clean page. Paste a link to any post of the thread — no bot, no login.',
  primary: 'md',
  nav: 'Unroll Twitter Thread',
  sections: `
<section>
  <p><strong>Xtracticle is a free tool to unroll a Twitter (X) thread:</strong> paste the link of any post in the thread and the
  author's whole self-thread appears below as one continuous, numbered page you can read straight away. Saving it is optional — no
  account, no ads, and nobody gets a notification.</p>
  <h2>Unroll a thread in three steps</h2>
  ${steps([
    '<strong>Copy the link</strong> of any post in the thread — the first, one in the middle or the last (Share → Copy link).',
    '<strong>Paste it above</strong> and press Extract. The thread opens as a single page, in order.',
    '<strong>Read it here</strong>, press <em>Listen</em> to hear it read aloud, or download it as Markdown, PDF, EPUB or text.',
  ])}
</section>

<section>
  <h2>What "unroll" means here</h2>
  <p>A thread is a chain of posts where the author keeps replying to themselves. Scrolling it on X means loading each post, skipping
  other people's replies and losing your place. Unrolling joins the author's posts into one document, numbered
  (<code>1/12</code>, <code>2/12</code>…), keeping line breaks, photos, quoted posts and video thumbnails.</p>
  <ul>
    <li><strong>Any post works.</strong> You don't need the first one; paste whichever you have.</li>
    <li><strong>Only the author's posts.</strong> Replies from other people are left out.</li>
    <li><strong>Lots of link types.</strong> x.com, twitter.com, fxtwitter, vxtwitter, nitter and xcancel links, <code>/i/web/status/</code> links and bare post IDs all work.</li>
    <li><strong>Public threads only.</strong> Private accounts can't be read.</li>
  </ul>
</section>

<section>
  <h2>Unroll without mentioning a bot</h2>
  <p>The classic way to unroll a thread is to reply under it with <em>@threadreaderapp unroll</em> and wait. That approach has real
  upsides, such as a shareable page that others can find. It also has costs worth knowing about:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Mentioning a bot</th><th>Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Speed</td><td>Wait until the bot replies</td><td>Instant, right after you paste</td></tr>
      <tr><td>Visibility</td><td>Your request is a public reply</td><td>Nothing is posted; it's private</td></tr>
      <tr><td>Account</td><td>Needs an X account to mention the bot</td><td>No login</td></tr>
      <tr><td>Formats</td><td>A web page</td><td>Page, PDF, Markdown, EPUB, text, ZIP</td></tr>
      <tr><td>Public page for others</td><td>Yes, a shared URL</td><td>No, you share the file or the link instead</td></tr>
    </tbody>
  </table></div>
  <p>See the longer, <a href="/thread-reader-app-alternative">honest comparison with Thread Reader App</a>.</p>
</section>

<section>
  <h2>Read it, then keep it</h2>
  <p>Unrolling is for reading, but threads don't last forever: authors delete posts and accounts go private. Once you have the thread
  on screen you can save a copy in the format that suits you.</p>
  <ul>
    <li><a href="/x-thread-to-pdf">Thread to PDF</a> — a numbered, printable document with photos, source link and page numbers. The PDF is image-based, so its text can't be selected.</li>
    <li><a href="/x-article-to-markdown">Markdown</a> — selectable text with optional YAML front-matter, for Obsidian, Notion or an AI assistant.</li>
    <li><a href="/x-article-to-epub">EPUB 3</a> — a reflowable e-book for your e-reader.</li>
    <li><strong>ZIP with images</strong> — Markdown plus every image saved locally.</li>
    <li><strong>Plain text</strong>, or a one-click export for Obsidian.</li>
  </ul>
  <p>Have a pile of threads? Switch to Batch mode, paste up to 20 links and get one ZIP of Markdown files.</p>
  <p>Looking for an X Article rather than a thread? Use the <a href="/x-article-to-pdf">X Article to PDF</a> page. The tool is also on the <a href="/">home page</a>, and the <a href="/guides">guides</a> cover common workflows.</p>
</section>

${shortcuts('en')}

${privacy('en')}`,
  faq: [
    { q: 'How do I unroll a Twitter thread?', a: 'Copy the link of any post in the thread, paste it into Xtracticle and press Extract. The whole thread opens as one numbered page.' },
    { q: 'Do I need the first post of the thread?', a: 'No. The first, a middle or the last post all work. Xtracticle finds the rest of the author’s thread.' },
    { q: 'Do I have to tag a bot like @threadreaderapp?', a: 'No. Nothing is posted or mentioned. You paste a link and read the result immediately, without an account.' },
    { q: 'Are replies from other people included?', a: 'No. Only the author’s own posts in the thread are merged, in order.' },
    { q: 'Can I listen to a thread instead of reading it?', a: 'Yes. Use the Listen button to have the thread read aloud.' },
    { q: 'Can I save the unrolled thread afterwards?', a: 'Yes, as PDF, Markdown (with optional YAML front-matter), EPUB, plain text or a ZIP with images. Batch mode takes up to 20 links and returns one ZIP of Markdown files.' },
    { q: 'Does it work for private accounts?', a: 'No. Only public threads can be unrolled.' },
  ],
};

const tweetpdf: SitePage = {
  id: 'tweetpdf',
  group: 'tweetpdf',
  path: '/tweet-to-pdf',
  file: 'tweet-to-pdf.html',
  lang: 'en',
  title: 'Tweet to PDF — Save Any X Post as PDF | Xtracticle',
  description:
    'Save any tweet or X post as a clean A4 PDF with photos, quoted post, date and source link. Free, no login, no watermark — works on iPhone and Android.',
  h1: 'Tweet to PDF',
  sub: 'Save any X (Twitter) post as a clean A4 PDF — text, photos, quoted post, date and source link included.',
  primary: 'pdf',
  nav: 'Tweet to PDF',
  sections: `
<section>
  <p><strong>Xtracticle is a free tweet to PDF converter:</strong> paste the link of a single X (Twitter) post and download it as a
  tidy A4 PDF — no screenshots, no account, no watermark. It works on iPhone, Android and desktop.</p>
  <h2>Save a tweet as PDF in three steps</h2>
  ${steps([
    '<strong>Copy the post link</strong> (Share → Copy link). Links from x.com, twitter.com, fxtwitter, vxtwitter, nitter and xcancel work, and so does a bare post ID.',
    '<strong>Paste it above</strong> and press Extract.',
    '<strong>Click PDF</strong> — the file downloads immediately.',
  ])}
</section>

<section>
  <h2>What the PDF contains</h2>
  <ul>
    <li><strong>The full text</strong>, with the author's original line breaks.</li>
    <li><strong>Photos</strong> in place, scaled to fit the page.</li>
    <li><strong>The quoted post</strong>, if the tweet quotes another one.</li>
    <li><strong>Author and date</strong> at the top.</li>
    <li><strong>A clickable source link</strong> back to the original post, plus page numbers.</li>
    <li><strong>Videos as linked thumbnails</strong>, since a PDF can't play video.</li>
  </ul>
  <p>The page is a clean A4 sheet — no X sidebar, buttons, trending topics or replies.</p>
  ${samplePdfFigure('en')}
  <p>The PDF is image-based, which keeps the layout exact but means the text isn't selectable. If you need to search or copy the
  text, export <a href="/x-article-to-markdown">Markdown</a> or <a href="/x-article-to-epub">EPUB</a> instead.</p>
</section>

<section>
  <h2>Why save a tweet as PDF?</h2>
  <ul>
    <li><strong>Receipts and confirmations</strong> — a company's public statement about a refund, a delay or a promise.</li>
    <li><strong>Announcements</strong> — release notes, job posts, event details and policy changes you want to keep.</li>
    <li><strong>Evidence and citations</strong> — a dated copy with the source link, easier to hand to someone than a cropped screenshot.</li>
    <li><strong>Research notes</strong> — file the post next to your sources, with author and date attached.</li>
  </ul>
  <p>Keep in mind that a PDF is a record of what the post said when you saved it. It isn't a legally certified document.</p>
</section>

<section>
  <h2>Posts, threads and Articles</h2>
  <h3>A single tweet</h3>
  <p>That is this page. One link, one PDF.</p>
  <h3>A thread</h3>
  <p>If the post is part of a thread, use the <a href="/x-thread-to-pdf">thread to PDF</a> page. Paste any post of the thread and all
  of the author's posts are merged into one numbered PDF. To read a thread on screen first, try
  <a href="/unroll-twitter-thread">unroll Twitter thread</a>.</p>
  <h3>A long-form Article</h3>
  <p>X Articles keep their headings, lists and inline images. Use <a href="/x-article-to-pdf">X Article to PDF</a>.</p>
</section>

<section>
  <h2>Deleted posts</h2>
  <p>Xtracticle reads public posts that are still online. If a post has already been deleted, or its account has gone private,
  it can't be saved afterwards. That's the reason to export a copy while it's live. Read
  <a href="/guides/recover-deleted-tweets">what you can and cannot recover</a>. Need several posts? Batch mode takes up to 20 links
  and returns one ZIP of Markdown files. The tool is on the <a href="/">home page</a>, and the <a href="/guides">guides</a> have more workflows.</p>
</section>

${shortcuts('en')}

${privacy('en')}`,
  faq: [
    { q: 'How do I save a tweet as a PDF?', a: 'Copy the post link (Share → Copy link), paste it into Xtracticle, press Extract and click PDF.' },
    { q: 'Does the PDF include photos and the quoted post?', a: 'Yes. Photos and the post it quotes are included. Videos appear as a thumbnail linked to the video.' },
    { q: 'Is the tweet to PDF converter free?', a: 'Yes. It is free, needs no login and adds no watermark.' },
    { q: 'Can I select or search the text in the PDF?', a: 'No. The PDF is image-based to keep the layout exact. Use the Markdown or EPUB export if you need selectable text.' },
    { q: 'Can I save a tweet that was already deleted?', a: 'No. Only public posts that are still online can be saved, so export a copy before it disappears.' },
    { q: 'What about threads and long Articles?', a: 'For threads use the X thread to PDF page, which merges the author’s whole thread. For long-form Articles use X Article to PDF.' },
    { q: 'Can I save several tweets at once?', a: 'Yes. Batch mode accepts up to 20 links and returns them as Markdown files in one ZIP. For PDFs, save each post separately.' },
  ],
};

export const TOOL_PAGES_EN: SitePage[] = [unroll, tweetpdf];
