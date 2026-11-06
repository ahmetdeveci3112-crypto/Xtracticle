/**
 * Extra English landing pages: "unroll twitter thread" (read-first intent),
 * "tweet to pdf" (single-post intent) and "deleted tweet finder" (profile → archived posts).
 * Same structure as the pages in pages.ts.
 */

import { privacy, samplePdfFigure, shortcuts, steps, type SitePage } from './blocks';

const unroll: SitePage = {
  id: 'unroll',
  group: 'unroll',
  path: '/unroll-twitter-thread',
  file: 'unroll-twitter-thread.html',
  lang: 'en',
  title: 'Unroll Thread Instantly: Any Twitter/X Thread, No Bot | Xtracticle',
  description:
    'Paste any post of a Twitter/X thread and read the whole thread on one clean page. No @threadreaderapp mention, no login. Save it as PDF, Markdown or EPUB. Free.',
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
  title: 'Tweet to PDF: Free X Post Downloader, No Login | Xtracticle',
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

const deletedFinder: SitePage = {
  id: 'deleted-finder',
  group: 'deleted-finder',
  path: '/deleted-tweet-finder',
  file: 'deleted-tweet-finder.html',
  lang: 'en',
  title: 'Deleted Tweet Finder: See Deleted Tweets, Free | Xtracticle',
  description:
    'Paste a profile link or @handle and we search the Wayback Machine for snapshots of that account’s posts, including deleted ones. Free, no login.',
  h1: 'Deleted Tweet Finder',
  sub: 'Paste an X (Twitter) profile link or @username, not a post link, to list the archived copies of that account’s posts on the Wayback Machine.',
  primary: 'md',
  nav: 'Deleted Tweet Finder',
  sections: `
<section>
  <p><strong>Xtracticle’s deleted tweet finder searches the Wayback Machine for an account’s posts.</strong> Type an @username or paste a
  profile link and you get the posts of that account that the Internet Archive captured, newest first, each with a link to its
  snapshot. If a post was deleted from X after someone archived it, the snapshot is how you see it again. It’s free and needs no account.</p>
  <h2>Find deleted tweets in three steps</h2>
  ${steps([
    '<strong>Enter the account</strong>: type <code>@username</code> or paste the profile link (<code>x.com/username</code>). Use the profile, not a single post link.',
    '<strong>Press Extract.</strong> Xtracticle asks the Wayback Machine for every post of that account it has captured. The archive is slow, so this can take up to a minute.',
    '<strong>Open a snapshot.</strong> The list shows up to 50 archived posts, newest first, with their dates. <em>Open snapshot</em> shows the archived copy; <em>Try live post</em> checks whether the post is still on X.',
  ])}
</section>

<section>
  <h2>What it can find, and what it can’t</h2>
  <p>A deleted post can only be seen if a copy was made before it disappeared. This tool looks for one kind of copy, Wayback Machine snapshots, and is
  honest about the gaps:</p>
  <ul>
    <li><strong>It finds archived posts.</strong> Any post of the account that the Wayback Machine captured, whether it is still online or was deleted later.</li>
    <li><strong>It can’t find posts nobody archived.</strong> A post deleted before anyone saved it is gone. No tool can bring it back, because X no longer serves it.</li>
    <li><strong>It doesn’t mark which posts were deleted.</strong> X doesn’t say. Use <em>Try live post</em>: if the post opens, it is still online; if it comes back as not found, it was deleted or the account went private.</li>
    <li><strong>Private accounts can’t be read.</strong> Protected posts were never public, so archives normally have nothing either.</li>
    <li><strong>Snapshots vary.</strong> Older snapshots usually contain the text. Snapshots from 2020 onward sometimes show an empty X page.</li>
    <li><strong>Busy accounts are trimmed.</strong> The list shows the newest 50 archived posts; the total count is shown above it.</li>
  </ul>
  <p>For an account that is still live, the same panel has a <em>Download latest 20 posts (ZIP)</em> button. It saves the account’s 20 most recent
  public posts as Markdown files while they are still online, which is the only reliable way to keep a post for later.</p>
</section>

<section>
  <h2>Looking for one deleted post?</h2>
  <p>If you have the link of the post itself (<code>x.com/username/status/…</code>), paste that instead. When X no longer serves the post,
  Xtracticle shows one-click searches for that exact post on the Wayback Machine and on archive.today, plus a shortcut to the account’s other
  archived posts. A search can still come back empty: archives only hold copies someone made before the deletion. The
  <a href="/guides/find-tweets-on-wayback-machine">Wayback Machine guide</a> covers the manual searches step by step.</p>
</section>

<section>
  <h2>Free lookup or paid deleted-tweet tracker?</h2>
  <p>Paid tracker services such as TrackTweets watch an account and keep a copy of every post it deletes from the day you start tracking.
  They answer a different question from this page, and they cost money per account:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Paid tracker</th></tr></thead>
    <tbody>
      <tr><td>Finds</td><td>Posts archived in the past, including ones deleted before you looked</td><td>Posts deleted after you start tracking</td></tr>
      <tr><td>Price</td><td>Free · Pro from $36/year for the full list and CSV</td><td>About $9 a month per account (TrackTweets, at the time of writing)</td></tr>
      <tr><td>Account</td><td>No login, nothing to connect</td><td>Sign-up and subscription</td></tr>
      <tr><td>Best for</td><td>A one-off look at what an account posted</td><td>Ongoing monitoring of specific accounts</td></tr>
    </tbody>
  </table></div>
  <p>Need more than the newest 50? <a href="/pro">Xtracticle Pro</a> shows every archived post the Wayback Machine holds for an account
  (up to 1,500) and exports it as CSV. From $3 a month billed yearly, or $59 once. Pro also includes <a href="/pro#watch">Watch</a>:
  it checks up to 5 public accounts every hour (2 on lifetime) and keeps the text of any post that gets deleted, delivered as a feed or an e-mail digest.</p>
</section>

<section>
  <h2>Learn more</h2>
  <ul>
    <li><a href="/guides/how-to-see-deleted-tweets">How to see deleted tweets</a>: every place a copy might exist, and what never works.</li>
    <li><a href="/guides/recover-deleted-tweets">Can you recover deleted tweets?</a>: your own posts, your X data archive and the limits.</li>
    <li><a href="/guides/find-tweets-on-wayback-machine">How to find tweets on the Wayback Machine</a>: manual searches and wildcard URLs.</li>
  </ul>
  <p>To save a post or thread that is still online, use the tool on the <a href="/">home page</a>,
  <a href="/unroll-twitter-thread">unroll a Twitter thread</a> to read it as one page, or keep it as a file with
  <a href="/x-thread-to-pdf">thread to PDF</a> and <a href="/tweet-to-pdf">tweet to PDF</a>.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'How do I find someone’s deleted tweets?', a: 'Type their @username or paste their profile link into Xtracticle and press Extract. It lists the posts of that account archived on the Wayback Machine, with a link to each snapshot. Deleted posts appear only if someone archived them before they were deleted.' },
    { q: 'Can it show a deleted tweet that was never archived?', a: 'No. Once a post is deleted, X stops serving it. If nobody archived it first, there is no copy left for any tool to show.' },
    { q: 'Does the list show which tweets were deleted?', a: 'No, because X does not report deletions. Press Try live post on an entry: if it opens, the post is still online; if it is not found, it was deleted or the account is private.' },
    { q: 'Is the deleted tweet finder free?', a: 'Yes. It is free, needs no login and never asks you to connect your X account.' },
    { q: 'Can I search for one specific deleted post?', a: 'Yes. Paste the post link instead of the profile. If X no longer serves it, Xtracticle offers one-click searches for that post on the Wayback Machine and archive.today.' },
    { q: 'Does it work for private accounts?', a: 'No. Protected posts were never public, so they can’t be read and archives normally don’t have them.' },
  ],
};

export const TOOL_PAGES_EN: SitePage[] = [unroll, tweetpdf, deletedFinder];
