import { GITHUB } from '../../blocks';
import type { ProCopy } from '../../pro-page';

/** Simplified Chinese copy of the /pro page. */
export const PRO_ZH: ProCopy = {
  title: 'Xtracticle Pro — 完整存档、CSV 导出、200 条批量、API 密钥 | Xtracticle',
  description:
    'Xtracticle Pro：账号的全部已存档帖子并可导出 CSV，一次批量处理 200 条链接，配额更高的个人 MCP/API 密钥，以及不带署名行的 PDF。每月 5 美元、每年 36 美元，或一次性 59 美元。',
  h1: 'Xtracticle Pro',
  sub: '基础功能全部保持免费。Pro 增加重负载功能并分担服务器费用——无需账号，只需一个许可密钥。',
  nav: 'Pro',
  pitch:
    'Xtracticle 免费、无广告、无需登录，这一点不会改变。Pro 面向少数运行成本高的任务：' +
    '完整存档、大批量处理，以及整天读取 X 的 AI 助手。购买 Pro，就是在让免费工具继续免费。',
  featuresH2: 'Pro 增加了什么',
  features: [
    '<strong>已存档帖子的完整列表</strong>：在<a href="/zh/deleted-tweet-finder">已删除推文查找</a>中查看 Wayback Machine 为该账号保存的全部帖子（最多 1500 条），而不只是最新 50 条，并可<strong>导出 CSV</strong>。',
    '<strong>批量模式一次最多 200 条链接</strong>，打包成一个 ZIP（免费版为 20 条）。',
    '<strong>个人 MCP / API 密钥</strong>：把许可密钥作为 <code>Authorization: Bearer</code> 发送给<a href="/zh/mcp-server">MCP 服务器</a>和 Markdown API，免费层的请求限制对你不再适用。',
    '<strong>导出的 PDF 和 EPUB 中不再带有“保存工具：Xtracticle”一行。</strong>',
    '<strong>优先体验新功能</strong>：Pro 用户最先用到新功能，他们的需求决定路线图。',
  ],
  pricingH2: '价格',
  monthly: '月付',
  yearly: '年付',
  lifetime: '终身',
  perMonth: '/ 月',
  perYear: '/ 年',
  once: '一次性',
  monthlyNote: '随时可以取消。',
  yearlyNote: '折合每月 3 美元，省 40%。',
  lifetimeNote: '前 100 位购买者的首发价。付一次，永久使用。',
  buy: '开通 Pro',
  soon: 'Pro 即将上线，几天内开放购买。在此之前，本页所有功能仍然免费。',
  checkoutHint:
    '付款由 <a href="https://polar.sh" rel="noopener">Polar</a> 处理（银行卡、Apple Pay、Google Pay）。付款后一分钟内，许可密钥会发送到你的邮箱；Xtracticle 不会创建任何账号。',
  keyH2: '已有密钥？在这里输入',
  keyIntro: '粘贴 Polar 邮件中的许可密钥。Pro 会在当前浏览器中启用；在你使用的每台设备上重复此操作。',
  keyLabel: '许可密钥',
  activate: '启用',
  msgWorking: '正在验证密钥…',
  msgOk: 'Pro 已在此浏览器中启用。祝使用愉快！',
  msgAlready: 'Pro 已在此浏览器中启用。',
  msgInvalid: '无法识别此密钥。请检查是否有输入错误（密钥以 XTPRO 开头），或订阅是否已结束。',
  msgLimit: '此密钥已在 3 台设备上启用。请在 Polar 客户门户（收据邮件中的链接）移除一台设备后重试。',
  msgUpstream: '许可服务器没有响应。请一分钟后重试。',
  msgUnavailable: 'Pro 尚未开放。请几天后再来看看。',
  msgRate: '尝试次数过多。请等待几秒后重试。',
  msgNetwork: '网络错误——请检查连接后重试。',
  success: '已收到付款，谢谢！你的许可密钥在 Polar 发来的邮件中。把它粘贴到下方即可开启 Pro。',
  faq: [
    { q: '如何获得许可密钥？', a: '付款完成后，Polar 会立即把许可密钥发到你的邮箱（确认页面和 Polar 客户门户中也能看到）。把密钥粘贴到本页的表单中，Pro 就会在该浏览器中启用。' },
    { q: '需要账号吗？', a: '不需要。Xtracticle 没有账号系统。我们只验证密钥；它会以加密形式存放在你设备的 Cookie 中，每次有效 30 天，只要套餐有效就会自动续期。' },
    { q: '一个密钥可以在几台设备上使用？', a: '最多同时 3 台。在你使用的每个浏览器中输入同一个密钥。可以在 Polar 客户门户中移除设备。' },
    { q: '可以取消吗？', a: '可以，随时都行：通过收据邮件中的客户门户链接取消。Pro 会保持有效到已付费周期结束。终身套餐是一次性付款，没有需要取消的内容。' },
    { q: '有退款吗？', a: '有：14 天内无条件退款。在 GitHub 上提交 issue 或在 X 上私信 @DvciAhmet，我们就会退款。' },
    { q: 'Pro 会改变免费用户能用的功能吗？', a: '不会。单条帖子、长推、文章、所有导出格式、前 50 条已存档帖子以及 20 条的批量处理都保持免费，没有广告，无需登录。' },
    { q: '有问题去哪里问？', a: `在 GitHub 上提交 issue（${GITHUB.replace('https://', '')}），或在 X 上给 @DvciAhmet 发消息。` },
  ],
};
