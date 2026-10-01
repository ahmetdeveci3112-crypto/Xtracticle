/** Simplified Chinese pages. */
import { samplePdfFigure, EXAMPLE, GITHUB, privacy, shortcuts, steps, type SitePage } from './blocks';

const home: SitePage = {
  id: 'zh-home',
  group: 'home',
  path: '/zh/',
  file: 'zh/index.html',
  lang: 'zh',
  isHome: true,
  title: 'X 文章下载器：推特长文、推文串保存为 PDF 和 Markdown | Xtracticle',
  description:
    '免费下载 X（推特）文章、推文串和帖子，支持导出 PDF、Markdown、EPUB/Kindle 和纯文本。粘贴链接即可获得带图片的干净文件，无需登录，开源。',
  h1: 'X 文章下载器',
  sub: '下载 X（推特）文章、推文串和帖子，支持 PDF、Markdown、EPUB 和纯文本——免费，无需登录。',
  primary: 'md',
  nav: 'X 文章下载器',
  sections: `
<section>
  <h2>如何下载 X 文章</h2>
  ${steps([
    '<strong>复制帖子链接</strong>——在 X 上点击 <em>分享 → 复制链接</em>。推文串中的任意一条帖子都可以。',
    '<strong>粘贴到上方输入框</strong>——Xtracticle 只需一两秒就能获取文章、推文串或帖子。',
    '<strong>选择格式</strong>——PDF、Markdown、EPUB/Kindle、ZIP + 图片或纯文本。',
    '<strong>完成</strong>——也可以直接复制、发送到 Obsidian，或让它朗读给你听。',
  ])}
  <p>想先看看效果？<a href="${EXAMPLE}">打开一篇 X 文章示例</a>。</p>
</section>

<section>
  <h2>你需要的格式，一应俱全</h2>
  <div class="xt-grid">
    <div><h3><a href="/zh/x-article-to-pdf">X 文章转 PDF</a></h3><p>A4 版式，可直接打印，图片内嵌，每页都有来源链接和页码。</p></div>
    <div><h3><a href="/zh/x-article-to-markdown">X 文章转 Markdown</a></h3><p>保留标题、粗体、链接、列表、引用和图片，可选添加 YAML front-matter。</p></div>
    <div><h3><a href="/zh/x-article-to-epub">X 文章转 EPUB / Kindle</a></h3><p>在 Kindle、Kobo 或 Apple Books 上阅读长文——图片已内嵌。</p></div>
    <div><h3><a href="/zh/save-x-articles-to-obsidian">X 文章保存到 Obsidian</a></h3><p>一键在你的知识库中新建笔记，包含完整文章和元数据。</p></div>
    <div><h3>ZIP + 图片</h3><p>Markdown 加上所有本地保存的图片——真正的离线存档，帖子被删也不怕。</p></div>
    <div><h3>纯文本</h3><p>干净的 .txt，适用于任何设备、脚本或 AI 工具。</p></div>
  </div>
</section>

<section>
  <h2>文章、推文串和单条帖子</h2>
  <p><strong>X 文章</strong>（最长 100,000 字符的长文帖子）会逐个内容块转换：标题、粗体、斜体、删除线、链接、无序和有序列表、引用、代码、分隔线、封面图、正文图片、视频和嵌入的帖子。</p>
  <p><strong>推文串</strong>会自动展开。粘贴第一条、中间任意一条或最后一条帖子，Xtracticle 都会找到整个自串，并合并成一份带编号的文档。试试 <a href="/zh/x-thread-to-pdf">X 推文串下载器</a>。</p>
  <p><strong>单条帖子</strong>会保留文字、换行、图片、视频和被引用的帖子。需要一次处理很多条？切换到<em>批量模式</em>，最多粘贴 20 个链接，即可得到一个 ZIP。</p>
</section>

${shortcuts('zh')}

<section>
  <h2>Xtracticle 与其他保存 X 帖子的方式对比</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th><th>截图 / 复制粘贴</th></tr></thead>
    <tbody>
      <tr><td>X 文章（长文）</td><td>✅ 完整保留格式</td><td>❌ 不支持</td><td>⚠️ 需手动处理</td></tr>
      <tr><td>免费 PDF</td><td>✅</td><td>Premium（3 美元/月）</td><td>⚠️ 只有图片</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>无需 @ 机器人或登录</td><td>✅</td><td>需要 @ 机器人，或使用其网站</td><td>✅</td></tr>
      <tr><td>开源</td><td>✅</td><td>❌</td><td>—</td></tr>
    </tbody>
  </table></div>
  <p>正在使用 Thread Reader App？查看<a href="/zh/thread-reader-app-alternative">完整对比</a>。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: 'Xtracticle 免费吗？', a: '免费。它是开源项目，无需注册、无需登录，也没有使用次数限制。' },
    { q: '如何把 X 文章下载为 PDF？', a: '复制帖子链接，粘贴到 Xtracticle，然后点击 PDF。PDF 包含标题、作者、日期、来源链接、所有图片和页码。' },
    { q: '可以下载完整的推特推文串吗？', a: '可以。粘贴推文串中任意一条帖子的链接——第一条、中间或最后一条都行。Xtracticle 会找到作者在该推文串中发布的所有帖子，并合并成一份带编号的文档。' },
    { q: 'X 文章和普通帖子有什么区别？', a: 'X 文章是带富文本格式（标题、列表、图片）的长文帖子，普通帖子则很短。Xtracticle 两者都支持，也支持推文串。' },
    { q: '可以把 X 文章保存到 Obsidian 或 Notion 吗？', a: '可以。下载 Markdown 文件，或点击 Obsidian 按钮——它会复制文章并打开一篇新笔记。Notion 可以直接导入 .md 文件。' },
    { q: '为什么提示找不到帖子？', a: '帖子可能已被删除、来自私密（受保护）账号，或有年龄限制。只能下载公开的帖子。' },
    { q: '我拿到的是 x.com/i/article/… 链接，怎么办？', a: '那是文章阅读器链接。请在 X 上打开该文章，点击“分享 → 复制链接”获取帖子链接（x.com/user/status/…），再粘贴即可。' },
  ],
};

const pdf: SitePage = {
  id: 'zh-pdf',
  group: 'pdf',
  path: '/zh/x-article-to-pdf',
  file: 'zh/x-article-to-pdf.html',
  lang: 'zh',
  title: 'X 文章转 PDF：推特长文保存为 PDF，免费在线转换 | Xtracticle',
  description:
    '把任意 X（推特）文章或帖子转换成干净、可直接打印的 PDF，带图片、来源链接和页码。免费，无需登录，iPhone、安卓和电脑都能用。',
  h1: 'X 文章转 PDF',
  sub: '把任意 X（推特）文章、推文串或帖子变成干净、可直接打印的 PDF——包含图片，无需登录。',
  primary: 'pdf',
  nav: 'X 文章转 PDF',
  sections: `
<section>
  <h2>三步把 X 文章转成 PDF</h2>
  ${steps([
    '<strong>复制 X 文章的链接</strong>（分享 → 复制链接）。',
    '<strong>粘贴到上方输入框</strong>，点击“提取”。',
    '<strong>点击 PDF</strong>——文件会立即下载。',
  ])}
</section>

<section>
  ${samplePdfFigure('zh')}
</section>

<section>
  <h2>你的 PDF 是什么样子</h2>
  <ul>
    <li><strong>干净的 A4 版式</strong>——没有 X 的侧边栏、按钮、回复和广告，只有文章本身。</li>
    <li><strong>标题、作者、日期和来源链接</strong>位于顶部，方便引用。</li>
    <li><strong>封面图和正文图片</strong>保持原位，并自动缩放以适应页面。</li>
    <li>页脚有<strong>页码</strong>，以及指向原帖的可点击链接。</li>
    <li><strong>不会截断文字</strong>——分页发生在段落之间而不是段落中间，超长文章也一样。</li>
  </ul>
</section>

<section>
  <h2>小贴士</h2>
  <h3>需要可选中、可搜索的文字？</h3>
  <p>PDF 为了保证排版精准，是按页面渲染的。如果你想高亮或搜索文字，请使用 <a href="/zh/x-article-to-epub">EPUB</a> 或 <a href="/zh/x-article-to-markdown">Markdown</a> 导出——也可以在结果页按 <code>Ctrl/Cmd + P</code>，选择<em>另存为 PDF</em>。</p>
  <h3>推文串转 PDF</h3>
  <p>粘贴推文串中的任意一条帖子，整个推文串就会变成一份 PDF。详见<a href="/zh/x-thread-to-pdf">推文串转 PDF</a>。</p>
  <h3>在 iPhone 上</h3>
  <p>点击 PDF，然后在 Safari 的下载列表中打开文件，使用<em>分享 → 存储到“文件”</em>，或发送到“图书”。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: 'X 转 PDF 转换器免费吗？', a: '完全免费，没有水印，无需登录，也没有次数限制。' },
    { q: 'PDF 里包含图片吗？', a: '包含。封面图和每一张正文图片都会收录。视频会显示为带链接的缩略图。' },
    { q: '可以把推特推文串转成 PDF 吗？', a: '可以。粘贴推文串中任意一条帖子的链接，Xtracticle 会把整个推文串合并成一份 PDF。' },
    { q: '手机上能用吗？', a: '能。在 iPhone、安卓、Mac、Windows 和 Linux 上的任何现代浏览器中都可以运行。' },
    { q: '可以转换私密或已删除的帖子吗？', a: '不可以。只能转换仍在线的公开帖子——这正是保存一份 PDF 副本的价值所在。' },
  ],
};

const markdown: SitePage = {
  id: 'zh-markdown',
  group: 'markdown',
  path: '/zh/x-article-to-markdown',
  file: 'zh/x-article-to-markdown.html',
  lang: 'zh',
  title: 'X 文章转 Markdown：推文、推文串导出为 .md 文件 | Xtracticle',
  description:
    '把 X（推特）文章、推文串和帖子转换成干净的 Markdown，保留标题、链接、列表和图片，可附带 YAML front-matter。适合 Obsidian、Notion、GitHub 和 AI 工具。',
  h1: 'X 文章转 Markdown',
  sub: '把 X（推特）文章、推文串和帖子转换成干净的 Markdown——格式、链接和图片全部保留。',
  primary: 'md',
  nav: 'X 文章转 Markdown',
  sections: `
<section>
  <h2>干净的 Markdown，而不是一团乱麻的复制粘贴</h2>
  <p>X 文章以富文本块的形式存储。Xtracticle 会把每个内容块转换成规范的 Markdown，让它在任何地方都能正确渲染：</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>在 X 上</th><th>在你的 .md 文件中</th></tr></thead>
    <tbody>
      <tr><td>标题 / 小标题</td><td><code>## Heading</code> / <code>### Subheading</code></td></tr>
      <tr><td>粗体、斜体、删除线</td><td><code>**bold**</code>、<code>*italic*</code>、<code>~~strike~~</code></td></tr>
      <tr><td>链接</td><td><code>[text](https://…)</code></td></tr>
      <tr><td>无序 / 有序列表（支持嵌套）</td><td><code>- item</code> / <code>1. item</code></td></tr>
      <tr><td>引用、代码、分隔线</td><td><code>&gt; quote</code>、围栏代码块、<code>---</code></td></tr>
      <tr><td>图片和视频</td><td><code>![caption](url)</code>、带链接的视频缩略图</td></tr>
      <tr><td>嵌入的帖子</td><td>指向被嵌入帖子的链接</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>附带 YAML front-matter</h2>
  <p>每个文件都可以以元数据开头，Obsidian（属性）、Hugo、Jekyll、Astro 和 Dataview 都能识别：</p>
  <pre><code>---
title: "The article title"
author: "Author Name (@handle)"
source: "https://x.com/handle/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>不需要？在下载按钮下方取消勾选<em>在 .md 中添加 YAML front-matter</em>即可。</p>
</section>

<section>
  <h2>适用场景</h2>
  <ul>
    <li><strong>笔记整理</strong>——Obsidian、Logseq、Notion、Bear、Joplin 以及任何 Markdown 编辑器。参见 <a href="/zh/save-x-articles-to-obsidian">Obsidian 指南</a>。</li>
    <li><strong>AI 工具</strong>——Markdown 是给 ChatGPT、Claude、Gemini 或 NotebookLM 提供上下文的最干净格式：粘贴进去就能总结、翻译或提问。</li>
    <li><strong>写作与发布</strong>——在博客文章、邮件通讯、文档和 GitHub README 中引用来源。</li>
    <li><strong>存档</strong>——下载 <em>ZIP + 图片</em>，把每张图片和 .md 文件一起保存在本地。</li>
  </ul>
</section>

${shortcuts('zh')}`,
  faq: [
    { q: '如何把推文转成 Markdown？', a: '把帖子链接粘贴到 Xtracticle，点击 Markdown；或点击“复制”，把 Markdown 放进剪贴板。' },
    { q: 'Markdown 里包含图片吗？', a: '包含，以图片链接的形式。选择 ZIP + 图片，还可以同时下载每张图片，并让 Markdown 指向本地副本。' },
    { q: '推文串也能转成 Markdown 吗？', a: '可以。粘贴推文串中的任意一条帖子，所有帖子会合并成一份带编号的 Markdown 文档。' },
    { q: '可以关闭 YAML front-matter 吗？', a: '可以。在下载按钮下方取消勾选 front-matter 选项即可，你的选择会被记住。' },
  ],
};

const thread: SitePage = {
  id: 'zh-thread',
  group: 'thread',
  path: '/zh/x-thread-to-pdf',
  file: 'zh/x-thread-to-pdf.html',
  lang: 'zh',
  title: 'X 推文串下载器：推特长推展开并保存为 PDF 或 Markdown | Xtracticle',
  description:
    '把任意 X（推特）推文串展开，保存为一份 PDF、Markdown、EPUB 或文本文件。粘贴推文串中的任意一条即可，无需 @ 机器人，无需登录，免费。',
  h1: 'X 推文串下载器',
  sub: '展开任意 X（推特）推文串，保存为一份干净的 PDF、Markdown、EPUB 或文本文件。粘贴推文串中的任意一条帖子即可。',
  primary: 'pdf',
  nav: 'X 推文串下载器',
  sections: `
<section>
  <h2>几秒钟展开一个推文串</h2>
  ${steps([
    '<strong>复制推文串中任意一条帖子的链接</strong>——第一条、中间的某一条，或者最后一条都行。',
    '<strong>粘贴到上方输入框。</strong>Xtracticle 会找到作者在该推文串中发布的所有帖子。',
    '<strong>下载</strong>合并后、带编号的推文串，格式可选 PDF、Markdown、EPUB 或文本。',
  ])}
</section>

<section>
  <h2>推文串是如何展开的</h2>
  <p>推文串是作者自己回复自己、连成一串的帖子。Xtracticle 会读取这条链，只保留作者本人的帖子并按顺序排列，其他人的回复不会收录。每条帖子都带有编号（<code>1/12</code>、<code>2/12</code>……），并保留换行、图片、视频和被引用的帖子。</p>
  <p>不需要在推文串下 @ 机器人，也不用等回复：一切就在这里私下完成。</p>
</section>

<section>
  <h2>为什么要保存推文串？</h2>
  <ul>
    <li><strong>阅读更舒适</strong>——一份连续的文档，不用一条一条地往下刷。</li>
    <li><strong>永久保存</strong>——推文串会被删除，账号会变成私密。一份 PDF 或 <em>ZIP + 图片</em>副本永远属于你。</li>
    <li><strong>学习与分享</strong>——把 PDF 发给团队、打印出来，或者把 Markdown 导入你的笔记或 AI 助手。</li>
    <li><strong>在电子阅读器上看</strong>——导出为<a href="/zh/x-article-to-epub">适用于 Kindle 的 EPUB</a>。</li>
  </ul>
</section>

${shortcuts('zh')}`,
  faq: [
    { q: '需要推文串的第一条推文吗？', a: '不需要。粘贴推文串中的任意一条帖子，整个推文串都会被拼合起来。' },
    { q: '会包含其他人的回复吗？', a: '不会。只收录作者本人在该推文串中发布的帖子，并按顺序排列。' },
    { q: '需要 @threadreaderapp 这样的机器人吗？', a: '不需要。无需发帖或 @ 任何人——粘贴链接，下载即可。' },
    { q: '可以展开私密账号的推文串吗？', a: '不可以。只能访问公开的推文串。' },
  ],
};

const epub: SitePage = {
  id: 'zh-epub',
  group: 'epub',
  path: '/zh/x-article-to-epub',
  file: 'zh/x-article-to-epub.html',
  lang: 'zh',
  title: 'X 文章转 EPUB：导出到 Kindle，在电子书阅读器上看推特长文 | Xtracticle',
  description:
    '把 X（推特）文章和推文串转换成 EPUB，并发送到 Kindle、Kobo、Apple Books 或 Google Play 图书。图片内嵌，免费，无需登录。',
  h1: 'X 文章转 EPUB 和 Kindle',
  sub: '在 Kindle、Kobo 或 Apple Books 上阅读 X（推特）长文和推文串——一本带图片的真正电子书。',
  primary: 'epub',
  nav: 'X 导出到 Kindle / EPUB',
  sections: `
<section>
  <h2>把 X 文章发送到 Kindle</h2>
  ${steps([
    '<strong>粘贴帖子链接</strong>到上方输入框，点击“提取”。',
    '<strong>点击“EPUB / Kindle”</strong>下载电子书。',
    '<strong>发送到 Kindle</strong>：使用 Send to Kindle 应用或网页，或者把文件通过邮件发到你的 Kindle 邮箱地址。',
  ])}
</section>

<section>
  <h2>是真正的电子书，不是截图</h2>
  <ul>
    <li><strong>自适应排版</strong>——可以在设备上调整字体和字号。</li>
    <li><strong>图片内嵌</strong>在文件中，离线也能看。</li>
    <li><strong>元数据</strong>——标题和作者会在你的书库中正确显示。</li>
    <li><strong>标准 EPUB 3</strong>——适用于 Kindle（通过 Send to Kindle）、Kobo、Apple Books、Google Play 图书、PocketBook 和 Calibre。</li>
  </ul>
</section>

<section>
  <h2>长文阅读的好帮手</h2>
  <p>X 文章最长可达 100,000 字符，推文串也可能长达几十条帖子。在电子墨水屏上阅读更护眼、不受打扰，而且不需要联网。登机前先存几篇，或者为周末列一份阅读清单。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: 'Kindle 支持 EPUB 吗？', a: '支持。亚马逊的 Send to Kindle 可以接收 EPUB 文件，并自动为你的设备转换格式。' },
    { q: '可以在 Apple Books 中阅读吗？', a: '可以。在 iPhone、iPad 或 Mac 上打开下载的 .epub 文件，选择“图书”即可。' },
    { q: '包含图片吗？', a: '包含，图片已嵌入 EPUB。视频以链接形式提供。' },
    { q: '可以把推文串转成 EPUB 吗？', a: '可以。粘贴推文串中的任意一条帖子，整个推文串就会变成一本电子书。' },
  ],
};

const obsidian: SitePage = {
  id: 'zh-obsidian',
  group: 'obsidian',
  path: '/zh/save-x-articles-to-obsidian',
  file: 'zh/save-x-articles-to-obsidian.html',
  lang: 'zh',
  title: '一键把 X（推特）文章和推文串保存到 Obsidian | Xtracticle',
  description:
    '把 X（推特）文章和推文串剪藏到 Obsidian，生成带属性（作者、来源、日期、标签）的干净 Markdown。一键完成，可选本地图片，免费开源。',
  h1: '把 X 文章保存到 Obsidian',
  sub: '一键把 X（推特）文章和推文串剪藏到你的 Obsidian 知识库，生成带属性的干净 Markdown。',
  primary: 'obsidian',
  nav: 'X 保存到 Obsidian',
  sections: `
<section>
  <h2>从 X 到你的知识库</h2>
  ${steps([
    '<strong>粘贴帖子链接</strong>到上方输入框，点击“提取”。',
    '<strong>点击“Obsidian”。</strong>Markdown 会被复制，Obsidian 会打开一篇包含它的新笔记。',
    '<strong>完成</strong>——标题、作者、来源、日期和标签已经写在笔记属性里了。',
  ])}
  <p>更喜欢文件？下载 <strong>Markdown</strong> 放进你的知识库，或下载 <strong>ZIP + 图片</strong>，把图片离线保存在笔记旁边的 <code>images/</code> 文件夹里。</p>
</section>

<section>
  <h2>可以查询的属性</h2>
  <p>每篇笔记都有 <code>title</code>、<code>author</code>、<code>source</code>、<code>published</code>、<code>saved</code>、<code>type</code>（article、thread 或 post）和 <code>tags</code>。借助 Dataview，你可以列出所有从 X 保存的内容：</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>为什么不用网页剪藏工具？</h2>
  <p>通用剪藏工具很难处理 X：页面需要登录，内容是动态加载的，推文串又被拆成许多条帖子。Xtracticle 直接读取帖子数据，所以 X 文章能保留标题和列表，推文串也会合并成一篇笔记。</p>
</section>

${shortcuts('zh')}`,
  faq: [
    { q: '点击 Obsidian 后没有反应。', a: '这台设备上必须已安装 Obsidian。Markdown 同时也会复制到剪贴板，你可以把它粘贴到任意笔记中。' },
    { q: '能配合 iPhone 或安卓上的 Obsidian 使用吗？', a: '可以，前提是已安装 Obsidian 应用。否则请使用“复制”，或下载 .md 文件。' },
    { q: '如何把图片也保存在我的知识库里？', a: '下载 ZIP + 图片，并解压到你的知识库中。Markdown 中的链接会指向本地图片文件夹。' },
    { q: '能配合 Logseq、Notion 或 Bear 使用吗？', a: '可以——下载或复制 Markdown，然后导入或粘贴即可。' },
  ],
};

const alternative: SitePage = {
  id: 'zh-tra',
  group: 'tra',
  path: '/zh/thread-reader-app-alternative',
  file: 'zh/thread-reader-app-alternative.html',
  lang: 'zh',
  title: 'Thread Reader App 免费替代品：支持 PDF、Markdown 和 X 文章 | Xtracticle',
  description:
    '在找 Thread Reader App 的替代品？Xtracticle 免费展开 X 推文串，并把 X 文章保存为 PDF、Markdown、EPUB 或文本——无需 @ 机器人，没有广告，无需登录。',
  h1: 'Thread Reader App 的免费替代品',
  sub: '展开 X 推文串，把 X 文章保存为 PDF、Markdown、EPUB 或文本——免费，无需 @ 机器人，没有广告，无需登录。',
  primary: 'pdf',
  nav: 'Thread Reader App 替代品',
  sections: `
<section>
  <h2>人们为什么要找替代品</h2>
  <p><a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a> 是一种广为人知的推文串展开方式：
  在推文串下评论 <code>@threadreaderapp unroll</code>，或在它的网站上粘贴链接。用来阅读很顺手。
  麻烦出在你想<strong>留存</strong>所读内容的时候：</p>
  <ul>
    <li><strong>PDF 导出是 Premium 功能</strong>（每月 3 美元 / 每年 30 美元，截至撰写时）。</li>
    <li><strong>不支持 X 文章</strong>——它的帮助页面称 X API 不提供文章内容的访问权限。</li>
    <li><strong>免费版有广告</strong>，而且没有 Markdown、EPUB 或 Obsidian 导出。</li>
  </ul>
  <p>Xtracticle 专注的正是这一环：把推文串和 X 长文变成归你所有的文件——而且免费。</p>
</section>

<section>
  <h2>并排对比</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>展开推文串</td><td>✅ 粘贴推文串中任意一条帖子</td><td>✅ @ 机器人或粘贴链接</td></tr>
      <tr><td>X 文章（长文）</td><td>✅ 标题、列表、图片、视频</td><td>❌ 不支持</td></tr>
      <tr><td>PDF</td><td>✅ 免费</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ 免费，附带 YAML front-matter</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ 免费</td><td>❌</td></tr>
      <tr><td>带图片的 ZIP（离线存档）</td><td>✅ 免费</td><td>❌</td></tr>
      <tr><td>批量下载</td><td>✅ 最多 20 个链接</td><td>❌</td></tr>
      <tr><td>广告</td><td>无</td><td>免费版有</td></tr>
      <tr><td>公开发帖 / @ 机器人</td><td>从不需要</td><td>使用机器人方式时需要</td></tr>
      <tr><td>作者提醒与自动存档</td><td>❌ 暂不支持</td><td>✅ Premium</td></tr>
      <tr><td>开源</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>对比依据为 2026 年 9 月查阅的 Thread Reader App <a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a> 和
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">帮助</a>页面。功能可能会变化——如有过时之处，请到
  <a href="${GITHUB}/issues" rel="noopener">GitHub</a> 告诉我们。</small></p>
</section>

<section>
  <h2>切换只需十秒</h2>
  ${steps([
    '<strong>复制推文串中任意一条帖子的链接</strong>——不用去找第一条。',
    '<strong>粘贴到上方输入框</strong>，点击“提取”。整个推文串会被合并并编号。',
    '<strong>下载</strong>为 PDF、Markdown、EPUB 或文本——也可以发送到 Obsidian。',
  ])}
</section>

<section>
  <h2>Thread Reader App 仍是更好选择的情况</h2>
  <p>如果你想<strong>直接在 X 里为其他人展开推文串</strong>（用机器人回复，让对话中的每个人都能得到一个可读链接），或者想为喜欢的作者设置<strong>自动提醒和存档</strong>，Thread Reader App 能做到，Xtracticle 做不到。很多人两者并用：用 Thread Reader App 即时阅读，用 Xtracticle 留存副本。</p>
</section>

${shortcuts('zh')}`,
  faq: [
    { q: 'Xtracticle 真的免费吗？', a: '是的。所有格式——PDF、Markdown、EPUB、ZIP 和文本——都免费，没有广告，无需登录，也没有使用次数限制。代码是开源的。' },
    { q: 'Xtracticle 能下载 X 文章吗？', a: '能。Xtracticle 可以转换 X 的长文（Articles），并保留标题、列表、链接、图片和视频。这是它与 Thread Reader App 的主要区别之一。' },
    { q: '需要 @ 机器人吗？', a: '不需要。在 Xtracticle 上粘贴链接即可，不会在 X 上发布任何内容。' },
    { q: '可以导入我在 Thread Reader App 的存档吗？', a: '不能直接导入。你可以粘贴原始的 X 链接（批量模式下每次最多 20 个），重新生成 Markdown 文件。' },
  ],
};

export const PAGES_ZH: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];
