/**
 * Text of the Watch trial e-mails (verification, digest, day-12 reminder, "trial ended") per site language.
 * The language is the page the trial was started from (trials.lang, migrations/0003_trial_lang.sql).
 * Paid-license digests have no language yet and use English.
 *
 * Functions receive already formatted values: `h` is the handle with its @ (bolded and escaped in the HTML
 * versions), `n`/`d` are counts. Return plain text; email.ts escapes the parts that came from users.
 */

export type MailLang = 'en' | 'tr' | 'es' | 'pt' | 'ja' | 'zh' | 'ar';
export const MAIL_LANGS: MailLang[] = ['en', 'tr', 'es', 'pt', 'ja', 'zh', 'ar'];
export const isMailLang = (v: unknown): v is MailLang => typeof v === 'string' && (MAIL_LANGS as string[]).includes(v);

/** The /pro page of each language (same paths as site/pro-page.ts). */
export const PRO_PATHS: Record<MailLang, string> = { en: '/pro', tr: '/tr/pro', es: '/es/pro', pt: '/pt/pro', ja: '/ja/pro', zh: '/zh/pro', ar: '/ar/pro' };

export interface MailCopy {
  /** Event titles in the item list. */
  title: { deleted: (h: string) => string; new: (h: string) => string; protected: (h: string) => string; gone: (h: string) => string; renamed: (h: string) => string };
  waybackCopy: string;
  /** "3 events" / "1 event"; `none` for zero. */
  events: (n: number) => string;
  none: string;
  /* Digest */
  digestSubject: (n: number, handles: string) => string;
  digestIntro: (n: number, handles: string) => string;
  /** "Trial: 3 days left" */
  trialLeft: (d: number) => string;
  keepWithPro: string;
  manageTrial: string;
  manageWatches: string;
  stopEmails: string;
  /* Verification */
  verifySubject: (h: string) => string;
  verifyIntro: (days: number, h: string) => string;
  verifyCta: string;
  verifyNote: string;
  /** Text version: the URL follows after a colon. */
  verifyManageText: string;
  /** HTML version: `link` is the <a> element whose text is `here`. */
  verifyManageHtml: (link: string) => string;
  here: string;
  /* Reminder */
  reminderSubject: (h: string, d: number) => string;
  reminderIntro: (h: string, d: number, when: string, caught: string) => string;
  reminderCta: (h: string) => string;
  reminderManage: string;
  /* Ended */
  endedSubject: (h: string) => string;
  endedIntro: (h: string) => string;
  /** `caught` comes from events()/none; `colon` is true when the list follows. */
  endedCaught: (caught: string, colon: boolean) => string;
  more: (n: number) => string;
  endedCta: (h: string) => string;
  endedNote: (h: string) => string;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const en: MailCopy = {
  title: {
    deleted: h => `${h} deleted a post`,
    new: h => `New post by ${h}`,
    protected: h => `${h} is now protected (watch paused)`,
    gone: h => `${h} no longer exists (watch paused)`,
    renamed: h => `${h} changed its username`,
  },
  waybackCopy: 'Wayback copy',
  events: n => plural(n, 'event', 'events'),
  none: 'no events',
  digestSubject: (n, hs) => `Watch digest: ${plural(n, 'event', 'events')} for ${hs}`,
  digestIntro: (n, hs) => `Xtracticle Watch: ${plural(n, 'event', 'events')} for ${hs}.`,
  trialLeft: d => `Trial: ${plural(d, 'day', 'days')} left`,
  keepWithPro: 'keep watching with Pro',
  manageTrial: 'Manage your trial',
  manageWatches: 'Manage your watches',
  stopEmails: 'Stop these e-mails',
  verifySubject: h => `Confirm your Xtracticle Watch trial for ${h}`,
  verifyIntro: (days, h) => `Confirm this address to start your free ${days}-day Xtracticle Watch trial for ${h}.`,
  verifyCta: 'Confirm e-mail address and start the trial',
  verifyNote: 'The link works for 24 hours. Nothing is checked and nothing is sent until you confirm. If you did not ask for this, ignore this message.',
  verifyManageText: 'After confirming, you can see what the trial caught, change what it watches or end it here',
  verifyManageHtml: link => `After confirming, you can see what the trial caught, change what it watches or end it ${link}.`,
  here: 'here',
  reminderSubject: (h, d) => `Your Watch trial for ${h} ends in ${plural(d, 'day', 'days')}`,
  reminderIntro: (h, d, when, caught) => `Your free Xtracticle Watch trial for ${h} ends in ${plural(d, 'day', 'days')} (${when}). So far it caught ${caught}.`,
  reminderCta: h => `Keep watching ${h} and up to 4 more accounts with Xtracticle Pro`,
  reminderManage: 'Trial status, mode and ending it early',
  endedSubject: h => `Your Watch trial for ${h} has ended`,
  endedIntro: h => `Your free Xtracticle Watch trial for ${h} has ended; the account is no longer checked.`,
  endedCaught: (c, colon) => `During the trial Watch caught ${c}${colon ? ':' : '.'}`,
  more: n => `… and ${n} more.`,
  endedCta: h => `Keep watching ${h} with Xtracticle Pro`,
  endedNote: h => `Events are kept for 90 days after they were detected, so everything above stays visible if you add ${h} with Pro.`,
};

const tr: MailCopy = {
  title: {
    deleted: h => `${h} bir gönderisini sildi`,
    new: h => `${h} yeni bir gönderi paylaştı`,
    protected: h => `${h} hesabını gizliye aldı (takip durdu)`,
    gone: h => `${h} artık yok (takip durdu)`,
    renamed: h => `${h} kullanıcı adını değiştirdi`,
  },
  waybackCopy: 'Wayback kopyası',
  events: n => `${n} olay`,
  none: '0 olay',
  digestSubject: (n, hs) => `Watch özeti: ${hs} için ${n} olay`,
  digestIntro: (n, hs) => `Xtracticle Watch: ${hs} için ${n} olay.`,
  trialLeft: d => `Deneme: ${d} gün kaldı`,
  keepWithPro: 'Pro ile izlemeye devam edin',
  manageTrial: 'Denemenizi yönetin',
  manageWatches: 'Takiplerinizi yönetin',
  stopEmails: 'Bu e-postaları durdur',
  verifySubject: h => `${h} için Xtracticle Watch denemenizi onaylayın`,
  verifyIntro: (days, h) => `${h} için ${days} günlük ücretsiz Xtracticle Watch denemenizi başlatmak üzere bu adresi onaylayın.`,
  verifyCta: 'E-posta adresini onayla ve denemeyi başlat',
  verifyNote: 'Link 24 saat geçerli. Onaylayana kadar hiçbir şey kontrol edilmez ve size hiçbir şey gönderilmez. Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
  verifyManageText: 'Onayladıktan sonra denemenin yakaladıklarını görebilir, neyi izleyeceğini değiştirebilir ya da denemeyi bitirebilirsiniz',
  verifyManageHtml: link => `Onayladıktan sonra denemenin yakaladıklarını ${link} görebilir, neyi izleyeceğini değiştirebilir ya da denemeyi bitirebilirsiniz.`,
  here: 'buradan',
  reminderSubject: (h, d) => `${h} için Watch denemeniz ${d} gün sonra bitiyor`,
  reminderIntro: (h, d, when, caught) => `${h} için ücretsiz Xtracticle Watch denemeniz ${d} gün sonra (${when}) bitiyor. Şimdiye kadar ${caught} yakaladı.`,
  reminderCta: h => `${h} ve 4 hesabı daha Xtracticle Pro ile izlemeye devam edin`,
  reminderManage: 'Deneme durumu, izleme türü ve erken bitirme',
  endedSubject: h => `${h} için Watch denemeniz sona erdi`,
  endedIntro: h => `${h} için ücretsiz Xtracticle Watch denemeniz sona erdi; hesap artık kontrol edilmiyor.`,
  endedCaught: (c, colon) => `Deneme boyunca Watch ${c} yakaladı${colon ? ':' : '.'}`,
  more: n => `… ve ${n} olay daha.`,
  endedCta: h => `${h} hesabını Xtracticle Pro ile izlemeye devam edin`,
  endedNote: h => `Olaylar yakalandıktan sonra 90 gün saklanır; ${h} hesabını Pro ile eklerseniz yukarıdakilerin hepsi görünmeye devam eder.`,
};

const es: MailCopy = {
  title: {
    deleted: h => `${h} eliminó una publicación`,
    new: h => `Nueva publicación de ${h}`,
    protected: h => `${h} ahora es privada (seguimiento en pausa)`,
    gone: h => `${h} ya no existe (seguimiento en pausa)`,
    renamed: h => `${h} cambió su nombre de usuario`,
  },
  waybackCopy: 'Copia de Wayback',
  events: n => plural(n, 'evento', 'eventos'),
  none: '0 eventos',
  digestSubject: (n, hs) => `Resumen de Watch: ${plural(n, 'evento', 'eventos')} para ${hs}`,
  digestIntro: (n, hs) => `Xtracticle Watch: ${plural(n, 'evento', 'eventos')} para ${hs}.`,
  trialLeft: d => `Prueba: ${d === 1 ? 'queda' : 'quedan'} ${plural(d, 'día', 'días')}`,
  keepWithPro: 'sigue vigilando con Pro',
  manageTrial: 'Gestiona tu prueba',
  manageWatches: 'Gestiona tus seguimientos',
  stopEmails: 'Dejar de recibir estos e-mails',
  verifySubject: h => `Confirma tu prueba de Xtracticle Watch para ${h}`,
  verifyIntro: (days, h) => `Confirma esta dirección para empezar tu prueba gratuita de ${days} días de Xtracticle Watch para ${h}.`,
  verifyCta: 'Confirmar el e-mail y empezar la prueba',
  verifyNote: 'El enlace funciona durante 24 horas. No se comprueba ni se envía nada hasta que confirmes. Si no lo has pedido tú, ignora este mensaje.',
  verifyManageText: 'Después de confirmar, puedes ver lo que ha detectado la prueba, cambiar lo que vigila o terminarla aquí',
  verifyManageHtml: link => `Después de confirmar, puedes ver lo que ha detectado la prueba, cambiar lo que vigila o terminarla ${link}.`,
  here: 'aquí',
  reminderSubject: (h, d) => `Tu prueba de Watch para ${h} termina en ${plural(d, 'día', 'días')}`,
  reminderIntro: (h, d, when, caught) => `Tu prueba gratuita de Xtracticle Watch para ${h} termina en ${plural(d, 'día', 'días')} (${when}). Hasta ahora ha detectado ${caught}.`,
  reminderCta: h => `Sigue vigilando ${h} y hasta 4 cuentas más con Xtracticle Pro`,
  reminderManage: 'Estado de la prueba, modo y cómo terminarla antes',
  endedSubject: h => `Tu prueba de Watch para ${h} ha terminado`,
  endedIntro: h => `Tu prueba gratuita de Xtracticle Watch para ${h} ha terminado; la cuenta ya no se comprueba.`,
  endedCaught: (c, colon) => `Durante la prueba, Watch detectó ${c}${colon ? ':' : '.'}`,
  more: n => `… y ${n} más.`,
  endedCta: h => `Sigue vigilando ${h} con Xtracticle Pro`,
  endedNote: h => `Los eventos se guardan 90 días desde que se detectan, así que todo lo anterior seguirá visible si añades ${h} con Pro.`,
};

const pt: MailCopy = {
  title: {
    deleted: h => `${h} apagou um post`,
    new: h => `Novo post de ${h}`,
    protected: h => `A conta ${h} agora é protegida (acompanhamento pausado)`,
    gone: h => `A conta ${h} não existe mais (acompanhamento pausado)`,
    renamed: h => `${h} mudou o nome de usuário`,
  },
  waybackCopy: 'Cópia do Wayback',
  events: n => plural(n, 'evento', 'eventos'),
  none: '0 eventos',
  digestSubject: (n, hs) => `Resumo do Watch: ${plural(n, 'evento', 'eventos')} para ${hs}`,
  digestIntro: (n, hs) => `Xtracticle Watch: ${plural(n, 'evento', 'eventos')} para ${hs}.`,
  trialLeft: d => `Teste: ${d === 1 ? 'resta' : 'restam'} ${plural(d, 'dia', 'dias')}`,
  keepWithPro: 'continue acompanhando com o Pro',
  manageTrial: 'Gerencie seu teste',
  manageWatches: 'Gerencie seus acompanhamentos',
  stopEmails: 'Parar de receber estes e-mails',
  verifySubject: h => `Confirme seu teste do Xtracticle Watch para ${h}`,
  verifyIntro: (days, h) => `Confirme este endereço para começar seu teste grátis de ${days} dias do Xtracticle Watch para ${h}.`,
  verifyCta: 'Confirmar o e-mail e começar o teste',
  verifyNote: 'O link vale por 24 horas. Nada é verificado nem enviado até você confirmar. Se você não pediu isso, ignore esta mensagem.',
  verifyManageText: 'Depois de confirmar, você pode ver o que o teste encontrou, mudar o que ele acompanha ou encerrá-lo aqui',
  verifyManageHtml: link => `Depois de confirmar, você pode ver o que o teste encontrou, mudar o que ele acompanha ou encerrá-lo ${link}.`,
  here: 'aqui',
  reminderSubject: (h, d) => `Seu teste do Watch para ${h} termina em ${plural(d, 'dia', 'dias')}`,
  reminderIntro: (h, d, when, caught) => `Seu teste grátis do Xtracticle Watch para ${h} termina em ${plural(d, 'dia', 'dias')} (${when}). Até agora ele encontrou ${caught}.`,
  reminderCta: h => `Continue acompanhando ${h} e até 4 contas a mais com o Xtracticle Pro`,
  reminderManage: 'Status do teste, modo e como encerrá-lo antes',
  endedSubject: h => `Seu teste do Watch para ${h} terminou`,
  endedIntro: h => `Seu teste grátis do Xtracticle Watch para ${h} terminou; a conta não é mais verificada.`,
  endedCaught: (c, colon) => `Durante o teste, o Watch encontrou ${c}${colon ? ':' : '.'}`,
  more: n => `… e mais ${n}.`,
  endedCta: h => `Continue acompanhando ${h} com o Xtracticle Pro`,
  endedNote: h => `Os eventos ficam guardados por 90 dias depois de detectados, então tudo acima continua visível se você adicionar ${h} com o Pro.`,
};

const ja: MailCopy = {
  title: {
    deleted: h => `${h} が投稿を削除しました`,
    new: h => `${h} の新しい投稿`,
    protected: h => `${h} が非公開になりました（ウォッチを一時停止）`,
    gone: h => `${h} は存在しなくなりました（ウォッチを一時停止）`,
    renamed: h => `${h} がユーザー名を変更しました`,
  },
  waybackCopy: 'Waybackのコピー',
  events: n => `${n}件のイベント`,
  none: '0件のイベント',
  digestSubject: (n, hs) => `Watchのまとめ：${hs} のイベント${n}件`,
  digestIntro: (n, hs) => `Xtracticle Watch：${hs} のイベントは${n}件です。`,
  trialLeft: d => `お試し：残り${d}日`,
  keepWithPro: 'Proでウォッチを続ける',
  manageTrial: 'お試しを管理する',
  manageWatches: 'ウォッチを管理する',
  stopEmails: 'このメールの配信を停止',
  verifySubject: h => `${h} のXtracticle Watchお試しを確認してください`,
  verifyIntro: (days, h) => `${h} の${days}日間無料のXtracticle Watchお試しを始めるには、このアドレスを確認してください。`,
  verifyCta: 'メールアドレスを確認してお試しを始める',
  verifyNote: 'リンクは24時間有効です。確認が済むまで、アカウントのチェックもメールの送信も行いません。心当たりがない場合は、このメールを無視してください。',
  verifyManageText: '確認後は、お試しで見つかった内容の確認、ウォッチ対象の変更、お試しの終了を次のリンクから行えます',
  verifyManageHtml: link => `確認後は、お試しで見つかった内容の確認、ウォッチ対象の変更、お試しの終了を${link}から行えます。`,
  here: 'こちら',
  reminderSubject: (h, d) => `${h} のWatchお試しはあと${d}日で終了します`,
  reminderIntro: (h, d, when, caught) => `${h} の無料Xtracticle Watchお試しは、あと${d}日（${when}）で終了します。これまでに検出したのは${caught}です。`,
  reminderCta: h => `${h} とあと4アカウントをXtracticle Proでウォッチし続ける`,
  reminderManage: 'お試しの状況、モード、途中での終了',
  endedSubject: h => `${h} のWatchお試しが終了しました`,
  endedIntro: h => `${h} の無料Xtracticle Watchお試しが終了しました。このアカウントはもう確認されません。`,
  endedCaught: (c, colon) => `お試し期間中にWatchが検出したのは${c}です${colon ? '：' : '。'}`,
  more: n => `…ほか${n}件。`,
  endedCta: h => `${h} をXtracticle Proでウォッチし続ける`,
  endedNote: h => `イベントは検出から90日間保存されるため、${h} をProで追加すれば、上記はすべて引き続き表示されます。`,
};

const zh: MailCopy = {
  title: {
    deleted: h => `${h} 删除了一条帖子`,
    new: h => `${h} 发布了新帖子`,
    protected: h => `${h} 已设为受保护（监控已暂停）`,
    gone: h => `${h} 已不存在（监控已暂停）`,
    renamed: h => `${h} 更改了用户名`,
  },
  waybackCopy: 'Wayback 存档',
  events: n => `${n} 个事件`,
  none: '0 个事件',
  digestSubject: (n, hs) => `Watch 摘要：${hs} 有 ${n} 个事件`,
  digestIntro: (n, hs) => `Xtracticle Watch：${hs} 有 ${n} 个事件。`,
  trialLeft: d => `试用：还剩 ${d} 天`,
  keepWithPro: '用 Pro 继续监控',
  manageTrial: '管理你的试用',
  manageWatches: '管理你的监控',
  stopEmails: '停止接收这些 e-mail',
  verifySubject: h => `请确认你为 ${h} 申请的 Xtracticle Watch 试用`,
  verifyIntro: (days, h) => `确认此地址，即可开始 ${h} 的 ${days} 天免费 Xtracticle Watch 试用。`,
  verifyCta: '确认 e-mail 地址并开始试用',
  verifyNote: '链接 24 小时内有效。在你确认之前，不会检查任何内容，也不会发送任何邮件。如果这不是你本人申请的，请忽略此邮件。',
  verifyManageText: '确认后，你可以通过下面的链接查看试用发现的内容、更改监控对象或结束试用',
  verifyManageHtml: link => `确认后，你可以在${link}查看试用发现的内容、更改监控对象或结束试用。`,
  here: '这里',
  reminderSubject: (h, d) => `你为 ${h} 申请的 Watch 试用将在 ${d} 天后结束`,
  reminderIntro: (h, d, when, caught) => `你为 ${h} 申请的免费 Xtracticle Watch 试用将在 ${d} 天后（${when}）结束。到目前为止，它发现了 ${caught}。`,
  reminderCta: h => `用 Xtracticle Pro 继续监控 ${h} 以及另外最多 4 个账号`,
  reminderManage: '试用状态、模式和提前结束',
  endedSubject: h => `你为 ${h} 申请的 Watch 试用已结束`,
  endedIntro: h => `你为 ${h} 申请的免费 Xtracticle Watch 试用已结束，该账号不再被检查。`,
  endedCaught: (c, colon) => `试用期间，Watch 发现了 ${c}${colon ? '：' : '。'}`,
  more: n => `……还有 ${n} 个事件。`,
  endedCta: h => `用 Xtracticle Pro 继续监控 ${h}`,
  endedNote: h => `事件会从检测时起保留 90 天，所以如果你用 Pro 添加 ${h}，上面的内容仍然可见。`,
};

/** Arabic day count with correct number agreement; `gen` is the genitive form (after a preposition). */
const arDays = (d: number, gen = false) =>
  d === 1 ? 'يوم واحد' : d === 2 ? (gen ? 'يومين' : 'يومان') : d >= 3 && d <= 10 ? `${d} أيام` : `${d} يومًا`;
const arEvents = (n: number) =>
  n === 1 ? 'حدث واحد' : n === 2 ? 'حدثان' : n >= 3 && n <= 10 ? `${n} أحداث` : `${n} حدثًا`;

const ar: MailCopy = {
  title: {
    deleted: h => `حذف ${h} منشورًا`,
    new: h => `منشور جديد من ${h}`,
    protected: h => `أصبح ${h} محميًا (توقفت المراقبة)`,
    gone: h => `لم يعد ${h} موجودًا (توقفت المراقبة)`,
    renamed: h => `غيّر ${h} اسم المستخدم`,
  },
  waybackCopy: 'نسخة Wayback',
  events: n => arEvents(n),
  none: 'صفر أحداث',
  digestSubject: (n, hs) => `ملخص Watch: ${arEvents(n)} بخصوص ${hs}`,
  digestIntro: (n, hs) => `Xtracticle Watch: ${arEvents(n)} بخصوص ${hs}.`,
  trialLeft: d => `التجربة: المتبقي ${arDays(d)}`,
  keepWithPro: 'تابع المراقبة مع Pro',
  manageTrial: 'إدارة تجربتك',
  manageWatches: 'إدارة مراقباتك',
  stopEmails: 'إيقاف هذه الرسائل',
  verifySubject: h => `أكّد تجربة Xtracticle Watch الخاصة بـ ${h}`,
  verifyIntro: (days, h) => `أكّد هذا العنوان لبدء تجربة Xtracticle Watch المجانية لمدة ${arDays(days, true)} للحساب ${h}.`,
  verifyCta: 'تأكيد البريد الإلكتروني وبدء التجربة',
  verifyNote: 'الرابط صالح لمدة 24 ساعة. لن يُفحص أي شيء ولن يُرسل أي شيء حتى تؤكد. إذا لم تطلب ذلك، تجاهل هذه الرسالة.',
  verifyManageText: 'بعد التأكيد، يمكنك الاطلاع على ما رصدته التجربة أو تغيير ما تراقبه أو إنهاءها من هنا',
  verifyManageHtml: link => `بعد التأكيد، يمكنك الاطلاع على ما رصدته التجربة أو تغيير ما تراقبه أو إنهاءها من ${link}.`,
  here: 'هنا',
  reminderSubject: (h, d) => `تنتهي تجربة Watch الخاصة بـ ${h} بعد ${arDays(d, true)}`,
  reminderIntro: (h, d, when, caught) => `تنتهي تجربة Xtracticle Watch المجانية الخاصة بـ ${h} بعد ${arDays(d, true)} (${when}). ما رصدته التجربة حتى الآن هو ${caught}.`,
  reminderCta: h => `تابع مراقبة ${h} وحتى 4 حسابات أخرى مع Xtracticle Pro`,
  reminderManage: 'حالة التجربة والوضع وإنهاؤها مبكرًا',
  endedSubject: h => `انتهت تجربة Watch الخاصة بـ ${h}`,
  endedIntro: h => `انتهت تجربة Xtracticle Watch المجانية الخاصة بـ ${h}؛ لم يعد الحساب يُفحص.`,
  endedCaught: (c, colon) => `ما رصده Watch خلال التجربة هو ${c}${colon ? ':' : '.'}`,
  more: n => `… و${n} من الأحداث الأخرى.`,
  endedCta: h => `تابع مراقبة ${h} مع Xtracticle Pro`,
  endedNote: h => `تُحفظ الأحداث 90 يومًا من وقت اكتشافها، لذا يبقى كل ما سبق ظاهرًا إذا أضفت ${h} مع Pro.`,
};

export const MAIL_COPY: Record<MailLang, MailCopy> = { en, tr, es, pt, ja, zh, ar };

export const mailCopy = (lang: string | null | undefined): MailCopy => MAIL_COPY[isMailLang(lang) ? lang : 'en'];
