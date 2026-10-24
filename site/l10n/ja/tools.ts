/** Japanese: unroll, tweet to PDF, MCP server and privacy pages. */
import { GITHUB, privacy, samplePdfFigure, shortcuts, steps, type SitePage } from '../../blocks';

const unroll: SitePage = {
  id: 'ja-unroll',
  group: 'unroll',
  path: '/ja/thread-unroll',
  file: 'ja/thread-unroll.html',
  lang: 'ja',
  title: 'Xスレッドをまとめて読む｜スレッド展開ツール（bot不要） | Xtracticle',
  description:
    'Xのスレッドのどのポストでも貼り付けるだけで、スレッド全体を1ページで読めます。botへのリプライもログインも不要。PDF・Markdown・EPUBでの保存も無料。',
  h1: 'Twitterスレッドをまとめて読む',
  sub: 'X（旧Twitter）のスレッドを、ひと続きのきれいなページで読めます。スレッド内のどのポストのリンクでもOK。botもログインも不要です。',
  primary: 'md',
  nav: 'スレッドをまとめて読む',
  sections: `
<section>
  <p><strong>Xtracticleは、Twitter（X）のスレッドを展開してまとめて読める無料ツールです。</strong>スレッド内のどのポストでもリンクを貼るだけで、
  投稿者本人によるスレッド全体が、番号付きのひと続きのページとして下に表示され、すぐに読めます。保存は任意です。
  アカウント登録も広告もなく、相手に通知が届くこともありません。</p>
  <h2>3ステップでスレッドを展開</h2>
  ${steps([
    'スレッド内のどれかの<strong>ポストのリンクをコピー</strong>します。最初でも途中でも最後でも構いません（共有 → リンクをコピー）。',
    '<strong>上の欄に貼り付けて</strong>「取得」を押します。スレッドが順番どおりに1ページで開きます。',
    '<strong>このページで読む</strong>か、<em>「読み上げ」</em>で音声を聞くか、Markdown・PDF・EPUB・テキストでダウンロードできます。',
  ])}
</section>

<section>
  <h2>ここでの「展開（アンロール）」とは</h2>
  <p>スレッドとは、投稿者が自分のポストに返信を重ねてつなげた一連のポストです。Xでスクロールして読むと、ポストを1つずつ読み込む必要があり、
  他の人の返信が間に入って、どこまで読んだか分からなくなりがちです。展開すると、投稿者本人のポストが番号付き
  （<code>1/12</code>、<code>2/12</code>…）の1つのドキュメントにまとまり、改行、写真、引用ポスト、動画のサムネイルもそのまま残ります。</p>
  <ul>
    <li><strong>どのポストでもOK。</strong>最初のポストは不要です。手元にあるリンクを貼ってください。</li>
    <li><strong>投稿者本人のポストだけ。</strong>他の人の返信は含まれません。</li>
    <li><strong>いろいろなリンク形式に対応。</strong>x.com、twitter.com、fxtwitter、vxtwitter、nitter、xcancelのリンク、<code>/i/web/status/</code> 形式のリンク、ポストIDだけでも使えます。</li>
    <li><strong>公開スレッドのみ。</strong>非公開（鍵）アカウントは読めません。</li>
  </ul>
</section>

<section>
  <h2>botにメンションせずにスレッドをまとめる</h2>
  <p>スレッドをまとめる定番の方法は、スレッドの下で <em>@threadreaderapp unroll</em> と返信し、結果を待つやり方です。
  他の人も見つけられる共有ページができるなど、その方式ならではの利点があります。一方で、知っておきたい点もあります。</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>botにメンションする方法</th><th>Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>速さ</td><td>botが返信するまで待つ</td><td>貼り付けてすぐ表示</td></tr>
      <tr><td>公開範囲</td><td>リクエストが公開の返信になる</td><td>何も投稿されず、非公開で完結</td></tr>
      <tr><td>アカウント</td><td>botにメンションするためのXアカウントが必要</td><td>ログイン不要</td></tr>
      <tr><td>形式</td><td>Webページ</td><td>ページ、PDF、Markdown、EPUB、テキスト、ZIP</td></tr>
      <tr><td>他の人向けの公開ページ</td><td>あり（共有URL）</td><td>なし（ファイルやリンクを自分で共有）</td></tr>
    </tbody>
  </table></div>
  <p>詳しくは<a href="/ja/thread-reader-app-alternative">Thread Reader Appとの正直な比較</a>をご覧ください。</p>
</section>

<section>
  <h2>読んだら、残しておく</h2>
  <p>展開は読むための機能ですが、スレッドはいつまでも残るとは限りません。投稿者がポストを削除したり、アカウントが非公開になったりします。
  画面にスレッドを表示したら、使いやすい形式でコピーを保存しておけます。</p>
  <ul>
    <li><a href="/ja/x-thread-pdf">スレッドをPDFで保存</a> — 番号付きで印刷しやすいドキュメント。写真、出典リンク、ページ番号入り。PDFは画像として描画されるため、テキストの選択はできません。</li>
    <li><a href="/ja/x-kiji-markdown">Markdown</a> — 選択できるテキストで、YAMLフロントマターも付けられます。Obsidian、Notion、AIアシスタント向けです。</li>
    <li><a href="/ja/x-kiji-epub-kindle">EPUB 3</a> — 電子書籍リーダー向けのリフロー型電子書籍。</li>
    <li><strong>画像付きZIP</strong> — Markdownと全画像をローカルに保存。</li>
    <li><strong>テキスト</strong>、またはObsidianへのワンクリック書き出し。</li>
  </ul>
  <p>たくさんのスレッドを保存したいときは、一括モードに切り替えて最大20件のリンクを貼れば、Markdownファイルを1つのZIPにまとめて受け取れます。</p>
  <p>スレッドではなくXの記事を探している方は、<a href="/ja/x-kiji-pdf">X記事をPDFで保存</a>のページをご利用ください。ツール本体は<a href="/ja/">ホーム</a>にもあり、<a href="/ja/guides">ガイド</a>では使い方の例を紹介しています。</p>
</section>

${shortcuts('ja')}

${privacy('ja')}`,
  faq: [
    { q: 'Twitterのスレッドをまとめて読むには？', a: 'スレッド内のどれかのポストのリンクをコピーしてXtracticleに貼り付け、「取得」を押します。スレッド全体が番号付きの1ページで開きます。' },
    { q: 'スレッドの最初のポストが必要ですか？', a: 'いいえ。最初でも途中でも最後でも使えます。残りの投稿者本人のスレッドはXtracticleが見つけます。' },
    { q: '@threadreaderapp のようなbotをタグ付けする必要はありますか？', a: 'いいえ。何も投稿もメンションもされません。リンクを貼るだけで、アカウントなしですぐに結果を読めます。' },
    { q: '他の人の返信も含まれますか？', a: 'いいえ。スレッド内の投稿者本人のポストだけが、順番どおりにまとめられます。' },
    { q: 'スレッドを読む代わりに聞くことはできますか？', a: 'はい。「読み上げ」ボタンでスレッドを音声で聞けます。' },
    { q: 'まとめたスレッドをあとから保存できますか？', a: 'はい。PDF、Markdown（YAMLフロントマターは任意）、EPUB、テキスト、画像付きZIPで保存できます。一括モードでは最大20件のリンクを貼ると、Markdownファイルを1つのZIPで受け取れます。' },
    { q: '非公開（鍵）アカウントでも使えますか？', a: 'いいえ。展開できるのは公開スレッドだけです。' },
  ],
};

const tweetpdf: SitePage = {
  id: 'ja-tweetpdf',
  group: 'tweetpdf',
  path: '/ja/tweet-pdf',
  file: 'ja/tweet-pdf.html',
  lang: 'ja',
  title: 'ツイートをPDF保存｜Xのポストを無料でPDF化 | Xtracticle',
  description:
    'ツイート・Xのポストを、写真・引用ポスト・日付・出典リンク付きのA4 PDFに無料で保存。ログイン不要、透かしなし、iPhone・Androidも対応。',
  h1: 'ツイートをPDFで保存',
  sub: 'X（旧Twitter）のポストを、本文・写真・引用ポスト・日付・出典リンク付きのきれいなA4のPDFに保存できます。',
  primary: 'pdf',
  nav: 'ツイートをPDFで保存',
  sections: `
<section>
  <p><strong>Xtracticleは、無料で使えるツイートのPDF変換ツールです。</strong>X（Twitter）のポスト1件のリンクを貼るだけで、
  整ったA4のPDFをダウンロードできます。スクリーンショットも、アカウントも、透かしも不要。iPhone、Android、パソコンのどれでも使えます。</p>
  <h2>3ステップでツイートをPDFに保存</h2>
  ${steps([
    '<strong>ポストのリンクをコピー</strong>します（共有 → リンクをコピー）。x.com、twitter.com、fxtwitter、vxtwitter、nitter、xcancelのリンクのほか、ポストIDだけでも使えます。',
    '<strong>上の欄に貼り付けて</strong>「取得」を押します。',
    '<strong>「PDF」をクリック</strong>すると、すぐにファイルがダウンロードされます。',
  ])}
</section>

<section>
  <h2>PDFに含まれるもの</h2>
  <ul>
    <li><strong>本文の全文</strong>。投稿者が入れた改行もそのまま残ります。</li>
    <li><strong>写真</strong>を元の位置に、ページ幅に合わせて配置します。</li>
    <li><strong>引用ポスト</strong>。ツイートが別のポストを引用している場合に含まれます。</li>
    <li>冒頭に<strong>投稿者と日付</strong>。</li>
    <li>元のポストに戻れる<strong>クリック可能な出典リンク</strong>と、ページ番号。</li>
    <li>PDFでは動画を再生できないため、<strong>動画はリンク付きのサムネイル</strong>で表示されます。</li>
  </ul>
  <p>ページはすっきりしたA4で、Xのサイドバー、ボタン、トレンド、返信は入りません。</p>
  ${samplePdfFigure('ja')}
  <p>PDFは画像として描画されるのでレイアウトは正確ですが、テキストの選択はできません。検索やコピーが必要なときは、
  <a href="/ja/x-kiji-markdown">Markdown</a>や<a href="/ja/x-kiji-epub-kindle">EPUB</a>で書き出してください。</p>
</section>

<section>
  <h2>ツイートをPDFで保存する理由</h2>
  <ul>
    <li><strong>控えや確認の記録</strong> — 返金、遅延、約束などについての企業の公式な発表。</li>
    <li><strong>お知らせの保存</strong> — リリースノート、求人、イベントの詳細、ポリシーの変更など、手元に残したい情報。</li>
    <li><strong>証拠・引用元として</strong> — 日付と出典リンク付きのコピーは、切り取ったスクリーンショットより相手に渡しやすくなります。</li>
    <li><strong>調査のメモ</strong> — 投稿者と日付が付いたポストを、ほかの資料と一緒に整理できます。</li>
  </ul>
  <p>PDFは、保存した時点でポストに書かれていた内容の記録です。法的に認証された文書ではありません。</p>
</section>

<section>
  <h2>ポスト、スレッド、記事の違い</h2>
  <h3>1件のツイート</h3>
  <p>このページが対象です。リンク1つにつきPDF1つ。</p>
  <h3>スレッド</h3>
  <p>ポストがスレッドの一部なら、<a href="/ja/x-thread-pdf">スレッドをPDFで保存</a>のページをご利用ください。スレッド内のどのポストを貼っても、
  投稿者本人のポストが番号付きの1つのPDFにまとまります。先に画面で読みたいときは、
  <a href="/ja/thread-unroll">スレッドをまとめて読む</a>をお試しください。</p>
  <h3>長文の記事</h3>
  <p>Xの記事は、見出し、リスト、本文中の画像をそのまま保ちます。<a href="/ja/x-kiji-pdf">X記事をPDFで保存</a>をご利用ください。</p>
</section>

<section>
  <h2>削除されたポストについて</h2>
  <p>Xtracticleが読み取れるのは、現在も公開されているポストです。すでに削除されたポストや、非公開になったアカウントのポストは、あとから保存できません。
  だからこそ、公開されているうちにコピーを書き出しておくことをおすすめします。
  <a href="/ja/guides/recover-deleted-tweets">復元できるものとできないもの</a>もあわせてご覧ください。複数のポストを保存したいときは、一括モードで最大20件のリンクを貼れば、
  Markdownファイルを1つのZIPで受け取れます。ツール本体は<a href="/ja/">ホーム</a>にあり、<a href="/ja/guides">ガイド</a>では使い方の例を紹介しています。</p>
</section>

${shortcuts('ja')}

${privacy('ja')}`,
  faq: [
    { q: 'ツイートをPDFで保存するには？', a: 'ポストのリンクをコピー（共有 → リンクをコピー）してXtracticleに貼り付け、「取得」を押して「PDF」をクリックします。' },
    { q: 'PDFに写真や引用ポストは含まれますか？', a: 'はい。写真と、引用しているポストが含まれます。動画は、動画へのリンク付きのサムネイルで表示されます。' },
    { q: 'ツイートのPDF変換は無料ですか？', a: 'はい。無料で、ログイン不要、透かしも入りません。' },
    { q: 'PDF内のテキストを選択・検索できますか？', a: 'いいえ。PDFはレイアウトを正確に保つため画像として描画されます。テキストが必要な場合はMarkdownまたはEPUBで書き出してください。' },
    { q: 'すでに削除されたツイートを保存できますか？', a: 'いいえ。保存できるのは現在も公開されているポストだけです。消える前にコピーを書き出しておいてください。' },
    { q: 'スレッドや長い記事はどうすればいいですか？', a: 'スレッドは、投稿者のスレッド全体をまとめる「スレッドをPDFで保存」のページをご利用ください。長文の記事は「X記事をPDFで保存」をご利用ください。' },
    { q: '複数のツイートをまとめて保存できますか？', a: 'はい。一括モードでは最大20件のリンクを貼ると、Markdownファイルを1つのZIPで受け取れます。PDFはポストごとに保存してください。' },
  ],
};

const ENDPOINT = 'https://xtracticle.com/mcp';
const CURSOR_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=xtracticle&config=${btoa(JSON.stringify({ url: ENDPOINT }))}`;
const SAMPLE_ID = '1765884209527394325';

const code = (s: string) => `<pre><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

const mcp: SitePage = {
  id: 'ja-mcp',
  group: 'mcp',
  path: '/ja/mcp-server',
  file: 'ja/mcp-server.html',
  lang: 'ja',
  title: 'X用MCPサーバー｜AIでX記事・スレッドを読む | Xtracticle',
  description:
    'Claude、ChatGPT、CursorなどのAIが、X（Twitter）の記事・スレッド・ポストをMarkdownで読める無料のリモートMCPサーバー。APIキー不要。',
  h1: 'X記事・スレッド用のMCPサーバー',
  sub: 'AIアシスタントが、公開されているX（旧Twitter）のポスト・スレッド・記事をきれいなMarkdownで読めるようになります。無料でAPIキーも不要です。',
  primary: 'md',
  nav: 'MCPサーバー',
  sections: `
<section>
  <p><strong>AIアシスタントはXのリンクを開けません。</strong>ページの表示にJavaScriptが必要で、ログインも求められることが多いためです。
  XtracticleのMCPサーバーを使えば解決します。Claude、ChatGPT、Cursorなど、MCPに対応したクライアントにURLを1つ追加して、チャットにXのリンクを貼るだけです。</p>
  <ul>
    <li><strong>エンドポイント:</strong> <code>${ENDPOINT}</code>（Streamable HTTP、認証なし）</li>
    <li><strong>ツール:</strong> <code>read_x_post</code> — ポスト、スレッド全体（スレッド内のどのポストからでも）、Xの記事をMarkdownで取得</li>
    <li><strong>無料・オープンソース</strong> — サーバーは<a href="${GITHUB}" rel="noopener">Xtracticleのリポジトリ</a>に含まれています</li>
  </ul>
</section>

<section>
  <h2>お使いのAIアシスタントに追加する</h2>
  <h3>Claude Code</h3>
  ${code(`claude mcp add --transport http xtracticle ${ENDPOINT}`)}
  <h3>Claude（デスクトップ版・Web版）</h3>
  <p><em>Settings → Connectors → Add custom connector</em> を開き、名前に <em>Xtracticle</em> と入力して <code>${ENDPOINT}</code> を貼り付けます。</p>
  <h3>ChatGPT</h3>
  <p>開発者モードを有効にした状態で <em>Settings → Connectors → Create</em> を開き、<code>${ENDPOINT}</code> を貼り付けて <em>No authentication</em> を選びます。</p>
  <h3>Cursor</h3>
  <p><a href="${CURSOR_LINK}">Cursorに追加</a>するか、<code>~/.cursor/mcp.json</code> に次の内容を記述します。</p>
  ${code(`{
  "mcpServers": {
    "xtracticle": { "url": "${ENDPOINT}" }
  }
}`)}
  <h3>VS Code（GitHub Copilot）</h3>
  <p><code>.vscode/mcp.json</code> に追加します。</p>
  ${code(`{
  "servers": {
    "xtracticle": { "type": "http", "url": "${ENDPOINT}" }
  }
}`)}
  <h3>その他のクライアント</h3>
  <p>Streamable HTTPによるリモートMCPサーバーに対応していれば、どのクライアントでも使えます。ローカル（stdio）のサーバーにしか対応していないクライアントは、ブリッジ経由で接続できます。</p>
  ${code(`npx -y mcp-remote ${ENDPOINT}`)}
</section>

<section>
  <h2>read_x_post ツール</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>引数</th><th>デフォルト</th><th>内容</th></tr></thead>
    <tbody>
      <tr><td><code>url</code></td><td>—</td><td>ポストのリンク（x.com、twitter.com、fxtwitter、nitterなど）または数字のポストID。スレッド内のどのポストでも使えます。</td></tr>
      <tr><td><code>format</code></td><td><code>markdown</code></td><td><code>markdown</code> または <code>text</code></td></tr>
      <tr><td><code>include_thread</code></td><td><code>true</code></td><td>投稿者本人のスレッドを展開します。<code>false</code> にすると、リンク先のポストだけを返します。</td></tr>
      <tr><td><code>front_matter</code></td><td><code>false</code></td><td>YAMLフロントマター（title、author、source、date、type）を先頭に追加します。</td></tr>
      <tr><td><code>max_chars</code> / <code>offset</code></td><td>40,000 / 0</td><td>とても長いドキュメントを分割して取得します。</td></tr>
    </tbody>
  </table></div>
  <p>結果は、タイトル、著者、日付、出典リンクを先頭に置いたMarkdownと、メタデータ（種類（記事・スレッド・ポスト）、語数、読了時間、画像URL、元のリンク、
  ポストをPDF・EPUB・Markdownで保存できるダウンロードリンク）です。AIアシスタントには、たとえば次のように頼めます。</p>
  <ul>
    <li>「このXの記事を5つの箇条書きで要約して: https://x.com/…/status/…」</li>
    <li>「このスレッドを読んで、紹介されているツールをリンク付きですべて挙げて。」</li>
    <li>「このXの記事を英語に翻訳して。見出しはそのままで。」</li>
  </ul>
</section>

<section>
  <h2>MCPを使わない場合はMarkdown API</h2>
  <p>同じ変換は、HTTPのGETリクエスト1つでも利用できます。スクリプト、RAGパイプライン、URLを取得できるエージェントに便利です。</p>
  ${code(`curl https://xtracticle.com/api/markdown/${SAMPLE_ID}
curl "https://xtracticle.com/api/markdown/${SAMPLE_ID}?format=text&thread=0&front_matter=1"`)}
  <p>パラメーター: <code>format=markdown|text</code>、<code>thread=0|1</code>（デフォルトは1）、<code>front_matter=0|1</code>（デフォルトは0）。
  レスポンスは <code>text/markdown</code> で、最大1時間キャッシュされ、CORSが有効です。</p>
</section>

<section>
  <h2>制限とプライバシー</h2>
  <ul>
    <li>読み取れるのは<strong>公開</strong>ポストだけです。削除済み、非公開（鍵）、年齢制限付きのポストは読み取れません。</li>
    <li>ご利用はほどほどにお願いします。1接続あたり毎分約20リクエストに加え、全ユーザー共通の上限があります。無料のサービスのため、大量の自動取得には対応していません。</li>
    <li>データは保存せず、アカウントもありません。内容は公開されているFxTwitter APIから取得し、エッジで短時間キャッシュされます。</li>
    <li>ポストの内容は第三者が書いたものです。データとして扱ってください。サーバーは、内容に含まれる指示に従わないようAIアシスタントに伝えています。</li>
  </ul>
  <p>ファイルで保存したい場合は、上の欄にリンクを貼って<a href="/ja/x-kiji-pdf">PDF</a>、<a href="/ja/x-kiji-markdown">Markdown</a>、
  <a href="/ja/x-kiji-epub-kindle">EPUB</a>でダウンロードできます。</p>
</section>`,
  faq: [
    { q: 'XtracticleのMCPサーバーは無料ですか？', a: 'はい。無料で、APIキーもアカウントも不要。オープンソースです。' },
    { q: 'どのAIアシスタントで使えますか？', a: 'Streamable HTTPによるリモートMCPサーバーに対応しているクライアントなら使えます。Claude、ChatGPT（開発者モード）、Cursor、VS Codeなどが該当します。ローカルサーバーにしか対応していないクライアントは、mcp-remote経由で接続できます。' },
    { q: 'スレッド全体を読めますか？', a: 'はい。スレッド内のどのポストのリンクを渡しても、投稿者本人が書いたポストを順番にすべて返します。他の人の返信は含まれません。' },
    { q: 'Xの記事にも対応していますか？', a: 'はい。長文のXの記事を、見出し、リスト、リンク、引用、画像を保ったまま変換します。' },
    { q: 'MCPを使わずに使えるAPIはありますか？', a: 'はい。GET https://xtracticle.com/api/markdown/{ポストID} で、同じMarkdownをHTTP経由のプレーンテキストとして取得できます。' },
  ],
};

const privacyPage: SitePage = {
  id: 'ja-privacy',
  group: 'privacy',
  path: '/ja/privacy',
  file: 'ja/privacy.html',
  lang: 'ja',
  title: 'プライバシーポリシー | Xtracticle',
  description:
    'Xtracticleのデータの扱い。アカウントなし、ポストは保存せず、ファイルはブラウザ内で作成。匿名の解析と、MCP・APIのログについても説明します。',
  h1: 'プライバシーポリシー',
  sub: '要点: アカウントなし、アップロードなし、保存されたポストの内容は当方では保持しません。',
  primary: 'pdf',
  nav: 'プライバシー',
  sections: `
<section>
  <p><em>最終更新日: 2026年10月3日</em> このポリシーは、xtracticle.com、Markdown API（<code>/api/markdown/…</code>）、
  MCPサーバー（<code>/mcp</code>）に適用されます。Xtracticleは無料のオープンソースプロジェクトで、
  <a href="${GITHUB}" rel="noopener">ソースコード</a>で動作を正確に確認できます。</p>
</section>

<section>
  <h2>収集しない情報</h2>
  <ul>
    <li>アカウント、ログイン、メールアドレス、支払い情報は扱いません。</li>
    <li>アップロードはありません。PDF、EPUB、ZIPなどのファイルはブラウザ内で作成され、当方に送信されることはありません。</li>
    <li>個人データの販売や共有は行わず、広告トラッカーも使用しません。</li>
  </ul>
</section>

<section>
  <h2>ポストの内容</h2>
  <p>リンクを貼ったとき（またはAIアシスタントがMCPサーバーを呼び出したとき）、当方はオープンソースのFxTwitter APIを通じて、その<strong>公開</strong>Xポストを取得します。
  サービスを速く安定して提供するため、ポストのデータはCloudflareのエッジネットワークにキャッシュされます。変換後のドキュメントは最大1時間、
  予備のコピーは最大7日間です。キャッシュされたコピーはあなたと紐づけられることはなく、自動的に期限切れになります。非公開（鍵）のポストや削除されたポストは、そもそも取得できません。</p>
</section>

<section>
  <h2>解析とログ</h2>
  <ul>
    <li><strong>ウェブサイト:</strong> Google Analyticsで、匿名のページビューとイベント（たとえば「PDFをダウンロード」や書き出し形式）を集計し、どの機能が使われているかを把握しています。
    ページビューと同様に、開いたページのアドレスは把握されます。<code>/user/status/123</code> のような共有ページでは、ポストのリンクが含まれますが、保存したポストの内容は含まれません。</li>
    <li><strong>MCPサーバーとAPI:</strong> Cloudflareのリクエストログに、呼び出しごとの技術的なデータ（ポストID、ドキュメントの種類、レスポンスのサイズと時間、クライアントのユーザーエージェント）が、
    デバッグと不正利用の防止のために記録されます。また、Cloudflareはレート制限のためにIPアドレスを処理します。ログはCloudflareが一定期間保持し、あなたを特定するためには使用されません。</li>
  </ul>
</section>

<section>
  <h2>ブラウザに保存されるもの</h2>
  <p>最近のリンク、テーマ、言語の選択は、お使いのブラウザのローカルストレージにのみ保存されます。削除するには、ブラウザのデータを消去してください。</p>
</section>

<section>
  <h2>第三者サービス</h2>
  <ul>
    <li><strong>Cloudflare</strong>がサイト、API、MCPサーバーをホストしています。</li>
    <li><strong>FxTwitter</strong>が公開ポストのデータを提供しています。</li>
    <li><strong>Google Analytics</strong>が匿名の利用統計を提供しています。</li>
    <li>プレビューや書き出しに表示される画像は、Xのメディアサーバー（pbs.twimg.com）から読み込まれます。</li>
  </ul>
</section>

<section>
  <h2>お問い合わせ</h2>
  <p>ご質問や削除のご依頼は、<a href="${GITHUB}/issues" rel="noopener">GitHubでIssueを作成</a>してください。</p>
</section>`,
  faq: [],
};

export const TOOLS: SitePage[] = [unroll, tweetpdf, mcp, privacyPage];
