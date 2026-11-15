import type { Lang } from './bridge';

/**
 * Copy for the browser extension's place on the home page, shared by the React hero line
 * (src/components/ExtCta.tsx `ExtHeroCta`) and the static home section (site/ext-home.ts).
 * Everything here renders only while `extAvailable()` (src/lib/ext.ts) is true.
 *
 * Facts only (docs/chrome-extension-plan.md): free; one-click Markdown/PDF/EPUB on X; bookmark export
 * (last 100 free, all with Pro); copies stay in this browser; X's "page doesn't exist" view offers the
 * saved copy. There is no automatic "deleted" alert, so none of this may promise one.
 */

export interface ExtHomeCopy {
  /** Hero pill under the link form. */
  heroInstall: string;
  /** Same, for Edge visitors (Edge Add-ons listing). */
  heroInstallEdge: string;
  /** Small label above the section heading. */
  label: string;
  h2: string;
  /** Three points: [bold lead, rest of the sentence]. */
  points: [string, string][];
  install: string;
  installEdge: string;
  /** Shown instead of the install button when the extension is already in this browser. */
  exportBookmarks: string;
  more: string;
  /** Browsers it installs in. */
  note: string;
  /** Same, while only the Edge Add-ons listing exists (no Chrome Web Store listing yet). */
  noteEdgeOnly: string;
  /** Accessible name of the looping video. */
  video: string;
  /** The loop's pause / play button. */
  pause: string;
  play: string;
}

export const EXT_HOME_COPY: Record<Lang, ExtHomeCopy> = {
  en: {
    heroInstall: 'Add to Chrome — free',
    heroInstallEdge: 'Add to Edge — free',
    label: 'Chrome extension · Free',
    h2: 'Save from X without leaving X',
    points: [
      ['One click on any post', 'a post, thread or Article as Markdown, PDF or EPUB.'],
      ['Export your bookmarks', 'the last 100 free, every one of them with Pro.'],
      ['Copies stay in your browser', 'if a saved post is deleted, X’s empty page offers your copy.'],
    ],
    install: 'Add to Chrome — free',
    installEdge: 'Add to Edge — free',
    exportBookmarks: 'Export bookmarks',
    more: 'How the extension works',
    note: 'For Chrome, Edge, Brave and Opera on a computer.',
    noteEdgeOnly: 'For Microsoft Edge on a computer.',
    video: 'The Xtracticle extension on X: a deleted post opens from the copy saved in the browser.',
    pause: 'Pause',
    play: 'Play',
  },
  tr: {
    heroInstall: 'Chrome’a ekle — ücretsiz',
    heroInstallEdge: 'Edge’e ekle — ücretsiz',
    label: 'Chrome eklentisi · Ücretsiz',
    h2: 'X’ten çıkmadan kaydedin',
    points: [
      ['Her gönderide tek tık', 'gönderi, flood veya makale Markdown, PDF ya da EPUB olarak iner.'],
      ['Yer imlerinizi dışa aktarın', 'son 100’ü ücretsiz, tamamı Pro ile.'],
      ['Kopyalar tarayıcınızda kalır', 'kaydettiğiniz gönderi silinirse X’in boş sayfası kopyanızı açar.'],
    ],
    install: 'Chrome’a ekle — ücretsiz',
    installEdge: 'Edge’e ekle — ücretsiz',
    exportBookmarks: 'Yer imlerini dışa aktar',
    more: 'Eklenti nasıl çalışır?',
    note: 'Bilgisayarda Chrome, Edge, Brave ve Opera için.',
    noteEdgeOnly: 'Bilgisayarda Microsoft Edge için.',
    video: 'X’te Xtracticle eklentisi: silinen bir gönderi tarayıcıda saklanan kopyadan açılıyor.',
    pause: 'Duraklat',
    play: 'Oynat',
  },
  es: {
    heroInstall: 'Añadir a Chrome: gratis',
    heroInstallEdge: 'Añadir a Edge: gratis',
    label: 'Extensión de Chrome · Gratis',
    h2: 'Guarda desde X sin salir de X',
    points: [
      ['Un clic en cualquier post', 'un post, un hilo o un artículo en Markdown, PDF o EPUB.'],
      ['Exporta tus marcadores', 'los últimos 100 gratis, todos con Pro.'],
      ['Las copias se quedan en tu navegador', 'si borran un post guardado, la página vacía de X te ofrece tu copia.'],
    ],
    install: 'Añadir a Chrome: gratis',
    installEdge: 'Añadir a Edge: gratis',
    exportBookmarks: 'Exportar marcadores',
    more: 'Cómo funciona la extensión',
    note: 'Para Chrome, Edge, Brave y Opera en el ordenador.',
    noteEdgeOnly: 'Para Microsoft Edge en el ordenador.',
    video: 'La extensión de Xtracticle en X: un post borrado se abre desde la copia guardada en el navegador.',
    pause: 'Pausar',
    play: 'Reproducir',
  },
  pt: {
    heroInstall: 'Adicionar ao Chrome — grátis',
    heroInstallEdge: 'Adicionar ao Edge — grátis',
    label: 'Extensão do Chrome · Grátis',
    h2: 'Salve direto do X, sem sair dele',
    points: [
      ['Um clique em qualquer post', 'um post, uma thread ou um artigo em Markdown, PDF ou EPUB.'],
      ['Exporte seus itens salvos', 'os últimos 100 grátis, todos com o Pro.'],
      ['As cópias ficam no seu navegador', 'se um post salvo for apagado, a página vazia do X oferece a sua cópia.'],
    ],
    install: 'Adicionar ao Chrome — grátis',
    installEdge: 'Adicionar ao Edge — grátis',
    exportBookmarks: 'Exportar itens salvos',
    more: 'Como a extensão funciona',
    note: 'Para Chrome, Edge, Brave e Opera no computador.',
    noteEdgeOnly: 'Para Microsoft Edge no computador.',
    video: 'A extensão do Xtracticle no X: um post apagado abre a partir da cópia guardada no navegador.',
    pause: 'Pausar',
    play: 'Reproduzir',
  },
  ja: {
    heroInstall: 'Chromeに追加（無料）',
    heroInstallEdge: 'Edgeに追加（無料）',
    label: 'Chrome拡張機能・無料',
    h2: 'Xを離れずに、その場で保存',
    points: [
      ['どのポストもワンクリック', 'ポスト・スレッド・記事をMarkdown、PDF、EPUBで保存。'],
      ['ブックマークをエクスポート', '直近100件は無料、Proならすべて。'],
      ['コピーはブラウザ内に保存', '保存したポストが削除されても、Xの空のページからコピーを開けます。'],
    ],
    install: 'Chromeに追加（無料）',
    installEdge: 'Edgeに追加（無料）',
    exportBookmarks: 'ブックマークをエクスポート',
    more: '拡張機能のしくみ',
    note: 'パソコンのChrome、Edge、Brave、Operaに対応。',
    noteEdgeOnly: 'パソコンのMicrosoft Edgeに対応。',
    video: 'X上のXtracticle拡張機能：削除されたポストを、ブラウザに保存したコピーから開く様子。',
    pause: '一時停止',
    play: '再生',
  },
  zh: {
    heroInstall: '添加到 Chrome（免费）',
    heroInstallEdge: '添加到 Edge（免费）',
    label: 'Chrome 扩展 · 免费',
    h2: '不离开 X，直接保存',
    points: [
      ['任意帖子一键保存', '帖子、推文串或文章，导出为 Markdown、PDF 或 EPUB。'],
      ['导出你的书签', '最近 100 条免费，Pro 可导出全部。'],
      ['副本保存在你的浏览器里', '已保存的帖子被删除后，X 的空白页面会提供你的副本。'],
    ],
    install: '添加到 Chrome（免费）',
    installEdge: '添加到 Edge（免费）',
    exportBookmarks: '导出书签',
    more: '了解扩展如何工作',
    note: '适用于电脑上的 Chrome、Edge、Brave 和 Opera。',
    noteEdgeOnly: '适用于电脑上的 Microsoft Edge。',
    video: 'X 上的 Xtracticle 扩展：已删除的帖子从浏览器中保存的副本打开。',
    pause: '暂停',
    play: '播放',
  },
  ar: {
    heroInstall: 'أضِفها إلى Chrome مجانًا',
    heroInstallEdge: 'أضِفها إلى Edge مجانًا',
    label: 'إضافة Chrome · مجانية',
    h2: 'احفظ من X دون أن تغادره',
    points: [
      ['نقرة واحدة على أي منشور', 'منشور أو ثريد أو مقالة بصيغة Markdown أو PDF أو EPUB.'],
      ['صدّر إشاراتك المرجعية', 'آخر 100 مجانًا، وكلها مع Pro.'],
      ['النسخ تبقى في متصفحك', 'إذا حُذف منشور محفوظ، تعرض لك صفحة X الفارغة نسختك.'],
    ],
    install: 'أضِفها إلى Chrome مجانًا',
    installEdge: 'أضِفها إلى Edge مجانًا',
    exportBookmarks: 'تصدير الإشارات المرجعية',
    more: 'كيف تعمل الإضافة',
    note: 'لمتصفحات Chrome وEdge وBrave وOpera على الكمبيوتر.',
    noteEdgeOnly: 'لمتصفح Microsoft Edge على الكمبيوتر.',
    video: 'إضافة Xtracticle على X: منشور محذوف يُفتح من النسخة المحفوظة في المتصفح.',
    pause: 'إيقاف مؤقت',
    play: 'تشغيل',
  },
};
