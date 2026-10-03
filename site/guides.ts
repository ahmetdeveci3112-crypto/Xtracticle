/**
 * English "guide" pages: informational articles that answer real questions about X (Twitter)
 * Articles, threads and archiving, and point readers to the tool. Facts about X are written
 * "at the time of writing (October 2026)" because X changes these rules often.
 */
import { privacy, type FAQ, type ExportKey, type SitePage } from './blocks';

const HUB = '/guides';
const WHEN = 'at the time of writing (October 2026)';

const back = `<p><a href="${HUB}">← All guides</a></p>`;

const takeaways = (items: string[]) =>
  `<section>
  <h2>Key takeaways</h2>
  <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
</section>`;

interface GuideInput {
  slug: string;
  title: string;
  description: string;
  h1: string;
  sub: string;
  primary: ExportKey;
  sections: string;
  faq: FAQ[];
}

const guide = (g: GuideInput): SitePage => ({
  id: `guide-${g.slug}`,
  group: `guide-${g.slug}`,
  path: `${HUB}/${g.slug}`,
  file: `guides/${g.slug}.html`,
  lang: 'en',
  title: g.title,
  description: g.description,
  h1: g.h1,
  sub: g.sub,
  primary: g.primary,
  nav: '',
  sections: `${g.sections}\n${back}`,
  faq: g.faq,
});

/* ─── 1. What are X Articles ─── */

const whatAre = guide({
  slug: 'what-are-x-articles',
  title: 'What Are X Articles? Who Can Publish and How to Save | Xtracticle',
  description:
    'X Articles are long-form posts on X (Twitter) with headings, images and lists. Who can publish them, how they differ from threads, and how to save them.',
  h1: 'What Are X Articles?',
  sub: 'X Articles are long-form, formatted posts published directly on X — here is who can write them, how they differ from threads, and how to keep a copy.',
  primary: 'pdf',
  sections: `
${takeaways([
  'An X Article is a long-form, formatted post (headings, images, lists) published natively on X instead of a chain of short posts.',
  `Publishing is a paid feature: ${WHEN}, X says it is limited to Premium, Premium+, Premium Business and Premium Organizations subscribers. Reading is not.`,
  'Articles are different from threads (many linked short posts) and from single long posts.',
  'To keep one, paste its link into <a href="/">Xtracticle</a> and download it as PDF, Markdown, EPUB or ZIP.',
])}

<section>
  <h2>What an X Article is</h2>
  <p>An X Article is a long-form piece of writing that lives on X as one document. Instead of splitting an idea into a numbered thread, the author writes a single article with a title, an optional cover image and structured text. X's help center describes Articles as "a new way to share long form written content on X".</p>
  <p>Articles can reach roughly 100,000 characters according to third-party guides, which is far beyond the 280 characters of a classic post. X has not, to our knowledge, published a single figure on its help page, so treat that number as approximate.</p>

  <h2>Who can publish X Articles</h2>
  <p>X launched Articles in March 2024 as a Premium+ feature. In January 2026 it widened access to all Premium subscribers, as reported by <a href="https://www.storyboard18.com/digital/x-expands-long-form-articles-access-to-all-premium-subscribers-87544.htm" rel="noopener nofollow">Storyboard18</a>. X's own <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">Articles help page</a> says that publishing is limited to Premium and Premium+ subscribers, Premium Businesses and Premium Organizations.</p>
  <p>Anyone can read a published Article, according to the audience controls its author chose. You do not need to pay to read one.</p>
</section>

<section>
  <h2>X Articles vs posts, threads and notes</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Post</th><th>Thread</th><th>X Article</th></tr></thead>
    <tbody>
      <tr><td>Structure</td><td>One short post</td><td>Several linked posts by one author</td><td>One document with a title</td></tr>
      <tr><td>Formatting</td><td>Plain text, media</td><td>Plain text, media per post</td><td>Headings, bold, italic, lists, embedded media</td></tr>
      <tr><td>Reading flow</td><td>Timeline</td><td>Scroll through replies-to-self</td><td>Dedicated reader view</td></tr>
      <tr><td>Who can create it</td><td>Anyone</td><td>Anyone</td><td>Paid subscribers</td></tr>
    </tbody>
  </table></div>
  <p>A thread is still just posts, so each part can be liked, replied to and quoted on its own. An Article is read as one piece. Longer single posts, available to some subscribers, are still plain posts and have no headings.</p>
</section>

<section>
  <h2>Formatting features</h2>
  <p>According to X's help page, Articles can contain images, video, GIFs, embedded posts and links, and text can be formatted with headings, subheadings, bold, italics, strikethrough, indentation, and numbered or bulleted lists. This is what makes them closer to a blog post than a thread.</p>

  <h2>How to find X Articles</h2>
  <ul>
    <li>Open the <strong>Articles</strong> tab in X's side navigation on desktop, if it is available to your account.</li>
    <li>Look at an author's profile: their Articles appear alongside their posts.</li>
    <li>Search for terms that appear in the title and filter to people you follow.</li>
    <li>For a weekly hand-picked list, see <a href="/best-x-articles">Best X Articles</a>.</li>
  </ul>
  <p>When you share an Article, X may give you an <code>x.com/i/article/…</code> reader link. The post link, <code>x.com/user/status/…</code>, is the one most tools expect.</p>
</section>

<section>
  <h2>How to save an X Article</h2>
  <p>X has no built-in "export as PDF" button for someone else's Article. The practical options are:</p>
  <ol>
    <li><strong>Browser print.</strong> Works, but includes X's interface and often cuts images across pages.</li>
    <li><strong>Copy and paste.</strong> Loses most of the formatting and the images.</li>
    <li><strong>Xtracticle.</strong> Paste the post link and download a clean file with the title, author, date, source link and images: <a href="/x-article-to-pdf">X Article to PDF</a>, <a href="/x-article-to-markdown">Markdown</a> or <a href="/x-article-to-epub">EPUB for Kindle</a>.</li>
  </ol>
  <p>Saving a copy matters because posts can be deleted by their authors or disappear if an account is suspended. See <a href="/guides/recover-deleted-tweets">what you can and cannot recover</a>.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'What is an X Article?', a: 'An X Article is a long-form post published natively on X, with a title, headings, lists, images and other media, instead of a chain of short posts.' },
    { q: 'Who can publish X Articles?', a: 'At the time of writing (October 2026), X says publishing is limited to Premium, Premium+, Premium Business and Premium Organizations subscribers. It opened to all Premium tiers in January 2026 after launching as a Premium+ feature in March 2024.' },
    { q: 'Do I need to pay to read an X Article?', a: 'No. Published Articles can be read by anyone, according to the audience settings the author chose.' },
    { q: 'How is an X Article different from a thread?', a: 'A thread is a series of separate posts, each with its own likes and replies. An Article is a single formatted document with a title and headings.' },
    { q: 'How do I save an X Article as PDF?', a: 'Copy the post link, paste it into Xtracticle and click PDF. You get a clean A4 file with images and a link back to the original.' },
  ],
});

/* ─── 2. Read without an account ─── */

const readWithout = guide({
  slug: 'read-x-articles-without-account',
  title: 'Read X Articles and Threads Without an Account | Xtracticle',
  description:
    'How to read X (Twitter) Articles, threads and posts without logging in: what works, what X blocks, and the x.com to xtracticle.com address trick.',
  h1: 'How to Read X Articles Without an Account',
  sub: 'Short version: swap x.com for xtracticle.com in the address and the public article opens in full, with no login.',
  primary: 'pdf',
  sections: `
${takeaways([
  'X often shows logged-out visitors a login prompt, a truncated view or an incomplete thread, and this behavior changes over time.',
  'Replace <code>x.com</code> with <code>xtracticle.com</code> in the address bar to read the full public article, thread or post without logging in.',
  'This only works for public content. Protected accounts, deleted posts and age-restricted posts cannot be shown.',
  'You can then download what you are reading as PDF, Markdown or EPUB.',
])}

<section>
  <h2>What happens when you open X logged out</h2>
  <p>Whether a logged-out visitor sees a full post depends on the content type, the country and X's current policy, and X has changed it more than once. In practice you may see a single post but not the replies, a prompt to sign in, or a partial thread. Because the rules shift, we do not promise any specific behavior of x.com itself.</p>
  <p>Public content is public, though. If an author has not protected their account, anyone is allowed to read the post. The issue is only how comfortably the official site lets you do so without signing in.</p>
</section>

<section>
  <h2>Method 1: swap the domain</h2>
  <p>On any X post or Article, change <code>x.com</code> to <code>xtracticle.com</code> in the address bar and press Enter.</p>
  ${'<p><code>x.com/user/status/123</code> → <code>xtracticle.com/user/status/123</code></p>'}
  <p>The page loads the public content through the open-source FxTwitter API and shows it as readable text with images. No account, no cookie banner on top of the article, no app install. Threads are unrolled into a single page when you open any post from the thread.</p>
  <p>On a phone, there is also a one-tap option: add the iPhone Shortcut or the browser bookmarklet from the <a href="/">home page</a>.</p>

  <h2>Method 2: paste the link</h2>
  ${'<ol class="xt-steps"><li>In the X app or on the site, tap <em>Share → Copy link</em>.</li><li>Open <a href="/">xtracticle.com</a> and paste the link.</li><li>Read it there, or download it as <a href="/x-article-to-pdf">PDF</a> to read offline.</li></ol>'}
  <p>If the link looks like <code>x.com/i/article/…</code>, open the Article on X and copy its post link instead (the one with <code>/status/</code>).</p>
</section>

<section>
  <h2>What works and what doesn't</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Content</th><th>Without login via Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Public X Article</td><td>Yes, full text, formatting and images</td></tr>
      <tr><td>Public thread</td><td>Yes, the author's own posts merged in order</td></tr>
      <tr><td>Single public post, with photos and quoted post</td><td>Yes</td></tr>
      <tr><td>Replies from other people</td><td>No, they are left out</td></tr>
      <tr><td>Protected (private) accounts</td><td>No</td></tr>
      <tr><td>Deleted or suspended content</td><td>No</td></tr>
      <tr><td>Age-restricted or login-only posts</td><td>Often no</td></tr>
    </tbody>
  </table></div>
  <p>If something shows as "not found", it is usually one of the last three rows.</p>
</section>

<section>
  <h2>Other ways to read without an account</h2>
  <ul>
    <li><strong>A search engine result.</strong> Some posts show a preview, but it is usually a snippet only.</li>
    <li><strong>Someone else's PDF or screenshot.</strong> Fine for reading, but you cannot verify it matches the original.</li>
    <li><strong>An RSS or email digest</strong> from the author, if they offer one.</li>
  </ul>
  <p>If you read X content regularly, saving the good ones is easier than hunting for them again. The <a href="/x-thread-to-pdf">X thread to PDF</a> page covers long threads.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'Can I read X Articles without an account?', a: 'Public Articles can be read without an account by swapping x.com for xtracticle.com in the address, or by pasting the link into Xtracticle. Protected or deleted posts cannot be shown.' },
    { q: 'How does the x.com to xtracticle.com trick work?', a: 'Xtracticle uses the same path as X. Changing only the domain, for example x.com/user/status/123 to xtracticle.com/user/status/123, opens that post here.' },
    { q: 'Does it show the replies?', a: 'No. For threads, it shows the posts written by the original author. Replies from other users are left out.' },
    { q: 'Why does a post say not found?', a: 'The post may be deleted, from a protected account, from a suspended account or age-restricted. Only public posts can be shown.' },
    { q: 'Is it legal to read posts this way?', a: 'It reads content that the author published publicly. Respect the author\'s copyright: saving a copy for your own reading is different from republishing it.' },
  ],
});

/* ─── 3. Recover deleted tweets ─── */

const deleted = guide({
  slug: 'recover-deleted-tweets',
  title: 'Can You Recover Deleted Tweets? What Actually Works | Xtracticle',
  description:
    'Honest guide to recovering deleted X (Twitter) posts: your data archive, Wayback Machine, archive.today, search cache and why saving early is the real fix.',
  h1: 'Can You Recover Deleted Tweets?',
  sub: 'Sometimes, but rarely from X itself. Here are the options that exist, how reliable each is, and how to avoid needing them.',
  primary: 'zip',
  sections: `
${takeaways([
  'Once a post is deleted, X no longer serves it, and tools like Xtracticle cannot fetch it either.',
  'Your own deleted posts may still be recoverable only if you have an old X data archive that was created before the deletion.',
  'Other people\'s deleted posts survive only if someone saved them: the Wayback Machine, archive.today or a screenshot. Coverage is patchy.',
  'The reliable fix is to save important posts and articles while they are live, as PDF or ZIP with images.',
])}

<section>
  <h2>The honest answer</h2>
  <p>There is no "undelete" button. When an author deletes a post, X stops showing it, and any tool that reads public posts, including <a href="/">Xtracticle</a>, will report it as not found. What remains is whatever copy somebody made earlier. Everything below is a way of finding such a copy, and none of them is guaranteed.</p>
</section>

<section>
  <h2>Option 1: your own X data archive</h2>
  <p>If the deleted post was yours, check any archive of your account you downloaded before deleting it. X lets you request one under <em>Settings and privacy → Your account → Download an archive of your data</em>, after verifying your identity. According to X's <a href="https://help.x.com/articles/20170320" rel="noopener nofollow">help page</a>, you get an email or notification when it is ready and download a .zip file while logged in. A new archive created after the deletion will not contain the post, so this only helps if you already had an older one.</p>

  <h2>Option 2: the Wayback Machine</h2>
  <p>The Internet Archive's <a href="https://web.archive.org/" rel="noopener nofollow">Wayback Machine</a> sometimes holds a snapshot of a post or profile. Paste the exact post URL (<code>x.com/user/status/…</code>, and try the older <code>twitter.com</code> form too) into the search box and open the calendar of snapshots. Third-party reports say that X has made it harder for archivers to capture profiles reliably, and that coverage is strongest for high-profile accounts or pages somebody manually saved. For an obscure post that was deleted quickly, expect no result.</p>
  <p>You can also add a live page yourself with Save Page Now at <code>web.archive.org/save/</code>. That only helps if you do it before the deletion.</p>

  <h2>Option 3: archive.today and similar</h2>
  <p>Services such as archive.today let anyone snapshot a page. Search for the post URL there. As with the Wayback Machine, it exists only if someone saved it first.</p>
</section>

<section>
  <h2>Option 4: search engine cache and screenshots</h2>
  <ul>
    <li><strong>Search engine cache.</strong> Google has retired its public "cached" links, so this is largely a dead end in 2026. Search results may still show an old snippet for a while after deletion, but you cannot rely on it.</li>
    <li><strong>Screenshots from other people.</strong> Quote posts, replies and news articles often include screenshots. They are evidence that the post existed, not proof of what it said exactly, because screenshots are easy to fake.</li>
    <li><strong>Quote posts of the deleted post.</strong> A quote post of a deleted post normally shows it as unavailable, so do not expect it to preserve the text.</li>
  </ul>
  <p>Be cautious about sites that promise to "recover any deleted tweet". They cannot get data X has removed; at best they search the same archives listed above.</p>
</section>

<section>
  <h2>The real fix: save it while it is live</h2>
  <p>If a post or article matters to you, whether a source for your work, a receipt, an announcement or something you may need to cite, save it now:</p>
  <ul>
    <li><a href="/x-article-to-pdf">PDF</a> keeps layout, images, author, date and a link to the original, and is easy to share.</li>
    <li><strong>ZIP with images</strong> keeps Markdown plus every image as separate files, a durable offline archive.</li>
    <li><strong>Batch mode</strong> takes up to 20 links at once into one ZIP.</li>
  </ul>
  <p>A saved copy shows what the post said when you saved it. It does not prove authenticity to a third party, but it records the date, author and source link. For your own backups, see <a href="/guides/backup-x-articles">how to back up your X Articles and threads</a>.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'Can I recover a deleted tweet?', a: 'Only if a copy exists elsewhere: an older X data archive of your account, a Wayback Machine or archive.today snapshot, or a screenshot. X itself does not restore deleted posts.' },
    { q: 'Can Xtracticle download a deleted post?', a: 'No. Xtracticle reads public posts that are still online. A deleted post is reported as not found, which is why saving important posts early matters.' },
    { q: 'Does the Wayback Machine have deleted tweets?', a: 'Sometimes. It works only if the post or profile was captured before deletion, and coverage is patchy, mostly for well-known accounts or pages someone saved manually.' },
    { q: 'Does X keep deleted posts in my data archive?', a: 'An archive created after you delete a post will not include it. An archive you downloaded earlier will still contain whatever it had at that time.' },
    { q: 'How do I keep a post safe before it disappears?', a: 'Paste the link into Xtracticle and download a PDF, or a ZIP with images if you want the media as files too.' },
  ],
});

/* ─── 4. X Articles vs Substack vs Medium ─── */

const versus = guide({
  slug: 'x-articles-vs-substack',
  title: 'X Articles vs Substack vs Medium: A Fair Comparison | Xtracticle',
  description:
    'X Articles, Substack and Medium compared for writers: audience, monetization, ownership, export options and SEO. Plus how to back up X Articles.',
  h1: 'X Articles vs Substack vs Medium',
  sub: 'Three places to publish long-form writing, compared on audience, money, ownership, export and search visibility.',
  primary: 'md',
  sections: `
${takeaways([
  'X Articles give you instant reach inside X, but weaker ownership: no subscriber list, no built-in export of articles.',
  'Substack is built around an email list you can export, and takes a share of paid subscriptions.',
  'Medium pays members by reading time and has built-in discovery, but your audience belongs to the platform.',
  'Many writers use X for discovery and a newsletter or blog as the home base. Back up X Articles as Markdown either way.',
])}

<section>
  <h2>At a glance</h2>
  <p>Platform rules and fees change. The table summarizes how each platform works ${WHEN}; check each platform's current terms before you decide.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>X Articles</th><th>Substack</th><th>Medium</th></tr></thead>
    <tbody>
      <tr><td>Main audience</td><td>Your followers and X's timeline</td><td>Email subscribers</td><td>Medium readers and members</td></tr>
      <tr><td>Who can publish</td><td>Premium-tier subscribers</td><td>Anyone</td><td>Anyone</td></tr>
      <tr><td>Monetization</td><td>X's creator payouts based on engagement from Premium users</td><td>Paid subscriptions; Substack takes 10% plus payment processing fees</td><td>Partner Program, paid by member reading time</td></tr>
      <tr><td>Audience ownership</td><td>Followers, not a list you can export</td><td>Subscriber list is exportable</td><td>Followers and email on-platform</td></tr>
      <tr><td>Export of posts</td><td>No built-in article export</td><td>Export posts and subscribers</td><td>Account data export</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Audience and discovery</h2>
  <p><strong>X Articles</strong> sit where an existing audience already is. If you have followers, an Article can reach them with no new sign-up, and good posts can spread by reposts. The flip side is that the timeline decides what gets seen, and followers are not a list you control.</p>
  <p><strong>Substack</strong> delivers posts to subscribers' inboxes, so reach is more predictable but starts from zero. It also has its own recommendations and app.</p>
  <p><strong>Medium</strong> has built-in readers and topic feeds, which helps new writers be found. Much of the audience, however, is on a metered membership model, and reach depends on Medium's distribution.</p>

  <h2>Monetization</h2>
  <p>X shifted its creator payouts in November 2024 to engagement from Premium subscribers rather than ad revenue (<a href="https://www.mediapost.com/publications/article/400171/x-ends-ad-revenue-share-for-creators-focuses-on-p.html" rel="noopener nofollow">MediaPost</a>). Substack lets you set prices for paid subscriptions and takes 10% plus Stripe fees (<a href="https://faq.substack.com/p/how-do-paid-subscriptions-on-substack" rel="noopener nofollow">Substack FAQ</a>). Medium distributes membership fees by member reading time (<a href="https://help.medium.com/hc/en-us/articles/360036691193" rel="noopener nofollow">Medium Help</a>). Earnings on all three vary widely, and we do not quote income figures.</p>
</section>

<section>
  <h2>Ownership and portability</h2>
  <p>This is the biggest difference. A Substack publication comes with an exportable subscriber list and exportable posts, so you can move to another platform. X offers an account data archive of your posts, but, as far as we can tell, Articles are not clearly covered in it, and there is no one-click export of your Articles. Medium lets you download your account data, although your readers stay on Medium.</p>
  <p>If you publish Articles on X, keep your own copy. <a href="/x-article-to-markdown">Xtracticle's Markdown export</a> turns an Article into a clean .md file (with optional front-matter) that you can reuse on a blog, Substack or Obsidian. The <a href="/guides/backup-x-articles">backup guide</a> shows a workflow.</p>

  <h2>SEO and indexing</h2>
  <p>Substack and Medium pages are ordinary public web pages that search engines index. X content is indexed too, but X is a heavy, login-oriented app, and how much of an Article is crawlable or shown to logged-out users changes. Treat X as a distribution channel and your own domain or newsletter as the place that earns lasting search traffic.</p>
</section>

<section>
  <h2>Which should you choose?</h2>
  <ul>
    <li><strong>You already have followers on X</strong> and want to test long-form: publish on X, and copy the best pieces to a newsletter.</li>
    <li><strong>You want a subscriber relationship and paid tier:</strong> Substack.</li>
    <li><strong>You want to be discovered by readers who don't know you:</strong> Medium, with the trade-offs above.</li>
  </ul>
  <p>They are not exclusive. A common setup is to write once, publish on your own newsletter, and share on X.</p>
</section>`,
  faq: [
    { q: 'Are X Articles better than Substack?', a: 'They serve different goals. X Articles reach your existing X followers directly; Substack gives you an exportable email list and paid subscriptions. Many writers use both.' },
    { q: 'Can I export my X Articles?', a: 'X has no one-click Article export. You can save each one as Markdown, PDF or ZIP with Xtracticle by pasting its link.' },
    { q: 'How does Substack make money from writers?', a: 'At the time of writing (October 2026), Substack takes 10% of paid subscription revenue, plus payment processing fees from Stripe. Check its FAQ for current terms.' },
    { q: 'How does Medium pay writers?', a: 'Through the Partner Program, which distributes membership fees based on how long members read or listen to a writer\'s stories.' },
    { q: 'Which is best for SEO?', a: 'Content on your own domain or newsletter archive usually gives the most durable search visibility. Substack and Medium pages are public web pages; X is mainly a social distribution channel.' },
  ],
});

/* ─── 5. Backup ─── */

const backup = guide({
  slug: 'backup-x-articles',
  title: 'How to Back Up Your X Articles and Threads | Xtracticle',
  description:
    'Back up your X Articles and threads: what X\'s data archive covers, Markdown and ZIP exports with images, an Obsidian workflow and batch mode.',
  h1: 'How to Back Up Your X Articles and Threads',
  sub: 'A two-layer plan for writers: X\'s own account archive as a safety net, plus per-article Markdown or ZIP files you can actually open and reuse.',
  primary: 'md',
  sections: `
${takeaways([
  'X\'s account data archive is worth requesting, but based on what we could verify, it is built around posts, media and account data, and may not include your Articles as readable documents.',
  'For each Article or thread, export Markdown or a ZIP with images using <a href="/x-article-to-markdown">Xtracticle</a>.',
  'Batch mode takes up to 20 links and returns one ZIP.',
  'Store the files in Obsidian, Notion, or a synced folder with a second backup.',
])}

<section>
  <h2>Layer 1: X's account data archive</h2>
  <p>Request it in the X app or on the site: <em>Settings and privacy → Your account → Download an archive of your data</em>. You verify your identity with a code sent to your email or phone, tap <em>Request data</em>, and X notifies you when it is ready. Then download the .zip from settings while logged in (<a href="https://help.x.com/articles/20170320" rel="noopener nofollow">X Help</a>). Third-party guides note that the download link may expire after a short time, so download promptly.</p>
  <h3>What it covers</h3>
  <p>The archive is organized as data files plus media folders: your posts, account details, and more. It is useful as a record that you wrote something and when.</p>
  <h3>The caveat for Articles</h3>
  <p>We could not find any X documentation stating that Articles are included as formatted documents, and descriptions of the archive's contents mention posts, not Articles. Open your own archive and check before you rely on it; we have not verified this for every account. Even if the text is in there, it is stored as data files, not a readable article with the layout and images.</p>
</section>

<section>
  <h2>Layer 2: export each article yourself</h2>
  <h3>Single article or thread</h3>
  ${'<ol class="xt-steps"><li>Open your Article on X and tap <em>Share → Copy link</em>. (If the link has <code>/i/article/</code> in it, use the post link with <code>/status/</code> instead.)</li><li>Paste it into <a href="/">Xtracticle</a>.</li><li>Choose <strong>Markdown</strong> for a text file, or <strong>ZIP + images</strong> to also keep every image as a file.</li></ol>'}
  <p>For a thread, paste any post of it and the whole self-thread is merged in order.</p>
  <h3>Many at once: batch mode</h3>
  <p>Switch to <em>Batch mode</em>, paste up to 20 links, and download one ZIP. Repeat in groups of 20 for a larger back catalogue.</p>
  <h3>Which format</h3>
  <ul>
    <li><strong>Markdown (.md):</strong> best for reuse, editing and moving to another platform. See the <a href="/x-article-to-markdown">Markdown export</a>.</li>
    <li><strong>ZIP + images:</strong> Markdown plus the media, a complete offline copy.</li>
    <li><strong>PDF:</strong> best for sharing and for a fixed-layout record. See <a href="/x-article-to-pdf">X Article to PDF</a>.</li>
  </ul>
</section>

<section>
  <h2>Keep them organized</h2>
  <h3>Obsidian</h3>
  <p>Xtracticle can open an article as a new note in your vault, with front-matter containing title, author, source, dates and tags. Details in <a href="/save-x-articles-to-obsidian">Save X articles to Obsidian</a>.</p>
  <h3>Notion</h3>
  <p>Notion can import Markdown files: use <em>Import → Text &amp; Markdown</em> and pick the .md files.</p>
  <h3>A simple folder system</h3>
  <ul>
    <li>One folder per year, files named <code>YYYY-MM-DD-title.md</code>.</li>
    <li>Keep images next to the file (the ZIP export does this).</li>
    <li>Keep the original X link in the front-matter so you can always trace the source.</li>
  </ul>
  <p>Follow the 3-2-1 idea: at least two copies on different devices or services, one of them off-site, such as cloud storage or a private Git repository.</p>
</section>

<section>
  <h2>Make it routine</h2>
  <p>Back up each Article when you publish it, because you know the link then. Request a fresh X account archive every few months as a second layer. If you also want to keep a deleted-post risk in mind, read <a href="/guides/recover-deleted-tweets">what can and cannot be recovered</a>.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'Does the X data archive include my Articles?', a: 'We could not find X documentation saying Articles are included as formatted documents. Check your own archive, and keep per-article exports as a second copy.' },
    { q: 'How do I back up an X Article with images?', a: 'Paste the post link into Xtracticle and choose ZIP + images. You get a Markdown file with every image saved next to it.' },
    { q: 'Can I back up many articles at once?', a: 'Yes. Batch mode accepts up to 20 links and returns a single ZIP.' },
    { q: 'Can I back up other people\'s Articles?', a: 'You can save any public Article for personal reading or reference. Respect the author\'s copyright and do not republish it without permission.' },
    { q: 'Can I move the Markdown files to Notion or Obsidian?', a: 'Yes. Obsidian opens .md files directly, and Notion can import Markdown through Import → Text & Markdown.' },
  ],
});

/* ─── Hub ─── */

const GUIDES: { page: SitePage; blurb: string }[] = [
  { page: whatAre, blurb: 'What X Articles are, who can publish them, how they differ from threads, and how to save them.' },
  { page: readWithout, blurb: 'Read X Articles, threads and posts without logging in, including the x.com to xtracticle.com trick.' },
  { page: deleted, blurb: 'What can and cannot be recovered once a post is deleted, and how to keep important ones safe.' },
  { page: versus, blurb: 'X Articles compared with Substack and Medium on audience, money, ownership, export and SEO.' },
  { page: backup, blurb: 'A practical plan to back up your own X Articles and threads as Markdown, ZIP and PDF.' },
];

const hub: SitePage = {
  id: 'guides',
  group: 'guides',
  path: HUB,
  file: 'guides.html',
  lang: 'en',
  title: 'Guides — Saving, Reading and Archiving X (Twitter) Content | Xtracticle',
  description:
    'Practical guides on X (Twitter) Articles: what they are, reading without login, recovering deleted posts, comparing platforms and backing up your writing.',
  h1: 'Guides: Saving, Reading and Archiving X Content',
  sub: 'Short, practical guides about X Articles, threads and posts, and how to keep a copy of them.',
  primary: 'pdf',
  nav: 'Guides',
  sections: `
<section>
  <h2>All guides</h2>
  <ul>${GUIDES.map(g => `<li><a href="${g.page.path}"><strong>${g.page.h1}</strong></a> — ${g.blurb}</li>`).join('')}</ul>
</section>

<section>
  <h2>Ready to save something?</h2>
  <p>Paste any X link into <a href="/">Xtracticle</a>, or go straight to <a href="/x-article-to-pdf">X Article to PDF</a>, <a href="/x-article-to-markdown">Markdown</a>, <a href="/x-article-to-epub">EPUB</a> or <a href="/x-thread-to-pdf">thread to PDF</a>.</p>
</section>`,
  faq: [],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Xtracticle guides',
      url: `https://xtracticle.com${HUB}`,
      itemListElement: GUIDES.map((g, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: g.page.h1,
        url: `https://xtracticle.com${g.page.path}`,
      })),
    },
  ],
};

export function guidePages(): SitePage[] {
  return [hub, ...GUIDES.map(g => g.page)];
}
