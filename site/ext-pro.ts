import type { Lang } from './blocks';
import { EXT_PAGE_PATHS, extAvailable } from '../src/lib/ext';

/**
 * What the Chrome extension adds to /pro: one feature line and one FAQ entry per language.
 * Only used while `extAvailable()` (a store URL is set); before that /pro stays exactly as it was.
 * Facts (src/lib/saved.ts): bookmark export is the latest 100 free / all with Pro; saved copies of
 * unreachable bookmarks are the newest 3 free / all with Pro (and exportable); one Pro, shared by
 * the site and the extension in the same browser. No automatic "deleted" notification.
 */
interface ExtProCopy {
  /** HTML; `{link}` is replaced by the anchor to this language's /chrome-extension page. */
  feature: string;
  linkText: string;
  q: string;
  a: string;
}

const COPY: Record<Lang, ExtProCopy> = {
  en: {
    linkText: 'Chrome extension',
    feature:
      '<strong>{link}: your whole bookmark archive.</strong> Export all your X bookmarks (free: the latest 100) and keep the saved copies of every bookmark that is no longer reachable, deleted or hidden (free: the newest 3). Pro works on the site and in the extension together.',
    q: 'Does Pro also work in the Chrome extension?',
    a: 'Yes. Activate Pro on this site in the same browser and the extension picks it up; you can also enter the license key from the extension’s popup. No second key is needed.',
  },
  tr: {
    linkText: 'Chrome eklentisi',
    feature:
      '<strong>{link}: yer imi arşivinizin tamamı.</strong> Tüm X yer imlerinizi dışa aktarın (ücretsizde son 100) ve erişilemeyen, yani silinmiş ya da gizlenmiş her yer iminin kayıtlı kopyasını saklayın (ücretsizde en yeni 3). Pro, site ve eklentide birlikte çalışır.',
    q: 'Pro, Chrome eklentisinde de geçerli mi?',
    a: 'Evet. Aynı tarayıcıda bu sitede Pro’yu etkinleştirmeniz yeterli, eklenti bunu görür; lisans anahtarını eklentinin açılır penceresinden de girebilirsiniz. İkinci bir anahtar gerekmez.',
  },
  es: {
    linkText: 'Extensión de Chrome',
    feature:
      '<strong>{link}: todo tu archivo de marcadores.</strong> Exporta todos tus marcadores de X (gratis: los últimos 100) y conserva las copias guardadas de cada marcador que ya no se puede abrir, borrado u oculto (gratis: las 3 más recientes). Pro funciona a la vez en el sitio y en la extensión.',
    q: '¿Pro también vale en la extensión de Chrome?',
    a: 'Sí. Activa Pro en este sitio en el mismo navegador y la extensión lo reconoce; también puedes introducir la clave de licencia desde el popup de la extensión. No hace falta una segunda clave.',
  },
  pt: {
    linkText: 'Extensão do Chrome',
    feature:
      '<strong>{link}: todo o seu arquivo de itens salvos.</strong> Exporte todos os seus itens salvos do X (grátis: os últimos 100) e guarde as cópias de cada item salvo que não está mais acessível, apagado ou oculto (grátis: as 3 mais recentes). O Pro funciona no site e na extensão ao mesmo tempo.',
    q: 'O Pro também vale na extensão do Chrome?',
    a: 'Sim. Ative o Pro neste site no mesmo navegador e a extensão o reconhece; você também pode digitar a chave de licença no popup da extensão. Não é preciso uma segunda chave.',
  },
  ja: {
    linkText: 'Chrome拡張機能',
    feature:
      '<strong>{link}：ブックマークのアーカイブ全体。</strong>Xのブックマークをすべてエクスポートでき（無料は直近100件）、削除や非表示で開けなくなったブックマークの保存コピーもすべて残せます（無料は新しい3件）。Proはサイトと拡張機能の両方で使えます。',
    q: 'ProはChrome拡張機能でも使えますか？',
    a: 'はい。同じブラウザでこのサイトでProを有効にすれば、拡張機能にも反映されます。拡張機能のポップアップからライセンスキーを入力することもできます。2つ目のキーは不要です。',
  },
  zh: {
    linkText: 'Chrome 扩展',
    feature:
      '<strong>{link}：完整的书签存档。</strong>可导出全部 X 书签（免费版为最近 100 条），并保留所有已无法访问（被删除或被隐藏）的书签的存档副本（免费版为最新 3 条）。Pro 在网站和扩展中通用。',
    q: 'Pro 在 Chrome 扩展中也有效吗？',
    a: '有效。在同一浏览器中于本站激活 Pro，扩展会自动识别；也可以在扩展的弹出窗口里输入许可证密钥。无需第二个密钥。',
  },
  ar: {
    linkText: 'إضافة Chrome',
    feature:
      '<strong>{link}: أرشيف إشاراتك المرجعية كاملاً.</strong> صدّر كل إشاراتك المرجعية على X (في النسخة المجانية آخر 100) واحتفظ بالنسخ المحفوظة لكل إشارة مرجعية لم يعد الوصول إليها ممكنًا، محذوفة أو مخفية (في المجانية أحدث 3). يعمل Pro في الموقع والإضافة معًا.',
    q: 'هل يعمل Pro في إضافة Chrome أيضًا؟',
    a: 'نعم. فعّل Pro على هذا الموقع في المتصفح نفسه فتتعرف عليه الإضافة، ويمكنك أيضًا إدخال مفتاح الترخيص من نافذة الإضافة المنبثقة. لا حاجة إلى مفتاح ثانٍ.',
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The feature `<li>` HTML for /pro in a language; '' while the extension is not in the store. */
export function extProFeature(lang: Lang): string {
  if (!extAvailable()) return '';
  const c = COPY[lang];
  return c.feature.replace('{link}', `<a href="${EXT_PAGE_PATHS[lang]}">${esc(c.linkText)}</a>`);
}

/** The FAQ entry for /pro in a language; null while the extension is not in the store. */
export function extProFaq(lang: Lang): { q: string; a: string } | null {
  if (!extAvailable()) return null;
  const c = COPY[lang];
  return { q: c.q, a: c.a };
}
