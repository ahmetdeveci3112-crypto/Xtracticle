/**
 * "From the maker of Xtracticle": a few of the owner's own Gumroad products, shown in quiet,
 * clearly labelled spots. Never to Pro users, never as a pop-up or banner.
 *
 *   site/promo-block.ts         strip of 3 cards above the FAQ on home, tool, guide and deleted-tweet pages
 *   src/components/PromoCard.tsx one card after a download, only when the tip row is not showing
 *
 * Set PROMO_ENABLED to false to remove every spot at the next build.
 */

export const PROMO_ENABLED = true;

export type PromoLang = 'en' | 'tr' | 'es' | 'pt' | 'ja' | 'zh' | 'ar';
/** home = home pages, deleted = deleted-tweet pages, tool = tool and guide pages, app = after a download. */
export type PromoContext = 'home' | 'deleted' | 'tool' | 'app';

export interface PromoProduct {
  id: string;
  /** Gumroad permalink slug: https://ahmetdeveci.gumroad.com/l/{slug} */
  slug: string;
  /** Short product name (kept in English: the products are in English). */
  name: string;
  /** Price in USD; 0 = free (pay what you want). */
  price: number;
  /** Higher = picked more often. */
  weight: number;
  where: PromoContext[];
  pitch: Record<PromoLang, string>;
}

const STORE = 'https://ahmetdeveci.gumroad.com/l/';

export const PRODUCTS: PromoProduct[] = [
  {
    id: 'prompts30',
    slug: 'ai-prompt-library-free-30',
    name: '30 AI Work Prompts',
    price: 0,
    weight: 3,
    where: ['home', 'deleted', 'app'],
    pitch: {
      en: 'Copy-paste prompts for ChatGPT, Claude and Gemini: emails, research, summaries and more.',
      tr: 'ChatGPT, Claude ve Gemini için kopyala-yapıştır komutlar: e-posta, araştırma, özet ve dahası.',
      es: 'Prompts listos para copiar en ChatGPT, Claude y Gemini: correos, investigación, resúmenes y más.',
      pt: 'Prompts prontos para colar no ChatGPT, Claude e Gemini: e-mails, pesquisa, resumos e mais.',
      ja: 'ChatGPT・Claude・Gemini にそのまま使える仕事用プロンプト。メール、調査、要約など。',
      zh: '可直接复制到 ChatGPT、Claude 和 Gemini 的工作提示词：邮件、调研、总结等。',
      ar: 'أوامر جاهزة للنسخ في ChatGPT وClaude وGemini: رسائل بريد، بحث، تلخيص والمزيد.',
    },
  },
  {
    id: 'instructions',
    slug: 'ChatGpt-Custom-instructions-Questions-Answers',
    name: 'AI Custom Instructions Kit',
    price: 0,
    weight: 3,
    where: ['home', 'deleted', 'app'],
    pitch: {
      en: '15 ready-to-paste profiles so ChatGPT, Claude and Gemini answer the way you want.',
      tr: 'ChatGPT, Claude ve Gemini istediğiniz gibi yanıt versin diye yapıştırmaya hazır 15 profil.',
      es: '15 perfiles listos para pegar y que ChatGPT, Claude y Gemini respondan como quieres.',
      pt: '15 perfis prontos para colar e fazer o ChatGPT, Claude e Gemini responderem do seu jeito.',
      ja: 'ChatGPT・Claude・Gemini を好みの答え方にする、貼り付けるだけの15プロフィール。',
      zh: '15 套即贴即用的设定，让 ChatGPT、Claude 和 Gemini 按你想要的方式回答。',
      ar: '15 ملفًا جاهزًا للصق لتجعل ChatGPT وClaude وGemini يجيبون بالطريقة التي تريدها.',
    },
  },
  {
    id: 'tools',
    slug: 'AI-Tools-Archive',
    name: 'AI Tools Archive 2026',
    price: 0,
    weight: 2,
    where: ['home', 'deleted', 'app'],
    pitch: {
      en: '1,200+ link-checked AI tools in one Notion database. The 300-tool starter is free.',
      tr: 'Bağlantıları kontrol edilmiş 1.200+ yapay zekâ aracı tek bir Notion veritabanında. 300 araçlık başlangıç sürümü ücretsiz.',
      es: 'Más de 1.200 herramientas de IA con enlaces revisados en una base de Notion. El inicio de 300 es gratis.',
      pt: 'Mais de 1.200 ferramentas de IA com links verificados num banco do Notion. O inicial com 300 é grátis.',
      ja: 'リンク確認済みの AI ツール1,200件以上を1つの Notion データベースに。300件のスターター版は無料。',
      zh: '1,200+ 个链接已核验的 AI 工具，汇总在一个 Notion 数据库里。300 个工具的入门版免费。',
      ar: 'أكثر من 1200 أداة ذكاء اصطناعي بروابط مُتحقَّق منها في قاعدة Notion واحدة. نسخة البداية (300 أداة) مجانية.',
    },
  },
  {
    id: 'claudecode',
    slug: 'claude-code-starter',
    name: 'Claude Code Starter Kit',
    price: 0,
    weight: 3,
    where: ['home'],
    pitch: {
      en: 'A CLAUDE.md template and 3 essential subagents to start Claude Code projects on the right foot.',
      tr: 'Claude Code projelerine doğru başlamak için bir CLAUDE.md şablonu ve 3 temel alt ajan.',
      es: 'Una plantilla de CLAUDE.md y 3 subagentes esenciales para empezar bien con Claude Code.',
      pt: 'Um modelo de CLAUDE.md e 3 subagentes essenciais para começar bem no Claude Code.',
      ja: 'Claude Code を正しく始めるための CLAUDE.md テンプレートと基本のサブエージェント3つ。',
      zh: '一份 CLAUDE.md 模板和 3 个核心子代理，帮你把 Claude Code 项目开个好头。',
      ar: 'قالب CLAUDE.md و3 وكلاء فرعيين أساسيين لتبدأ مشاريع Claude Code بشكل صحيح.',
    },
  },
  {
    id: 'rules',
    slug: 'ai-coding-rules-lite',
    name: 'AI Coding Rules Lite',
    price: 0,
    weight: 2,
    where: ['home'],
    pitch: {
      en: 'Cursor rules, CLAUDE.md and AGENTS.md for Next.js + Supabase, ready to drop into a repo.',
      tr: 'Next.js + Supabase için Cursor kuralları, CLAUDE.md ve AGENTS.md; doğrudan projeye eklenir.',
      es: 'Reglas de Cursor, CLAUDE.md y AGENTS.md para Next.js + Supabase, listos para tu repositorio.',
      pt: 'Regras do Cursor, CLAUDE.md e AGENTS.md para Next.js + Supabase, prontos para o seu repositório.',
      ja: 'Next.js + Supabase 向けの Cursor ルール、CLAUDE.md、AGENTS.md。リポジトリに置くだけ。',
      zh: '适用于 Next.js + Supabase 的 Cursor 规则、CLAUDE.md 和 AGENTS.md，放进仓库即可使用。',
      ar: 'قواعد Cursor وملفا CLAUDE.md وAGENTS.md لمشاريع Next.js + Supabase، جاهزة للإضافة إلى مستودعك.',
    },
  },
  {
    id: 'planner',
    slug: 'content-planner-notion',
    name: 'Content Planner for Notion',
    price: 14,
    weight: 2,
    where: ['home', 'app'],
    pitch: {
      en: 'Plan a month of X, LinkedIn, Instagram and TikTok posts, with 30 days of AI batch prompts.',
      tr: 'X, LinkedIn, Instagram ve TikTok gönderilerinizi bir ay önceden planlayın; 30 günlük toplu yapay zekâ komutlarıyla.',
      es: 'Planifica un mes de posts para X, LinkedIn, Instagram y TikTok, con 30 días de prompts de IA por lotes.',
      pt: 'Planeje um mês de posts para X, LinkedIn, Instagram e TikTok, com 30 dias de prompts de IA em lote.',
      ja: 'X・LinkedIn・Instagram・TikTok の投稿を1か月分計画。30日分の AI 一括プロンプト付き。',
      zh: '提前规划一个月的 X、LinkedIn、Instagram 和 TikTok 帖子，附 30 天 AI 批量提示词。',
      ar: 'خطّط لشهر من منشورات X وLinkedIn وInstagram وTikTok، مع أوامر ذكاء اصطناعي جماعية لثلاثين يومًا.',
    },
  },
  {
    id: 'devbundle',
    slug: 'ai-developer-bundle',
    name: 'AI Developer Bundle',
    price: 35,
    weight: 1,
    where: ['home'],
    pitch: {
      en: 'Agent Team Kit, AI Coding Rules for 10 stacks and a Claude Projects pack in one bundle.',
      tr: 'Agent Team Kit, 10 teknoloji için AI Coding Rules ve Claude Projects paketi tek pakette.',
      es: 'Agent Team Kit, AI Coding Rules para 10 stacks y un pack de Claude Projects en un solo paquete.',
      pt: 'Agent Team Kit, AI Coding Rules para 10 stacks e um pacote de Claude Projects num só bundle.',
      ja: 'Agent Team Kit、10スタック分の AI Coding Rules、Claude Projects パックをまとめたセット。',
      zh: 'Agent Team Kit、10 种技术栈的 AI Coding Rules 和 Claude Projects 套装，一次打包。',
      ar: 'Agent Team Kit وقواعد AI Coding Rules لعشر تقنيات وحزمة Claude Projects في حزمة واحدة.',
    },
  },
];

export interface PromoCopy {
  /** Small label above every spot. */
  label: string;
  h2: string;
  lead: string;
  free: string;
  /** Link text for a free / paid product. */
  getFree: string;
  view: string;
  notNow: string;
}

export const PROMO_COPY: Record<PromoLang, PromoCopy> = {
  en: {
    label: 'From the maker of Xtracticle',
    h2: 'A little more from us',
    lead: 'We want Xtracticle to be useful beyond saving posts, so we also make small kits for working with AI. Most of them are free.',
    free: 'Free',
    getFree: 'Get it free',
    view: 'Take a look',
    notNow: 'Not now',
  },
  tr: {
    label: 'Xtracticle’ın geliştiricisinden',
    h2: 'Bizden birkaç şey daha',
    lead: 'Xtracticle’ın gönderi kaydetmenin ötesinde de işinize yaramasını istiyoruz. Bu yüzden yapay zekâyla çalışmak için küçük kitler de hazırlıyoruz; çoğu ücretsiz.',
    free: 'Ücretsiz',
    getFree: 'Ücretsiz al',
    view: 'Göz at',
    notNow: 'Şimdi değil',
  },
  es: {
    label: 'Del creador de Xtracticle',
    h2: 'Un poco más de nuestra parte',
    lead: 'Queremos que Xtracticle te sirva más allá de guardar posts, así que también hacemos pequeños kits para trabajar con IA. La mayoría son gratis.',
    free: 'Gratis',
    getFree: 'Consíguelo gratis',
    view: 'Échale un vistazo',
    notNow: 'Ahora no',
  },
  pt: {
    label: 'Do criador do Xtracticle',
    h2: 'Um pouco mais da nossa parte',
    lead: 'Queremos que o Xtracticle seja útil além de salvar posts, então também fazemos pequenos kits para trabalhar com IA. A maioria é grátis.',
    free: 'Grátis',
    getFree: 'Pegue grátis',
    view: 'Dar uma olhada',
    notNow: 'Agora não',
  },
  ja: {
    label: 'Xtracticle の開発者より',
    h2: 'こちらもどうぞ',
    lead: 'ポストの保存以外でもお役に立てるよう、AI を使った作業のための小さなキットも作っています。ほとんどは無料です。',
    free: '無料',
    getFree: '無料で入手',
    view: '詳しく見る',
    notNow: '今はいい',
  },
  zh: {
    label: '来自 Xtracticle 的开发者',
    h2: '我们还做了这些',
    lead: '我们希望 Xtracticle 不只帮你保存帖子，所以也做了一些用 AI 工作的小工具包，大部分免费。',
    free: '免费',
    getFree: '免费获取',
    view: '看一看',
    notNow: '以后再说',
  },
  ar: {
    label: 'من مطوّر Xtracticle',
    h2: 'المزيد منّا',
    lead: 'نريد أن يفيدك Xtracticle بما يتجاوز حفظ المنشورات، لذلك نصنع أيضًا حِزمًا صغيرة للعمل مع الذكاء الاصطناعي، ومعظمها مجاني.',
    free: 'مجاني',
    getFree: 'احصل عليه مجانًا',
    view: 'ألقِ نظرة',
    notNow: 'ليس الآن',
  },
};

export const promoLang = (lang: string): PromoLang => (lang in PROMO_COPY ? (lang as PromoLang) : 'en');

/** Gumroad link with campaign tags; `spot` says where it was clicked (home, deleted, tool, app). */
export const promoUrl = (p: PromoProduct, spot: PromoContext) =>
  `${STORE}${p.slug}?utm_source=xtracticle&utm_medium=${spot}&utm_campaign=maker`;

export const promoImage = (p: PromoProduct) => `/promo/${p.id}.svg`;

export const promoPrice = (p: PromoProduct, lang: PromoLang) => (p.price ? `$${p.price}` : PROMO_COPY[lang].free);

export const promoCta = (p: PromoProduct, lang: PromoLang) => (p.price ? PROMO_COPY[lang].view : PROMO_COPY[lang].getFree);

/** Tool and guide pages show the home pool (their visitors are the same people); only the utm tag differs. */
export const productsFor = (where: PromoContext) => {
  const pool: PromoContext = where === 'tool' ? 'home' : where;
  return PRODUCTS.filter(p => p.where.includes(pool));
};

/** The whole Gumroad store, for the footer link. */
export const storeUrl = (spot: string) => `https://ahmetdeveci.gumroad.com/?utm_source=xtracticle&utm_medium=${spot}&utm_campaign=maker`;

/** Footer link to the store. */
export const STORE_LABEL: Record<PromoLang, string> = {
  en: 'Free AI kits',
  tr: 'Ücretsiz yapay zekâ kitleri',
  es: 'Kits de IA gratis',
  pt: 'Kits de IA grátis',
  ja: '無料の AI キット',
  zh: '免费 AI 工具包',
  ar: 'حِزم ذكاء اصطناعي مجانية',
};

/** Weighted random order (each product drawn once). */
export function weightedShuffle<T extends { weight: number }>(items: T[], rnd: () => number = Math.random): T[] {
  const pool = items.slice();
  const out: T[] = [];
  while (pool.length) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let r = rnd() * total;
    let i = 0;
    while (i < pool.length - 1 && (r -= pool[i].weight) >= 0) i++;
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
