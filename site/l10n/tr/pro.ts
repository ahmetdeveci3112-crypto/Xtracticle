import { GITHUB } from '../../blocks';
import type { ProCopy } from '../../pro-page';

/** Turkish copy of the /pro page (formal "siz"). */
export const PRO_TR: ProCopy = {
  title: 'Xtracticle Pro — Tam Arşiv, CSV, 200 Linklik Toplu İşlem, API Anahtarı | Xtracticle',
  description:
    'Xtracticle Pro: bir hesabın arşivlenmiş tüm gönderileri ve CSV dışa aktarma, 200 linklik toplu işlemler, daha yüksek kotalı kişisel MCP/API anahtarı ve künye satırı olmayan PDF’ler. Ayda 5 $, yılda 36 $ veya tek seferlik 59 $.',
  h1: 'Xtracticle Pro',
  sub: 'Temel her şey ücretsiz kalıyor. Pro, ağır özellikleri ekler ve sunucuların masrafını karşılar — hesap yok, yalnızca bir lisans anahtarı.',
  nav: 'Pro',
  pitch:
    'Xtracticle ücretsizdir, reklam göstermez ve giriş istemez; bu değişmeyecek. Pro, çalıştırılması pahalı olan birkaç iş için: ' +
    'arşivlerin tamamı, büyük toplu işlemler ve bütün gün X okuyan yapay zekâ asistanları. Pro satın almak, ücretsiz aracı ücretsiz tutar.',
  featuresH2: 'Pro neler ekliyor?',
  features: [
    '<strong>Arşivlenmiş gönderilerin tam listesi</strong>: <a href="/tr/silinen-tweetleri-bulma">Silinen Tweetleri Bulma</a> aracında en yeni 50 gönderi yerine Wayback Machine’in o hesap için tuttuğu her gönderi (1.500’e kadar) ve <strong>CSV dışa aktarma</strong>.',
    '<strong>200 linke kadar toplu mod</strong>: 20 yerine 200 gönderi tek ZIP’te.',
    '<strong>Kişisel MCP / API anahtarı</strong>: lisans anahtarınızı <code>Authorization: Bearer</code> başlığıyla <a href="/tr/mcp-sunucusu">MCP sunucusuna</a> ve Markdown API’sine gönderin; ücretsiz katmanın istek sınırları sizin için geçerli olmaz.',
    '<strong>PDF ve EPUB’larda “Kaydeden: Xtracticle” satırı yok.</strong>',
    '<strong>Yeni özelliklere ilk erişim</strong>: yenilikler önce Pro kullanıcılarına açılır, istekleri yol haritasını belirler.',
  ],
  pricingH2: 'Fiyatlar',
  monthly: 'Aylık',
  yearly: 'Yıllık',
  lifetime: 'Ömür boyu',
  perMonth: '/ ay',
  perYear: '/ yıl',
  once: 'tek seferlik',
  monthlyNote: 'İstediğiniz zaman iptal edebilirsiniz.',
  yearlyNote: 'Ayda 3 $’a gelir; %40 indirim.',
  lifetimeNote: 'İlk 100 alıcı için lansman fiyatı. Bir kez ödeyin, hep sizin olsun.',
  buy: 'Pro’ya geç',
  soon: 'Pro neredeyse hazır. Satış birkaç gün içinde açılıyor; o zamana kadar bu sayfadaki her şey ücretsiz.',
  checkoutHint:
    'Ödemeleri <a href="https://polar.sh" rel="noopener">Polar</a> alır (kart, Apple Pay, Google Pay). Lisans anahtarınız ödemeden sonra bir dakika içinde e-postayla gelir; Xtracticle’da hesap açılmaz.',
  keyH2: 'Anahtarınız var mı? Buraya girin',
  keyIntro: 'Polar e-postasındaki lisans anahtarını yapıştırın. Pro bu tarayıcıda etkinleşir; kullandığınız her cihazda aynısını yapın.',
  keyLabel: 'Lisans anahtarı',
  activate: 'Etkinleştir',
  msgWorking: 'Anahtar kontrol ediliyor…',
  msgOk: 'Pro bu tarayıcıda etkin. İyi kullanımlar!',
  msgAlready: 'Pro bu tarayıcıda zaten etkin.',
  msgInvalid: 'Bu anahtar tanınmadı. Yazım hatası olup olmadığını (anahtar XTPRO ile başlar) veya aboneliğin sona erip ermediğini kontrol edin.',
  msgLimit: 'Bu anahtar zaten 3 cihazda etkin. Polar müşteri panelinden (fiş e-postanızdaki link) bir cihazı kaldırıp tekrar deneyin.',
  msgUpstream: 'Lisans sunucusu yanıt vermedi. Lütfen bir dakika sonra tekrar deneyin.',
  msgUnavailable: 'Pro henüz açılmadı. Lütfen birkaç gün sonra tekrar bakın.',
  msgRate: 'Çok fazla deneme yapıldı. Birkaç saniye bekleyip tekrar deneyin.',
  msgNetwork: 'Ağ hatası — bağlantınızı kontrol edip tekrar deneyin.',
  success: 'Ödemeniz alındı, teşekkürler! Lisans anahtarınız Polar’dan gelen e-postada. Pro’yu açmak için aşağıya yapıştırın.',
  faq: [
    { q: 'Lisans anahtarımı nasıl alırım?', a: 'Ödemenin hemen ardından Polar size bir lisans anahtarı e-postalar (onay sayfasında ve Polar müşteri panelinde de görünür). Anahtarı bu sayfadaki forma yapıştırın; Pro o tarayıcıda etkinleşir.' },
    { q: 'Hesap açmam gerekiyor mu?', a: 'Hayır. Xtracticle’da hesap yoktur. Kontrol ettiğimiz tek şey anahtardır; cihazınızda şifrelenmiş bir çerezde 30 günlük dönemlerle saklanır ve planınız etkin olduğu sürece kendini yeniler.' },
    { q: 'Anahtar kaç cihazda çalışır?', a: 'Aynı anda en fazla 3 cihazda. Kullandığınız her tarayıcıya aynı anahtarı girin. Polar müşteri panelinden bir cihazı kaldırabilirsiniz.' },
    { q: 'İptal edebilir miyim?', a: 'Evet, istediğiniz zaman; fiş e-postanızdaki müşteri paneli linkinden. Pro, ödediğiniz dönemin sonuna kadar etkin kalır. Ömür boyu plan tek ödemedir, iptal edilecek bir şey yoktur.' },
    { q: 'Para iadesi var mı?', a: 'Evet: 14 gün içinde, soru sorulmadan. GitHub’da bir konu açın ya da X’te @DvciAhmet’e yazın, ödeme iade edilir.' },
    { q: 'Pro, ücretsiz kullanıcıların aldıklarını değiştiriyor mu?', a: 'Hayır. Tekil gönderiler, flood’lar, makaleler, tüm dışa aktarma biçimleri, ilk 50 arşivlenmiş gönderi ve 20 linklik toplu işlemler ücretsiz kalır; reklam ve giriş yok.' },
    { q: 'Sorularımı nereye iletebilirim?', a: `GitHub’da bir konu açın (${GITHUB.replace('https://', '')}) ya da X’te @DvciAhmet’e mesaj gönderin.` },
  ],
};
