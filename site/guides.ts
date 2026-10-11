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

/* ─── 6. See deleted tweets ─── */

const seeDeleted = guide({
  slug: 'how-to-see-deleted-tweets',
  title: 'How to See Deleted Tweets: Realistic Options | Xtracticle',
  description:
    'How to see deleted tweets from other accounts: archives, search snippets, quote posts and screenshots, plus what never works and how to save posts.',
  h1: 'How to See Deleted Tweets',
  sub: 'Viewing someone else\'s deleted post is possible only when a copy was made first. Here is where copies tend to exist, and what is a dead end.',
  primary: 'pdf',
  sections: `
${takeaways([
  'When a post is deleted, X stops serving it. Nobody, including Xtracticle, can fetch it from X again.',
  'You can only see another person\'s deleted post if somebody copied it first: a web archive snapshot, a screenshot, a news article or a saved file.',
  'The best places to look are the Wayback Machine, archive.today, and posts or articles that quoted the deleted one.',
  'Sites that promise to "show any deleted tweet" cannot reach data X has removed. Treat them with suspicion.',
  'If a post matters, save it while it is live as a <a href="/tweet-to-pdf">PDF</a> or ZIP.',
])}

<section>
  <h2>Your own deleted posts vs someone else's</h2>
  <p>These are two different problems. For <strong>your own</strong> posts, an older copy of your X data archive may still contain them; that route is covered in <a href="/guides/recover-deleted-tweets">Can you recover deleted tweets?</a>. This guide is about <strong>other people's</strong> posts, where you have no archive of your own and depend on copies made by third parties.</p>
  <p>It helps to be realistic from the start. There is no hidden X page, no special URL and no account setting that reveals a deleted post. If a copy exists, it exists somewhere else.</p>
</section>

<section>
  <h2>Where a copy might exist</h2>
  <h3>1. Web archives</h3>
  <p>The Internet Archive's Wayback Machine and archive.today take snapshots of web pages. If somebody archived the post, or the author's profile, before the deletion, you can open that snapshot. Coverage is strongest for well-known accounts and for posts that someone deliberately saved, and weakest for ordinary posts that were deleted within minutes. Follow the exact steps in <a href="/guides/find-tweets-on-wayback-machine">how to find tweets on the Wayback Machine</a>.</p>
  <h3>2. Quote posts, replies and mentions</h3>
  <p>People often react to a post by quoting it. If the original is later deleted, X normally shows the quote with a notice that the post is unavailable, so the text itself is gone. Replies and other posts that describe or paraphrase it can still tell you what it was about. Treat these as secondhand accounts.</p>
  <h3>3. Screenshots</h3>
  <p>Journalists, fact-checkers and ordinary users screenshot posts that are likely to disappear. Searching for a distinctive phrase from the post, or for the author's handle together with a topic, can surface those images. A screenshot shows that something was posted, but it is easy to fake or crop, so it is weak evidence on its own. Look for a second independent source.</p>
  <h3>4. News and blog coverage</h3>
  <p>If the post was newsworthy, articles often embed or quote it. Some embeds keep showing the text even after the original is deleted, though that depends on how the page was built and is not something to rely on.</p>
  <h3>5. Search engine snippets</h3>
  <p>A search result may keep showing an old snippet for a short time after deletion. Google has retired its public "cached" links, so you can no longer open the stored page from the result. If you see a snippet, copy or screenshot it immediately, because it can vanish when the index refreshes.</p>
</section>

<section>
  <h2>What does not work</h2>
  <ul>
    <li><strong>"Deleted tweet viewer" websites.</strong> They cannot read data X has removed. At best they search the same public archives you can search yourself. At worst they ask for your X login or payment.</li>
    <li><strong>Guessing the URL.</strong> A deleted post's address returns "not found", whether you use x.com, twitter.com or a mirror.</li>
    <li><strong>Browser tricks and the swap-domain trick.</strong> Replacing x.com with xtracticle.com only reads posts that are still online. For deleted ones the result is not found. See <a href="/guides/read-x-articles-without-account">reading X without an account</a> for what it can do.</li>
    <li><strong>Asking X support.</strong> X does not give other users access to another person's deleted post.</li>
  </ul>
  <p>Protected accounts are a separate case: their posts were never public, so archives normally have nothing.</p>
</section>

<section>
  <h2>A practical order to try</h2>
  <ol>
    <li>Paste the post URL, if you have it, into the Wayback Machine, using both the x.com and twitter.com forms.</li>
    <li>Check archive.today for the same URL.</li>
    <li>Search for a distinctive phrase from the post, in quotes, to find screenshots, quotes or coverage.</li>
    <li>Look at the author's other channels. People often repost a deleted statement elsewhere.</li>
    <li>If you find a copy, note where you found it and when, and do not assume it is accurate until you have a second source.</li>
  </ol>
  <p>If nothing turns up, assume the post is gone. That is the usual outcome for obscure posts.</p>
</section>

<section>
  <h2>Save important posts while they are live</h2>
  <p>The only dependable way to see a post later is to keep your own copy. Paste the link into <a href="/">Xtracticle</a> and download a PDF with the author, date, images and a link to the original, or a ZIP with the images as files. For a long thread use <a href="/x-thread-to-pdf">X thread to PDF</a>, and to read a thread as one page first, try <a href="/unroll-twitter-thread">unroll a Twitter thread</a>. A saved file records what you saw and when you saw it. It is not proof for a third party, but it is far better than memory. Writers can set up a routine with the <a href="/guides/backup-x-articles">backup guide</a>.</p>
  <p>Copy only what you need for your own reference, and respect the author's copyright and privacy when you share it.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'Can I see someone else\'s deleted tweet?', a: 'Only if a copy was made before it was deleted, for example a Wayback Machine or archive.today snapshot, a screenshot, or a news article that quoted it. X does not show deleted posts to anyone.' },
    { q: 'Is there a website that shows any deleted tweet?', a: 'No. Sites that claim this cannot read data X has removed. They search the same public archives you can search yourself, and some ask for your login or payment, so be careful.' },
    { q: 'Does a quote post keep the deleted text?', a: 'Normally not. X shows the quoted post as unavailable once the original is deleted, although the quoting author\'s own words remain.' },
    { q: 'Can Xtracticle show a deleted post?', a: 'No. Xtracticle reads public posts that are still online, and a deleted post is reported as not found.' },
    { q: 'How do I make sure I can see a post later?', a: 'Save it while it is live. Paste the link into Xtracticle and download a PDF or a ZIP with images.' },
  ],
});

/* ─── 7. Wayback Machine ─── */

const wayback = guide({
  slug: 'find-tweets-on-wayback-machine',
  title: 'Find Deleted Tweets on the Wayback Machine | Xtracticle',
  description:
    'Step-by-step guide to finding archived tweets on the Wayback Machine: URL forms to try, calendar, wildcard search, Save Page Now and archive.today.',
  h1: 'How to Find Tweets on the Wayback Machine',
  sub: 'A precise checklist for searching the Internet Archive for archived X (Twitter) posts and profiles, and an honest look at where it falls short.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Search the exact post URL first, in both <code>x.com</code> and <code>twitter.com</code> forms, then try the profile URL.',
  'A wildcard search such as <code>web.archive.org/web/*/twitter.com/username/status/*</code> lists every archived post URL for an account.',
  'Blue dots on the calendar are successful captures. Orange or red ones usually show an error page.',
  'Coverage of X is patchy, and a missing result does not mean the post never existed.',
  'Save Page Now can fail on X, so for anything important keep your own copy as well.',
])}

<section>
  <h2>Before you start</h2>
  <p>The Wayback Machine at <a href="https://web.archive.org/" rel="noopener nofollow">web.archive.org</a> stores snapshots of web pages. It does not keep a full copy of X. A tweet appears there only if the Internet Archive's crawler, or a person using Save Page Now, captured that page. According to the Internet Archive's <a href="https://help.archive.org/help/using-the-wayback-machine/" rel="noopener nofollow">help page</a>, coverage is incomplete, and pages that depend on JavaScript are hard to archive. X is exactly that kind of site, and third-party reports say it has also restricted automated access. So set your expectations: well-known accounts and widely shared posts have the best chance.</p>
  <p>You need the post's address. If you do not have it, try to find it from a quote, a news article or the author's profile first.</p>
</section>

<section>
  <h2>Step by step</h2>
  <h3>1. Search the exact post URL</h3>
  <p>Paste the full link into the search box on web.archive.org. The format is <code>https://x.com/username/status/1234567890</code>. If you only know the older address, use <code>https://twitter.com/username/status/1234567890</code>. The status ID is the part that identifies the post, so it matters more than the domain.</p>
  <h3>2. Try every URL variant</h3>
  <p>The same post can be stored under several addresses. Try these one at a time:</p>
  <ul>
    <li><code>x.com/username/status/ID</code></li>
    <li><code>twitter.com/username/status/ID</code></li>
    <li><code>mobile.twitter.com/username/status/ID</code></li>
    <li><code>www.twitter.com/username/status/ID</code></li>
    <li>The same URL with a trailing <code>?s=20</code> or other tracking parameter, if you copied it from a share link</li>
  </ul>
  <h3>3. Use a wildcard to list everything for an account</h3>
  <p>If you do not know the status ID, ask for all captured URLs under a path. The Internet Archive documents the wildcard form <code>web.archive.org/web/*/example.com/*</code>. For X, that becomes:</p>
  <p><code>web.archive.org/web/*/twitter.com/username/status/*</code></p>
  <p>Do the same with <code>x.com</code>. The result is a long list of archived post URLs. Use your browser's find function to search it for a status ID or a part of the address. If the list is very long, the archive also offers a CDX interface that returns the same data in a plain table. A query like <code>web.archive.org/cdx/search/cdx?url=twitter.com/username/status/*&amp;fl=timestamp,original,statuscode&amp;collapse=urlkey</code> works for many accounts, but check the Internet Archive's CDX documentation for the current parameters.</p>
  <h3>4. Check the profile page</h3>
  <p>Search <code>twitter.com/username</code> and <code>x.com/username</code>. A profile snapshot may show recent posts as they looked on that date. A short post that was live for a few days is more likely to appear here than as its own captured page.</p>
  <h3>5. Read the calendar</h3>
  <p>When a URL has captures, you see a calendar of the year. Dots and links mark days with a snapshot, and the colors show the status the crawler received. Blue means success, green a redirect, orange a client error and red a server error, according to the Internet Archive. Pick a blue date, ideally just before the post was deleted. Captures can take several hours to appear after being made.</p>
  <h3>6. Open the snapshot and check it</h3>
  <p>Archived pages sometimes load without images or replies, or show a login prompt instead of the post. Try the earlier and later snapshots on the calendar, since one may have rendered better. Note the full archive address, with its timestamp, if you cite it.</p>
</section>

<section>
  <h2>Save Page Now, and its limits for X</h2>
  <p>To archive a live page yourself, use Save Page Now at <code>web.archive.org/save</code>, paste the URL and submit. Per the Internet Archive, this saves one page on demand and does not save whole sites. Do it before something gets deleted, because it cannot capture a post that is already gone.</p>
  <p>On X, Save Page Now may fail or produce a snapshot showing a login screen, because X often blocks automated requests. If that happens, the snapshot has no value as a record. This is why we suggest a second copy in your own files. <a href="/tweet-to-pdf">Tweet to PDF</a> and <a href="/">Xtracticle</a> render the public post and save the result for you.</p>
</section>

<section>
  <h2>Alternative: archive.today</h2>
  <p>archive.today (also reachable on addresses such as archive.ph) is a separate archive that lets anyone submit a page. Search the post URL there, or paste it into the save box if the post is still live. It has its own coverage and its own gaps, and its domains change from time to time, so search for the current address. Use it as a second opinion when the Wayback Machine has nothing.</p>
</section>

<section>
  <h2>Why you may find nothing</h2>
  <ul>
    <li>The post was deleted before any crawler or user saved it.</li>
    <li>The account is protected, so the page was never public.</li>
    <li>The capture exists but shows only a login wall or an error.</li>
    <li>The Internet Archive's exclusion process removed it, which it can do on request.</li>
  </ul>
  <p>For the broader picture, including your own data archive, read <a href="/guides/recover-deleted-tweets">can you recover deleted tweets</a> and <a href="/guides/how-to-see-deleted-tweets">how to see deleted tweets</a>. Threads you want to keep are better saved with <a href="/x-thread-to-pdf">X thread to PDF</a> or <a href="/unroll-twitter-thread">the thread unroller</a>.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'Does the Wayback Machine save tweets?', a: 'Sometimes. It stores a post only if its crawler or a user captured that page. Coverage of X is patchy and strongest for well-known accounts.' },
    { q: 'Should I search x.com or twitter.com?', a: 'Both. Older captures are usually under twitter.com, newer ones may be under x.com, and the same status ID can appear under either.' },
    { q: 'How do I list all archived tweets of an account?', a: 'Use a wildcard search such as web.archive.org/web/*/twitter.com/username/status/* and repeat it with x.com.' },
    { q: 'Can I use Save Page Now on a tweet?', a: 'You can try, but X often blocks archivers, so the snapshot may show a login screen. It also cannot capture a post that is already deleted.' },
    { q: 'What if the Wayback Machine has nothing?', a: 'Try archive.today and search for screenshots or quotes. If none exist, the post is probably unrecoverable.' },
  ],
});

/* ─── 8. How to write an X Article ─── */

const writeArticle = guide({
  slug: 'how-to-write-x-article',
  title: 'How to Write and Publish an Article on X | Xtracticle',
  description:
    'How to write an article on X: who can publish, where the composer is, formatting and cover image, editing after publishing, and how to back it up.',
  h1: 'How to Write and Publish an Article on X',
  sub: 'From eligibility to the publish button: what you need, what the editor offers, and how to keep a copy of your finished piece.',
  primary: 'md',
  sections: `
${takeaways([
  `Publishing Articles needs a paid plan: ${WHEN}, X's help page limits it to Premium, Premium+, Premium Business and Premium Organizations accounts.`,
  'Open the Articles area from X\'s navigation and choose to write a new Article. Availability in apps has varied, so the web version at x.com is the safest place to start.',
  'You can use a title, a cover image, headings, lists, links, images, video and embedded posts.',
  'Editing a published Article, according to X, takes it offline until you republish it.',
  'Back up each Article when you publish it. See <a href="/guides/backup-x-articles">the backup guide</a>.',
])}

<section>
  <h2>Who can write an Article</h2>
  <p>X launched Articles in 2024 for Premium+ subscribers and later widened access. ${WHEN[0].toUpperCase() + WHEN.slice(1)}, X's <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">Articles help page</a> says publishing is limited to Premium and Premium+ subscribers, Premium Businesses and Premium Organizations. Plan names and prices change, so check your own account if the option is missing.</p>
  <p>Anyone can read a published Article. For more background, see <a href="/guides/what-are-x-articles">What are X Articles?</a></p>
</section>

<section>
  <h2>Step by step</h2>
  <ol class="xt-steps">
    <li>Sign in to x.com on a computer with an eligible account.</li>
    <li>Find <strong>Articles</strong> in the left navigation. If you do not see it, check your subscription, or look for the option to write an Article from the post composer menu.</li>
    <li>Choose <strong>Write</strong> to open a new draft. X saves drafts so you can come back later.</li>
    <li>Add a title, then the body. Add a cover image if you want one.</li>
    <li>Preview it, then press <strong>Publish</strong>. The Article appears on your profile and can be shared as a post.</li>
  </ol>
  <p>The exact labels and menu positions change as X updates the product. If a name differs from the one above, use what your screen shows.</p>
</section>

<section>
  <h2>What the editor can do</h2>
  <p>According to X's help page, Articles can contain images, video, GIFs, embedded posts and links. Text formatting covers headings, subheadings, bold, italics, strikethrough, indentation, and numbered or bulleted lists.</p>
  <h3>Cover image</h3>
  <p>The cover appears at the top of the Article and typically in the timeline preview. X's help page does not give image dimensions that we could verify. A wide image works best because the preview crops it, so keep any text well inside the frame, and test how it looks after you publish.</p>
  <h3>Embedding posts and media</h3>
  <p>Paste a link to another post to embed it, and add images where they support a point. Alt text is worth adding for accessibility if the editor offers it.</p>
</section>

<section>
  <h2>Editing and deleting</h2>
  <p>According to X's help page, to change a live Article you open it, use the three-dot menu and choose <em>Edit Article</em>. This unpublishes the Article, and readers cannot see it until you republish. So make edits in one sitting, and avoid fixing typos during peak traffic. The same menu offers delete. As far as we know, X had no built-in scheduler for Articles ${WHEN}, so you publish when you press the button.</p>
</section>

<section>
  <h2>Tips for readable Articles</h2>
  <ul>
    <li><strong>Lead with the point.</strong> The title and first two paragraphs decide whether people continue.</li>
    <li><strong>Give each heading one job.</strong> Readers skim, so headings should tell the story by themselves.</li>
    <li><strong>Keep paragraphs short</strong> and use a list for steps or comparisons.</li>
    <li><strong>Use images with a purpose</strong>, such as charts, screenshots or examples.</li>
    <li><strong>Link your sources.</strong> It builds trust and helps readers check you.</li>
    <li><strong>Turning a thread into an Article?</strong> Rewrite it. A thread's cliffhangers and numbering read oddly in a single document.</li>
    <li><strong>Share it with a hook post</strong> that states the main idea, not just the title.</li>
  </ul>
</section>

<section>
  <h2>After publishing: save and share</h2>
  <p>X has no export button for an Article. Paste the post link (the one with <code>/status/</code>) into <a href="/">Xtracticle</a> to get a PDF for sharing, or Markdown and ZIP to reuse the text elsewhere. Readers can do the same with <a href="/x-article-to-pdf">X Article to PDF</a>, even without an account, as described in <a href="/guides/read-x-articles-without-account">reading X Articles without an account</a>. Writers should keep their own archive, because posts can be deleted or accounts suspended. For a full routine, see <a href="/guides/backup-x-articles">how to back up your X Articles</a>.</p>
  <p>If you are weighing X against other places to publish, <a href="/guides/x-articles-vs-substack">X Articles vs Substack vs Medium</a> compares them. For length and media rules, see <a href="/guides/x-articles-limits">X Articles limits</a>.</p>
</section>

${privacy('en')}`,
  faq: [
    { q: 'Who can write an article on X?', a: 'At the time of writing (October 2026), X says publishing is limited to Premium, Premium+, Premium Business and Premium Organizations accounts. Anyone can read Articles.' },
    { q: 'Where do I write an X Article?', a: 'Use the Articles option in X\'s navigation on x.com and choose to write a new Article. The label and position can change, and app availability has varied.' },
    { q: 'Can I edit an X Article after publishing?', a: 'Yes. According to X, use the three-dot menu and choose Edit Article. This unpublishes it until you republish.' },
    { q: 'Can I schedule an X Article?', a: 'We found no built-in scheduler for Articles. Some third-party tools offer scheduling, so check them before relying on it.' },
    { q: 'How do I save my X Article?', a: 'Paste the post link into Xtracticle and download Markdown, PDF or a ZIP with images.' },
  ],
});

/* ─── 9. X Articles limits ─── */

const limits = guide({
  slug: 'x-articles-limits',
  title: 'X Articles Limits: Length, Media, Who Can Publish | Xtracticle',
  description:
    'X Articles length limit, media, and who can publish or read them. Approximate figures, editing rules, and a comparison with long posts and threads.',
  h1: 'X Articles Limits: Length, Media and Requirements',
  sub: 'How long an X Article can be, what you can put in it, who can publish and who can read, with the uncertain numbers marked.',
  primary: 'pdf',
  sections: `
${takeaways([
  'X has not, to our knowledge, published a firm length figure for Articles. Third-party sources put the limit at about 100,000 characters, roughly 15,000 words.',
  `Publishing needs a paid plan. ${WHEN[0].toUpperCase() + WHEN.slice(1)}, X lists Premium, Premium+, Premium Business and Premium Organizations.`,
  'Anyone can read a public Article, according to the author\'s settings. No subscription is needed.',
  'Articles can include images, video, GIFs, links and embedded posts, with headings and lists.',
  'Editing a published Article takes it offline until you republish.',
])}

<section>
  <h2>Length limit</h2>
  <p>X's <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">Articles help page</a> describes what Articles can contain, but we could not find a specific character count there. Reports from the 2024 launch said testers hit a ceiling at a little over 100,000 characters, which several sources convert to about 15,000 words, and guides updated in 2026 still repeat the same number. Social Media Today estimated a higher word count on the same character figure, because words are shorter than people assume, so the word count is only a rough guide.</p>
  <p>Treat 100,000 characters as approximate. In practice few Articles come anywhere near it: that is around a short book chapter or a very long essay. If you are writing something that long, a downloadable document may serve readers better.</p>
</section>

<section>
  <h2>Media and formatting</h2>
  <p>According to X, Articles can include images, video, GIFs, embedded posts and links. Text can use headings, subheadings, bold, italics, strikethrough, indentation, and numbered or bulleted lists. We could not verify file size limits for images or video in the Article editor, so check the editor itself for any error before publishing a large file.</p>
</section>

<section>
  <h2>Who can publish and who can read</h2>
  <ul>
    <li><strong>Publish:</strong> Premium-tier accounts. The feature started with Premium+ in 2024, and X's current help page lists Premium and Premium+ subscribers plus Premium Businesses and Premium Organizations. Rules can change, so check your account.</li>
    <li><strong>Read:</strong> anyone who can see the post. Public Articles can be opened without paying. Readers who are not logged in may meet prompts or limited views on x.com, as covered in <a href="/guides/read-x-articles-without-account">reading X without an account</a>.</li>
    <li><strong>Visibility:</strong> an Article is published to your profile and shared through a post. Protected accounts' content stays limited to approved followers.</li>
  </ul>
  <p>For the background, see <a href="/guides/what-are-x-articles">What are X Articles?</a> and the step-by-step <a href="/guides/how-to-write-x-article">how to write an X Article</a>.</p>
</section>

<section>
  <h2>Editing after publishing</h2>
  <p>According to X's help page, you can edit a published Article from the three-dot menu with <em>Edit Article</em>. That unpublishes it, and it stays hidden until you republish. Deleting is available from the same menu. Because a deleted Article is gone for readers too, save a copy first if you may want it later (see <a href="/guides/backup-x-articles">the backup guide</a>).</p>
</section>

<section>
  <h2>Articles vs long posts vs threads</h2>
  <p>The figures below are approximate and based on third-party reporting ${WHEN}.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Standard post</th><th>Long post</th><th>Thread</th><th>X Article</th></tr></thead>
    <tbody>
      <tr><td>Length</td><td>280 characters for most accounts</td><td>Reported up to about 25,000 characters for paying subscribers</td><td>Many posts, each with its own limit</td><td>About 100,000 characters (approximate)</td></tr>
      <tr><td>Headings and lists</td><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
      <tr><td>Title and cover image</td><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
      <tr><td>Who can create</td><td>Anyone</td><td>Paid subscribers</td><td>Anyone</td><td>Premium-tier accounts</td></tr>
      <tr><td>Engagement</td><td>One post</td><td>One post</td><td>Each post separately</td><td>One post that links to the Article</td></tr>
    </tbody>
  </table></div>
  <p>Pick a long post for a single idea that does not need structure, a thread when you want a conversation with replies at each step, and an Article when the piece needs headings, images and a reading experience of its own.</p>
</section>

<section>
  <h2>Saving what you read</h2>
  <p>Length is not a problem for saving: a long Article converts to a multi-page file. Paste the link into <a href="/">Xtracticle</a> or use <a href="/x-article-to-pdf">X Article to PDF</a>. For threads, there is <a href="/x-thread-to-pdf">X thread to PDF</a>, and single posts go through <a href="/tweet-to-pdf">tweet to PDF</a>.</p>
</section>`,
  faq: [
    { q: 'What is the character limit for X Articles?', a: 'X does not state a firm number that we could find. Third-party sources report about 100,000 characters, roughly 15,000 words. Treat it as approximate.' },
    { q: 'Who can publish X Articles?', a: 'At the time of writing (October 2026), X lists Premium, Premium+, Premium Business and Premium Organizations accounts.' },
    { q: 'Do I need Premium to read an X Article?', a: 'No. Public Articles can be read without a subscription.' },
    { q: 'Can I edit an X Article after publishing?', a: 'Yes. Per X\'s help page, choose Edit Article from the three-dot menu. The Article is unpublished until you republish it.' },
    { q: 'How is an Article different from a long post?', a: 'A long post is still a plain post with no headings or title. An Article has a title, optional cover image, headings, lists and embedded media, and allows more text.' },
  ],
});

/* ─── Hub ─── */

const GUIDES: { page: SitePage; blurb: string }[] = [
  { page: whatAre, blurb: 'What X Articles are, who can publish them, how they differ from threads, and how to save them.' },
  { page: readWithout, blurb: 'Read X Articles, threads and posts without logging in, including the x.com to xtracticle.com trick.' },
  { page: deleted, blurb: 'What can and cannot be recovered once a post is deleted, and how to keep important ones safe.' },
  { page: versus, blurb: 'X Articles compared with Substack and Medium on audience, money, ownership, export and SEO.' },
  { page: backup, blurb: 'A practical plan to back up your own X Articles and threads as Markdown, ZIP and PDF.' },
  { page: seeDeleted, blurb: 'Where a copy of someone else\'s deleted post might exist, what never works, and how to save posts first.' },
  { page: wayback, blurb: 'Step-by-step: URL forms, wildcard search, calendar, Save Page Now and archive.today for archived tweets.' },
  { page: writeArticle, blurb: 'Who can publish an X Article, where the editor is, formatting, editing, and how to back it up.' },
  { page: limits, blurb: 'Approximate X Article length limit, media, who can publish or read, and a table against long posts and threads.' },
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
