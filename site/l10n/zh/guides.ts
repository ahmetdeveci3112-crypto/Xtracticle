/**
 * Simplified Chinese guides: informational articles about X (Twitter) Articles, threads and
 * archiving. Facts about X are dated "截至撰写时（2026 年 10 月）" because X changes these rules often.
 */
import { privacy, type FAQ, type ExportKey, type SitePage } from '../../blocks';

const HUB = '/zh/guides';
const WHEN = '截至撰写时（2026 年 10 月）';

const back = `<p><a href="${HUB}">← 全部指南</a></p>`;

const takeaways = (items: string[]) =>
  `<section>
  <h2>要点速览</h2>
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
  id: `zh-guide-${g.slug}`,
  group: `guide-${g.slug}`,
  path: `${HUB}/${g.slug}`,
  file: `zh/guides/${g.slug}.html`,
  lang: 'zh',
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
  title: '什么是 X 文章？谁能发布、如何保存 | Xtracticle',
  description: 'X 文章是 X（推特）上带标题、图片和列表的长文。谁能发布、与推文串有何不同，以及如何保存。',
  h1: '什么是 X 文章？',
  sub: 'X 文章是直接在 X 上发布的带格式长文——谁能写、与推文串有什么区别、怎样留存一份副本，这里一次讲清楚。',
  primary: 'pdf',
  sections: `
${takeaways([
  'X 文章是直接在 X 上发布的带格式长文（有标题、图片、列表），而不是一串短帖子。',
  `发布是付费功能：${WHEN}，X 表示仅限 Premium、Premium+、Premium Business 和 Premium Organizations 订阅用户。阅读则没有这个限制。`,
  '文章不同于推文串（多条相互关联的短帖子），也不同于单条长帖子。',
  '想留存一篇，把链接粘贴到 <a href="/zh/">Xtracticle</a>，下载为 PDF、Markdown、EPUB 或 ZIP 即可。',
])}

<section>
  <h2>X 文章是什么</h2>
  <p>X 文章是以一份文档的形式存在于 X 上的长篇文字。作者不必把想法拆成带编号的推文串，而是写一篇有标题、可选封面图和结构化正文的文章。X 帮助中心把文章描述为“在 X 上分享长篇书面内容的新方式”。</p>
  <p>据第三方指南，文章的长度可达约 100,000 字符，远超传统帖子的 280 字符。据我们所知，X 的帮助页面并未给出一个明确的数字，所以请把这个数字当作大致参考。</p>

  <h2>谁能发布 X 文章</h2>
  <p>X 在 2024 年 3 月推出文章功能，最初是 Premium+ 的专属功能。据 <a href="https://www.storyboard18.com/digital/x-expands-long-form-articles-access-to-all-premium-subscribers-87544.htm" rel="noopener nofollow">Storyboard18</a> 报道，2026 年 1 月起向所有 Premium 订阅用户开放。X 官方的<a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">文章帮助页面</a>称，发布仅限 Premium 和 Premium+ 订阅用户、Premium Businesses 以及 Premium Organizations。</p>
  <p>任何人都可以按作者选择的受众设置阅读已发布的文章，阅读不需要付费。</p>
</section>

<section>
  <h2>X 文章与帖子、推文串、笔记的区别</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>帖子</th><th>推文串</th><th>X 文章</th></tr></thead>
    <tbody>
      <tr><td>结构</td><td>一条短帖子</td><td>同一作者的多条关联帖子</td><td>带标题的一份文档</td></tr>
      <tr><td>排版</td><td>纯文本、媒体</td><td>纯文本、每条帖子可带媒体</td><td>标题、粗体、斜体、列表、嵌入媒体</td></tr>
      <tr><td>阅读方式</td><td>时间线</td><td>顺着自我回复一路刷下去</td><td>专用的阅读视图</td></tr>
      <tr><td>谁能创建</td><td>任何人</td><td>任何人</td><td>付费订阅用户</td></tr>
    </tbody>
  </table></div>
  <p>推文串本质上仍然是帖子，所以每一条都可以单独点赞、回复和引用。文章则作为一个整体来阅读。部分订阅用户可用的更长单条帖子仍然是普通帖子，没有标题。</p>
</section>

<section>
  <h2>排版功能</h2>
  <p>据 X 的帮助页面，文章可以包含图片、视频、GIF、嵌入的帖子和链接，文字可以设置标题、小标题、粗体、斜体、删除线、缩进，以及有序或无序列表。这让它更像一篇博客文章，而不是推文串。</p>

  <h2>如何找到 X 文章</h2>
  <ul>
    <li>在电脑端打开 X 侧边导航中的<strong>文章</strong>标签（如果你的账号可用）。</li>
    <li>查看作者的个人主页：他们的文章会和帖子一起显示。</li>
    <li>搜索标题中出现的词，并筛选为你关注的人。</li>
    <li>想看每周精选清单，请见 <a href="/best-x-articles">Best X Articles</a>（英文）。</li>
  </ul>
  <p>分享文章时，X 可能会给你一个 <code>x.com/i/article/…</code> 形式的阅读器链接。大多数工具需要的是帖子链接，即 <code>x.com/user/status/…</code>。</p>
</section>

<section>
  <h2>如何保存 X 文章</h2>
  <p>X 没有为他人文章提供内置的“导出为 PDF”按钮。可行的办法有：</p>
  <ol>
    <li><strong>浏览器打印。</strong>能用，但会带上 X 的界面，图片还常被分页截断。</li>
    <li><strong>复制粘贴。</strong>大部分格式和图片都会丢失。</li>
    <li><strong>Xtracticle。</strong>粘贴帖子链接，即可下载带标题、作者、日期、来源链接和图片的干净文件：<a href="/zh/x-article-to-pdf">X 文章转 PDF</a>、<a href="/zh/x-article-to-markdown">Markdown</a> 或<a href="/zh/x-article-to-epub">适用于 Kindle 的 EPUB</a>。</li>
  </ol>
  <p>留存副本很重要，因为作者可能删除帖子，账号被封禁后内容也会消失。请阅读<a href="/zh/guides/recover-deleted-tweets">哪些内容能恢复、哪些不能</a>。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: '什么是 X 文章？', a: 'X 文章是直接在 X 上发布的长文，有标题、小标题、列表、图片等媒体，而不是一串短帖子。' },
    { q: '谁能发布 X 文章？', a: '截至撰写时（2026 年 10 月），X 表示发布仅限 Premium、Premium+、Premium Business 和 Premium Organizations 订阅用户。该功能在 2024 年 3 月作为 Premium+ 功能推出，2026 年 1 月向所有 Premium 等级开放。' },
    { q: '阅读 X 文章需要付费吗？', a: '不需要。按作者选择的受众设置，任何人都可以阅读已发布的文章。' },
    { q: 'X 文章和推文串有什么不同？', a: '推文串是一系列各自独立的帖子，每条都有自己的点赞和回复。文章则是带标题和小标题的单一排版文档。' },
    { q: '如何把 X 文章保存为 PDF？', a: '复制帖子链接，粘贴到 Xtracticle，点击 PDF。你会得到带图片和原帖链接的干净 A4 文件。' },
  ],
});

/* ─── 2. Read without an account ─── */

const readWithout = guide({
  slug: 'read-x-articles-without-account',
  title: '不登录阅读 X 文章和推文串 | Xtracticle',
  description: '如何不登录阅读 X（推特）文章、推文串和帖子：哪些可行，X 会拦截什么，以及把 x.com 换成 xtracticle.com 的小技巧。',
  h1: '如何不登录阅读 X 文章',
  sub: '简而言之：把地址里的 x.com 换成 xtracticle.com，公开文章就会完整打开，无需登录。',
  primary: 'pdf',
  sections: `
${takeaways([
  '未登录的访客在 X 上常会看到登录提示、被截断的内容或不完整的推文串，而且这种行为会随时间变化。',
  '在地址栏把 <code>x.com</code> 换成 <code>xtracticle.com</code>，即可不登录阅读完整的公开文章、推文串或帖子。',
  '这只对公开内容有效。受保护账号、已删除的帖子和有年龄限制的帖子无法显示。',
  '之后你可以把正在读的内容下载为 PDF、Markdown 或 EPUB。',
])}

<section>
  <h2>未登录打开 X 会发生什么</h2>
  <p>未登录的访客能否看到完整帖子，取决于内容类型、所在国家和 X 当前的政策，而 X 已不止一次调整过。实际上，你可能只能看到一条帖子而看不到回复，或者被提示登录，或者只看到部分推文串。由于规则一直在变，我们不对 x.com 本身的任何具体行为作出承诺。</p>
  <p>不过，公开内容就是公开的。只要作者没有设置账号保护，任何人都可以阅读其帖子。问题只在于官方网站让你不登录就阅读的体验有多顺畅。</p>
</section>

<section>
  <h2>方法一：替换域名</h2>
  <p>在任意 X 帖子或文章页面，把地址栏中的 <code>x.com</code> 改成 <code>xtracticle.com</code>，然后按回车。</p>
  ${'<p><code>x.com/user/status/123</code> → <code>xtracticle.com/user/status/123</code></p>'}
  <p>页面会通过开源的 FxTwitter API 加载公开内容，并以可读的文字和图片展示。不需要账号，文章上方没有 cookie 横幅，也不用安装 App。打开推文串中的任意一条帖子，整个推文串会展开成一页。</p>
  <p>在手机上还有一键方案：添加<a href="/zh/">首页</a>提供的 iPhone 快捷指令或浏览器书签脚本。</p>

  <h2>方法二：粘贴链接</h2>
  ${'<ol class="xt-steps"><li>在 X 应用或网站上，点击<em>分享 → 复制链接</em>。</li><li>打开 <a href="/zh/">xtracticle.com</a> 并粘贴链接。</li><li>直接在那里阅读，或下载为 <a href="/zh/x-article-to-pdf">PDF</a> 离线阅读。</li></ol>'}
  <p>如果链接形如 <code>x.com/i/article/…</code>，请在 X 上打开该文章，改为复制它的帖子链接（带 <code>/status/</code> 的那个）。</p>
</section>

<section>
  <h2>哪些可行，哪些不行</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>内容</th><th>通过 Xtracticle 不登录阅读</th></tr></thead>
    <tbody>
      <tr><td>公开的 X 文章</td><td>可以，完整文字、格式和图片</td></tr>
      <tr><td>公开的推文串</td><td>可以，作者本人的帖子按顺序合并</td></tr>
      <tr><td>带图片和被引用帖子的公开单条帖子</td><td>可以</td></tr>
      <tr><td>其他人的回复</td><td>不可以，不会收录</td></tr>
      <tr><td>受保护（私密）账号</td><td>不可以</td></tr>
      <tr><td>已删除或被封禁的内容</td><td>不可以</td></tr>
      <tr><td>有年龄限制或仅登录可见的帖子</td><td>通常不可以</td></tr>
    </tbody>
  </table></div>
  <p>如果提示“找不到”，通常属于最后三行中的某一种。</p>
</section>

<section>
  <h2>其他不登录阅读的办法</h2>
  <ul>
    <li><strong>搜索引擎结果。</strong>有些帖子会显示预览，但通常只是一小段摘要。</li>
    <li><strong>别人做的 PDF 或截图。</strong>读起来没问题，但你无法核实它是否与原文一致。</li>
    <li><strong>作者提供的 RSS 或邮件摘要</strong>（如果有的话）。</li>
  </ul>
  <p>如果你经常阅读 X 上的内容，把好文章存下来比日后再去翻找更省事。长推文串请看 <a href="/zh/x-thread-to-pdf">X 推文串下载器</a>。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: '不登录能读 X 文章吗？', a: '公开文章可以不登录阅读：把地址中的 x.com 换成 xtracticle.com，或者把链接粘贴到 Xtracticle。受保护或已删除的帖子无法显示。' },
    { q: 'x.com 换成 xtracticle.com 的技巧是怎么工作的？', a: 'Xtracticle 使用与 X 相同的路径。只改域名，例如把 x.com/user/status/123 改成 xtracticle.com/user/status/123，就能在这里打开该帖子。' },
    { q: '会显示回复吗？', a: '不会。对于推文串，它显示的是原作者写的帖子，其他用户的回复不会收录。' },
    { q: '为什么帖子提示找不到？', a: '该帖子可能已被删除，或来自受保护账号、被封禁账号，或有年龄限制。只能显示公开的帖子。' },
    { q: '这样阅读合法吗？', a: '它读取的是作者公开发布的内容。请尊重作者的版权：保存副本供自己阅读，与重新发布是两回事。' },
  ],
});

/* ─── 3. Recover deleted tweets ─── */

const deleted = guide({
  slug: 'recover-deleted-tweets',
  title: '已删除的推文能恢复吗？真实可行的方法 | Xtracticle',
  description: '如实讲解如何恢复已删除的 X（推特）帖子：你的数据存档、Wayback Machine、archive.today、搜索缓存，以及为什么尽早保存才是真正的办法。',
  h1: '已删除的推文能恢复吗？',
  sub: '有时可以，但很少能从 X 本身找回。这里列出现有的办法、各自的可靠程度，以及如何避免走到这一步。',
  primary: 'zip',
  sections: `
${takeaways([
  '帖子一旦被删除，X 就不再提供它，Xtracticle 这类工具也无法获取。',
  '你自己删除的帖子，只有在你手里有删除前生成的旧 X 数据存档时，才可能找回。',
  '别人删除的帖子，只有在有人事先保存过时才会留存：Wayback Machine、archive.today 或一张截图。覆盖情况参差不齐。',
  '可靠的办法是在帖子和文章还在线时就保存下来，存为 PDF 或带图片的 ZIP。',
])}

<section>
  <h2>实话实说</h2>
  <p>没有“撤销删除”按钮。作者删除帖子后，X 就不再显示它，任何读取公开帖子的工具，包括 <a href="/zh/">Xtracticle</a>，都会提示找不到。剩下的只有别人更早做的副本。下面的每一种办法，都是在设法找到这样的副本，没有哪一种能保证成功。</p>
</section>

<section>
  <h2>办法一：你自己的 X 数据存档</h2>
  <p>如果被删的帖子是你自己的，请检查你在删除之前下载过的账号存档。X 允许你在<em>设置和隐私 → 你的账号 → 下载数据存档</em>中申请存档，需要验证身份。据 X 的<a href="https://help.x.com/articles/20170320" rel="noopener nofollow">帮助页面</a>，存档准备好后你会收到邮件或通知，登录后即可下载 .zip 文件。删除之后新生成的存档不会包含该帖子，所以只有你手里已有更早的存档时，这个办法才有用。</p>

  <h2>办法二：Wayback Machine</h2>
  <p>Internet Archive 的 <a href="https://web.archive.org/" rel="noopener nofollow">Wayback Machine</a> 有时保存着某条帖子或某个主页的快照。把准确的帖子网址（<code>x.com/user/status/…</code>，也可以试试旧的 <code>twitter.com</code> 形式）粘贴到搜索框，然后打开快照日历。第三方报道称，X 让存档工具更难稳定地抓取主页，而且覆盖最好的是知名账号，或有人手动保存过的页面。对于很快就被删除的冷门帖子，别指望能有结果。</p>
  <p>你也可以用 <code>web.archive.org/save/</code> 的 Save Page Now 自己存档一个在线页面。但这只有在删除之前做才有用。</p>

  <h2>办法三：archive.today 及类似服务</h2>
  <p>archive.today 等服务允许任何人给页面做快照。去那里搜索帖子网址。和 Wayback Machine 一样，只有当有人事先保存过，才会有结果。</p>
</section>

<section>
  <h2>办法四：搜索引擎缓存和截图</h2>
  <ul>
    <li><strong>搜索引擎缓存。</strong>Google 已经下线了公开的“缓存”链接，所以在 2026 年这基本是条死路。删除后的一段时间内，搜索结果也许还会显示旧的摘要，但不能指望它。</li>
    <li><strong>别人的截图。</strong>引用帖子、回复和新闻报道里常常带有截图。它们能证明这条帖子存在过，但不能证明具体写了什么，因为截图很容易伪造。</li>
    <li><strong>引用了被删帖子的帖子。</strong>引用已删除帖子的引用帖，通常会把它显示为不可用，所以别指望它保留原文。</li>
  </ul>
  <p>对那些声称能“恢复任何已删除推文”的网站要保持警惕。它们拿不到 X 已移除的数据，充其量也只是在搜索上面列出的这些存档。</p>
</section>

<section>
  <h2>真正的办法：趁它还在线时保存</h2>
  <p>如果一条帖子或文章对你很重要——无论是工作的资料来源、凭证、公告，还是将来可能要引用的内容——现在就保存它：</p>
  <ul>
    <li><a href="/zh/x-article-to-pdf">PDF</a> 保留版式、图片、作者、日期和原帖链接，也方便分享。</li>
    <li><strong>ZIP + 图片</strong>把 Markdown 和每张图片保存为独立文件，是耐久的离线存档。</li>
    <li><strong>批量模式</strong>一次最多处理 20 个链接，放进同一个 ZIP。</li>
  </ul>
  <p>保存的副本展示的是你保存时帖子的内容。它无法向第三方证明真实性，但会记录日期、作者和来源链接。关于自己的备份，请见<a href="/zh/guides/backup-x-articles">如何备份你的 X 文章和推文串</a>。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: '能恢复已删除的推文吗？', a: '只有在别处存在副本时才行：你账号更早的 X 数据存档、Wayback Machine 或 archive.today 的快照，或一张截图。X 本身不会恢复已删除的帖子。' },
    { q: 'Xtracticle 能下载已删除的帖子吗？', a: '不能。Xtracticle 读取的是仍在线的公开帖子，已删除的帖子会提示找不到，所以尽早保存重要帖子很关键。' },
    { q: 'Wayback Machine 里有已删除的推文吗？', a: '有时有。只有在帖子或主页于删除前被抓取过才行，而且覆盖参差不齐，主要集中在知名账号或有人手动保存过的页面。' },
    { q: 'X 的数据存档里会保留我已删除的帖子吗？', a: '删除帖子之后生成的存档不会包含它。你更早下载的存档，则仍保留当时的内容。' },
    { q: '如何在帖子消失前把它保存好？', a: '把链接粘贴到 Xtracticle 并下载 PDF；如果想把媒体也存成文件，就下载带图片的 ZIP。' },
  ],
});

/* ─── 4. X Articles vs Substack vs Medium ─── */

const versus = guide({
  slug: 'x-articles-vs-substack',
  title: 'X 文章、Substack 与 Medium 对比 | Xtracticle',
  description: '从读者、变现、归属、导出和 SEO 几方面，为写作者对比 X 文章、Substack 和 Medium，并介绍如何备份 X 文章。',
  h1: 'X 文章、Substack 与 Medium 对比',
  sub: '三个发布长文的平台，从受众、收入、归属权、导出和搜索可见度几方面做对比。',
  primary: 'md',
  sections: `
${takeaways([
  'X 文章能让你在 X 内立即触达读者，但归属权较弱：没有订阅者名单，也没有内置的文章导出。',
  'Substack 围绕可导出的邮件订阅名单构建，并从付费订阅中抽成。',
  'Medium 按会员阅读时长向作者付费，自带内容分发，但你的读者属于平台。',
  '许多写作者用 X 做发现，以邮件通讯或博客为大本营。无论如何，都建议把 X 文章备份为 Markdown。',
])}

<section>
  <h2>一图速览</h2>
  <p>平台规则和费用会变。下表概括了各平台${WHEN}的运作方式；做决定之前，请查看各平台当前的条款。</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>X 文章</th><th>Substack</th><th>Medium</th></tr></thead>
    <tbody>
      <tr><td>主要受众</td><td>你的关注者和 X 的时间线</td><td>邮件订阅者</td><td>Medium 读者和会员</td></tr>
      <tr><td>谁能发布</td><td>Premium 等级订阅用户</td><td>任何人</td><td>任何人</td></tr>
      <tr><td>变现</td><td>X 基于 Premium 用户互动的创作者分成</td><td>付费订阅；Substack 抽取 10%，另加支付处理费</td><td>合作伙伴计划，按会员阅读时长付费</td></tr>
      <tr><td>受众归属</td><td>关注者，而不是你能导出的名单</td><td>订阅者名单可导出</td><td>关注者和邮箱留在平台上</td></tr>
      <tr><td>内容导出</td><td>没有内置的文章导出</td><td>可导出文章和订阅者</td><td>可导出账号数据</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>受众与发现</h2>
  <p><strong>X 文章</strong>就在你已有读者所在的地方。如果你有关注者，文章不需要他们再注册什么就能触达，好内容还能靠转发传播。反过来，时间线决定谁能看到什么，关注者也不是你能掌控的名单。</p>
  <p><strong>Substack</strong> 把文章送进订阅者的收件箱，所以触达更可预期，但要从零开始积累。它也有自己的推荐功能和 App。</p>
  <p><strong>Medium</strong> 有自带的读者和话题推送，有助于新作者被发现。但大部分受众采用计量式会员模式，触达取决于 Medium 的分发。</p>

  <h2>变现</h2>
  <p>X 在 2024 年 11 月把创作者分成调整为基于 Premium 订阅用户的互动，而不是广告收入（<a href="https://www.mediapost.com/publications/article/400171/x-ends-ad-revenue-share-for-creators-focuses-on-p.html" rel="noopener nofollow">MediaPost</a>）。Substack 允许你为付费订阅定价，并抽取 10% 外加 Stripe 费用（<a href="https://faq.substack.com/p/how-do-paid-subscriptions-on-substack" rel="noopener nofollow">Substack FAQ</a>）。Medium 按会员阅读时长分配会员费（<a href="https://help.medium.com/hc/en-us/articles/360036691193" rel="noopener nofollow">Medium Help</a>）。三个平台的收入差异都很大，我们不提供收入数字。</p>
</section>

<section>
  <h2>归属权与可迁移性</h2>
  <p>这是最大的差别。Substack 出版物附带可导出的订阅者名单和可导出的文章，所以你可以迁移到别的平台。X 提供包含你帖子的账号数据存档，但据我们所知，存档对文章的涵盖并不明确，也没有一键导出文章的功能。Medium 允许你下载账号数据，不过你的读者仍留在 Medium。</p>
  <p>如果你在 X 上发布文章，请自己留一份。<a href="/zh/x-article-to-markdown">Xtracticle 的 Markdown 导出</a>能把文章变成干净的 .md 文件（可选 front-matter），方便在博客、Substack 或 Obsidian 中复用。<a href="/zh/guides/backup-x-articles">备份指南</a>里有一套工作流。</p>

  <h2>SEO 与收录</h2>
  <p>Substack 和 Medium 的页面是普通的公开网页，会被搜索引擎收录。X 的内容也会被收录，但 X 是一个厚重、偏向登录的应用，一篇文章有多少可被抓取、对未登录用户展示多少，是会变化的。把 X 当作分发渠道，把你自己的域名或邮件通讯当作能长期赢得搜索流量的地方。</p>
</section>

<section>
  <h2>你该怎么选？</h2>
  <ul>
    <li><strong>你已经在 X 上有关注者</strong>，想试试长文：在 X 上发布，再把最好的几篇复制到邮件通讯。</li>
    <li><strong>你想建立订阅者关系并设置付费档：</strong>Substack。</li>
    <li><strong>你想被不认识你的读者发现：</strong>Medium，但要接受上面提到的取舍。</li>
  </ul>
  <p>它们并不互斥。常见的做法是只写一次，发布到你自己的邮件通讯，再分享到 X。</p>
</section>`,
  faq: [
    { q: 'X 文章比 Substack 好吗？', a: '它们的目标不同。X 文章直接触达你在 X 上已有的关注者；Substack 给你可导出的邮件名单和付费订阅。许多写作者两者并用。' },
    { q: '能导出我的 X 文章吗？', a: 'X 没有一键导出文章的功能。你可以用 Xtracticle 粘贴链接，把每篇保存为 Markdown、PDF 或 ZIP。' },
    { q: 'Substack 如何从作者身上获利？', a: '截至撰写时（2026 年 10 月），Substack 抽取付费订阅收入的 10%，另加 Stripe 的支付处理费。当前条款请查看其 FAQ。' },
    { q: 'Medium 如何向作者付费？', a: '通过合作伙伴计划，按会员阅读或收听某位作者作品的时长来分配会员费。' },
    { q: '哪个对 SEO 最好？', a: '放在你自己域名或邮件通讯存档上的内容，通常能带来最持久的搜索可见度。Substack 和 Medium 的页面是公开网页；X 主要是社交分发渠道。' },
  ],
});

/* ─── 5. Backup ─── */

const backup = guide({
  slug: 'backup-x-articles',
  title: '如何备份你的 X 文章和推文串 | Xtracticle',
  description: '备份 X 文章和推文串：X 数据存档涵盖什么、Markdown 与带图片的 ZIP 导出、Obsidian 工作流和批量模式。',
  h1: '如何备份你的 X 文章和推文串',
  sub: '写作者的两层方案：用 X 自己的账号存档做兜底，再为每篇文章保存真正能打开、能复用的 Markdown 或 ZIP 文件。',
  primary: 'md',
  sections: `
${takeaways([
  'X 的账号数据存档值得申请，但据我们能核实的信息，它围绕帖子、媒体和账号数据构建，可能并不包含可阅读文档形式的文章。',
  '对每篇文章或推文串，请用 <a href="/zh/x-article-to-markdown">Xtracticle</a> 导出 Markdown 或带图片的 ZIP。',
  '批量模式最多接受 20 个链接，并返回一个 ZIP。',
  '把文件存放在 Obsidian、Notion 或同步文件夹里，并再做一份备份。',
])}

<section>
  <h2>第一层：X 的账号数据存档</h2>
  <p>在 X 应用或网站上申请：<em>设置和隐私 → 你的账号 → 下载数据存档</em>。你需要用发送到邮箱或手机的验证码验证身份，点击<em>请求数据</em>，准备好后 X 会通知你。然后登录后在设置中下载 .zip（<a href="https://help.x.com/articles/20170320" rel="noopener nofollow">X Help</a>）。第三方指南提到，下载链接可能在短时间后失效，所以请尽快下载。</p>
  <h3>它涵盖什么</h3>
  <p>存档由数据文件和媒体文件夹组成：你的帖子、账号详情等等。它可以作为你写过某些内容以及何时写的记录。</p>
  <h3>文章方面的注意事项</h3>
  <p>我们没有找到任何 X 文档说明文章会以排版文档的形式包含在内，对存档内容的描述提到的也是帖子，而非文章。依赖它之前，请打开自己的存档查看；我们并未在每个账号上验证过。即使文字在里面，它也是以数据文件形式存储的，而不是带版式和图片的可读文章。</p>
</section>

<section>
  <h2>第二层：自己导出每篇文章</h2>
  <h3>单篇文章或推文串</h3>
  ${'<ol class="xt-steps"><li>在 X 上打开你的文章，点击<em>分享 → 复制链接</em>。（如果链接中带有 <code>/i/article/</code>，请改用带 <code>/status/</code> 的帖子链接。）</li><li>粘贴到 <a href="/zh/">Xtracticle</a>。</li><li>选择 <strong>Markdown</strong> 得到文本文件，或选择 <strong>ZIP + 图片</strong>，把每张图片也保存为文件。</li></ol>'}
  <p>对于推文串，粘贴其中任意一条帖子，整个自串就会按顺序合并。</p>
  <h3>一次处理很多：批量模式</h3>
  <p>切换到<em>批量模式</em>，粘贴最多 20 个链接，下载一个 ZIP。往期文章很多的话，就按每组 20 个重复操作。</p>
  <h3>选哪种格式</h3>
  <ul>
    <li><strong>Markdown (.md)：</strong>最适合复用、编辑和迁移到其他平台。参见 <a href="/zh/x-article-to-markdown">Markdown 导出</a>。</li>
    <li><strong>ZIP + 图片：</strong>Markdown 加媒体文件，是完整的离线副本。</li>
    <li><strong>PDF：</strong>最适合分享，也适合作为固定版式的记录。参见 <a href="/zh/x-article-to-pdf">X 文章转 PDF</a>。</li>
  </ul>
</section>

<section>
  <h2>保持井井有条</h2>
  <h3>Obsidian</h3>
  <p>Xtracticle 可以把文章作为新笔记打开到你的知识库中，front-matter 里包含标题、作者、来源、日期和标签。详见<a href="/zh/save-x-articles-to-obsidian">把 X 文章保存到 Obsidian</a>。</p>
  <h3>Notion</h3>
  <p>Notion 可以导入 Markdown 文件：使用<em>导入 → 文本和 Markdown</em>，然后选择 .md 文件。</p>
  <h3>简单的文件夹方案</h3>
  <ul>
    <li>每年一个文件夹，文件命名为 <code>YYYY-MM-DD-title.md</code>。</li>
    <li>把图片放在文件旁边（ZIP 导出就是这样做的）。</li>
    <li>在 front-matter 里保留原始 X 链接，随时都能追溯来源。</li>
  </ul>
  <p>遵循 3-2-1 原则：至少在不同设备或服务上保存两份副本，其中一份放在异地，例如云存储或私有 Git 仓库。</p>
</section>

<section>
  <h2>养成习惯</h2>
  <p>每次发布文章时就备份，因为那时你手里有链接。每隔几个月再申请一次新的 X 账号存档，作为第二层保障。如果你也想了解帖子被删的风险，请阅读<a href="/zh/guides/recover-deleted-tweets">哪些内容能恢复、哪些不能</a>。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: 'X 数据存档包含我的文章吗？', a: '我们没有找到 X 文档说明文章会以排版文档的形式包含在内。请检查你自己的存档，并把单篇导出作为第二份副本。' },
    { q: '如何连同图片一起备份 X 文章？', a: '把帖子链接粘贴到 Xtracticle，选择 ZIP + 图片。你会得到一个 Markdown 文件，每张图片都保存在它旁边。' },
    { q: '可以一次备份很多文章吗？', a: '可以。批量模式最多接受 20 个链接，并返回一个 ZIP。' },
    { q: '可以备份别人的文章吗？', a: '你可以保存任何公开的文章，供个人阅读或参考。请尊重作者的版权，未经许可不要重新发布。' },
    { q: '可以把 Markdown 文件移到 Notion 或 Obsidian 吗？', a: '可以。Obsidian 直接打开 .md 文件，Notion 可以通过“导入 → 文本和 Markdown”导入 Markdown。' },
  ],
});

/* ─── 6. See deleted tweets ─── */

const seeDeleted = guide({
  slug: 'how-to-see-deleted-tweets',
  title: '如何查看已删除推文：现实可行的办法 | Xtracticle',
  description: '如何查看他人已删除的推文：存档、搜索摘要、引用帖子和截图，以及哪些办法行不通、如何提前保存帖子。',
  h1: '如何查看已删除推文',
  sub: '只有事先有人做过副本，才能看到别人已删除的帖子。这里讲副本通常在哪里，以及哪些是死路。',
  primary: 'pdf',
  sections: `
${takeaways([
  '帖子被删除后，X 就不再提供它。包括 Xtracticle 在内，没有人能再从 X 获取它。',
  '只有事先有人复制过，你才能看到别人已删除的帖子：网页存档快照、截图、新闻报道或保存的文件。',
  '最值得查找的地方是 Wayback Machine、archive.today，以及引用过被删帖子的帖子或文章。',
  '声称能“显示任何已删除推文”的网站，拿不到 X 已移除的数据，请对它们保持怀疑。',
  '如果帖子很重要，请趁它还在线时存为 <a href="/zh/tweet-to-pdf">PDF</a> 或 ZIP。',
])}

<section>
  <h2>你自己删除的帖子与别人删除的帖子</h2>
  <p>这是两个不同的问题。对<strong>你自己</strong>的帖子，旧版 X 数据存档里可能仍有这些内容，这条路径见<a href="/zh/guides/recover-deleted-tweets">已删除的推文能恢复吗？</a>。本指南讲的是<strong>别人</strong>的帖子——你没有自己的存档，只能依赖第三方做的副本。</p>
  <p>一开始就要实事求是。没有隐藏的 X 页面，没有特殊网址，也没有任何账号设置能显示已删除的帖子。如果存在副本，它也在别的地方。</p>
</section>

<section>
  <h2>副本可能在哪里</h2>
  <h3>1. 网页存档</h3>
  <p>Internet Archive 的 Wayback Machine 和 archive.today 会为网页做快照。如果有人在帖子被删前存档了这条帖子或作者的主页，你就能打开那份快照。覆盖最好的是知名账号和有人刻意保存过的帖子，最差的是几分钟内就被删除的普通帖子。具体步骤请看<a href="/zh/guides/find-tweets-on-wayback-machine">如何在 Wayback Machine 查找推文</a>。</p>
  <h3>2. 引用帖子、回复和提及</h3>
  <p>人们常常通过引用来回应一条帖子。如果原帖之后被删除，X 通常会在引用旁显示“该帖子不可用”的提示，所以原文已经没了。不过，描述或转述它的回复和其他帖子，仍能告诉你它大致讲了什么。请把这些当作二手信息。</p>
  <h3>3. 截图</h3>
  <p>记者、事实核查人员和普通用户会给可能消失的帖子截图。搜索帖子里有辨识度的一句话，或作者账号加上话题，可能找到这些图片。截图能说明确实发布过某些内容，但很容易伪造或裁剪，单独作为证据很弱。请再找一个独立来源。</p>
  <h3>4. 新闻和博客报道</h3>
  <p>如果帖子有新闻价值，文章常会嵌入或引用它。有些嵌入内容在原帖被删后仍会显示文字，但这取决于页面的构建方式，不能依赖。</p>
  <h3>5. 搜索引擎摘要</h3>
  <p>搜索结果可能在帖子被删后的短时间内仍显示旧摘要。Google 已经下线了公开的“缓存”链接，所以你无法再从结果中打开存储的页面。如果看到摘要，请立即复制或截图，因为索引刷新后它可能消失。</p>
</section>

<section>
  <h2>哪些办法行不通</h2>
  <ul>
    <li><strong>“已删除推文查看器”类网站。</strong>它们读不到 X 已移除的数据。充其量是搜索你自己也能搜索的那些公开存档，最糟糕的是要求你提供 X 登录信息或付款。</li>
    <li><strong>猜网址。</strong>已删除帖子的地址会返回“找不到”，无论你用 x.com、twitter.com 还是镜像站。</li>
    <li><strong>浏览器小技巧和替换域名的技巧。</strong>把 x.com 换成 xtracticle.com 只能读取仍在线的帖子。对已删除的帖子，结果是找不到。它能做什么，请看<a href="/zh/guides/read-x-articles-without-account">不登录阅读 X</a>。</li>
    <li><strong>联系 X 客服。</strong>X 不会让其他用户访问别人已删除的帖子。</li>
  </ul>
  <p>受保护账号是另一种情况：它们的帖子从来不是公开的，所以存档通常什么也没有。</p>
</section>

<section>
  <h2>建议的尝试顺序</h2>
  <ol>
    <li>如果你有帖子网址，就把它粘贴到 Wayback Machine，x.com 和 twitter.com 两种形式都试一试。</li>
    <li>在 archive.today 查找同一个网址。</li>
    <li>用引号搜索帖子中有辨识度的一句话，找截图、引用或相关报道。</li>
    <li>看看作者的其他渠道。人们常会在别处重新发布被删除的声明。</li>
    <li>如果找到了副本，记下你在哪里、什么时候找到的，在有第二个来源之前，不要假定它是准确的。</li>
  </ol>
  <p>如果什么都没找到，就当这条帖子已经没了。对冷门帖子来说，这是常见的结果。</p>
</section>

<section>
  <h2>趁重要帖子还在线时保存</h2>
  <p>以后还能看到一条帖子，唯一可靠的办法是自己留一份副本。把链接粘贴到 <a href="/zh/">Xtracticle</a>，下载带作者、日期、图片和原帖链接的 PDF，或者把图片存为文件的 ZIP。长推文串请使用 <a href="/zh/x-thread-to-pdf">X 推文串下载器</a>，想先把推文串当作一页来读，可以试试<a href="/zh/unroll-twitter-thread">推文串展开</a>。保存的文件记录了你看到的内容和你看到它的时间。它不能向第三方证明什么，但比凭记忆可靠得多。写作者可以按<a href="/zh/guides/backup-x-articles">备份指南</a>建立日常流程。</p>
  <p>只复制你个人参考所需的内容，分享时请尊重作者的版权和隐私。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: '能看到别人已删除的推文吗？', a: '只有在删除之前就有人做过副本时才行，例如 Wayback Machine 或 archive.today 的快照、截图，或引用过它的新闻报道。X 不会向任何人显示已删除的帖子。' },
    { q: '有能显示任何已删除推文的网站吗？', a: '没有。声称能做到的网站读不到 X 已移除的数据。它们搜索的是你自己也能搜索的公开存档，有些还会要求你登录或付款，请务必小心。' },
    { q: '引用帖子会保留被删除的文字吗？', a: '通常不会。原帖被删除后，X 会把被引用的帖子显示为不可用，不过引用者自己写的话仍然保留。' },
    { q: 'Xtracticle 能显示已删除的帖子吗？', a: '不能。Xtracticle 读取的是仍在线的公开帖子，已删除的帖子会提示找不到。' },
    { q: '如何确保以后还能看到一条帖子？', a: '趁它还在线时保存。把链接粘贴到 Xtracticle，下载 PDF 或带图片的 ZIP。' },
  ],
});

/* ─── 7. Wayback Machine ─── */

const wayback = guide({
  slug: 'find-tweets-on-wayback-machine',
  title: '在 Wayback Machine 查找已删除推文 | Xtracticle',
  description: '在 Wayback Machine 查找已存档推文的分步指南：要尝试的网址形式、日历、通配符搜索、Save Page Now 和 archive.today。',
  h1: '如何在 Wayback Machine 查找推文',
  sub: '在 Internet Archive 中搜索已存档的 X（推特）帖子和主页的精确清单，并如实说明它的不足。',
  primary: 'pdf',
  sections: `
${takeaways([
  '先搜索准确的帖子网址，x.com 和 twitter.com 两种形式都要试，然后再试主页网址。',
  '像 <code>web.archive.org/web/*/twitter.com/username/status/*</code> 这样的通配符搜索，会列出某个账号所有已存档的帖子网址。',
  '日历上的蓝点表示抓取成功，橙色或红色通常显示的是错误页面。',
  'X 的覆盖参差不齐，搜不到不代表帖子从未存在过。',
  'Save Page Now 在 X 上可能失败，所以对重要内容，请同时自己留一份副本。',
])}

<section>
  <h2>开始之前</h2>
  <p><a href="https://web.archive.org/" rel="noopener nofollow">web.archive.org</a> 上的 Wayback Machine 保存网页快照。它并没有保存 X 的完整副本。只有当 Internet Archive 的爬虫，或使用 Save Page Now 的人抓取了那个页面，推文才会出现在这里。据 Internet Archive 的<a href="https://help.archive.org/help/using-the-wayback-machine/" rel="noopener nofollow">帮助页面</a>，覆盖并不完整，依赖 JavaScript 的页面很难存档。X 恰恰就是这类网站，第三方报道还称它限制了自动化访问。所以请调整预期：知名账号和被广泛分享的帖子机会最大。</p>
  <p>你需要帖子的地址。如果没有，请先尝试从引用、新闻报道或作者主页中找到它。</p>
</section>

<section>
  <h2>分步操作</h2>
  <h3>1. 搜索准确的帖子网址</h3>
  <p>把完整链接粘贴到 web.archive.org 的搜索框。格式为 <code>https://x.com/username/status/1234567890</code>。如果你只知道旧地址，就用 <code>https://twitter.com/username/status/1234567890</code>。status ID 才是标识帖子的部分，比域名更重要。</p>
  <h3>2. 试遍所有网址变体</h3>
  <p>同一条帖子可能以多种地址存储。请逐个尝试：</p>
  <ul>
    <li><code>x.com/username/status/ID</code></li>
    <li><code>twitter.com/username/status/ID</code></li>
    <li><code>mobile.twitter.com/username/status/ID</code></li>
    <li><code>www.twitter.com/username/status/ID</code></li>
    <li>如果你是从分享链接复制的，同一网址末尾带 <code>?s=20</code> 或其他跟踪参数的形式</li>
  </ul>
  <h3>3. 用通配符列出某个账号的全部内容</h3>
  <p>如果你不知道 status ID，可以请求某个路径下所有已抓取的网址。Internet Archive 记载了通配符形式 <code>web.archive.org/web/*/example.com/*</code>。对于 X，就变成：</p>
  <p><code>web.archive.org/web/*/twitter.com/username/status/*</code></p>
  <p>对 <code>x.com</code> 也这样做一遍。结果是一长串已存档的帖子网址。用浏览器的查找功能在其中搜索 status ID 或地址的一部分。如果列表很长，存档站还提供 CDX 接口，以纯表格形式返回同样的数据。像 <code>web.archive.org/cdx/search/cdx?url=twitter.com/username/status/*&amp;fl=timestamp,original,statuscode&amp;collapse=urlkey</code> 这样的查询对许多账号有效，但当前参数请查阅 Internet Archive 的 CDX 文档。</p>
  <h3>4. 检查主页</h3>
  <p>搜索 <code>twitter.com/username</code> 和 <code>x.com/username</code>。主页快照可能显示那一天的近期帖子。一条只存在了几天的短帖子，出现在这里的可能性比它自己的抓取页面更大。</p>
  <h3>5. 看日历</h3>
  <p>当某个网址有抓取记录时，你会看到当年的日历。圆点和链接标记有快照的日期，颜色表示爬虫收到的状态。据 Internet Archive，蓝色表示成功，绿色表示重定向，橙色表示客户端错误，红色表示服务器错误。请选择蓝色的日期，最好是帖子被删除之前不久的。抓取完成后，可能要几个小时才会显示。</p>
  <h3>6. 打开快照并核对</h3>
  <p>存档页面有时加载不出图片或回复，或者显示登录提示而不是帖子。请试试日历上更早和更晚的快照，因为其中某一份的渲染可能更好。如果要引用，请记下带时间戳的完整存档地址。</p>
</section>

<section>
  <h2>Save Page Now 及其在 X 上的局限</h2>
  <p>要自己存档一个在线页面，请使用 <code>web.archive.org/save</code> 上的 Save Page Now，粘贴网址并提交。据 Internet Archive，这会按需保存单个页面，不会保存整个网站。请在内容被删除之前操作，因为它无法抓取已经消失的帖子。</p>
  <p>在 X 上，Save Page Now 可能失败，或生成显示登录界面的快照，因为 X 常常拦截自动化请求。如果出现这种情况，这份快照作为记录就没有价值。这就是我们建议在自己的文件里再留一份的原因。<a href="/zh/tweet-to-pdf">推文转 PDF</a>和 <a href="/zh/">Xtracticle</a> 会渲染公开帖子并替你保存结果。</p>
</section>

<section>
  <h2>替代方案：archive.today</h2>
  <p>archive.today（也可通过 archive.ph 等地址访问）是另一个独立的存档站，允许任何人提交页面。在那里搜索帖子网址，如果帖子仍在线，也可以把它粘贴到保存框中。它有自己的覆盖范围和缺口，域名也会不时变化，所以请搜索当前的地址。当 Wayback Machine 一无所获时，可以把它当作第二意见。</p>
</section>

<section>
  <h2>为什么你可能什么都找不到</h2>
  <ul>
    <li>帖子在任何爬虫或用户保存之前就被删除了。</li>
    <li>账号受保护，页面从来没有公开过。</li>
    <li>抓取记录存在，但只显示登录墙或错误页面。</li>
    <li>Internet Archive 的排除流程把它移除了，经请求它可以这样做。</li>
  </ul>
  <p>想了解更全面的情况，包括你自己的数据存档，请阅读<a href="/zh/guides/recover-deleted-tweets">已删除的推文能恢复吗</a>和<a href="/zh/guides/how-to-see-deleted-tweets">如何查看已删除推文</a>。想留存的推文串，最好用 <a href="/zh/x-thread-to-pdf">X 推文串下载器</a>或<a href="/zh/unroll-twitter-thread">推文串展开</a>来保存。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: 'Wayback Machine 会保存推文吗？', a: '有时会。只有当它的爬虫或某位用户抓取了那个页面，才会存储这条帖子。对 X 的覆盖参差不齐，知名账号最完整。' },
    { q: '应该搜索 x.com 还是 twitter.com？', a: '两个都搜。较早的抓取通常在 twitter.com 下，较新的可能在 x.com 下，同一个 status ID 可能出现在任意一个下面。' },
    { q: '如何列出某个账号所有已存档的推文？', a: '使用通配符搜索，例如 web.archive.org/web/*/twitter.com/username/status/*，再用 x.com 重复一遍。' },
    { q: '可以对推文使用 Save Page Now 吗？', a: '可以试，但 X 常常拦截存档工具，所以快照可能显示登录界面。它也无法抓取已经被删除的帖子。' },
    { q: '如果 Wayback Machine 什么都没有怎么办？', a: '试试 archive.today，并搜索截图或引用。如果都没有，这条帖子很可能无法找回。' },
  ],
});

/* ─── 8. How to write an X Article ─── */

const writeArticle = guide({
  slug: 'how-to-write-x-article',
  title: '如何撰写并发布 X 文章 | Xtracticle',
  description: '如何在 X 上写文章：谁能发布、编辑器在哪里、排版与封面图、发布后如何编辑，以及如何备份。',
  h1: '如何撰写并发布 X 文章',
  sub: '从资格到发布按钮：你需要什么、编辑器提供什么，以及如何为写好的文章留存副本。',
  primary: 'md',
  sections: `
${takeaways([
  `发布文章需要付费订阅：${WHEN}，X 的帮助页面将其限定为 Premium、Premium+、Premium Business 和 Premium Organizations 账号。`,
  '从 X 的导航中打开“文章”区域，选择撰写新文章。各 App 中的可用情况不一，所以 x.com 网页版是最稳妥的起点。',
  '你可以使用标题、封面图、小标题、列表、链接、图片、视频和嵌入的帖子。',
  '据 X 称，编辑已发布的文章会使其下线，直到你重新发布。',
  '每篇文章发布时就备份。请见<a href="/zh/guides/backup-x-articles">备份指南</a>。',
])}

<section>
  <h2>谁能写文章</h2>
  <p>X 在 2024 年为 Premium+ 订阅用户推出文章功能，后来扩大了开放范围。${WHEN}，X 的<a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">文章帮助页面</a>称，发布仅限 Premium 和 Premium+ 订阅用户、Premium Businesses 以及 Premium Organizations。套餐名称和价格会变，所以如果找不到该选项，请检查你自己的账号。</p>
  <p>任何人都可以阅读已发布的文章。更多背景请见<a href="/zh/guides/what-are-x-articles">什么是 X 文章？</a></p>
</section>

<section>
  <h2>分步操作</h2>
  <ol class="xt-steps">
    <li>在电脑上用符合条件的账号登录 x.com。</li>
    <li>在左侧导航中找到<strong>文章</strong>。如果看不到，请检查你的订阅，或在发帖编辑器的菜单中找找撰写文章的选项。</li>
    <li>选择<strong>撰写</strong>，打开一份新草稿。X 会保存草稿，你可以稍后再回来。</li>
    <li>添加标题，然后写正文。如果需要，可添加封面图。</li>
    <li>先预览，再点击<strong>发布</strong>。文章会出现在你的个人主页上，并可作为帖子分享。</li>
  </ol>
  <p>随着 X 更新产品，具体的名称和菜单位置会变化。如果名称与上面不同，请以你屏幕上显示的为准。</p>
</section>

<section>
  <h2>编辑器能做什么</h2>
  <p>据 X 的帮助页面，文章可以包含图片、视频、GIF、嵌入的帖子和链接。文字格式涵盖标题、小标题、粗体、斜体、删除线、缩进，以及有序或无序列表。</p>
  <h3>封面图</h3>
  <p>封面显示在文章顶部，通常也会出现在时间线预览中。X 的帮助页面没有给出我们能核实的图片尺寸。宽图效果最好，因为预览会裁剪它，所以请让文字远离边缘，并在发布后检查实际效果。</p>
  <h3>嵌入帖子和媒体</h3>
  <p>粘贴另一条帖子的链接即可嵌入，并在能支撑观点的地方加入图片。如果编辑器提供替代文字，为了无障碍访问，值得添加。</p>
</section>

<section>
  <h2>编辑与删除</h2>
  <p>据 X 的帮助页面，要修改已上线的文章，请打开它，使用三点菜单并选择<em>编辑文章</em>。这会让文章下线，读者在你重新发布之前看不到它。所以请一次性完成修改，避免在流量高峰时改错别字。同一个菜单里也有删除选项。据我们所知，${WHEN}X 没有为文章提供内置的定时发布功能，所以你点击按钮时才会发布。</p>
</section>

<section>
  <h2>让文章更易读的小技巧</h2>
  <ul>
    <li><strong>开门见山。</strong>标题和前两段决定人们会不会读下去。</li>
    <li><strong>每个小标题只做一件事。</strong>读者会快速浏览，所以小标题本身就应该能讲清脉络。</li>
    <li><strong>段落要短</strong>，步骤或对比用列表。</li>
    <li><strong>图片要有目的</strong>，比如图表、截图或示例。</li>
    <li><strong>附上来源链接。</strong>这能建立信任，也方便读者核实。</li>
    <li><strong>想把推文串改成文章？</strong>请重写。推文串的悬念和编号放进单篇文档里读起来会很别扭。</li>
    <li><strong>用一条“钩子”帖子来分享</strong>，写明核心观点，而不只是标题。</li>
  </ul>
</section>

<section>
  <h2>发布之后：保存与分享</h2>
  <p>X 没有为文章提供导出按钮。把帖子链接（带 <code>/status/</code> 的那个）粘贴到 <a href="/zh/">Xtracticle</a>，即可得到用于分享的 PDF，或用于在别处复用文字的 Markdown 和 ZIP。读者也可以用 <a href="/zh/x-article-to-pdf">X 文章转 PDF</a> 做同样的事，即使没有账号，具体见<a href="/zh/guides/read-x-articles-without-account">不登录阅读 X 文章</a>。写作者应该保留自己的存档，因为帖子可能被删除，账号也可能被封禁。完整的日常流程请见<a href="/zh/guides/backup-x-articles">如何备份你的 X 文章</a>。</p>
  <p>如果你在权衡 X 与其他发布平台，<a href="/zh/guides/x-articles-vs-substack">X 文章、Substack 与 Medium 对比</a>做了比较。关于长度和媒体规则，请见 <a href="/zh/guides/x-articles-limits">X 文章限制</a>。</p>
</section>

${privacy('zh')}`,
  faq: [
    { q: '谁能在 X 上写文章？', a: '截至撰写时（2026 年 10 月），X 表示发布仅限 Premium、Premium+、Premium Business 和 Premium Organizations 账号。任何人都可以阅读文章。' },
    { q: '在哪里写 X 文章？', a: '在 x.com 上使用 X 导航中的“文章”选项，然后选择撰写新文章。名称和位置可能变化，各 App 中的可用情况也不一。' },
    { q: '发布后还能编辑 X 文章吗？', a: '可以。据 X 称，使用三点菜单并选择“编辑文章”。这会让它下线，直到你重新发布。' },
    { q: '可以定时发布 X 文章吗？', a: '我们没有发现文章的内置定时功能。一些第三方工具提供定时发布，使用前请先核实。' },
    { q: '如何保存我的 X 文章？', a: '把帖子链接粘贴到 Xtracticle，下载 Markdown、PDF 或带图片的 ZIP。' },
  ],
});

/* ─── 9. X Articles limits ─── */

const limits = guide({
  slug: 'x-articles-limits',
  title: 'X 文章限制：长度、媒体与发布资格 | Xtracticle',
  description: 'X 文章的长度限制、媒体，以及谁能发布或阅读。大致数字、编辑规则，以及与长帖子和推文串的对比。',
  h1: 'X 文章限制：长度、媒体与资格要求',
  sub: 'X 文章最长能有多长、里面可以放什么、谁能发布、谁能阅读，不确定的数字都做了标注。',
  primary: 'pdf',
  sections: `
${takeaways([
  '据我们所知，X 没有公布文章的确切长度数字。第三方来源给出的上限约为 100,000 字符，大约 15,000 个英文单词。',
  `发布需要付费订阅。${WHEN}，X 列出的是 Premium、Premium+、Premium Business 和 Premium Organizations。`,
  '按作者的设置，任何人都可以阅读公开的文章，无需订阅。',
  '文章可以包含图片、视频、GIF、链接和嵌入的帖子，并支持小标题和列表。',
  '编辑已发布的文章会使其下线，直到你重新发布。',
])}

<section>
  <h2>长度限制</h2>
  <p>X 的<a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">文章帮助页面</a>介绍了文章可以包含什么，但我们在那里没有找到具体的字符数。2024 年推出时的报道称，测试者碰到的上限略高于 100,000 字符，多家来源将其换算为约 15,000 个英文单词，2026 年更新的指南也仍在重复同一个数字。Social Media Today 在同样的字符数上估算出了更高的单词数，因为单词比人们想象的要短，所以单词数只是粗略的参考。</p>
  <p>请把 100,000 字符当作大致数字。实际上，很少有文章接近这个长度：它相当于一本书里较短的一章，或一篇非常长的长文。如果你要写这么长的内容，可供下载的文档对读者来说也许更合适。</p>
</section>

<section>
  <h2>媒体与排版</h2>
  <p>据 X 称，文章可以包含图片、视频、GIF、嵌入的帖子和链接。文字可使用标题、小标题、粗体、斜体、删除线、缩进，以及有序或无序列表。我们无法核实文章编辑器中图片或视频的文件大小限制，所以在发布大文件之前，请留意编辑器本身给出的任何错误提示。</p>
</section>

<section>
  <h2>谁能发布，谁能阅读</h2>
  <ul>
    <li><strong>发布：</strong>Premium 等级的账号。该功能 2024 年从 Premium+ 开始，X 当前的帮助页面列出了 Premium 和 Premium+ 订阅用户，以及 Premium Businesses 和 Premium Organizations。规则可能变化，请查看你的账号。</li>
    <li><strong>阅读：</strong>任何能看到这条帖子的人。公开文章无需付费即可打开。未登录的读者在 x.com 上可能遇到提示或受限的视图，详见<a href="/zh/guides/read-x-articles-without-account">不登录阅读 X</a>。</li>
    <li><strong>可见范围：</strong>文章发布在你的个人主页上，并通过一条帖子分享。受保护账号的内容仍仅限已获批准的关注者查看。</li>
  </ul>
  <p>背景知识请见<a href="/zh/guides/what-are-x-articles">什么是 X 文章？</a>以及分步指南<a href="/zh/guides/how-to-write-x-article">如何撰写 X 文章</a>。</p>
</section>

<section>
  <h2>发布后的编辑</h2>
  <p>据 X 的帮助页面，你可以通过三点菜单中的<em>编辑文章</em>来修改已发布的文章。这会让它下线，在你重新发布之前一直隐藏。删除功能也在同一个菜单里。因为被删除的文章对读者也同样消失了，如果你以后可能需要它，请先保存一份副本（见<a href="/zh/guides/backup-x-articles">备份指南</a>）。</p>
</section>

<section>
  <h2>文章、长帖子与推文串对比</h2>
  <p>下表中的数字是大致数字，依据${WHEN}的第三方报道。</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>普通帖子</th><th>长帖子</th><th>推文串</th><th>X 文章</th></tr></thead>
    <tbody>
      <tr><td>长度</td><td>多数账号为 280 字符</td><td>据报道付费订阅用户最多约 25,000 字符</td><td>多条帖子，每条各有限制</td><td>约 100,000 字符（大致）</td></tr>
      <tr><td>小标题和列表</td><td>没有</td><td>没有</td><td>没有</td><td>有</td></tr>
      <tr><td>标题和封面图</td><td>没有</td><td>没有</td><td>没有</td><td>有</td></tr>
      <tr><td>谁能创建</td><td>任何人</td><td>付费订阅用户</td><td>任何人</td><td>Premium 等级账号</td></tr>
      <tr><td>互动</td><td>一条帖子</td><td>一条帖子</td><td>每条帖子各自独立</td><td>一条指向文章的帖子</td></tr>
    </tbody>
  </table></div>
  <p>只有一个想法、不需要结构时，选长帖子；想让每一步都有回复交流时，选推文串；当内容需要小标题、图片和独立的阅读体验时，选文章。</p>
</section>

<section>
  <h2>保存你读到的内容</h2>
  <p>长度不影响保存：很长的文章会转换成多页文件。把链接粘贴到 <a href="/zh/">Xtracticle</a>，或使用 <a href="/zh/x-article-to-pdf">X 文章转 PDF</a>。推文串有 <a href="/zh/x-thread-to-pdf">X 推文串下载器</a>，单条帖子则用<a href="/zh/tweet-to-pdf">推文转 PDF</a>。</p>
</section>`,
  faq: [
    { q: 'X 文章的字符上限是多少？', a: '据我们所知，X 没有给出确切数字。第三方来源称约为 100,000 字符，大约 15,000 个英文单词。请当作大致数字。' },
    { q: '谁能发布 X 文章？', a: '截至撰写时（2026 年 10 月），X 列出的是 Premium、Premium+、Premium Business 和 Premium Organizations 账号。' },
    { q: '阅读 X 文章需要 Premium 吗？', a: '不需要。公开的文章无需订阅即可阅读。' },
    { q: '发布后还能编辑 X 文章吗？', a: '可以。据 X 的帮助页面，在三点菜单中选择“编辑文章”。文章会被下线，直到你重新发布。' },
    { q: '文章与长帖子有什么不同？', a: '长帖子仍然是没有标题和小标题的普通帖子。文章有标题、可选的封面图、小标题、列表和嵌入媒体，并允许更多文字。' },
  ],
});

/* ─── Hub ─── */

const GUIDES: { page: SitePage; blurb: string }[] = [
  { page: whatAre, blurb: 'X 文章是什么、谁能发布、与推文串有何不同，以及如何保存。' },
  { page: readWithout, blurb: '不登录阅读 X 文章、推文串和帖子，包括 x.com 换成 xtracticle.com 的技巧。' },
  { page: deleted, blurb: '帖子被删除后哪些能恢复、哪些不能，以及如何妥善保管重要内容。' },
  { page: versus, blurb: '从受众、收入、归属权、导出和 SEO 对比 X 文章、Substack 与 Medium。' },
  { page: backup, blurb: '把自己的 X 文章和推文串备份为 Markdown、ZIP 和 PDF 的实用方案。' },
  { page: seeDeleted, blurb: '别人已删除帖子的副本可能在哪里、哪些办法行不通，以及如何提前保存。' },
  { page: wayback, blurb: '分步讲解：网址形式、通配符搜索、日历、Save Page Now 与 archive.today 查找已存档推文。' },
  { page: writeArticle, blurb: '谁能发布 X 文章、编辑器在哪里、排版、编辑，以及如何备份。' },
  { page: limits, blurb: 'X 文章大致的长度限制、媒体、谁能发布或阅读，并与长帖子和推文串对比。' },
];

const hub: SitePage = {
  id: 'zh-guides',
  group: 'guides',
  path: HUB,
  file: 'zh/guides.html',
  lang: 'zh',
  title: '指南：保存、阅读和存档 X 内容 | Xtracticle',
  description: '关于 X（推特）文章的实用指南：它们是什么、不登录阅读、恢复已删除帖子、平台对比，以及备份你的作品。',
  h1: '指南：保存、阅读和存档 X 内容',
  sub: '关于 X 文章、推文串和帖子，以及如何留存副本的简短实用指南。',
  primary: 'pdf',
  nav: '指南',
  sections: `
<section>
  <h2>全部指南</h2>
  <ul>${GUIDES.map(g => `<li><a href="${g.page.path}"><strong>${g.page.h1}</strong></a>——${g.blurb}</li>`).join('')}</ul>
</section>

<section>
  <h2>准备好保存了吗？</h2>
  <p>把任意 X 链接粘贴到 <a href="/zh/">Xtracticle</a>，或直接前往 <a href="/zh/x-article-to-pdf">X 文章转 PDF</a>、<a href="/zh/x-article-to-markdown">Markdown</a>、<a href="/zh/x-article-to-epub">EPUB</a> 或<a href="/zh/x-thread-to-pdf">推文串转 PDF</a>。</p>
</section>`,
  faq: [],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Xtracticle 指南',
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

export const GUIDES_PAGES: SitePage[] = [hub, ...GUIDES.map(g => g.page)];
