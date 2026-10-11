/**
 * Turkish "guide" pages. X'in kuralları sık değiştiği için X ile ilgili bilgiler
 * "bu yazının hazırlandığı sırada (Ekim 2026)" kaydıyla verilir.
 */
import { privacy, type FAQ, type ExportKey, type SitePage } from '../../blocks';

const HUB = '/tr/rehberler';
const WHEN = 'bu yazının hazırlandığı sırada (Ekim 2026)';
const WHEN_CAP = 'Bu yazının hazırlandığı sırada (Ekim 2026)';

const back = `<p><a href="${HUB}">← Tüm rehberler</a></p>`;

const takeaways = (items: string[]) =>
  `<section>
  <h2>Kısaca</h2>
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
  id: `tr-guide-${EN_SLUG[g.slug]}`,
  group: `guide-${EN_SLUG[g.slug]}`,
  path: `${HUB}/${g.slug}`,
  file: `tr/rehberler/${g.slug}.html`,
  lang: 'tr',
  title: g.title,
  description: g.description,
  h1: g.h1,
  sub: g.sub,
  primary: g.primary,
  nav: '',
  sections: `${g.sections}\n${back}`,
  faq: g.faq,
});

/*
 * group değerleri İngilizce sayfalarla aynı olmalı (hreflang); yalnızca path/slug yerelleştirilir:
 * what-are-x-articles, read-x-articles-without-account, recover-deleted-tweets, x-articles-vs-substack,
 * backup-x-articles, how-to-see-deleted-tweets, find-tweets-on-wayback-machine, how-to-write-x-article, x-articles-limits
 */
const SLUG = {
  whatAre: 'x-makaleleri-nedir',
  readWithout: 'hesapsiz-x-makalesi-okuma',
  deleted: 'silinen-tweetler-geri-getirilir-mi',
  versus: 'x-makaleleri-substack-medium',
  backup: 'x-makalelerini-yedekleme',
  seeDeleted: 'silinen-tweetleri-gorme',
  wayback: 'wayback-machine-tweet-bulma',
  write: 'x-makalesi-nasil-yazilir',
  limits: 'x-makaleleri-limitleri',
};
/** Yerelleştirilmiş slug -> İngilizce slug (id ve group için). */
const EN_SLUG: Record<string, string> = {
  [SLUG.whatAre]: 'what-are-x-articles',
  [SLUG.readWithout]: 'read-x-articles-without-account',
  [SLUG.deleted]: 'recover-deleted-tweets',
  [SLUG.versus]: 'x-articles-vs-substack',
  [SLUG.backup]: 'backup-x-articles',
  [SLUG.seeDeleted]: 'how-to-see-deleted-tweets',
  [SLUG.wayback]: 'find-tweets-on-wayback-machine',
  [SLUG.write]: 'how-to-write-x-article',
  [SLUG.limits]: 'x-articles-limits',
};
const L = (k: keyof typeof SLUG) => `${HUB}/${SLUG[k]}`;

/* ─── 1. X Makaleleri nedir ─── */

const whatAre = guide({
  slug: SLUG.whatAre,
  title: 'X Makaleleri Nedir? Kimler Yayımlar, Nasıl Saklanır | Xtracticle',
  description:
    'X Makaleleri, X (Twitter) üzerindeki başlıklı, görselli ve listeli uzun yazılardır. Kimler yayımlayabilir, flood’dan farkı ne ve nasıl kaydedilir?',
  h1: 'X Makaleleri Nedir?',
  sub: 'X Makaleleri doğrudan X’te yayımlanan uzun ve biçimlendirilmiş yazılardır — kimlerin yazabildiğini, flood’dan farkını ve kopyasını nasıl saklayacağınızı anlatıyoruz.',
  primary: 'pdf',
  sections: `
${takeaways([
  'X Makalesi; başlık, görsel ve liste içeren, kısa gönderilerden oluşan bir zincir yerine doğrudan X’te yayımlanan uzun ve biçimlendirilmiş bir yazıdır.',
  `Yayımlamak ücretli bir özelliktir: ${WHEN} X, bunun Premium, Premium+, Premium Business ve Premium Organizations abonelerine açık olduğunu söylüyor. Okumak için abonelik gerekmez.`,
  'Makaleler flood’dan (birbirine bağlı çok sayıda kısa gönderi) ve tek bir uzun gönderiden farklıdır.',
  'Birini saklamak için linkini <a href="/tr/">Xtracticle</a>’a yapıştırın ve PDF, Markdown, EPUB veya ZIP olarak indirin.',
])}

<section>
  <h2>X Makalesi nedir?</h2>
  <p>X Makalesi, X üzerinde tek bir belge olarak duran uzun bir yazıdır. Yazar, bir fikri numaralı bir flood’a bölmek yerine başlığı, isteğe bağlı kapak görseli ve yapılandırılmış metniyle tek bir makale yazar. X’in yardım merkezi Makaleleri “X’te uzun biçimli yazılı içerik paylaşmanın yeni bir yolu” olarak tanımlıyor.</p>
  <p>Üçüncü taraf rehberlere göre Makaleler yaklaşık 100.000 karakteri bulabilir; bu, klasik bir gönderinin 280 karakterlik sınırının çok ötesindedir. Bildiğimiz kadarıyla X yardım sayfasında tek bir rakam yayımlamadı, bu yüzden bu sayıyı yaklaşık kabul edin.</p>

  <h2>X Makalelerini kimler yayımlayabilir?</h2>
  <p>X, Makaleleri Mart 2024’te Premium+ özelliği olarak başlattı. Ocak 2026’da erişimi tüm Premium abonelerine genişletti; bunu <a href="https://www.storyboard18.com/digital/x-expands-long-form-articles-access-to-all-premium-subscribers-87544.htm" rel="noopener nofollow">Storyboard18</a> bildirdi. X’in kendi <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">Makaleler yardım sayfası</a> ise yayımlamanın Premium ve Premium+ aboneleri, Premium Businesses ve Premium Organizations ile sınırlı olduğunu söylüyor.</p>
  <p>Yayımlanmış bir Makaleyi, yazarın seçtiği kitle ayarlarına göre herkes okuyabilir. Okumak için ödeme yapmanız gerekmez.</p>
</section>

<section>
  <h2>X Makaleleri, gönderiler, flood’lar ve notlar</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Gönderi</th><th>Flood</th><th>X Makalesi</th></tr></thead>
    <tbody>
      <tr><td>Yapı</td><td>Tek bir kısa gönderi</td><td>Aynı yazarın birbirine bağlı birkaç gönderisi</td><td>Başlıklı tek bir belge</td></tr>
      <tr><td>Biçimlendirme</td><td>Düz metin, medya</td><td>Her gönderide düz metin, medya</td><td>Başlıklar, kalın, italik, listeler, gömülü medya</td></tr>
      <tr><td>Okuma akışı</td><td>Zaman akışı</td><td>Kendine verilen yanıtlar arasında kaydırma</td><td>Ayrı bir okuyucu görünümü</td></tr>
      <tr><td>Kimler oluşturabilir</td><td>Herkes</td><td>Herkes</td><td>Ücretli aboneler</td></tr>
    </tbody>
  </table></div>
  <p>Flood hâlâ gönderilerden oluşur; her parça ayrı ayrı beğenilebilir, yanıtlanabilir ve alıntılanabilir. Makale ise tek parça olarak okunur. Bazı abonelere açık olan daha uzun tekil gönderiler yine düz gönderidir ve başlık içermez.</p>
</section>

<section>
  <h2>Biçimlendirme özellikleri</h2>
  <p>X’in yardım sayfasına göre Makaleler görsel, video, GIF, gömülü gönderi ve link içerebilir; metin başlıklar, alt başlıklar, kalın, italik, üstü çizili, girinti ile numaralı ya da madde işaretli listelerle biçimlendirilebilir. Onları flood’dan çok bir blog yazısına yaklaştıran da bu.</p>

  <h2>X Makaleleri nasıl bulunur?</h2>
  <ul>
    <li>Masaüstünde, hesabınızda varsa X’in yan menüsündeki <strong>Makaleler</strong> sekmesini açın.</li>
    <li>Bir yazarın profiline bakın: Makaleleri gönderilerinin yanında görünür.</li>
    <li>Başlıkta geçen terimleri arayın ve takip ettiğiniz kişilerle filtreleyin.</li>
    <li>Her hafta elle seçilmiş bir liste için <a href="/best-x-articles">Best X Articles</a> sayfasına bakın.</li>
  </ul>
  <p>Bir Makaleyi paylaştığınızda X size <code>x.com/i/article/…</code> biçiminde bir okuyucu linki verebilir. Çoğu aracın beklediği ise gönderi linkidir: <code>x.com/kullanici/status/…</code>.</p>
</section>

<section>
  <h2>X Makalesi nasıl kaydedilir?</h2>
  <p>X’te başkasının Makalesi için yerleşik bir “PDF olarak dışa aktar” düğmesi yok. Pratik seçenekler şunlar:</p>
  <ol>
    <li><strong>Tarayıcıdan yazdırma.</strong> Çalışır ama X’in arayüzünü de içerir ve görselleri sık sık sayfalar arasında keser.</li>
    <li><strong>Kopyala-yapıştır.</strong> Biçimlendirmenin ve görsellerin çoğunu kaybettirir.</li>
    <li><strong>Xtracticle.</strong> Gönderi linkini yapıştırın; başlık, yazar, tarih, kaynak linki ve görselleri içeren temiz bir dosya indirin: <a href="/tr/x-makale-pdf">X Makale PDF</a>, <a href="/tr/x-makale-markdown">Markdown</a> veya <a href="/tr/x-makale-epub-kindle">Kindle için EPUB</a>.</li>
  </ol>
  <p>Kopya saklamak önemlidir; çünkü gönderiler yazarları tarafından silinebilir ya da hesap askıya alınırsa kaybolabilir. <a href="${L('deleted')}">Neyin geri getirilip neyin getirilemeyeceğini</a> okuyun.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'X Makalesi nedir?', a: 'X Makalesi, kısa gönderilerden oluşan bir zincir yerine doğrudan X’te yayımlanan; başlık, alt başlık, liste, görsel ve diğer medyayı içeren uzun bir yazıdır.' },
    { q: 'X Makalelerini kimler yayımlayabilir?', a: 'Bu yazının hazırlandığı sırada (Ekim 2026) X, yayımlamanın Premium, Premium+, Premium Business ve Premium Organizations abonelerine açık olduğunu söylüyor. Özellik Mart 2024’te Premium+ ile başladı, Ocak 2026’da tüm Premium kademelerine açıldı.' },
    { q: 'X Makalesini okumak için ödeme yapmam gerekir mi?', a: 'Hayır. Yayımlanmış Makaleleri, yazarın seçtiği kitle ayarlarına göre herkes okuyabilir.' },
    { q: 'X Makalesi flood’dan nasıl farklıdır?', a: 'Flood, her biri kendi beğeni ve yanıtlarına sahip ayrı gönderilerden oluşan bir seridir. Makale ise başlığı ve alt başlıkları olan tek bir biçimlendirilmiş belgedir.' },
    { q: 'X Makalesini PDF olarak nasıl kaydederim?', a: 'Gönderi linkini kopyalayıp Xtracticle’a yapıştırın ve PDF’e tıklayın. Görselleri ve orijinaline giden bir linki olan temiz bir A4 dosyası alırsınız.' },
  ],
});

/* ─── 2. Hesapsız okuma ─── */

const readWithout = guide({
  slug: SLUG.readWithout,
  title: 'Hesapsız X Makalesi ve Flood Okuma | Xtracticle',
  description:
    'X (Twitter) makale, flood ve gönderilerini giriş yapmadan okuma: neler çalışır, X neleri engeller ve x.com yerine xtracticle.com yazma yöntemi.',
  h1: 'Hesapsız X Makalesi Nasıl Okunur?',
  sub: 'Kısaca: adres çubuğunda x.com yerine xtracticle.com yazın, herkese açık makale giriş yapmadan tam olarak açılsın.',
  primary: 'pdf',
  sections: `
${takeaways([
  'X, giriş yapmamış ziyaretçilere çoğu zaman giriş isteği, kısaltılmış bir görünüm ya da eksik bir flood gösterir; bu davranış zamanla değişir.',
  'Giriş yapmadan makalenin, flood’un veya gönderinin tamamını okumak için adres çubuğunda <code>x.com</code> yerine <code>xtracticle.com</code> yazın.',
  'Bu yalnızca herkese açık içerikte çalışır. Korumalı hesaplar, silinmiş gönderiler ve yaş kısıtlamalı gönderiler gösterilemez.',
  'Okuduğunuzu sonra PDF, Markdown veya EPUB olarak indirebilirsiniz.',
])}

<section>
  <h2>X’i giriş yapmadan açınca ne olur?</h2>
  <p>Giriş yapmamış bir ziyaretçinin gönderiyi tam görüp görmemesi içerik türüne, ülkeye ve X’in o anki politikasına bağlıdır; X bunu birden fazla kez değiştirdi. Pratikte gönderiyi görüp yanıtları görememek, giriş yapmanızı isteyen bir uyarıyla karşılaşmak ya da flood’un yalnızca bir kısmını görmek mümkün. Kurallar değiştiği için x.com’un kendisinin belirli bir şekilde davranacağını vaat etmiyoruz.</p>
  <p>Yine de herkese açık içerik herkese açıktır. Yazar hesabını korumaya almamışsa gönderiyi herkesin okumasına izin vardır. Sorun yalnızca resmî sitenin, giriş yapmadan bunu ne kadar rahat sunduğudur.</p>
</section>

<section>
  <h2>Yöntem 1: alan adını değiştirin</h2>
  <p>Herhangi bir X gönderisinde ya da Makalesinde adres çubuğunda <code>x.com</code> yerine <code>xtracticle.com</code> yazın ve Enter’a basın.</p>
  ${'<p><code>x.com/kullanici/status/123</code> → <code>xtracticle.com/kullanici/status/123</code></p>'}
  <p>Sayfa, herkese açık içeriği açık kaynaklı FxTwitter API’si üzerinden yükler ve görselleriyle birlikte okunabilir metin olarak gösterir. Hesap yok, makalenin üstünde çerez bannerı yok, uygulama kurmak yok. Flood’un herhangi bir gönderisini açtığınızda flood tek sayfada birleştirilir.</p>
  <p>Telefonda tek dokunuşluk bir seçenek de var: <a href="/tr/">ana sayfadaki</a> iPhone Kestirmesi’ni veya tarayıcı yer imini ekleyin.</p>

  <h2>Yöntem 2: linki yapıştırın</h2>
  ${'<ol class="xt-steps"><li>X uygulamasında ya da sitesinde <em>Paylaş → Linki kopyala</em>’ya dokunun.</li><li><a href="/tr/">xtracticle.com</a>’u açıp linki yapıştırın.</li><li>Orada okuyun ya da çevrimdışı okumak için <a href="/tr/x-makale-pdf">PDF</a> olarak indirin.</li></ol>'}
  <p>Link <code>x.com/i/article/…</code> gibi görünüyorsa Makaleyi X’te açın ve onun yerine gönderi linkini (<code>/status/</code> içeren) kopyalayın.</p>
</section>

<section>
  <h2>Neler çalışır, neler çalışmaz?</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>İçerik</th><th>Xtracticle ile girişsiz</th></tr></thead>
    <tbody>
      <tr><td>Herkese açık X Makalesi</td><td>Evet, tam metin, biçimlendirme ve görseller</td></tr>
      <tr><td>Herkese açık flood</td><td>Evet, yazarın kendi gönderileri sırasıyla birleştirilir</td></tr>
      <tr><td>Fotoğraflı ve alıntılı tekil herkese açık gönderi</td><td>Evet</td></tr>
      <tr><td>Başkalarının yanıtları</td><td>Hayır, dahil edilmez</td></tr>
      <tr><td>Korumalı (gizli) hesaplar</td><td>Hayır</td></tr>
      <tr><td>Silinmiş veya askıya alınmış içerik</td><td>Hayır</td></tr>
      <tr><td>Yaş kısıtlamalı veya yalnızca girişle görülen gönderiler</td><td>Çoğu zaman hayır</td></tr>
    </tbody>
  </table></div>
  <p>“Bulunamadı” görüyorsanız çoğunlukla son üç satırdan biridir.</p>
</section>

<section>
  <h2>Hesapsız okumanın diğer yolları</h2>
  <ul>
    <li><strong>Arama motoru sonucu.</strong> Bazı gönderilerde önizleme çıkar ama bu genellikle yalnızca bir parçadır.</li>
    <li><strong>Başkasının PDF’i veya ekran görüntüsü.</strong> Okumak için yeterli, ama orijinaliyle uyuştuğunu doğrulayamazsınız.</li>
    <li><strong>Yazarın RSS veya e-posta bülteni</strong>, varsa.</li>
  </ul>
  <p>X içeriğini düzenli okuyorsanız iyilerini kaydetmek, onları yeniden aramaktan kolaydır. Uzun flood’lar için <a href="/tr/twitter-flood-pdf">flood PDF</a> sayfasına bakın.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'X Makalelerini hesapsız okuyabilir miyim?', a: 'Herkese açık Makaleler, adreste x.com yerine xtracticle.com yazarak ya da linki Xtracticle’a yapıştırarak hesapsız okunabilir. Korumalı veya silinmiş gönderiler gösterilemez.' },
    { q: 'x.com yerine xtracticle.com yazma yöntemi nasıl çalışır?', a: 'Xtracticle, X ile aynı yolu kullanır. Yalnızca alan adını değiştirmek, örneğin x.com/kullanici/status/123 yerine xtracticle.com/kullanici/status/123 yazmak, o gönderiyi burada açar.' },
    { q: 'Yanıtlar da görünüyor mu?', a: 'Hayır. Flood’larda orijinal yazarın gönderileri gösterilir. Diğer kullanıcıların yanıtları dahil edilmez.' },
    { q: 'Gönderi neden “bulunamadı” diyor?', a: 'Gönderi silinmiş olabilir; korumalı veya askıya alınmış bir hesaba ait ya da yaş kısıtlamalı olabilir. Yalnızca herkese açık gönderiler gösterilebilir.' },
    { q: 'Gönderileri bu şekilde okumak yasal mı?', a: 'Yazarın herkese açık yayımladığı içeriği okur. Yazarın telif hakkına saygı gösterin: kendi okumanız için kopya saklamak, içeriği yeniden yayımlamaktan farklıdır.' },
  ],
});

/* ─── 3. Silinen tweetler geri getirilir mi ─── */

const deleted = guide({
  slug: SLUG.deleted,
  title: 'Silinen Tweetler Geri Getirilir mi? Ne İşe Yarar | Xtracticle',
  description:
    'Silinen X (Twitter) gönderilerini geri getirme rehberi: veri arşiviniz, Wayback Machine, archive.today, arama önbelleği ve erken kaydetmenin neden asıl çözüm olduğu.',
  h1: 'Silinen Tweetler Geri Getirilir mi?',
  sub: 'Bazen, ama nadiren X’in kendisinden. Hangi seçeneklerin var olduğu, her birinin ne kadar güvenilir olduğu ve onlara ihtiyaç duymamanın yolu.',
  primary: 'zip',
  sections: `
${takeaways([
  'Bir gönderi silindiğinde X onu artık sunmaz; Xtracticle gibi araçlar da onu çekemez.',
  'Kendi silinmiş gönderilerinizi geri bulmanız yalnızca silmeden önce oluşturulmuş eski bir X veri arşiviniz varsa mümkün olabilir.',
  'Başkalarının silinmiş gönderileri ancak biri kaydettiyse kalır: Wayback Machine, archive.today veya bir ekran görüntüsü. Kapsam eksiktir.',
  'Güvenilir çözüm, önemli gönderileri ve makaleleri yayındayken PDF veya görselli ZIP olarak kaydetmektir.',
])}

<section>
  <h2>Dürüst cevap</h2>
  <p>“Silineni geri al” düğmesi yok. Yazar bir gönderiyi sildiğinde X onu göstermeyi bırakır ve herkese açık gönderileri okuyan her araç, <a href="/tr/">Xtracticle</a> dahil, onu bulunamadı olarak bildirir. Geriye kalan, birinin daha önce aldığı kopyadır. Aşağıdakilerin hepsi böyle bir kopyayı bulma yollarıdır ve hiçbirinin garantisi yoktur.</p>
</section>

<section>
  <h2>Seçenek 1: kendi X veri arşiviniz</h2>
  <p>Silinen gönderi sizinse, silmeden önce indirdiğiniz hesap arşivine bakın. X, kimliğinizi doğruladıktan sonra <em>Ayarlar ve gizlilik → Hesabınız → Verilerinizin arşivini indirin</em> yolundan arşiv istemenize izin verir. X’in <a href="https://help.x.com/articles/20170320" rel="noopener nofollow">yardım sayfasına</a> göre arşiv hazır olunca e-posta veya bildirim alırsınız ve giriş yapmışken bir .zip dosyası indirirsiniz. Silmeden sonra oluşturulan yeni bir arşiv gönderiyi içermez; dolayısıyla bu yol yalnızca elinizde daha eski bir arşiv varsa işe yarar.</p>

  <h2>Seçenek 2: Wayback Machine</h2>
  <p>Internet Archive’ın <a href="https://web.archive.org/" rel="noopener nofollow">Wayback Machine</a> hizmeti bazen bir gönderinin ya da profilin anlık görüntüsünü tutar. Gönderinin tam URL’sini (<code>x.com/kullanici/status/…</code>; eski <code>twitter.com</code> biçimini de deneyin) arama kutusuna yapıştırın ve anlık görüntü takvimini açın. Üçüncü taraf raporlara göre X, arşivleyicilerin profilleri güvenilir biçimde yakalamasını zorlaştırdı; kapsam en çok ünlü hesaplarda ya da birinin elle kaydettiği sayfalarda güçlü. Kısa sürede silinen sıradan bir gönderi için sonuç beklemeyin.</p>
  <p>Canlı bir sayfayı <code>web.archive.org/save/</code> adresindeki Save Page Now ile kendiniz de ekleyebilirsiniz. Bu yalnızca silinmeden önce yaparsanız işe yarar.</p>

  <h2>Seçenek 3: archive.today ve benzerleri</h2>
  <p>archive.today gibi hizmetler herkesin bir sayfanın anlık görüntüsünü almasına izin verir. Gönderi URL’sini orada arayın. Wayback Machine’de olduğu gibi, yalnızca biri önceden kaydettiyse vardır.</p>
</section>

<section>
  <h2>Seçenek 4: arama motoru önbelleği ve ekran görüntüleri</h2>
  <ul>
    <li><strong>Arama motoru önbelleği.</strong> Google herkese açık “önbellek” linklerini kaldırdı; bu yüzden 2026’da büyük oranda çıkmaz sokak. Arama sonuçları silmeden sonra bir süre eski bir özet gösterebilir ama buna güvenemezsiniz.</li>
    <li><strong>Başkalarının ekran görüntüleri.</strong> Alıntı gönderiler, yanıtlar ve haberler çoğu zaman ekran görüntüsü içerir. Bunlar gönderinin var olduğunu gösterir, tam olarak ne yazdığını kanıtlamaz; çünkü ekran görüntüleri kolayca sahte üretilebilir.</li>
    <li><strong>Silinen gönderiyi alıntılayan gönderiler.</strong> Silinmiş bir gönderiyi alıntılayan gönderi normalde onu kullanılamıyor olarak gösterir, bu yüzden metnin korunmasını beklemeyin.</li>
  </ul>
  <p>“Silinmiş her tweet’i geri getiriyoruz” diyen sitelere karşı dikkatli olun. X’in kaldırdığı veriye ulaşamazlar; olsa olsa yukarıda sayılan arşivleri tararlar.</p>
</section>

<section>
  <h2>Asıl çözüm: yayındayken kaydedin</h2>
  <p>Bir gönderi veya makale sizin için önemliyse — işinizde kaynak, bir kanıt, bir duyuru ya da ileride alıntılamanız gereken bir şey — şimdi kaydedin:</p>
  <ul>
    <li><a href="/tr/x-makale-pdf">PDF</a>; düzeni, görselleri, yazarı, tarihi ve orijinal linki korur, paylaşması kolaydır.</li>
    <li><strong>Görselli ZIP</strong>; Markdown'ı ve her görseli ayrı dosya olarak saklar, kalıcı bir çevrimdışı arşivdir.</li>
    <li><strong>Toplu mod</strong> tek seferde 20 linki tek bir ZIP’e alır.</li>
  </ul>
  <p>Kayıtlı kopya, gönderinin kaydettiğiniz andaki içeriğini gösterir. Üçüncü bir kişiye gerçekliği kanıtlamaz ama tarihi, yazarı ve kaynak linkini kaydeder. Kendi yedekleriniz için <a href="${L('backup')}">X Makalelerinizi ve flood’larınızı nasıl yedekleyeceğinize</a> bakın.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'Silinen bir tweet’i geri getirebilir miyim?', a: 'Yalnızca başka bir yerde kopyası varsa: hesabınızın eski bir X veri arşivi, Wayback Machine veya archive.today anlık görüntüsü ya da bir ekran görüntüsü. X silinen gönderileri geri yüklemez.' },
    { q: 'Xtracticle silinmiş bir gönderiyi indirebilir mi?', a: 'Hayır. Xtracticle hâlâ yayında olan herkese açık gönderileri okur. Silinmiş gönderi bulunamadı olarak bildirilir; önemli gönderileri erken kaydetmek bu yüzden önemlidir.' },
    { q: 'Wayback Machine’de silinmiş tweetler var mı?', a: 'Bazen. Yalnızca gönderi veya profil silinmeden önce yakalanmışsa vardır; kapsam eksiktir ve çoğunlukla bilinen hesaplarda ya da birinin elle kaydettiği sayfalarda bulunur.' },
    { q: 'X, sildiğim gönderileri veri arşivimde tutuyor mu?', a: 'Bir gönderiyi sildikten sonra oluşturulan arşiv onu içermez. Daha önce indirdiğiniz arşiv, o sırada neyi içeriyorsa onu içermeye devam eder.' },
    { q: 'Bir gönderiyi kaybolmadan önce nasıl güvene alırım?', a: 'Linki Xtracticle’a yapıştırıp PDF olarak indirin; medyayı dosya olarak da istiyorsanız görselli ZIP indirin.' },
  ],
});

/* ─── 4. X Makaleleri vs Substack vs Medium ─── */

const versus = guide({
  slug: SLUG.versus,
  title: 'X Makaleleri, Substack ve Medium Karşılaştırması | Xtracticle',
  description:
    'Yazarlar için X Makaleleri, Substack ve Medium: kitle, gelir, sahiplik, dışa aktarma ve SEO. Ayrıca X Makalelerini nasıl yedekleyeceğiniz.',
  h1: 'X Makaleleri, Substack ve Medium',
  sub: 'Uzun yazı yayımlamak için üç yer; kitle, para, sahiplik, dışa aktarma ve arama görünürlüğü açısından karşılaştırma.',
  primary: 'md',
  sections: `
${takeaways([
  'X Makaleleri size X içinde anında erişim sağlar ama sahiplik zayıftır: abone listesi yok, makaleler için yerleşik dışa aktarma yok.',
  'Substack, dışa aktarabileceğiniz bir e-posta listesi etrafında kurulu ve ücretli aboneliklerden pay alır.',
  'Medium üyelere okuma süresine göre ödeme yapar ve yerleşik keşif sunar, ama kitle platforma aittir.',
  'Pek çok yazar keşif için X’i, ana üs için bir bülten ya da blogu kullanır. Hangisini seçerseniz seçin, X Makalelerini Markdown olarak yedekleyin.',
])}

<section>
  <h2>Bir bakışta</h2>
  <p>Platform kuralları ve ücretler değişir. Tablo, her platformun ${WHEN} nasıl çalıştığını özetler; karar vermeden önce her platformun güncel şartlarına bakın.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>X Makaleleri</th><th>Substack</th><th>Medium</th></tr></thead>
    <tbody>
      <tr><td>Ana kitle</td><td>Takipçileriniz ve X zaman akışı</td><td>E-posta aboneleri</td><td>Medium okurları ve üyeleri</td></tr>
      <tr><td>Kimler yayımlayabilir</td><td>Premium kademesi aboneleri</td><td>Herkes</td><td>Herkes</td></tr>
      <tr><td>Gelir</td><td>X’in, Premium kullanıcılarından gelen etkileşime dayalı üretici ödemeleri</td><td>Ücretli abonelikler; Substack %10 artı ödeme işlem ücretlerini alır</td><td>Üyelerin okuma süresine göre ödenen İş Ortaklığı Programı (Partner Program)</td></tr>
      <tr><td>Kitle sahipliği</td><td>Takipçiler; dışa aktarabileceğiniz bir liste değil</td><td>Abone listesi dışa aktarılabilir</td><td>Takipçiler ve e-posta platform içinde</td></tr>
      <tr><td>Yazıları dışa aktarma</td><td>Yerleşik makale dışa aktarma yok</td><td>Yazıları ve aboneleri dışa aktarın</td><td>Hesap verisi dışa aktarma</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Kitle ve keşif</h2>
  <p><strong>X Makaleleri</strong> mevcut kitlenizin zaten bulunduğu yerde durur. Takipçileriniz varsa bir Makale yeni bir kayıt gerektirmeden onlara ulaşabilir ve iyi yazılar yeniden paylaşımlarla yayılabilir. Madalyonun öbür yüzü, neyin görüleceğine zaman akışının karar vermesi ve takipçilerin sizin kontrol ettiğiniz bir liste olmamasıdır.</p>
  <p><strong>Substack</strong> yazıları abonelerin gelen kutusuna iletir; erişim daha öngörülebilirdir ama sıfırdan başlar. Kendi önerileri ve uygulaması da var.</p>
  <p><strong>Medium</strong> yerleşik okurlara ve konu akışlarına sahiptir; bu da yeni yazarların bulunmasına yardımcı olur. Ancak kitlenin büyük kısmı ölçülü bir üyelik modelinde ve erişim Medium’un dağıtımına bağlıdır.</p>

  <h2>Gelir</h2>
  <p>X, Kasım 2024’te üretici ödemelerini reklam gelirinden Premium abonelerinin etkileşimine kaydırdı (<a href="https://www.mediapost.com/publications/article/400171/x-ends-ad-revenue-share-for-creators-focuses-on-p.html" rel="noopener nofollow">MediaPost</a>). Substack ücretli abonelik fiyatını belirlemenize izin verir ve %10 artı Stripe ücretlerini alır (<a href="https://faq.substack.com/p/how-do-paid-subscriptions-on-substack" rel="noopener nofollow">Substack SSS</a>). Medium üyelik ücretlerini üyelerin okuma süresine göre dağıtır (<a href="https://help.medium.com/hc/en-us/articles/360036691193" rel="noopener nofollow">Medium Yardım</a>). Üçünde de kazançlar çok değişir; gelir rakamı vermiyoruz.</p>
</section>

<section>
  <h2>Sahiplik ve taşınabilirlik</h2>
  <p>En büyük fark bu. Bir Substack yayını, dışa aktarılabilir bir abone listesi ve dışa aktarılabilir yazılarla gelir; böylece başka bir platforma geçebilirsiniz. X, gönderilerinizin bir hesap veri arşivini sunuyor ama bizim anlayabildiğimiz kadarıyla Makaleler bunda net biçimde yer almıyor ve Makalelerinizi tek tıkla dışa aktaran bir seçenek yok. Medium hesap verinizi indirmenize izin verir, ancak okurlarınız Medium’da kalır.</p>
  <p>X’te Makale yayımlıyorsanız kendi kopyanızı saklayın. <a href="/tr/x-makale-markdown">Xtracticle’ın Markdown dışa aktarımı</a> bir Makaleyi, blogda, Substack’te veya Obsidian’da yeniden kullanabileceğiniz temiz bir .md dosyasına (isteğe bağlı front-matter ile) çevirir. <a href="${L('backup')}">Yedekleme rehberi</a> bir iş akışı gösteriyor.</p>

  <h2>SEO ve dizinleme</h2>
  <p>Substack ve Medium sayfaları, arama motorlarının dizinlediği sıradan herkese açık web sayfalarıdır. X içeriği de dizinlenir, ama X ağır ve girişe yönelik bir uygulamadır; bir Makalenin ne kadarının taranabildiği veya giriş yapmamış kullanıcılara gösterildiği değişir. X’i bir dağıtım kanalı, kendi alan adınızı ya da bülteninizi ise kalıcı arama trafiği kazanacak yer olarak görün.</p>
</section>

<section>
  <h2>Hangisini seçmeli?</h2>
  <ul>
    <li><strong>X’te zaten takipçileriniz var</strong> ve uzun yazıyı denemek istiyorsanız: X’te yayımlayın, en iyi yazıları bir bültene kopyalayın.</li>
    <li><strong>Abonelerle bir ilişki ve ücretli kademe istiyorsanız:</strong> Substack.</li>
    <li><strong>Sizi tanımayan okurlar tarafından keşfedilmek istiyorsanız:</strong> Medium, yukarıdaki ödünleşimlerle.</li>
  </ul>
  <p>Birbirini dışlamazlar. Yaygın bir düzen, bir kez yazmak, kendi bülteninizde yayımlamak ve X’te paylaşmaktır.</p>
</section>`,
  faq: [
    { q: 'X Makaleleri Substack’ten daha mı iyi?', a: 'Farklı amaçlara hizmet ederler. X Makaleleri mevcut X takipçilerinize doğrudan ulaşır; Substack dışa aktarılabilir bir e-posta listesi ve ücretli abonelik sunar. Pek çok yazar ikisini birlikte kullanır.' },
    { q: 'X Makalelerimi dışa aktarabilir miyim?', a: 'X’in tek tıkla Makale dışa aktarımı yok. Linkini yapıştırarak her birini Xtracticle ile Markdown, PDF veya ZIP olarak kaydedebilirsiniz.' },
    { q: 'Substack yazarlardan nasıl para kazanır?', a: 'Bu yazının hazırlandığı sırada (Ekim 2026) Substack, ücretli abonelik gelirinin %10’unu ve Stripe’ın ödeme işlem ücretlerini alıyor. Güncel şartlar için SSS sayfasına bakın.' },
    { q: 'Medium yazarlara nasıl ödeme yapar?', a: 'İş Ortaklığı Programı (Partner Program) üzerinden; üyelik ücretleri, üyelerin bir yazarın hikâyelerini ne kadar süre okuduğuna veya dinlediğine göre dağıtılır.' },
    { q: 'SEO için hangisi en iyisi?', a: 'Kendi alan adınızdaki içerik ya da bülten arşivi genellikle en kalıcı arama görünürlüğünü sağlar. Substack ve Medium sayfaları herkese açık web sayfalarıdır; X ise esas olarak bir sosyal dağıtım kanalıdır.' },
  ],
});

/* ─── 5. Yedekleme ─── */

const backup = guide({
  slug: SLUG.backup,
  title: 'X Makalelerinizi ve Flood’larınızı Yedekleme | Xtracticle',
  description:
    'X Makalelerinizi ve flood’larınızı yedekleyin: X veri arşivi neyi kapsar, görselli Markdown ve ZIP dışa aktarımı, Obsidian iş akışı ve toplu mod.',
  h1: 'X Makalelerinizi ve Flood’larınızı Nasıl Yedeklersiniz?',
  sub: 'Yazarlar için iki katmanlı bir plan: güvenlik ağı olarak X’in hesap arşivi, artı gerçekten açıp yeniden kullanabileceğiniz makale başına Markdown veya ZIP dosyaları.',
  primary: 'md',
  sections: `
${takeaways([
  'X’in hesap veri arşivini istemeye değer, ancak doğrulayabildiğimiz kadarıyla gönderiler, medya ve hesap verisi etrafında kurulu; Makalelerinizi okunabilir belgeler olarak içermeyebilir.',
  'Her Makale veya flood için <a href="/tr/x-makale-markdown">Xtracticle</a> ile Markdown ya da görselli ZIP dışa aktarın.',
  'Toplu mod 20 linke kadar alır ve tek bir ZIP verir.',
  'Dosyaları Obsidian’da, Notion’da veya ikinci bir yedeği olan eşitlenmiş bir klasörde saklayın.',
])}

<section>
  <h2>Katman 1: X’in hesap veri arşivi</h2>
  <p>X uygulamasından ya da sitesinden isteyin: <em>Ayarlar ve gizlilik → Hesabınız → Verilerinizin arşivini indirin</em>. E-postanıza veya telefonunuza gelen kodla kimliğinizi doğrular, <em>Veri iste</em>’ye dokunursunuz; hazır olunca X sizi bilgilendirir. Sonra giriş yapmışken ayarlardan .zip dosyasını indirirsiniz (<a href="https://help.x.com/articles/20170320" rel="noopener nofollow">X Yardım</a>). Üçüncü taraf rehberler indirme linkinin kısa süre sonra geçersiz olabileceğini belirtiyor; bu yüzden hemen indirin.</p>
  <h3>Neyi kapsar?</h3>
  <p>Arşiv veri dosyaları ve medya klasörleri olarak düzenlenir: gönderileriniz, hesap bilgileriniz ve daha fazlası. Bir şeyi ne zaman yazdığınızın kaydı olarak işe yarar.</p>
  <h3>Makaleler için uyarı</h3>
  <p>X’in Makalelerin biçimlendirilmiş belgeler olarak dahil edildiğini söyleyen bir belgesini bulamadık; arşivin içeriğini anlatan metinler Makalelerden değil gönderilerden söz ediyor. Güvenmeden önce kendi arşivinizi açıp kontrol edin; bunu her hesap için doğrulamadık. Metin içinde olsa bile, düzeni ve görselleri olan okunabilir bir makale değil, veri dosyaları olarak saklanır.</p>
</section>

<section>
  <h2>Katman 2: her makaleyi kendiniz dışa aktarın</h2>
  <h3>Tek makale veya flood</h3>
  ${'<ol class="xt-steps"><li>Makalenizi X’te açın ve <em>Paylaş → Linki kopyala</em>’ya dokunun. (Linkte <code>/i/article/</code> varsa onun yerine <code>/status/</code> içeren gönderi linkini kullanın.)</li><li><a href="/tr/">Xtracticle</a>’a yapıştırın.</li><li>Metin dosyası için <strong>Markdown</strong>’ı, her görseli de dosya olarak saklamak için <strong>ZIP + görseller</strong>’i seçin.</li></ol>'}
  <p>Flood için herhangi bir gönderisini yapıştırın; flood’un tamamı sırasıyla birleştirilir.</p>
  <h3>Birçoğu birden: toplu mod</h3>
  <p><em>Toplu mod</em>’a geçin, 20 linke kadar yapıştırın ve tek bir ZIP indirin. Daha büyük bir arşiv için 20’şerli gruplar hâlinde tekrarlayın.</p>
  <h3>Hangi format?</h3>
  <ul>
    <li><strong>Markdown (.md):</strong> yeniden kullanım, düzenleme ve başka bir platforma taşıma için en iyisi. <a href="/tr/x-makale-markdown">Markdown dışa aktarımına</a> bakın.</li>
    <li><strong>ZIP + görseller:</strong> Markdown artı medya; eksiksiz bir çevrimdışı kopya.</li>
    <li><strong>PDF:</strong> paylaşmak ve sabit düzenli bir kayıt için en iyisi. <a href="/tr/x-makale-pdf">X Makale PDF</a> sayfasına bakın.</li>
  </ul>
</section>

<section>
  <h2>Düzenli tutun</h2>
  <h3>Obsidian</h3>
  <p>Xtracticle bir makaleyi kasanızda başlık, yazar, kaynak, tarihler ve etiketleri içeren front-matter’lı yeni bir not olarak açabilir. Ayrıntılar: <a href="/tr/x-makale-obsidian">X makalelerini Obsidian’a kaydet</a>.</p>
  <h3>Notion</h3>
  <p>Notion Markdown dosyalarını içe aktarabilir: <em>Import → Text &amp; Markdown</em> yolunu kullanıp .md dosyalarını seçin.</p>
  <h3>Basit bir klasör düzeni</h3>
  <ul>
    <li>Yıl başına bir klasör, dosya adları <code>YYYY-MM-DD-baslik.md</code> biçiminde.</li>
    <li>Görselleri dosyanın yanında tutun (ZIP dışa aktarımı bunu yapar).</li>
    <li>Kaynağı her zaman izleyebilmek için orijinal X linkini front-matter’da saklayın.</li>
  </ul>
  <p>3-2-1 kuralını izleyin: farklı cihazlarda veya hizmetlerde en az iki kopya, biri de dışarıda, örneğin bulut depolamada ya da özel bir Git deposunda.</p>
</section>

<section>
  <h2>Rutin hâline getirin</h2>
  <p>Her Makaleyi yayımladığınızda yedekleyin; çünkü linki o an biliyorsunuz. İkinci katman olarak birkaç ayda bir yeni bir X hesap arşivi isteyin. Silinen gönderi riskini de aklınızda tutmak istiyorsanız <a href="${L('deleted')}">neyin geri getirilip neyin getirilemeyeceğini</a> okuyun.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'X veri arşivi Makalelerimi içeriyor mu?', a: 'X’in Makalelerin biçimlendirilmiş belgeler olarak dahil edildiğini söyleyen bir belgesini bulamadık. Kendi arşivinizi kontrol edin ve ikinci kopya olarak makale başına dışa aktarımları saklayın.' },
    { q: 'Bir X Makalesini görselleriyle nasıl yedeklerim?', a: 'Gönderi linkini Xtracticle’a yapıştırın ve ZIP + görseller’i seçin. Her görselin yanına kaydedildiği bir Markdown dosyası alırsınız.' },
    { q: 'Birçok makaleyi aynı anda yedekleyebilir miyim?', a: 'Evet. Toplu mod 20 linke kadar kabul eder ve tek bir ZIP döndürür.' },
    { q: 'Başkalarının Makalelerini yedekleyebilir miyim?', a: 'Herkese açık her Makaleyi kişisel okuma veya başvuru için kaydedebilirsiniz. Yazarın telif hakkına saygı gösterin ve izinsiz yeniden yayımlamayın.' },
    { q: 'Markdown dosyalarını Notion’a veya Obsidian’a taşıyabilir miyim?', a: 'Evet. Obsidian .md dosyalarını doğrudan açar, Notion ise Markdown’ı Import → Text & Markdown yoluyla içe aktarabilir.' },
  ],
});

/* ─── 6. Silinen tweetleri görme ─── */

const seeDeleted = guide({
  slug: SLUG.seeDeleted,
  title: 'Silinen Tweetler Nasıl Görülür? Gerçekçi Seçenekler | Xtracticle',
  description:
    'Başka hesapların silinen tweetlerini görme: arşivler, arama özetleri, alıntı gönderiler ve ekran görüntüleri; neyin hiç işe yaramadığı ve gönderiler nasıl kaydedilir.',
  h1: 'Silinen Tweetler Nasıl Görülür?',
  sub: 'Başkasının silinmiş gönderisini görmek yalnızca önceden bir kopya alındıysa mümkün. Kopyaların nerede bulunabileceği ve nelerin çıkmaz sokak olduğu burada.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Bir gönderi silindiğinde X onu sunmayı bırakır. Xtracticle dahil kimse onu X’ten yeniden çekemez.',
  'Başka birinin silinmiş gönderisini ancak biri önce kopyaladıysa görebilirsiniz: web arşivi anlık görüntüsü, ekran görüntüsü, haber ya da kayıtlı bir dosya.',
  'Bakılacak en iyi yerler Wayback Machine, archive.today ve silinen gönderiyi alıntılayan gönderiler veya yazılardır.',
  '“Silinmiş her tweet’i gösteririz” diyen siteler X’in kaldırdığı veriye ulaşamaz. Şüpheyle yaklaşın.',
  'Bir gönderi önemliyse yayındayken <a href="/tr/tweet-pdf">PDF</a> veya ZIP olarak kaydedin.',
])}

<section>
  <h2>Kendi silinen gönderileriniz ve başkasınınkiler</h2>
  <p>Bunlar iki ayrı sorun. <strong>Kendi</strong> gönderileriniz için X veri arşivinizin eski bir kopyası hâlâ onları içeriyor olabilir; bu yol <a href="${L('deleted')}">Silinen tweetler geri getirilir mi?</a> yazısında anlatılıyor. Bu rehber <strong>başkalarının</strong> gönderileriyle ilgili; burada kendi arşiviniz yok ve üçüncü tarafların aldığı kopyalara bağımlısınız.</p>
  <p>Baştan gerçekçi olmak yardımcı olur. Silinmiş bir gönderiyi ortaya çıkaran gizli bir X sayfası, özel bir URL ya da hesap ayarı yok. Bir kopya varsa başka bir yerde vardır.</p>
</section>

<section>
  <h2>Kopya nerede olabilir?</h2>
  <h3>1. Web arşivleri</h3>
  <p>Internet Archive’ın Wayback Machine hizmeti ve archive.today web sayfalarının anlık görüntülerini alır. Biri gönderiyi ya da yazarın profilini silinmeden önce arşivlediyse o anlık görüntüyü açabilirsiniz. Kapsam en çok bilinen hesaplarda ve birinin bilerek kaydettiği gönderilerde güçlüdür; dakikalar içinde silinen sıradan gönderilerde en zayıftır. Tam adımlar için <a href="${L('wayback')}">Wayback Machine’de tweet nasıl bulunur</a> yazısına bakın.</p>
  <h3>2. Alıntı gönderiler, yanıtlar ve bahsetmeler</h3>
  <p>İnsanlar bir gönderiye çoğu zaman onu alıntılayarak tepki verir. Orijinal sonradan silinirse X normalde alıntıyı “gönderi kullanılamıyor” uyarısıyla gösterir; yani metnin kendisi gitmiştir. Onu anlatan veya özetleyen yanıtlar ve diğer gönderiler yine de neyle ilgili olduğunu söyleyebilir. Bunları ikinci el aktarım olarak değerlendirin.</p>
  <h3>3. Ekran görüntüleri</h3>
  <p>Gazeteciler, doğrulama ekipleri ve sıradan kullanıcılar kaybolması muhtemel gönderilerin ekran görüntüsünü alır. Gönderiden ayırt edici bir ifadeyi ya da yazarın kullanıcı adını bir konuyla birlikte aramak bu görselleri ortaya çıkarabilir. Ekran görüntüsü bir şeyin paylaşıldığını gösterir ama kolayca sahte üretilir veya kırpılır; tek başına zayıf bir kanıttır. İkinci bir bağımsız kaynak arayın.</p>
  <h3>4. Haber ve blog yazıları</h3>
  <p>Gönderi haber değeri taşıyorsa yazılar çoğu zaman onu gömer veya alıntılar. Bazı gömülü içerikler orijinal silindikten sonra da metni göstermeye devam eder; ancak bu sayfanın nasıl yapıldığına bağlıdır ve güvenilecek bir şey değildir.</p>
  <h3>5. Arama motoru özetleri</h3>
  <p>Bir arama sonucu silinmeden sonra kısa bir süre eski bir özet göstermeye devam edebilir. Google herkese açık “önbellek” linklerini kaldırdığı için artık sonuçtan saklanan sayfayı açamazsınız. Bir özet görürseniz hemen kopyalayın veya ekran görüntüsünü alın; dizin yenilendiğinde kaybolabilir.</p>
</section>

<section>
  <h2>Neler işe yaramaz?</h2>
  <ul>
    <li><strong>“Silinmiş tweet görüntüleyici” siteleri.</strong> X’in kaldırdığı veriyi okuyamazlar. En iyi ihtimalle kendi başınıza da arayabileceğiniz aynı herkese açık arşivleri tararlar. En kötü ihtimalle X girişinizi ya da ödeme isterler.</li>
    <li><strong>URL tahmin etmek.</strong> Silinmiş bir gönderinin adresi, x.com, twitter.com ya da bir ayna site kullanın, “bulunamadı” döndürür.</li>
    <li><strong>Tarayıcı numaraları ve alan adı değiştirme yöntemi.</strong> x.com yerine xtracticle.com yazmak yalnızca hâlâ yayında olan gönderileri okur. Silinmişlerde sonuç bulunamadı olur. Neler yapabildiği için <a href="${L('readWithout')}">hesapsız X okuma</a> yazısına bakın.</li>
    <li><strong>X desteğine yazmak.</strong> X, başka bir kullanıcının silinmiş gönderisine erişim vermez.</li>
  </ul>
  <p>Korumalı hesaplar ayrı bir durum: gönderileri hiç herkese açık olmadı, bu yüzden arşivlerde normalde hiçbir şey yoktur.</p>
</section>

<section>
  <h2>Denemek için pratik bir sıra</h2>
  <ol>
    <li>Elinizde varsa gönderi URL’sini hem x.com hem twitter.com biçimiyle Wayback Machine’e yapıştırın.</li>
    <li>Aynı URL için archive.today’i kontrol edin.</li>
    <li>Gönderiden ayırt edici bir ifadeyi tırnak içinde arayarak ekran görüntülerini, alıntıları veya haberleri bulun.</li>
    <li>Yazarın diğer kanallarına bakın. İnsanlar silinen bir açıklamayı çoğu zaman başka yerde yeniden paylaşır.</li>
    <li>Bir kopya bulursanız nerede ve ne zaman bulduğunuzu not edin; ikinci bir kaynağınız olana kadar doğru olduğunu varsaymayın.</li>
  </ol>
  <p>Hiçbir şey çıkmazsa gönderinin gittiğini varsayın. Sıradan gönderilerde olağan sonuç budur.</p>
</section>

<section>
  <h2>Önemli gönderileri yayındayken kaydedin</h2>
  <p>Bir gönderiyi sonradan görmenin tek güvenilir yolu kendi kopyanızı saklamaktır. Linki <a href="/tr/">Xtracticle</a>’a yapıştırın ve yazarı, tarihi, görselleri ve orijinale giden bir linki olan bir PDF ya da görselleri dosya olarak içeren bir ZIP indirin. Uzun bir flood için <a href="/tr/twitter-flood-pdf">flood PDF</a> sayfasını kullanın; flood’u önce tek sayfa olarak okumak için <a href="/tr/twitter-flood-okuma">Twitter flood okuma</a> sayfasını deneyin. Kayıtlı dosya neyi gördüğünüzü ve ne zaman gördüğünüzü kaydeder. Üçüncü bir kişi için kanıt değildir, ama hafızadan çok daha iyidir. Yazarlar <a href="${L('backup')}">yedekleme rehberi</a> ile bir rutin kurabilir.</p>
  <p>Yalnızca kendi başvurunuz için ihtiyacınız olanı kopyalayın; paylaşırken yazarın telif hakkına ve gizliliğine saygı gösterin.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'Başkasının silinmiş tweet’ini görebilir miyim?', a: 'Yalnızca silinmeden önce bir kopya alındıysa; örneğin bir Wayback Machine veya archive.today anlık görüntüsü, ekran görüntüsü ya da onu alıntılayan bir haber. X silinmiş gönderileri kimseye göstermez.' },
    { q: 'Silinmiş her tweet’i gösteren bir site var mı?', a: 'Hayır. Bunu iddia eden siteler X’in kaldırdığı veriyi okuyamaz. Kendi başınıza da arayabileceğiniz aynı herkese açık arşivleri tarar, bazıları girişinizi veya ödeme ister; dikkatli olun.' },
    { q: 'Alıntı gönderi silinen metni korur mu?', a: 'Normalde hayır. Orijinal silindiğinde X alıntılanan gönderiyi kullanılamıyor olarak gösterir; alıntı yapan yazarın kendi sözleri ise kalır.' },
    { q: 'Xtracticle silinmiş bir gönderiyi gösterebilir mi?', a: 'Hayır. Xtracticle hâlâ yayında olan herkese açık gönderileri okur; silinmiş gönderi bulunamadı olarak bildirilir.' },
    { q: 'Bir gönderiyi sonradan görebileceğimden nasıl emin olurum?', a: 'Yayındayken kaydedin. Linki Xtracticle’a yapıştırıp PDF ya da görselli ZIP indirin.' },
  ],
});

/* ─── 7. Wayback Machine ─── */

const wayback = guide({
  slug: SLUG.wayback,
  title: 'Wayback Machine’de Silinen Tweetleri Bulma | Xtracticle',
  description:
    'Wayback Machine’de arşivlenmiş tweetleri bulma rehberi: denenecek URL biçimleri, takvim, joker karakterli arama, Save Page Now ve archive.today.',
  h1: 'Wayback Machine’de Tweet Nasıl Bulunur?',
  sub: 'Internet Archive’da arşivlenmiş X (Twitter) gönderilerini ve profillerini aramak için net bir kontrol listesi ve nerede yetersiz kaldığına dair dürüst bir bakış.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Önce gönderinin tam URL’sini hem <code>x.com</code> hem <code>twitter.com</code> biçiminde arayın, sonra profil URL’sini deneyin.',
  '<code>web.archive.org/web/*/twitter.com/kullanici/status/*</code> gibi joker karakterli bir arama, bir hesabın arşivlenmiş tüm gönderi URL’lerini listeler.',
  'Takvimdeki mavi noktalar başarılı yakalamalardır. Turuncu veya kırmızı olanlar genellikle bir hata sayfası gösterir.',
  'X kapsamı eksiktir; sonuç çıkmaması gönderinin hiç var olmadığı anlamına gelmez.',
  'Save Page Now, X’te başarısız olabilir; bu yüzden önemli her şey için kendi kopyanızı da saklayın.',
])}

<section>
  <h2>Başlamadan önce</h2>
  <p><a href="https://web.archive.org/" rel="noopener nofollow">web.archive.org</a> adresindeki Wayback Machine web sayfalarının anlık görüntülerini saklar. X’in tam bir kopyasını tutmaz. Bir tweet orada ancak Internet Archive’ın tarayıcısı ya da Save Page Now kullanan biri o sayfayı yakaladıysa görünür. Internet Archive’ın <a href="https://help.archive.org/help/using-the-wayback-machine/" rel="noopener nofollow">yardım sayfasına</a> göre kapsam eksiktir ve JavaScript’e bağlı sayfaların arşivlenmesi zordur. X tam olarak bu tür bir site ve üçüncü taraf raporlara göre otomatik erişimi de kısıtladı. Beklentinizi buna göre ayarlayın: bilinen hesapların ve geniş çapta paylaşılan gönderilerin şansı en yüksek.</p>
  <p>Gönderinin adresine ihtiyacınız var. Elinizde yoksa önce bir alıntıdan, bir haberden ya da yazarın profilinden bulmaya çalışın.</p>
</section>

<section>
  <h2>Adım adım</h2>
  <h3>1. Gönderinin tam URL’sini arayın</h3>
  <p>Tam linki web.archive.org’daki arama kutusuna yapıştırın. Biçim <code>https://x.com/kullanici/status/1234567890</code> şeklindedir. Yalnızca eski adresi biliyorsanız <code>https://twitter.com/kullanici/status/1234567890</code> kullanın. Gönderiyi tanımlayan kısım status ID’sidir; bu yüzden alan adından daha önemlidir.</p>
  <h3>2. Her URL varyantını deneyin</h3>
  <p>Aynı gönderi birkaç farklı adresle saklanmış olabilir. Şunları sırayla deneyin:</p>
  <ul>
    <li><code>x.com/kullanici/status/ID</code></li>
    <li><code>twitter.com/kullanici/status/ID</code></li>
    <li><code>mobile.twitter.com/kullanici/status/ID</code></li>
    <li><code>www.twitter.com/kullanici/status/ID</code></li>
    <li>Bir paylaşım linkinden kopyaladıysanız, sonunda <code>?s=20</code> veya başka bir izleme parametresi olan aynı URL</li>
  </ul>
  <h3>3. Bir hesabın tümünü listelemek için joker karakter kullanın</h3>
  <p>Status ID’sini bilmiyorsanız bir yol altında yakalanan tüm URL’leri isteyin. Internet Archive <code>web.archive.org/web/*/example.com/*</code> joker karakter biçimini belgeliyor. X için bu şöyle olur:</p>
  <p><code>web.archive.org/web/*/twitter.com/kullanici/status/*</code></p>
  <p>Aynısını <code>x.com</code> ile de yapın. Sonuç, arşivlenmiş gönderi URL’lerinden oluşan uzun bir listedir. İçinde bir status ID’si ya da adresin bir kısmını aramak için tarayıcınızın bul işlevini kullanın. Liste çok uzunsa arşiv aynı veriyi düz bir tablo olarak veren bir CDX arayüzü de sunar. <code>web.archive.org/cdx/search/cdx?url=twitter.com/kullanici/status/*&amp;fl=timestamp,original,statuscode&amp;collapse=urlkey</code> gibi bir sorgu pek çok hesapta çalışır, ancak güncel parametreler için Internet Archive'ın CDX belgelerine bakın.</p>
  <h3>4. Profil sayfasına bakın</h3>
  <p><code>twitter.com/kullanici</code> ve <code>x.com/kullanici</code> adreslerini arayın. Bir profil anlık görüntüsü son gönderileri o tarihteki hâliyle gösterebilir. Birkaç gün yayında kalmış kısa bir gönderinin burada çıkma ihtimali, kendi başına yakalanmış bir sayfa olarak çıkmasından yüksektir.</p>
  <h3>5. Takvimi okuyun</h3>
  <p>Bir URL’nin yakalamaları varsa yılın takvimini görürsünüz. Noktalar ve linkler anlık görüntüsü olan günleri işaretler; renkler tarayıcının aldığı durumu gösterir. Internet Archive’a göre mavi başarı, yeşil yönlendirme, turuncu istemci hatası, kırmızı sunucu hatası demektir. Mavi bir tarih seçin, tercihen gönderi silinmeden hemen önceki bir tarih. Yakalamaların alındıktan sonra görünmesi birkaç saat sürebilir.</p>
  <h3>6. Anlık görüntüyü açıp kontrol edin</h3>
  <p>Arşivlenmiş sayfalar bazen görseller ya da yanıtlar olmadan yüklenir veya gönderi yerine bir giriş istemi gösterir. Takvimdeki önceki ve sonraki anlık görüntüleri deneyin; biri daha iyi görüntülenmiş olabilir. Alıntı yapacaksanız zaman damgalı tam arşiv adresini not edin.</p>
</section>

<section>
  <h2>Save Page Now ve X için sınırları</h2>
  <p>Canlı bir sayfayı kendiniz arşivlemek için <code>web.archive.org/save</code> adresindeki Save Page Now’u kullanın, URL’yi yapıştırıp gönderin. Internet Archive’a göre bu, istek üzerine tek bir sayfayı kaydeder, tüm siteleri kaydetmez. Bir şey silinmeden önce yapın; çünkü zaten gitmiş bir gönderiyi yakalayamaz.</p>
  <p>X’te Save Page Now başarısız olabilir ya da bir giriş ekranı gösteren bir anlık görüntü üretebilir; çünkü X çoğu zaman otomatik istekleri engeller. Böyle olursa anlık görüntünün kayıt olarak değeri yoktur. Kendi dosyalarınızda ikinci bir kopya öneriyor olmamızın nedeni de bu. <a href="/tr/tweet-pdf">Tweet PDF</a> ve <a href="/tr/">Xtracticle</a> herkese açık gönderiyi görüntüler ve sonucu sizin için kaydeder.</p>
</section>

<section>
  <h2>Alternatif: archive.today</h2>
  <p>archive.today (archive.ph gibi adreslerden de ulaşılabilir) herkesin sayfa gönderebildiği ayrı bir arşivdir. Gönderi URL’sini orada arayın ya da gönderi hâlâ yayındaysa kaydetme kutusuna yapıştırın. Kendi kapsamı ve kendi boşlukları vardır, alan adları zaman zaman değişir; bu yüzden güncel adresi arayın. Wayback Machine’de bir şey çıkmadığında ikinci bir görüş olarak kullanın.</p>
</section>

<section>
  <h2>Neden hiçbir şey bulamayabilirsiniz?</h2>
  <ul>
    <li>Gönderi, herhangi bir tarayıcı ya da kullanıcı onu kaydetmeden önce silindi.</li>
    <li>Hesap korumalı olduğu için sayfa hiç herkese açık olmadı.</li>
    <li>Yakalama var ama yalnızca bir giriş duvarı veya hata gösteriyor.</li>
    <li>Internet Archive’ın istek üzerine yürütebildiği hariç tutma süreci onu kaldırdı.</li>
  </ul>
  <p>Kendi veri arşiviniz dahil daha geniş resim için <a href="${L('deleted')}">silinen tweetler geri getirilir mi</a> ve <a href="${L('seeDeleted')}">silinen tweetler nasıl görülür</a> yazılarını okuyun. Saklamak istediğiniz flood'ları <a href="/tr/twitter-flood-pdf">flood PDF</a> ile ya da <a href="/tr/twitter-flood-okuma">flood okuma aracıyla</a> kaydetmek daha iyidir.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'Wayback Machine tweetleri kaydediyor mu?', a: 'Bazen. Bir gönderiyi yalnızca tarayıcısı ya da bir kullanıcı o sayfayı yakaladıysa saklar. X kapsamı eksiktir ve en çok bilinen hesaplarda güçlüdür.' },
    { q: 'x.com mu twitter.com mu aramalıyım?', a: 'İkisini de. Eski yakalamalar genellikle twitter.com altındadır, yenileri x.com altında olabilir ve aynı status ID’si ikisinde de çıkabilir.' },
    { q: 'Bir hesabın arşivlenmiş tüm tweetlerini nasıl listelerim?', a: 'web.archive.org/web/*/twitter.com/kullanici/status/* gibi joker karakterli bir arama kullanın ve aynısını x.com ile tekrarlayın.' },
    { q: 'Bir tweet için Save Page Now kullanabilir miyim?', a: 'Deneyebilirsiniz, ama X arşivleyicileri çoğu zaman engellediği için anlık görüntü bir giriş ekranı gösterebilir. Zaten silinmiş bir gönderiyi de yakalayamaz.' },
    { q: 'Wayback Machine’de hiçbir şey yoksa ne yapmalıyım?', a: 'archive.today’i deneyin ve ekran görüntüsü veya alıntı arayın. Hiçbiri yoksa gönderi büyük olasılıkla geri getirilemez.' },
  ],
});

/* ─── 8. X Makalesi nasıl yazılır ─── */

const writeArticle = guide({
  slug: SLUG.write,
  title: 'X’te Makale Nasıl Yazılır ve Yayımlanır | Xtracticle',
  description:
    'X’te makale nasıl yazılır: kimler yayımlayabilir, editör nerede, biçimlendirme ve kapak görseli, yayımlandıktan sonra düzenleme ve yedekleme.',
  h1: 'X’te Makale Nasıl Yazılır ve Yayımlanır?',
  sub: 'Uygunluktan yayımla düğmesine: neye ihtiyacınız olduğu, editörün neler sunduğu ve bitmiş yazınızın kopyasını nasıl saklayacağınız.',
  primary: 'md',
  sections: `
${takeaways([
  `Makale yayımlamak ücretli bir plan gerektirir: ${WHEN} X’in yardım sayfası bunu Premium, Premium+, Premium Business ve Premium Organizations hesaplarıyla sınırlıyor.`,
  'X’in gezinme menüsünden Makaleler bölümünü açın ve yeni bir Makale yazmayı seçin. Uygulamalarda kullanılabilirlik değişti; bu yüzden en güvenli başlangıç x.com’daki web sürümüdür.',
  'Başlık, kapak görseli, alt başlıklar, listeler, linkler, görseller, video ve gömülü gönderiler kullanabilirsiniz.',
  'X’e göre yayımlanmış bir Makaleyi düzenlemek, siz yeniden yayımlayana kadar onu yayından kaldırır.',
  'Her Makaleyi yayımladığınızda yedekleyin. <a href="' + L('backup') + '">Yedekleme rehberine</a> bakın.',
])}

<section>
  <h2>Makaleyi kimler yazabilir?</h2>
  <p>X, Makaleleri 2024’te Premium+ aboneleri için başlattı ve sonra erişimi genişletti. ${WHEN_CAP}, X’in <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">Makaleler yardım sayfası</a> yayımlamanın Premium ve Premium+ aboneleri, Premium Businesses ve Premium Organizations ile sınırlı olduğunu söylüyor. Plan adları ve fiyatlar değişir; seçenek yoksa kendi hesabınızı kontrol edin.</p>
  <p>Yayımlanmış bir Makaleyi herkes okuyabilir. Daha fazla bilgi için <a href="${L('whatAre')}">X Makaleleri nedir?</a> yazısına bakın.</p>
</section>

<section>
  <h2>Adım adım</h2>
  <ol class="xt-steps">
    <li>Uygun bir hesapla bilgisayardan x.com'a giriş yapın.</li>
    <li>Sol gezinme menüsünde <strong>Makaleler</strong>’i bulun. Görmüyorsanız aboneliğinizi kontrol edin ya da gönderi yazma menüsünde Makale yazma seçeneğini arayın.</li>
    <li>Yeni bir taslak açmak için <strong>Yaz</strong>’ı seçin. X taslakları kaydeder; sonra geri dönebilirsiniz.</li>
    <li>Bir başlık, ardından gövde metnini ekleyin. İsterseniz bir kapak görseli ekleyin.</li>
    <li>Önizleyin, sonra <strong>Yayımla</strong>’ya basın. Makale profilinizde görünür ve gönderi olarak paylaşılabilir.</li>
  </ol>
  <p>Kesin etiketler ve menü konumları X ürünü güncelledikçe değişir. Bir ad yukarıdakinden farklıysa ekranınızda göreni kullanın.</p>
</section>

<section>
  <h2>Editör neler yapabilir?</h2>
  <p>X’in yardım sayfasına göre Makaleler görsel, video, GIF, gömülü gönderi ve link içerebilir. Metin biçimlendirmesi başlıkları, alt başlıkları, kalın, italik, üstü çizili, girintiyi ve numaralı ya da madde işaretli listeleri kapsar.</p>
  <h3>Kapak görseli</h3>
  <p>Kapak, Makalenin en üstünde ve genellikle zaman akışı önizlemesinde görünür. X’in yardım sayfası doğrulayabildiğimiz görsel boyutları vermiyor. Önizleme görseli kırptığı için geniş bir görsel en iyisidir; metni çerçevenin iyice içinde tutun ve yayımladıktan sonra nasıl göründüğünü test edin.</p>
  <h3>Gönderi ve medya gömme</h3>
  <p>Başka bir gönderiyi gömmek için linkini yapıştırın, bir noktayı desteklediği yerlere görsel ekleyin. Editör sunuyorsa erişilebilirlik için alternatif metin eklemeye değer.</p>
</section>

<section>
  <h2>Düzenleme ve silme</h2>
  <p>X’in yardım sayfasına göre yayındaki bir Makaleyi değiştirmek için onu açar, üç nokta menüsünü kullanır ve <em>Makaleyi düzenle</em>’yi seçersiniz. Bu, Makaleyi yayından kaldırır; siz yeniden yayımlayana kadar okurlar göremez. Bu yüzden düzenlemeleri tek oturumda yapın ve yoğun trafik sırasında yazım hatası düzeltmekten kaçının. Silme de aynı menüde. Bildiğimiz kadarıyla ${WHEN} X'in Makaleler için yerleşik bir zamanlayıcısı yoktu; yani düğmeye bastığınızda yayımlanır.</p>
</section>

<section>
  <h2>Okunaklı Makaleler için ipuçları</h2>
  <ul>
    <li><strong>Ana fikirle başlayın.</strong> Başlık ve ilk iki paragraf insanların devam edip etmeyeceğini belirler.</li>
    <li><strong>Her başlığa tek bir iş verin.</strong> Okurlar göz gezdirir; başlıklar hikâyeyi kendi başlarına anlatmalı.</li>
    <li><strong>Paragrafları kısa tutun</strong> ve adımlar ya da karşılaştırmalar için liste kullanın.</li>
    <li><strong>Görselleri bir amaçla kullanın</strong>; grafik, ekran görüntüsü ya da örnek gibi.</li>
    <li><strong>Kaynaklarınıza link verin.</strong> Güven oluşturur ve okurların sizi kontrol etmesine yardım eder.</li>
    <li><strong>Flood’u Makaleye mi çeviriyorsunuz?</strong> Yeniden yazın. Flood’un merak uyandıran kapanışları ve numaralandırması tek belgede tuhaf durur.</li>
    <li><strong>Yalnızca başlığı değil, ana fikri söyleyen bir giriş gönderisiyle</strong> paylaşın.</li>
  </ul>
</section>

<section>
  <h2>Yayımladıktan sonra: kaydedin ve paylaşın</h2>
  <p>X’te bir Makale için dışa aktarma düğmesi yok. Paylaşmak için PDF, metni başka yerde kullanmak için Markdown ve ZIP almak üzere gönderi linkini (<code>/status/</code> içeren) <a href="/tr/">Xtracticle</a>’a yapıştırın. Okurlar da aynısını <a href="/tr/x-makale-pdf">X Makale PDF</a> ile hesapsız yapabilir; bu, <a href="${L('readWithout')}">hesapsız X Makalesi okuma</a> yazısında anlatılıyor. Yazarlar kendi arşivini saklamalı; çünkü gönderiler silinebilir ya da hesaplar askıya alınabilir. Tam bir rutin için <a href="${L('backup')}">X Makalelerinizi nasıl yedekleyeceğinize</a> bakın.</p>
  <p>X'i yayımlamak için başka yerlerle kıyaslıyorsanız <a href="${L('versus')}">X Makaleleri, Substack ve Medium</a> yazısı üçünü karşılaştırır. Uzunluk ve medya kuralları için <a href="${L('limits')}">X Makaleleri limitleri</a> yazısına bakın.</p>
</section>

${privacy('tr')}`,
  faq: [
    { q: 'X’te makaleyi kimler yazabilir?', a: 'Bu yazının hazırlandığı sırada (Ekim 2026) X, yayımlamanın Premium, Premium+, Premium Business ve Premium Organizations hesaplarıyla sınırlı olduğunu söylüyor. Makaleleri herkes okuyabilir.' },
    { q: 'X Makalesini nerede yazarım?', a: 'x.com’da X’in gezinme menüsündeki Makaleler seçeneğini kullanın ve yeni bir Makale yazmayı seçin. Etiket ve konum değişebilir, uygulamalarda kullanılabilirlik de farklı olmuştur.' },
    { q: 'X Makalesini yayımladıktan sonra düzenleyebilir miyim?', a: 'Evet. X’e göre üç nokta menüsünü kullanıp Makaleyi düzenle’yi seçin. Bu, yeniden yayımlayana kadar Makaleyi yayından kaldırır.' },
    { q: 'X Makalesini zamanlayabilir miyim?', a: 'Makaleler için yerleşik bir zamanlayıcı bulamadık. Bazı üçüncü taraf araçlar zamanlama sunuyor; güvenmeden önce onları kontrol edin.' },
    { q: 'X Makalemi nasıl kaydederim?', a: 'Gönderi linkini Xtracticle’a yapıştırın ve Markdown, PDF veya görselli ZIP indirin.' },
  ],
});

/* ─── 9. X Makaleleri limitleri ─── */

const limits = guide({
  slug: SLUG.limits,
  title: 'X Makaleleri Limitleri: Uzunluk, Medya, Kimler | Xtracticle',
  description:
    'X Makaleleri uzunluk sınırı, medya ve kimlerin yayımlayıp okuyabildiği. Yaklaşık rakamlar, düzenleme kuralları; uzun gönderi ve flood ile karşılaştırma.',
  h1: 'X Makaleleri Limitleri: Uzunluk, Medya ve Gereksinimler',
  sub: 'Bir X Makalesi ne kadar uzun olabilir, içine neler konabilir, kimler yayımlayabilir ve kimler okuyabilir; belirsiz rakamlar işaretli.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Bildiğimiz kadarıyla X, Makaleler için kesin bir uzunluk rakamı yayımlamadı. Üçüncü taraf kaynaklar sınırı yaklaşık 100.000 karakter, yani kabaca 15.000 kelime olarak veriyor.',
  `Yayımlamak ücretli bir plan gerektirir. ${WHEN_CAP}, X Premium, Premium+, Premium Business ve Premium Organizations’ı sayıyor.`,
  'Herkese açık bir Makaleyi yazarın ayarlarına göre herkes okuyabilir. Abonelik gerekmez.',
  'Makaleler; görsel, video, GIF, link ve gömülü gönderi içerebilir, başlıkları ve listeleri vardır.',
  'Yayımlanmış bir Makaleyi düzenlemek, yeniden yayımlayana kadar onu yayından kaldırır.',
])}

<section>
  <h2>Uzunluk sınırı</h2>
  <p>X’in <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">Makaleler yardım sayfası</a> Makalelerin neler içerebileceğini anlatıyor, ama orada belirli bir karakter sayısı bulamadık. 2024’teki lansmanla ilgili haberler, test edenlerin 100.000 karakterin biraz üzerinde bir tavana çarptığını söyledi; birkaç kaynak bunu yaklaşık 15.000 kelimeye çeviriyor ve 2026’da güncellenen rehberler hâlâ aynı sayıyı tekrarlıyor. Social Media Today aynı karakter rakamı için daha yüksek bir kelime sayısı tahmin etti, çünkü kelimeler insanların varsaydığından kısa; bu yüzden kelime sayısı yalnızca kaba bir kılavuzdur.</p>
  <p>100.000 karakteri yaklaşık kabul edin. Pratikte çok az Makale buna yaklaşır: bu kısa bir kitap bölümü ya da çok uzun bir deneme kadardır. Bu uzunlukta bir şey yazıyorsanız indirilebilir bir belge okurlara daha iyi hizmet edebilir.</p>
</section>

<section>
  <h2>Medya ve biçimlendirme</h2>
  <p>X’e göre Makaleler görsel, video, GIF, gömülü gönderi ve link içerebilir. Metinde başlıklar, alt başlıklar, kalın, italik, üstü çizili, girinti ve numaralı ya da madde işaretli listeler kullanılabilir. Makale editöründeki görsel veya video dosya boyutu sınırlarını doğrulayamadık; büyük bir dosya yayımlamadan önce herhangi bir hata için editörün kendisine bakın.</p>
</section>

<section>
  <h2>Kimler yayımlayabilir, kimler okuyabilir?</h2>
  <ul>
    <li><strong>Yayımlamak:</strong> Premium kademesi hesaplar. Özellik 2024’te Premium+ ile başladı; X’in güncel yardım sayfası Premium ve Premium+ abonelerini, ayrıca Premium Businesses ve Premium Organizations’ı sayıyor. Kurallar değişebilir; hesabınızı kontrol edin.</li>
    <li><strong>Okumak:</strong> gönderiyi görebilen herkes. Herkese açık Makaleler ödeme yapmadan açılabilir. Giriş yapmamış okurlar x.com’da uyarılarla ya da kısıtlı görünümlerle karşılaşabilir; bu, <a href="${L('readWithout')}">hesapsız X okuma</a> yazısında anlatılıyor.</li>
    <li><strong>Görünürlük:</strong> bir Makale profilinize yayımlanır ve bir gönderi aracılığıyla paylaşılır. Korumalı hesapların içeriği onaylı takipçilerle sınırlı kalır.</li>
  </ul>
  <p>Arka plan için <a href="${L('whatAre')}">X Makaleleri nedir?</a> ve adım adım <a href="${L('write')}">X Makalesi nasıl yazılır</a> yazılarına bakın.</p>
</section>

<section>
  <h2>Yayımladıktan sonra düzenleme</h2>
  <p>X’in yardım sayfasına göre yayımlanmış bir Makaleyi üç nokta menüsünden <em>Makaleyi düzenle</em> ile düzenleyebilirsiniz. Bu onu yayından kaldırır ve siz yeniden yayımlayana kadar gizli kalır. Silme aynı menüde. Silinen bir Makale okurlar için de gittiğinden, ileride isteyebilecekseniz önce bir kopya kaydedin (bkz. <a href="${L('backup')}">yedekleme rehberi</a>).</p>
</section>

<section>
  <h2>Makale, uzun gönderi ve flood</h2>
  <p>Aşağıdaki rakamlar yaklaşıktır ve ${WHEN} üçüncü taraf haberlere dayanır.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Standart gönderi</th><th>Uzun gönderi</th><th>Flood</th><th>X Makalesi</th></tr></thead>
    <tbody>
      <tr><td>Uzunluk</td><td>Çoğu hesapta 280 karakter</td><td>Ücretli aboneler için yaklaşık 25.000 karakter olduğu bildirildi</td><td>Çok sayıda gönderi, her birinin kendi sınırı var</td><td>Yaklaşık 100.000 karakter (yaklaşık)</td></tr>
      <tr><td>Başlıklar ve listeler</td><td>Yok</td><td>Yok</td><td>Yok</td><td>Var</td></tr>
      <tr><td>Başlık ve kapak görseli</td><td>Yok</td><td>Yok</td><td>Yok</td><td>Var</td></tr>
      <tr><td>Kimler oluşturabilir</td><td>Herkes</td><td>Ücretli aboneler</td><td>Herkes</td><td>Premium kademesi hesaplar</td></tr>
      <tr><td>Etkileşim</td><td>Tek gönderi</td><td>Tek gönderi</td><td>Her gönderi ayrı</td><td>Makaleye link veren tek bir gönderi</td></tr>
    </tbody>
  </table></div>
  <p>Yapıya ihtiyaç duymayan tek bir fikir için uzun gönderiyi, her adımda yanıtlarla bir sohbet istediğinizde flood’u, yazının başlıklara, görsellere ve kendine ait bir okuma deneyimine ihtiyacı olduğunda Makaleyi seçin.</p>
</section>

<section>
  <h2>Okuduklarınızı kaydetmek</h2>
  <p>Uzunluk kaydetmek için sorun değil: uzun bir Makale çok sayfalı bir dosyaya dönüşür. Linki <a href="/tr/">Xtracticle</a>’a yapıştırın ya da <a href="/tr/x-makale-pdf">X Makale PDF</a> sayfasını kullanın. Flood’lar için <a href="/tr/twitter-flood-pdf">flood PDF</a> var, tekil gönderiler ise <a href="/tr/tweet-pdf">tweet PDF</a> üzerinden kaydedilir.</p>
</section>`,
  faq: [
    { q: 'X Makaleleri için karakter sınırı nedir?', a: 'X, bulabildiğimiz kadarıyla kesin bir rakam belirtmiyor. Üçüncü taraf kaynaklar yaklaşık 100.000 karakter, kabaca 15.000 kelime olduğunu bildiriyor. Yaklaşık kabul edin.' },
    { q: 'X Makalelerini kimler yayımlayabilir?', a: 'Bu yazının hazırlandığı sırada (Ekim 2026) X, Premium, Premium+, Premium Business ve Premium Organizations hesaplarını sayıyor.' },
    { q: 'X Makalesini okumak için Premium gerekir mi?', a: 'Hayır. Herkese açık Makaleler abonelik olmadan okunabilir.' },
    { q: 'X Makalesini yayımladıktan sonra düzenleyebilir miyim?', a: 'Evet. X’in yardım sayfasına göre üç nokta menüsünden Makaleyi düzenle’yi seçin. Makale yeniden yayımlayana kadar yayından kalkar.' },
    { q: 'Makale uzun gönderiden nasıl farklıdır?', a: 'Uzun gönderi hâlâ başlığı ya da alt başlıkları olmayan düz bir gönderidir. Makalenin başlığı, isteğe bağlı kapak görseli, alt başlıkları, listeleri ve gömülü medyası vardır; daha fazla metne de izin verir.' },
  ],
});

/* ─── Hub ─── */

const GUIDES: { page: SitePage; blurb: string }[] = [
  { page: whatAre, blurb: 'X Makaleleri nedir, kimler yayımlayabilir, flood’dan farkı ne ve nasıl kaydedilir.' },
  { page: readWithout, blurb: 'X Makalelerini, flood’ları ve gönderileri giriş yapmadan okuma; x.com yerine xtracticle.com yöntemi dahil.' },
  { page: deleted, blurb: 'Bir gönderi silindikten sonra nelerin geri getirilip nelerin getirilemeyeceği ve önemlilerin nasıl güvende tutulacağı.' },
  { page: versus, blurb: 'X Makaleleri, Substack ve Medium; kitle, gelir, sahiplik, dışa aktarma ve SEO açısından karşılaştırma.' },
  { page: backup, blurb: 'Kendi X Makalelerinizi ve flood’larınızı Markdown, ZIP ve PDF olarak yedeklemek için pratik bir plan.' },
  { page: seeDeleted, blurb: 'Başkasının silinmiş gönderisinin kopyası nerede olabilir, neler hiç işe yaramaz ve gönderiler önceden nasıl kaydedilir.' },
  { page: wayback, blurb: 'Adım adım: arşivlenmiş tweetler için URL biçimleri, joker karakterli arama, takvim, Save Page Now ve archive.today.' },
  { page: writeArticle, blurb: 'X Makalesini kimler yayımlayabilir, editör nerede, biçimlendirme, düzenleme ve nasıl yedeklenir.' },
  { page: limits, blurb: 'Yaklaşık X Makalesi uzunluk sınırı, medya, kimler yayımlar veya okur; uzun gönderi ve flood ile karşılaştırma tablosu.' },
];

const hub: SitePage = {
  id: 'tr-guides',
  group: 'guides',
  path: HUB,
  file: 'tr/rehberler.html',
  lang: 'tr',
  title: 'Rehberler — X (Twitter) İçeriğini Kaydetme, Okuma | Xtracticle',
  description:
    'X (Twitter) Makaleleri hakkında pratik rehberler: nedir, girişsiz okuma, silinen gönderiler, platform karşılaştırması ve yazılarınızı yedekleme.',
  h1: 'Rehberler: X İçeriğini Kaydetme, Okuma ve Arşivleme',
  sub: 'X Makaleleri, flood’lar ve gönderiler hakkında kısa, pratik rehberler ve bunların kopyasını nasıl saklayacağınız.',
  primary: 'pdf',
  nav: 'Rehberler',
  sections: `
<section>
  <h2>Tüm rehberler</h2>
  <ul>${GUIDES.map(g => `<li><a href="${g.page.path}"><strong>${g.page.h1}</strong></a> — ${g.blurb}</li>`).join('')}</ul>
</section>

<section>
  <h2>Bir şey kaydetmeye hazır mısınız?</h2>
  <p>Herhangi bir X linkini <a href="/tr/">Xtracticle</a>’a yapıştırın ya da doğrudan <a href="/tr/x-makale-pdf">X Makale PDF</a>, <a href="/tr/x-makale-markdown">Markdown</a>, <a href="/tr/x-makale-epub-kindle">EPUB</a> veya <a href="/tr/twitter-flood-pdf">flood PDF</a> sayfasına gidin.</p>
</section>`,
  faq: [],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Xtracticle rehberleri',
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
