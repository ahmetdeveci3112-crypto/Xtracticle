/** Simplified Chinese: unroll, tweet to PDF, MCP server and privacy pages. */
import { GITHUB, privacy, samplePdfFigure, shortcuts, steps, type SitePage } from '../../blocks';

const ENDPOINT = 'https://xtracticle.com/mcp';
const CURSOR_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=xtracticle&config=${btoa(JSON.stringify({ url: ENDPOINT }))}`;
const SAMPLE_ID = '1765884209527394325';

const code = (s: string) => `<pre><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

const unroll: SitePage = {
  id: 'zh-unroll',
  group: 'unroll',
  path: '/zh/unroll-twitter-thread',
  file: 'zh/unroll-twitter-thread.html',
  lang: 'zh',
  title: '推文串展开：一页读完 Twitter 推文串 | Xtracticle',
  description: '把 Twitter/X 推文串展开成一页，粘贴链接即可阅读，无需 @ 机器人，无需登录。还能保存为 PDF、Markdown 或 EPUB，免费。',
  h1: '推文串展开：一页读完 Twitter 推文串',
  sub: '把任意 X（推特）推文串展开成一页干净的文章。粘贴推文串中任意一条帖子的链接即可，无需机器人，无需登录。',
  primary: 'md',
  nav: '推文串展开',
  sections: `
<section>
  <p><strong>Xtracticle 是一个免费的推文串展开工具：</strong>粘贴推文串中任意一条帖子的链接，作者的整个自串就会合并成一页连续、带编号的内容，立刻就能读。保存是可选的——无需账号，没有广告，也不会有人收到通知。</p>
  <h2>三步展开推文串</h2>
  ${steps([
    '<strong>复制推文串中任意一条帖子的链接</strong>——第一条、中间的某一条或最后一条都行（分享 → 复制链接）。',
    '<strong>粘贴到上方输入框</strong>，点击“提取”。推文串会按顺序合并成一页。',
    '<strong>直接在这里阅读</strong>，点击<em>朗读</em>听它念出来，或下载为 Markdown、PDF、EPUB 或文本。',
  ])}
</section>

<section>
  <h2>这里说的“展开”是什么意思</h2>
  <p>推文串是作者自己回复自己、连成一串的帖子。在 X 上刷推文串，要一条条加载，还得跳过别人的回复，很容易看丢位置。展开就是把作者的帖子合并成一份带编号的文档（<code>1/12</code>、<code>2/12</code>……），并保留换行、图片、被引用的帖子和视频缩略图。</p>
  <ul>
    <li><strong>任意一条帖子都行。</strong>不需要找到第一条，手头有哪条就粘贴哪条。</li>
    <li><strong>只收录作者本人的帖子。</strong>其他人的回复不会出现。</li>
    <li><strong>支持多种链接。</strong>x.com、twitter.com、fxtwitter、vxtwitter、nitter、xcancel 链接，<code>/i/web/status/</code> 链接，以及纯帖子 ID 都可以。</li>
    <li><strong>仅限公开推文串。</strong>私密账号无法读取。</li>
  </ul>
</section>

<section>
  <h2>不用 @ 机器人也能展开</h2>
  <p>展开推文串的经典做法，是在推文串下回复 <em>@threadreaderapp unroll</em> 然后等待。这种方式确实有好处，比如会生成一个别人也能找到的公开页面。但它也有一些值得了解的代价：</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>@ 机器人</th><th>Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>速度</td><td>要等机器人回复</td><td>粘贴后立即完成</td></tr>
      <tr><td>可见性</td><td>你的请求是一条公开回复</td><td>不会发布任何内容，完全私密</td></tr>
      <tr><td>账号</td><td>需要 X 账号才能 @ 机器人</td><td>无需登录</td></tr>
      <tr><td>格式</td><td>网页</td><td>网页、PDF、Markdown、EPUB、文本、ZIP</td></tr>
      <tr><td>给他人的公开页面</td><td>有，一个可分享的网址</td><td>没有，需要分享文件或链接</td></tr>
    </tbody>
  </table></div>
  <p>想了解更详细、客观的对比，请看<a href="/zh/thread-reader-app-alternative">与 Thread Reader App 的对比</a>。</p>
</section>

<section>
  <h2>先读，再留存</h2>
  <p>展开是为了阅读，但推文串不会永远存在：作者会删帖，账号也会变成私密。推文串显示在屏幕上之后，你可以按需要的格式保存一份副本。</p>
  <ul>
    <li><a href="/zh/x-thread-to-pdf">推文串转 PDF</a>——带编号、可打印的文档，包含图片、来源链接和页码。PDF 是按图像渲染的，文字无法选中。</li>
    <li><a href="/zh/x-article-to-markdown">Markdown</a>——可选中的文字，可附带 YAML front-matter，适合 Obsidian、Notion 或 AI 助手。</li>
    <li><a href="/zh/x-article-to-epub">EPUB 3</a>——可自适应排版的电子书，适合电子阅读器。</li>
    <li><strong>ZIP + 图片</strong>——Markdown 加上所有本地保存的图片。</li>
    <li><strong>纯文本</strong>，或一键导出到 Obsidian。</li>
  </ul>
  <p>有一堆推文串要处理？切换到批量模式，最多粘贴 20 个链接，即可得到一个包含 Markdown 文件的 ZIP。</p>
  <p>要找的是 X 文章而不是推文串？请使用 <a href="/zh/x-article-to-pdf">X 文章转 PDF</a> 页面。工具也在<a href="/zh/">首页</a>，更多常用流程见<a href="/zh/guides">指南</a>。</p>
</section>

${shortcuts('zh')}

${privacy('zh')}`,
  faq: [
    { q: '如何展开 Twitter 推文串？', a: '复制推文串中任意一条帖子的链接，粘贴到 Xtracticle 并点击“提取”，整个推文串就会以带编号的一页打开。' },
    { q: '需要推文串的第一条帖子吗？', a: '不需要。第一条、中间或最后一条都可以，Xtracticle 会找到作者的其余帖子。' },
    { q: '需要 @threadreaderapp 这样的机器人吗？', a: '不需要。不会发布或 @ 任何内容。粘贴链接即可立刻阅读结果，无需账号。' },
    { q: '会包含其他人的回复吗？', a: '不会。只会按顺序合并作者本人在推文串中的帖子。' },
    { q: '可以听推文串，而不是阅读吗？', a: '可以。点击“朗读”按钮，就能让它把推文串念出来。' },
    { q: '展开之后还能保存吗？', a: '可以，支持 PDF、Markdown（可选 YAML front-matter）、EPUB、纯文本或带图片的 ZIP。批量模式最多接受 20 个链接，并返回一个包含 Markdown 文件的 ZIP。' },
    { q: '私密账号可以用吗？', a: '不可以。只能展开公开的推文串。' },
  ],
};

const tweetpdf: SitePage = {
  id: 'zh-tweetpdf',
  group: 'tweetpdf',
  path: '/zh/tweet-to-pdf',
  file: 'zh/tweet-to-pdf.html',
  lang: 'zh',
  title: '推文转 PDF：把任意 X 帖子存为 PDF | Xtracticle',
  description: '把任意推文或 X 帖子保存为干净的 A4 PDF，含图片、被引用帖子、日期和来源链接。免费，无需登录，无水印，iPhone 和安卓可用。',
  h1: '推文转 PDF',
  sub: '把任意 X（推特）帖子保存为干净的 A4 PDF，包含文字、图片、被引用的帖子、日期和来源链接。',
  primary: 'pdf',
  nav: '推文转 PDF',
  sections: `
<section>
  <p><strong>Xtracticle 是一个免费的推文转 PDF 工具：</strong>粘贴单条 X（推特）帖子的链接，就能下载成整洁的 A4 PDF——不用截图，不用账号，没有水印。iPhone、安卓和电脑都能用。</p>
  <h2>三步把推文保存为 PDF</h2>
  ${steps([
    '<strong>复制帖子链接</strong>（分享 → 复制链接）。x.com、twitter.com、fxtwitter、vxtwitter、nitter、xcancel 链接都可以，纯帖子 ID 也行。',
    '<strong>粘贴到上方输入框</strong>，点击“提取”。',
    '<strong>点击 PDF</strong>——文件会立即下载。',
  ])}
</section>

<section>
  <h2>PDF 里有什么</h2>
  <ul>
    <li><strong>完整文字</strong>，保留作者原有的换行。</li>
    <li><strong>图片</strong>保持原位，并自动缩放以适应页面。</li>
    <li><strong>被引用的帖子</strong>，如果这条推文引用了另一条。</li>
    <li>顶部有<strong>作者和日期</strong>。</li>
    <li><strong>可点击的来源链接</strong>指向原帖，另有页码。</li>
    <li><strong>视频显示为带链接的缩略图</strong>，因为 PDF 无法播放视频。</li>
  </ul>
  <p>页面是干净的 A4 版式——没有 X 的侧边栏、按钮、热门话题或回复。</p>
  ${samplePdfFigure('zh')}
  <p>PDF 是按图像渲染的，版式精确，但文字无法选中。如果需要搜索或复制文字，请改为导出 <a href="/zh/x-article-to-markdown">Markdown</a> 或 <a href="/zh/x-article-to-epub">EPUB</a>。</p>
</section>

<section>
  <h2>为什么要把推文存成 PDF？</h2>
  <ul>
    <li><strong>凭证和确认</strong>——公司就退款、延误或承诺发布的公开声明。</li>
    <li><strong>公告</strong>——你想留存的更新说明、招聘信息、活动详情和政策变更。</li>
    <li><strong>证据与引用</strong>——带日期和来源链接的副本，比裁剪过的截图更方便交给别人。</li>
    <li><strong>研究笔记</strong>——把帖子和你的资料放在一起归档，作者和日期一并保留。</li>
  </ul>
  <p>请注意，PDF 记录的是你保存时帖子的内容，它不是具有法律效力的认证文件。</p>
</section>

<section>
  <h2>帖子、推文串和文章</h2>
  <h3>单条推文</h3>
  <p>就是本页的用途。一个链接，一份 PDF。</p>
  <h3>推文串</h3>
  <p>如果这条帖子属于某个推文串，请使用<a href="/zh/x-thread-to-pdf">推文串转 PDF</a>页面。粘贴推文串中的任意一条帖子，作者的所有帖子就会合并成一份带编号的 PDF。想先在屏幕上阅读推文串，可以试试<a href="/zh/unroll-twitter-thread">推文串展开</a>。</p>
  <h3>长文</h3>
  <p>X 文章会保留标题、列表和正文图片。请使用 <a href="/zh/x-article-to-pdf">X 文章转 PDF</a>。</p>
</section>

<section>
  <h2>已删除的帖子</h2>
  <p>Xtracticle 读取的是仍在线的公开帖子。如果帖子已被删除，或账号已变成私密，之后就无法保存了。这正是要趁帖子还在时导出副本的原因。请阅读<a href="/zh/guides/recover-deleted-tweets">哪些内容能恢复、哪些不能</a>。需要处理多条帖子？批量模式最多接受 20 个链接，并返回一个包含 Markdown 文件的 ZIP。工具在<a href="/zh/">首页</a>，更多流程见<a href="/zh/guides">指南</a>。</p>
</section>

${shortcuts('zh')}

${privacy('zh')}`,
  faq: [
    { q: '如何把推文保存为 PDF？', a: '复制帖子链接（分享 → 复制链接），粘贴到 Xtracticle，点击“提取”，再点击 PDF。' },
    { q: 'PDF 包含图片和被引用的帖子吗？', a: '包含。图片和被引用的帖子都会收录。视频显示为带链接的缩略图。' },
    { q: '推文转 PDF 工具免费吗？', a: '免费，无需登录，也没有水印。' },
    { q: '可以选中或搜索 PDF 里的文字吗？', a: '不可以。PDF 是按图像渲染的，以保证版式精确。需要可选中的文字，请使用 Markdown 或 EPUB 导出。' },
    { q: '可以保存已被删除的推文吗？', a: '不可以。只能保存仍在线的公开帖子，所以请在帖子消失前导出副本。' },
    { q: '推文串和长文怎么办？', a: '推文串请使用推文串转 PDF 页面，它会合并作者的整个推文串。长文请使用 X 文章转 PDF。' },
    { q: '可以一次保存多条推文吗？', a: '可以。批量模式最多接受 20 个链接，并以 Markdown 文件的形式放进一个 ZIP 返回。如果要 PDF，请逐条保存。' },
  ],
};

const mcp: SitePage = {
  id: 'zh-mcp',
  group: 'mcp',
  path: '/zh/mcp-server',
  file: 'zh/mcp-server.html',
  lang: 'zh',
  title: 'X MCP 服务器：让 AI 读取 X 文章 | Xtracticle',
  description: '免费的远程 MCP 服务器，让 Claude、ChatGPT、Cursor 等 AI 助手把 X（推特）文章、推文串和帖子读成干净的 Markdown。无需 API 密钥。',
  h1: '读取 X 文章和推文串的 MCP 服务器',
  sub: '让你的 AI 助手把任意公开的 X（推特）帖子、推文串或文章读成干净的 Markdown——免费，无需 API 密钥。',
  primary: 'md',
  nav: 'MCP 服务器',
  sections: `
<section>
  <p><strong>AI 助手打不开 X 链接</strong>——页面需要 JavaScript，往往还要登录。Xtracticle 的 MCP 服务器解决了这个问题：在 Claude、ChatGPT、Cursor 或任何其他 MCP 客户端中添加一个网址，之后直接把 X 链接粘贴到对话里就行。</p>
  <ul>
    <li><strong>端点：</strong><code>${ENDPOINT}</code>（Streamable HTTP，无需认证）</li>
    <li><strong>工具：</strong><code>read_x_post</code>——把一条帖子、整个自串（任意一条帖子即可）或一篇 X 文章读成 Markdown</li>
    <li><strong>免费且开源</strong>——服务器是 <a href="${GITHUB}" rel="noopener">Xtracticle 代码仓库</a>的一部分</li>
  </ul>
</section>

<section>
  <h2>添加到你的 AI 助手</h2>
  <h3>Claude Code</h3>
  ${code(`claude mcp add --transport http xtracticle ${ENDPOINT}`)}
  <h3>Claude（桌面版和网页版）</h3>
  <p>打开<em>设置 → 连接器 → 添加自定义连接器</em>，命名为 <em>Xtracticle</em>，并粘贴 <code>${ENDPOINT}</code>。</p>
  <h3>ChatGPT</h3>
  <p>启用开发者模式后，打开<em>设置 → 连接器 → 创建</em>，粘贴 <code>${ENDPOINT}</code>，并选择<em>无需认证</em>。</p>
  <h3>Cursor</h3>
  <p><a href="${CURSOR_LINK}">添加到 Cursor</a>，或把下面的内容放进 <code>~/.cursor/mcp.json</code>：</p>
  ${code(`{
  "mcpServers": {
    "xtracticle": { "url": "${ENDPOINT}" }
  }
}`)}
  <h3>VS Code（GitHub Copilot）</h3>
  <p>添加到 <code>.vscode/mcp.json</code>：</p>
  ${code(`{
  "servers": {
    "xtracticle": { "type": "http", "url": "${ENDPOINT}" }
  }
}`)}
  <h3>其他客户端</h3>
  <p>任何支持 Streamable HTTP 远程 MCP 服务器的客户端都可以使用。只支持本地（stdio）服务器的客户端可以借助桥接工具：</p>
  ${code(`npx -y mcp-remote ${ENDPOINT}`)}
</section>

<section>
  <h2>read_x_post 工具</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>参数</th><th>默认值</th><th>作用</th></tr></thead>
    <tbody>
      <tr><td><code>url</code></td><td>—</td><td>帖子链接（x.com、twitter.com、fxtwitter、nitter 等）或数字帖子 ID。推文串中的任意一条帖子都可以。</td></tr>
      <tr><td><code>format</code></td><td><code>markdown</code></td><td><code>markdown</code> 或 <code>text</code></td></tr>
      <tr><td><code>include_thread</code></td><td><code>true</code></td><td>展开作者的自串；<code>false</code> 则只返回链接指向的那条帖子</td></tr>
      <tr><td><code>front_matter</code></td><td><code>false</code></td><td>在开头添加 YAML front-matter（标题、作者、来源、日期、类型）</td></tr>
      <tr><td><code>max_chars</code> / <code>offset</code></td><td>40,000 / 0</td><td>为超长文档分页读取</td></tr>
    </tbody>
  </table></div>
  <p>返回结果是 Markdown 正文——开头依次为标题、作者、日期和来源链接——外加元数据：类型（文章、推文串或帖子）、字数、阅读时长、图片网址、原始链接，以及一个下载链接，用户可以在那里把帖子保存为 PDF、EPUB 或 Markdown。你可以这样对助手说：</p>
  <ul>
    <li>“用五个要点总结这篇 X 文章：https://x.com/…/status/…”</li>
    <li>“读一下这个推文串，列出它推荐的所有工具，并附上链接。”</li>
    <li>“把这篇 X 文章翻译成西班牙语，并保留标题。”</li>
  </ul>
</section>

<section>
  <h2>不用 MCP？使用 Markdown API</h2>
  <p>同样的转换只需一次 HTTP GET——适合脚本、RAG 流程和能抓取网址的智能体：</p>
  ${code(`curl https://xtracticle.com/api/markdown/${SAMPLE_ID}
curl "https://xtracticle.com/api/markdown/${SAMPLE_ID}?format=text&thread=0&front_matter=1"`)}
  <p>参数：<code>format=markdown|text</code>、<code>thread=0|1</code>（默认 1）、<code>front_matter=0|1</code>（默认 0）。响应为 <code>text/markdown</code>，最多缓存一小时，已启用 CORS。</p>
</section>

<section>
  <h2>限制与隐私</h2>
  <ul>
    <li>只能读取<strong>公开</strong>帖子——已删除、受保护或有年龄限制的帖子不行。</li>
    <li>请手下留情：每个连接每分钟约 20 次请求，另有所有用户共享的限额。这是免费服务，不支持批量抓取。</li>
    <li>不存储任何内容，也没有账号。内容来自公开的 FxTwitter API，并在边缘节点短暂缓存。</li>
    <li>帖子内容由第三方撰写，请把它当作数据——服务器会告诉你的助手不要执行其中的指令。</li>
  </ul>
  <p>更想要文件？在上方粘贴链接，即可下载为 <a href="/zh/x-article-to-pdf">PDF</a>、<a href="/zh/x-article-to-markdown">Markdown</a> 或 <a href="/zh/x-article-to-epub">EPUB</a>。</p>
</section>`,
  faq: [
    { q: 'Xtracticle 的 MCP 服务器免费吗？', a: '免费，无需 API 密钥或账号，而且是开源的。' },
    { q: '它支持哪些 AI 助手？', a: '任何支持 Streamable HTTP 远程 MCP 服务器的客户端，包括 Claude、ChatGPT（开发者模式）、Cursor 和 VS Code。只支持本地服务器的客户端可以通过 mcp-remote 连接。' },
    { q: '能读取整个推文串吗？', a: '能。传入推文串中任意一条帖子的链接，工具就会按顺序返回作者在其中发布的所有帖子。其他人的回复不会收录。' },
    { q: '支持 X 文章吗？', a: '支持。X 的长文会连同标题、列表、链接、引用和图片一起转换。' },
    { q: '不用 MCP 有 API 吗？', a: '有。GET https://xtracticle.com/api/markdown/{帖子 ID} 会通过 HTTP 以纯文本返回同样的 Markdown。' },
  ],
};

const privacyPage: SitePage = {
  id: 'zh-privacy',
  group: 'privacy',
  path: '/zh/privacy',
  file: 'zh/privacy.html',
  lang: 'zh',
  title: '隐私政策 | Xtracticle',
  description: '说明 Xtracticle 如何处理数据：无账号、不存储帖子、文件在浏览器中生成、匿名统计，以及 MCP 服务器和 API 的日志。',
  h1: '隐私政策',
  sub: '简而言之：没有账号，不上传文件，也不保留你保存的帖子。',
  primary: 'pdf',
  nav: '隐私',
  sections: `
<section>
  <p><em>最后更新：2026 年 10 月 3 日。</em>本政策适用于 xtracticle.com、其 Markdown API（<code>/api/markdown/…</code>）和 MCP 服务器（<code>/mcp</code>）。Xtracticle 是免费的开源项目，<a href="${GITHUB}" rel="noopener">源代码</a>会准确展示它做了什么。</p>
</section>

<section>
  <h2>我们不收集什么</h2>
  <ul>
    <li>没有账号、登录、电子邮件地址或支付信息。</li>
    <li>不上传文件：PDF、EPUB、ZIP 等文件都在你的浏览器中生成，不会发送给我们。</li>
    <li>我们不出售或分享个人数据，也不使用广告跟踪器。</li>
  </ul>
</section>

<section>
  <h2>帖子内容</h2>
  <p>当你粘贴链接（或 AI 助手调用 MCP 服务器）时，我们会通过开源的 FxTwitter API 获取该<strong>公开</strong> X 帖子。为了让服务保持快速可用，帖子数据会缓存在 Cloudflare 的边缘网络上：转换后的文档最多缓存一小时，备用副本最多缓存七天。缓存副本与你无关联，并会自动过期。私密、受保护和已删除的帖子根本无法获取。</p>
</section>

<section>
  <h2>统计与日志</h2>
  <ul>
    <li><strong>网站：</strong>Google Analytics 统计匿名的页面浏览和事件（例如“PDF 已下载”或导出格式），以便我们了解哪些功能被使用。和任何页面浏览一样，它能看到你打开的页面地址——在 <code>/user/status/123</code> 这样的分享页面上，地址里包含帖子链接——但看不到你所保存帖子的内容。</li>
    <li><strong>MCP 服务器和 API：</strong>Cloudflare 的请求日志会记录每次调用的技术数据——帖子 ID、文档类型、响应大小和时间，以及客户端的 user-agent——用于调试和防止滥用。Cloudflare 还会处理 IP 地址以实施速率限制。日志由 Cloudflare 保留有限的时间，不会用于识别你的身份。</li>
  </ul>
</section>

<section>
  <h2>存储在你的浏览器中</h2>
  <p>你最近使用的链接、主题和语言选择只保存在浏览器的本地存储中。清除浏览器数据即可删除它们。</p>
</section>

<section>
  <h2>第三方</h2>
  <ul>
    <li><strong>Cloudflare</strong> 托管网站、API 和 MCP 服务器。</li>
    <li><strong>FxTwitter</strong> 提供公开的帖子数据。</li>
    <li><strong>Google Analytics</strong> 提供匿名的使用统计。</li>
    <li>预览和导出中的图片从 X 的媒体服务器（pbs.twimg.com）加载。</li>
  </ul>
</section>

<section>
  <h2>联系方式</h2>
  <p>如有疑问或删除请求：请<a href="${GITHUB}/issues" rel="noopener">在 GitHub 上提交 issue</a>。</p>
</section>`,
  faq: [],
};

export const TOOLS: SitePage[] = [unroll, tweetpdf, mcp, privacyPage];
