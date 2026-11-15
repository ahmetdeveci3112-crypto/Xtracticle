import { EXT_PAGE_PATHS, chromeListed, edgeListed, savedPath } from '../src/lib/ext';
import { steps, type FAQ, type Lang, type SitePage } from './blocks';
import { extButtons, extLoopVideo, extNote } from './ext-home';
import { proPath } from './pro-page';

/**
 * /chrome-extension and its six language versions: the browser extension's landing page.
 * site/pages.ts includes these pages only while `extAvailable()` (src/lib/ext.ts): with no store
 * listing there is no page, no sitemap entry and no footer link. Launch day = fill `EXT_STORE_URL` (and `EXT_EDGE_STORE_URL`).
 *
 * Facts only (docs/chrome-extension-plan.md and site/privacy-page.ts): free; Markdown on the spot,
 * PDF/EPUB/ZIP through the site; bookmark export (last 100 free, all with Pro); copies stay in the
 * browser; on X's empty page for a gone post: "Open saved copy" (3 newest free, all with Pro).
 * No automatic "deleted" alert exists, and the FAQ says so.
 */

const PRIVACY_PATHS: Record<Lang, string> = {
  en: '/privacy',
  tr: '/tr/gizlilik',
  es: '/es/privacidad',
  pt: '/pt/privacidade',
  ja: '/ja/privacy',
  zh: '/zh/privacy',
  ar: '/ar/privacy',
};

export interface ExtPageCopy {
  title: string;
  description: string;
  h1: string;
  sub: string;
  nav: string;
  /** HTML (trusted). Placeholders in every HTML string: {pro}, {privacy}, {saved}. */
  intro: string;
  whatH2: string;
  what: [string, string][];
  bmH2: string;
  bmSteps: string[];
  bmShot: string;
  bmAfter: string;
  saveH2: string;
  saveP: string;
  saveShot: string;
  pdfShot: string;
  goneH2: string;
  goneP: string;
  goneShot: string;
  goneP2: string;
  savedShot: string;
  privH2: string;
  priv: string[];
  plansH2: string;
  plansHead: [string, string];
  plans: [string, string, string][];
  plansP: string;
  ctaH2: string;
  ctaP: string;
  faq: FAQ[];
}

const COPY: Record<Lang, ExtPageCopy> = {
  en: {
    title: 'Export X Bookmarks & Save Tweets as PDF | Xtracticle',
    description:
      'Free Chrome extension: export X (Twitter) bookmarks, save any post, thread or Article as Markdown, PDF or EPUB in one click. Data stays in your browser.',
    h1: 'X Bookmark Exporter for Chrome',
    sub: 'Export your X (Twitter) bookmarks and save any post, thread or Article as Markdown, PDF or EPUB in one click, right on X. Free.',
    nav: 'Chrome extension',
    intro:
      '<strong>Xtracticle for Chrome</strong> adds a Save menu to every post on x.com and an export panel to your Bookmarks. It is the same converter as this website without the copy and paste: save a post where you read it, export your bookmarks in one go, and keep copies that stay readable if a post is deleted later.',
    whatH2: 'What the extension does',
    what: [
      ['Save any post in one click', 'A Save menu on every post. Markdown downloads or copies on the spot; PDF, EPUB and ZIP open on xtracticle.com and download by themselves.'],
      ['Export your X bookmarks', 'Scan your Bookmarks page and export it as one ZIP of Markdown files. Your last 100 bookmarks are free; Pro exports all of them.'],
      ['Keep copies in your browser', 'Bookmarks you scan are saved in this browser, and the Saved posts page shows them whenever you want.'],
      ['Open a deleted post from your copy', 'When a saved post is deleted or made private, X shows an empty page. The extension adds “Open saved copy” there, with links to web archives.'],
    ],
    bmH2: 'How to export X bookmarks in three steps',
    bmSteps: [
      '<strong>Add the extension</strong> to Chrome, Edge, Brave or Opera and open x.com, signed in as usual.',
      '<strong>Open your Bookmarks</strong> and click <em>Scan bookmarks</em> in the Xtracticle panel. It goes through the list and counts what it saves.',
      '<strong>Click <em>Export on Xtracticle</em></strong>: the Saved posts page opens, and you download your bookmarks as a ZIP of Markdown files.',
    ],
    bmShot: 'The Xtracticle bookmarks panel on X: scan your bookmarks, then export them on Xtracticle.',
    bmAfter: 'Each file keeps the post’s text, author, date and source link. Free exports cover your last 100 bookmarks; <a href="{pro}">Pro</a> exports all of them.',
    saveH2: 'Save a tweet as PDF, Markdown or EPUB from X',
    saveP:
      'Click the download icon on any post, thread or X Article. <strong>Markdown</strong> downloads or copies right there. <strong>PDF, EPUB and ZIP</strong> open the post on xtracticle.com in a new tab and download in the format you picked, with the same layout as the website.',
    saveShot: 'The Save menu on a post on X: Markdown, PDF, EPUB and ZIP.',
    pdfShot: 'A thread saved as PDF from the extension: title, author, date and text, ready to keep.',
    goneH2: 'If a bookmarked post is deleted',
    goneP:
      'X shows “this page doesn’t exist” for posts that were deleted, made private or belong to a suspended account. If you have a copy, the extension adds <em>Open saved copy</em> to that page, next to links to the Wayback Machine and archive.today.',
    goneShot: 'X’s empty page for a deleted post, with the extension’s “Open saved copy” menu.',
    goneP2:
      'All your copies are on the <a href="{saved}">Saved posts</a> page, with an <em>Unavailable</em> filter for the ones X no longer shows. Nothing alerts you on its own: you see it when you open the post or the list.',
    savedShot: 'The Saved posts page on Xtracticle: every copy, with unavailable posts marked.',
    privH2: 'Your data stays in your browser',
    priv: [
      '<strong>Copies stay on your device.</strong> Saved posts are kept in your browser’s local database and are not uploaded to our server. Removing the extension removes them.',
      '<strong>No requests to X.</strong> The extension reads what the X page has already loaded. It never posts, likes or follows anything and never asks for your X password.',
      '<strong>Little is sent to us:</strong> the ID of a public post you choose to save, your Pro status, and anonymous usage counts you can turn off.',
      'The details are in the <a href="{privacy}">privacy policy</a>.',
    ],
    plansH2: 'Free and Pro',
    plansHead: ['Free', 'Pro'],
    plans: [
      ['Save posts, threads and Articles (Markdown, PDF, EPUB, ZIP)', '✅', '✅'],
      ['Bookmark export', 'Last 100', 'All bookmarks'],
      ['Saved copies of unavailable posts', '3 newest', 'All'],
    ],
    plansP: 'Pro is the same license as on the website: activate it once and it works in both. <a href="{pro}">See what Pro includes</a>.',
    ctaH2: 'Add Xtracticle to Chrome',
    ctaP: 'Free, no account. Works in Chrome, Edge, Brave and Opera on a computer.',
    faq: [
      { q: 'Is the extension free?', a: 'Yes. Saving posts and exporting your last 100 bookmarks are free. Xtracticle Pro adds unlimited bookmark export and every saved copy of unavailable posts.' },
      { q: 'How do I export my X (Twitter) bookmarks?', a: 'Install the extension, open your Bookmarks on x.com, click Scan bookmarks in the Xtracticle panel, then Export on Xtracticle. You download them as a ZIP of Markdown files.' },
      { q: 'Which browsers does it work in?', a: 'Chrome, Microsoft Edge, Brave and Opera on a computer (Windows, macOS, Linux, ChromeOS). It does not run in Firefox, Safari or on phones; there, use the website.' },
      { q: 'Is Xtracticle affiliated with X?', a: 'No. Xtracticle is an independent, open-source project and is not affiliated with X Corp. It works only with posts you can already see on X.' },
      { q: 'Does it need my X password?', a: 'No. The extension works inside the x.com tab where you are already signed in and reads only what that page has loaded.' },
      { q: 'Will it tell me when a post is deleted?', a: 'No, there is no automatic alert. When you open a saved post that X no longer shows, the extension offers your copy, and the Saved posts page lists unavailable posts.' },
      { q: 'Can I save tweets as PDF without the extension?', a: 'Yes. Paste the post link at the top of this page and pick PDF. The extension only saves you the copy and paste.' },
    ],
  },
  tr: {
    title: 'X Yer İmlerini Dışa Aktar, Tweet’i PDF Kaydet | Xtracticle',
    description:
      'Ücretsiz Chrome eklentisi: X (Twitter) yer imlerinizi dışa aktarın, her gönderiyi, flood’u ve makaleyi tek tıkla Markdown, PDF veya EPUB olarak kaydedin.',
    h1: 'X Yer İmi Dışa Aktarma Eklentisi',
    sub: 'X (Twitter) yer imlerinizi dışa aktarın; her gönderiyi, flood’u ve makaleyi doğrudan X’te tek tıkla Markdown, PDF veya EPUB olarak kaydedin. Ücretsiz.',
    nav: 'Chrome eklentisi',
    intro:
      '<strong>Xtracticle Chrome eklentisi</strong> x.com’daki her gönderiye bir Kaydet menüsü, Yer İşaretleri sayfanıza da bir dışa aktarma paneli ekler. Bu sitedeki dönüştürücünün aynısıdır, yalnızca link kopyalamanız gerekmez: gönderiyi okuduğunuz yerde kaydedin, yer imlerinizi tek seferde dışa aktarın, gönderi sonradan silinse de okunabilen kopyalar tutun.',
    whatH2: 'Eklenti ne yapar?',
    what: [
      ['Her gönderiyi tek tıkla kaydedin', 'Her gönderide bir Kaydet menüsü. Markdown yerinde iner ya da kopyalanır; PDF, EPUB ve ZIP xtracticle.com’da açılır ve kendiliğinden iner.'],
      ['X yer imlerinizi dışa aktarın', 'Yer İşaretleri sayfanızı tarayın ve tek bir Markdown ZIP dosyası olarak dışa aktarın. Son 100 yer imi ücretsiz; Pro ile tamamı.'],
      ['Kopyalar tarayıcınızda kalır', 'Taradığınız yer imleri bu tarayıcıda saklanır; Kayıtlı gönderiler sayfası onları istediğiniz zaman gösterir.'],
      ['Silinen gönderiyi kopyanızdan açın', 'Kaydettiğiniz gönderi silinir ya da gizlenirse X boş bir sayfa gösterir. Eklenti oraya “Kayıtlı kopyayı aç” ve web arşivi linklerini ekler.'],
    ],
    bmH2: 'X yer imleri 3 adımda nasıl dışa aktarılır?',
    bmSteps: [
      '<strong>Eklentiyi</strong> Chrome, Edge, Brave ya da Opera’ya ekleyin ve her zamanki gibi oturum açık olarak x.com’u açın.',
      '<strong>Yer İşaretleri sayfanızı açın</strong> ve Xtracticle panelinde <em>Yer imlerini tara</em>’ya tıklayın. Eklenti listeyi dolaşır ve kaydettiklerini sayar.',
      '<strong><em>Xtracticle’da dışa aktar</em>’a tıklayın:</strong> Kayıtlı gönderiler sayfası açılır, yer imlerinizi Markdown dosyalarından oluşan bir ZIP olarak indirirsiniz.',
    ],
    bmShot: 'X’te Xtracticle yer imi paneli: yer imlerinizi tarayın, sonra Xtracticle’da dışa aktarın.',
    bmAfter: 'Her dosyada gönderinin metni, yazarı, tarihi ve kaynak linki bulunur. Ücretsiz dışa aktarma son 100 yer imini kapsar; <a href="{pro}">Pro</a> tamamını aktarır.',
    saveH2: 'Tweet’i X’ten PDF, Markdown veya EPUB olarak kaydedin',
    saveP:
      'Herhangi bir gönderi, flood ya da X makalesindeki indirme simgesine tıklayın. <strong>Markdown</strong> orada iner veya kopyalanır. <strong>PDF, EPUB ve ZIP</strong> gönderiyi yeni sekmede xtracticle.com’da açar ve seçtiğiniz biçimde, sitedekiyle aynı düzende indirir.',
    saveShot: 'X’te bir gönderideki Kaydet menüsü: Markdown, PDF, EPUB ve ZIP.',
    pdfShot: 'Eklentiyle PDF olarak kaydedilmiş bir flood: başlık, yazar, tarih ve metin.',
    goneH2: 'Yer imlerinizdeki gönderi silinirse',
    goneP:
      'X; silinen, gizlenen ya da askıya alınmış hesaba ait gönderiler için “Bu sayfa mevcut değil” gösterir. Kopyanız varsa eklenti o sayfaya <em>Kayıtlı kopyayı aç</em> seçeneğini, Wayback Machine ve archive.today linkleriyle birlikte ekler.',
    goneShot: 'Silinen bir gönderi için X’in boş sayfası ve eklentinin “Kayıtlı kopyayı aç” menüsü.',
    goneP2:
      'Tüm kopyalarınız <a href="{saved}">Kayıtlı gönderiler</a> sayfasındadır; X’in artık göstermediklerini <em>Erişilemeyenler</em> süzgeci ayırır. Kendiliğinden gelen bir uyarı yoktur: gönderiyi ya da listeyi açtığınızda görürsünüz.',
    savedShot: 'Xtracticle’daki Kayıtlı gönderiler sayfası: tüm kopyalar, erişilemeyenler işaretli.',
    privH2: 'Verileriniz tarayıcınızda kalır',
    priv: [
      '<strong>Kopyalar cihazınızda kalır.</strong> Kayıtlı gönderiler tarayıcınızın yerel veritabanında tutulur, sunucumuza yüklenmez. Eklentiyi kaldırınca silinirler.',
      '<strong>X’e istek gönderilmez.</strong> Eklenti, X sayfasının zaten yüklediği veriyi okur. Hiçbir şey paylaşmaz, beğenmez, takip etmez; X şifrenizi istemez.',
      '<strong>Bize gelen çok az:</strong> kaydetmeyi seçtiğiniz herkese açık gönderinin kimliği, Pro durumunuz ve kapatabileceğiniz anonim kullanım sayıları.',
      'Ayrıntılar <a href="{privacy}">gizlilik politikasında</a>.',
    ],
    plansH2: 'Ücretsiz ve Pro',
    plansHead: ['Ücretsiz', 'Pro'],
    plans: [
      ['Gönderi, flood ve makale kaydetme (Markdown, PDF, EPUB, ZIP)', '✅', '✅'],
      ['Yer imi dışa aktarma', 'Son 100', 'Tümü'],
      ['Erişilemeyen gönderilerin kayıtlı kopyaları', 'En yeni 3', 'Tümü'],
    ],
    plansP: 'Pro, sitedekiyle aynı lisanstır: bir kez etkinleştirin, ikisinde de çalışsın. <a href="{pro}">Pro’da neler var?</a>',
    ctaH2: 'Xtracticle’ı Chrome’a ekleyin',
    ctaP: 'Ücretsiz, hesap gerekmez. Bilgisayarda Chrome, Edge, Brave ve Opera’da çalışır.',
    faq: [
      { q: 'Eklenti ücretsiz mi?', a: 'Evet. Gönderi kaydetmek ve son 100 yer imini dışa aktarmak ücretsiz. Xtracticle Pro sınırsız yer imi dışa aktarma ve erişilemeyen gönderilerin tüm kayıtlı kopyalarını ekler.' },
      { q: 'X (Twitter) yer imlerimi nasıl dışa aktarırım?', a: 'Eklentiyi kurun, x.com’da Yer İşaretleri sayfanızı açın, Xtracticle panelinde Yer imlerini tara’ya, ardından Xtracticle’da dışa aktar’a tıklayın. Yer imleriniz Markdown dosyalarından oluşan bir ZIP olarak iner.' },
      { q: 'Hangi tarayıcılarda çalışır?', a: 'Bilgisayarda Chrome, Microsoft Edge, Brave ve Opera’da (Windows, macOS, Linux, ChromeOS). Firefox, Safari ve telefonlarda çalışmaz; orada web sitesini kullanın.' },
      { q: 'Xtracticle’ın X ile bağlantısı var mı?', a: 'Hayır. Xtracticle bağımsız, açık kaynak bir projedir ve X Corp. ile bağlantılı değildir. Yalnızca X’te zaten görebildiğiniz gönderilerle çalışır.' },
      { q: 'X şifremi istiyor mu?', a: 'Hayır. Eklenti, oturumunuzun zaten açık olduğu x.com sekmesinde çalışır ve yalnızca o sayfanın yüklediğini okur.' },
      { q: 'Bir gönderi silindiğinde bana haber verir mi?', a: 'Hayır, otomatik bir uyarı yok. X’in artık göstermediği kayıtlı bir gönderiyi açtığınızda eklenti kopyanızı sunar; Kayıtlı gönderiler sayfası da erişilemeyenleri listeler.' },
      { q: 'Tweet’i eklenti olmadan PDF olarak kaydedebilir miyim?', a: 'Evet. Gönderi linkini bu sayfanın üstüne yapıştırın ve PDF’i seçin. Eklenti yalnızca kopyala-yapıştır adımını ortadan kaldırır.' },
    ],
  },
  es: {
    title: 'Exportar marcadores de X y tweets a PDF | Xtracticle',
    description:
      'Extensión gratis para Chrome: exporta tus marcadores de X (Twitter) y guarda cualquier post, hilo o artículo en Markdown, PDF o EPUB con un clic.',
    h1: 'Exportador de marcadores de X para Chrome',
    sub: 'Exporta tus marcadores de X (Twitter) y guarda cualquier post, hilo o artículo en Markdown, PDF o EPUB con un clic, sin salir de X. Gratis.',
    nav: 'Extensión de Chrome',
    intro:
      '<strong>Xtracticle para Chrome</strong> añade un menú Guardar a cada post de x.com y un panel de exportación a tus Elementos guardados. Es el mismo conversor de esta web, sin copiar y pegar enlaces: guarda un post donde lo lees, exporta tus marcadores de una vez y conserva copias que siguen legibles aunque el post se borre después.',
    whatH2: 'Qué hace la extensión',
    what: [
      ['Guarda cualquier post con un clic', 'Un menú Guardar en cada post. Markdown se descarga o se copia al instante; PDF, EPUB y ZIP se abren en xtracticle.com y se descargan solos.'],
      ['Exporta tus marcadores de X', 'Escanea tu página de Elementos guardados y expórtala como un ZIP de archivos Markdown. Los últimos 100 son gratis; Pro los exporta todos.'],
      ['Copias en tu navegador', 'Los marcadores que escaneas se guardan en este navegador, y la página Posts guardados te los muestra cuando quieras.'],
      ['Abre un post borrado desde tu copia', 'Si un post guardado se borra o se vuelve privado, X muestra una página vacía. La extensión añade ahí “Abrir copia guardada” y enlaces a archivos web.'],
    ],
    bmH2: 'Cómo exportar los marcadores de X en tres pasos',
    bmSteps: [
      '<strong>Añade la extensión</strong> a Chrome, Edge, Brave u Opera y abre x.com con tu sesión iniciada, como siempre.',
      '<strong>Abre tus Elementos guardados</strong> y pulsa <em>Escanear marcadores</em> en el panel de Xtracticle. Recorre la lista y cuenta lo que guarda.',
      '<strong>Pulsa <em>Exportar en Xtracticle</em></strong>: se abre la página Posts guardados y descargas tus marcadores como un ZIP de archivos Markdown.',
    ],
    bmShot: 'El panel de marcadores de Xtracticle en X: escanea tus marcadores y expórtalos en Xtracticle.',
    bmAfter: 'Cada archivo conserva el texto, el autor, la fecha y el enlace del post. La exportación gratis cubre tus últimos 100 marcadores; <a href="{pro}">Pro</a> los exporta todos.',
    saveH2: 'Guarda un tweet en PDF, Markdown o EPUB desde X',
    saveP:
      'Pulsa el icono de descarga de cualquier post, hilo o artículo de X. <strong>Markdown</strong> se descarga o se copia ahí mismo. <strong>PDF, EPUB y ZIP</strong> abren el post en xtracticle.com en una pestaña nueva y lo descargan en el formato elegido, con el mismo diseño que la web.',
    saveShot: 'El menú Guardar en un post de X: Markdown, PDF, EPUB y ZIP.',
    pdfShot: 'Un hilo guardado en PDF desde la extensión: título, autor, fecha y texto.',
    goneH2: 'Si borran un post de tus marcadores',
    goneP:
      'X muestra “Esta página no existe” para posts borrados, privados o de cuentas suspendidas. Si tienes una copia, la extensión añade <em>Abrir copia guardada</em> en esa página, junto a enlaces a Wayback Machine y archive.today.',
    goneShot: 'La página vacía de X para un post borrado, con el menú “Abrir copia guardada” de la extensión.',
    goneP2:
      'Todas tus copias están en la página <a href="{saved}">Posts guardados</a>, con un filtro <em>No disponibles</em> para los que X ya no muestra. No hay avisos automáticos: lo ves al abrir el post o la lista.',
    savedShot: 'La página Posts guardados de Xtracticle: todas las copias, con los posts no disponibles marcados.',
    privH2: 'Tus datos se quedan en tu navegador',
    priv: [
      '<strong>Las copias se quedan en tu dispositivo.</strong> Los posts guardados están en la base de datos local del navegador y no se suben a nuestro servidor. Si quitas la extensión, se borran.',
      '<strong>Ninguna petición a X.</strong> La extensión lee lo que la página de X ya cargó. Nunca publica, da me gusta ni sigue a nadie, y nunca te pide la contraseña de X.',
      '<strong>Nos llega muy poco:</strong> el ID del post público que decides guardar, tu estado Pro y recuentos de uso anónimos que puedes desactivar.',
      'Los detalles están en la <a href="{privacy}">política de privacidad</a>.',
    ],
    plansH2: 'Gratis y Pro',
    plansHead: ['Gratis', 'Pro'],
    plans: [
      ['Guardar posts, hilos y artículos (Markdown, PDF, EPUB, ZIP)', '✅', '✅'],
      ['Exportar marcadores', 'Últimos 100', 'Todos'],
      ['Copias guardadas de posts no disponibles', 'Las 3 más recientes', 'Todas'],
    ],
    plansP: 'Pro es la misma licencia que en la web: actívala una vez y funciona en las dos. <a href="{pro}">Ver qué incluye Pro</a>.',
    ctaH2: 'Añade Xtracticle a Chrome',
    ctaP: 'Gratis y sin cuenta. Funciona en Chrome, Edge, Brave y Opera en el ordenador.',
    faq: [
      { q: '¿La extensión es gratis?', a: 'Sí. Guardar posts y exportar tus últimos 100 marcadores es gratis. Xtracticle Pro añade la exportación ilimitada de marcadores y todas las copias guardadas de posts no disponibles.' },
      { q: '¿Cómo exporto mis marcadores de X (Twitter)?', a: 'Instala la extensión, abre tus Elementos guardados en x.com, pulsa Escanear marcadores en el panel de Xtracticle y luego Exportar en Xtracticle. Los descargas como un ZIP de archivos Markdown.' },
      { q: '¿En qué navegadores funciona?', a: 'En Chrome, Microsoft Edge, Brave y Opera en el ordenador (Windows, macOS, Linux, ChromeOS). No funciona en Firefox, Safari ni en el móvil; ahí usa la web.' },
      { q: '¿Xtracticle tiene relación con X?', a: 'No. Xtracticle es un proyecto independiente y de código abierto, sin relación con X Corp. Solo funciona con posts que ya puedes ver en X.' },
      { q: '¿Necesita mi contraseña de X?', a: 'No. La extensión funciona dentro de la pestaña de x.com donde ya iniciaste sesión y solo lee lo que esa página cargó.' },
      { q: '¿Me avisa cuando se borra un post?', a: 'No, no hay avisos automáticos. Cuando abres un post guardado que X ya no muestra, la extensión te ofrece tu copia, y la página Posts guardados lista los no disponibles.' },
      { q: '¿Puedo guardar tweets en PDF sin la extensión?', a: 'Sí. Pega el enlace del post arriba en esta página y elige PDF. La extensión solo te ahorra copiar y pegar.' },
    ],
  },
  pt: {
    title: 'Exportar itens salvos do X e tweet em PDF | Xtracticle',
    description:
      'Extensão grátis para Chrome: exporte os itens salvos (favoritos) do X/Twitter e salve posts, threads ou artigos em Markdown, PDF ou EPUB num clique.',
    h1: 'Exportador de itens salvos do X para Chrome',
    sub: 'Exporte seus itens salvos do X (Twitter) e salve qualquer post, thread ou artigo em Markdown, PDF ou EPUB com um clique, direto no X. Grátis.',
    nav: 'Extensão do Chrome',
    intro:
      '<strong>Xtracticle para Chrome</strong> coloca um menu Salvar em cada post do x.com e um painel de exportação nos seus Itens salvos. É o mesmo conversor deste site, sem copiar e colar links: salve um post onde você lê, exporte seus itens salvos de uma vez e guarde cópias que continuam legíveis mesmo se o post for apagado depois.',
    whatH2: 'O que a extensão faz',
    what: [
      ['Salve qualquer post com um clique', 'Um menu Salvar em cada post. Markdown baixa ou copia na hora; PDF, EPUB e ZIP abrem no xtracticle.com e baixam sozinhos.'],
      ['Exporte seus itens salvos do X', 'Escaneie a página de Itens salvos e exporte tudo em um ZIP de arquivos Markdown. Os últimos 100 são grátis; o Pro exporta todos.'],
      ['Cópias no seu navegador', 'Os itens que você escaneia ficam salvos neste navegador, e a página Posts salvos mostra tudo quando você quiser.'],
      ['Abra um post apagado pela sua cópia', 'Quando um post salvo é apagado ou fica privado, o X mostra uma página vazia. A extensão adiciona ali “Abrir cópia salva” e links para arquivos da web.'],
    ],
    bmH2: 'Como exportar os itens salvos do X em três passos',
    bmSteps: [
      '<strong>Adicione a extensão</strong> ao Chrome, Edge, Brave ou Opera e abra o x.com com sua conta conectada, como sempre.',
      '<strong>Abra seus Itens salvos</strong> e clique em <em>Escanear itens salvos</em> no painel do Xtracticle. Ela percorre a lista e conta o que guardou.',
      '<strong>Clique em <em>Exportar no Xtracticle</em></strong>: a página Posts salvos abre e você baixa seus itens como um ZIP de arquivos Markdown.',
    ],
    bmShot: 'O painel de itens salvos do Xtracticle no X: escaneie seus itens e exporte no Xtracticle.',
    bmAfter: 'Cada arquivo traz o texto, o autor, a data e o link do post. A exportação grátis cobre seus últimos 100 itens; o <a href="{pro}">Pro</a> exporta todos.',
    saveH2: 'Salve um tweet em PDF, Markdown ou EPUB direto do X',
    saveP:
      'Clique no ícone de download de qualquer post, thread ou artigo do X. O <strong>Markdown</strong> baixa ou copia ali mesmo. <strong>PDF, EPUB e ZIP</strong> abrem o post no xtracticle.com em uma nova aba e baixam no formato escolhido, com o mesmo layout do site.',
    saveShot: 'O menu Salvar em um post no X: Markdown, PDF, EPUB e ZIP.',
    pdfShot: 'Uma thread salva em PDF pela extensão: título, autor, data e texto.',
    goneH2: 'Se um post dos seus itens salvos for apagado',
    goneP:
      'O X mostra “Esta página não existe” para posts apagados, privados ou de contas suspensas. Se você tem uma cópia, a extensão adiciona <em>Abrir cópia salva</em> a essa página, junto com links para o Wayback Machine e o archive.today.',
    goneShot: 'A página vazia do X para um post apagado, com o menu “Abrir cópia salva” da extensão.',
    goneP2:
      'Todas as suas cópias ficam na página <a href="{saved}">Posts salvos</a>, com um filtro <em>Indisponíveis</em> para os que o X não mostra mais. Nada avisa sozinho: você vê ao abrir o post ou a lista.',
    savedShot: 'A página Posts salvos do Xtracticle: todas as cópias, com os posts indisponíveis marcados.',
    privH2: 'Seus dados ficam no seu navegador',
    priv: [
      '<strong>As cópias ficam no seu aparelho.</strong> Os posts salvos ficam no banco de dados local do navegador e não são enviados ao nosso servidor. Remover a extensão apaga tudo.',
      '<strong>Nenhuma requisição ao X.</strong> A extensão lê o que a página do X já carregou. Ela nunca publica, curte ou segue ninguém e nunca pede sua senha do X.',
      '<strong>Chega muito pouco até nós:</strong> o ID do post público que você escolhe salvar, seu status Pro e contagens de uso anônimas que você pode desligar.',
      'Os detalhes estão na <a href="{privacy}">política de privacidade</a>.',
    ],
    plansH2: 'Grátis e Pro',
    plansHead: ['Grátis', 'Pro'],
    plans: [
      ['Salvar posts, threads e artigos (Markdown, PDF, EPUB, ZIP)', '✅', '✅'],
      ['Exportar itens salvos', 'Últimos 100', 'Todos'],
      ['Cópias salvas de posts indisponíveis', 'As 3 mais recentes', 'Todas'],
    ],
    plansP: 'O Pro é a mesma licença do site: ative uma vez e funciona nos dois. <a href="{pro}">Veja o que o Pro inclui</a>.',
    ctaH2: 'Adicione o Xtracticle ao Chrome',
    ctaP: 'Grátis, sem conta. Funciona no Chrome, Edge, Brave e Opera no computador.',
    faq: [
      { q: 'A extensão é grátis?', a: 'Sim. Salvar posts e exportar seus últimos 100 itens salvos é grátis. O Xtracticle Pro acrescenta exportação ilimitada e todas as cópias salvas de posts indisponíveis.' },
      { q: 'Como exporto meus itens salvos (favoritos) do X?', a: 'Instale a extensão, abra seus Itens salvos no x.com, clique em Escanear itens salvos no painel do Xtracticle e depois em Exportar no Xtracticle. Você baixa tudo como um ZIP de arquivos Markdown.' },
      { q: 'Em quais navegadores funciona?', a: 'No Chrome, Microsoft Edge, Brave e Opera no computador (Windows, macOS, Linux, ChromeOS). Não funciona no Firefox, no Safari nem no celular; lá, use o site.' },
      { q: 'O Xtracticle tem vínculo com o X?', a: 'Não. O Xtracticle é um projeto independente e de código aberto, sem vínculo com a X Corp. Ele só funciona com posts que você já consegue ver no X.' },
      { q: 'Ela pede minha senha do X?', a: 'Não. A extensão funciona dentro da aba do x.com em que você já está conectado e lê só o que essa página carregou.' },
      { q: 'Ela me avisa quando um post é apagado?', a: 'Não, não há aviso automático. Quando você abre um post salvo que o X não mostra mais, a extensão oferece sua cópia, e a página Posts salvos lista os indisponíveis.' },
      { q: 'Posso salvar tweets em PDF sem a extensão?', a: 'Sim. Cole o link do post no topo desta página e escolha PDF. A extensão só poupa o copiar e colar.' },
    ],
  },
  ja: {
    title: 'Xのブックマークをエクスポート・ツイートをPDF保存 | Xtracticle',
    description:
      '無料のChrome拡張機能。X（Twitter）のブックマークをエクスポートし、ポスト・スレッド・記事をワンクリックでMarkdown、PDF、EPUBに保存できます。',
    h1: 'XブックマークのエクスポートができるChrome拡張機能',
    sub: 'X（Twitter）のブックマークをエクスポートし、ポスト・スレッド・記事をX上でワンクリックでMarkdown、PDF、EPUBに保存。無料です。',
    nav: 'Chrome拡張機能',
    intro:
      '<strong>Xtracticle for Chrome</strong>は、x.comのすべてのポストに保存メニューを、ブックマークページにエクスポート用パネルを追加します。中身はこのサイトと同じ変換機能で、リンクをコピーする必要はありません。読んでいるその場で保存し、ブックマークをまとめてエクスポートし、あとでポストが削除されても読めるコピーを残せます。',
    whatH2: '拡張機能でできること',
    what: [
      ['どのポストもワンクリックで保存', 'すべてのポストに保存メニュー。Markdownはその場でダウンロードまたはコピー。PDF、EPUB、ZIPはxtracticle.comで開き、自動でダウンロードされます。'],
      ['Xのブックマークをエクスポート', 'ブックマークページをスキャンし、MarkdownファイルのZIPにまとめてエクスポート。直近100件は無料、Proならすべて。'],
      ['コピーはブラウザ内に', 'スキャンしたブックマークはこのブラウザに保存され、「保存したポスト」ページでいつでも見られます。'],
      ['削除されたポストもコピーから開ける', '保存したポストが削除・非公開になると、Xは空のページを表示します。拡張機能はそこに「保存したコピーを開く」とWebアーカイブへのリンクを追加します。'],
    ],
    bmH2: 'Xのブックマークを3ステップでエクスポートする方法',
    bmSteps: [
      '<strong>拡張機能を追加</strong>します（Chrome、Edge、Brave、Opera）。いつもどおりログインした状態でx.comを開きます。',
      '<strong>ブックマークを開き</strong>、Xtracticleパネルの<em>ブックマークをスキャン</em>をクリック。一覧をたどり、保存した件数を数えます。',
      '<strong><em>Xtracticleでエクスポート</em>をクリック</strong>すると「保存したポスト」ページが開き、ブックマークをMarkdownファイルのZIPとしてダウンロードできます。',
    ],
    bmShot: 'X上のXtracticleブックマークパネル：ブックマークをスキャンし、Xtracticleでエクスポート。',
    bmAfter: '各ファイルにはポストの本文、投稿者、日付、元のリンクが入ります。無料では直近100件、<a href="{pro}">Pro</a>ならすべてをエクスポートできます。',
    saveH2: 'XからツイートをPDF・Markdown・EPUBで保存',
    saveP:
      'ポスト、スレッド、X記事のダウンロードアイコンをクリックします。<strong>Markdown</strong>はその場でダウンロードまたはコピー。<strong>PDF、EPUB、ZIP</strong>は新しいタブでxtracticle.comにポストを開き、選んだ形式でサイトと同じレイアウトのままダウンロードします。',
    saveShot: 'X上のポストの保存メニュー：Markdown、PDF、EPUB、ZIP。',
    pdfShot: '拡張機能でPDFに保存したスレッド：タイトル、投稿者、日付、本文。',
    goneH2: 'ブックマークしたポストが削除されたら',
    goneP:
      '削除・非公開になったポストや凍結アカウントのポストには、Xは「このページは存在しません」と表示します。コピーがあれば、拡張機能はそのページに<em>保存したコピーを開く</em>を追加し、Wayback Machineとarchive.todayへのリンクも並べます。',
    goneShot: '削除されたポストのXの空ページと、拡張機能の「保存したコピーを開く」メニュー。',
    goneP2:
      'コピーはすべて<a href="{saved}">保存したポスト</a>ページにあり、Xで表示されなくなったものは<em>表示できない</em>フィルターで絞り込めます。自動の通知はありません。ポストや一覧を開いたときに分かります。',
    savedShot: 'Xtracticleの「保存したポスト」ページ：すべてのコピーと、表示できないポストの印。',
    privH2: 'データはブラウザの中に',
    priv: [
      '<strong>コピーはお使いの端末に残ります。</strong>保存したポストはブラウザのローカルデータベースに保管され、サーバーにはアップロードされません。拡張機能を削除すると消えます。',
      '<strong>Xへのリクエストはしません。</strong>拡張機能はXのページがすでに読み込んだ内容を読むだけです。投稿・いいね・フォローは一切せず、Xのパスワードも求めません。',
      '<strong>こちらに届くのはごくわずか：</strong>保存を選んだ公開ポストのID、Proの状態、オフにできる匿名の利用回数だけです。',
      '詳しくは<a href="{privacy}">プライバシーポリシー</a>をご覧ください。',
    ],
    plansH2: '無料版とPro',
    plansHead: ['無料', 'Pro'],
    plans: [
      ['ポスト・スレッド・記事の保存（Markdown、PDF、EPUB、ZIP）', '✅', '✅'],
      ['ブックマークのエクスポート', '直近100件', 'すべて'],
      ['表示できないポストの保存コピー', '新しい3件', 'すべて'],
    ],
    plansP: 'Proはサイトと同じライセンスです。一度有効にすれば両方で使えます。<a href="{pro}">Proの内容を見る</a>',
    ctaH2: 'XtracticleをChromeに追加',
    ctaP: '無料、アカウント不要。パソコンのChrome、Edge、Brave、Operaで使えます。',
    faq: [
      { q: '拡張機能は無料ですか？', a: 'はい。ポストの保存と直近100件のブックマークのエクスポートは無料です。Xtracticle Proでは、ブックマークを無制限にエクスポートでき、表示できないポストの保存コピーもすべて開けます。' },
      { q: 'X（Twitter）のブックマークをエクスポートするには？', a: '拡張機能を入れてx.comでブックマークを開き、Xtracticleパネルの「ブックマークをスキャン」、続いて「Xtracticleでエクスポート」をクリックします。MarkdownファイルのZIPとしてダウンロードできます。' },
      { q: '対応ブラウザは？', a: 'パソコン（Windows、macOS、Linux、ChromeOS）のChrome、Microsoft Edge、Brave、Operaです。Firefox、Safari、スマートフォンでは動作しないので、Webサイトをお使いください。' },
      { q: 'XtracticleはXと提携していますか？', a: 'いいえ。Xtracticleは独立したオープンソースのプロジェクトで、X Corp.とは提携していません。X上ですでに見られるポストだけを扱います。' },
      { q: 'Xのパスワードは必要ですか？', a: 'いいえ。拡張機能は、すでにログインしているx.comのタブの中で動き、そのページが読み込んだ内容だけを読みます。' },
      { q: 'ポストが削除されたら通知されますか？', a: 'いいえ、自動の通知はありません。Xで表示されなくなった保存済みのポストを開くと、拡張機能がコピーを表示し、「保存したポスト」ページにも一覧で表示されます。' },
      { q: '拡張機能なしでツイートをPDF保存できますか？', a: 'はい。このページの上部にポストのリンクを貼り付けてPDFを選んでください。拡張機能はコピー＆ペーストの手間を省くだけです。' },
    ],
  },
  zh: {
    title: '导出 X 书签、把推文存为 PDF 的 Chrome 扩展 | Xtracticle',
    description: '免费 Chrome 扩展：导出 X（Twitter）书签，一键把任意帖子、推文串或文章保存为 Markdown、PDF 或 EPUB。数据留在你的浏览器里。',
    h1: 'X 书签导出 Chrome 扩展',
    sub: '导出你的 X（Twitter）书签，在 X 上一键把任意帖子、推文串或文章保存为 Markdown、PDF 或 EPUB。免费。',
    nav: 'Chrome 扩展',
    intro:
      '<strong>Xtracticle for Chrome</strong> 会在 x.com 的每条帖子上加一个保存菜单，并在书签页加一个导出面板。它和本网站是同一个转换器，只是不用再复制链接：在阅读的地方直接保存，一次导出全部书签，并保留副本，即使帖子以后被删除也能阅读。',
    whatH2: '扩展能做什么',
    what: [
      ['任意帖子一键保存', '每条帖子都有保存菜单。Markdown 当场下载或复制；PDF、EPUB 和 ZIP 会在 xtracticle.com 打开并自动下载。'],
      ['导出你的 X 书签', '扫描书签页，导出为一个包含 Markdown 文件的 ZIP。最近 100 条免费，Pro 可导出全部。'],
      ['副本保存在浏览器里', '扫描过的书签保存在这个浏览器中，随时可以在“已保存的帖子”页面查看。'],
      ['用副本打开已删除的帖子', '已保存的帖子被删除或设为私密后，X 会显示空白页面。扩展会在那里加上“打开已保存的副本”和网页存档链接。'],
    ],
    bmH2: '三步导出 X 书签',
    bmSteps: [
      '<strong>把扩展添加到</strong> Chrome、Edge、Brave 或 Opera，像平常一样登录后打开 x.com。',
      '<strong>打开你的书签</strong>，在 Xtracticle 面板中点击<em>扫描书签</em>。它会浏览整个列表并统计保存的数量。',
      '<strong>点击<em>在 Xtracticle 导出</em></strong>：“已保存的帖子”页面会打开，你可以把书签下载为包含 Markdown 文件的 ZIP。',
    ],
    bmShot: 'X 上的 Xtracticle 书签面板：先扫描书签，再到 Xtracticle 导出。',
    bmAfter: '每个文件都保留帖子的正文、作者、日期和原始链接。免费导出最近 100 条书签；<a href="{pro}">Pro</a> 可导出全部。',
    saveH2: '在 X 上把推文保存为 PDF、Markdown 或 EPUB',
    saveP:
      '点击任意帖子、推文串或 X 文章上的下载图标。<strong>Markdown</strong> 当场下载或复制。<strong>PDF、EPUB 和 ZIP</strong> 会在新标签页中用 xtracticle.com 打开该帖子，并按你选择的格式下载，版式与网站相同。',
    saveShot: 'X 帖子上的保存菜单：Markdown、PDF、EPUB 和 ZIP。',
    pdfShot: '用扩展保存为 PDF 的推文串：标题、作者、日期和正文。',
    goneH2: '书签里的帖子被删除时',
    goneP:
      '对于已删除、设为私密或来自被封禁账号的帖子，X 会显示“此页面不存在”。如果你有副本，扩展会在该页面加上<em>打开已保存的副本</em>，旁边还有 Wayback Machine 和 archive.today 的链接。',
    goneShot: '已删除帖子的 X 空白页面，以及扩展的“打开已保存的副本”菜单。',
    goneP2:
      '所有副本都在<a href="{saved}">已保存的帖子</a>页面，可用<em>不可用</em>筛选出 X 已不再显示的帖子。不会自动提醒：打开帖子或列表时你就会看到。',
    savedShot: 'Xtracticle 的“已保存的帖子”页面：所有副本，不可用的帖子已标出。',
    privH2: '数据留在你的浏览器里',
    priv: [
      '<strong>副本留在你的设备上。</strong>已保存的帖子存放在浏览器的本地数据库中，不会上传到我们的服务器。移除扩展即会删除。',
      '<strong>不向 X 发送请求。</strong>扩展只读取 X 页面已经加载的内容，从不发帖、点赞或关注，也从不索要你的 X 密码。',
      '<strong>发给我们的很少：</strong>你选择保存的公开帖子的 ID、你的 Pro 状态，以及可以关闭的匿名使用次数统计。',
      '详情见<a href="{privacy}">隐私政策</a>。',
    ],
    plansH2: '免费版与 Pro',
    plansHead: ['免费', 'Pro'],
    plans: [
      ['保存帖子、推文串和文章（Markdown、PDF、EPUB、ZIP）', '✅', '✅'],
      ['导出书签', '最近 100 条', '全部'],
      ['不可用帖子的已保存副本', '最新 3 条', '全部'],
    ],
    plansP: 'Pro 与网站使用同一个许可证：激活一次，两边都能用。<a href="{pro}">了解 Pro 包含什么</a>。',
    ctaH2: '把 Xtracticle 添加到 Chrome',
    ctaP: '免费，无需账号。适用于电脑上的 Chrome、Edge、Brave 和 Opera。',
    faq: [
      { q: '扩展免费吗？', a: '免费。保存帖子和导出最近 100 条书签都免费。Xtracticle Pro 增加不限数量的书签导出，以及不可用帖子的全部已保存副本。' },
      { q: '如何导出我的 X（Twitter）书签？', a: '安装扩展后在 x.com 打开书签，在 Xtracticle 面板中点击“扫描书签”，再点击“在 Xtracticle 导出”。书签会以包含 Markdown 文件的 ZIP 下载。' },
      { q: '支持哪些浏览器？', a: '电脑（Windows、macOS、Linux、ChromeOS）上的 Chrome、Microsoft Edge、Brave 和 Opera。不支持 Firefox、Safari 和手机；在这些地方请使用网站。' },
      { q: 'Xtracticle 与 X 有关联吗？', a: '没有。Xtracticle 是独立的开源项目，与 X Corp. 无关联。它只处理你在 X 上本来就能看到的帖子。' },
      { q: '需要我的 X 密码吗？', a: '不需要。扩展在你已经登录的 x.com 标签页中运行，只读取该页面已加载的内容。' },
      { q: '帖子被删除时会提醒我吗？', a: '不会，没有自动提醒。当你打开一条 X 已不再显示的已保存帖子时，扩展会提供你的副本，“已保存的帖子”页面也会列出不可用的帖子。' },
      { q: '不装扩展也能把推文存为 PDF 吗？', a: '可以。把帖子链接粘贴到本页顶部，选择 PDF 即可。扩展只是省去了复制粘贴。' },
    ],
  },
  ar: {
    title: 'تصدير الإشارات المرجعية في X وحفظ التغريدات PDF | Xtracticle',
    description:
      'إضافة Chrome مجانية: صدّر إشاراتك المرجعية في X (تويتر) واحفظ أي منشور أو ثريد أو مقالة بصيغة Markdown أو PDF أو EPUB بنقرة واحدة.',
    h1: 'إضافة Chrome لتصدير إشارات X المرجعية',
    sub: 'صدّر إشاراتك المرجعية في X (تويتر) واحفظ أي منشور أو ثريد أو مقالة بصيغة Markdown أو PDF أو EPUB بنقرة واحدة داخل X. مجانًا.',
    nav: 'إضافة Chrome',
    intro:
      'تضيف <strong>Xtracticle لـ Chrome</strong> قائمة حفظ إلى كل منشور على x.com ولوحة تصدير إلى صفحة الإشارات المرجعية. إنها أداة التحويل نفسها في هذا الموقع، لكن دون نسخ الروابط: احفظ المنشور حيث تقرؤه، وصدّر إشاراتك المرجعية دفعة واحدة، واحتفظ بنسخ تبقى قابلة للقراءة حتى لو حُذف المنشور لاحقًا.',
    whatH2: 'ماذا تفعل الإضافة',
    what: [
      ['احفظ أي منشور بنقرة', 'قائمة حفظ على كل منشور. يُنزَّل Markdown أو يُنسخ فورًا، أما PDF وEPUB وZIP فتُفتح على xtracticle.com وتُنزَّل تلقائيًا.'],
      ['صدّر إشاراتك المرجعية في X', 'امسح صفحة الإشارات المرجعية وصدّرها في ملف ZIP واحد من ملفات Markdown. آخر 100 مجانًا، وكلها مع Pro.'],
      ['النسخ تبقى في متصفحك', 'تُحفظ الإشارات المرجعية التي تمسحها في هذا المتصفح، وتعرضها لك صفحة المنشورات المحفوظة متى شئت.'],
      ['افتح منشورًا محذوفًا من نسختك', 'عندما يُحذف منشور محفوظ أو يصبح خاصًا، يعرض X صفحة فارغة. تضيف الإضافة هناك «فتح النسخة المحفوظة» وروابط إلى أرشيفات الويب.'],
    ],
    bmH2: 'كيف تصدّر إشارات X المرجعية في ثلاث خطوات',
    bmSteps: [
      '<strong>أضف الإضافة</strong> إلى Chrome أو Edge أو Brave أو Opera، وافتح x.com وأنت مسجّل الدخول كالمعتاد.',
      '<strong>افتح الإشارات المرجعية</strong> وانقر <em>مسح الإشارات المرجعية</em> في لوحة Xtracticle. تمر الإضافة على القائمة وتعدّ ما تحفظه.',
      '<strong>انقر <em>التصدير على Xtracticle</em></strong>: تُفتح صفحة المنشورات المحفوظة، وتنزّل إشاراتك المرجعية في ملف ZIP من ملفات Markdown.',
    ],
    bmShot: 'لوحة الإشارات المرجعية من Xtracticle على X: امسح إشاراتك ثم صدّرها على Xtracticle.',
    bmAfter: 'يحتفظ كل ملف بنص المنشور وكاتبه وتاريخه ورابطه الأصلي. يغطي التصدير المجاني آخر 100 إشارة مرجعية، ويصدّرها <a href="{pro}">Pro</a> كلها.',
    saveH2: 'احفظ تغريدة بصيغة PDF أو Markdown أو EPUB من X',
    saveP:
      'انقر أيقونة التنزيل على أي منشور أو ثريد أو مقالة في X. يُنزَّل <strong>Markdown</strong> أو يُنسخ في مكانه. أما <strong>PDF وEPUB وZIP</strong> فتفتح المنشور على xtracticle.com في علامة تبويب جديدة وتنزّله بالصيغة التي اخترتها، بالتنسيق نفسه الموجود في الموقع.',
    saveShot: 'قائمة الحفظ على منشور في X: Markdown وPDF وEPUB وZIP.',
    pdfShot: 'ثريد محفوظ بصيغة PDF من الإضافة: العنوان والكاتب والتاريخ والنص.',
    goneH2: 'إذا حُذف منشور من إشاراتك المرجعية',
    goneP:
      'يعرض X عبارة «هذه الصفحة غير موجودة» للمنشورات المحذوفة أو الخاصة أو التابعة لحسابات معلّقة. إذا كانت لديك نسخة، تضيف الإضافة إلى تلك الصفحة <em>فتح النسخة المحفوظة</em>، بجانب روابط إلى Wayback Machine وarchive.today.',
    goneShot: 'صفحة X الفارغة لمنشور محذوف، مع قائمة «فتح النسخة المحفوظة» من الإضافة.',
    goneP2:
      'كل نسخك موجودة في صفحة <a href="{saved}">المنشورات المحفوظة</a>، مع عامل تصفية <em>غير المتاحة</em> للمنشورات التي لم يعد X يعرضها. لا يصلك تنبيه تلقائي: ستعرف ذلك عندما تفتح المنشور أو القائمة.',
    savedShot: 'صفحة المنشورات المحفوظة على Xtracticle: كل النسخ، مع تمييز المنشورات غير المتاحة.',
    privH2: 'بياناتك تبقى في متصفحك',
    priv: [
      '<strong>النسخ تبقى على جهازك.</strong> تُحفظ المنشورات في قاعدة البيانات المحلية لمتصفحك ولا تُرفع إلى خادمنا. وإزالة الإضافة تحذفها.',
      '<strong>لا طلبات إلى X.</strong> تقرأ الإضافة ما حمّلته صفحة X بالفعل. لا تنشر ولا تُعجب ولا تتابع أي شيء، ولا تطلب كلمة مرور X.',
      '<strong>القليل فقط يصلنا:</strong> معرّف المنشور العام الذي تختار حفظه، وحالة Pro لديك، وإحصاءات استخدام مجهولة الهوية يمكنك إيقافها.',
      'التفاصيل في <a href="{privacy}">سياسة الخصوصية</a>.',
    ],
    plansH2: 'المجاني وPro',
    plansHead: ['مجاني', 'Pro'],
    plans: [
      ['حفظ المنشورات والثريدات والمقالات (Markdown وPDF وEPUB وZIP)', '✅', '✅'],
      ['تصدير الإشارات المرجعية', 'آخر 100', 'كلها'],
      ['النسخ المحفوظة للمنشورات غير المتاحة', 'أحدث 3', 'كلها'],
    ],
    plansP: 'Pro هو الترخيص نفسه المستخدم في الموقع: فعّله مرة واحدة ويعمل في الاثنين. <a href="{pro}">اطّلع على ما يتضمنه Pro</a>.',
    ctaH2: 'أضف Xtracticle إلى Chrome',
    ctaP: 'مجانية ودون حساب. تعمل في Chrome وEdge وBrave وOpera على الكمبيوتر.',
    faq: [
      { q: 'هل الإضافة مجانية؟', a: 'نعم. حفظ المنشورات وتصدير آخر 100 إشارة مرجعية مجاني. ويضيف Xtracticle Pro تصديرًا غير محدود وكل النسخ المحفوظة للمنشورات غير المتاحة.' },
      { q: 'كيف أصدّر إشاراتي المرجعية في X (تويتر)؟', a: 'ثبّت الإضافة، وافتح الإشارات المرجعية على x.com، وانقر «مسح الإشارات المرجعية» في لوحة Xtracticle ثم «التصدير على Xtracticle». تنزّلها في ملف ZIP من ملفات Markdown.' },
      { q: 'في أي المتصفحات تعمل؟', a: 'في Chrome وMicrosoft Edge وBrave وOpera على الكمبيوتر (Windows وmacOS وLinux وChromeOS). لا تعمل في Firefox أو Safari أو على الهواتف؛ استخدم الموقع هناك.' },
      { q: 'هل Xtracticle تابع لـ X؟', a: 'لا. Xtracticle مشروع مستقل ومفتوح المصدر وغير تابع لشركة X Corp. ويعمل فقط مع المنشورات التي تستطيع رؤيتها على X أصلًا.' },
      { q: 'هل تحتاج كلمة مرور X؟', a: 'لا. تعمل الإضافة داخل علامة تبويب x.com التي سجّلت الدخول فيها بالفعل، ولا تقرأ إلا ما حمّلته تلك الصفحة.' },
      { q: 'هل تنبهني عند حذف منشور؟', a: 'لا، لا يوجد تنبيه تلقائي. عندما تفتح منشورًا محفوظًا لم يعد X يعرضه، تعرض لك الإضافة نسختك، وتسرد صفحة المنشورات المحفوظة المنشورات غير المتاحة.' },
      { q: 'هل يمكنني حفظ التغريدات PDF دون الإضافة؟', a: 'نعم. الصق رابط المنشور أعلى هذه الصفحة واختر PDF. الإضافة توفّر عليك النسخ واللصق فقط.' },
    ],
  },
};

/**
 * Browser statements that depend on which store listings exist (src/lib/ext.ts). The base copy above is true
 * with only the Chrome Web Store listing (Edge installs from it too). `faqEdge`: both listings, `*Only`: only the
 * Edge Add-ons listing (no Chrome Web Store yet).
 */
interface BrowserVariants {
  faqEdge: string;
  faqOnly: string;
  ctaPOnly: string;
  stepOnly: string;
}

const BROWSERS: Record<Lang, BrowserVariants> = {
  en: {
    faqEdge: 'Chrome, Microsoft Edge, Brave and Opera on a computer (Windows, macOS, Linux, ChromeOS). Chrome, Brave and Opera install it from the Chrome Web Store, Edge from Microsoft Edge Add-ons. It does not run in Firefox, Safari or on phones; there, use the website.',
    faqOnly: 'Microsoft Edge on a computer (Windows, macOS, Linux). It installs from Microsoft Edge Add-ons. It does not run in other browsers or on phones; there, use the website.',
    ctaPOnly: 'Free, no account. Works in Microsoft Edge on a computer.',
    stepOnly: '<strong>Add the extension</strong> to Microsoft Edge and open x.com, signed in as usual.',
  },
  tr: {
    faqEdge: 'Bilgisayarda Chrome, Microsoft Edge, Brave ve Opera’da (Windows, macOS, Linux, ChromeOS). Chrome, Brave ve Opera’ya Chrome Web Mağazası’ndan, Edge’e Microsoft Edge Eklentileri’nden kurulur. Firefox, Safari ve telefonlarda çalışmaz; orada web sitesini kullanın.',
    faqOnly: 'Bilgisayarda Microsoft Edge’de (Windows, macOS, Linux). Microsoft Edge Eklentileri’nden kurulur. Başka tarayıcılarda ve telefonlarda çalışmaz; orada web sitesini kullanın.',
    ctaPOnly: 'Ücretsiz, hesap gerekmez. Bilgisayarda Microsoft Edge’de çalışır.',
    stepOnly: '<strong>Eklentiyi</strong> Microsoft Edge’e ekleyin ve her zamanki gibi oturum açık olarak x.com’u açın.',
  },
  es: {
    faqEdge: 'En Chrome, Microsoft Edge, Brave y Opera en el ordenador (Windows, macOS, Linux, ChromeOS). Chrome, Brave y Opera la instalan desde Chrome Web Store, y Edge desde Microsoft Edge Add-ons. No funciona en Firefox, Safari ni en el móvil; ahí usa la web.',
    faqOnly: 'En Microsoft Edge en el ordenador (Windows, macOS, Linux). Se instala desde Microsoft Edge Add-ons. No funciona en otros navegadores ni en el móvil; ahí usa la web.',
    ctaPOnly: 'Gratis y sin cuenta. Funciona en Microsoft Edge en el ordenador.',
    stepOnly: '<strong>Añade la extensión</strong> a Microsoft Edge y abre x.com con tu sesión iniciada, como siempre.',
  },
  pt: {
    faqEdge: 'No Chrome, Microsoft Edge, Brave e Opera no computador (Windows, macOS, Linux, ChromeOS). Chrome, Brave e Opera instalam pela Chrome Web Store, e o Edge pelo Microsoft Edge Add-ons. Não funciona no Firefox, no Safari nem no celular; lá, use o site.',
    faqOnly: 'No Microsoft Edge no computador (Windows, macOS, Linux). Instala-se pelo Microsoft Edge Add-ons. Não funciona em outros navegadores nem no celular; lá, use o site.',
    ctaPOnly: 'Grátis, sem conta. Funciona no Microsoft Edge no computador.',
    stepOnly: '<strong>Adicione a extensão</strong> ao Microsoft Edge e abra o x.com com sua conta conectada, como sempre.',
  },
  ja: {
    faqEdge: 'パソコン（Windows、macOS、Linux、ChromeOS）のChrome、Microsoft Edge、Brave、Operaです。Chrome、Brave、OperaはChromeウェブストアから、EdgeはMicrosoft Edgeアドオンからインストールします。Firefox、Safari、スマートフォンでは動作しないので、Webサイトをお使いください。',
    faqOnly: 'パソコン（Windows、macOS、Linux）のMicrosoft Edgeです。Microsoft Edgeアドオンからインストールします。ほかのブラウザやスマートフォンでは動作しないので、Webサイトをお使いください。',
    ctaPOnly: '無料、アカウント不要。パソコンのMicrosoft Edgeで使えます。',
    stepOnly: '<strong>拡張機能を追加</strong>します（Microsoft Edge）。いつもどおりログインした状態でx.comを開きます。',
  },
  zh: {
    faqEdge: '电脑（Windows、macOS、Linux、ChromeOS）上的 Chrome、Microsoft Edge、Brave 和 Opera。Chrome、Brave 和 Opera 从 Chrome 网上应用店安装，Edge 从 Microsoft Edge 加载项安装。不支持 Firefox、Safari 和手机；在这些地方请使用网站。',
    faqOnly: '电脑（Windows、macOS、Linux）上的 Microsoft Edge，从 Microsoft Edge 加载项安装。不支持其他浏览器和手机；在这些地方请使用网站。',
    ctaPOnly: '免费，无需账号。适用于电脑上的 Microsoft Edge。',
    stepOnly: '<strong>把扩展添加到</strong> Microsoft Edge，像平常一样登录后打开 x.com。',
  },
  ar: {
    faqEdge: 'في Chrome وMicrosoft Edge وBrave وOpera على الكمبيوتر (Windows وmacOS وLinux وChromeOS). يثبّتها Chrome وBrave وOpera من متجر Chrome الإلكتروني، ويثبّتها Edge من إضافات Microsoft Edge. لا تعمل في Firefox أو Safari أو على الهواتف؛ استخدم الموقع هناك.',
    faqOnly: 'في Microsoft Edge على الكمبيوتر (Windows وmacOS وLinux)، وتُثبَّت من إضافات Microsoft Edge. لا تعمل في المتصفحات الأخرى أو على الهواتف؛ استخدم الموقع هناك.',
    ctaPOnly: 'مجانية ودون حساب. تعمل في Microsoft Edge على الكمبيوتر.',
    stepOnly: '<strong>أضف الإضافة</strong> إلى Microsoft Edge، وافتح x.com وأنت مسجّل الدخول كالمعتاد.',
  },
};

/** The page copy with its browser statements matching the listings that exist. */
function forListings(lang: Lang, c: ExtPageCopy): ExtPageCopy {
  const b = BROWSERS[lang];
  if (!chromeListed()) {
    return {
      ...c,
      bmSteps: [b.stepOnly, ...c.bmSteps.slice(1)],
      ctaP: b.ctaPOnly,
      faq: c.faq.map(f => (f.a.includes('Edge') ? { ...f, a: b.faqOnly } : f)),
    };
  }
  if (edgeListed()) return { ...c, faq: c.faq.map(f => (f.a.includes('Edge') ? { ...f, a: b.faqEdge } : f)) };
  return c;
}

const LANGS: Lang[] = ['en', 'tr', 'es', 'pt', 'ja', 'zh', 'ar'];

const fill = (html: string, lang: Lang) =>
  html.replace(/\{pro\}/g, proPath(lang)).replace(/\{privacy\}/g, PRIVACY_PATHS[lang]).replace(/\{saved\}/g, savedPath(lang));

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** A 1280×800 store screenshot (public/img/ext), 640 px for phones; fixed size, lazy. */
function shot(name: string, alt: string): string {
  return `<figure class="xt-ext-shot"><img src="/img/ext/${name}.webp" srcset="/img/ext/${name}-640.webp 640w, /img/ext/${name}.webp 1280w" sizes="(min-width: 50rem) 46rem, calc(100vw - 2.5rem)" width="1280" height="800" alt="${escAttr(alt)}" loading="lazy" decoding="async"><figcaption>${alt}</figcaption></figure>`;
}

function sections(lang: Lang, c: ExtPageCopy): string {
  const f = (s: string) => fill(s, lang);
  return `
<section>
  <p>${f(c.intro)}</p>
  <div class="xt-ext-actions">${extButtons(lang, 'page')}</div>
  <p class="xt-ext-note">${extNote(lang)}</p>
  ${extLoopVideo(lang)}
</section>

<section>
  <h2>${c.whatH2}</h2>
  <div class="xt-grid xt-grid-2">
    ${c.what.map(([h, p]) => `<div><h3>${h}</h3><p>${p}</p></div>`).join('\n    ')}
  </div>
</section>

<section>
  <h2>${c.bmH2}</h2>
  ${steps(c.bmSteps)}
  ${shot('3-bookmarks', c.bmShot)}
  <p>${f(c.bmAfter)}</p>
</section>

<section>
  <h2>${c.saveH2}</h2>
  <p>${c.saveP}</p>
  ${shot('1-save-menu', c.saveShot)}
  ${shot('2-pdf', c.pdfShot)}
</section>

<section>
  <h2>${c.goneH2}</h2>
  <p>${c.goneP}</p>
  ${shot('4-unavailable', c.goneShot)}
  <p>${f(c.goneP2)}</p>
  ${shot('5-saved', c.savedShot)}
</section>

<section>
  <h2>${c.privH2}</h2>
  <ul>${c.priv.map(li => `<li>${f(li)}</li>`).join('')}</ul>
</section>

<section>
  <h2>${c.plansH2}</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>${c.plansHead[0]}</th><th>${c.plansHead[1]}</th></tr></thead>
    <tbody>
      ${c.plans.map(([a, b, d]) => `<tr><td>${a}</td><td>${b}</td><td>${d}</td></tr>`).join('\n      ')}
    </tbody>
  </table></div>
  <p>${f(c.plansP)}</p>
</section>

<section class="xt-ext xt-ext-cta">
  <h2>${c.ctaH2}</h2>
  <p>${c.ctaP}</p>
  <div class="xt-ext-actions">${extButtons(lang, 'page')}</div>
</section>`;
}

export const extPageCopy = (lang: Lang): ExtPageCopy => COPY[lang];

/** All seven language versions (site/pages.ts adds them only while the store listing exists). */
export const extPages = (): SitePage[] =>
  LANGS.map(lang => {
    const c = forListings(lang, COPY[lang]);
    const path = EXT_PAGE_PATHS[lang];
    return {
      id: lang === 'en' ? 'chrome-extension' : `${lang}-chrome-extension`,
      group: 'chrome-extension',
      path,
      file: `${path.replace(/^\//, '')}.html`,
      lang,
      title: c.title,
      description: c.description,
      h1: c.h1,
      sub: c.sub,
      primary: 'pdf',
      nav: c.nav,
      sections: sections(lang, c),
      faq: c.faq,
    };
  });
