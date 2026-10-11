/** Turkish: unroll, tweet-to-PDF, MCP server and privacy pages. */
import { GITHUB, privacy, samplePdfFigure, shortcuts, steps, type SitePage } from '../../blocks';

const unroll: SitePage = {
  id: 'tr-unroll',
  group: 'unroll',
  path: '/tr/twitter-flood-okuma',
  file: 'tr/twitter-flood-okuma.html',
  lang: 'tr',
  title: 'Twitter Flood Okuma — Flood’u Tek Sayfada Oku | Xtracticle',  description:
    'Twitter/X flood’unu tek temiz sayfada birleştirip okuyun. Herhangi bir gönderinin linkini yapıştırın: bot ve giriş yok. Sonra PDF, Markdown veya EPUB yapın.',
  h1: 'Twitter Flood Okuma ve Birleştirme',
  sub: 'Herhangi bir X (Twitter) flood’unu tek temiz sayfada okuyun. Flood’daki herhangi bir gönderinin linkini yapıştırmanız yeterli — bot yok, giriş yok.',
  primary: 'md',
  nav: 'Twitter Flood Okuma',
  sections: `
<section>
  <p><strong>Xtracticle, Twitter (X) flood’unu birleştirip okumanızı sağlayan ücretsiz bir araçtır:</strong> flood’daki herhangi bir gönderinin
  linkini yapıştırın, yazarın tüm flood’u altta numaralı ve kesintisiz tek bir sayfa olarak hemen açılsın. Kaydetmek isteğe bağlıdır —
  hesap yok, reklam yok, kimseye bildirim gitmez.</p>
  <h2>Flood’u üç adımda birleştirin</h2>
  ${steps([
    '<strong>Linki kopyalayın</strong> — flood’daki herhangi bir gönderinin linkini alın: ilki, ortadan biri ya da sonuncusu olur (Paylaş → Linki kopyala).',
    '<strong>Yukarıya yapıştırın</strong> ve <em>Çıkar</em>’a basın. Flood sırasıyla tek sayfada açılır.',
    '<strong>Burada okuyun</strong>, sesli dinlemek için <em>Dinle</em>’ye basın ya da Markdown, PDF, EPUB veya metin olarak indirin.',
  ])}
</section>

<section>
  <h2>Burada “flood birleştirme” ne demek?</h2>
  <p>Flood, yazarın kendi gönderisine art arda yanıt vererek oluşturduğu bir gönderi zinciridir. X’te bunu kaydırarak okumak, her gönderiyi tek tek
  yüklemek, başkalarının yanıtlarını atlamak ve kaldığınız yeri kaybetmek demektir. Flood birleştirme, yazarın gönderilerini numaralı
  (<code>1/12</code>, <code>2/12</code>…) tek bir belgede toplar; satır sonlarını, fotoğrafları, alıntılanan gönderileri ve video küçük resimlerini korur.</p>
  <ul>
    <li><strong>Herhangi bir gönderi yeter.</strong> İlkini bulmanız gerekmez; elinizdekini yapıştırın.</li>
    <li><strong>Yalnızca yazarın gönderileri.</strong> Başkalarının yanıtları dahil edilmez.</li>
    <li><strong>Pek çok link türü.</strong> x.com, twitter.com, fxtwitter, vxtwitter, nitter ve xcancel linkleri, <code>/i/web/status/</code> linkleri ve çıplak gönderi ID’leri çalışır.</li>
    <li><strong>Yalnızca herkese açık flood’lar.</strong> Gizli hesapların gönderileri okunamaz.</li>
  </ul>
</section>

<section>
  <h2>Bot etiketlemeden flood okuma</h2>
  <p>Flood birleştirmenin klasik yolu, flood’un altına <em>@threadreaderapp unroll</em> yazıp yanıt beklemektir. Bu yöntemin gerçek avantajları var;
  örneğin başkalarının da bulabileceği paylaşılabilir bir sayfa oluşur. Yine de bilmeniz gereken bedelleri de var:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Bot etiketleme</th><th>Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Hız</td><td>Botun yanıtını beklersiniz</td><td>Yapıştırdığınız anda</td></tr>
      <tr><td>Görünürlük</td><td>İsteğiniz herkese açık bir yanıt olur</td><td>Hiçbir şey paylaşılmaz; özel kalır</td></tr>
      <tr><td>Hesap</td><td>Botu etiketlemek için X hesabı gerekir</td><td>Giriş yok</td></tr>
      <tr><td>Formatlar</td><td>Web sayfası</td><td>Sayfa, PDF, Markdown, EPUB, metin, ZIP</td></tr>
      <tr><td>Başkaları için herkese açık sayfa</td><td>Var, paylaşılan bir URL</td><td>Yok; dosyayı ya da linki siz paylaşırsınız</td></tr>
    </tbody>
  </table></div>
  <p>Daha uzun ve dürüst karşılaştırma için <a href="/tr/thread-reader-app-alternatifi">Thread Reader App alternatifi</a> sayfasına bakın.</p>
</section>

<section>
  <h2>Önce okuyun, sonra saklayın</h2>
  <p>Flood birleştirme okumak içindir, ama flood’lar sonsuza dek durmaz: yazarlar gönderileri siler, hesaplar gizliye alınır. Flood ekranda açıkken
  size uygun formatta bir kopyasını kaydedebilirsiniz.</p>
  <ul>
    <li><a href="/tr/twitter-flood-pdf">Flood’u PDF yap</a> — fotoğrafları, kaynak linki ve sayfa numaraları olan numaralı, yazdırılabilir bir belge. PDF görsel tabanlıdır; içindeki metin seçilemez.</li>
    <li><a href="/tr/x-makale-markdown">Markdown</a> — seçilebilir metin ve isteğe bağlı YAML front-matter; Obsidian, Notion veya yapay zekâ asistanı için.</li>
    <li><a href="/tr/x-makale-epub-kindle">EPUB 3</a> — e-okuyucunuz için akışkan bir e-kitap.</li>
    <li><strong>Görselli ZIP</strong> — Markdown ve tüm görseller yerel olarak.</li>
    <li><strong>Düz metin</strong> ya da Obsidian’a tek tıkla aktarma.</li>
  </ul>
  <p>Bir yığın flood mu var? Toplu moda geçin, 20 linke kadar yapıştırın ve Markdown dosyalarından oluşan tek bir ZIP alın.</p>
  <p>Flood değil de X Makalesi mi arıyorsunuz? <a href="/tr/x-makale-pdf">X Makale PDF İndir</a> sayfasına gidin. Araç <a href="/tr/">ana sayfada</a> da var, yaygın kullanımlar ise <a href="/tr/rehberler">rehberlerde</a> anlatılıyor.</p>
</section>

${shortcuts('tr')}

${privacy('tr')}`,
  faq: [
    { q: 'Twitter flood’u nasıl birleştirip okurum?', a: 'Flood’daki herhangi bir gönderinin linkini kopyalayın, Xtracticle’a yapıştırın ve Çıkar’a basın. Flood’un tamamı numaralı tek sayfa olarak açılır.' },
    { q: 'Flood’un ilk gönderisine ihtiyacım var mı?', a: 'Hayır. İlk, ortadaki ya da son gönderi — hangisini yapıştırırsanız yapıştırın, Xtracticle yazarın flood’unun geri kalanını bulur.' },
    { q: '@threadreaderapp gibi bir botu etiketlemem gerekiyor mu?', a: 'Hayır. Hiçbir şey paylaşılmaz ya da etiketlenmez. Linki yapıştırır, sonucu hesapsız ve anında okursunuz.' },
    { q: 'Başkalarının yanıtları da dahil mi?', a: 'Hayır. Flood’da yalnızca yazarın kendi gönderileri, sırasıyla birleştirilir.' },
    { q: 'Flood’u okumak yerine dinleyebilir miyim?', a: 'Evet. Dinle düğmesiyle flood’un sesli okunmasını sağlayabilirsiniz.' },
    { q: 'Birleştirdiğim flood’u sonradan kaydedebilir miyim?', a: 'Evet; PDF, Markdown (isteğe bağlı YAML front-matter ile), EPUB, düz metin veya görselli ZIP olarak. Toplu mod 20 linke kadar alır ve Markdown dosyalarından oluşan tek bir ZIP verir.' },
    { q: 'Gizli hesaplarda çalışıyor mu?', a: 'Hayır. Yalnızca herkese açık flood’lar birleştirilebilir.' },
  ],
};

const tweetpdf: SitePage = {
  id: 'tr-tweetpdf',
  group: 'tweetpdf',
  path: '/tr/tweet-pdf',
  file: 'tr/tweet-pdf.html',
  lang: 'tr',
  title: 'Tweet PDF Yap — X Gönderisini PDF Olarak Kaydet | Xtracticle',
  description:
    'Herhangi bir tweet’i ya da X gönderisini fotoğrafları, alıntısı, tarihi ve kaynak linkiyle temiz bir A4 PDF olarak kaydedin. Ücretsiz, girişsiz, filigransız.',
  h1: 'Tweet PDF Yap',
  sub: 'Herhangi bir X (Twitter) gönderisini temiz bir A4 PDF olarak kaydedin — metin, fotoğraflar, alıntılanan gönderi, tarih ve kaynak linki dahil.',
  primary: 'pdf',
  nav: 'Tweet PDF',
  sections: `
<section>
  <p><strong>Xtracticle, ücretsiz bir tweet PDF dönüştürücüsüdür:</strong> tek bir X (Twitter) gönderisinin linkini yapıştırın,
  düzenli bir A4 PDF olarak indirin — ekran görüntüsü yok, hesap yok, filigran yok. iPhone, Android ve bilgisayarda çalışır.</p>
  <h2>Tweet’i üç adımda PDF olarak kaydedin</h2>
  ${steps([
    '<strong>Gönderi linkini kopyalayın</strong> (Paylaş → Linki kopyala). x.com, twitter.com, fxtwitter, vxtwitter, nitter ve xcancel linkleri çalışır; çıplak gönderi ID’si de olur.',
    '<strong>Yukarıya yapıştırın</strong> ve <em>Çıkar</em>’a basın.',
    '<strong>PDF’e tıklayın</strong> — dosya anında iner.',
  ])}
</section>

<section>
  <h2>PDF’in içinde neler var?</h2>
  <ul>
    <li><strong>Metnin tamamı</strong>, yazarın orijinal satır sonlarıyla.</li>
    <li><strong>Fotoğraflar</strong> yerli yerinde, sayfaya sığacak şekilde ölçeklenmiş.</li>
    <li><strong>Alıntılanan gönderi</strong>, tweet başka bir gönderiyi alıntılıyorsa.</li>
    <li><strong>Yazar ve tarih</strong> en üstte.</li>
    <li>Orijinal gönderiye giden <strong>tıklanabilir kaynak linki</strong> ve sayfa numaraları.</li>
    <li><strong>Videolar linkli küçük resim olarak</strong>, çünkü PDF video oynatamaz.</li>
  </ul>
  <p>Sayfa temiz bir A4’tür — X’in yan menüsü, düğmeleri, gündem başlıkları ve yanıtlar yok.</p>
  ${samplePdfFigure('tr')}
  <p>PDF görsel tabanlıdır; bu, sayfa düzenini birebir korur ama metnin seçilemeyeceği anlamına gelir. Metinde arama yapmak veya metni
  kopyalamak istiyorsanız bunun yerine <a href="/tr/x-makale-markdown">Markdown</a> ya da <a href="/tr/x-makale-epub-kindle">EPUB</a> çıktısını alın.</p>
</section>

<section>
  <h2>Tweet’i neden PDF olarak kaydetmeli?</h2>
  <ul>
    <li><strong>Kanıt ve onaylar</strong> — bir şirketin iade, gecikme veya söz hakkındaki herkese açık açıklaması.</li>
    <li><strong>Duyurular</strong> — sürüm notları, iş ilanları, etkinlik ayrıntıları ve saklamak istediğiniz politika değişiklikleri.</li>
    <li><strong>Delil ve kaynak gösterme</strong> — kaynak linkli, tarihli bir kopya; kırpılmış bir ekran görüntüsünden başkasına vermesi daha kolaydır.</li>
    <li><strong>Araştırma notları</strong> — gönderiyi yazarı ve tarihiyle birlikte kaynaklarınızın yanına arşivleyin.</li>
  </ul>
  <p>PDF’in, gönderiyi kaydettiğiniz andaki içeriğin kaydı olduğunu unutmayın. Hukuken onaylı bir belge değildir.</p>
</section>

<section>
  <h2>Gönderiler, flood’lar ve Makaleler</h2>
  <h3>Tek bir tweet</h3>
  <p>Burası tam olarak o sayfa. Bir link, bir PDF.</p>
  <h3>Flood</h3>
  <p>Gönderi bir flood’un parçasıysa <a href="/tr/twitter-flood-pdf">flood PDF</a> sayfasını kullanın. Flood’daki herhangi bir gönderiyi yapıştırın,
  yazarın tüm gönderileri numaralı tek bir PDF’te birleşsin. Flood’u önce ekranda okumak için
  <a href="/tr/twitter-flood-okuma">Twitter flood okuma</a> sayfasına bakın.</p>
  <h3>Uzun bir Makale</h3>
  <p>X Makaleleri başlıklarını, listelerini ve metin içi görsellerini korur. <a href="/tr/x-makale-pdf">X Makale PDF İndir</a> sayfasını kullanın.</p>
</section>

<section>
  <h2>Silinmiş gönderiler</h2>
  <p>Xtracticle, hâlâ yayında olan herkese açık gönderileri okur. Bir gönderi silinmişse ya da hesabı gizliye alınmışsa sonradan
  kaydedilemez. Kopyayı gönderi yayındayken almanın nedeni de budur. <a href="/tr/rehberler/silinen-tweetler-geri-getirilir-mi">Neyin geri getirilip neyin getirilemeyeceğini</a> okuyun.
  Birden fazla gönderi mi lazım? Toplu mod 20 linke kadar alır ve Markdown dosyalarından oluşan tek bir ZIP verir. Araç <a href="/tr/">ana sayfada</a>,
  daha fazla kullanım için <a href="/tr/rehberler">rehberler</a> var.</p>
</section>

${shortcuts('tr')}

${privacy('tr')}`,
  faq: [
    { q: 'Tweet’i PDF olarak nasıl kaydederim?', a: 'Gönderi linkini kopyalayın (Paylaş → Linki kopyala), Xtracticle’a yapıştırın, Çıkar’a basın ve PDF’e tıklayın.' },
    { q: 'PDF’te fotoğraflar ve alıntılanan gönderi de var mı?', a: 'Evet. Fotoğraflar ve alıntılanan gönderi dahildir. Videolar, videoya linkli bir küçük resim olarak görünür.' },
    { q: 'Tweet PDF dönüştürücü ücretsiz mi?', a: 'Evet. Ücretsiz, giriş gerektirmez ve filigran eklemez.' },
    { q: 'PDF’teki metni seçebilir veya içinde arama yapabilir miyim?', a: 'Hayır. PDF, sayfa düzenini birebir korumak için görsel tabanlıdır. Seçilebilir metin lazımsa Markdown veya EPUB çıktısını kullanın.' },
    { q: 'Daha önce silinmiş bir tweet’i kaydedebilir miyim?', a: 'Hayır. Yalnızca hâlâ yayında olan herkese açık gönderiler kaydedilebilir; bu yüzden kopyayı gönderi kaybolmadan alın.' },
    { q: 'Flood’lar ve uzun Makaleler ne olacak?', a: 'Flood’lar için yazarın flood’unun tamamını birleştiren flood PDF sayfasını kullanın. Uzun Makaleler için X Makale PDF İndir sayfasına bakın.' },
    { q: 'Birden fazla tweet’i aynı anda kaydedebilir miyim?', a: 'Evet. Toplu mod 20 linke kadar kabul eder ve bunları tek bir ZIP içinde Markdown dosyaları olarak verir. PDF için her gönderiyi ayrı ayrı kaydedin.' },
  ],
};

const ENDPOINT = 'https://xtracticle.com/mcp';
const CURSOR_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=xtracticle&config=${btoa(JSON.stringify({ url: ENDPOINT }))}`;
const SAMPLE_ID = '1765884209527394325';

const code = (s: string) => `<pre><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

const mcp: SitePage = {
  id: 'tr-mcp',
  group: 'mcp',
  path: '/tr/mcp-sunucusu',
  file: 'tr/mcp-sunucusu.html',
  lang: 'tr',
  title: 'X MCP Sunucusu — X Makalelerini Yapay Zekâda Oku | Xtracticle',
  description:
    'Claude, ChatGPT ve Cursor gibi asistanların X (Twitter) makale, flood ve gönderilerini Markdown okumasını sağlayan ücretsiz MCP sunucusu. API anahtarı yok.',
  h1: 'X Makaleleri ve flood’lar için MCP sunucusu',
  sub: 'Yapay zekâ asistanınız herkese açık her X (Twitter) gönderisini, flood’unu veya makalesini temiz Markdown olarak okusun — ücretsiz, API anahtarı yok.',
  primary: 'md',
  nav: 'MCP sunucusu',
  sections: `
<section>
  <p><strong>Yapay zekâ asistanları X linklerini açamaz</strong> — sayfa JavaScript ve çoğu zaman giriş ister. Xtracticle’ın MCP sunucusu
  bunu çözer: Claude, ChatGPT, Cursor veya başka bir MCP istemcisine tek bir URL ekleyin, sonra sohbete bir X linki yapıştırmanız yeterli.</p>
  <ul>
    <li><strong>Endpoint:</strong> <code>${ENDPOINT}</code> (Streamable HTTP, kimlik doğrulama yok)</li>
    <li><strong>Araç:</strong> <code>read_x_post</code> — bir gönderiyi, yazarın flood’unun tamamını (herhangi bir gönderisinden) ya da bir X Makalesini Markdown olarak verir</li>
    <li><strong>Ücretsiz ve açık kaynak</strong> — sunucu <a href="${GITHUB}" rel="noopener">Xtracticle deposunun</a> bir parçasıdır</li>
  </ul>
</section>

<section>
  <h2>Yapay zekâ asistanınıza ekleyin</h2>
  <h3>Claude Code</h3>
  ${code(`claude mcp add --transport http xtracticle ${ENDPOINT}`)}
  <h3>Claude (masaüstü ve web)</h3>
  <p><em>Settings → Connectors → Add custom connector</em> yolunu açın, adını <em>Xtracticle</em> yapın ve <code>${ENDPOINT}</code> adresini yapıştırın.</p>
  <h3>ChatGPT</h3>
  <p>Geliştirici modu açıkken <em>Settings → Connectors → Create</em> yolunu açın, <code>${ENDPOINT}</code> adresini yapıştırın ve <em>No authentication</em> seçin.</p>
  <h3>Cursor</h3>
  <p><a href="${CURSOR_LINK}">Cursor’a ekleyin</a> ya da şunu <code>~/.cursor/mcp.json</code> dosyasına yazın:</p>
  ${code(`{
  "mcpServers": {
    "xtracticle": { "url": "${ENDPOINT}" }
  }
}`)}
  <h3>VS Code (GitHub Copilot)</h3>
  <p><code>.vscode/mcp.json</code> dosyasına ekleyin:</p>
  ${code(`{
  "servers": {
    "xtracticle": { "type": "http", "url": "${ENDPOINT}" }
  }
}`)}
  <h3>Diğer istemciler</h3>
  <p>Streamable HTTP üzerinden uzak MCP sunucularını destekleyen her istemci çalışır. Yalnızca yerel (stdio) sunucuları destekleyen istemciler bir köprü kullanabilir:</p>
  ${code(`npx -y mcp-remote ${ENDPOINT}`)}
</section>

<section>
  <h2>read_x_post aracı</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Argüman</th><th>Varsayılan</th><th>Ne yapar?</th></tr></thead>
    <tbody>
      <tr><td><code>url</code></td><td>—</td><td>Gönderi linki (x.com, twitter.com, fxtwitter, nitter…) veya sayısal gönderi ID’si. Flood’un herhangi bir gönderisi olur.</td></tr>
      <tr><td><code>format</code></td><td><code>markdown</code></td><td><code>markdown</code> veya <code>text</code></td></tr>
      <tr><td><code>include_thread</code></td><td><code>true</code></td><td>Yazarın flood’unu birleştirir; <code>false</code> yalnızca linkteki gönderiyi döndürür</td></tr>
      <tr><td><code>front_matter</code></td><td><code>false</code></td><td>Başa YAML front-matter ekler (başlık, yazar, kaynak, tarih, tür)</td></tr>
      <tr><td><code>max_chars</code> / <code>offset</code></td><td>40.000 / 0</td><td>Çok uzun belgeleri sayfa sayfa okur</td></tr>
    </tbody>
  </table></div>
  <p>Sonuç, önce başlık, yazar, tarih ve kaynak linki gelen Markdown’dır; yanında şu meta veriler bulunur: tür (makale, flood veya gönderi),
  kelime sayısı, okuma süresi, görsel URL’leri, orijinal link ve kullanıcının gönderiyi PDF, EPUB veya Markdown olarak kaydedebileceği bir indirme linki.
  Asistanınızdan isteyebileceğiniz şeyler:</p>
  <ul>
    <li>“Bu X makalesini beş maddede özetle: https://x.com/…/status/…”</li>
    <li>“Bu flood’u oku ve önerdiği tüm araçları linkleriyle listele.”</li>
    <li>“Bu X Makalesini İngilizceye çevir ve başlıkları koru.”</li>
  </ul>
</section>

<section>
  <h2>MCP yok mu? Markdown API’sini kullanın</h2>
  <p>Aynı dönüşüm tek bir HTTP GET isteği uzağınızda — betikler, RAG hatları ve URL çekebilen ajanlar için kullanışlı:</p>
  ${code(`curl https://xtracticle.com/api/markdown/${SAMPLE_ID}
curl "https://xtracticle.com/api/markdown/${SAMPLE_ID}?format=text&thread=0&front_matter=1"`)}
  <p>Parametreler: <code>format=markdown|text</code>, <code>thread=0|1</code> (varsayılan 1), <code>front_matter=0|1</code> (varsayılan 0).
  Yanıtlar <code>text/markdown</code> türündedir, en fazla bir saat önbelleğe alınır ve CORS açıktır.</p>
</section>

<section>
  <h2>Sınırlar ve gizlilik</h2>
  <ul>
    <li>Yalnızca <strong>herkese açık</strong> gönderiler okunabilir — silinmiş, korumalı veya yaş kısıtlamalı olanlar okunamaz.</li>
    <li>Lütfen ölçülü kullanın: bağlantı başına dakikada yaklaşık 20 istek ve tüm kullanıcılar için ortak bir sınır var. Bu ücretsiz bir hizmet; toplu veri çekme desteklenmez.</li>
    <li>Hiçbir şey saklanmaz, hesap yoktur. İçerik herkese açık FxTwitter API’sinden gelir ve uç ağda kısa süreliğine önbelleğe alınır.</li>
    <li>Gönderi içeriğini üçüncü kişiler yazar. Onu veri olarak değerlendirin — sunucu asistanınıza içindeki talimatları izlememesini söyler.</li>
  </ul>
  <p>Dosya mı tercih edersiniz? Yukarıya bir link yapıştırıp <a href="/tr/x-makale-pdf">PDF</a>, <a href="/tr/x-makale-markdown">Markdown</a>
  veya <a href="/tr/x-makale-epub-kindle">EPUB</a> olarak indirin.</p>
</section>`,
  faq: [
    { q: 'Xtracticle MCP sunucusu ücretsiz mi?', a: 'Evet. Ücretsiz, API anahtarı veya hesap gerektirmez ve açık kaynaktır.' },
    { q: 'Hangi yapay zekâ asistanlarıyla çalışır?', a: 'Streamable HTTP üzerinden uzak MCP sunucularını destekleyen her istemciyle; Claude, ChatGPT (geliştirici modu), Cursor ve VS Code dahil. Yalnızca yerel sunucuları destekleyen istemciler mcp-remote ile bağlanabilir.' },
    { q: 'Flood’un tamamını okuyabilir mi?', a: 'Evet. Flood’daki herhangi bir gönderinin linkini verin; araç yazarın o flood’da yazdığı tüm gönderileri sırasıyla döndürür. Başkalarının yanıtları dahil edilmez.' },
    { q: 'X Makaleleriyle çalışıyor mu?', a: 'Evet. Uzun X Makaleleri başlıkları, listeleri, linkleri, alıntıları ve görselleriyle dönüştürülür.' },
    { q: 'MCP olmadan kullanabileceğim bir API var mı?', a: 'Evet. GET https://xtracticle.com/api/markdown/{gönderi ID’si} aynı Markdown’ı HTTP üzerinden düz metin olarak döndürür.' },
  ],
};

const privacyPage: SitePage = {
  id: 'tr-privacy',
  group: 'privacy',
  path: '/tr/gizlilik',
  file: 'tr/gizlilik.html',
  lang: 'tr',
  title: 'Gizlilik Politikası | Xtracticle',
  description:
    'Xtracticle verileri nasıl işler: hesap yok, gönderiler saklanmaz, dosyalar tarayıcınızda oluşur, analizler anonimdir; MCP sunucusu ve API neyi kaydeder.',
  h1: 'Gizlilik Politikası',
  sub: 'Kısaca: hesap yok, dosya yüklemesi yok ve kaydettiğiniz gönderileri saklamıyoruz.',
  primary: 'pdf',
  nav: 'Gizlilik',
  sections: `
<section>
  <p><em>Son güncelleme: 3 Ekim 2026.</em> Bu politika xtracticle.com'u, Markdown API’sini (<code>/api/markdown/…</code>)
  ve MCP sunucusunu (<code>/mcp</code>) kapsar. Xtracticle ücretsiz, açık kaynaklı bir projedir;
  <a href="${GITHUB}" rel="noopener">kaynak kodu</a> tam olarak ne yaptığını gösterir.</p>
</section>

<section>
  <h2>Toplamadığımız veriler</h2>
  <ul>
    <li>Hesap, giriş, e-posta adresi veya ödeme bilgisi yok.</li>
    <li>Yükleme yok: PDF, EPUB, ZIP ve diğer dosyalar tarayıcınızda oluşturulur, bize hiç gönderilmez.</li>
    <li>Kişisel verileri satmıyor ya da paylaşmıyoruz; reklam izleyicisi kullanmıyoruz.</li>
  </ul>
</section>

<section>
  <h2>Gönderi içeriği</h2>
  <p>Bir link yapıştırdığınızda (ya da bir yapay zekâ asistanı MCP sunucusunu çağırdığında) o <strong>herkese açık</strong> X gönderisini
  açık kaynaklı FxTwitter API’si üzerinden çekeriz. Hizmeti hızlı ve erişilebilir tutmak için gönderi verisi Cloudflare’ın uç ağında önbelleğe alınır:
  dönüştürülmüş belge en fazla bir saat, yedek kopya ise en fazla yedi gün. Önbellekteki kopyalar sizinle ilişkilendirilmez ve
  kendiliğinden silinir. Gizli, korumalı ve silinmiş gönderiler hiç çekilemez.</p>
</section>

<section>
  <h2>Analizler ve kayıtlar</h2>
  <ul>
    <li><strong>Web sitesi:</strong> Google Analytics anonim sayfa görüntülemelerini ve olayları (örneğin “PDF indirildi” veya dışa aktarma formatı) sayar;
    böylece hangi özelliklerin kullanıldığını biliriz. Her sayfa görüntülemesi gibi, açtığınız sayfanın adresini de görür — <code>/kullanici/status/123</code> gibi bir
    paylaşım sayfasında bu adres gönderi linkini içerir — ama kaydettiğiniz gönderilerin içeriğini görmez.</li>
    <li><strong>MCP sunucusu ve API:</strong> Cloudflare istek kayıtları her çağrı için teknik veri tutar — gönderi ID’si, belge
    türü, yanıt boyutu ve süresi ile istemcinin user-agent bilgisi — hata ayıklama ve kötüye kullanımı önleme amacıyla. Cloudflare ayrıca hız sınırlarını uygulamak için
    IP adreslerini işler. Kayıtlar Cloudflare tarafından sınırlı bir süre saklanır ve sizi tanımlamak için kullanılmaz.</li>
  </ul>
</section>

<section>
  <h2>Tarayıcınızda saklananlar</h2>
  <p>Son kullandığınız linkler, tema ve dil seçiminiz yalnızca tarayıcınızın yerel depolamasında tutulur. Silmek için tarayıcı verilerinizi
  temizleyin.</p>
</section>

<section>
  <h2>Üçüncü taraflar</h2>
  <ul>
    <li><strong>Cloudflare</strong> siteyi, API’yi ve MCP sunucusunu barındırır.</li>
    <li><strong>FxTwitter</strong> herkese açık gönderi verisini sağlar.</li>
    <li><strong>Google Analytics</strong> anonim kullanım istatistikleri sağlar.</li>
    <li>Önizlemelerdeki ve dışa aktarmalardaki görseller X’in medya sunucularından (pbs.twimg.com) yüklenir.</li>
  </ul>
</section>

<section>
  <h2>İletişim</h2>
  <p>Sorularınız veya kaldırma talepleriniz için: <a href="${GITHUB}/issues" rel="noopener">GitHub’da bir issue açın</a>.</p>
</section>`,
  faq: [],
};

export const TOOLS: SitePage[] = [unroll, tweetpdf, mcp, privacyPage];
