/** Japanese pages. */
import { EXAMPLE, GITHUB, privacy, shortcuts, steps, type SitePage } from './blocks';

const home: SitePage = {
  id: 'ja-home',
  group: 'home',
  path: '/ja/',
  file: 'ja/index.html',
  lang: 'ja',
  isHome: true,
  title: 'X記事ダウンローダー｜記事・スレッドをPDF・Markdownで保存 | Xtracticle',
  description:
    'X（旧Twitter）の記事・スレッド・ポストをPDF、Markdown、EPUB（Kindle）、テキストで保存できる無料ツール。リンクを貼るだけで画像付きのきれいなファイルに。登録・ログイン不要。',
  h1: 'X記事ダウンローダー',
  sub: 'X（旧Twitter）の記事・スレッド・ポストをPDF、Markdown、EPUB、テキストで保存。無料・ログイン不要。',
  primary: 'pdf',
  nav: 'X記事ダウンローダー',
  sections: `
<section>
  <h2>Xの記事をダウンロードする方法</h2>
  ${steps([
    '<strong>ポストのリンクをコピー</strong> — Xで<em>「共有 → リンクをコピー」</em>。スレッドならどのポストでもOK。',
    '<strong>上の欄に貼り付け</strong> — 記事・スレッド・ポストを1〜2秒で取得します。',
    '<strong>形式を選ぶ</strong> — PDF、Markdown、EPUB/Kindle、画像付きZIP、テキスト。',
    '<strong>完了</strong> — コピーやObsidianへの送信、読み上げもできます。',
  ])}
  <p>まずは結果を見てみたい方は<a href="${EXAMPLE}">サンプル記事</a>をどうぞ。</p>
</section>

<section>
  <h2>必要な形式がそろっています</h2>
  <div class="xt-grid">
    <div><h3><a href="/ja/x-kiji-pdf">PDF</a></h3><p>A4サイズで印刷にも対応。画像、出典リンク、ページ番号付き。</p></div>
    <div><h3><a href="/ja/x-kiji-markdown">Markdown（.md）</a></h3><p>見出し・太字・リンク・リスト・引用・画像をそのまま保持。YAMLフロントマターにも対応。</p></div>
    <div><h3><a href="/ja/x-kiji-epub-kindle">EPUB / Kindle</a></h3><p>長い記事をKindle、Kobo、Apple Booksで。画像も電子書籍に埋め込まれます。</p></div>
    <div><h3><a href="/ja/x-kiji-obsidian">Obsidian</a></h3><p>ワンクリックで、記事全文とメタデータ入りの新しいノートを作成。</p></div>
    <div><h3>ZIP＋画像</h3><p>Markdownと全画像をローカルに保存。元のポストが削除されても残るアーカイブに。</p></div>
    <div><h3>テキスト</h3><p>どの端末・スクリプト・AIツールでも使えるシンプルな.txt。</p></div>
  </div>
</section>

<section>
  <h2>記事・スレッド・単独のポストに対応</h2>
  <p><strong>Xの記事</strong>（最大10万文字の長文ポスト）は、見出し、太字、斜体、取り消し線、リンク、箇条書き・番号付きリスト、引用、コード、
  区切り線、カバー画像、画像、動画、埋め込みポストまでブロック単位で変換します。</p>
  <p><strong>スレッド</strong>は自動でまとめます。最初・途中・最後のどのポストを貼っても、投稿者本人によるスレッド全体を見つけて、
  番号付きの1つのドキュメントにします。他の人の返信は含まれません。詳しくは<a href="/ja/x-thread-pdf">スレッドをPDFで保存</a>をご覧ください。</p>
  <p><strong>単独のポスト</strong>は本文、改行、写真、動画、引用ポストを保持します。たくさん保存したいときは<em>一括モード</em>で最大20件のリンクを
  貼れば、1つのZIPにまとめてダウンロードできます。</p>
  <p>Thread Reader Appをお使いの方は、<a href="/ja/thread-reader-app-alternative">Xtracticleとの詳しい比較</a>もご覧ください。</p>
</section>

${shortcuts('ja')}

${privacy('ja')}`,
  faq: [
    { q: 'Xtracticleは無料ですか？', a: 'はい。無料のオープンソースツールで、アカウント登録・ログイン・利用回数の制限はありません。' },
    { q: 'Xの記事をPDFで保存するには？', a: 'ポストのリンクをコピーしてXtracticleに貼り付け、「PDF」を押すだけです。タイトル、著者、日付、出典リンク、すべての画像とページ番号が含まれます。' },
    { q: 'スレッドをまとめて保存できますか？', a: 'はい。スレッド内のどのポスト（最初・途中・最後）のリンクでも構いません。投稿者本人のポストをすべて集め、番号付きの1つのドキュメントにします。' },
    { q: 'Xの記事をObsidianやNotionに保存できますか？', a: 'はい。Markdownをダウンロードするか、「Obsidian」ボタンで記事をコピーして新しいノートを開けます。Notionは.mdファイルをそのままインポートできます。' },
    { q: '「ポストを取得できませんでした」と表示されるのはなぜ？', a: 'ポストが削除されている、非公開（鍵）アカウントである、または年齢制限付きである可能性があります。保存できるのは公開ポストのみです。' },
    { q: 'x.com/i/article/… のリンクしかありません。', a: 'それは記事リーダー用のリンクです。Xで記事を開き、「共有 → リンクをコピー」でポストのリンク（x.com/user/status/…）を取得して貼り付けてください。' },
  ],
};

const pdf: SitePage = {
  id: 'ja-pdf',
  group: 'pdf',
  path: '/ja/x-kiji-pdf',
  file: 'ja/x-kiji-pdf.html',
  lang: 'ja',
  title: 'X記事をPDFで保存｜ツイート・ポストを無料でPDF化 | Xtracticle',
  description:
    'X（旧Twitter）の記事やポストを、画像・出典リンク・ページ番号付きの印刷しやすいPDFに無料で変換。ログイン不要で、iPhone・Android・パソコンのどれでも使えます。',
  h1: 'X記事をPDFで保存',
  sub: 'X（旧Twitter）の記事・スレッド・ポストを、そのまま印刷できるきれいなPDFに。画像付き、ログイン不要です。',
  primary: 'pdf',
  nav: 'X記事をPDFで保存',
  sections: `
<section>
  <h2>3ステップでX記事をPDFに変換</h2>
  ${steps([
    '<strong>X記事のリンクをコピー</strong>します（共有 → リンクをコピー）。',
    '<strong>上の欄に貼り付けて</strong>「取得」を押します。',
    '<strong>「PDF」をクリック</strong>すると、すぐにダウンロードが始まります。',
  ])}
</section>

<section>
  <h2>作成されるPDFの特長</h2>
  <ul>
    <li><strong>すっきりしたA4レイアウト</strong> — Xのサイドバーやボタン、返信、広告は入りません。記事本文だけです。</li>
    <li><strong>タイトル・著者・日付・出典リンク</strong>を冒頭に記載。資料として引用するときにも便利です。</li>
    <li><strong>カバー画像と本文中の画像</strong>を元の位置に、ページ幅に合わせて配置します。</li>
    <li><strong>ページ番号</strong>と、元のポストに戻れるクリック可能なリンクをフッターに表示します。</li>
    <li><strong>行が途中で切れない</strong> — とても長い記事でも、改ページは段落の途中ではなく段落の間で行われます。</li>
  </ul>
</section>

<section>
  <h2>便利なヒント</h2>
  <h3>テキストを選択・検索したいときは</h3>
  <p>PDFはレイアウトを正確に再現するため画像として描画されます。テキストをハイライトしたり検索したりしたい場合は、<a href="/ja/x-kiji-epub-kindle">EPUB</a>
  や<a href="/ja/x-kiji-markdown">Markdown</a>で書き出すか、結果画面で <code>Ctrl/Cmd + P</code> を押して<em>「PDFとして保存」</em>を選んでください。</p>
  <h3>スレッドもPDFに</h3>
  <p>スレッド内のどのポストを貼っても、スレッド全体が1つのPDFになります。詳しくは<a href="/ja/x-thread-pdf">スレッドをPDFで保存</a>をご覧ください。</p>
  <h3>iPhoneの場合</h3>
  <p>「PDF」をタップしたら、Safariのダウンロード一覧からファイルを開き、<em>「共有 → "ファイル"に保存」</em>を選ぶか、ブックアプリに送ってください。</p>
</section>

${privacy('ja')}`,
  faq: [
    { q: 'XのPDF変換は無料ですか？', a: 'はい、完全に無料です。透かし（ウォーターマーク）なし、ログイン不要、回数制限もありません。' },
    { q: 'PDFに画像は含まれますか？', a: 'はい。カバー画像と本文中のすべての画像が含まれます。動画はサムネイルとして表示され、動画へのリンクが付きます。' },
    { q: 'Twitterのスレッドを丸ごとPDFにできますか？', a: 'はい。スレッド内のどのポストのリンクを貼っても、Xtracticleがスレッド全体を1つのPDFにまとめます。' },
    { q: 'スマホでも使えますか？', a: 'はい。iPhone、Android、Mac、Windows、Linuxの最新ブラウザで動作します。' },
    { q: '非公開のポストや削除されたポストも変換できますか？', a: 'いいえ。変換できるのは、現在も公開されているポストだけです。だからこそ、PDFで手元に保存しておくと安心です。' },
  ],
};

const markdown: SitePage = {
  id: 'ja-markdown',
  group: 'markdown',
  path: '/ja/x-kiji-markdown',
  file: 'ja/x-kiji-markdown.html',
  lang: 'ja',
  title: 'X記事をMarkdownに変換｜ポスト・スレッドを.mdで保存 | Xtracticle',
  description:
    'X（旧Twitter）の記事・スレッド・ポストを、見出し・リンク・リスト・画像・YAMLフロントマター付きのきれいなMarkdownに変換。Obsidian、Notion、GitHub、AIツールにぴったりです。',
  h1: 'X記事をMarkdownに変換',
  sub: 'X（旧Twitter）の記事・スレッド・ポストをきれいなMarkdownに。書式、リンク、画像もそのまま残ります。',
  primary: 'md',
  nav: 'X記事をMarkdownに変換',
  sections: `
<section>
  <h2>コピペでは崩れる書式も、きれいなMarkdownに</h2>
  <p>Xの記事はリッチテキストのブロックとして保存されています。Xtracticleはブロックごとに正しいMarkdownへ変換するので、どこで開いても正しく表示されます。</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Xでの表示</th><th>.mdファイルでの書式</th></tr></thead>
    <tbody>
      <tr><td>見出し／小見出し</td><td><code>## 見出し</code> / <code>### 小見出し</code></td></tr>
      <tr><td>太字・斜体・取り消し線</td><td><code>**太字**</code>, <code>*斜体*</code>, <code>~~取り消し~~</code></td></tr>
      <tr><td>リンク</td><td><code>[テキスト](https://…)</code></td></tr>
      <tr><td>箇条書き／番号付きリスト（入れ子も可）</td><td><code>- 項目</code> / <code>1. 項目</code></td></tr>
      <tr><td>引用・コード・区切り線</td><td><code>&gt; 引用</code>、コードブロック、<code>---</code></td></tr>
      <tr><td>画像・動画</td><td><code>![キャプション](url)</code>、リンク付きの動画サムネイル</td></tr>
      <tr><td>埋め込みポスト</td><td>埋め込み元ポストへのリンク</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>YAMLフロントマターにも対応</h2>
  <p>ファイルの先頭に、Obsidian（プロパティ）、Hugo、Jekyll、Astro、Dataviewで使えるメタデータを付けられます。</p>
  <pre><code>---
title: "記事のタイトル"
author: "著者名 (@handle)"
source: "https://x.com/handle/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>不要な場合は、ダウンロードボタンの下にある<em>「.mdにYAMLフロントマターを追加」</em>のチェックを外してください。</p>
</section>

<section>
  <h2>こんな使い方におすすめ</h2>
  <ul>
    <li><strong>ノート・メモ</strong> — Obsidian、Logseq、Notion、Bear、JoplinなどあらゆるMarkdownエディタで。<a href="/ja/x-kiji-obsidian">Obsidianでの使い方</a>もご覧ください。</li>
    <li><strong>AIツール</strong> — MarkdownはChatGPT、Claude、Gemini、NotebookLMに渡すのに最も扱いやすい形式です。貼り付けて要約・翻訳・質問に使えます。</li>
    <li><strong>執筆・発信</strong> — ブログ記事、ニュースレター、ドキュメント、GitHubのREADMEで出典として引用できます。</li>
    <li><strong>アーカイブ</strong> — <em>「ZIP＋画像」</em>でダウンロードすれば、すべての画像を.mdファイルと一緒にローカルに保存できます。</li>
  </ul>
</section>

${shortcuts('ja')}`,
  faq: [
    { q: 'ツイートをMarkdownに変換するには？', a: 'ポストのリンクをXtracticleに貼り付けて「Markdown」をクリックします。「コピー」を押せば、Markdownをクリップボードにコピーできます。' },
    { q: 'Markdownに画像は含まれますか？', a: 'はい、画像リンクとして含まれます。「ZIP＋画像」を選ぶと、すべての画像もダウンロードされ、Markdown内のリンクがローカルの画像を参照します。' },
    { q: 'スレッドもMarkdownに変換できますか？', a: 'はい。スレッド内のどのポストを貼っても、すべてのポストが番号付きの1つのMarkdownドキュメントにまとまります。' },
    { q: 'YAMLフロントマターはオフにできますか？', a: 'はい。ダウンロードボタンの下にあるフロントマターのチェックを外してください。設定は次回以降も保持されます。' },
  ],
};

const thread: SitePage = {
  id: 'ja-thread',
  group: 'thread',
  path: '/ja/x-thread-pdf',
  file: 'ja/x-thread-pdf.html',
  lang: 'ja',
  title: 'Xのスレッドをまとめて保存｜ツイートのスレッドをPDF化 | Xtracticle',
  description:
    'X（旧Twitter）のスレッドを1つのPDF、Markdown、EPUB、テキストにまとめて保存。スレッド内のどのポストを貼ってもOK。botへのメンションもログインも不要で、無料で使えます。',
  h1: 'Xのスレッドをまとめて保存',
  sub: 'X（旧Twitter）のスレッドを1つのきれいなドキュメントに。PDF、Markdown、EPUB、テキストで保存できます。どのポストを貼ってもOKです。',
  primary: 'pdf',
  nav: 'スレッドをPDFで保存',
  sections: `
<section>
  <h2>数秒でスレッドをまとめる</h2>
  ${steps([
    '<strong>スレッド内のポストのリンクをコピー</strong>します。最初でも、途中でも、最後でも構いません。',
    '<strong>上の欄に貼り付けます。</strong>Xtracticleが、そのスレッドで投稿者本人が書いたポストをすべて見つけます。',
    '<strong>ダウンロード</strong> — 番号付きでまとめたスレッドを、PDF、Markdown、EPUB、テキストで保存できます。',
  ])}
</section>

<section>
  <h2>スレッドをまとめる仕組み</h2>
  <p>スレッドとは、投稿者が自分のポストに返信してつなげた一連のポストです。Xtracticleはこのつながりをたどり、投稿者本人のポストだけを
  順番どおりに残します。他の人からの返信は含まれません。各ポストには番号（<code>1/12</code>、<code>2/12</code>…）が付き、
  改行、写真、動画、引用ポストもそのまま保持されます。</p>
  <p>スレッドの下でbotにメンションしたり、返信を待ったりする必要はありません。すべてこのページの中で、誰にも知られずに完結します。</p>
</section>

<section>
  <h2>スレッドを保存するメリット</h2>
  <ul>
    <li><strong>読みやすい</strong> — ポストを1つずつスクロールせず、ひと続きのドキュメントとして読めます。</li>
    <li><strong>ずっと残せる</strong> — スレッドは削除されたり、アカウントが非公開になったりします。PDFや<em>「ZIP＋画像」</em>で保存したコピーは手元に残ります。</li>
    <li><strong>学習・共有に</strong> — PDFをチームに送ったり、印刷したり、Markdownをノートアプリやアシスタント型AIに読み込ませたりできます。</li>
    <li><strong>電子書籍リーダーで</strong> — <a href="/ja/x-kiji-epub-kindle">EPUBに書き出してKindleで読む</a>こともできます。</li>
  </ul>
</section>

${shortcuts('ja')}`,
  faq: [
    { q: 'スレッドの最初のツイートが必要ですか？', a: 'いいえ。スレッド内のどのポストを貼っても、スレッド全体がまとめられます。' },
    { q: '他の人の返信も含まれますか？', a: 'いいえ。含まれるのは、そのスレッドにおける投稿者本人のポストだけで、順番どおりに並びます。' },
    { q: '@threadreaderapp のようなbotをタグ付けする必要はありますか？', a: 'いいえ。何かを投稿したりタグ付けしたりする必要はありません。リンクを貼ってダウンロードするだけです。' },
    { q: '鍵アカウント（非公開アカウント）のスレッドもまとめられますか？', a: 'いいえ。取得できるのは公開されているスレッドだけです。' },
  ],
};

const epub: SitePage = {
  id: 'ja-epub',
  group: 'epub',
  path: '/ja/x-kiji-epub-kindle',
  file: 'ja/x-kiji-epub-kindle.html',
  lang: 'ja',
  title: 'X記事をEPUBに変換してKindleで読む｜電子書籍化 | Xtracticle',
  description:
    'X（旧Twitter）の記事やスレッドをEPUBに変換し、Kindle、Kobo、Apple Books、Google Play ブックスで読めます。画像も埋め込まれ、無料・ログイン不要で使えます。',
  h1: 'X記事をEPUBに変換してKindleで読む',
  sub: 'X（旧Twitter）の長い記事やスレッドを、画像入りの本格的な電子書籍としてKindle、Kobo、Apple Booksで読めます。',
  primary: 'epub',
  nav: 'X記事をKindleで読む',
  sections: `
<section>
  <h2>X記事をKindleに送る方法</h2>
  ${steps([
    '<strong>ポストのリンクを上の欄に貼り付けて</strong>「取得」を押します。',
    '<strong>「EPUB / Kindle」をクリック</strong>して電子書籍をダウンロードします。',
    '<strong>Kindleに送信</strong>します。Send to Kindleのアプリやウェブページを使うか、Kindleのメールアドレス宛てにメールで送ってください。',
  ])}
</section>

<section>
  <h2>スクリーンショットではなく、本物の電子書籍</h2>
  <ul>
    <li><strong>リフロー型のテキスト</strong> — 端末でフォントや文字サイズを自由に変えられます。</li>
    <li><strong>画像はファイルに埋め込み</strong> — オフラインでも読めます。</li>
    <li><strong>メタデータ付き</strong> — ライブラリにタイトルと著者名が正しく表示されます。</li>
    <li><strong>標準のEPUB 3形式</strong> — Kindle（Send to Kindle経由）、Kobo、Apple Books、Google Play ブックス、PocketBook、Calibreで使えます。</li>
  </ul>
</section>

<section>
  <h2>長文を読むのにぴったり</h2>
  <p>Xの記事は最大10万文字、スレッドは数十ポストに及ぶこともあります。電子ペーパーの画面なら目にやさしく、通知に邪魔されず、
  オフラインでも読めます。フライトの前にいくつか保存しておいたり、週末用の「あとで読む」リストを作ったりするのにおすすめです。</p>
</section>

${privacy('ja')}`,
  faq: [
    { q: 'KindleはEPUBに対応していますか？', a: 'はい。AmazonのSend to KindleはEPUBファイルを受け付けており、お使いの端末向けに自動で変換してくれます。' },
    { q: 'Apple Booksで読めますか？', a: 'はい。ダウンロードした.epubファイルをiPhone、iPad、Macで開き、「ブック」を選んでください。' },
    { q: '画像は含まれますか？', a: 'はい、画像はEPUBに埋め込まれます。動画はリンクとして含まれます。' },
    { q: 'スレッドもEPUBにできますか？', a: 'はい。スレッド内のどのポストを貼っても、スレッド全体が1冊の電子書籍になります。' },
  ],
};

const obsidian: SitePage = {
  id: 'ja-obsidian',
  group: 'obsidian',
  path: '/ja/x-kiji-obsidian',
  file: 'ja/x-kiji-obsidian.html',
  lang: 'ja',
  title: 'X記事・スレッドをObsidianに保存｜ワンクリックでノート化 | Xtracticle',
  description:
    'X（旧Twitter）の記事やスレッドを、著者・出典・日付・タグのプロパティ付きのきれいなMarkdownとしてObsidianにワンクリックで保存。画像のローカル保存も可能で、無料・オープンソースです。',
  h1: 'X記事をObsidianに保存',
  sub: 'X（旧Twitter）の記事やスレッドを、プロパティ付きのきれいなMarkdownとしてObsidianの保管庫へ。ワンクリックで完了します。',
  primary: 'obsidian',
  nav: 'X記事をObsidianに保存',
  sections: `
<section>
  <h2>Xから保管庫（Vault）まで</h2>
  ${steps([
    '<strong>ポストのリンクを上の欄に貼り付けて</strong>「取得」を押します。',
    '<strong>「Obsidian」をクリックします。</strong>Markdownがコピーされ、Obsidianでその内容の新しいノートが開きます。',
    '<strong>完了</strong> — タイトル、著者、出典、日付、タグはノートのプロパティにすでに入っています。',
  ])}
  <p>ファイルで管理したい場合は、<strong>Markdown</strong>をダウンロードして保管庫に入れるか、<strong>「ZIP＋画像」</strong>を選べば、ノートと同じ場所の <code>images/</code> フォルダに画像をオフライン保存できます。</p>
</section>

<section>
  <h2>検索・集計に使えるプロパティ</h2>
  <p>すべてのノートに <code>title</code>、<code>author</code>、<code>source</code>、<code>published</code>、<code>saved</code>、<code>type</code>（article、thread、post のいずれか）、<code>tags</code> が付きます。
  Dataviewを使えば、Xから保存したものを一覧表示できます。</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>Webクリッパーではだめな理由</h2>
  <p>一般的なWebクリッパーはXとの相性がよくありません。ページの表示にログインが必要で、コンテンツは動的に読み込まれ、スレッドは多数のポストに分かれているからです。
  Xtracticleはポストのデータを直接読み取るため、Xの記事は見出しやリストを保ったまま、スレッドは1つのノートとして保存できます。</p>
</section>

${shortcuts('ja')}`,
  faq: [
    { q: '「Obsidian」をクリックしても何も起きません。', a: 'この端末にObsidianがインストールされている必要があります。Markdownはクリップボードにもコピーされているので、どのノートにも貼り付けられます。' },
    { q: 'iPhoneやAndroidのObsidianでも使えますか？', a: 'はい、Obsidianアプリがインストールされていれば使えます。インストールされていない場合は、「コピー」を使うか.mdファイルをダウンロードしてください。' },
    { q: '画像を保管庫の中に保存するには？', a: '「ZIP＋画像」をダウンロードして保管庫に展開してください。Markdown内のリンクはローカルの画像フォルダを参照します。' },
    { q: 'Logseq、Notion、Bearでも使えますか？', a: 'はい。Markdownをダウンロードまたはコピーして、インポートするか貼り付けてください。' },
  ],
};

const alternative: SitePage = {
  id: 'ja-tra',
  group: 'tra',
  path: '/ja/thread-reader-app-alternative',
  file: 'ja/thread-reader-app-alternative.html',
  lang: 'ja',
  title: 'Thread Reader Appの無料代替ツール｜PDF・Markdown対応 | Xtracticle',
  description:
    'Thread Reader Appの代わりを探している方へ。Xtracticleなら、Xのスレッドをまとめ、X記事もPDF、Markdown、EPUB、テキストで無料保存。botへのメンション、広告、ログインは不要です。',
  h1: 'Thread Reader Appの無料代替ツール',
  sub: 'Xのスレッドをまとめ、X記事をPDF、Markdown、EPUB、テキストで保存。無料で、botへのメンションも広告もログインも不要です。',
  primary: 'pdf',
  nav: 'Thread Reader Appの代替',
  sections: `
<section>
  <h2>代わりのツールが求められる理由</h2>
  <p><a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a>は、スレッドをまとめて読むための定番サービスです。
  スレッドの下で <code>@threadreaderapp unroll</code> とメンションするか、公式サイトにリンクを貼って使います。読むだけなら十分便利です。
  ただ、読んだ内容を<strong>手元に残したい</strong>ときに不便を感じることがあります。</p>
  <ul>
    <li><strong>PDFの書き出しはPremium限定</strong>です（本稿執筆時点で月額3ドル／年額30ドル）。</li>
    <li><strong>Xの記事には非対応</strong>です。同サービスのヘルプページには、X APIでは記事のコンテンツにアクセスできないと記載されています。</li>
    <li><strong>無料版には広告が表示され</strong>、Markdown、EPUB、Obsidianへの書き出しもありません。</li>
  </ul>
  <p>Xtracticleが得意とするのはまさにその部分です。スレッドやXの長文記事を、自分のものとして残せるファイルに無料で変換します。</p>
</section>

<section>
  <h2>機能比較</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>スレッドをまとめる</td><td>✅ スレッド内のどのポストを貼ってもOK</td><td>✅ botにメンション、またはリンクを貼る</td></tr>
      <tr><td>Xの記事（長文）</td><td>✅ 見出し・リスト・画像・動画</td><td>❌ 非対応</td></tr>
      <tr><td>PDF</td><td>✅ 無料</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ 無料（YAMLフロントマター付き）</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ 無料</td><td>❌</td></tr>
      <tr><td>画像付きZIP（オフライン保存）</td><td>✅ 無料</td><td>❌</td></tr>
      <tr><td>一括ダウンロード</td><td>✅ 最大20件</td><td>❌</td></tr>
      <tr><td>広告</td><td>なし</td><td>無料プランで表示</td></tr>
      <tr><td>公開の場での投稿・botのタグ付け</td><td>一切不要</td><td>bot方式の場合は必要</td></tr>
      <tr><td>著者の新着通知・自動アーカイブ</td><td>❌ 未対応</td><td>✅ Premium</td></tr>
      <tr><td>オープンソース</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>2026年9月時点で、Thread Reader Appの<a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a>ページと
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">Help</a>ページをもとに確認しています。機能は変わることがあります。情報が古くなっていたら
  <a href="${GITHUB}/issues" rel="noopener">GitHub</a>でお知らせください。</small></p>
</section>

<section>
  <h2>乗り換えは10秒で完了</h2>
  ${steps([
    '<strong>スレッド内のポストのリンクをコピー</strong>します。最初のポストを探す必要はありません。',
    '<strong>上の欄に貼り付けて</strong>「取得」を押します。スレッド全体が番号付きでまとまります。',
    '<strong>ダウンロード</strong> — PDF、Markdown、EPUB、テキストで保存するか、Obsidianに送れます。',
  ])}
</section>

<section>
  <h2>Thread Reader Appのほうが向いているケース</h2>
  <p><strong>X上でほかの人のためにスレッドをまとめたい</strong>場合（botで返信して、会話に参加している全員に読みやすいリンクを届ける使い方）や、
  お気に入りの著者の<strong>新着通知や自動アーカイブ</strong>が欲しい場合は、Thread Reader Appにしかできないことです。Xtracticleにはこれらの機能はありません。
  その場で読むにはThread Reader App、コピーを残すにはXtracticle、と両方を使い分けている方も多くいます。</p>
</section>

${shortcuts('ja')}`,
  faq: [
    { q: 'Xtracticleは本当に無料ですか？', a: 'はい。PDF、Markdown、EPUB、ZIP、テキストのすべての形式が無料で、広告なし、ログイン不要、利用回数の制限もありません。ソースコードも公開しています。' },
    { q: 'XtracticleでXの記事をダウンロードできますか？', a: 'はい。Xの長文記事を、見出し、リスト、リンク、画像、動画を保ったまま変換できます。これがThread Reader Appとの大きな違いのひとつです。' },
    { q: 'botをタグ付けする必要はありますか？', a: 'いいえ。Xtracticleにリンクを貼るだけで、Xに何かが投稿されることはありません。' },
    { q: 'Thread Reader Appのアーカイブを取り込めますか？', a: '直接の取り込みはできません。元のXのリンクを貼り付ければ（一括モードなら一度に最大20件）、Markdownファイルとして作り直せます。' },
  ],
};

export const PAGES_JA: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];
