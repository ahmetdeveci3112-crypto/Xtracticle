/** Páginas em português do Brasil: desenrolar thread, tweet para PDF, localizador de tweets apagados, servidor MCP e privacidade. */
import { GITHUB, privacy, samplePdfFigure, shortcuts, steps, type SitePage } from '../../blocks';

const ENDPOINT = 'https://xtracticle.com/mcp';
const CURSOR_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=xtracticle&config=${btoa(JSON.stringify({ url: ENDPOINT }))}`;
const SAMPLE_ID = '1765884209527394325';

const code = (s: string) => `<pre><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

const unroll: SitePage = {
  id: 'pt-unroll',
  group: 'unroll',
  path: '/pt/desenrolar-thread-do-twitter',
  file: 'pt/desenrolar-thread-do-twitter.html',
  lang: 'pt',
  title: 'Desenrolar thread do Twitter — Leia em uma página | Xtracticle',
  description:
    'Desenrole qualquer thread do Twitter/X em uma página limpa, na hora. Cole um post — sem marcar bot, sem login. Depois salve em PDF, Markdown ou EPUB. Grátis.',
  h1: 'Desenrolar thread do Twitter',
  sub: 'Leia qualquer thread do X (Twitter) como uma única página limpa. Cole o link de qualquer post da thread — sem bot e sem login.',
  primary: 'md',
  nav: 'Desenrolar thread',
  sections: `
<section>
  <p><strong>O Xtracticle é uma ferramenta grátis para desenrolar threads do Twitter (X):</strong> cole o link de qualquer post da thread e
  toda a sequência do autor aparece logo abaixo, numerada, em uma única página contínua que você já pode ler. Salvar é opcional — sem
  conta, sem anúncios e ninguém recebe notificação.</p>
  <h2>Desenrole uma thread em três passos</h2>
  ${steps([
    '<strong>Copie o link</strong> de qualquer post da thread — o primeiro, um do meio ou o último (Compartilhar → Copiar link).',
    '<strong>Cole aqui em cima</strong> e clique em Extrair. A thread abre em uma única página, na ordem.',
    '<strong>Leia aqui mesmo</strong>, clique em <em>Ouvir</em> para escutar em voz alta ou baixe em Markdown, PDF, EPUB ou texto.',
  ])}
</section>

<section>
  <h2>O que significa “desenrolar” aqui</h2>
  <p>Uma thread é uma sequência de posts em que o autor responde a si mesmo. Rolar isso no X significa carregar post por post, pular
  respostas de outras pessoas e perder o ponto onde você estava. Desenrolar junta os posts do autor em um único documento numerado
  (<code>1/12</code>, <code>2/12</code>…), mantendo quebras de linha, fotos, posts citados e miniaturas de vídeo.</p>
  <ul>
    <li><strong>Qualquer post serve.</strong> Você não precisa do primeiro; cole o que tiver.</li>
    <li><strong>Só os posts do autor.</strong> Respostas de outras pessoas ficam de fora.</li>
    <li><strong>Vários tipos de link.</strong> Funcionam links de x.com, twitter.com, fxtwitter, vxtwitter, nitter e xcancel, links <code>/i/web/status/</code> e IDs de post puros.</li>
    <li><strong>Só threads públicas.</strong> Contas privadas não podem ser lidas.</li>
  </ul>
</section>

<section>
  <h2>Desenrolar sem marcar um bot</h2>
  <p>O jeito clássico de desenrolar uma thread é responder embaixo dela com <em>@threadreaderapp unroll</em> e esperar. Esse método tem
  vantagens reais, como uma página que dá para compartilhar e que outras pessoas encontram. Também tem custos que vale conhecer:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Marcando um bot</th><th>Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Velocidade</td><td>Esperar o bot responder</td><td>Na hora, logo depois de colar</td></tr>
      <tr><td>Visibilidade</td><td>Seu pedido é uma resposta pública</td><td>Nada é publicado; é privado</td></tr>
      <tr><td>Conta</td><td>Precisa de uma conta no X para marcar o bot</td><td>Sem login</td></tr>
      <tr><td>Formatos</td><td>Uma página web</td><td>Página, PDF, Markdown, EPUB, texto, ZIP</td></tr>
      <tr><td>Página pública para outras pessoas</td><td>Sim, uma URL compartilhável</td><td>Não; você compartilha o arquivo ou o link</td></tr>
    </tbody>
  </table></div>
  <p>Veja a <a href="/pt/alternativa-ao-thread-reader-app">comparação completa e honesta com o Thread Reader App</a>.</p>
</section>

<section>
  <h2>Leia e depois guarde</h2>
  <p>Desenrolar serve para ler, mas threads não duram para sempre: autores apagam posts e contas ficam privadas. Com a thread na tela,
  você pode salvar uma cópia no formato que preferir.</p>
  <ul>
    <li><a href="/pt/thread-do-twitter-para-pdf">Thread para PDF</a> — um documento numerado e imprimível, com fotos, link da fonte e números de página. O PDF é baseado em imagem, então o texto não pode ser selecionado.</li>
    <li><a href="/pt/artigo-do-x-para-markdown">Markdown</a> — texto selecionável com front-matter YAML opcional, para Obsidian, Notion ou um assistente de IA.</li>
    <li><a href="/pt/artigo-do-x-para-epub-kindle">EPUB 3</a> — um e-book de texto ajustável para o seu leitor digital.</li>
    <li><strong>ZIP com imagens</strong> — Markdown mais todas as imagens salvas localmente.</li>
    <li><strong>Texto simples</strong>, ou exportação com um clique para o Obsidian.</li>
  </ul>
  <p>Tem uma pilha de threads? Mude para o Modo em lote, cole até 20 links e receba um ZIP com arquivos Markdown.</p>
  <p>Procura um Artigo do X, e não uma thread? Use a página <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>. A ferramenta também está na <a href="/pt/">página inicial</a>, e os <a href="/pt/guias">guias</a> cobrem fluxos de trabalho comuns.</p>
</section>

${shortcuts('pt')}

${privacy('pt')}`,
  faq: [
    { q: 'Como desenrolar uma thread do Twitter?', a: 'Copie o link de qualquer post da thread, cole no Xtracticle e clique em Extrair. A thread inteira abre em uma página numerada.' },
    { q: 'Preciso do primeiro post da thread?', a: 'Não. O primeiro, um do meio ou o último funcionam. O Xtracticle encontra o resto da thread do autor.' },
    { q: 'Tenho que marcar um bot como o @threadreaderapp?', a: 'Não. Nada é postado nem marcado. Você cola um link e lê o resultado na hora, sem conta.' },
    { q: 'As respostas de outras pessoas entram?', a: 'Não. Só os posts do próprio autor na thread são reunidos, na ordem.' },
    { q: 'Posso ouvir a thread em vez de ler?', a: 'Sim. Use o botão Ouvir para a thread ser lida em voz alta.' },
    { q: 'Posso salvar a thread desenrolada depois?', a: 'Sim, em PDF, Markdown (com front-matter YAML opcional), EPUB, texto simples ou ZIP com imagens. O Modo em lote aceita até 20 links e devolve um ZIP com arquivos Markdown.' },
    { q: 'Funciona com contas privadas?', a: 'Não. Só threads públicas podem ser desenroladas.' },
  ],
};

const tweetpdf: SitePage = {
  id: 'pt-tweetpdf',
  group: 'tweetpdf',
  path: '/pt/tweet-para-pdf',
  file: 'pt/tweet-para-pdf.html',
  lang: 'pt',
  title: 'Tweet em PDF — Salve qualquer post do X em PDF | Xtracticle',
  description:
    'Salve qualquer tweet ou post do X em PDF A4 limpo, com fotos, post citado, data e link da fonte. Grátis, sem login, sem marca d’água — no iPhone e no Android.',
  h1: 'Tweet para PDF',
  sub: 'Salve qualquer post do X (Twitter) em um PDF A4 limpo — com texto, fotos, post citado, data e link da fonte.',
  primary: 'pdf',
  nav: 'Tweet para PDF',
  sections: `
<section>
  <p><strong>O Xtracticle é um conversor de tweet em PDF grátis:</strong> cole o link de um único post do X (Twitter) e baixe em um
  PDF A4 organizado — sem prints, sem conta, sem marca d’água. Funciona no iPhone, no Android e no computador.</p>
  <h2>Salve um tweet em PDF em três passos</h2>
  ${steps([
    '<strong>Copie o link do post</strong> (Compartilhar → Copiar link). Links de x.com, twitter.com, fxtwitter, vxtwitter, nitter e xcancel funcionam, e um ID de post puro também.',
    '<strong>Cole aqui em cima</strong> e clique em Extrair.',
    '<strong>Clique em PDF</strong> — o arquivo é baixado na hora.',
  ])}
</section>

<section>
  <h2>O que vem no PDF</h2>
  <ul>
    <li><strong>O texto completo</strong>, com as quebras de linha originais do autor.</li>
    <li><strong>Fotos</strong> no lugar certo, ajustadas ao tamanho da página.</li>
    <li><strong>O post citado</strong>, se o tweet citar outro.</li>
    <li><strong>Autor e data</strong> no topo.</li>
    <li><strong>Um link clicável da fonte</strong> para o post original, além de números de página.</li>
    <li><strong>Vídeos como miniaturas com link</strong>, já que um PDF não reproduz vídeo.</li>
  </ul>
  <p>A página é uma folha A4 limpa — sem a barra lateral do X, botões, assuntos do momento ou respostas.</p>
  ${samplePdfFigure('pt')}
  <p>O PDF é baseado em imagem, o que mantém o layout exato, mas significa que o texto não pode ser selecionado. Se você precisa pesquisar ou
  copiar o texto, exporte em <a href="/pt/artigo-do-x-para-markdown">Markdown</a> ou <a href="/pt/artigo-do-x-para-epub-kindle">EPUB</a>.</p>
</section>

<section>
  <h2>Por que salvar um tweet em PDF?</h2>
  <ul>
    <li><strong>Comprovantes e confirmações</strong> — uma declaração pública de uma empresa sobre reembolso, atraso ou promessa.</li>
    <li><strong>Comunicados</strong> — notas de versão, vagas de emprego, detalhes de eventos e mudanças de regras que você quer guardar.</li>
    <li><strong>Provas e citações</strong> — uma cópia datada, com o link da fonte, é mais fácil de entregar do que um print cortado.</li>
    <li><strong>Notas de pesquisa</strong> — arquive o post junto das suas fontes, com autor e data.</li>
  </ul>
  <p>Lembre-se: o PDF é um registro do que o post dizia quando você o salvou. Não é um documento com validade jurídica.</p>
</section>

<section>
  <h2>Posts, threads e Artigos</h2>
  <h3>Um tweet avulso</h3>
  <p>É esta página. Um link, um PDF.</p>
  <h3>Uma thread</h3>
  <p>Se o post faz parte de uma thread, use a página <a href="/pt/thread-do-twitter-para-pdf">thread para PDF</a>. Cole qualquer post da thread e todos
  os posts do autor são reunidos em um único PDF numerado. Para ler a thread na tela primeiro, experimente
  <a href="/pt/desenrolar-thread-do-twitter">desenrolar thread do Twitter</a>.</p>
  <h3>Um Artigo longo</h3>
  <p>Os Artigos do X mantêm títulos, listas e imagens no meio do texto. Use <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>.</p>
</section>

<section>
  <h2>Posts apagados</h2>
  <p>O Xtracticle lê posts públicos que ainda estão no ar. Se um post já foi apagado, ou se a conta ficou privada,
  não dá mais para salvá-lo. Por isso vale exportar uma cópia enquanto ele está disponível. Leia
  <a href="/pt/guias/recuperar-tweets-apagados">o que dá e o que não dá para recuperar</a>. Precisa de vários posts? O Modo em lote aceita até 20 links
  e devolve um ZIP com arquivos Markdown. A ferramenta está na <a href="/pt/">página inicial</a>, e os <a href="/pt/guias">guias</a> trazem mais fluxos de trabalho.</p>
</section>

${shortcuts('pt')}

${privacy('pt')}`,
  faq: [
    { q: 'Como salvar um tweet em PDF?', a: 'Copie o link do post (Compartilhar → Copiar link), cole no Xtracticle, clique em Extrair e depois em PDF.' },
    { q: 'O PDF inclui as fotos e o post citado?', a: 'Sim. As fotos e o post citado entram no PDF. Os vídeos aparecem como uma miniatura com link para o vídeo.' },
    { q: 'O conversor de tweet em PDF é grátis?', a: 'Sim. É grátis, não pede login e não coloca marca d’água.' },
    { q: 'Dá para selecionar ou pesquisar o texto do PDF?', a: 'Não. O PDF é baseado em imagem para manter o layout exato. Use a exportação em Markdown ou EPUB se precisar de texto selecionável.' },
    { q: 'Posso salvar um tweet que já foi apagado?', a: 'Não. Só posts públicos que ainda estão no ar podem ser salvos, então exporte uma cópia antes que ele suma.' },
    { q: 'E as threads e os Artigos longos?', a: 'Para threads, use a página de thread para PDF, que reúne a thread inteira do autor. Para Artigos longos, use Artigo do X para PDF.' },
    { q: 'Posso salvar vários tweets de uma vez?', a: 'Sim. O Modo em lote aceita até 20 links e devolve os posts como arquivos Markdown em um ZIP. Para PDF, salve cada post separadamente.' },
  ],
};

const mcp: SitePage = {
  id: 'pt-mcp',
  group: 'mcp',
  path: '/pt/servidor-mcp',
  file: 'pt/servidor-mcp.html',
  lang: 'pt',
  title: 'Servidor MCP do X (Twitter): Artigos e threads na IA | Xtracticle',
  description:
    'Servidor MCP remoto e grátis para Claude, ChatGPT, Cursor e outras IAs lerem artigos, threads e posts do X (Twitter) em Markdown limpo. Sem chave de API.',
  h1: 'Servidor MCP para Artigos e threads do X',
  sub: 'Deixe seu assistente de IA ler qualquer post, thread ou Artigo público do X (Twitter) em Markdown limpo — grátis, sem chave de API.',
  primary: 'md',
  nav: 'Servidor MCP',
  sections: `
<section>
  <p><strong>Assistentes de IA não conseguem abrir links do X</strong> — a página exige JavaScript e, muitas vezes, login. O servidor MCP
  do Xtracticle resolve isso: adicione uma URL ao Claude, ao ChatGPT, ao Cursor ou a qualquer outro cliente MCP e depois é só colar um link do X no chat.</p>
  <ul>
    <li><strong>Endpoint:</strong> <code>${ENDPOINT}</code> (Streamable HTTP, sem autenticação)</li>
    <li><strong>Ferramenta:</strong> <code>read_x_post</code> — um post, uma thread inteira do autor (a partir de qualquer post dela) ou um Artigo do X em Markdown</li>
    <li><strong>Grátis e de código aberto</strong> — o servidor faz parte do <a href="${GITHUB}" rel="noopener">repositório do Xtracticle</a></li>
  </ul>
</section>

<section>
  <h2>Adicione ao seu assistente de IA</h2>
  <h3>Claude Code</h3>
  ${code(`claude mcp add --transport http xtracticle ${ENDPOINT}`)}
  <h3>Claude (desktop e web)</h3>
  <p>Abra <em>Settings → Connectors → Add custom connector</em>, dê o nome <em>Xtracticle</em> e cole <code>${ENDPOINT}</code>.</p>
  <h3>ChatGPT</h3>
  <p>Com o modo desenvolvedor ativado, abra <em>Settings → Connectors → Create</em>, cole <code>${ENDPOINT}</code> e escolha <em>No authentication</em>.</p>
  <h3>Cursor</h3>
  <p><a href="${CURSOR_LINK}">Adicionar ao Cursor</a>, ou coloque isto em <code>~/.cursor/mcp.json</code>:</p>
  ${code(`{
  "mcpServers": {
    "xtracticle": { "url": "${ENDPOINT}" }
  }
}`)}
  <h3>VS Code (GitHub Copilot)</h3>
  <p>Adicione a <code>.vscode/mcp.json</code>:</p>
  ${code(`{
  "servers": {
    "xtracticle": { "type": "http", "url": "${ENDPOINT}" }
  }
}`)}
  <h3>Outros clientes</h3>
  <p>Qualquer cliente que aceite servidores MCP remotos via Streamable HTTP funciona. Clientes que só aceitam servidores locais (stdio) podem usar uma ponte:</p>
  ${code(`npx -y mcp-remote ${ENDPOINT}`)}
</section>

<section>
  <h2>A ferramenta read_x_post</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Argumento</th><th>Padrão</th><th>O que faz</th></tr></thead>
    <tbody>
      <tr><td><code>url</code></td><td>—</td><td>Link do post (x.com, twitter.com, fxtwitter, nitter…) ou ID numérico do post. Qualquer post de uma thread serve.</td></tr>
      <tr><td><code>format</code></td><td><code>markdown</code></td><td><code>markdown</code> ou <code>text</code></td></tr>
      <tr><td><code>include_thread</code></td><td><code>true</code></td><td>Desenrola a thread do autor; <code>false</code> devolve só o post do link</td></tr>
      <tr><td><code>front_matter</code></td><td><code>false</code></td><td>Adiciona front-matter YAML no início (título, autor, fonte, data, tipo)</td></tr>
      <tr><td><code>max_chars</code> / <code>offset</code></td><td>40.000 / 0</td><td>Percorre documentos muito longos por partes</td></tr>
    </tbody>
  </table></div>
  <p>O resultado é o Markdown — com título, autor, data e link da fonte no início — mais metadados: tipo (artigo, thread ou post),
  contagem de palavras, tempo de leitura, URLs das imagens, o link original e um link de download em que o usuário pode salvar o post em PDF, EPUB
  ou Markdown. Coisas para pedir ao seu assistente:</p>
  <ul>
    <li>“Resuma este artigo do X em cinco tópicos: https://x.com/…/status/…”</li>
    <li>“Leia esta thread e liste todas as ferramentas que ela recomenda, com links.”</li>
    <li>“Traduza este Artigo do X para o espanhol e mantenha os títulos.”</li>
  </ul>
</section>

<section>
  <h2>Sem MCP? Use a API de Markdown</h2>
  <p>A mesma conversão está a uma requisição HTTP GET de distância — útil para scripts, pipelines de RAG e agentes que conseguem buscar URLs:</p>
  ${code(`curl https://xtracticle.com/api/markdown/${SAMPLE_ID}
curl "https://xtracticle.com/api/markdown/${SAMPLE_ID}?format=text&thread=0&front_matter=1"`)}
  <p>Parâmetros: <code>format=markdown|text</code>, <code>thread=0|1</code> (padrão 1), <code>front_matter=0|1</code> (padrão 0).
  As respostas são <code>text/markdown</code>, ficam em cache por até uma hora e têm CORS habilitado.</p>
</section>

<section>
  <h2>Limites e privacidade</h2>
  <ul>
    <li>Só posts <strong>públicos</strong> podem ser lidos — não os apagados, protegidos ou com restrição de idade.</li>
    <li>Use com moderação: cerca de 20 requisições por minuto por conexão, além de um limite compartilhado entre todos os usuários. É um serviço grátis, então a coleta em massa não é suportada.</li>
    <li>Nada é armazenado e não há contas. O conteúdo vem da API pública do FxTwitter e fica em cache por pouco tempo na borda da rede.</li>
    <li>O conteúdo dos posts é escrito por terceiros. Trate-o como dados — o servidor orienta seu assistente a não seguir instruções que estejam dentro dele.</li>
  </ul>
  <p>Prefere arquivos? Cole um link na <a href="/pt/">página inicial</a> para baixar em <a href="/pt/artigo-do-x-para-pdf">PDF</a>, <a href="/pt/artigo-do-x-para-markdown">Markdown</a>
  ou <a href="/pt/artigo-do-x-para-epub-kindle">EPUB</a>.</p>
</section>`,
  faq: [
    { q: 'O servidor MCP do Xtracticle é grátis?', a: 'Sim. É grátis, não precisa de chave de API nem de conta, e é de código aberto.' },
    { q: 'Com quais assistentes de IA ele funciona?', a: 'Com qualquer cliente que aceite servidores MCP remotos via Streamable HTTP, incluindo Claude, ChatGPT (modo desenvolvedor), Cursor e VS Code. Clientes que só aceitam servidores locais podem se conectar pelo mcp-remote.' },
    { q: 'Ele consegue ler threads inteiras?', a: 'Sim. Passe o link de qualquer post de uma thread e a ferramenta devolve todos os posts que o autor escreveu nela, na ordem. Respostas de outras pessoas ficam de fora.' },
    { q: 'Funciona com Artigos do X?', a: 'Sim. Os Artigos longos do X são convertidos com títulos, listas, links, citações e imagens.' },
    { q: 'Existe uma API sem MCP?', a: 'Sim. GET https://xtracticle.com/api/markdown/{ID do post} devolve o mesmo Markdown como texto simples via HTTP.' },
  ],
};

const privacyPt: SitePage = {
  id: 'pt-privacy',
  group: 'privacy',
  path: '/pt/privacidade',
  file: 'pt/privacidade.html',
  lang: 'pt',
  title: 'Política de Privacidade | Xtracticle',
  description:
    'Como o Xtracticle trata dados: sem contas, sem posts armazenados, arquivos gerados no seu navegador, análises anônimas e o que o servidor MCP e a API registram.',
  h1: 'Política de Privacidade',
  sub: 'Resumindo: sem contas, sem uploads e não guardamos os posts que você salva.',
  primary: 'pdf',
  nav: 'Privacidade',
  sections: `
<section>
  <p><em>Última atualização: 3 de outubro de 2026.</em> Esta política vale para xtracticle.com, sua API de Markdown (<code>/api/markdown/…</code>)
  e seu servidor MCP (<code>/mcp</code>). O Xtracticle é um projeto grátis e de código aberto; o
  <a href="${GITHUB}" rel="noopener">código-fonte</a> mostra exatamente o que ele faz.</p>
</section>

<section>
  <h2>O que não coletamos</h2>
  <ul>
    <li>Sem contas, logins, endereços de e-mail ou dados de pagamento.</li>
    <li>Sem uploads: PDF, EPUB, ZIP e outros arquivos são gerados no seu navegador e nunca são enviados para nós.</li>
    <li>Não vendemos nem compartilhamos dados pessoais, e não usamos rastreadores de publicidade.</li>
  </ul>
</section>

<section>
  <h2>Conteúdo dos posts</h2>
  <p>Quando você cola um link (ou um assistente de IA chama o servidor MCP), buscamos esse post <strong>público</strong> do X pela API
  de código aberto do FxTwitter. Para manter o serviço rápido e disponível, os dados do post ficam em cache na rede de borda da Cloudflare:
  o documento convertido por até uma hora e uma cópia reserva por até sete dias. As cópias em cache não são vinculadas a você e
  expiram automaticamente. Posts privados, protegidos e apagados não podem ser buscados de forma alguma. Quando você cola um link de perfil,
  enviamos apenas o nome da conta à API CDX do Internet Archive para listar os posts arquivados; os resultados ficam em cache por até 30 dias e não
  são vinculados a você. Para listar os últimos posts de uma conta e baixá-los em ZIP, buscamos os posts públicos recentes dela pela API do FxTwitter; a lista fica em cache por até 15 minutos e não é vinculada a você.</p>
</section>

<section>
  <h2>Análises e registros</h2>
  <ul>
    <li><strong>Site:</strong> o Google Analytics conta visualizações de página e eventos anônimos (por exemplo, “PDF baixado” ou o formato
    de exportação) para sabermos quais recursos são usados. Como em qualquer visualização de página, ele vê o endereço da página que você abre — que,
    em uma página de compartilhamento como <code>/usuario/status/123</code>, inclui o link do post — mas não o conteúdo dos posts que você salva.</li>
    <li><strong>Servidor MCP e API:</strong> os registros de requisições da Cloudflare guardam dados técnicos de cada chamada — o ID do post, o tipo
    de documento, o tamanho e o tempo da resposta e o user-agent do cliente — para depuração e prevenção de abusos. A Cloudflare também processa
    endereços IP para aplicar limites de requisições. Os registros são mantidos por um período limitado pela Cloudflare e não são usados para identificar você.</li>
  </ul>
</section>

<section>
  <h2>Armazenado no seu navegador</h2>
  <p>Seus links recentes, o tema e o idioma escolhidos ficam salvos apenas no armazenamento local do seu navegador. Limpe os dados do navegador para
  removê-los.</p>
</section>

<section>
  <h2>Terceiros</h2>
  <ul>
    <li>A <strong>Cloudflare</strong> hospeda o site, a API e o servidor MCP.</li>
    <li>O <strong>FxTwitter</strong> fornece os dados públicos dos posts.</li>
    <li>O <strong>Google Analytics</strong> fornece estatísticas anônimas de uso.</li>
    <li>As imagens nas prévias e nas exportações são carregadas dos servidores de mídia do X (pbs.twimg.com).</li>
  </ul>
</section>

<section>
  <h2>Contato</h2>
  <p>Dúvidas ou pedidos de remoção: <a href="${GITHUB}/issues" rel="noopener">abra uma issue no GitHub</a>.</p>
</section>`,
  faq: [],
};

/* ─── Localizador de tweets apagados ─── */

const deletedFinder: SitePage = {
  id: 'pt-deleted-finder',
  group: 'deleted-finder',
  path: '/pt/localizador-de-tweets-apagados',
  file: 'pt/localizador-de-tweets-apagados.html',
  lang: 'pt',
  title: 'Ver tweets apagados: localizador grátis | Xtracticle',
  description:
    'Cole o link de um perfil ou um @usuário e buscamos na Wayback Machine as capturas dos posts dessa conta, inclusive os apagados. Grátis e sem login.',
  h1: 'Localizador de tweets apagados',
  sub: 'Cole o link de um perfil do X (Twitter) ou um @usuário, não o link de um post, para ver as cópias arquivadas dos posts dessa conta na Wayback Machine.',
  primary: 'md',
  nav: 'Tweets apagados',
  sections: `
<section>
  <p><strong>O localizador de tweets apagados do Xtracticle procura os posts de uma conta na Wayback Machine.</strong> Digite um @usuário ou cole
  o link do perfil e você vê os posts dessa conta que o Internet Archive guardou, do mais recente ao mais antigo, cada um com o link da captura.
  Se um post foi apagado do X depois que alguém o arquivou, essa captura é o jeito de vê-lo de novo. É grátis e não precisa de conta.</p>
  <h2>Como ver tweets apagados em três passos</h2>
  ${steps([
    '<strong>Informe a conta:</strong> digite <code>@usuario</code> ou cole o link do perfil (<code>x.com/usuario</code>). Use o perfil, não o link de um post.',
    '<strong>Toque em Extrair.</strong> O Xtracticle pede à Wayback Machine todos os posts dessa conta que ela capturou. O arquivo é lento, então isso pode levar até um minuto.',
    '<strong>Abra uma captura.</strong> A lista mostra até 50 posts arquivados, do mais recente ao mais antigo, com a data. <em>Abrir captura</em> mostra a cópia arquivada e <em>Tentar o post no X</em> verifica se o post ainda está no ar.',
  ])}
  <p><strong>Quer pegar o próximo?</strong> O arquivo só tem o que alguém salvou. O <a href="/pt/rastreador-de-tweets-apagados">rastreador de tweets apagados</a>
  monitora uma conta a cada hora e guarda o texto de qualquer post que ela apagar a partir de agora.</p>
</section>

<section>
  <h2>O que ele encontra e o que não encontra</h2>
  <p>Um post apagado só pode ser visto se alguém fez uma cópia antes de ele sumir. Esta ferramenta procura um tipo de cópia, as capturas da
  Wayback Machine, e é franca sobre os limites:</p>
  <ul>
    <li><strong>Encontra posts arquivados.</strong> Qualquer post da conta que a Wayback Machine capturou, esteja ainda no ar ou tenha sido apagado depois.</li>
    <li><strong>Não encontra o que ninguém arquivou.</strong> Um post apagado antes de alguém salvá-lo se perdeu. Nenhuma ferramenta consegue trazê-lo de volta, porque o X não o entrega mais.</li>
    <li><strong>Não marca quais posts foram apagados.</strong> O X não informa isso. Use <em>Tentar o post no X</em>: se abrir, o post ainda está no ar; se voltar como não encontrado, foi apagado ou a conta ficou privada.</li>
    <li><strong>Contas privadas não podem ser lidas.</strong> Posts protegidos nunca foram públicos, então os arquivos normalmente também não os têm.</li>
    <li><strong>As capturas variam.</strong> As mais antigas costumam ter o texto; algumas de 2020 em diante mostram uma página do X vazia.</li>
    <li><strong>Em contas muito ativas a lista é cortada.</strong> Aparecem os 50 posts arquivados mais recentes, e o total fica acima da lista.</li>
  </ul>
  <p>Se a conta ainda estiver ativa, o mesmo painel tem o botão <em>Baixar os últimos 20 posts (ZIP)</em>. Ele salva os 20 posts públicos mais
  recentes da conta como arquivos Markdown enquanto ainda estão no ar, que é o único jeito confiável de guardar um post para depois.</p>
</section>

<section>
  <h2>Procurando um único post apagado?</h2>
  <p>Se você tem o link do próprio post (<code>x.com/usuario/status/…</code>), cole esse link. Quando o X não mostra mais o post, o Xtracticle
  oferece buscas por esse post exato na Wayback Machine e no archive.today com um clique, além de um atalho para os outros posts arquivados da conta.
  A busca ainda pode voltar vazia: os arquivos só guardam cópias feitas antes da exclusão. O
  <a href="/pt/guias/encontrar-tweets-no-wayback-machine">guia da Wayback Machine</a> mostra as buscas manuais passo a passo.</p>
</section>

<section>
  <h2>Busca grátis ou rastreador pago de tweets apagados?</h2>
  <p>Serviços pagos como o TrackTweets monitoram uma conta e guardam uma cópia de cada post que ela apaga a partir do dia em que você começa o
  monitoramento. Eles respondem a uma pergunta diferente da desta página e cobram por conta:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Rastreador pago</th></tr></thead>
    <tbody>
      <tr><td>O que encontra</td><td>Posts arquivados no passado, inclusive os apagados antes de você olhar</td><td>Posts apagados depois que o monitoramento começa</td></tr>
      <tr><td>Preço</td><td>Grátis · Pro a partir de US$ 36/ano para a lista completa e CSV</td><td>Cerca de US$ 9 por mês por conta (TrackTweets, no momento em que escrevemos)</td></tr>
      <tr><td>Conta</td><td>Sem login e sem conectar nada</td><td>Cadastro e assinatura</td></tr>
      <tr><td>Ideal para</td><td>Uma olhada pontual no que uma conta publicou</td><td>Monitorar contas específicas de forma contínua</td></tr>
    </tbody>
  </table></div>
  <p>Precisa de mais do que os 50 mais recentes? O <a href="/pt/pro">Xtracticle Pro</a> mostra todos os posts arquivados que o Wayback Machine
  guarda de uma conta (até 1.500) e exporta tudo em CSV. A partir de US$ 3 por mês no plano anual, ou US$ 59 uma única vez. O Pro também inclui o <a href="/pt/rastreador-de-tweets-apagados">Watch, um rastreador de tweets apagados</a>:
  ele verifica até 5 contas públicas a cada hora (2 no vitalício) e guarda o texto de qualquer post apagado, entregue como feed ou resumo por e-mail.</p>
</section>

<section>
  <h2>Saiba mais</h2>
  <ul>
    <li><a href="/pt/guias/ver-tweets-apagados">Como ver tweets apagados</a>: onde uma cópia pode existir e o que nunca funciona.</li>
    <li><a href="/pt/guias/recuperar-tweets-apagados">Dá para recuperar tweets apagados?</a>: seus próprios posts, seu arquivo de dados do X e os limites.</li>
    <li><a href="/pt/guias/encontrar-tweets-no-wayback-machine">Como encontrar tweets na Wayback Machine</a>: buscas manuais e URLs com curinga.</li>
  </ul>
  <p>Para salvar um post ou uma thread que ainda está no ar, use a ferramenta da <a href="/pt/">página inicial</a>,
  <a href="/pt/desenrolar-thread-do-twitter">desenrole uma thread do Twitter</a> para ler tudo em uma página ou guarde como arquivo com
  <a href="/pt/thread-do-twitter-para-pdf">thread em PDF</a> e <a href="/pt/tweet-para-pdf">tweet para PDF</a>.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'Como vejo os tweets apagados de alguém?', a: 'Digite o @usuário ou cole o link do perfil no Xtracticle e toque em Extrair. Você verá os posts dessa conta arquivados na Wayback Machine, com o link de cada captura. Posts apagados só aparecem se alguém os arquivou antes da exclusão.' },
    { q: 'Ele mostra um tweet apagado que nunca foi arquivado?', a: 'Não. Quando um post é apagado, o X deixa de entregá-lo. Se ninguém o arquivou antes, não sobra nenhuma cópia para ferramenta alguma mostrar.' },
    { q: 'A lista mostra quais tweets foram apagados?', a: 'Não, porque o X não informa exclusões. Toque em Tentar o post no X em um item: se abrir, o post ainda está no ar; se não for encontrado, foi apagado ou a conta é privada.' },
    { q: 'O localizador de tweets apagados é grátis?', a: 'Sim. É grátis, não exige login e nunca pede para conectar sua conta do X.' },
    { q: 'Posso procurar um post apagado específico?', a: 'Sim. Cole o link do post em vez do perfil. Se o X não mostra mais o post, o Xtracticle oferece buscas por ele na Wayback Machine e no archive.today com um clique.' },
    { q: 'Funciona com contas privadas?', a: 'Não. Posts protegidos nunca foram públicos, então não podem ser lidos e os arquivos normalmente não os têm.' },
  ],
};

/* ─── Rastreador de tweets apagados ─── */

const deletedTracker: SitePage = {
  id: 'pt-deleted-tracker',
  group: 'deleted-tracker',
  path: '/pt/rastreador-de-tweets-apagados',
  file: 'pt/rastreador-de-tweets-apagados.html',
  lang: 'pt',
  title: 'Rastreador de tweets apagados: aviso quando apagam | Xtracticle',
  description:
    'Monitore uma conta pública do X grátis por 14 dias. Quando ela apaga um post, o Xtracticle guarda o texto e avisa por RSS ou e-mail. Sem cartão e sem login no X.',
  h1: 'Rastreador de tweets apagados',
  sub: 'Monitore uma conta pública do X (Twitter) e guarde uma cópia de cada post que ela apagar. Teste grátis por 14 dias: digite o @usuário e depois o seu e-mail.',
  primary: 'md',
  nav: 'Rastreador de tweets apagados',
  sections: `
<section>
  <p><strong>Um tweet apagado só pode ser visto se alguém guardou uma cópia antes de ele sumir.</strong> O Xtracticle Watch é essa cópia.
  Adicione uma conta pública e o Xtracticle lê os posts mais recentes dela a cada hora. Quando um post que ele já tinha visto some do X, você recebe
  o texto, a data e os links de mídia do post, mais uma cópia da Wayback Machine quando existir, em um feed privado e em um e-mail diário.</p>
  <h2>Como rastrear os tweets que uma conta apaga</h2>
  ${steps([
    '<strong>Comece o teste grátis.</strong> Digite acima o <code>@usuario</code> da conta, informe seu e-mail na caixa do Watch abaixo dos posts arquivados e clique no link de confirmação que enviamos. Uma conta por 14 dias: sem cartão, sem conta no Xtracticle, sem login no X.',
    '<strong>Escolha o que quer saber.</strong> O link abre sua página de teste, com um feed RSS / JSON privado para o seu leitor; escolha posts apagados, posts novos ou os dois. Quando algo muda, um resumo diário chega ao e-mail que você confirmou.',
    '<strong>Continue monitorando com o Pro.</strong> Passados os 14 dias, o monitoramento simplesmente para. O <a href="/pt/pro">Xtracticle Pro</a> o mantém e monitora até 5 contas (2 no plano vitalício). O pagamento é feito pelo Gumroad e a chave de licença chega por e-mail.',
  ])}
  <p>A mesma busca lista o que a Wayback Machine já arquivou da conta, então você também vê
  o que foi publicado, e apagado, antes de começar a monitorar.</p>
</section>

<section>
  <h2>O que o Watch pega e o que não pega</h2>
  <ul>
    <li><strong>Posts apagados depois que você adiciona a conta.</strong> O Watch guarda um retrato dos ~40 posts mais recentes da conta e compara a cada hora. Um post que some é conferido mais uma vez no X antes de contar como apagado, então uma timeline lenta não gera falso alarme.</li>
    <li><strong>Não os apagados antes de você começar.</strong> Para esses, use o <a href="/pt/localizador-de-tweets-apagados">localizador de tweets apagados</a>, que busca na Wayback Machine.</li>
    <li><strong>Não os apagados em poucos minutos.</strong> Um post publicado e apagado entre duas verificações de hora em hora nunca é visto.</li>
    <li><strong>Só contas públicas.</strong> Se uma conta ficar privada ou for desativada, o monitoramento pausa e você recebe um único aviso.</li>
    <li><strong>Posts novos também.</strong> Configure o monitoramento como <em>novos</em> ou <em>ambos</em> e o mesmo feed avisa quando a conta publica, sem precisar segui-la.</li>
  </ul>
</section>

<section>
  <h2>Xtracticle Watch ou outro rastreador?</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle Pro</th><th>Rastreador pago comum</th></tr></thead>
    <tbody>
      <tr><td>Preço</td><td>US$ 5 por mês ou US$ 36 por ano para 5 contas · US$ 59 uma vez para 2</td><td>Cerca de US$ 9 por mês por conta (TrackTweets, no momento em que escrevemos)</td></tr>
      <tr><td>Teste grátis</td><td>14 dias, 1 conta, só confirmação por e-mail, sem cartão</td><td>Varia</td></tr>
      <tr><td>Cadastro</td><td>Nenhum. Uma chave de licença, sem login no X e sem nada conectado</td><td>Conta e assinatura</td></tr>
      <tr><td>Avisos</td><td>Feed RSS / JSON privado, resumo diário por e-mail</td><td>Varia</td></tr>
      <tr><td>Exclusões passadas</td><td>Arquivo completo da Wayback da conta (até 1.500 posts) com CSV</td><td>Em geral só a partir do dia em que você começa</td></tr>
      <tr><td>Também incluso</td><td>Salvamento em lote de 200 links, chave MCP / API, PDFs sem a linha de crédito</td><td>—</td></tr>
    </tbody>
  </table></div>
  <p><a href="/pt/pro">Veja o Xtracticle Pro e os preços</a>. Salvar posts, threads e Artigos no resto do site continua grátis.</p>
</section>

<section>
  <h2>Quem usa um rastreador de tweets apagados</h2>
  <ul>
    <li><strong>Jornalistas e pesquisadores</strong> que precisam de um registro do que uma figura pública, uma empresa ou uma conta oficial disse, mesmo que depois seja removido.</li>
    <li><strong>Gestores de marca e de comunidade</strong> que acompanham os anúncios de concorrentes e parceiros.</li>
    <li><strong>Quem acompanha uma polêmica pública</strong> em que os posts costumam sumir depois.</li>
  </ul>
  <p>O Watch só lê o que a conta publica abertamente, os mesmos posts que qualquer pessoa vê em x.com. Ele nunca faz login no X e não enxerga
  contas privadas. Veja a <a href="/pt/privacidade">página de privacidade</a> para saber o que é armazenado e como pedir que uma conta seja excluída.</p>
</section>

<section>
  <h2>Saiba mais</h2>
  <ul>
    <li><a href="/pt/localizador-de-tweets-apagados">Localizador de tweets apagados</a>: busque na Wayback Machine os posts arquivados de uma conta, grátis.</li>
    <li><a href="/pt/guias/ver-tweets-apagados">Como ver tweets apagados</a>: onde uma cópia pode existir e o que nunca funciona.</li>
    <li><a href="/pt/guias/encontrar-tweets-no-wayback-machine">Como encontrar tweets na Wayback Machine</a>: buscas manuais e URLs com curinga.</li>
  </ul>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'Posso ser avisado quando alguém apagar um tweet?', a: 'Sim. Adicione a conta pública ao Xtracticle Watch (parte do Xtracticle Pro). Ele verifica a conta a cada hora e, quando um post que já tinha visto é apagado, o inclui no seu feed RSS privado e no resumo diário por e-mail, com o texto do post.' },
    { q: 'Existe teste grátis?', a: 'Sim. Monitore uma conta pública grátis por 14 dias: digite-a acima, informe seu e-mail e clique no link de confirmação que enviamos. Não é preciso cartão nem chave de licença, há um teste por endereço de e-mail e nada é cobrado: quando o teste termina, o monitoramento simplesmente para. Para continuar monitorando, ou para monitorar até 5 contas, assine o Xtracticle Pro.' },
    { q: 'Com que rapidez o rastreador percebe uma exclusão?', a: 'As contas são verificadas cerca de uma vez por hora. O feed é atualizado na verificação seguinte à exclusão; o resumo por e-mail sai uma vez por dia.' },
    { q: 'Ele mostra tweets apagados antes de eu começar a rastrear?', a: 'O Watch não, porque nunca os viu. Use o localizador de tweets apagados gratuito, que lista os posts arquivados pela Wayback Machine, inclusive os apagados depois.' },
    { q: 'Preciso entrar com minha conta do X?', a: 'Não. O Xtracticle nunca pede seu login do X. O Pro é liberado com uma chave de licença que o Gumroad envia por e-mail depois do pagamento.' },
    { q: 'Quantas contas posso rastrear?', a: 'Cinco contas públicas no plano mensal ou anual e duas no plano vitalício de pagamento único. Você pode trocar as contas a qualquer momento na página do Pro.' },
    { q: 'Funciona com contas privadas?', a: 'Não. Posts protegidos não são públicos, então não podem ser lidos. Se uma conta monitorada ficar privada, o monitoramento pausa e você recebe um único aviso.' },
  ],
};

export const TOOLS: SitePage[] = [unroll, tweetpdf, deletedFinder, deletedTracker, mcp, privacyPt];
