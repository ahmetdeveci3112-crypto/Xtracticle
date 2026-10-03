/** Arabic (Modern Standard Arabic) pages. */
import { samplePdfFigure, EXAMPLE, GITHUB, privacy, shortcuts, steps, type SitePage } from './blocks';

const home: SitePage = {
  id: 'ar-home',
  group: 'home',
  path: '/ar/',
  file: 'ar/index.html',
  lang: 'ar',
  isHome: true,
  title: 'تحميل مقالات X وثريدات تويتر بصيغة PDF وMarkdown | Xtracticle',
  description:
    'حمّل مقالات X (تويتر) والثريدات والمنشورات مجانًا بصيغة PDF أو Markdown أو EPUB أو نص. الصق الرابط واحصل على ملف نظيف بصوره، بلا تسجيل دخول.',
  h1: 'تحميل مقالات X',
  sub: 'حمّل مقالات X (تويتر) والثريدات والمنشورات بصيغة PDF أو Markdown أو EPUB أو نص، مجانًا ودون تسجيل دخول.',
  primary: 'md',
  nav: 'تحميل مقالات X',
  sections: `
<section>
  <h2>كيف تحمّل مقالة من X</h2>
  ${steps([
    '<strong>انسخ رابط المنشور</strong>. في X اضغط <em>مشاركة ← نسخ الرابط</em>. يصلح أي منشور من الثريد.',
    '<strong>الصقه في الحقل أعلاه</strong>. يجلب Xtracticle المقالة أو الثريد أو المنشور خلال ثانية أو ثانيتين.',
    '<strong>اختر الصيغة</strong>: PDF أو Markdown أو EPUB/Kindle أو ZIP مع الصور أو نص عادي.',
    '<strong>انتهى الأمر</strong>. يمكنك أيضًا نسخ المحتوى، أو إرساله إلى Obsidian، أو الاستماع إليه.',
  ])}
  <p>تريد أن ترى النتيجة أولًا؟ <a href="${EXAMPLE}">افتح مقالة X تجريبية</a>.</p>
</section>

<section>
  <h2>كل الصيغ التي تحتاجها</h2>
  <div class="xt-grid">
    <div><h3><a href="/ar/x-article-to-pdf">تحويل مقالة X إلى PDF</a></h3><p>تنسيق A4 جاهز للطباعة، والصور مضمّنة، وفي كل صفحة رابط المصدر ورقم الصفحة.</p></div>
    <div><h3><a href="/ar/x-article-to-markdown">تحويل مقالة X إلى Markdown</a></h3><p>يحافظ على العناوين والخط العريض والروابط والقوائم والاقتباسات والصور، مع YAML front-matter اختياري.</p></div>
    <div><h3><a href="/ar/x-article-to-epub">تحويل مقالة X إلى EPUB / Kindle</a></h3><p>اقرأ المقالات الطويلة على Kindle أو Kobo أو Apple Books، والصور مضمّنة.</p></div>
    <div><h3><a href="/ar/save-x-articles-to-obsidian">حفظ مقالات X في Obsidian</a></h3><p>بنقرة واحدة تُنشأ ملاحظة جديدة في مخزنك تحوي المقالة كاملة مع بياناتها.</p></div>
    <div><h3>ZIP مع الصور</h3><p>ملف Markdown مع كل الصور محفوظة محليًا، أرشيف حقيقي بلا اتصال، حتى لو حُذف المنشور.</p></div>
    <div><h3>نص عادي</h3><p>ملف .txt نظيف يصلح لأي جهاز أو سكربت أو أداة ذكاء اصطناعي.</p></div>
  </div>
</section>

<section>
  <h2>المقالات والثريدات والمنشورات المفردة</h2>
  <p><strong>مقالات X</strong> (المنشورات الطويلة التي تصل إلى 100,000 حرف) تُحوَّل كتلةً كتلة: العناوين، والخط العريض والمائل والمشطوب، والروابط، والقوائم النقطية والمرقمة، والاقتباسات، والأكواد، والفواصل، وصورة الغلاف، وصور المتن، والفيديو، والمنشورات المضمّنة.</p>
  <p><strong>الثريدات</strong> تُفرد تلقائيًا. الصق رابط أول منشور أو أي منشور في الوسط أو الأخير، فيعثر Xtracticle على الثريد كاملًا ويجمعه في مستند واحد مرقّم. جرّب <a href="/ar/x-thread-to-pdf">أداة تحميل ثريدات X</a>.</p>
  <p><strong>المنشورات المفردة</strong> تحتفظ بالنص وفواصل الأسطر والصور والفيديو والمنشورات المقتبسة. وإن أردت معالجة عدة منشورات دفعة واحدة، فبدّل إلى <em>الوضع المجمّع</em> والصق حتى 20 رابطًا لتحصل على ملف ZIP واحد.</p>
</section>

${shortcuts('ar')}

<section>
  <h2>Xtracticle مقارنةً بطرق أخرى لحفظ منشورات X</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th><th>لقطة شاشة / نسخ ولصق</th></tr></thead>
    <tbody>
      <tr><td>مقالات X (المنشورات الطويلة)</td><td>✅ بتنسيقها الكامل</td><td>❌ غير مدعومة</td><td>⚠️ يدويًا</td></tr>
      <tr><td>PDF مجاني</td><td>✅</td><td>Premium (3 دولارات شهريًا)</td><td>⚠️ صورة فقط</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅</td><td>❌</td><td>❌</td></tr>
      <tr><td>بلا بوت @ ولا تسجيل دخول</td><td>✅</td><td>يحتاج بوت @ أو موقعه</td><td>✅</td></tr>
      <tr><td>مفتوح المصدر</td><td>✅</td><td>❌</td><td>—</td></tr>
    </tbody>
  </table></div>
  <p>هل تستخدم Thread Reader App؟ اطلع على <a href="/ar/thread-reader-app-alternative">المقارنة الكاملة</a>.</p>
</section>

${privacy('ar')}`,
  faq: [
    { q: 'هل Xtracticle مجاني؟', a: 'نعم، مجاني. المشروع مفتوح المصدر، ولا يحتاج إلى تسجيل أو دخول، وليس له حد للاستخدام.' },
    { q: 'كيف أحمّل مقالة من X بصيغة PDF؟', a: 'انسخ رابط المنشور، والصقه في Xtracticle، ثم اضغط PDF. يتضمن الملف العنوان والكاتب والتاريخ ورابط المصدر وكل الصور وأرقام الصفحات.' },
    { q: 'هل يمكنني تحميل ثريد تويتر كاملًا؟', a: 'نعم. الصق رابط أي منشور من الثريد، الأول أو الأوسط أو الأخير. يجد Xtracticle كل منشورات الكاتب في الثريد ويجمعها في مستند واحد مرقّم.' },
    { q: 'ما الفرق بين مقالة X والمنشور العادي؟', a: 'مقالة X منشور طويل بتنسيق غني (عناوين وقوائم وصور)، أما المنشور العادي فقصير. يدعم Xtracticle النوعين، ويدعم الثريدات أيضًا.' },
    { q: 'هل يمكنني حفظ مقالة X في Obsidian أو Notion؟', a: 'نعم. نزّل ملف Markdown أو اضغط زر Obsidian، فيُنسخ المحتوى وتُفتح ملاحظة جديدة. ويستورد Notion ملفات .md مباشرة.' },
    { q: 'لماذا تظهر رسالة أن المنشور غير موجود؟', a: 'ربما حُذف المنشور، أو هو من حساب خاص (محمي)، أو عليه قيد عمري. لا يمكن تحميل إلا المنشورات العامة.' },
    { q: 'حصلت على رابط بصيغة x.com/i/article/… فماذا أفعل؟', a: 'هذا رابط قارئ المقالات. افتح المقالة في X، واضغط «مشاركة ← نسخ الرابط» لتحصل على رابط المنشور (x.com/user/status/…)، ثم الصقه.' },
  ],
};

const pdf: SitePage = {
  id: 'ar-pdf',
  group: 'pdf',
  path: '/ar/x-article-to-pdf',
  file: 'ar/x-article-to-pdf.html',
  lang: 'ar',
  title: 'تحويل مقالة X وتغريدة إلى PDF مجانًا | Xtracticle',
  description:
    'حوّل أي مقالة أو منشور من X (تويتر) إلى PDF نظيف وجاهز للطباعة، مع الصور ورابط المصدر وأرقام الصفحات. مجانًا وبلا تسجيل دخول، على الجوال والحاسوب.',
  h1: 'تحويل مقالة X إلى PDF',
  sub: 'حوّل أي مقالة أو ثريد أو تغريدة من X (تويتر) إلى PDF نظيف وجاهز للطباعة، مع الصور ودون تسجيل دخول.',
  primary: 'pdf',
  nav: 'تحويل مقالة X إلى PDF',
  sections: `
<section>
  <h2>ثلاث خطوات لتحويل مقالة X إلى PDF</h2>
  ${steps([
    '<strong>انسخ رابط مقالة X</strong> (مشاركة ← نسخ الرابط).',
    '<strong>الصقه في الحقل أعلاه</strong> ثم اضغط «استخراج».',
    '<strong>اضغط PDF</strong> فيبدأ تنزيل الملف فورًا.',
  ])}
</section>

<section>
  ${samplePdfFigure('ar')}
</section>

<section>
  <h2>كيف يبدو ملف PDF</h2>
  <ul>
    <li><strong>تنسيق A4 نظيف</strong> بلا الشريط الجانبي لـ X ولا الأزرار ولا الردود ولا الإعلانات، المقالة وحدها.</li>
    <li><strong>العنوان والكاتب والتاريخ ورابط المصدر</strong> في الأعلى ليسهل الاقتباس.</li>
    <li><strong>صورة الغلاف وصور المتن</strong> في أماكنها، وتتكيف مع عرض الصفحة.</li>
    <li><strong>أرقام الصفحات</strong> في التذييل مع رابط قابل للنقر إلى المنشور الأصلي.</li>
    <li><strong>لا قصّ للنص</strong>. تقع فواصل الصفحات بين الفقرات لا في وسطها، حتى في المقالات الطويلة جدًا.</li>
  </ul>
</section>

<section>
  <h2>نصائح</h2>
  <h3>هل تريد نصًّا قابلًا للتحديد والبحث؟</h3>
  <p>يُرسم ملف PDF صفحةً صفحة للحفاظ على دقة التنسيق. إن أردت تظليل النص أو البحث فيه، فاستخدم تصدير <a href="/ar/x-article-to-epub">EPUB</a> أو <a href="/ar/x-article-to-markdown">Markdown</a>. ويمكنك أيضًا الضغط على <code>Ctrl/Cmd + P</code> في صفحة النتيجة واختيار <em>حفظ بصيغة PDF</em>.</p>
  <h3>تحويل الثريد إلى PDF</h3>
  <p>الصق أي منشور من الثريد فيصبح الثريد كله ملف PDF واحدًا. التفاصيل في صفحة <a href="/ar/x-thread-to-pdf">تحويل الثريد إلى PDF</a>.</p>
  <h3>على iPhone</h3>
  <p>اضغط PDF، ثم افتح الملف من قائمة التنزيلات في Safari، واستخدم <em>مشاركة ← حفظ في «الملفات»</em>، أو أرسله إلى «الكتب».</p>
</section>

${privacy('ar')}`,
  faq: [
    { q: 'هل محوّل X إلى PDF مجاني؟', a: 'مجاني تمامًا، بلا علامة مائية ولا تسجيل دخول ولا حد للاستخدام.' },
    { q: 'هل تظهر الصور في ملف PDF؟', a: 'نعم. تُضاف صورة الغلاف وكل صور المتن. أما الفيديو فيظهر كصورة مصغّرة بها رابط.' },
    { q: 'هل يمكنني تحويل ثريد تويتر إلى PDF؟', a: 'نعم. الصق رابط أي منشور من الثريد فيجمع Xtracticle الثريد كاملًا في ملف PDF واحد.' },
    { q: 'هل يعمل على الجوال؟', a: 'نعم. يعمل في أي متصفح حديث على iPhone وAndroid وMac وWindows وLinux.' },
    { q: 'هل يمكنني تحويل منشور خاص أو محذوف؟', a: 'لا. لا يمكن تحويل إلا المنشورات العامة المتاحة حاليًا، وهذا بالضبط ما يجعل الاحتفاظ بنسخة PDF مفيدًا.' },
  ],
};

const markdown: SitePage = {
  id: 'ar-markdown',
  group: 'markdown',
  path: '/ar/x-article-to-markdown',
  file: 'ar/x-article-to-markdown.html',
  lang: 'ar',
  title: 'تحويل مقالة X وثريد تويتر إلى Markdown (.md) | Xtracticle',
  description:
    'حوّل مقالات X (تويتر) والثريدات والمنشورات إلى Markdown نظيف يحافظ على العناوين والروابط والقوائم والصور، مع YAML front-matter. مناسب لـ Obsidian وNotion.',
  h1: 'تحويل مقالة X إلى Markdown',
  sub: 'حوّل مقالات X (تويتر) والثريدات والمنشورات إلى Markdown نظيف، مع الحفاظ على التنسيق والروابط والصور.',
  primary: 'md',
  nav: 'تحويل مقالة X إلى Markdown',
  sections: `
<section>
  <h2>Markdown نظيف بدل نسخ ولصق فوضوي</h2>
  <p>تُخزَّن مقالات X ككتل نصية غنية. يحوّل Xtracticle كل كتلة إلى Markdown قياسي يُعرض بشكل صحيح في أي مكان:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>في X</th><th>في ملف .md</th></tr></thead>
    <tbody>
      <tr><td>عنوان رئيسي / عنوان فرعي</td><td><code>## Heading</code> / <code>### Subheading</code></td></tr>
      <tr><td>عريض، مائل، مشطوب</td><td><code>**bold**</code>، <code>*italic*</code>، <code>~~strike~~</code></td></tr>
      <tr><td>الروابط</td><td><code>[text](https://…)</code></td></tr>
      <tr><td>قوائم نقطية / مرقمة (متداخلة)</td><td><code>- item</code> / <code>1. item</code></td></tr>
      <tr><td>الاقتباسات والأكواد والفواصل</td><td><code>&gt; quote</code>، كتل أكواد مسوّرة، <code>---</code></td></tr>
      <tr><td>الصور والفيديو</td><td><code>![caption](url)</code>، وصورة مصغّرة للفيديو بها رابط</td></tr>
      <tr><td>المنشورات المضمّنة</td><td>رابط إلى المنشور المضمّن</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>مع YAML front-matter</h2>
  <p>يمكن أن يبدأ كل ملف ببيانات وصفية تتعرف عليها Obsidian (الخصائص) وHugo وJekyll وAstro وDataview:</p>
  <pre><code>---
title: "The article title"
author: "Author Name (@handle)"
source: "https://x.com/handle/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>لا تحتاجه؟ ألغِ تحديد <em>إضافة YAML front-matter إلى .md</em> أسفل أزرار التنزيل.</p>
</section>

<section>
  <h2>متى تستخدمه</h2>
  <ul>
    <li><strong>تنظيم الملاحظات</strong>: Obsidian وLogseq وNotion وBear وJoplin وأي محرر Markdown. راجع <a href="/ar/save-x-articles-to-obsidian">دليل Obsidian</a>.</li>
    <li><strong>أدوات الذكاء الاصطناعي</strong>: Markdown أنظف صيغة لتزويد ChatGPT أو Claude أو Gemini أو NotebookLM بالسياق. الصقه لتلخّصه أو تترجمه أو تسأل عنه.</li>
    <li><strong>الكتابة والنشر</strong>: للاستشهاد بالمصادر في المدونات والنشرات البريدية والوثائق وملفات README على GitHub.</li>
    <li><strong>الأرشفة</strong>: نزّل <em>ZIP مع الصور</em> لحفظ كل صورة محليًا بجانب ملف .md.</li>
  </ul>
</section>

${shortcuts('ar')}`,
  faq: [
    { q: 'كيف أحوّل تغريدة إلى Markdown؟', a: 'الصق رابط المنشور في Xtracticle ثم اضغط Markdown، أو اضغط «نسخ» لوضع Markdown في الحافظة.' },
    { q: 'هل يتضمن Markdown الصور؟', a: 'نعم، كروابط صور. وإن اخترت ZIP مع الصور فستُنزَّل كل صورة أيضًا ويشير Markdown إلى النسخ المحلية.' },
    { q: 'هل يمكن تحويل الثريدات إلى Markdown؟', a: 'نعم. الصق أي منشور من الثريد فتُجمع كل المنشورات في مستند Markdown واحد مرقّم.' },
    { q: 'هل يمكنني إيقاف YAML front-matter؟', a: 'نعم. ألغِ تحديد خيار front-matter أسفل أزرار التنزيل، ويُحفظ اختيارك.' },
  ],
};

const thread: SitePage = {
  id: 'ar-thread',
  group: 'thread',
  path: '/ar/x-thread-to-pdf',
  file: 'ar/x-thread-to-pdf.html',
  lang: 'ar',
  title: 'تحميل ثريد تويتر وحفظه بصيغة PDF أو Markdown | Xtracticle',
  description:
    'حوّل أي ثريد على X (تويتر) إلى ملف PDF أو Markdown أو EPUB أو نص واحد. الصق أي منشور من الثريد، بلا بوت @ ولا تسجيل دخول، ومجانًا.',
  h1: 'تحميل ثريد تويتر',
  sub: 'اجمع أي ثريد على X (تويتر) في ملف PDF أو Markdown أو EPUB أو نص نظيف. الصق أي منشور من الثريد.',
  primary: 'pdf',
  nav: 'تحميل ثريد تويتر',
  sections: `
<section>
  <h2>اجمع الثريد في ثوانٍ</h2>
  ${steps([
    '<strong>انسخ رابط أي منشور من الثريد</strong>: الأول أو أي منشور في الوسط أو الأخير.',
    '<strong>الصقه في الحقل أعلاه.</strong> يعثر Xtracticle على كل منشورات الكاتب في الثريد.',
    '<strong>نزّل</strong> الثريد المجمّع والمرقّم بصيغة PDF أو Markdown أو EPUB أو نص.',
  ])}
</section>

<section>
  <h2>كيف يُجمع الثريد</h2>
  <p>الثريد سلسلة منشورات يرد فيها الكاتب على نفسه. يقرأ Xtracticle هذه السلسلة ويُبقي منشورات الكاتب وحدها بالترتيب، دون ردود الآخرين. يُرقَّم كل منشور (<code>1/12</code> و<code>2/12</code> وهكذا)، مع الحفاظ على فواصل الأسطر والصور والفيديو والمنشورات المقتبسة.</p>
  <p>لا حاجة إلى الإشارة إلى بوت أسفل الثريد ولا إلى انتظار رد. كل شيء يتم هنا وبخصوصية.</p>
</section>

<section>
  <h2>لماذا تحفظ الثريد؟</h2>
  <ul>
    <li><strong>قراءة أريح</strong>: مستند متصل واحد بدل التمرير بين المنشورات.</li>
    <li><strong>يبقى معك</strong>: الثريدات تُحذف والحسابات تصبح خاصة. أما نسخة PDF أو <em>ZIP مع الصور</em> فتبقى لك.</li>
    <li><strong>للدراسة والمشاركة</strong>: أرسل ملف PDF إلى فريقك، أو اطبعه، أو استورد Markdown إلى ملاحظاتك أو مساعدك الذكي.</li>
    <li><strong>على قارئ الكتب الإلكترونية</strong>: صدّره بصيغة <a href="/ar/x-article-to-epub">EPUB لجهاز Kindle</a>.</li>
  </ul>
</section>

${shortcuts('ar')}`,
  faq: [
    { q: 'هل أحتاج إلى أول تغريدة في الثريد؟', a: 'لا. الصق أي منشور من الثريد فيُجمع الثريد كاملًا.' },
    { q: 'هل تُضمَّن ردود الآخرين؟', a: 'لا. تُضمَّن فقط منشورات الكاتب في الثريد، مرتبة بالتسلسل.' },
    { q: 'هل أحتاج إلى بوت مثل @threadreaderapp؟', a: 'لا. لا تنشر شيئًا ولا تشير إلى أحد. الصق الرابط ثم نزّل.' },
    { q: 'هل يمكنني فرد ثريد من حساب خاص؟', a: 'لا. يمكن الوصول إلى الثريدات العامة فقط.' },
  ],
};

const epub: SitePage = {
  id: 'ar-epub',
  group: 'epub',
  path: '/ar/x-article-to-epub',
  file: 'ar/x-article-to-epub.html',
  lang: 'ar',
  title: 'تحويل مقالة X إلى EPUB وإرسالها إلى Kindle | Xtracticle',
  description:
    'حوّل مقالات X (تويتر) والثريدات إلى EPUB وأرسلها إلى Kindle أو Kobo أو Apple Books أو Google Play Books. الصور مضمّنة، مجانًا وبلا تسجيل دخول.',
  h1: 'تحويل مقالة X إلى EPUB وKindle',
  sub: 'اقرأ مقالات X (تويتر) الطويلة والثريدات على Kindle أو Kobo أو Apple Books، ككتاب إلكتروني حقيقي بصوره.',
  primary: 'epub',
  nav: 'X إلى Kindle / EPUB',
  sections: `
<section>
  <h2>أرسل مقالة X إلى Kindle</h2>
  ${steps([
    '<strong>الصق رابط المنشور</strong> في الحقل أعلاه ثم اضغط «استخراج».',
    '<strong>اضغط «EPUB / Kindle»</strong> لتنزيل الكتاب الإلكتروني.',
    '<strong>أرسله إلى Kindle</strong> عبر تطبيق Send to Kindle أو موقعه، أو أرسل الملف بالبريد الإلكتروني إلى عنوان Kindle الخاص بك.',
  ])}
</section>

<section>
  <h2>كتاب إلكتروني حقيقي، لا لقطات شاشة</h2>
  <ul>
    <li><strong>تنسيق متجاوب</strong>: يمكنك تغيير الخط وحجمه على جهازك.</li>
    <li><strong>الصور مضمّنة</strong> في الملف وتظهر دون اتصال.</li>
    <li><strong>بيانات وصفية</strong>: يظهر العنوان والكاتب بشكل صحيح في مكتبتك.</li>
    <li><strong>EPUB 3 قياسي</strong>: يعمل مع Kindle (عبر Send to Kindle) وKobo وApple Books وGoogle Play Books وPocketBook وCalibre.</li>
  </ul>
</section>

<section>
  <h2>مثالي للقراءات الطويلة</h2>
  <p>قد تصل مقالة X إلى 100,000 حرف، وقد يمتد الثريد إلى عشرات المنشورات. القراءة على شاشة الحبر الإلكتروني أريح للعين وأهدأ، ولا تحتاج إلى اتصال بالإنترنت. احفظ عدة مقالات قبل الرحلة، أو جهّز قائمة قراءة لنهاية الأسبوع.</p>
</section>

${privacy('ar')}`,
  faq: [
    { q: 'هل يدعم Kindle صيغة EPUB؟', a: 'نعم. تقبل خدمة Send to Kindle من Amazon ملفات EPUB وتحوّلها تلقائيًا لجهازك.' },
    { q: 'هل أستطيع القراءة في Apple Books؟', a: 'نعم. افتح ملف .epub المنزَّل على iPhone أو iPad أو Mac واختر «الكتب».' },
    { q: 'هل الصور مضمّنة؟', a: 'نعم، الصور مضمّنة في EPUB. أما الفيديو فيظهر كرابط.' },
    { q: 'هل يمكنني تحويل ثريد إلى EPUB؟', a: 'نعم. الصق أي منشور من الثريد فيصبح الثريد كله كتابًا إلكترونيًا واحدًا.' },
  ],
};

const obsidian: SitePage = {
  id: 'ar-obsidian',
  group: 'obsidian',
  path: '/ar/save-x-articles-to-obsidian',
  file: 'ar/save-x-articles-to-obsidian.html',
  lang: 'ar',
  title: 'حفظ مقالات X وثريدات تويتر في Obsidian بنقرة | Xtracticle',
  description:
    'احفظ مقالات X (تويتر) والثريدات في Obsidian كـ Markdown نظيف بخصائص (الكاتب، المصدر، التاريخ، الوسوم). بنقرة واحدة، مع صور محلية اختيارية، مجانًا ومفتوح المصدر.',
  h1: 'حفظ مقالات X في Obsidian',
  sub: 'احفظ مقالات X (تويتر) والثريدات في مخزن Obsidian بنقرة واحدة، كـ Markdown نظيف مع الخصائص.',
  primary: 'obsidian',
  nav: 'حفظ X في Obsidian',
  sections: `
<section>
  <h2>من X إلى مخزنك</h2>
  ${steps([
    '<strong>الصق رابط المنشور</strong> في الحقل أعلاه ثم اضغط «استخراج».',
    '<strong>اضغط «Obsidian».</strong> يُنسخ Markdown وتُفتح في Obsidian ملاحظة جديدة تحتويه.',
    '<strong>انتهى الأمر</strong>. العنوان والكاتب والمصدر والتاريخ والوسوم مكتوبة في خصائص الملاحظة.',
  ])}
  <p>تفضّل الملفات؟ نزّل <strong>Markdown</strong> وضعه في مخزنك، أو نزّل <strong>ZIP مع الصور</strong> لحفظ الصور دون اتصال في مجلد <code>images/</code> بجوار الملاحظة.</p>
</section>

<section>
  <h2>خصائص قابلة للاستعلام</h2>
  <p>تحمل كل ملاحظة الحقول <code>title</code> و<code>author</code> و<code>source</code> و<code>published</code> و<code>saved</code> و<code>type</code> (article أو thread أو post) و<code>tags</code>. وبمساعدة Dataview يمكنك سرد كل ما حفظته من X:</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>لماذا لا أستخدم أداة قص الويب؟</h2>
  <p>تتعثر أدوات القص العامة مع X: الصفحات تتطلب تسجيل دخول، والمحتوى يُحمَّل ديناميكيًا، والثريدات مقسّمة إلى منشورات كثيرة. يقرأ Xtracticle بيانات المنشور مباشرة، فتحتفظ مقالات X بعناوينها وقوائمها، وتُجمع الثريدات في ملاحظة واحدة.</p>
</section>

${shortcuts('ar')}`,
  faq: [
    { q: 'ضغطت Obsidian ولم يحدث شيء.', a: 'يجب أن يكون Obsidian مثبّتًا على هذا الجهاز. يُنسخ Markdown أيضًا إلى الحافظة، فيمكنك لصقه في أي ملاحظة.' },
    { q: 'هل يعمل مع Obsidian على iPhone أو Android؟', a: 'نعم، إذا كان تطبيق Obsidian مثبّتًا. وإلا فاستخدم «نسخ» أو نزّل ملف .md.' },
    { q: 'كيف أحفظ الصور في مخزني أيضًا؟', a: 'نزّل ZIP مع الصور وفكّ ضغطه داخل مخزنك. تشير الروابط في Markdown إلى مجلد الصور المحلي.' },
    { q: 'هل يعمل مع Logseq أو Notion أو Bear؟', a: 'نعم. نزّل Markdown أو انسخه، ثم استورده أو الصقه.' },
  ],
};

const alternative: SitePage = {
  id: 'ar-tra',
  group: 'tra',
  path: '/ar/thread-reader-app-alternative',
  file: 'ar/thread-reader-app-alternative.html',
  lang: 'ar',
  title: 'بديل مجاني لـ Thread Reader App: PDF وMarkdown ومقالات X | Xtracticle',
  description:
    'تبحث عن بديل لـ Thread Reader App؟ يفرد Xtracticle ثريدات X مجانًا ويحفظ مقالات X بصيغة PDF أو Markdown أو EPUB أو نص، بلا بوت @ ولا إعلانات ولا تسجيل دخول.',
  h1: 'بديل مجاني لـ Thread Reader App',
  sub: 'افرد ثريدات X واحفظ مقالات X بصيغة PDF أو Markdown أو EPUB أو نص، مجانًا وبلا بوت @ ولا إعلانات ولا تسجيل دخول.',
  primary: 'pdf',
  nav: 'بديل Thread Reader App',
  sections: `
<section>
  <h2>لماذا يبحث الناس عن بديل</h2>
  <p>يُعد <a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a> وسيلة معروفة لفرد الثريدات:
  تكتب تحت الثريد <code>@threadreaderapp unroll</code>، أو تلصق الرابط في موقعه. وهو مريح للقراءة.
  تبدأ المشكلة حين تريد أن <strong>تحتفظ</strong> بما قرأته:</p>
  <ul>
    <li><strong>تصدير PDF ميزة Premium</strong> (3 دولارات شهريًا / 30 دولارًا سنويًا وقت الكتابة).</li>
    <li><strong>لا يدعم مقالات X</strong>. تذكر صفحة المساعدة فيه أن واجهة X البرمجية لا تتيح الوصول إلى محتوى المقالات.</li>
    <li><strong>الإصدار المجاني فيه إعلانات</strong>، ولا يوفر تصدير Markdown أو EPUB أو Obsidian.</li>
  </ul>
  <p>يركّز Xtracticle على هذه الحلقة تحديدًا: تحويل الثريدات ومقالات X الطويلة إلى ملفات تملكها، مجانًا.</p>
</section>

<section>
  <h2>مقارنة جنبًا إلى جنب</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>فرد الثريدات</td><td>✅ الصق أي منشور من الثريد</td><td>✅ بوت @ أو لصق الرابط</td></tr>
      <tr><td>مقالات X (المنشورات الطويلة)</td><td>✅ عناوين وقوائم وصور وفيديو</td><td>❌ غير مدعومة</td></tr>
      <tr><td>PDF</td><td>✅ مجاني</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ مجاني، مع YAML front-matter</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ مجاني</td><td>❌</td></tr>
      <tr><td>ZIP مع الصور (أرشيف دون اتصال)</td><td>✅ مجاني</td><td>❌</td></tr>
      <tr><td>تحميل مجمّع</td><td>✅ حتى 20 رابطًا</td><td>❌</td></tr>
      <tr><td>الإعلانات</td><td>لا توجد</td><td>في الإصدار المجاني</td></tr>
      <tr><td>نشر علني / بوت @</td><td>غير مطلوب أبدًا</td><td>مطلوب عند استخدام البوت</td></tr>
      <tr><td>تنبيهات الكتّاب والأرشفة التلقائية</td><td>❌ ليست متاحة حاليًا</td><td>✅ Premium</td></tr>
      <tr><td>مفتوح المصدر</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>تستند المقارنة إلى صفحتي <a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a> و
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">المساعدة</a> في Thread Reader App كما اطلعنا عليهما في سبتمبر 2026. قد تتغير الميزات، فإن وجدت معلومة قديمة فأخبرنا على
  <a href="${GITHUB}/issues" rel="noopener">GitHub</a>.</small></p>
</section>

<section>
  <h2>الانتقال يستغرق عشر ثوانٍ</h2>
  ${steps([
    '<strong>انسخ رابط أي منشور من الثريد</strong>. لا داعي للبحث عن الأول.',
    '<strong>الصقه في الحقل أعلاه</strong> ثم اضغط «استخراج». يُجمع الثريد كاملًا ويُرقَّم.',
    '<strong>نزّله</strong> بصيغة PDF أو Markdown أو EPUB أو نص، أو أرسله إلى Obsidian.',
  ])}
</section>

<section>
  <h2>متى يبقى Thread Reader App أفضل</h2>
  <p>إن أردت <strong>فرد الثريد للآخرين داخل X نفسه</strong> (بالرد بالبوت ليحصل كل من في المحادثة على رابط مقروء)، أو أردت <strong>تنبيهات وأرشفة تلقائية</strong> لكتّابك المفضلين، فهذا ما يقدمه Thread Reader App ولا يقدمه Xtracticle. ويستخدم كثيرون الاثنين معًا: Thread Reader App للقراءة الفورية، وXtracticle للاحتفاظ بنسخة.</p>
</section>

${shortcuts('ar')}`,
  faq: [
    { q: 'هل Xtracticle مجاني فعلًا؟', a: 'نعم. كل الصيغ (PDF وMarkdown وEPUB وZIP والنص) مجانية، بلا إعلانات ولا تسجيل دخول ولا حد للاستخدام. والشيفرة مفتوحة المصدر.' },
    { q: 'هل يستطيع Xtracticle تحميل مقالات X؟', a: 'نعم. يحوّل Xtracticle المنشورات الطويلة (Articles) في X مع الحفاظ على العناوين والقوائم والروابط والصور والفيديو. وهذا من أهم الفروق عن Thread Reader App.' },
    { q: 'هل أحتاج إلى بوت @؟', a: 'لا. يكفي أن تلصق الرابط في Xtracticle، ولا يُنشر شيء على X.' },
    { q: 'هل يمكنني استيراد أرشيفي من Thread Reader App؟', a: 'ليس مباشرة. يمكنك لصق روابط X الأصلية (حتى 20 رابطًا في كل مرة في الوضع المجمّع) لإعادة إنشاء ملفات Markdown.' },
  ],
};

export const PAGES_AR: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];
