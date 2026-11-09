/** Simplified Chinese: unroll, tweet to PDF, deleted tweet finder, MCP server and privacy pages. */
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
  <p>当你粘贴链接（或 AI 助手调用 MCP 服务器）时，我们会通过开源的 FxTwitter API 获取该<strong>公开</strong> X 帖子。为了让服务保持快速可用，帖子数据会缓存在 Cloudflare 的边缘网络上：转换后的文档最多缓存一小时，备用副本最多缓存七天。缓存副本与你无关联，并会自动过期。私密、受保护和已删除的帖子根本无法获取。当你粘贴个人主页链接时，我们只会把账号名发送到 Internet Archive 的 CDX API，以列出其存档帖子；结果最多缓存 30 天，且与你无关联。为了列出某个账号的最新帖子并打包成 ZIP 下载，我们会通过 FxTwitter API 获取该账号最近的公开帖子；该列表最多缓存 15 分钟，且与你无关联。</p>
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

/* ─── 已删除推文查找 ─── */

const deletedFinder: SitePage = {
  id: 'zh-deleted-finder',
  group: 'deleted-finder',
  path: '/zh/deleted-tweet-finder',
  file: 'zh/deleted-tweet-finder.html',
  lang: 'zh',
  title: '已删除推文查找：推特时光机，查看被删的推文 | Xtracticle',
  description: '粘贴个人主页链接或 @用户名，我们在 Wayback Machine 中查找该账号帖子的存档快照，包括已删除的帖子。免费，无需登录。',
  h1: '已删除推文查找',
  sub: '粘贴 X（推特）个人主页链接或 @用户名（不是帖子链接），即可列出该账号在 Wayback Machine 中存档的帖子。',
  primary: 'md',
  nav: '已删除推文查找',
  sections: `
<section>
  <p><strong>Xtracticle 的已删除推文查找工具会在 Wayback Machine 中搜索某个账号的帖子。</strong>输入 @用户名或粘贴个人主页链接，就能看到 Internet Archive
  保存过的该账号帖子，按从新到旧排列，每条都附有快照链接。如果某条帖子在有人存档之后才从 X 上删除，打开快照就能再次看到它——不少人把它叫作“推特时光机”。完全免费，无需账号。</p>
  <h2>三步查找已删除的推文</h2>
  ${steps([
    '<strong>指定账号：</strong>输入 <code>@用户名</code>，或粘贴个人主页链接（<code>x.com/用户名</code>）。请使用个人主页，而不是某条帖子的链接。',
    '<strong>点击“提取”。</strong>Xtracticle 会向 Wayback Machine 查询该账号所有被存档的帖子。存档服务响应较慢，最长可能需要一分钟。',
    '<strong>打开快照。</strong>列表按从新到旧显示最多 50 条存档帖子及其日期。<em>打开快照</em>可查看存档副本，<em>尝试获取原帖</em>可检查这条帖子是否还在 X 上。',
  ])}
  <p><strong>想抓住下一条被删的帖子？</strong>存档里只有别人保存过的内容。<a href="/zh/deleted-tweet-tracker">删推监控</a>会每小时检查一次账号，
  并保存它从现在起删除的每条帖子的文字。</p>
</section>

<section>
  <h2>能找到什么，找不到什么</h2>
  <p>只有在帖子消失前有人做过副本，才能看到已删除的帖子。本工具只查找一种副本，即 Wayback Machine 的快照，并且如实说明它的局限：</p>
  <ul>
    <li><strong>能找到已存档的帖子。</strong>Wayback Machine 记录过的该账号帖子都会列出，不论它仍然在线还是后来被删除。</li>
    <li><strong>找不到无人存档的帖子。</strong>在被保存之前就删除的帖子已经没有了。X 不再提供这些内容，任何工具都无法恢复。</li>
    <li><strong>不会标出哪些帖子已删除。</strong>X 不公开这类信息。请点击<em>尝试获取原帖</em>：能打开说明仍在线；显示找不到，则说明已删除或账号已设为私密。</li>
    <li><strong>无法读取私密账号。</strong>受保护的帖子从未公开，存档里通常也没有。</li>
    <li><strong>快照质量不一。</strong>较早的快照通常保留了正文；2020 年以后的部分快照只显示一个空白的 X 页面。</li>
    <li><strong>帖子很多的账号只显示一部分。</strong>列表显示最新的 50 条存档帖子，总数显示在列表上方。</li>
  </ul>
  <p>如果账号仍然公开，同一面板中还有<em>下载最新 20 条帖子（ZIP）</em>按钮，可在帖子还在线时，把该账号最新的 20 条公开帖子保存为 Markdown 文件。想以后还能看到某条帖子，最可靠的办法就是自己留一份副本。</p>
</section>

<section>
  <h2>只想找某一条已删除的帖子？</h2>
  <p>如果你有那条帖子本身的链接（<code>x.com/用户名/status/…</code>），直接粘贴它即可。当 X 已无法显示该帖子时，Xtracticle 会给出一键在 Wayback Machine 和 archive.today
  中搜索这条帖子的链接，并提供查看该账号其他存档帖子的入口。搜索结果仍可能为空：存档里只有帖子被删除前有人保存过的副本。手动搜索的具体步骤见
  <a href="/zh/guides/find-tweets-on-wayback-machine">Wayback Machine 指南</a>。</p>
</section>

<section>
  <h2>免费查找，还是付费的删推监控服务？</h2>
  <p>TrackTweets 这类付费服务会监控某个账号，从你开始监控的那天起保存它删除的每一条帖子。它们回答的是另一个问题，而且按账号收费：</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>付费监控服务</th></tr></thead>
    <tbody>
      <tr><td>能找到</td><td>过去被存档的帖子，包括你查看之前就已删除的</td><td>开始监控之后被删除的帖子</td></tr>
      <tr><td>价格</td><td>免费 · 完整列表和 CSV 导出需 Pro，每年 36 美元起</td><td>每个账号每月约 9 美元（TrackTweets，撰写本文时）</td></tr>
      <tr><td>账号</td><td>无需登录，无需关联任何账号</td><td>需要注册并订阅</td></tr>
      <tr><td>适合</td><td>一次性查看某个账号发过什么</td><td>长期监控特定账号</td></tr>
    </tbody>
  </table></div>
  <p>最新 50 条不够用？<a href="/zh/pro">Xtracticle Pro</a> 会显示 Wayback Machine 为该账号保存的全部存档帖子（最多 1500 条），并可导出为 CSV。按年付费折合每月 3 美元起，或一次性支付 59 美元。Pro 还包含 <a href="/zh/deleted-tweet-tracker">Watch（删推监控）</a>：每小时检查最多 5 个公开账号（终身版为 2 个），并保存被删除帖子的文字，通过订阅源或邮件摘要发送给你。</p>
</section>

<section>
  <h2>延伸阅读</h2>
  <ul>
    <li><a href="/zh/guides/how-to-see-deleted-tweets">如何查看已删除推文</a>：哪些地方可能留有副本，哪些方法根本行不通。</li>
    <li><a href="/zh/guides/recover-deleted-tweets">已删除的推文能恢复吗？</a>：你自己的帖子、X 数据存档以及其中的限制。</li>
    <li><a href="/zh/guides/find-tweets-on-wayback-machine">如何在 Wayback Machine 查找推文</a>：手动搜索与通配符网址。</li>
  </ul>
  <p>要保存仍在线的帖子或推文串，可以使用<a href="/zh/">首页</a>的工具，用<a href="/zh/unroll-twitter-thread">推文串展开</a>把它合并成一页阅读，
  或者用 <a href="/zh/x-thread-to-pdf">推文串转 PDF</a> 和 <a href="/zh/tweet-to-pdf">推文转 PDF</a> 保存为文件。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: '怎样查看别人已删除的推文？', a: '在 Xtracticle 中输入对方的 @用户名或粘贴其个人主页链接，然后点击“提取”。工具会列出该账号在 Wayback Machine 中存档的帖子，并附上每个快照的链接。只有在删除前有人存档过，已删除的帖子才会出现。' },
    { q: '从未被存档的已删除推文能显示吗？', a: '不能。帖子一旦删除，X 就不再提供。如果事先没人存档，就没有任何副本可供任何工具显示。' },
    { q: '列表会标出哪些推文被删除了吗？', a: '不会，因为 X 不公开删除信息。在某一条上点击“尝试获取原帖”：能打开说明仍在线，找不到则说明已删除或账号为私密。' },
    { q: '已删除推文查找免费吗？', a: '免费。无需登录，也绝不会要求你关联 X 账号。' },
    { q: '可以只查找某一条已删除的帖子吗？', a: '可以。粘贴帖子链接而不是个人主页链接。如果 X 已无法显示该帖子，Xtracticle 会给出一键在 Wayback Machine 和 archive.today 中搜索它的链接。' },
    { q: '私密账号可以用吗？', a: '不可以。受保护的帖子从未公开，无法读取，存档里通常也没有。' },
  ],
};

/* ─── 删推监控 ─── */

const deletedTracker: SitePage = {
  id: 'zh-deleted-tracker',
  group: 'deleted-tracker',
  path: '/zh/deleted-tweet-tracker',
  file: 'zh/deleted-tweet-tracker.html',
  lang: 'zh',
  title: '删推监控：推文被删后自动保存并提醒 | Xtracticle',
  description: '免费监控一个公开 X 账号 14 天。帖子一被删除，Xtracticle 就保存原文，并通过 RSS 或邮件通知你。无需绑卡，无需登录 X。',
  h1: '删推监控',
  sub: '监控一个公开的 X（推特）账号，保存它删除的每一条帖子。免费试用 14 天：输入 @用户名，再填写你的邮箱。',
  primary: 'md',
  nav: '删推监控',
  sections: `
<section>
  <p><strong>只有在推文消失前有人留了副本，才能看到已删除的推文。</strong>Xtracticle Watch 就是那份副本。
  添加一个公开账号后，Xtracticle 每小时读取它最新的帖子。一旦它之前见过的帖子从 X 上消失，你就会在专属订阅源和每日邮件中收到
  这条帖子的文字、日期和媒体链接；如果 Wayback Machine 有副本，也会一并附上。</p>
  <h2>如何监控账号删除的推文</h2>
  ${steps([
    '<strong>开始免费试用。</strong>在上方输入账号的 <code>@用户名</code>，在其存档帖子下方的 Watch 框里填写邮箱，然后点击我们发给你的确认链接。14 天内可监控 1 个账号：无需绑卡，无需 Xtracticle 账号，无需登录 X。',
    '<strong>选择想了解的内容。</strong>链接会打开你的试用页面，里面有一个可放进阅读器的专属 RSS / JSON 订阅源；可选择已删除的帖子、新帖子，或两者都要。一有变化，就会向你确认过的邮箱发送每日摘要邮件。',
    '<strong>用 Pro 继续监控。</strong>14 天结束后，监控会自动停止。<a href="/zh/pro">Xtracticle Pro</a> 可以让监控持续下去，最多监控 5 个账号（终身版为 2 个）。付款由 Gumroad 处理，许可证密钥会发到你的邮箱。',
  ])}
  <p>同样的查找也会列出 Wayback Machine 已为该账号存档的帖子，
  所以你还能看到在开始监控之前它发过什么、删过什么。</p>
</section>

<section>
  <h2>Watch 能监控到什么，监控不到什么</h2>
  <ul>
    <li><strong>添加账号之后被删除的帖子。</strong>Watch 会保存该账号最新约 40 条帖子的快照，并每小时比对一次。帖子消失后，会先到 X 上再确认一次才算已删除，所以时间线加载慢不会造成误报。</li>
    <li><strong>开始监控之前就已删除的帖子不在其内。</strong>这类请使用在 Wayback Machine 中搜索的<a href="/zh/deleted-tweet-finder">已删除推文查找</a>。</li>
    <li><strong>几分钟内就被删的帖子不在其内。</strong>在两次每小时检查之间发布又删除的帖子不会被看到。</li>
    <li><strong>仅限公开账号。</strong>如果账号变为私密或被注销，监控会暂停，并向你发送一次通知。</li>
    <li><strong>新帖子也能提醒。</strong>把监控设为<em>新帖</em>或<em>两者</em>，无需关注该账号，同一个订阅源就会在它发帖时通知你。</li>
  </ul>
</section>

<section>
  <h2>Xtracticle Watch 还是其他监控服务？</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle Pro</th><th>常见的付费监控服务</th></tr></thead>
    <tbody>
      <tr><td>价格</td><td>5 个账号：每月 5 美元或每年 36 美元 · 2 个账号：一次性 59 美元</td><td>每个账号每月约 9 美元（TrackTweets，撰写本文时）</td></tr>
      <tr><td>免费试用</td><td>14 天，1 个账号，仅需邮箱确认，无需绑卡</td><td>因服务而异</td></tr>
      <tr><td>注册</td><td>无需注册。只需一个许可证密钥，无需登录 X，也不关联任何账号</td><td>需要账号和订阅</td></tr>
      <tr><td>提醒</td><td>专属 RSS / JSON 订阅源，每日邮件摘要</td><td>因服务而异</td></tr>
      <tr><td>过去的删除</td><td>该账号完整的 Wayback 存档（最多 1500 条）及 CSV</td><td>通常只从你开始监控的那天算起</td></tr>
      <tr><td>另外包含</td><td>一次批量保存 200 个链接、MCP / API 密钥、不带署名行的 PDF</td><td>—</td></tr>
    </tbody>
  </table></div>
  <p><a href="/zh/pro">查看 Xtracticle Pro 及价格</a>。网站其余部分的帖子、推文串和长文保存仍然免费。</p>
</section>

<section>
  <h2>哪些人会用删推监控</h2>
  <ul>
    <li><strong>记者和研究者：</strong>需要留存公众人物、企业或官方账号的言论，即使之后被删除。</li>
    <li><strong>品牌和社区运营：</strong>关注竞争对手和合作伙伴的公告。</li>
    <li><strong>关注公开争议的人：</strong>这类事件里帖子往往事后消失。</li>
  </ul>
  <p>Watch 只读取账号公开发布的内容，也就是任何人在 x.com 上都能看到的帖子。它从不登录 X，也看不到私密账号。
  关于会保存哪些数据，以及如何申请排除某个账号，请参阅<a href="/zh/privacy">隐私页面</a>。</p>
</section>

<section>
  <h2>延伸阅读</h2>
  <ul>
    <li><a href="/zh/deleted-tweet-finder">已删除推文查找</a>：在 Wayback Machine 中搜索账号的存档帖子，免费。</li>
    <li><a href="/zh/guides/how-to-see-deleted-tweets">如何查看已删除推文</a>：哪些地方可能留有副本，哪些方法根本行不通。</li>
    <li><a href="/zh/guides/find-tweets-on-wayback-machine">如何在 Wayback Machine 查找推文</a>：手动搜索与通配符网址。</li>
  </ul>
</section>

${privacy('zh')}`,
  faq: [
    { q: '有人删除推文时，我能收到通知吗？', a: '可以。把这个公开账号添加到 Xtracticle Watch（Xtracticle Pro 的一部分）。它每小时检查一次账号，一旦之前见过的帖子被删除，就会把带有帖子文字的记录加入你的专属 RSS 订阅源和每日邮件摘要。' },
    { q: '有免费试用吗？', a: '有。可免费监控一个公开账号 14 天：在上方输入账号，填写你的邮箱，然后点击我们发给你的确认链接。无需绑卡，也不需要许可证密钥；每个邮箱地址只能试用一次，不会扣任何费用：试用结束后，监控会自动停止。若要继续监控，或同时监控最多 5 个账号，请获取 Xtracticle Pro。' },
    { q: '监控多快能发现删除？', a: '账号大约每小时检查一次。删除之后的下一次检查时订阅源就会更新；邮件摘要每天发送一次。' },
    { q: '能看到开始监控之前被删的推文吗？', a: 'Watch 不能，因为它从没见过那些帖子。请使用免费的已删除推文查找，它会列出 Wayback Machine 存档的帖子，包括之后才被删除的。' },
    { q: '需要用我的 X 账号登录吗？', a: '不需要。Xtracticle 从不索要你的 X 登录信息。付款后，Gumroad 会通过邮件把许可证密钥发给你，用它即可解锁 Pro。' },
    { q: '可以监控多少个账号？', a: '按月或按年订阅可监控 5 个公开账号，一次性终身版可监控 2 个。你随时可以在 Pro 页面更换账号。' },
    { q: '私密账号可以用吗？', a: '不可以。受保护的帖子并不公开，无法读取。如果被监控的账号变为私密，监控会暂停，并向你发送一次通知。' },
  ],
};

export const TOOLS: SitePage[] = [unroll, tweetpdf, deletedFinder, deletedTracker, mcp, privacyPage];
