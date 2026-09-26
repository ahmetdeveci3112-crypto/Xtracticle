/** Types and reusable, localized HTML blocks for the static landing pages. */

export type Lang = 'en' | 'tr' | 'es' | 'pt' | 'ja';
export type ExportKey = 'md' | 'pdf' | 'epub' | 'zip' | 'txt' | 'obsidian';

export interface FAQ {
  q: string;
  a: string;
}

export interface SitePage {
  id: string;
  /** Translation group: pages with the same group are language versions of each other. */
  group: string;
  path: string;
  file: string;
  lang: Lang;
  title: string;
  description: string;
  h1: string;
  sub: string;
  primary: ExportKey;
  nav: string;
  sections: string;
  faq: FAQ[];
  noindex?: boolean;
  isHome?: boolean;
}

export const SITE = 'https://xtracticle.com';
export const GITHUB = 'https://github.com/ahmetdeveci3112-crypto/Xtracticle';
export const EXAMPLE = '/Write/status/1765884209527394325';

const BOOKMARKLET =
  "javascript:(function(){location.href='https://xtracticle.com/?url='+encodeURIComponent(location.href)})()";

export const steps = (items: string[]) => `<ol class="xt-steps">${items.map(i => `<li>${i}</li>`).join('')}</ol>`;

const bookmarkletLink = (dragHint: string) =>
  `<a class="xt-bookmarklet" href="${BOOKMARKLET}" onclick="event.preventDefault();alert('${dragHint}')">⬇ Xtracticle</a>`;

const SHORTCUTS: Record<Lang, { h2: string; swapH: string; swap: string; bmH: string; bm: string; drag: string; android: string }> = {
  en: {
    h2: 'Two shortcuts that save time',
    swapH: '1. Swap the domain',
    swap: 'On any post, change <code>x.com</code> to <code>xtracticle.com</code> in the address bar and press Enter: <code>x.com/user/status/123</code> → <code>xtracticle.com/user/status/123</code>. The post opens here, ready to download.',
    bmH: '2. One-click bookmarklet',
    bm: 'Drag this button to your bookmarks bar, then click it while reading any X post:',
    drag: 'Drag this button to your bookmarks bar.',
    android: 'On Android you can also install Xtracticle (Add to Home screen) and share posts to it straight from the X app.',
  },
  tr: {
    h2: 'Zaman kazandıran iki kısayol',
    swapH: '1. Alan adını değiştirin',
    swap: "Herhangi bir gönderide adres çubuğundaki <code>x.com</code> kısmını <code>xtracticle.com</code> yapıp Enter'a basın: <code>x.com/kullanici/status/123</code> → <code>xtracticle.com/kullanici/status/123</code>. Gönderi burada, indirmeye hazır açılır.",
    bmH: '2. Tek tıkla yer imi',
    bm: "Bu butonu yer imleri çubuğunuza sürükleyin, sonra X'te bir gönderiyi okurken tıklayın:",
    drag: 'Bu butonu yer imleri çubuğuna sürükleyin.',
    android: "Android'de Xtracticle'ı ana ekrana ekleyerek X uygulamasından gönderileri doğrudan paylaşabilirsiniz.",
  },
  es: {
    h2: 'Dos atajos que ahorran tiempo',
    swapH: '1. Cambia el dominio',
    swap: 'En cualquier post, cambia <code>x.com</code> por <code>xtracticle.com</code> en la barra de direcciones y pulsa Intro: <code>x.com/usuario/status/123</code> → <code>xtracticle.com/usuario/status/123</code>. El post se abre aquí, listo para descargar.',
    bmH: '2. Marcador de un clic',
    bm: 'Arrastra este botón a tu barra de marcadores y púlsalo mientras lees cualquier post de X:',
    drag: 'Arrastra este botón a tu barra de marcadores.',
    android: 'En Android también puedes instalar Xtracticle (Añadir a pantalla de inicio) y compartir posts directamente desde la app de X.',
  },
  pt: {
    h2: 'Dois atalhos que economizam tempo',
    swapH: '1. Troque o domínio',
    swap: 'Em qualquer post, troque <code>x.com</code> por <code>xtracticle.com</code> na barra de endereços e aperte Enter: <code>x.com/usuario/status/123</code> → <code>xtracticle.com/usuario/status/123</code>. O post abre aqui, pronto para baixar.',
    bmH: '2. Favorito de um clique',
    bm: 'Arraste este botão para a barra de favoritos e clique nele enquanto lê qualquer post do X:',
    drag: 'Arraste este botão para a barra de favoritos.',
    android: 'No Android você também pode instalar o Xtracticle (Adicionar à tela inicial) e compartilhar posts direto do app do X.',
  },
  ja: {
    h2: '時間を節約する2つのショートカット',
    swapH: '1. ドメインを置き換える',
    swap: 'ポストを開いたら、アドレスバーの <code>x.com</code> を <code>xtracticle.com</code> に書き換えてEnter：<code>x.com/user/status/123</code> → <code>xtracticle.com/user/status/123</code>。そのままここで開き、すぐにダウンロードできます。',
    bmH: '2. ワンクリックのブックマークレット',
    bm: 'このボタンをブックマークバーにドラッグし、Xのポストを読んでいるときにクリックしてください：',
    drag: 'このボタンをブックマークバーにドラッグしてください。',
    android: 'Androidでは「ホーム画面に追加」でXtracticleをインストールすると、Xアプリから直接ポストを共有できます。',
  },
};

export function shortcuts(lang: Lang): string {
  const c = SHORTCUTS[lang];
  return `
<section>
  <h2>${c.h2}</h2>
  <h3>${c.swapH}</h3>
  <p>${c.swap}</p>
  <h3>${c.bmH}</h3>
  <p>${c.bm} ${bookmarkletLink(c.drag)}</p>
  <p>${c.android}</p>
</section>`;
}

const FX = '<a href="https://github.com/FixTweet/FxTwitter" rel="noopener">FxTwitter</a>';

const PRIVACY: Record<Lang, { h2: string; p: string }> = {
  en: {
    h2: 'Privacy',
    p: `No account, no login, no upload. Xtracticle fetches the public post on demand through the open-source ${FX} API and builds your file in your browser. We don't store the posts you extract. We use Google Analytics to count anonymous visits and downloads so we know which features matter. The <a href="${GITHUB}" rel="noopener">source code is on GitHub</a>.`,
  },
  tr: {
    h2: 'Gizlilik',
    p: `Hesap yok, giriş yok, yükleme yok. Xtracticle herkese açık gönderiyi açık kaynak ${FX} API'si üzerinden anlık olarak alır ve dosyanızı tarayıcınızda oluşturur. Çıkardığınız gönderileri saklamayız. Hangi özelliklerin kullanıldığını anlamak için anonim ziyaret ve indirme sayılarını Google Analytics ile ölçeriz. <a href="${GITHUB}" rel="noopener">Kaynak kodu GitHub'da</a>.`,
  },
  es: {
    h2: 'Privacidad',
    p: `Sin cuenta, sin inicio de sesión y sin subir nada. Xtracticle obtiene el post público al momento mediante la API de código abierto ${FX} y crea tu archivo en tu navegador. No guardamos los posts que extraes. Usamos Google Analytics para contar visitas y descargas anónimas y saber qué funciones son útiles. El <a href="${GITHUB}" rel="noopener">código fuente está en GitHub</a>.`,
  },
  pt: {
    h2: 'Privacidade',
    p: `Sem conta, sem login e sem upload. O Xtracticle busca o post público na hora pela API de código aberto ${FX} e gera o seu arquivo no navegador. Não armazenamos os posts que você extrai. Usamos o Google Analytics para contar visitas e downloads anônimos e entender quais recursos são úteis. O <a href="${GITHUB}" rel="noopener">código-fonte está no GitHub</a>.`,
  },
  ja: {
    h2: 'プライバシー',
    p: `アカウント登録・ログイン・アップロードは不要です。Xtracticleはオープンソースの${FX} APIを通じて公開ポストをその都度取得し、ファイルはお使いのブラウザ内で作成されます。取得したポストを保存することはありません。どの機能が使われているかを把握するため、Google Analyticsで匿名の訪問数とダウンロード数のみ計測しています。<a href="${GITHUB}" rel="noopener">ソースコードはGitHubで公開</a>しています。`,
  },
};

export function privacy(lang: Lang): string {
  const c = PRIVACY[lang];
  return `
<section>
  <h2>${c.h2}</h2>
  <p>${c.p}</p>
</section>`;
}
