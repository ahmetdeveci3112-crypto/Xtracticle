import { useId, useState } from 'react';
import { ExternalLink, History } from 'lucide-react';
import type { Lang } from '../i18n';
import { track } from '../lib/analytics';

/**
 * Tweet Finder (/tweet-finder and its language versions): builds an advanced search for one
 * account's old posts by words and dates. Nothing is fetched here — it only builds three links:
 * X's own search (needs an X login), Google with site: + after:/before: (no login), and the
 * Wayback Machine list the page's main tool already shows (`onArchive`).
 *
 * Rendered outside the page's main <form> (no nested forms); the links are plain navigations.
 */

interface Copy {
  title: string;
  intro: string;
  account: string;
  words: string;
  wordsHint: string;
  from: string;
  to: string;
  query: string;
  onX: string;
  onXNote: string;
  onGoogle: string;
  onGoogleNote: string;
  archive: string;
  archiveNote: string;
  needAccount: string;
}

const COPY: Record<Lang, Copy> = {
  en: {
    title: 'Search an account’s old tweets',
    intro: 'Pick an account, optional words and a date range. We build the search for you.',
    account: 'Account',
    words: 'Words (optional)',
    wordsHint: 'Put a phrase in "quotes" to match it exactly.',
    from: 'From',
    to: 'To',
    query: 'Search query',
    onX: 'Search on X',
    onXNote: 'Most complete, but X asks you to log in.',
    onGoogle: 'Search with Google',
    onGoogleNote: 'No login. Finds posts Google has indexed.',
    archive: 'Archived posts',
    archiveNote: 'Wayback Machine copies, including deleted posts.',
    needAccount: 'Enter an @username first.',
  },
  tr: {
    title: 'Bir hesabın eski tweetlerinde ara',
    intro: 'Hesabı, isterseniz kelimeleri ve tarih aralığını seçin. Aramayı sizin için kuralım.',
    account: 'Hesap',
    words: 'Kelimeler (isteğe bağlı)',
    wordsHint: 'Bir ifadeyi tam eşleştirmek için "tırnak" içine alın.',
    from: 'Başlangıç',
    to: 'Bitiş',
    query: 'Arama sorgusu',
    onX: "X'te ara",
    onXNote: 'En kapsamlısı, ama X giriş yapmanızı ister.',
    onGoogle: "Google'da ara",
    onGoogleNote: "Giriş gerekmez. Google'ın dizinlediği gönderileri bulur.",
    archive: 'Arşivlenmiş gönderiler',
    archiveNote: 'Silinenler dahil Wayback Machine kopyaları.',
    needAccount: 'Önce bir @kullanıcıadı girin.',
  },
  es: {
    title: 'Busca tweets antiguos de una cuenta',
    intro: 'Elige una cuenta, palabras opcionales y un rango de fechas. Nosotros armamos la búsqueda.',
    account: 'Cuenta',
    words: 'Palabras (opcional)',
    wordsHint: 'Pon una frase entre "comillas" para buscarla exacta.',
    from: 'Desde',
    to: 'Hasta',
    query: 'Consulta de búsqueda',
    onX: 'Buscar en X',
    onXNote: 'La más completa, pero X te pide iniciar sesión.',
    onGoogle: 'Buscar con Google',
    onGoogleNote: 'Sin iniciar sesión. Encuentra lo que Google ha indexado.',
    archive: 'Publicaciones archivadas',
    archiveNote: 'Copias del Wayback Machine, incluidas las borradas.',
    needAccount: 'Escribe primero un @usuario.',
  },
  pt: {
    title: 'Pesquise tweets antigos de uma conta',
    intro: 'Escolha uma conta, palavras opcionais e um intervalo de datas. Nós montamos a pesquisa.',
    account: 'Conta',
    words: 'Palavras (opcional)',
    wordsHint: 'Coloque uma frase entre "aspas" para buscá-la exata.',
    from: 'De',
    to: 'Até',
    query: 'Consulta de pesquisa',
    onX: 'Pesquisar no X',
    onXNote: 'A mais completa, mas o X pede login.',
    onGoogle: 'Pesquisar no Google',
    onGoogleNote: 'Sem login. Encontra o que o Google indexou.',
    archive: 'Posts arquivados',
    archiveNote: 'Cópias do Wayback Machine, incluindo posts apagados.',
    needAccount: 'Digite primeiro um @usuário.',
  },
  ja: {
    title: 'アカウントの過去ツイートを検索',
    intro: 'アカウント、キーワード（任意）、期間を選ぶと検索条件を組み立てます。',
    account: 'アカウント',
    words: 'キーワード（任意）',
    wordsHint: '"引用符" で囲むと完全一致で検索します。',
    from: '開始日',
    to: '終了日',
    query: '検索クエリ',
    onX: 'X で検索',
    onXNote: '最も網羅的ですが、X へのログインが必要です。',
    onGoogle: 'Google で検索',
    onGoogleNote: 'ログイン不要。Google にインデックスされた投稿を探します。',
    archive: 'アーカイブされた投稿',
    archiveNote: '削除済みを含む Wayback Machine のコピー。',
    needAccount: '先に @ユーザー名 を入力してください。',
  },
  zh: {
    title: '搜索某个账号的旧推文',
    intro: '选择账号、可选关键词和日期范围，我们帮你拼好搜索条件。',
    account: '账号',
    words: '关键词（可选）',
    wordsHint: '用 "引号" 括起短语可精确匹配。',
    from: '开始日期',
    to: '结束日期',
    query: '搜索语句',
    onX: '在 X 上搜索',
    onXNote: '最全面，但 X 会要求登录。',
    onGoogle: '用 Google 搜索',
    onGoogleNote: '无需登录，查找 Google 已收录的帖子。',
    archive: '已存档的帖子',
    archiveNote: 'Wayback Machine 副本，包括已删除的帖子。',
    needAccount: '请先输入 @用户名。',
  },
  ar: {
    title: 'ابحث في التغريدات القديمة لحساب',
    intro: 'اختر حسابًا وكلمات اختيارية ونطاقًا زمنيًا، ونحن نبني البحث لك.',
    account: 'الحساب',
    words: 'كلمات (اختياري)',
    wordsHint: 'ضع العبارة بين "علامتي تنصيص" لمطابقتها حرفيًا.',
    from: 'من',
    to: 'إلى',
    query: 'عبارة البحث',
    onX: 'ابحث في X',
    onXNote: 'الأشمل، لكن X يطلب تسجيل الدخول.',
    onGoogle: 'ابحث عبر Google',
    onGoogleNote: 'بلا تسجيل دخول. يجد ما فهرسه Google.',
    archive: 'المنشورات المؤرشفة',
    archiveNote: 'نسخ Wayback Machine، بما فيها المنشورات المحذوفة.',
    needAccount: 'أدخل اسم مستخدم مع @ أولًا.',
  },
};

/** "@NASA", "x.com/NASA", "https://twitter.com/NASA/status/…" → "NASA"; anything else → "". */
export function handleFrom(input: string): string {
  const s = input.trim();
  const url = s.match(/^(?:https?:\/\/)?(?:www\.|mobile\.)?(?:x|twitter)\.com\/@?([A-Za-z0-9_]{1,15})(?:[/?#]|$)/i);
  if (url) return /^(i|home|search|explore|settings|intent|share)$/i.test(url[1]) ? '' : url[1];
  const bare = s.match(/^[@＠]?([A-Za-z0-9_]{1,15})$/);
  return bare ? bare[1] : '';
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** The X advanced-search query: `from:NASA moon since:2020-01-01 until:2020-12-31`. */
export function xQuery(handle: string, words: string, from: string, to: string): string {
  return [handle && `from:${handle}`, words.trim(), DATE.test(from) && `since:${from}`, DATE.test(to) && `until:${to}`]
    .filter(Boolean)
    .join(' ');
}

export function xSearchUrl(q: string): string {
  return `https://x.com/search?q=${encodeURIComponent(q)}&src=typed_query&f=live`;
}

/** Google: the account's post pages on both hosts, the words, and Google's own date operators. */
export function googleSearchUrl(handle: string, words: string, from: string, to: string): string {
  const q = [
    `(site:x.com/${handle}/status OR site:twitter.com/${handle}/status)`,
    words.trim(),
    DATE.test(from) && `after:${from}`,
    DATE.test(to) && `before:${to}`,
  ]
    .filter(Boolean)
    .join(' ');
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

export default function TweetSearch({ lang, seed, onArchive }: { lang: Lang; seed: string; onArchive: (handle: string) => void }) {
  const c = COPY[lang];
  const id = useId();
  const [account, setAccount] = useState<string | null>(null);
  const [words, setWords] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  // Until the visitor types here, follow what they typed in the page's main field.
  const handle = handleFrom(account ?? seed);
  const q = xQuery(handle, words, from, to);
  const ready = handle !== '';

  const field = 'w-full px-3 py-2.5 rounded-xl focus-ring';
  const fieldStyle = { backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 'max(1rem, 1em)' };
  const label = 'block text-sm font-medium mb-1';
  const linkBtn =
    'flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl text-start focus-ring transition-opacity aria-disabled:opacity-50 aria-disabled:pointer-events-none';

  const go = (to: 'x' | 'google') => track('tweet_search', { to, words: words.trim() !== '', dates: DATE.test(from) || DATE.test(to) });

  return (
    <search className="block max-w-2xl mx-auto mb-8 print:hidden" aria-labelledby={`${id}-h`}>
      <div className="p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h2 id={`${id}-h`} className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {c.title}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{c.intro}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-a`} className={label} style={{ color: 'var(--text-primary)' }}>{c.account}</label>
            <input
              id={`${id}-a`}
              name="account"
              type="text"
              value={account ?? (handle ? `@${handle}` : '')}
              onChange={e => setAccount(e.target.value)}
              placeholder="@username"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              className={field}
              style={fieldStyle}
            />
          </div>
          <div>
            <label htmlFor={`${id}-w`} className={label} style={{ color: 'var(--text-primary)' }}>{c.words}</label>
            <input
              id={`${id}-w`}
              name="words"
              type="text"
              value={words}
              onChange={e => setWords(e.target.value)}
              aria-describedby={`${id}-wh`}
              enterKeyHint="next"
              className={field}
              style={fieldStyle}
            />
            <p id={`${id}-wh`} className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{c.wordsHint}</p>
          </div>
          <div>
            <label htmlFor={`${id}-f`} className={label} style={{ color: 'var(--text-primary)' }}>{c.from}</label>
            <input id={`${id}-f`} name="from" type="date" value={from} max={to || undefined} onChange={e => setFrom(e.target.value)} className={field} style={fieldStyle} />
          </div>
          <div>
            <label htmlFor={`${id}-t`} className={label} style={{ color: 'var(--text-primary)' }}>{c.to}</label>
            <input id={`${id}-t`} name="to" type="date" value={to} min={from || undefined} onChange={e => setTo(e.target.value)} className={field} style={fieldStyle} />
          </div>
        </div>

        <p className="text-xs mt-4 mb-1" style={{ color: 'var(--text-secondary)' }}>{c.query}</p>
        <output htmlFor={`${id}-a ${id}-w ${id}-f ${id}-t`} className="block">
          <code className="block px-3 py-2 rounded-lg text-sm break-all" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} dir="ltr">
            {ready ? q : c.needAccount}
          </code>
        </output>

        <div className="grid gap-2 mt-4 sm:grid-cols-3">
          <a
            href={ready ? xSearchUrl(q) : undefined}
            aria-disabled={!ready}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => go('x')}
            className={`${linkBtn} btn-primary`}
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
          >
            <span className="flex items-center gap-1.5 font-semibold text-sm">{c.onX}<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /></span>
            <span className="text-xs opacity-80">{c.onXNote}</span>
          </a>
          <a
            href={ready ? googleSearchUrl(handle, words, from, to) : undefined}
            aria-disabled={!ready}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={() => go('google')}
            className={`${linkBtn} btn-secondary`}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <span className="flex items-center gap-1.5 font-semibold text-sm">{c.onGoogle}<ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /></span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.onGoogleNote}</span>
          </a>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              track('tweet_search', { to: 'archive' });
              onArchive(handle);
            }}
            className={`${linkBtn} btn-secondary disabled:opacity-50`}
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <span className="flex items-center gap-1.5 font-semibold text-sm">{c.archive}<History className="w-3.5 h-3.5" aria-hidden="true" /></span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.archiveNote}</span>
          </button>
        </div>
      </div>
    </search>
  );
}
