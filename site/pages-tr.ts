/** Turkish pages. */
import { EXAMPLE, GITHUB, privacy, shortcuts, steps, type SitePage } from './blocks';

const home: SitePage = {
  id: 'tr-home',
  group: 'home',
  path: '/tr/',
  file: 'tr/index.html',
  lang: 'tr',
  isHome: true,
  title: 'X Makale ve Flood İndir — PDF, Markdown, EPUB | Xtracticle',
  description:
    "X (Twitter) makale, flood ve gönderilerini PDF, Markdown, EPUB/Kindle veya metin olarak indirin. Linki yapıştırın, görselli dosyayı alın — ücretsiz, girişsiz.",
  h1: 'X Makale İndirici',
  sub: "X (Twitter) makalelerini, flood'larını ve gönderilerini PDF, Markdown, EPUB veya metin olarak indirin — ücretsiz, giriş gerektirmez.",
  primary: 'md',
  nav: 'X Makale İndirici',
  sections: `
<section>
  <h2>X makalesi nasıl indirilir?</h2>
  ${steps([
    '<strong>Gönderi linkini kopyalayın</strong> — X’te <em>Paylaş → Linki kopyala</em>. Flood’un herhangi bir tweeti olur.',
    '<strong>Yukarıya yapıştırın</strong> — Xtracticle makaleyi, flood’u veya gönderiyi birkaç saniyede getirir.',
    '<strong>Format seçin</strong> — PDF, Markdown, EPUB/Kindle, görselli ZIP veya düz metin.',
    '<strong>Hepsi bu</strong> — isterseniz kopyalayın, Obsidian’a gönderin veya sesli dinleyin.',
  ])}
  <p>Sonucu önce görmek mi istiyorsunuz? <a href="${EXAMPLE}">Örnek bir X makalesini açın</a>.</p>
</section>

<section>
  <h2>İhtiyacınız olan her format</h2>
  <div class="xt-grid">
    <div><h3><a href="/tr/x-makale-pdf">PDF</a></h3><p>A4, yazdırmaya hazır; görseller, kaynak linki ve sayfa numaraları dahil.</p></div>
    <div><h3><a href="/tr/x-makale-markdown">Markdown (.md)</a></h3><p>Başlıklar, kalın/italik, linkler, listeler, alıntılar ve görseller korunur. İsteğe bağlı YAML front-matter.</p></div>
    <div><h3><a href="/tr/x-makale-epub-kindle">EPUB / Kindle</a></h3><p>Uzun makaleleri Kindle, Kobo veya Apple Books’ta okuyun.</p></div>
    <div><h3><a href="/tr/x-makale-obsidian">Obsidian</a></h3><p>Tek tıkla kasanızda makalenin tamamını ve bilgilerini içeren yeni not açılır.</p></div>
    <div><h3>ZIP + görseller</h3><p>Markdown ve tüm görseller yerel olarak — gönderi silinse bile kalıcı arşiv.</p></div>
    <div><h3>Düz metin</h3><p>Her cihaz, betik veya yapay zekâ aracı için temiz .txt.</p></div>
  </div>
</section>

<section>
  <h2>Makaleler, flood’lar ve tekil gönderiler</h2>
  <p><strong>X Makaleleri</strong> (100.000 karaktere kadar uzun gönderiler) blok blok dönüştürülür: başlıklar, kalın, italik, üstü çizili,
  linkler, madde ve numaralı listeler, alıntılar, kod, ayraçlar, kapak görseli, görseller, videolar ve gömülü gönderiler.</p>
  <p><strong>Flood’lar</strong> otomatik birleştirilir. İlk, ortadaki ya da son tweeti yapıştırın — Xtracticle yazarın flood’unun tamamını bulur
  ve numaralı tek bir belgeye dönüştürür. Ayrıntılar için <a href="/tr/twitter-flood-pdf">flood’u PDF olarak indirme</a> sayfasına bakın.</p>
  <p><strong>Tekil gönderiler</strong> metnini, satır sonlarını, fotoğraflarını, videolarını ve alıntıladığı gönderiyi korur. Çok sayıda gönderi mi var?
  <em>Toplu mod</em>’a geçip 20 linke kadar yapıştırın, tek bir ZIP alın.</p>
  <p>Thread Reader App’ten mi geliyorsunuz? <a href="/tr/thread-reader-app-alternatifi">Ayrıntılı karşılaştırmaya</a> göz atın.</p>
</section>

${shortcuts('tr')}

${privacy('tr')}`,
  faq: [
    { q: 'Xtracticle ücretsiz mi?', a: 'Evet. Ücretsiz ve açık kaynak; hesap, giriş veya kullanım sınırı yok.' },
    { q: 'X makalesi PDF olarak nasıl indirilir?', a: 'Gönderi linkini kopyalayıp Xtracticle’a yapıştırın ve PDF’e tıklayın. PDF; başlık, yazar, tarih, kaynak linki, tüm görseller ve sayfa numaralarını içerir.' },
    { q: 'Flood’un tamamını indirebilir miyim?', a: 'Evet. Flood’un herhangi bir tweetinin linkini yapıştırın — ilk, orta veya son. Yazarın o flood’daki tüm tweetleri numaralı tek bir belgede birleştirilir.' },
    { q: 'X makalelerini Obsidian’a veya Notion’a kaydedebilir miyim?', a: 'Evet. Markdown dosyasını indirin veya Obsidian butonuna tıklayın. Notion .md dosyalarını doğrudan içe aktarır.' },
    { q: 'Neden “gönderi bulunamadı” diyor?', a: 'Gönderi silinmiş, gizli (korumalı) bir hesaba ait ya da yaş kısıtlamalı olabilir. Yalnızca herkese açık gönderiler indirilebilir.' },
    { q: 'Elimde x.com/i/article/… linki var, ne yapmalıyım?', a: 'Bu makale okuyucu linkidir. Makaleyi X’te açıp Paylaş → Linki kopyala diyerek gönderi linkini (x.com/kullanici/status/…) alın ve onu yapıştırın.' },
  ],
};

const pdf: SitePage = {
  id: 'tr-pdf',
  group: 'pdf',
  path: '/tr/x-makale-pdf',
  file: 'tr/x-makale-pdf.html',
  lang: 'tr',
  title: "X Makale PDF İndir — Tweet ve Makaleleri PDF'e Çevir | Xtracticle",
  description:
    "X (Twitter) makalelerini ve tweetleri görselli, kaynak linkli ve sayfa numaralı PDF olarak indirin. Ücretsiz, giriş yok; iPhone, Android ve bilgisayarda çalışır.",
  h1: 'X Makale PDF İndir',
  sub: "X (Twitter) makalelerini, flood'ları ve gönderileri temiz, yazdırmaya hazır PDF'e çevirin — görseller dahil, giriş gerekmez.",
  primary: 'pdf',
  nav: 'X Makale PDF',
  sections: `
<section>
  <h2>X makalesini üç adımda PDF’e çevirin</h2>
  ${steps([
    '<strong>Linki kopyalayın</strong> — X makalesinde <em>Paylaş → Linki kopyala</em>.',
    '<strong>Yukarıya yapıştırın</strong> ve <em>Çıkar</em>’a basın.',
    '<strong>PDF’e tıklayın</strong> — dosya anında iner.',
  ])}
</section>

<section>
  <h2>PDF’iniz nasıl görünür?</h2>
  <ul>
    <li><strong>Temiz A4 sayfa düzeni</strong> — X’in yan menüsü, butonları, yanıtları ve reklamları yok. Sadece makale.</li>
    <li><strong>En üstte başlık, yazar, tarih ve kaynak linki</strong> — PDF’i rahatça kaynak olarak gösterebilirsiniz.</li>
    <li><strong>Kapak ve metin içi görseller</strong> yerli yerinde, sayfaya sığacak şekilde ölçeklenir.</li>
    <li>Alt bilgide <strong>sayfa numaraları</strong> ve orijinal gönderiye giden tıklanabilir link.</li>
    <li><strong>Yarıda kesilen satır yok</strong> — çok uzun makalelerde bile sayfalar paragrafların ortasından değil, aralarından bölünür.</li>
  </ul>
</section>

<section>
  <h2>İpuçları</h2>
  <h3>Seçilebilir, aranabilir metin mi lazım?</h3>
  <p>PDF, kusursuz bir sayfa düzeni için bu şekilde oluşturulur. Metni işaretlemek veya içinde arama yapmak istiyorsanız
  <a href="/tr/x-makale-epub-kindle">EPUB</a> ya da <a href="/tr/x-makale-markdown">Markdown</a> çıktısını kullanın — veya sonuç ekranında
  <code>Ctrl/Cmd + P</code>’ye basıp <em>PDF olarak kaydet</em>’i seçin.</p>
  <h3>Flood’u PDF yapmak</h3>
  <p>Flood’un herhangi bir tweetini yapıştırın, flood’un tamamı tek bir PDF olsun. Ayrıntılar <a href="/tr/twitter-flood-pdf">Twitter flood PDF</a> sayfasında.</p>
  <h3>iPhone’da</h3>
  <p>PDF’e dokunun, ardından Safari’nin indirilenler listesinden dosyayı açıp <em>Paylaş → Dosyalar’a Kaydet</em>’i seçin ya da Kitaplar’a gönderin.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'X PDF dönüştürücü ücretsiz mi?', a: 'Evet, tamamen ücretsiz: filigran yok, giriş yok, sınır yok.' },
    { q: 'PDF’te görseller de var mı?', a: 'Evet. Kapak görseli ve metin içindeki tüm görseller dahil. Videolar, videoya linkli bir küçük resim olarak görünür.' },
    { q: 'Twitter flood’unu PDF’e çevirebilir miyim?', a: 'Evet. Flood’daki herhangi bir tweetin linkini yapıştırın; Xtracticle flood’un tamamını tek bir PDF’te birleştirir.' },
    { q: 'Telefonda çalışıyor mu?', a: 'Evet. iPhone, Android, Mac, Windows ve Linux’ta güncel her tarayıcıda çalışır.' },
    { q: 'Gizli veya silinmiş gönderileri dönüştürebilir miyim?', a: 'Hayır. Yalnızca hâlâ yayında olan herkese açık gönderiler dönüştürülebilir — PDF kopyası saklamak tam da bu yüzden işe yarar.' },
  ],
};

const markdown: SitePage = {
  id: 'tr-markdown',
  group: 'markdown',
  path: '/tr/x-makale-markdown',
  file: 'tr/x-makale-markdown.html',
  lang: 'tr',
  title: "X Makalesini Markdown'a Çevir — Tweet ve Flood'lar | Xtracticle",
  description:
    "X makalelerini, flood'ları ve tweetleri başlık, link, liste, görsel ve YAML front-matter ile temiz Markdown'a çevirin. Obsidian, Notion ve yapay zekâ için ideal.",
  h1: "X Makalesini Markdown'a Çevir",
  sub: "X (Twitter) makalelerini, flood'ları ve gönderileri temiz Markdown'a çevirin — biçimlendirme, linkler ve görseller korunur.",
  primary: 'md',
  nav: 'X Makale Markdown',
  sections: `
<section>
  <h2>Kopyala-yapıştır karmaşası değil, temiz Markdown</h2>
  <p>X Makaleleri zengin metin blokları olarak saklanır. Xtracticle her bloğu düzgün Markdown’a çevirir, böylece dosya her yerde doğru görünür:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>X’te</th><th>.md dosyanızda</th></tr></thead>
    <tbody>
      <tr><td>Başlık / Alt başlık</td><td><code>## Başlık</code> / <code>### Alt başlık</code></td></tr>
      <tr><td>Kalın, italik, üstü çizili</td><td><code>**kalın**</code>, <code>*italik*</code>, <code>~~üstü çizili~~</code></td></tr>
      <tr><td>Linkler</td><td><code>[metin](https://…)</code></td></tr>
      <tr><td>Madde / numaralı listeler (iç içe)</td><td><code>- öğe</code> / <code>1. öğe</code></td></tr>
      <tr><td>Alıntılar, kod, ayraçlar</td><td><code>&gt; alıntı</code>, kod bloğu, <code>---</code></td></tr>
      <tr><td>Görseller ve videolar</td><td><code>![açıklama](url)</code>, linkli video küçük resmi</td></tr>
      <tr><td>Gömülü gönderiler</td><td>Gömülü gönderiye link</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>YAML front-matter dahil</h2>
  <p>Her dosya, Obsidian (Özellikler), Hugo, Jekyll, Astro ve Dataview’in anladığı bilgilerle başlayabilir:</p>
  <pre><code>---
title: "Makalenin başlığı"
author: "Yazar Adı (@kullanici)"
source: "https://x.com/kullanici/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>İstemiyor musunuz? İndirme butonlarının altındaki <em>.md dosyasına YAML front-matter ekle</em> kutusunun işaretini kaldırın.</p>
</section>

<section>
  <h2>Nerelerde işinize yarar?</h2>
  <ul>
    <li><strong>Not almak</strong> — Obsidian, Logseq, Notion, Bear, Joplin ve tüm Markdown editörleri. <a href="/tr/x-makale-obsidian">Obsidian rehberine</a> göz atın.</li>
    <li><strong>Yapay zekâ araçları</strong> — Markdown; ChatGPT, Claude, Gemini veya NotebookLM için en temiz bağlamdır: yapıştırıp özetletin, çevirtin ya da soru sorun.</li>
    <li><strong>Yazmak ve yayınlamak</strong> — blog yazılarında, bültenlerde, dokümanlarda ve GitHub README’lerinde kaynak gösterin.</li>
    <li><strong>Arşivlemek</strong> — her görseli .md dosyasının yanında yerel olarak saklamak için <em>ZIP + görseller</em>’i indirin.</li>
  </ul>
</section>

${shortcuts('tr')}`,
  faq: [
    { q: 'Tweet Markdown’a nasıl çevrilir?', a: 'Gönderi linkini Xtracticle’a yapıştırıp Markdown’a tıklayın ya da Markdown’ı panoya almak için Kopyala’ya basın.' },
    { q: 'Görseller Markdown’a dahil mi?', a: 'Evet, görsel linki olarak. Tüm görselleri de indirmek ve Markdown’ın yerel kopyaları göstermesini istiyorsanız ZIP + görseller’i seçin.' },
    { q: 'Flood’ları da Markdown’a çeviriyor mu?', a: 'Evet. Flood’un herhangi bir tweetini yapıştırın; tüm tweetler numaralı tek bir Markdown belgesinde birleştirilir.' },
    { q: 'YAML front-matter’ı kapatabilir miyim?', a: 'Evet. İndirme butonlarının altındaki front-matter seçeneğinin işaretini kaldırın. Tercihiniz hatırlanır.' },
  ],
};

const thread: SitePage = {
  id: 'tr-thread',
  group: 'thread',
  path: '/tr/twitter-flood-pdf',
  file: 'tr/twitter-flood-pdf.html',
  lang: 'tr',
  title: "Twitter Flood PDF İndir — Flood'u Tek Dosyada Kaydet | Xtracticle",
  description:
    "Twitter flood'larını tek bir PDF, Markdown, EPUB veya metin dosyası olarak indirin. Flood'daki herhangi bir tweeti yapıştırın — bot yok, giriş yok, ücretsiz.",
  h1: 'Twitter Flood PDF İndir',
  sub: "X (Twitter) flood'larını tek ve temiz bir belgede birleştirin — PDF, Markdown, EPUB veya metin. Flood'un herhangi bir tweetini yapıştırmanız yeterli.",
  primary: 'pdf',
  nav: 'Flood PDF İndir',
  sections: `
<section>
  <h2>Flood’u saniyeler içinde birleştirin</h2>
  ${steps([
    '<strong>Flood’daki herhangi bir tweetin linkini kopyalayın</strong> — ilki, ortadan biri ya da sonuncusu.',
    '<strong>Yukarıya yapıştırın.</strong> Xtracticle yazarın o flood’da attığı tüm tweetleri bulur.',
    '<strong>İndirin</strong> — birleştirilmiş, numaralı flood’u PDF, Markdown, EPUB veya metin olarak.',
  ])}
</section>

<section>
  <h2>Flood birleştirme nasıl çalışır?</h2>
  <p>Flood, yazarın kendi tweetine art arda yanıt vererek oluşturduğu bir tweet zinciridir. Xtracticle bu zinciri okur ve yalnızca yazarın kendi
  tweetlerini sırasıyla alır — başkalarının yanıtları dahil edilmez. Her tweet numaralanır (<code>1/12</code>, <code>2/12</code>…) ve
  satır sonlarını, fotoğraflarını, videolarını ve alıntıladığı gönderileri korur.</p>
  <p>Flood’un altına bot etiketleyip yanıt beklemenize gerek yok: her şey burada, sizden başka kimse görmeden olur.</p>
</section>

<section>
  <h2>Flood’ları neden kaydetmeli?</h2>
  <ul>
    <li><strong>Rahat okuyun</strong> — tweet tweet kaydırmak yerine kesintisiz tek bir belge.</li>
    <li><strong>Sonsuza dek saklayın</strong> — flood’lar silinir, hesaplar gizliye alınır. PDF ya da <em>ZIP + görseller</em> kopyası sizde kalır.</li>
    <li><strong>Çalışın ve paylaşın</strong> — PDF’i ekibinize gönderin, yazdırın ya da Markdown’ı notlarınıza veya bir yapay zekâ asistanına verin.</li>
    <li><strong>E-okuyucunuzda</strong> — <a href="/tr/x-makale-epub-kindle">Kindle için EPUB</a> olarak dışa aktarın.</li>
  </ul>
</section>

${shortcuts('tr')}`,
  faq: [
    { q: 'Flood’un ilk tweetine ihtiyacım var mı?', a: 'Hayır. Flood’un herhangi bir tweetini yapıştırın, flood’un tamamı bir araya getirilir.' },
    { q: 'Başkalarının yanıtları da ekleniyor mu?', a: 'Hayır. Yalnızca yazarın o flood’daki kendi tweetleri, sırasıyla eklenir.' },
    { q: '@threadreaderapp gibi bir botu etiketlemem gerekiyor mu?', a: 'Hayır. Paylaşacağınız ya da etiketleyeceğiniz bir şey yok — linki yapıştırın ve indirin.' },
    { q: 'Gizli bir hesabın flood’unu indirebilir miyim?', a: 'Hayır. Yalnızca herkese açık flood’lara erişilebilir.' },
  ],
};

const epub: SitePage = {
  id: 'tr-epub',
  group: 'epub',
  path: '/tr/x-makale-epub-kindle',
  file: 'tr/x-makale-epub-kindle.html',
  lang: 'tr',
  title: "X Makale EPUB ve Kindle — Makaleleri E-Okuyucuda Okuyun | Xtracticle",
  description:
    "X (Twitter) makalelerini ve flood'ları EPUB'a çevirip Kindle, Kobo, Apple Books veya Google Play Kitaplar'a gönderin. Görseller dosyanın içinde, ücretsiz, giriş yok.",
  h1: "X Makalesini EPUB ve Kindle'a Aktar",
  sub: "Uzun X (Twitter) makalelerini ve flood'ları Kindle, Kobo veya Apple Books'ta okuyun — görselleriyle birlikte gerçek bir e-kitap olarak.",
  primary: 'epub',
  nav: 'X Makale Kindle / EPUB',
  sections: `
<section>
  <h2>X makalesini Kindle’ınıza gönderin</h2>
  ${steps([
    '<strong>Gönderi linkini yukarıya yapıştırın</strong> ve <em>Çıkar</em>’a basın.',
    '<strong>“EPUB / Kindle”a tıklayın</strong> ve e-kitabı indirin.',
    '<strong>Kindle’a gönderin</strong> — Send to Kindle uygulaması veya web sayfasıyla ya da Kindle e-posta adresinize göndererek.',
  ])}
</section>

<section>
  <h2>Ekran görüntüsü değil, gerçek bir e-kitap</h2>
  <ul>
    <li><strong>Akışkan metin</strong> — yazı tipini ve boyutunu cihazınızda değiştirin.</li>
    <li><strong>Görseller dosyanın içinde</strong>, böylece internetsiz de çalışır.</li>
    <li><strong>Meta veriler</strong> — başlık ve yazar kitaplığınızda doğru görünür.</li>
    <li><strong>Standart EPUB 3</strong> — Kindle (Send to Kindle ile), Kobo, Apple Books, Google Play Kitaplar, PocketBook ve Calibre ile uyumlu.</li>
  </ul>
</section>

<section>
  <h2>Uzun okumalar için ideal</h2>
  <p>X Makaleleri 100.000 karaktere kadar uzayabilir, flood’lar onlarca tweet sürebilir. Bunları e-mürekkep ekranda okumak gözü yormaz,
  dikkatinizi dağıtmaz ve bağlantı olmadan da çalışır. Uçuştan önce birkaç tane kaydedin ya da hafta sonu için bir okuma listesi hazırlayın.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'Kindle EPUB’u destekliyor mu?', a: 'Evet. Amazon’un Send to Kindle hizmeti EPUB dosyalarını kabul eder ve cihazınız için otomatik olarak dönüştürür.' },
    { q: 'Apple Books’ta okuyabilir miyim?', a: 'Evet. İndirdiğiniz .epub dosyasını iPhone, iPad veya Mac’inizde açıp Kitaplar’ı seçin.' },
    { q: 'Görseller dahil mi?', a: 'Evet, görseller EPUB’un içine gömülür. Videolar link olarak eklenir.' },
    { q: 'Flood’u EPUB’a çevirebilir miyim?', a: 'Evet. Flood’un herhangi bir tweetini yapıştırın, flood’un tamamı tek bir e-kitap olur.' },
  ],
};

const obsidian: SitePage = {
  id: 'tr-obsidian',
  group: 'obsidian',
  path: '/tr/x-makale-obsidian',
  file: 'tr/x-makale-obsidian.html',
  lang: 'tr',
  title: "X Makalelerini ve Flood'ları Obsidian'a Kaydet — Tek Tık | Xtracticle",
  description:
    "X (Twitter) makalelerini ve flood'ları Obsidian'a yazar, kaynak, tarih ve etiket özellikleriyle temiz Markdown olarak kaydedin. Tek tık, ücretsiz, açık kaynak.",
  h1: "X Makalelerini Obsidian'a Kaydet",
  sub: "X (Twitter) makalelerini ve flood'ları Obsidian kasanıza özellikleriyle birlikte temiz Markdown olarak kaydedin — tek tıkla.",
  primary: 'obsidian',
  nav: "X'ten Obsidian'a",
  sections: `
<section>
  <h2>X’ten kasanıza</h2>
  ${steps([
    '<strong>Gönderi linkini yukarıya yapıştırın</strong> ve <em>Çıkar</em>’a basın.',
    '<strong>“Obsidian”a tıklayın.</strong> Markdown kopyalanır ve Obsidian bu içerikle yeni bir not açar.',
    '<strong>Hepsi bu</strong> — başlık, yazar, kaynak, tarihler ve etiketler not özelliklerinde hazır.',
  ])}
  <p>Dosya mı tercih edersiniz? <strong>Markdown</strong>’ı indirip kasanıza bırakın ya da görselleri notun yanındaki bir <code>images/</code> klasöründe çevrimdışı saklamak için <strong>ZIP + görseller</strong>’i indirin.</p>
</section>

<section>
  <h2>Sorgulayabileceğiniz özellikler</h2>
  <p>Her not <code>title</code>, <code>author</code>, <code>source</code>, <code>published</code>, <code>saved</code>, <code>type</code> (article, thread veya post) ve <code>tags</code> özelliklerini alır.
  Dataview ile X’ten kaydettiğiniz her şeyi listeleyebilirsiniz:</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>Neden bir web clipper değil?</h2>
  <p>Genel amaçlı clipper’lar X’te zorlanır: sayfa giriş ister, içerik dinamik olarak yüklenir ve flood’lar onlarca tweete bölünmüştür.
  Xtracticle gönderi verisini doğrudan okur; böylece X Makaleleri başlıklarını ve listelerini korur, flood’lar da tek bir not olarak gelir.</p>
</section>

${shortcuts('tr')}`,
  faq: [
    { q: 'Obsidian’a tıklayınca hiçbir şey olmuyor.', a: 'Bu cihazda Obsidian yüklü olmalı. Markdown ayrıca panonuza da kopyalanır, dolayısıyla istediğiniz nota yapıştırabilirsiniz.' },
    { q: 'iPhone veya Android’deki Obsidian ile çalışıyor mu?', a: 'Evet, Obsidian uygulaması yüklüyse. Değilse Kopyala’yı kullanın ya da .md dosyasını indirin.' },
    { q: 'Görselleri kasamın içinde nasıl tutarım?', a: 'ZIP + görseller’i indirip kasanıza çıkarın. Markdown’daki linkler yerel görsel klasörünü gösterir.' },
    { q: 'Logseq, Notion veya Bear ile çalışıyor mu?', a: 'Evet — Markdown’ı indirin ya da kopyalayın, sonra içe aktarın veya yapıştırın.' },
  ],
};

const alternative: SitePage = {
  id: 'tr-tra',
  group: 'tra',
  path: '/tr/thread-reader-app-alternatifi',
  file: 'tr/thread-reader-app-alternatifi.html',
  lang: 'tr',
  title: 'Ücretsiz Thread Reader App Alternatifi — PDF, X Makale | Xtracticle',
  description:
    "Thread Reader App alternatifi mi arıyorsunuz? Xtracticle flood'ları ve X makalelerini ücretsiz PDF, Markdown, EPUB veya metin olarak indirir. Bot, reklam, giriş yok.",
  h1: 'Ücretsiz Thread Reader App Alternatifi',
  sub: "X flood'larını birleştirin, X makalelerini PDF, Markdown, EPUB veya metin olarak kaydedin — ücretsiz, bot etiketlemek yok, reklam yok, giriş yok.",
  primary: 'pdf',
  nav: 'Thread Reader App alternatifi',
  sections: `
<section>
  <h2>İnsanlar neden alternatif arıyor?</h2>
  <p><a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a>, flood birleştirmenin bilinen bir yoludur:
  flood’un altına <code>@threadreaderapp unroll</code> yazarak botu etiketlersiniz ya da linki sitesine yapıştırırsınız. Okumak için gayet iyi çalışır.
  Sorun, okuduğunuzu <strong>saklamak</strong> istediğinizde başlar:</p>
  <ul>
    <li><strong>PDF indirme Premium bir özellik</strong> (bu yazı hazırlanırken aylık 3 $ veya yıllık 30 $).</li>
    <li><strong>X Makaleleri desteklenmiyor</strong> — yardım sayfalarına göre X API’si Makale içeriğine erişim sağlamıyor.</li>
    <li><strong>Ücretsiz sürüm reklam gösteriyor</strong> ve Markdown, EPUB ya da Obsidian’a aktarma yok.</li>
  </ul>
  <p>Xtracticle tam olarak bu kısma odaklanır: flood’ları ve uzun X Makalelerini size ait dosyalara dönüştürmek — ücretsiz.</p>
</section>

<section>
  <h2>Yan yana karşılaştırma</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>Flood birleştirme</td><td>✅ Flood’un herhangi bir tweetini yapıştırın</td><td>✅ Botu etiketleyin veya link yapıştırın</td></tr>
      <tr><td>X Makaleleri (uzun içerik)</td><td>✅ Başlıklar, listeler, görseller, videolar</td><td>❌ Desteklenmiyor</td></tr>
      <tr><td>PDF</td><td>✅ Ücretsiz</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ Ücretsiz, YAML front-matter ile</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ Ücretsiz</td><td>❌</td></tr>
      <tr><td>Görselli ZIP (çevrimdışı arşiv)</td><td>✅ Ücretsiz</td><td>❌</td></tr>
      <tr><td>Toplu indirme</td><td>✅ 20 linke kadar</td><td>❌</td></tr>
      <tr><td>Reklam</td><td>Yok</td><td>Ücretsiz planda var</td></tr>
      <tr><td>Herkese açık paylaşım / bot etiketleme</td><td>Hiç gerekmez</td><td>Bot yönteminde gerekir</td></tr>
      <tr><td>Yazar bildirimleri ve otomatik arşivleme</td><td>❌ Henüz yok</td><td>✅ Premium</td></tr>
      <tr><td>Açık kaynak</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>Thread Reader App’in <a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a> ve
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">Yardım</a> sayfalarıyla Eylül 2026’da karşılaştırıldı. Özellikler değişebilir —
  güncel olmayan bir bilgi görürseniz <a href="${GITHUB}/issues" rel="noopener">GitHub</a> üzerinden bize bildirin.</small></p>
</section>

<section>
  <h2>Geçiş on saniye sürer</h2>
  ${steps([
    '<strong>Flood’daki herhangi bir tweetin linkini kopyalayın</strong> — ilk tweeti aramanıza gerek yok.',
    '<strong>Yukarıya yapıştırın</strong> ve <em>Çıkar</em>’a basın. Flood’un tamamı birleştirilir ve numaralanır.',
    '<strong>İndirin</strong> — PDF, Markdown, EPUB veya metin olarak ya da Obsidian’a gönderin.',
  ])}
</section>

<section>
  <h2>Thread Reader App’in hâlâ daha iyi olduğu durumlar</h2>
  <p>Bir flood’u <strong>doğrudan X’in içinde başkaları için birleştirmek</strong> (botla yanıt verip sohbetteki herkesin okunabilir bir link almasını sağlamak)
  ya da sevdiğiniz yazarlar için <strong>otomatik bildirim ve arşiv</strong> almak istiyorsanız, bunları Thread Reader App yapar, Xtracticle yapmaz.
  Pek çok kişi ikisini birlikte kullanır: anında okumak için Thread Reader App, kopyasını saklamak için Xtracticle.</p>
</section>

${shortcuts('tr')}`,
  faq: [
    { q: 'Xtracticle gerçekten ücretsiz mi?', a: 'Evet. Tüm formatlar — PDF, Markdown, EPUB, ZIP ve metin — ücretsiz; reklam, giriş veya kullanım sınırı yok. Kodu açık kaynak.' },
    { q: 'Xtracticle X Makalelerini indirebiliyor mu?', a: 'Evet. Xtracticle, X’in uzun Makalelerini başlıkları, listeleri, linkleri, görselleri ve videolarıyla dönüştürür. Thread Reader App’ten en temel farklarından biri budur.' },
    { q: 'Bir botu etiketlemem gerekiyor mu?', a: 'Hayır. Linki Xtracticle’a yapıştırın; X’te hiçbir şey paylaşılmaz.' },
    { q: 'Thread Reader App arşivimi aktarabilir miyim?', a: 'Doğrudan değil. Orijinal X linklerini yapıştırarak (Toplu mod’da tek seferde 20’ye kadar) bunları Markdown dosyaları olarak yeniden oluşturabilirsiniz.' },
  ],
};

export const PAGES_TR: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];
