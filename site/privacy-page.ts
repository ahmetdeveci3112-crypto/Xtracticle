import { GITHUB, type SitePage } from './blocks';

/** /privacy — privacy policy for the web app, the Markdown API and the MCP server. */
export const privacyPage: SitePage = {
  id: 'privacy',
  group: 'privacy',
  path: '/privacy',
  file: 'privacy.html',
  lang: 'en',
  title: 'Privacy Policy | Xtracticle',
  description:
    'How Xtracticle handles data: no accounts, files built in your browser, anonymous analytics, what the MCP server and API log, and what Pro Watch stores.',
  h1: 'Privacy Policy',
  sub: 'Short version: no accounts, no uploads, and we don’t keep the posts you save. Only the Pro Watch feature stores data, and only for 90 days.',
  primary: 'pdf',
  nav: 'Privacy',
  sections: `
<section>
  <p><em>Last updated: November 9, 2026.</em> This policy covers xtracticle.com, its Markdown API (<code>/api/markdown/…</code>)
  and its MCP server (<code>/mcp</code>). Xtracticle is a free, open-source project; the
  <a href="${GITHUB}" rel="noopener">source code</a> shows exactly what it does.</p>
</section>

<section>
  <h2>What we don’t collect</h2>
  <ul>
    <li>No accounts or logins. Payments for Pro are handled by Gumroad; we only receive the license key. An e-mail address is stored only if a Pro user turns on Watch e-mail digests or someone starts a Watch trial (see below).</li>
    <li>No uploads: PDF, EPUB, ZIP and other files are built in your browser and never sent to us.</li>
    <li>We don’t sell or share personal data, and we don’t use advertising trackers.</li>
  </ul>
</section>

<section>
  <h2>Post content</h2>
  <p>When you paste a link (or an AI assistant calls the MCP server), we fetch that <strong>public</strong> X post through the
  open-source FxTwitter API. To keep the service fast and available, the post data is cached on Cloudflare’s edge network:
  the converted document for up to one hour and a fallback copy for up to seven days. Cached copies are not linked to you and
  expire automatically. Private, protected and deleted posts cannot be fetched at all. When you paste a profile link, we send only the
  account name to the Internet Archive’s CDX API to list its archived posts; the results are cached for up to 30 days and are not linked to you. To list an account’s latest posts for a ZIP download, we fetch its recent public posts through the FxTwitter API; the list is cached for up to 15 minutes and is not linked to you.</p>
</section>

<section>
  <h2>Analytics and logs</h2>
  <ul>
    <li><strong>Website:</strong> Google Analytics counts anonymous page views and events (for example “PDF downloaded” or the
    export format) so we know which features are used. Like any page view, it sees the address of the page you open — which,
    on a share page such as <code>/user/status/123</code>, includes the post link — but not the content of the posts you save.</li>
    <li><strong>MCP server and API:</strong> Cloudflare request logs record technical data for each call — the post ID, document
    type, response size and time, and the client’s user-agent — for debugging and abuse prevention. Cloudflare also processes
    IP addresses to apply rate limits. Logs are kept for a limited period by Cloudflare and are not used to identify you.</li>
  </ul>
</section>

<section>
  <h2>Stored in your browser</h2>
  <p>Your recent links, theme and language choice are saved in your browser’s local storage only. Clear your browser data to
  remove them.</p>
</section>

<section>
  <h2>Pro Watch (account monitoring)</h2>
  <p>Watch is a Pro feature: a Pro user adds public X accounts to a watch list, and we check each one about once an hour to
  report new and deleted posts. It is the only part of Xtracticle that stores data over time.</p>
  <ul>
    <li><strong>About a watched account:</strong> its most recent public posts (about the last 40): text, date, post ID and
    links to media. Media files are not downloaded. The content of a post we detected as deleted is kept so the Pro user can read
    it. Stored posts and detected events are deleted 90 days after we last saw the post or after the event was detected.</li>
    <li><strong>About the Pro user:</strong> a one-way hash of the license key (never the key itself), the watched account names,
    the chosen mode, a private feed token for the RSS/JSON feed, and an e-mail address only if you turn on the daily digest
    (confirmed by a link we send). Notification records are kept for 90 days.</li>
    <li><strong>Limits:</strong> public accounts only (watching stops if an account becomes protected), about one check per hour,
    5 accounts per membership and 2 per lifetime license.</li>
    <li><strong>Free trial:</strong> a trial watches one account for 14 days without a license. We store the e-mail address you
    confirm for as long as the trial runs (it is deleted when the trial ends, or at once if you unsubscribe) and a one-way hash
    of that address, which we keep so that each address can start one trial.</li>
    <li><strong>Opting out:</strong> if your account is being watched and you want it to stop, <a href="${GITHUB}/issues" rel="noopener">open an
    issue on GitHub</a> or message @DvciAhmet on X with the account name. We add it to a blocklist, delete its stored posts and remove
    it from all watch lists within 7 days.</li>
    <li><strong>Deleting your watches:</strong> removing an account from your list on the Pro page deletes that watch right away;
    every e-mail has a one-click unsubscribe link.</li>
    <li><strong>Who receives data:</strong> Cloudflare stores the watch data, runs the checks and sends the digest e-mails
    (Cloudflare Email Service). Posts are fetched through the FxTwitter API. We don’t sell this data or use it for advertising.</li>
  </ul>
</section>

<section>
  <h2>Third parties</h2>
  <ul>
    <li><strong>Cloudflare</strong> hosts the site, API and MCP server.</li>
    <li><strong>FxTwitter</strong> provides public post data.</li>
    <li><strong>Google Analytics</strong> provides anonymous usage statistics.</li>
    <li>Images in previews and exports load from X’s media servers (pbs.twimg.com).</li>
  </ul>
</section>

<section>
  <h2>Contact</h2>
  <p>Questions or removal requests: <a href="${GITHUB}/issues" rel="noopener">open an issue on GitHub</a>.</p>
</section>`,
  faq: [],
};
