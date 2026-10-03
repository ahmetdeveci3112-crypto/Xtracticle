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
    'How Xtracticle handles data: no accounts, no stored posts, files built in your browser, anonymous analytics, and what the MCP server and API log.',
  h1: 'Privacy Policy',
  sub: 'Short version: no accounts, no uploads, and we don’t keep the posts you save.',
  primary: 'pdf',
  nav: 'Privacy',
  sections: `
<section>
  <p><em>Last updated: October 3, 2026.</em> This policy covers xtracticle.com, its Markdown API (<code>/api/markdown/…</code>)
  and its MCP server (<code>/mcp</code>). Xtracticle is a free, open-source project; the
  <a href="${GITHUB}" rel="noopener">source code</a> shows exactly what it does.</p>
</section>

<section>
  <h2>What we don’t collect</h2>
  <ul>
    <li>No accounts, logins, e-mail addresses or payment details.</li>
    <li>No uploads: PDF, EPUB, ZIP and other files are built in your browser and never sent to us.</li>
    <li>We don’t sell or share personal data, and we don’t use advertising trackers.</li>
  </ul>
</section>

<section>
  <h2>Post content</h2>
  <p>When you paste a link (or an AI assistant calls the MCP server), we fetch that <strong>public</strong> X post through the
  open-source FxTwitter API. To keep the service fast and available, the post data is cached on Cloudflare’s edge network:
  the converted document for up to one hour and a fallback copy for up to seven days. Cached copies are not linked to you and
  expire automatically. Private, protected and deleted posts cannot be fetched at all.</p>
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
