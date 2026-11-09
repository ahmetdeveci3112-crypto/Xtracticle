import type { Lang } from './blocks';
import { proPath } from './pro-page';

/**
 * Quiet Xtracticle Pro block on the seven home pages, placed by site/render.ts right after the
 * "How to download" steps. No pop-up, no banner: one bordered card, three facts, the price, one link.
 * Hidden for visitors who already have Pro (`html.xt-has-pro`, set by the inline config script).
 * Clicks are counted through `data-track` (delegated listener in render.ts → GA event `home_pro_click`).
 */

interface HomeProCopy {
  h2: string;
  lead: string;
  /** Each item: [bold label, rest of the sentence]. */
  items: [string, string][];
  price: string;
  cta: string;
}

const COPY: Record<Lang, HomeProCopy> = {
  en: {
    h2: 'Need more? Xtracticle Pro',
    lead: 'Saving articles stays free. Pro adds three things:',
    items: [
      ['Watch accounts', 'get told when an account deletes a post, with the post’s text kept for you.'],
      ['Full archive + CSV', 'every archived post of an account in the deleted tweet finder, not just the first 50.'],
      ['Batch 200 + API key', 'up to 200 links in one go, and a key for the MCP server and API.'],
    ],
    price: 'From $3/month billed yearly · or $59 once',
    cta: 'See what Pro includes',
  },
  tr: {
    h2: 'Daha fazlası mı lazım? Xtracticle Pro',
    lead: 'Makale kaydetmek ücretsiz kalıyor. Pro üç şey ekler:',
    items: [
      ['Hesap izleme', 'izlediğiniz hesap bir gönderiyi sildiğinde haber alırsınız; gönderinin metni sizde kalır.'],
      ['Tam arşiv ve CSV', 'silinen tweet bulucuda bir hesabın arşivlenmiş tüm gönderileri, yalnızca ilk 50’si değil.'],
      ['200 linklik toplu indirme ve API anahtarı', 'tek seferde 200 link; MCP sunucusu ve API için kendi anahtarınız.'],
    ],
    price: 'Yıllık ödemede ayda 3 $’dan başlar · ya da tek seferlik 59 $',
    cta: 'Pro’da neler var?',
  },
  es: {
    h2: '¿Necesitas más? Xtracticle Pro',
    lead: 'Guardar artículos sigue siendo gratis. Pro añade tres cosas:',
    items: [
      ['Vigilar cuentas', 'te avisamos cuando una cuenta borra un post y conservas su texto.'],
      ['Archivo completo y CSV', 'todos los posts archivados de una cuenta en el buscador de tweets borrados, no solo los primeros 50.'],
      ['Lotes de 200 y clave de API', 'hasta 200 enlaces de una vez y una clave para el servidor MCP y la API.'],
    ],
    price: 'Desde 3 $/mes con pago anual · o 59 $ en un solo pago',
    cta: 'Ver qué incluye Pro',
  },
  pt: {
    h2: 'Precisa de mais? Xtracticle Pro',
    lead: 'Salvar artigos continua grátis. O Pro acrescenta três coisas:',
    items: [
      ['Acompanhar contas', 'você é avisado quando uma conta apaga um post, e o texto fica guardado.'],
      ['Arquivo completo e CSV', 'todos os posts arquivados de uma conta no localizador de tweets apagados, não só os primeiros 50.'],
      ['Lotes de 200 e chave de API', 'até 200 links de uma vez e uma chave para o servidor MCP e a API.'],
    ],
    price: 'A partir de US$ 3/mês no plano anual · ou US$ 59 uma única vez',
    cta: 'Ver o que o Pro inclui',
  },
  ja: {
    h2: 'もっと使いたい方へ：Xtracticle Pro',
    lead: '記事の保存はこれからも無料です。Pro では次の3つが加わります。',
    items: [
      ['アカウントのウォッチ', 'ポストが削除されるとお知らせし、その本文を手元に残します。'],
      ['アーカイブ全件と CSV', '削除ツイート検索で、最初の50件だけでなくアーカイブされた全ポストを表示します。'],
      ['200件の一括処理と API キー', '一度に最大200リンク。MCP サーバーと API 用のキーも使えます。'],
    ],
    price: '年払いなら月3ドルから・買い切りは59ドル',
    cta: 'Pro の内容を見る',
  },
  zh: {
    h2: '需要更多功能？Xtracticle Pro',
    lead: '保存文章依旧免费。Pro 额外提供三项功能：',
    items: [
      ['账号监控', '账号删除帖子时通知你，并为你保留帖子的文字。'],
      ['完整存档与 CSV', '在已删除推文查找器中查看账号的全部存档帖子，而不只是前 50 条。'],
      ['批量 200 条与 API 密钥', '一次最多处理 200 个链接，并获得用于 MCP 服务器和 API 的密钥。'],
    ],
    price: '按年付费每月 3 美元起 · 或一次性 59 美元',
    cta: '看看 Pro 包含什么',
  },
  ar: {
    h2: 'تحتاج إلى المزيد؟ Xtracticle Pro',
    lead: 'حفظ المقالات يبقى مجانيًا. ويضيف Pro ثلاثة أشياء:',
    items: [
      ['مراقبة الحسابات', 'نُعلمك عندما يحذف حساب منشورًا، ويبقى نصّه محفوظًا لديك.'],
      ['الأرشيف الكامل وملف CSV', 'كل المنشورات المؤرشفة لحساب ما في أداة البحث عن التغريدات المحذوفة، لا أول 50 منشورًا فقط.'],
      ['دفعات حتى 200 رابط ومفتاح API', 'حتى 200 رابط دفعة واحدة، ومفتاح لخادم MCP والواجهة البرمجية.'],
    ],
    price: 'من 3 دولارات شهريًا بالدفع السنوي · أو 59 دولارًا مرة واحدة',
    cta: 'اطّلع على ما يتضمنه Pro',
  },
};

/** The `<section>` for one language's home page (copy above is trusted, so no escaping). */
export function homeProBlock(lang: Lang): string {
  const c = COPY[lang];
  return `
<section class="xt-home-pro" aria-labelledby="xt-home-pro-h">
  <h2 id="xt-home-pro-h">${c.h2}</h2>
  <p>${c.lead}</p>
  <ul>${c.items.map(([b, rest]) => `<li><strong>${b}</strong>${lang === 'ja' || lang === 'zh' ? '：' : ': '}${rest}</li>`).join('')}</ul>
  <div class="xt-home-pro-foot">
    <p class="xt-home-pro-price">${c.price}</p>
    <a class="xt-btn" href="${proPath(lang)}" data-track="home_pro_click">${c.cta}</a>
  </div>
</section>`;
}
