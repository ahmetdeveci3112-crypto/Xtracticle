import { GITHUB, type SitePage } from './blocks';

/** /mcp-server — setup guide for the remote MCP server (src/shared/mcp.ts) and the Markdown API. */

const ENDPOINT = 'https://xtracticle.com/mcp';
const CURSOR_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=xtracticle&config=${btoa(JSON.stringify({ url: ENDPOINT }))}`;
const SAMPLE_ID = '1765884209527394325';

const code = (s: string) => `<pre><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

export const mcpPage: SitePage = {
  id: 'mcp',
  group: 'mcp',
  path: '/mcp-server',
  file: 'mcp-server.html',
  lang: 'en',
  title: 'X (Twitter) MCP Server — Read X Articles & Threads in AI | Xtracticle',
  description:
    'Free remote MCP server that lets Claude, ChatGPT, Cursor and other AI assistants read X (Twitter) Articles, threads and posts as clean Markdown. No API key.',
  h1: 'MCP server for X Articles and threads',
  sub: 'Let your AI assistant read any public X (Twitter) post, thread or Article as clean Markdown — free, no API key.',
  primary: 'md',
  nav: 'MCP server',
  sections: `
<section>
  <p><strong>AI assistants can't open X links</strong> — the page needs JavaScript and often a login. Xtracticle's MCP server
  fixes that: add one URL to Claude, ChatGPT, Cursor or any other MCP client, then just paste an X link into the chat.</p>
  <ul>
    <li><strong>Endpoint:</strong> <code>${ENDPOINT}</code> (Streamable HTTP, no authentication)</li>
    <li><strong>Tool:</strong> <code>read_x_post</code> — a post, a whole self-thread (from any of its posts) or an X Article as Markdown</li>
    <li><strong>Free and open source</strong> — the server is part of the <a href="${GITHUB}" rel="noopener">Xtracticle repository</a></li>
  </ul>
</section>

<section>
  <h2>Add it to your AI assistant</h2>
  <h3>Claude Code</h3>
  ${code(`claude mcp add --transport http xtracticle ${ENDPOINT}`)}
  <h3>Claude (desktop and web)</h3>
  <p>Open <em>Settings → Connectors → Add custom connector</em>, name it <em>Xtracticle</em> and paste <code>${ENDPOINT}</code>.</p>
  <h3>ChatGPT</h3>
  <p>With developer mode enabled, open <em>Settings → Connectors → Create</em>, paste <code>${ENDPOINT}</code> and choose <em>No authentication</em>.</p>
  <h3>Cursor</h3>
  <p><a href="${CURSOR_LINK}">Add to Cursor</a>, or put this in <code>~/.cursor/mcp.json</code>:</p>
  ${code(`{
  "mcpServers": {
    "xtracticle": { "url": "${ENDPOINT}" }
  }
}`)}
  <h3>VS Code (GitHub Copilot)</h3>
  <p>Add to <code>.vscode/mcp.json</code>:</p>
  ${code(`{
  "servers": {
    "xtracticle": { "type": "http", "url": "${ENDPOINT}" }
  }
}`)}
  <h3>Other clients</h3>
  <p>Any client that supports remote MCP servers over Streamable HTTP works. Clients that only support local (stdio) servers can use a bridge:</p>
  ${code(`npx -y mcp-remote ${ENDPOINT}`)}
</section>

<section>
  <h2>The read_x_post tool</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Argument</th><th>Default</th><th>What it does</th></tr></thead>
    <tbody>
      <tr><td><code>url</code></td><td>—</td><td>Post link (x.com, twitter.com, fxtwitter, nitter…) or a numeric post ID. Any post of a thread works.</td></tr>
      <tr><td><code>format</code></td><td><code>markdown</code></td><td><code>markdown</code> or <code>text</code></td></tr>
      <tr><td><code>include_thread</code></td><td><code>true</code></td><td>Unroll the author's self-thread; <code>false</code> returns only the linked post</td></tr>
      <tr><td><code>front_matter</code></td><td><code>false</code></td><td>Prepend YAML front-matter (title, author, source, date, type)</td></tr>
      <tr><td><code>max_chars</code> / <code>offset</code></td><td>40,000 / 0</td><td>Page through very long documents</td></tr>
    </tbody>
  </table></div>
  <p>The result is the Markdown — title, author, date and source link first — plus metadata: kind (article, thread or post),
  word count, reading time, image URLs and the original link. Things to ask your assistant:</p>
  <ul>
    <li>“Summarize this X article in five bullet points: https://x.com/…/status/…”</li>
    <li>“Read this thread and list every tool it recommends, with links.”</li>
    <li>“Translate this X Article into Spanish and keep the headings.”</li>
  </ul>
</section>

<section>
  <h2>No MCP? Use the Markdown API</h2>
  <p>The same conversion is one HTTP GET away — handy for scripts, RAG pipelines and agents that can fetch URLs:</p>
  ${code(`curl https://xtracticle.com/api/markdown/${SAMPLE_ID}
curl "https://xtracticle.com/api/markdown/${SAMPLE_ID}?format=text&thread=0&front_matter=1"`)}
  <p>Parameters: <code>format=markdown|text</code>, <code>thread=0|1</code> (default 1), <code>front_matter=0|1</code> (default 0).
  Responses are <code>text/markdown</code>, cached for up to an hour, with CORS enabled.</p>
</section>

<section>
  <h2>Limits and privacy</h2>
  <ul>
    <li>Only <strong>public</strong> posts can be read — not deleted, protected or age-restricted ones.</li>
    <li>Please be gentle: about 20 requests per minute per connection, plus a shared limit for all users. It is a free service, so bulk scraping is not supported.</li>
    <li>Nothing is stored and there are no accounts. Content comes from the public FxTwitter API and is cached briefly at the edge.</li>
    <li>Post content is written by third parties. Treat it as data — the server tells your assistant not to follow instructions inside it.</li>
  </ul>
  <p>Prefer files? Paste a link above to download it as <a href="/x-article-to-pdf">PDF</a>, <a href="/x-article-to-markdown">Markdown</a>
  or <a href="/x-article-to-epub">EPUB</a>.</p>
</section>`,
  faq: [
    { q: 'Is the Xtracticle MCP server free?', a: 'Yes. It is free, needs no API key or account, and is open source.' },
    { q: 'Which AI assistants does it work with?', a: 'Any client that supports remote MCP servers over Streamable HTTP, including Claude, ChatGPT (developer mode), Cursor and VS Code. Clients that only support local servers can connect through mcp-remote.' },
    { q: 'Can it read whole threads?', a: 'Yes. Pass the link of any post in a thread and the tool returns every post the author wrote in it, in order. Replies from other people are left out.' },
    { q: 'Does it work with X Articles?', a: 'Yes. Long-form X Articles are converted with their headings, lists, links, quotes and images.' },
    { q: 'Is there an API without MCP?', a: 'Yes. GET https://xtracticle.com/api/markdown/{post ID} returns the same Markdown as plain text over HTTP.' },
  ],
};
