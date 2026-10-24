/**
 * Guias em português do Brasil. Os fatos sobre o X seguem o texto em inglês e são escritos
 * "no momento da redação (outubro de 2026)", porque o X muda essas regras com frequência.
 */
import { archiveCheck, privacy, type FAQ, type ExportKey, type SitePage } from '../../blocks';

const HUB = '/pt/guias';
const WHEN = 'no momento da redação (outubro de 2026)';

const back = `<p><a href="${HUB}">← Todos os guias</a></p>`;

const takeaways = (items: string[]) =>
  `<section>
  <h2>Pontos principais</h2>
  <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
</section>`;

interface GuideInput {
  /** Slug em inglês: define o group, igual ao da página em inglês. */
  slug: string;
  /** Slug localizado do caminho. */
  pslug: string;
  title: string;
  description: string;
  h1: string;
  sub: string;
  primary: ExportKey;
  sections: string;
  faq: FAQ[];
}

const guide = (g: GuideInput): SitePage => ({
  id: `pt-guide-${g.slug}`,
  group: `guide-${g.slug}`,
  path: `${HUB}/${g.pslug}`,
  file: `pt/guias/${g.pslug}.html`,
  lang: 'pt',
  title: g.title,
  description: g.description,
  h1: g.h1,
  sub: g.sub,
  primary: g.primary,
  nav: '',
  sections: `${g.sections}\n${back}`,
  faq: g.faq,
});

/* ─── 1. O que são os Artigos do X ─── */

const whatAre = guide({
  slug: 'what-are-x-articles',
  pslug: 'o-que-sao-artigos-do-x',
  title: 'O que são os Artigos do X? Quem pode publicar | Xtracticle',
  description:
    'Artigos do X são posts longos no X (Twitter) com títulos, imagens e listas. Quem pode publicar, como se diferenciam das threads e como salvar uma cópia.',
  h1: 'O que são os Artigos do X?',
  sub: 'Os Artigos do X são posts longos e formatados, publicados direto no X — veja quem pode escrevê-los, como se diferenciam das threads e como guardar uma cópia.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Um Artigo do X é um post longo e formatado (títulos, imagens, listas) publicado nativamente no X, em vez de uma sequência de posts curtos.',
  `Publicar é um recurso pago: ${WHEN}, o X diz que ele é limitado a assinantes Premium, Premium+, Premium Business e Premium Organizations. Ler não exige assinatura.`,
  'Artigos são diferentes de threads (vários posts curtos encadeados) e de posts longos avulsos.',
  'Para guardar um, cole o link no <a href="/pt/">Xtracticle</a> e baixe em PDF, Markdown, EPUB ou ZIP.',
])}

<section>
  <h2>O que é um Artigo do X</h2>
  <p>Um Artigo do X é um texto longo que vive no X como um único documento. Em vez de dividir uma ideia em uma thread numerada, o autor escreve um só artigo, com título, imagem de capa opcional e texto estruturado. A central de ajuda do X descreve os Artigos como “uma nova forma de compartilhar conteúdo escrito longo no X”.</p>
  <p>Segundo guias de terceiros, os Artigos podem chegar a cerca de 100.000 caracteres, muito além dos 280 de um post clássico. Até onde sabemos, o X não publicou um número único em sua página de ajuda, então trate esse valor como aproximado.</p>

  <h2>Quem pode publicar Artigos do X</h2>
  <p>O X lançou os Artigos em março de 2024 como recurso do Premium+. Em janeiro de 2026, ampliou o acesso a todos os assinantes Premium, segundo a <a href="https://www.storyboard18.com/digital/x-expands-long-form-articles-access-to-all-premium-subscribers-87544.htm" rel="noopener nofollow">Storyboard18</a>. A própria <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">página de ajuda sobre Artigos</a> do X diz que publicar é limitado a assinantes Premium e Premium+, Premium Businesses e Premium Organizations.</p>
  <p>Qualquer pessoa pode ler um Artigo publicado, conforme os controles de público que o autor escolheu. Não é preciso pagar para ler.</p>
</section>

<section>
  <h2>Artigos do X, posts, threads e notas</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Post</th><th>Thread</th><th>Artigo do X</th></tr></thead>
    <tbody>
      <tr><td>Estrutura</td><td>Um post curto</td><td>Vários posts encadeados de um autor</td><td>Um documento com título</td></tr>
      <tr><td>Formatação</td><td>Texto simples, mídia</td><td>Texto simples, mídia em cada post</td><td>Títulos, negrito, itálico, listas, mídia incorporada</td></tr>
      <tr><td>Fluxo de leitura</td><td>Linha do tempo</td><td>Rolar por respostas do autor a si mesmo</td><td>Visualização de leitura própria</td></tr>
      <tr><td>Quem pode criar</td><td>Qualquer pessoa</td><td>Qualquer pessoa</td><td>Assinantes pagos</td></tr>
    </tbody>
  </table></div>
  <p>Uma thread continua sendo um conjunto de posts, então cada parte pode ser curtida, respondida e citada separadamente. Um Artigo é lido como uma peça única. Os posts mais longos, disponíveis para alguns assinantes, continuam sendo posts comuns e não têm títulos.</p>
</section>

<section>
  <h2>Recursos de formatação</h2>
  <p>Segundo a página de ajuda do X, os Artigos podem conter imagens, vídeo, GIFs, posts incorporados e links, e o texto pode ter títulos, subtítulos, negrito, itálico, tachado, recuo e listas numeradas ou com marcadores. É isso que os deixa mais parecidos com um post de blog do que com uma thread.</p>

  <h2>Como encontrar Artigos do X</h2>
  <ul>
    <li>Abra a aba <strong>Artigos</strong> na navegação lateral do X no computador, se ela estiver disponível na sua conta.</li>
    <li>Olhe o perfil de um autor: os Artigos aparecem junto com os posts.</li>
    <li>Pesquise termos que aparecem no título e filtre por pessoas que você segue.</li>
    <li>Para uma lista semanal selecionada à mão, veja <a href="/best-x-articles">Best X Articles</a> (em inglês).</li>
  </ul>
  <p>Ao compartilhar um Artigo, o X pode dar um link de leitor no formato <code>x.com/i/article/…</code>. O link do post, <code>x.com/usuario/status/…</code>, é o que a maioria das ferramentas espera.</p>
</section>

<section>
  <h2>Como salvar um Artigo do X</h2>
  <p>O X não tem um botão nativo de “exportar em PDF” para o Artigo de outra pessoa. As opções práticas são:</p>
  <ol>
    <li><strong>Imprimir pelo navegador.</strong> Funciona, mas traz a interface do X e muitas vezes corta as imagens entre páginas.</li>
    <li><strong>Copiar e colar.</strong> Perde quase toda a formatação e as imagens.</li>
    <li><strong>Xtracticle.</strong> Cole o link do post e baixe um arquivo limpo com título, autor, data, link da fonte e imagens: <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>, <a href="/pt/artigo-do-x-para-markdown">Markdown</a> ou <a href="/pt/artigo-do-x-para-epub-kindle">EPUB para Kindle</a>.</li>
  </ol>
  <p>Guardar uma cópia importa porque os autores podem apagar posts, e eles somem se a conta for suspensa. Veja <a href="/pt/guias/recuperar-tweets-apagados">o que dá e o que não dá para recuperar</a>.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'O que é um Artigo do X?', a: 'Um Artigo do X é um post longo publicado nativamente no X, com título, subtítulos, listas, imagens e outras mídias, em vez de uma sequência de posts curtos.' },
    { q: 'Quem pode publicar Artigos do X?', a: 'No momento da redação (outubro de 2026), o X diz que publicar é limitado a assinantes Premium, Premium+, Premium Business e Premium Organizations. O recurso abriu para todos os níveis Premium em janeiro de 2026, depois de ser lançado como recurso do Premium+ em março de 2024.' },
    { q: 'Preciso pagar para ler um Artigo do X?', a: 'Não. Os Artigos publicados podem ser lidos por qualquer pessoa, conforme as configurações de público que o autor escolheu.' },
    { q: 'Qual a diferença entre um Artigo do X e uma thread?', a: 'Uma thread é uma série de posts separados, cada um com suas próprias curtidas e respostas. Um Artigo é um único documento formatado, com título e subtítulos.' },
    { q: 'Como salvar um Artigo do X em PDF?', a: 'Copie o link do post, cole no Xtracticle e clique em PDF. Você recebe um arquivo A4 limpo, com imagens e um link para o original.' },
  ],
});

/* ─── 2. Ler sem conta ─── */

const readWithout = guide({
  slug: 'read-x-articles-without-account',
  pslug: 'ler-artigos-do-x-sem-conta',
  title: 'Ler Artigos e threads do X sem conta e sem login | Xtracticle',
  description:
    'Como ler Artigos, threads e posts do X (Twitter) sem fazer login: o que funciona, o que o X bloqueia e o truque de trocar x.com por xtracticle.com.',
  h1: 'Como ler Artigos do X sem conta',
  sub: 'Resumindo: troque x.com por xtracticle.com no endereço e o artigo público abre completo, sem login.',
  primary: 'pdf',
  sections: `
${takeaways([
  'O X costuma mostrar a quem não está logado um pedido de login, uma visualização cortada ou uma thread incompleta, e esse comportamento muda com o tempo.',
  'Troque <code>x.com</code> por <code>xtracticle.com</code> na barra de endereço para ler o artigo, a thread ou o post público completo, sem login.',
  'Isso só funciona com conteúdo público. Contas protegidas, posts apagados e posts com restrição de idade não podem ser exibidos.',
  'Depois você pode baixar o que está lendo em PDF, Markdown ou EPUB.',
])}

<section>
  <h2>O que acontece quando você abre o X sem estar logado</h2>
  <p>Se quem não está logado vê um post completo depende do tipo de conteúdo, do país e da política atual do X, que já mudou mais de uma vez. Na prática, você pode ver um único post mas não as respostas, um pedido para entrar ou uma thread parcial. Como as regras mudam, não prometemos nenhum comportamento específico do próprio x.com.</p>
  <p>Mas o conteúdo público é público. Se o autor não protegeu a conta, qualquer pessoa pode ler o post. A questão é só o quanto o site oficial facilita isso sem você entrar.</p>
</section>

<section>
  <h2>Método 1: trocar o domínio</h2>
  <p>Em qualquer post ou Artigo do X, troque <code>x.com</code> por <code>xtracticle.com</code> na barra de endereço e aperte Enter.</p>
  ${'<p><code>x.com/usuario/status/123</code> → <code>xtracticle.com/usuario/status/123</code></p>'}
  <p>A página carrega o conteúdo público pela API de código aberto do FxTwitter e o mostra como texto legível, com imagens. Sem conta, sem banner de cookies por cima do artigo, sem instalar app. As threads são desenroladas em uma única página quando você abre qualquer post delas.</p>
  <p>No celular, também há uma opção de um toque: adicione o Atalho do iPhone ou o bookmarklet do navegador pela <a href="/pt/">página inicial</a>.</p>

  <h2>Método 2: colar o link</h2>
  ${'<ol class="xt-steps"><li>No app do X ou no site, toque em <em>Compartilhar → Copiar link</em>.</li><li>Abra o <a href="/pt/">xtracticle.com</a> e cole o link.</li><li>Leia por lá, ou baixe em <a href="/pt/artigo-do-x-para-pdf">PDF</a> para ler offline.</li></ol>'}
  <p>Se o link for parecido com <code>x.com/i/article/…</code>, abra o Artigo no X e copie o link do post (o que tem <code>/status/</code>).</p>
</section>

<section>
  <h2>O que funciona e o que não funciona</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Conteúdo</th><th>Sem login pelo Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Artigo do X público</td><td>Sim, texto completo, formatação e imagens</td></tr>
      <tr><td>Thread pública</td><td>Sim, os posts do próprio autor reunidos na ordem</td></tr>
      <tr><td>Post público avulso, com fotos e post citado</td><td>Sim</td></tr>
      <tr><td>Respostas de outras pessoas</td><td>Não, ficam de fora</td></tr>
      <tr><td>Contas protegidas (privadas)</td><td>Não</td></tr>
      <tr><td>Conteúdo apagado ou de conta suspensa</td><td>Não</td></tr>
      <tr><td>Posts com restrição de idade ou só para logados</td><td>Geralmente não</td></tr>
    </tbody>
  </table></div>
  <p>Se algo aparece como “não encontrado”, quase sempre é uma das três últimas linhas.</p>
</section>

<section>
  <h2>Outras formas de ler sem conta</h2>
  <ul>
    <li><strong>Um resultado de buscador.</strong> Alguns posts mostram uma prévia, mas geralmente é só um trecho.</li>
    <li><strong>PDF ou print de outra pessoa.</strong> Serve para ler, mas você não consegue verificar se corresponde ao original.</li>
    <li><strong>Um feed RSS ou resumo por e-mail</strong> do autor, se ele oferecer.</li>
  </ul>
  <p>Se você lê conteúdo do X com frequência, salvar os melhores é mais fácil do que procurá-los de novo. A página <a href="/pt/thread-do-twitter-para-pdf">thread do Twitter para PDF</a> cobre as threads longas.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'Dá para ler Artigos do X sem conta?', a: 'Os Artigos públicos podem ser lidos sem conta trocando x.com por xtracticle.com no endereço, ou colando o link no Xtracticle. Posts protegidos ou apagados não podem ser exibidos.' },
    { q: 'Como funciona o truque de x.com para xtracticle.com?', a: 'O Xtracticle usa o mesmo caminho do X. Trocando só o domínio, por exemplo x.com/usuario/status/123 por xtracticle.com/usuario/status/123, o post abre aqui.' },
    { q: 'Ele mostra as respostas?', a: 'Não. Nas threads, mostra os posts escritos pelo autor original. Respostas de outros usuários ficam de fora.' },
    { q: 'Por que um post aparece como não encontrado?', a: 'O post pode ter sido apagado, ser de uma conta protegida ou suspensa, ou ter restrição de idade. Só posts públicos podem ser exibidos.' },
    { q: 'É legal ler posts desse jeito?', a: 'Ele lê conteúdo que o autor publicou publicamente. Respeite os direitos autorais: salvar uma cópia para leitura própria é diferente de republicar o conteúdo.' },
  ],
});

/* ─── 3. Recuperar tweets apagados ─── */

const deleted = guide({
  slug: 'recover-deleted-tweets',
  pslug: 'recuperar-tweets-apagados',
  title: 'Como recuperar tweets apagados: 4 lugares para procurar (2026) | Xtracticle',
  description:
    'Recupere posts apagados do X (Twitter): seu arquivo de dados antigo, Wayback Machine, archive.today e prints. Cole o link e busque nos arquivos com um clique.',
  h1: 'Dá para recuperar tweets apagados?',
  sub: 'Às vezes, mas raramente pelo próprio X. Veja as opções que existem, o quanto cada uma é confiável e como evitar precisar delas.',
  primary: 'zip',
  sections: `
${takeaways([
  'Depois que um post é apagado, o X deixa de exibi-lo, e ferramentas como o Xtracticle também não conseguem buscá-lo.',
  'Seus próprios posts apagados só podem ser recuperados se você tiver um arquivo de dados do X antigo, criado antes da exclusão.',
  'Os posts apagados de outras pessoas só sobrevivem se alguém os salvou: Wayback Machine, archive.today ou um print. A cobertura é irregular.',
  'A solução confiável é salvar posts e artigos importantes enquanto estão no ar, em PDF ou ZIP com imagens.',
])}

${archiveCheck('pt')}

<section>
  <h2>A resposta honesta</h2>
  <p>Não existe botão de “desfazer exclusão”. Quando o autor apaga um post, o X deixa de mostrá-lo, e qualquer ferramenta que leia posts públicos, incluindo o <a href="/pt/">Xtracticle</a>, vai informar que ele não foi encontrado. O que sobra é alguma cópia que alguém fez antes. Tudo abaixo são maneiras de procurar essa cópia, e nenhuma é garantida.</p>
</section>

<section>
  <h2>Opção 1: seu próprio arquivo de dados do X</h2>
  <p>Se o post apagado era seu, confira qualquer arquivo da sua conta que você tenha baixado antes de apagar. O X permite solicitar um em <em>Configurações e privacidade → Sua conta → Baixar um arquivo dos seus dados</em>, depois de verificar sua identidade. Segundo a <a href="https://help.x.com/articles/20170320" rel="noopener nofollow">página de ajuda</a> do X, você recebe um e-mail ou notificação quando estiver pronto e baixa um arquivo .zip estando logado. Um arquivo novo, criado depois da exclusão, não terá o post; então isso só ajuda se você já tinha um mais antigo.</p>

  <h2>Opção 2: a Wayback Machine</h2>
  <p>A <a href="https://web.archive.org/" rel="noopener nofollow">Wayback Machine</a>, do Internet Archive, às vezes guarda uma captura de um post ou perfil. Cole a URL exata do post (<code>x.com/usuario/status/…</code>, e tente também a forma antiga com <code>twitter.com</code>) na caixa de busca e abra o calendário de capturas. Relatos de terceiros dizem que o X dificultou a captura confiável de perfis por arquivadores e que a cobertura é maior para contas conhecidas ou páginas que alguém salvou manualmente. Para um post obscuro apagado rapidamente, espere nenhum resultado.</p>
  <p>Você também pode arquivar uma página no ar com o Save Page Now, em <code>web.archive.org/save/</code>. Isso só ajuda se for feito antes da exclusão.</p>

  <h2>Opção 3: archive.today e similares</h2>
  <p>Serviços como o archive.today deixam qualquer pessoa capturar uma página. Procure a URL do post por lá. Assim como na Wayback Machine, ele só existe se alguém o salvou antes.</p>
</section>

<section>
  <h2>Opção 4: cache de buscadores e prints</h2>
  <ul>
    <li><strong>Cache de buscadores.</strong> O Google aposentou seus links públicos de “em cache”, então isso é, em grande parte, um beco sem saída em 2026. Os resultados de busca podem mostrar um trecho antigo por um tempo depois da exclusão, mas não dá para contar com isso.</li>
    <li><strong>Prints de outras pessoas.</strong> Posts citados, respostas e matérias de notícias muitas vezes incluem prints. São evidência de que o post existiu, não prova do que ele dizia exatamente, porque prints são fáceis de falsificar.</li>
    <li><strong>Citações do post apagado.</strong> Uma citação de um post apagado normalmente o mostra como indisponível, então não espere que ela preserve o texto.</li>
  </ul>
  <p>Desconfie de sites que prometem “recuperar qualquer tweet apagado”. Eles não conseguem obter dados que o X removeu; no máximo, pesquisam os mesmos arquivos listados acima.</p>
</section>

<section>
  <h2>A solução de verdade: salve enquanto está no ar</h2>
  <p>Se um post ou artigo importa para você, seja uma fonte do seu trabalho, um comprovante, um comunicado ou algo que talvez precise citar, salve agora:</p>
  <ul>
    <li>O <a href="/pt/artigo-do-x-para-pdf">PDF</a> guarda layout, imagens, autor, data e um link para o original, e é fácil de compartilhar.</li>
    <li>O <strong>ZIP com imagens</strong> guarda o Markdown e cada imagem como arquivo separado, um arquivo offline durável.</li>
    <li>O <strong>Modo em lote</strong> aceita até 20 links de uma vez em um único ZIP.</li>
  </ul>
  <p>Uma cópia salva mostra o que o post dizia quando você o salvou. Ela não prova autenticidade para terceiros, mas registra data, autor e link da fonte. Para os seus próprios backups, veja <a href="/pt/guias/backup-artigos-do-x">como fazer backup dos seus Artigos e threads do X</a>.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'Dá para recuperar um tweet apagado?', a: 'Só se existir uma cópia em outro lugar: um arquivo de dados antigo da sua conta no X, uma captura da Wayback Machine ou do archive.today, ou um print. O próprio X não restaura posts apagados.' },
    { q: 'O Xtracticle consegue baixar um post apagado?', a: 'Não. O Xtracticle lê posts públicos que ainda estão no ar. Um post apagado aparece como não encontrado, e por isso salvar os posts importantes cedo faz diferença.' },
    { q: 'A Wayback Machine tem tweets apagados?', a: 'Às vezes. Só funciona se o post ou o perfil foi capturado antes da exclusão, e a cobertura é irregular, principalmente para contas conhecidas ou páginas que alguém salvou manualmente.' },
    { q: 'O X mantém posts apagados no meu arquivo de dados?', a: 'Um arquivo criado depois de você apagar um post não o inclui. Um arquivo baixado antes continua tendo o que havia nele naquele momento.' },
    { q: 'Como deixo um post seguro antes que ele suma?', a: 'Cole o link no Xtracticle e baixe um PDF, ou um ZIP com imagens se quiser também a mídia como arquivos.' },
  ],
});

/* ─── 4. Artigos do X vs Substack vs Medium ─── */

const versus = guide({
  slug: 'x-articles-vs-substack',
  pslug: 'artigos-do-x-vs-substack',
  title: 'Artigos do X vs Substack vs Medium: comparação | Xtracticle',
  description:
    'Artigos do X, Substack e Medium comparados para quem escreve: público, monetização, propriedade, exportação e SEO. E como fazer backup dos Artigos do X.',
  h1: 'Artigos do X vs Substack vs Medium',
  sub: 'Três lugares para publicar textos longos, comparados em público, dinheiro, propriedade, exportação e visibilidade em buscas.',
  primary: 'md',
  sections: `
${takeaways([
  'Os Artigos do X dão alcance imediato dentro do X, mas uma propriedade mais fraca: sem lista de assinantes e sem exportação nativa dos artigos.',
  'O Substack é construído em torno de uma lista de e-mails que você pode exportar, e fica com uma parte das assinaturas pagas.',
  'O Medium paga os membros pelo tempo de leitura e tem descoberta embutida, mas o público pertence à plataforma.',
  'Muita gente usa o X para descoberta e uma newsletter ou blog como base. Faça backup dos Artigos do X em Markdown de qualquer forma.',
])}

<section>
  <h2>Visão geral</h2>
  <p>Regras e taxas das plataformas mudam. A tabela resume como cada uma funciona ${WHEN}; confira os termos atuais de cada plataforma antes de decidir.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Artigos do X</th><th>Substack</th><th>Medium</th></tr></thead>
    <tbody>
      <tr><td>Público principal</td><td>Seus seguidores e a linha do tempo do X</td><td>Assinantes por e-mail</td><td>Leitores e membros do Medium</td></tr>
      <tr><td>Quem pode publicar</td><td>Assinantes de planos Premium</td><td>Qualquer pessoa</td><td>Qualquer pessoa</td></tr>
      <tr><td>Monetização</td><td>Pagamentos do X a criadores com base no engajamento de usuários Premium</td><td>Assinaturas pagas; o Substack fica com 10% mais as taxas de processamento de pagamento</td><td>Partner Program, pago pelo tempo de leitura dos membros</td></tr>
      <tr><td>Propriedade do público</td><td>Seguidores, não uma lista que você possa exportar</td><td>A lista de assinantes é exportável</td><td>Seguidores e e-mail dentro da plataforma</td></tr>
      <tr><td>Exportação de posts</td><td>Sem exportação nativa de artigos</td><td>Exporta posts e assinantes</td><td>Exportação dos dados da conta</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Público e descoberta</h2>
  <p>Os <strong>Artigos do X</strong> ficam onde um público já existe. Se você tem seguidores, um Artigo pode alcançá-los sem nenhum cadastro novo, e bons posts podem se espalhar por reposts. O outro lado é que a linha do tempo decide o que é visto, e seguidores não são uma lista que você controla.</p>
  <p>O <strong>Substack</strong> entrega os textos na caixa de entrada dos assinantes, então o alcance é mais previsível, mas começa do zero. Ele também tem recomendações e app próprios.</p>
  <p>O <strong>Medium</strong> tem leitores e feeds por tema embutidos, o que ajuda quem está começando a ser encontrado. Boa parte do público, porém, está em um modelo de assinatura com limite de leituras, e o alcance depende da distribuição do Medium.</p>

  <h2>Monetização</h2>
  <p>O X mudou os pagamentos a criadores em novembro de 2024, passando a basear-se no engajamento de assinantes Premium em vez da receita de anúncios (<a href="https://www.mediapost.com/publications/article/400171/x-ends-ad-revenue-share-for-creators-focuses-on-p.html" rel="noopener nofollow">MediaPost</a>). O Substack deixa você definir preços para assinaturas pagas e fica com 10% mais as taxas do Stripe (<a href="https://faq.substack.com/p/how-do-paid-subscriptions-on-substack" rel="noopener nofollow">FAQ do Substack</a>). O Medium distribui as mensalidades dos membros pelo tempo de leitura (<a href="https://help.medium.com/hc/en-us/articles/360036691193" rel="noopener nofollow">Central de ajuda do Medium</a>). Os ganhos nas três variam muito, e não citamos valores de renda.</p>
</section>

<section>
  <h2>Propriedade e portabilidade</h2>
  <p>Esta é a maior diferença. Uma publicação no Substack vem com lista de assinantes e posts exportáveis, então você pode migrar para outra plataforma. O X oferece um arquivo de dados da conta com os seus posts, mas, até onde sabemos, os Artigos não estão claramente incluídos, e não há exportação de Artigos com um clique. O Medium permite baixar os dados da conta, embora seus leitores continuem no Medium.</p>
  <p>Se você publica Artigos no X, guarde uma cópia sua. A <a href="/pt/artigo-do-x-para-markdown">exportação em Markdown do Xtracticle</a> transforma um Artigo em um arquivo .md limpo (com front-matter opcional) que você pode reaproveitar em um blog, no Substack ou no Obsidian. O <a href="/pt/guias/backup-artigos-do-x">guia de backup</a> mostra um fluxo de trabalho.</p>

  <h2>SEO e indexação</h2>
  <p>As páginas do Substack e do Medium são páginas web públicas comuns, indexadas pelos buscadores. O conteúdo do X também é indexado, mas o X é um app pesado, voltado ao login, e o quanto de um Artigo pode ser rastreado ou exibido a quem não está logado muda. Trate o X como canal de distribuição e o seu próprio domínio ou newsletter como o lugar que gera tráfego de busca duradouro.</p>
</section>

<section>
  <h2>Qual escolher?</h2>
  <ul>
    <li><strong>Você já tem seguidores no X</strong> e quer testar textos longos: publique no X e copie os melhores para uma newsletter.</li>
    <li><strong>Você quer um relacionamento com assinantes e um plano pago:</strong> Substack.</li>
    <li><strong>Você quer ser descoberto por leitores que não te conhecem:</strong> Medium, com as ressalvas acima.</li>
  </ul>
  <p>Não são excludentes. Uma configuração comum é escrever uma vez, publicar na própria newsletter e compartilhar no X.</p>
</section>`,
  faq: [
    { q: 'Os Artigos do X são melhores que o Substack?', a: 'Servem a objetivos diferentes. Os Artigos do X chegam direto aos seus seguidores no X; o Substack dá uma lista de e-mails exportável e assinaturas pagas. Muita gente usa os dois.' },
    { q: 'Posso exportar meus Artigos do X?', a: 'O X não tem exportação de Artigos com um clique. Você pode salvar cada um em Markdown, PDF ou ZIP com o Xtracticle, colando o link.' },
    { q: 'Como o Substack ganha dinheiro com quem escreve?', a: 'No momento da redação (outubro de 2026), o Substack fica com 10% da receita das assinaturas pagas, mais as taxas de processamento de pagamento do Stripe. Confira o FAQ deles para os termos atuais.' },
    { q: 'Como o Medium paga quem escreve?', a: 'Pelo Partner Program, que distribui as mensalidades dos membros com base no tempo que eles passam lendo ou ouvindo os textos de cada autor.' },
    { q: 'Qual é melhor para SEO?', a: 'O conteúdo no seu próprio domínio ou no arquivo da sua newsletter costuma dar a visibilidade de busca mais duradoura. As páginas do Substack e do Medium são páginas web públicas; o X é principalmente um canal social de distribuição.' },
  ],
});

/* ─── 5. Backup ─── */

const backup = guide({
  slug: 'backup-x-articles',
  pslug: 'backup-artigos-do-x',
  title: 'Como fazer backup dos seus Artigos e threads do X | Xtracticle',
  description:
    'Faça backup dos seus Artigos e threads do X: o que o arquivo de dados do X cobre, exportações em Markdown e ZIP com imagens, fluxo no Obsidian e modo em lote.',
  h1: 'Como fazer backup dos seus Artigos e threads do X',
  sub: 'Um plano em duas camadas para quem escreve: o arquivo da conta do X como rede de segurança, mais arquivos Markdown ou ZIP de cada artigo, que você realmente consegue abrir e reaproveitar.',
  primary: 'md',
  sections: `
${takeaways([
  'Vale solicitar o arquivo de dados da conta do X, mas, pelo que conseguimos verificar, ele é organizado em torno de posts, mídia e dados da conta, e pode não incluir seus Artigos como documentos legíveis.',
  'Para cada Artigo ou thread, exporte Markdown ou um ZIP com imagens usando o <a href="/pt/artigo-do-x-para-markdown">Xtracticle</a>.',
  'O Modo em lote aceita até 20 links e devolve um único ZIP.',
  'Guarde os arquivos no Obsidian, no Notion ou em uma pasta sincronizada, com um segundo backup.',
])}

<section>
  <h2>Camada 1: o arquivo de dados da conta do X</h2>
  <p>Solicite no app do X ou no site: <em>Configurações e privacidade → Sua conta → Baixar um arquivo dos seus dados</em>. Você confirma sua identidade com um código enviado ao seu e-mail ou telefone, toca em <em>Solicitar dados</em> e o X avisa quando estiver pronto. Depois, baixe o .zip nas configurações, estando logado (<a href="https://help.x.com/articles/20170320" rel="noopener nofollow">Ajuda do X</a>). Guias de terceiros observam que o link de download pode expirar depois de pouco tempo, então baixe logo.</p>
  <h3>O que ele cobre</h3>
  <p>O arquivo é organizado em arquivos de dados e pastas de mídia: seus posts, detalhes da conta e mais. Serve como registro de que você escreveu algo e quando.</p>
  <h3>A ressalva sobre os Artigos</h3>
  <p>Não encontramos nenhuma documentação do X afirmando que os Artigos são incluídos como documentos formatados, e as descrições do conteúdo do arquivo falam de posts, não de Artigos. Abra o seu próprio arquivo e confira antes de depender dele; não verificamos isso em todas as contas. Mesmo que o texto esteja lá, ele fica guardado como arquivos de dados, não como um artigo legível com layout e imagens.</p>
</section>

<section>
  <h2>Camada 2: exporte cada artigo você mesmo</h2>
  <h3>Um artigo ou uma thread</h3>
  ${'<ol class="xt-steps"><li>Abra o seu Artigo no X e toque em <em>Compartilhar → Copiar link</em>. (Se o link tiver <code>/i/article/</code>, use o link do post com <code>/status/</code>.)</li><li>Cole no <a href="/pt/">Xtracticle</a>.</li><li>Escolha <strong>Markdown</strong> para um arquivo de texto, ou <strong>ZIP + imagens</strong> para guardar também cada imagem como arquivo.</li></ol>'}
  <p>Para uma thread, cole qualquer post dela e a thread inteira do autor é reunida na ordem.</p>
  <h3>Vários de uma vez: Modo em lote</h3>
  <p>Ative o <em>Modo em lote</em>, cole até 20 links e baixe um único ZIP. Repita em grupos de 20 se o seu acervo for maior.</p>
  <h3>Qual formato</h3>
  <ul>
    <li><strong>Markdown (.md):</strong> o melhor para reaproveitar, editar e migrar para outra plataforma. Veja a <a href="/pt/artigo-do-x-para-markdown">exportação em Markdown</a>.</li>
    <li><strong>ZIP + imagens:</strong> Markdown mais a mídia, uma cópia offline completa.</li>
    <li><strong>PDF:</strong> o melhor para compartilhar e para um registro de layout fixo. Veja <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>.</li>
  </ul>
</section>

<section>
  <h2>Mantenha tudo organizado</h2>
  <h3>Obsidian</h3>
  <p>O Xtracticle pode abrir um artigo como uma nova nota no seu cofre, com front-matter contendo título, autor, fonte, datas e tags. Detalhes em <a href="/pt/salvar-artigos-do-x-no-obsidian">Salvar artigos do X no Obsidian</a>.</p>
  <h3>Notion</h3>
  <p>O Notion importa arquivos Markdown: use <em>Import → Text &amp; Markdown</em> e escolha os arquivos .md.</p>
  <h3>Um sistema simples de pastas</h3>
  <ul>
    <li>Uma pasta por ano, com arquivos nomeados como <code>AAAA-MM-DD-titulo.md</code>.</li>
    <li>Deixe as imagens ao lado do arquivo (a exportação em ZIP já faz isso).</li>
    <li>Mantenha o link original do X no front-matter para sempre poder rastrear a fonte.</li>
  </ul>
  <p>Siga a regra 3-2-1: pelo menos duas cópias em dispositivos ou serviços diferentes, uma delas fora do local, como armazenamento em nuvem ou um repositório Git privado.</p>
</section>

<section>
  <h2>Transforme em rotina</h2>
  <p>Faça backup de cada Artigo quando publicá-lo, porque nessa hora você tem o link. Solicite um novo arquivo da conta do X a cada alguns meses como segunda camada. Se também quiser ter em mente o risco de posts apagados, leia <a href="/pt/guias/recuperar-tweets-apagados">o que dá e o que não dá para recuperar</a>.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'O arquivo de dados do X inclui os meus Artigos?', a: 'Não encontramos documentação do X dizendo que os Artigos são incluídos como documentos formatados. Confira o seu próprio arquivo e mantenha exportações por artigo como segunda cópia.' },
    { q: 'Como faço backup de um Artigo do X com imagens?', a: 'Cole o link do post no Xtracticle e escolha ZIP + imagens. Você recebe um arquivo Markdown com todas as imagens salvas ao lado dele.' },
    { q: 'Posso fazer backup de vários artigos de uma vez?', a: 'Sim. O Modo em lote aceita até 20 links e devolve um único ZIP.' },
    { q: 'Posso fazer backup de Artigos de outras pessoas?', a: 'Você pode salvar qualquer Artigo público para leitura ou consulta pessoal. Respeite os direitos autorais e não republique sem permissão.' },
    { q: 'Posso levar os arquivos Markdown para o Notion ou o Obsidian?', a: 'Sim. O Obsidian abre arquivos .md diretamente, e o Notion importa Markdown em Import → Text & Markdown.' },
  ],
});

/* ─── 6. Ver tweets apagados ─── */

const seeDeleted = guide({
  slug: 'how-to-see-deleted-tweets',
  pslug: 'ver-tweets-apagados',
  title: 'Como ver tweets apagados: busque nos arquivos com um clique | Xtracticle',
  description:
    'Veja tweets apagados de outra conta: cole o link do post e busque de uma vez na Wayback Machine e no archive.today. Mais citações, prints e o que nunca funciona.',
  h1: 'Como ver tweets apagados',
  sub: 'Só dá para ver o post apagado de outra pessoa se uma cópia foi feita antes. Veja onde as cópias costumam existir e o que é beco sem saída.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Quando um post é apagado, o X deixa de exibi-lo. Ninguém, nem o Xtracticle, consegue buscá-lo no X de novo.',
  'Você só vê o post apagado de outra pessoa se alguém o copiou antes: uma captura de arquivo web, um print, uma matéria de notícia ou um arquivo salvo.',
  'Os melhores lugares para procurar são a Wayback Machine, o archive.today e posts ou artigos que citaram o apagado.',
  'Sites que prometem “mostrar qualquer tweet apagado” não alcançam dados que o X removeu. Desconfie deles.',
  'Se um post importa, salve-o enquanto está no ar, em <a href="/pt/tweet-para-pdf">PDF</a> ou ZIP.',
])}

${archiveCheck('pt')}

<section>
  <h2>Seus posts apagados vs os de outra pessoa</h2>
  <p>São dois problemas diferentes. Para os <strong>seus</strong> posts, uma cópia antiga do seu arquivo de dados do X ainda pode contê-los; esse caminho está em <a href="/pt/guias/recuperar-tweets-apagados">Dá para recuperar tweets apagados?</a>. Este guia trata dos posts de <strong>outras pessoas</strong>, em que você não tem arquivo próprio e depende de cópias feitas por terceiros.</p>
  <p>Ajuda ser realista desde o início. Não existe página escondida do X, URL especial nem configuração de conta que revele um post apagado. Se uma cópia existe, ela está em outro lugar.</p>
</section>

<section>
  <h2>Onde uma cópia pode existir</h2>
  <h3>1. Arquivos web</h3>
  <p>A Wayback Machine do Internet Archive e o archive.today fazem capturas de páginas web. Se alguém arquivou o post, ou o perfil do autor, antes da exclusão, você pode abrir essa captura. A cobertura é maior para contas conhecidas e para posts que alguém salvou de propósito, e menor para posts comuns apagados em poucos minutos. Siga os passos exatos em <a href="/pt/guias/encontrar-tweets-no-wayback-machine">como encontrar tweets na Wayback Machine</a>.</p>
  <h3>2. Citações, respostas e menções</h3>
  <p>As pessoas costumam reagir a um post citando-o. Se o original for apagado depois, o X normalmente mostra a citação com um aviso de que o post está indisponível, então o texto em si some. Respostas e outros posts que descrevem ou parafraseiam o original ainda podem dizer do que se tratava. Trate isso como relatos de segunda mão.</p>
  <h3>3. Prints</h3>
  <p>Jornalistas, checadores de fatos e usuários comuns fazem print de posts que provavelmente vão sumir. Pesquisar uma frase característica do post, ou o @ do autor junto com um assunto, pode trazer essas imagens. Um print mostra que algo foi publicado, mas é fácil de falsificar ou cortar, então é uma evidência fraca sozinho. Procure uma segunda fonte independente.</p>
  <h3>4. Notícias e blogs</h3>
  <p>Se o post foi notícia, as matérias muitas vezes o incorporam ou citam. Algumas incorporações continuam mostrando o texto mesmo depois que o original é apagado, mas isso depende de como a página foi construída e não é algo em que se possa confiar.</p>
  <h3>5. Trechos de buscadores</h3>
  <p>Um resultado de busca pode continuar exibindo um trecho antigo por pouco tempo depois da exclusão. O Google aposentou seus links públicos de “em cache”, então não dá mais para abrir a página guardada a partir do resultado. Se você vir um trecho, copie ou faça um print na hora, porque ele pode sumir quando o índice for atualizado.</p>
</section>

<section>
  <h2>O que não funciona</h2>
  <ul>
    <li><strong>Sites “visualizadores de tweets apagados”.</strong> Eles não leem dados que o X removeu. No melhor caso, pesquisam os mesmos arquivos públicos que você mesmo pode pesquisar. No pior, pedem seu login do X ou pagamento.</li>
    <li><strong>Adivinhar a URL.</strong> O endereço de um post apagado retorna “não encontrado”, seja com x.com, twitter.com ou um espelho.</li>
    <li><strong>Truques de navegador e o truque de trocar o domínio.</strong> Trocar x.com por xtracticle.com só lê posts que ainda estão no ar. Para os apagados, o resultado é não encontrado. Veja <a href="/pt/guias/ler-artigos-do-x-sem-conta">ler o X sem conta</a> para saber o que ele consegue fazer.</li>
    <li><strong>Pedir ao suporte do X.</strong> O X não dá a outros usuários acesso ao post apagado de outra pessoa.</li>
  </ul>
  <p>Contas protegidas são um caso à parte: seus posts nunca foram públicos, então os arquivos normalmente não têm nada.</p>
</section>

<section>
  <h2>Uma ordem prática para tentar</h2>
  <ol>
    <li>Cole a URL do post, se você a tiver, na Wayback Machine, usando as formas x.com e twitter.com.</li>
    <li>Confira o archive.today para a mesma URL.</li>
    <li>Pesquise uma frase característica do post, entre aspas, para achar prints, citações ou matérias.</li>
    <li>Olhe os outros canais do autor. As pessoas costumam republicar em outro lugar uma declaração apagada.</li>
    <li>Se encontrar uma cópia, anote onde e quando a achou, e não presuma que ela é fiel até ter uma segunda fonte.</li>
  </ol>
  <p>Se nada aparecer, presuma que o post se foi. Esse é o resultado habitual para posts obscuros.</p>
</section>

<section>
  <h2>Salve os posts importantes enquanto estão no ar</h2>
  <p>A única forma confiável de ver um post depois é guardar a sua própria cópia. Cole o link no <a href="/pt/">Xtracticle</a> e baixe um PDF com autor, data, imagens e um link para o original, ou um ZIP com as imagens como arquivos. Para uma thread longa, use <a href="/pt/thread-do-twitter-para-pdf">thread do Twitter para PDF</a> e, para ler a thread como uma única página antes, experimente <a href="/pt/desenrolar-thread-do-twitter">desenrolar thread do Twitter</a>. Um arquivo salvo registra o que você viu e quando viu. Não é prova para terceiros, mas é muito melhor do que a memória. Quem escreve pode montar uma rotina com o <a href="/pt/guias/backup-artigos-do-x">guia de backup</a>.</p>
  <p>Copie só o que precisar para sua própria referência, e respeite os direitos autorais e a privacidade do autor ao compartilhar.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'Posso ver o tweet apagado de outra pessoa?', a: 'Só se uma cópia foi feita antes da exclusão, por exemplo uma captura da Wayback Machine ou do archive.today, um print ou uma matéria de notícia que o citou. O X não mostra posts apagados para ninguém.' },
    { q: 'Existe um site que mostra qualquer tweet apagado?', a: 'Não. Os sites que dizem isso não conseguem ler dados que o X removeu. Eles pesquisam os mesmos arquivos públicos que você pode pesquisar, e alguns pedem seu login ou pagamento, então tenha cuidado.' },
    { q: 'Uma citação mantém o texto apagado?', a: 'Normalmente não. O X mostra o post citado como indisponível depois que o original é apagado, embora as palavras de quem citou continuem lá.' },
    { q: 'O Xtracticle consegue mostrar um post apagado?', a: 'Não. O Xtracticle lê posts públicos que ainda estão no ar, e um post apagado aparece como não encontrado.' },
    { q: 'Como garanto que poderei ver um post depois?', a: 'Salve-o enquanto está no ar. Cole o link no Xtracticle e baixe um PDF ou um ZIP com imagens.' },
  ],
});

/* ─── 7. Wayback Machine ─── */

const wayback = guide({
  slug: 'find-tweets-on-wayback-machine',
  pslug: 'encontrar-tweets-no-wayback-machine',
  title: 'Wayback Machine Twitter: encontrar tweets arquivados e apagados | Xtracticle',
  description:
    'Busque tweets e perfis do X na Wayback Machine: formas de URL que funcionam, busca com curinga de todos os posts arquivados de uma conta, archive.today e busca com um clique.',
  h1: 'Como encontrar tweets na Wayback Machine',
  sub: 'Um roteiro preciso para pesquisar posts e perfis do X (Twitter) arquivados no Internet Archive, e um olhar honesto sobre onde ele falha.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Pesquise primeiro a URL exata do post, nas formas <code>x.com</code> e <code>twitter.com</code>, e depois a URL do perfil.',
  'Uma busca com curinga como <code>web.archive.org/web/*/twitter.com/usuario/status/*</code> lista todas as URLs de posts arquivadas de uma conta.',
  'Pontos azuis no calendário são capturas bem-sucedidas. Os laranjas ou vermelhos geralmente mostram uma página de erro.',
  'A cobertura do X é irregular, e a ausência de resultado não significa que o post nunca existiu.',
  'O Save Page Now pode falhar no X, então, para qualquer coisa importante, guarde também a sua própria cópia.',
])}

${archiveCheck('pt')}

<section>
  <h2>Antes de começar</h2>
  <p>A Wayback Machine, em <a href="https://web.archive.org/" rel="noopener nofollow">web.archive.org</a>, guarda capturas de páginas web. Ela não mantém uma cópia completa do X. Um tweet só aparece lá se o rastreador do Internet Archive, ou uma pessoa usando o Save Page Now, capturou aquela página. Segundo a <a href="https://help.archive.org/help/using-the-wayback-machine/" rel="noopener nofollow">página de ajuda</a> do Internet Archive, a cobertura é incompleta e páginas que dependem de JavaScript são difíceis de arquivar. O X é exatamente esse tipo de site, e relatos de terceiros dizem que ele também restringiu o acesso automatizado. Então ajuste suas expectativas: contas conhecidas e posts muito compartilhados têm mais chance.</p>
  <p>Você precisa do endereço do post. Se não o tiver, tente achá-lo antes por uma citação, uma matéria ou o perfil do autor.</p>
</section>

<section>
  <h2>Passo a passo</h2>
  <h3>1. Pesquise a URL exata do post</h3>
  <p>Cole o link completo na caixa de busca do web.archive.org. O formato é <code>https://x.com/usuario/status/1234567890</code>. Se você só souber o endereço antigo, use <code>https://twitter.com/usuario/status/1234567890</code>. O ID do status é a parte que identifica o post, então importa mais do que o domínio.</p>
  <h3>2. Tente todas as variações de URL</h3>
  <p>O mesmo post pode estar guardado em vários endereços. Tente estes, um de cada vez:</p>
  <ul>
    <li><code>x.com/usuario/status/ID</code></li>
    <li><code>twitter.com/usuario/status/ID</code></li>
    <li><code>mobile.twitter.com/usuario/status/ID</code></li>
    <li><code>www.twitter.com/usuario/status/ID</code></li>
    <li>A mesma URL com <code>?s=20</code> no final ou outro parâmetro de rastreamento, se você a copiou de um link de compartilhamento</li>
  </ul>
  <h3>3. Use um curinga para listar tudo de uma conta</h3>
  <p>Se você não sabe o ID do status, peça todas as URLs capturadas sob um caminho. O Internet Archive documenta a forma com curinga <code>web.archive.org/web/*/example.com/*</code>. Para o X, fica assim:</p>
  <p><code>web.archive.org/web/*/twitter.com/usuario/status/*</code></p>
  <p>Faça o mesmo com <code>x.com</code>. O resultado é uma longa lista de URLs de posts arquivados. Use a função de busca do navegador para procurar nela um ID de status ou parte do endereço. Se a lista for muito longa, o arquivo também oferece uma interface CDX que devolve os mesmos dados em uma tabela simples. Uma consulta como <code>web.archive.org/cdx/search/cdx?url=twitter.com/usuario/status/*&amp;fl=timestamp,original,statuscode&amp;collapse=urlkey</code> funciona para muitas contas, mas confira a documentação do CDX do Internet Archive para os parâmetros atuais.</p>
  <h3>4. Confira a página do perfil</h3>
  <p>Pesquise <code>twitter.com/usuario</code> e <code>x.com/usuario</code>. Uma captura do perfil pode mostrar posts recentes como eles eram naquela data. Um post curto que ficou no ar alguns dias tem mais chance de aparecer aqui do que como página capturada própria.</p>
  <h3>5. Leia o calendário</h3>
  <p>Quando uma URL tem capturas, você vê o calendário do ano. Pontos e links marcam os dias com captura, e as cores mostram o status que o rastreador recebeu. Azul significa sucesso, verde um redirecionamento, laranja um erro do cliente e vermelho um erro do servidor, segundo o Internet Archive. Escolha uma data azul, de preferência logo antes de o post ser apagado. As capturas podem levar várias horas para aparecer depois de feitas.</p>
  <h3>6. Abra a captura e verifique</h3>
  <p>As páginas arquivadas às vezes carregam sem imagens ou respostas, ou mostram um pedido de login no lugar do post. Tente as capturas anteriores e posteriores no calendário, já que uma delas pode ter sido renderizada melhor. Anote o endereço completo do arquivo, com o carimbo de data e hora, se for citá-lo.</p>
</section>

<section>
  <h2>Save Page Now e seus limites no X</h2>
  <p>Para arquivar você mesmo uma página no ar, use o Save Page Now em <code>web.archive.org/save</code>, cole a URL e envie. Segundo o Internet Archive, isso salva uma página sob demanda e não salva sites inteiros. Faça isso antes de algo ser apagado, porque ele não consegue capturar um post que já sumiu.</p>
  <p>No X, o Save Page Now pode falhar ou gerar uma captura mostrando uma tela de login, porque o X costuma bloquear requisições automatizadas. Se isso acontecer, a captura não tem valor como registro. Por isso sugerimos uma segunda cópia nos seus próprios arquivos. O <a href="/pt/tweet-para-pdf">Tweet para PDF</a> e o <a href="/pt/">Xtracticle</a> renderizam o post público e salvam o resultado para você.</p>
</section>

<section>
  <h2>Alternativa: archive.today</h2>
  <p>O archive.today (também acessível em endereços como archive.ph) é um arquivo separado que deixa qualquer pessoa enviar uma página. Pesquise a URL do post por lá, ou cole-a na caixa de salvar se o post ainda estiver no ar. Ele tem cobertura e lacunas próprias, e seus domínios mudam de vez em quando, então procure o endereço atual. Use-o como segunda opinião quando a Wayback Machine não tiver nada.</p>
</section>

<section>
  <h2>Por que você pode não achar nada</h2>
  <ul>
    <li>O post foi apagado antes que qualquer rastreador ou usuário o salvasse.</li>
    <li>A conta é protegida, então a página nunca foi pública.</li>
    <li>A captura existe, mas mostra só uma barreira de login ou um erro.</li>
    <li>O processo de exclusão do Internet Archive a removeu, o que ele pode fazer a pedido.</li>
  </ul>
  <p>Para um panorama mais amplo, incluindo o seu próprio arquivo de dados, leia <a href="/pt/guias/recuperar-tweets-apagados">dá para recuperar tweets apagados</a> e <a href="/pt/guias/ver-tweets-apagados">como ver tweets apagados</a>. Threads que você quer guardar ficam melhor salvas com <a href="/pt/thread-do-twitter-para-pdf">thread do Twitter para PDF</a> ou <a href="/pt/desenrolar-thread-do-twitter">o desenrolador de threads</a>.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'A Wayback Machine salva tweets?', a: 'Às vezes. Ela guarda um post só se o rastreador ou um usuário capturou aquela página. A cobertura do X é irregular e maior para contas conhecidas.' },
    { q: 'Devo pesquisar x.com ou twitter.com?', a: 'Os dois. As capturas mais antigas costumam estar em twitter.com, as mais novas podem estar em x.com, e o mesmo ID de status pode aparecer em qualquer um.' },
    { q: 'Como listar todos os tweets arquivados de uma conta?', a: 'Use uma busca com curinga como web.archive.org/web/*/twitter.com/usuario/status/* e repita com x.com.' },
    { q: 'Posso usar o Save Page Now em um tweet?', a: 'Pode tentar, mas o X costuma bloquear arquivadores, então a captura pode mostrar uma tela de login. Ele também não consegue capturar um post que já foi apagado.' },
    { q: 'E se a Wayback Machine não tiver nada?', a: 'Tente o archive.today e procure prints ou citações. Se não existir nenhum, o post provavelmente não pode ser recuperado.' },
  ],
});

/* ─── 8. Como escrever um Artigo do X ─── */

const writeArticle = guide({
  slug: 'how-to-write-x-article',
  pslug: 'como-escrever-artigo-no-x',
  title: 'Como escrever e publicar um Artigo no X | Xtracticle',
  description:
    'Como escrever um artigo no X: quem pode publicar, onde fica o editor, formatação e imagem de capa, edição depois de publicar e como fazer backup.',
  h1: 'Como escrever e publicar um Artigo no X',
  sub: 'Da elegibilidade ao botão de publicar: o que você precisa, o que o editor oferece e como guardar uma cópia do texto pronto.',
  primary: 'md',
  sections: `
${takeaways([
  `Publicar Artigos exige um plano pago: ${WHEN}, a página de ajuda do X limita o recurso a contas Premium, Premium+, Premium Business e Premium Organizations.`,
  'Abra a área de Artigos pela navegação do X e escolha escrever um novo Artigo. A disponibilidade nos apps variou, então a versão web em x.com é o lugar mais seguro para começar.',
  'Você pode usar título, imagem de capa, subtítulos, listas, links, imagens, vídeo e posts incorporados.',
  'Editar um Artigo publicado, segundo o X, o tira do ar até você publicá-lo de novo.',
  'Faça backup de cada Artigo quando publicá-lo. Veja <a href="/pt/guias/backup-artigos-do-x">o guia de backup</a>.',
])}

<section>
  <h2>Quem pode escrever um Artigo</h2>
  <p>O X lançou os Artigos em 2024 para assinantes do Premium+ e depois ampliou o acesso. ${WHEN[0].toUpperCase() + WHEN.slice(1)}, a <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">página de ajuda sobre Artigos</a> do X diz que publicar é limitado a assinantes Premium e Premium+, Premium Businesses e Premium Organizations. Nomes e preços de planos mudam, então confira a sua própria conta se a opção não aparecer.</p>
  <p>Qualquer pessoa pode ler um Artigo publicado. Para mais contexto, veja <a href="/pt/guias/o-que-sao-artigos-do-x">O que são os Artigos do X?</a></p>
</section>

<section>
  <h2>Passo a passo</h2>
  <ol class="xt-steps">
    <li>Entre em x.com em um computador, com uma conta elegível.</li>
    <li>Encontre <strong>Artigos</strong> na navegação à esquerda. Se não aparecer, confira sua assinatura ou procure a opção de escrever um Artigo no menu de criação de posts.</li>
    <li>Escolha <strong>Escrever</strong> para abrir um novo rascunho. O X salva rascunhos para você voltar depois.</li>
    <li>Adicione um título e depois o corpo do texto. Coloque uma imagem de capa, se quiser.</li>
    <li>Visualize e clique em <strong>Publicar</strong>. O Artigo aparece no seu perfil e pode ser compartilhado como um post.</li>
  </ol>
  <p>Os nomes exatos e as posições dos menus mudam conforme o X atualiza o produto. Se algum nome for diferente do acima, siga o que aparece na sua tela.</p>
</section>

<section>
  <h2>O que o editor faz</h2>
  <p>Segundo a página de ajuda do X, os Artigos podem conter imagens, vídeo, GIFs, posts incorporados e links. A formatação do texto inclui títulos, subtítulos, negrito, itálico, tachado, recuo e listas numeradas ou com marcadores.</p>
  <h3>Imagem de capa</h3>
  <p>A capa aparece no topo do Artigo e, em geral, na prévia da linha do tempo. A página de ajuda do X não traz dimensões de imagem que pudéssemos verificar. Uma imagem larga funciona melhor porque a prévia a recorta; por isso, mantenha qualquer texto bem dentro do quadro e teste como fica depois de publicar.</p>
  <h3>Incorporar posts e mídia</h3>
  <p>Cole o link de outro post para incorporá-lo e adicione imagens onde elas apoiem um argumento. Vale colocar texto alternativo, por acessibilidade, se o editor oferecer.</p>
</section>

<section>
  <h2>Editar e apagar</h2>
  <p>Segundo a página de ajuda do X, para alterar um Artigo no ar você o abre, usa o menu de três pontos e escolhe <em>Edit Article</em> (Editar Artigo). Isso despublica o Artigo, e os leitores não conseguem vê-lo até você publicá-lo de novo. Então faça as edições de uma vez só e evite corrigir erros de digitação em horário de pico. O mesmo menu oferece a opção de apagar. Até onde sabemos, o X não tinha agendador nativo para Artigos ${WHEN}, então você publica quando clica no botão.</p>
</section>

<section>
  <h2>Dicas para Artigos fáceis de ler</h2>
  <ul>
    <li><strong>Comece pelo ponto principal.</strong> O título e os dois primeiros parágrafos decidem se as pessoas continuam.</li>
    <li><strong>Dê uma função a cada subtítulo.</strong> Os leitores passam os olhos, então os subtítulos devem contar a história sozinhos.</li>
    <li><strong>Mantenha os parágrafos curtos</strong> e use lista para passos ou comparações.</li>
    <li><strong>Use imagens com propósito</strong>, como gráficos, prints ou exemplos.</li>
    <li><strong>Linke suas fontes.</strong> Isso gera confiança e ajuda os leitores a conferir.</li>
    <li><strong>Vai transformar uma thread em Artigo?</strong> Reescreva. Os ganchos e a numeração de uma thread soam estranhos em um único documento.</li>
    <li><strong>Compartilhe com um post de gancho</strong> que apresente a ideia principal, não só o título.</li>
  </ul>
</section>

<section>
  <h2>Depois de publicar: salvar e compartilhar</h2>
  <p>O X não tem botão de exportar um Artigo. Cole o link do post (o que tem <code>/status/</code>) no <a href="/pt/">Xtracticle</a> para obter um PDF para compartilhar, ou Markdown e ZIP para reaproveitar o texto em outro lugar. Os leitores podem fazer o mesmo com <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>, mesmo sem conta, como descrito em <a href="/pt/guias/ler-artigos-do-x-sem-conta">ler Artigos do X sem conta</a>. Quem escreve deve manter o próprio arquivo, porque posts podem ser apagados ou contas suspensas. Para uma rotina completa, veja <a href="/pt/guias/backup-artigos-do-x">como fazer backup dos seus Artigos do X</a>.</p>
  <p>Se você está comparando o X com outros lugares para publicar, <a href="/pt/guias/artigos-do-x-vs-substack">Artigos do X vs Substack vs Medium</a> faz essa comparação. Para as regras de tamanho e mídia, veja os <a href="/pt/guias/limites-dos-artigos-do-x">limites dos Artigos do X</a>.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'Quem pode escrever um artigo no X?', a: 'No momento da redação (outubro de 2026), o X diz que publicar é limitado a contas Premium, Premium+, Premium Business e Premium Organizations. Qualquer pessoa pode ler os Artigos.' },
    { q: 'Onde escrevo um Artigo do X?', a: 'Use a opção Artigos na navegação do X em x.com e escolha escrever um novo Artigo. O nome e a posição podem mudar, e a disponibilidade nos apps variou.' },
    { q: 'Posso editar um Artigo do X depois de publicar?', a: 'Sim. Segundo o X, use o menu de três pontos e escolha Edit Article. Isso o despublica até você publicá-lo de novo.' },
    { q: 'Posso agendar um Artigo do X?', a: 'Não encontramos um agendador nativo para Artigos. Algumas ferramentas de terceiros oferecem agendamento, então confira antes de depender disso.' },
    { q: 'Como salvo o meu Artigo do X?', a: 'Cole o link do post no Xtracticle e baixe Markdown, PDF ou um ZIP com imagens.' },
  ],
});

/* ─── 9. Limites dos Artigos do X ─── */

const limits = guide({
  slug: 'x-articles-limits',
  pslug: 'limites-dos-artigos-do-x',
  title: 'Limites dos Artigos do X: tamanho, mídia e acesso | Xtracticle',
  description:
    'Limite de tamanho dos Artigos do X, mídia, e quem pode publicar ou ler. Números aproximados, regras de edição e comparação com posts longos e threads.',
  h1: 'Limites dos Artigos do X: tamanho, mídia e requisitos',
  sub: 'Quanto um Artigo do X pode ter, o que cabe nele, quem pode publicar e quem pode ler, com os números incertos marcados.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Até onde sabemos, o X não publicou um limite firme de tamanho para os Artigos. Fontes de terceiros apontam cerca de 100.000 caracteres, aproximadamente 15.000 palavras.',
  `Publicar exige um plano pago. ${WHEN[0].toUpperCase() + WHEN.slice(1)}, o X lista Premium, Premium+, Premium Business e Premium Organizations.`,
  'Qualquer pessoa pode ler um Artigo público, conforme as configurações do autor. Não é preciso assinatura.',
  'Os Artigos podem incluir imagens, vídeo, GIFs, links e posts incorporados, com subtítulos e listas.',
  'Editar um Artigo publicado o tira do ar até você publicá-lo de novo.',
])}

<section>
  <h2>Limite de tamanho</h2>
  <p>A <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">página de ajuda sobre Artigos</a> do X descreve o que os Artigos podem conter, mas não encontramos ali uma contagem específica de caracteres. Relatos do lançamento em 2024 diziam que os testadores bateram em um teto um pouco acima de 100.000 caracteres, que várias fontes convertem em cerca de 15.000 palavras, e guias atualizados em 2026 ainda repetem o mesmo número. O Social Media Today estimou uma contagem maior de palavras com o mesmo número de caracteres, porque as palavras são mais curtas do que se imagina; portanto, a contagem de palavras é só uma referência aproximada.</p>
  <p>Trate 100.000 caracteres como aproximado. Na prática, poucos Artigos chegam perto disso: é algo como um capítulo curto de livro ou um ensaio muito longo. Se você está escrevendo algo desse tamanho, um documento para baixar pode servir melhor aos leitores.</p>
</section>

<section>
  <h2>Mídia e formatação</h2>
  <p>Segundo o X, os Artigos podem incluir imagens, vídeo, GIFs, posts incorporados e links. O texto pode usar títulos, subtítulos, negrito, itálico, tachado, recuo e listas numeradas ou com marcadores. Não conseguimos verificar limites de tamanho de arquivo para imagens ou vídeo no editor de Artigos, então confira no próprio editor se aparece algum erro antes de publicar um arquivo grande.</p>
</section>

<section>
  <h2>Quem pode publicar e quem pode ler</h2>
  <ul>
    <li><strong>Publicar:</strong> contas de planos Premium. O recurso começou com o Premium+ em 2024, e a página de ajuda atual do X lista assinantes Premium e Premium+ mais Premium Businesses e Premium Organizations. As regras podem mudar, então confira a sua conta.</li>
    <li><strong>Ler:</strong> qualquer pessoa que consiga ver o post. Artigos públicos podem ser abertos sem pagar. Leitores que não estão logados podem encontrar pedidos de login ou visualizações limitadas em x.com, como descrito em <a href="/pt/guias/ler-artigos-do-x-sem-conta">ler o X sem conta</a>.</li>
    <li><strong>Visibilidade:</strong> um Artigo é publicado no seu perfil e compartilhado por meio de um post. O conteúdo de contas protegidas continua limitado aos seguidores aprovados.</li>
  </ul>
  <p>Para o contexto, veja <a href="/pt/guias/o-que-sao-artigos-do-x">O que são os Artigos do X?</a> e o passo a passo <a href="/pt/guias/como-escrever-artigo-no-x">como escrever um Artigo do X</a>.</p>
</section>

<section>
  <h2>Edição depois de publicar</h2>
  <p>Segundo a página de ajuda do X, você pode editar um Artigo publicado no menu de três pontos, com <em>Edit Article</em>. Isso o despublica, e ele fica oculto até você publicá-lo de novo. Apagar está disponível no mesmo menu. Como um Artigo apagado some para os leitores também, salve uma cópia antes se puder precisar dele depois (veja <a href="/pt/guias/backup-artigos-do-x">o guia de backup</a>).</p>
</section>

<section>
  <h2>Artigos vs posts longos vs threads</h2>
  <p>Os números abaixo são aproximados e se baseiam em reportagens de terceiros ${WHEN}.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Post padrão</th><th>Post longo</th><th>Thread</th><th>Artigo do X</th></tr></thead>
    <tbody>
      <tr><td>Tamanho</td><td>280 caracteres na maioria das contas</td><td>Relatado até cerca de 25.000 caracteres para assinantes pagos</td><td>Vários posts, cada um com seu limite</td><td>Cerca de 100.000 caracteres (aproximado)</td></tr>
      <tr><td>Títulos e listas</td><td>Não</td><td>Não</td><td>Não</td><td>Sim</td></tr>
      <tr><td>Título e imagem de capa</td><td>Não</td><td>Não</td><td>Não</td><td>Sim</td></tr>
      <tr><td>Quem pode criar</td><td>Qualquer pessoa</td><td>Assinantes pagos</td><td>Qualquer pessoa</td><td>Contas de planos Premium</td></tr>
      <tr><td>Engajamento</td><td>Um post</td><td>Um post</td><td>Cada post separadamente</td><td>Um post que leva ao Artigo</td></tr>
    </tbody>
  </table></div>
  <p>Escolha um post longo para uma ideia única que não precisa de estrutura, uma thread quando quiser uma conversa com respostas a cada passo, e um Artigo quando o texto precisar de subtítulos, imagens e uma experiência de leitura própria.</p>
</section>

<section>
  <h2>Salvando o que você lê</h2>
  <p>O tamanho não é problema para salvar: um Artigo longo vira um arquivo de várias páginas. Cole o link no <a href="/pt/">Xtracticle</a> ou use <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>. Para threads, há <a href="/pt/thread-do-twitter-para-pdf">thread do Twitter para PDF</a>, e posts avulsos passam pelo <a href="/pt/tweet-para-pdf">tweet para PDF</a>.</p>
</section>`,
  faq: [
    { q: 'Qual é o limite de caracteres dos Artigos do X?', a: 'O X não informa um número firme que tenhamos encontrado. Fontes de terceiros relatam cerca de 100.000 caracteres, aproximadamente 15.000 palavras. Trate como aproximado.' },
    { q: 'Quem pode publicar Artigos do X?', a: 'No momento da redação (outubro de 2026), o X lista contas Premium, Premium+, Premium Business e Premium Organizations.' },
    { q: 'Preciso do Premium para ler um Artigo do X?', a: 'Não. Os Artigos públicos podem ser lidos sem assinatura.' },
    { q: 'Posso editar um Artigo do X depois de publicar?', a: 'Sim. Segundo a página de ajuda do X, escolha Edit Article no menu de três pontos. O Artigo fica despublicado até você publicá-lo de novo.' },
    { q: 'Qual a diferença entre um Artigo e um post longo?', a: 'Um post longo continua sendo um post comum, sem título nem subtítulos. Um Artigo tem título, imagem de capa opcional, subtítulos, listas e mídia incorporada, e comporta mais texto.' },
  ],
});

/* ─── Hub ─── */

const GUIDES: { page: SitePage; blurb: string }[] = [
  { page: whatAre, blurb: 'O que são os Artigos do X, quem pode publicá-los, como se diferenciam das threads e como salvá-los.' },
  { page: readWithout, blurb: 'Leia Artigos, threads e posts do X sem fazer login, incluindo o truque de x.com para xtracticle.com.' },
  { page: deleted, blurb: 'O que dá e o que não dá para recuperar depois que um post é apagado, e como guardar os importantes.' },
  { page: versus, blurb: 'Artigos do X comparados ao Substack e ao Medium em público, dinheiro, propriedade, exportação e SEO.' },
  { page: backup, blurb: 'Um plano prático para fazer backup dos seus Artigos e threads do X em Markdown, ZIP e PDF.' },
  { page: seeDeleted, blurb: 'Onde pode existir uma cópia do post apagado de outra pessoa, o que nunca funciona e como salvar posts antes.' },
  { page: wayback, blurb: 'Passo a passo: formas de URL, busca com curinga, calendário, Save Page Now e archive.today para tweets arquivados.' },
  { page: writeArticle, blurb: 'Quem pode publicar um Artigo do X, onde fica o editor, formatação, edição e como fazer backup.' },
  { page: limits, blurb: 'Limite aproximado de tamanho dos Artigos do X, mídia, quem pode publicar ou ler e uma tabela contra posts longos e threads.' },
];

const hub: SitePage = {
  id: 'pt-guides',
  group: 'guides',
  path: HUB,
  file: 'pt/guias.html',
  lang: 'pt',
  title: 'Guias: salvar, ler e arquivar conteúdo do X | Xtracticle',
  description:
    'Guias práticos sobre Artigos do X (Twitter): o que são, como ler sem login, recuperar posts apagados, comparar plataformas e fazer backup dos seus textos.',
  h1: 'Guias: salvar, ler e arquivar conteúdo do X',
  sub: 'Guias curtos e práticos sobre Artigos, threads e posts do X, e como guardar uma cópia deles.',
  primary: 'pdf',
  nav: 'Guias',
  sections: `
<section>
  <h2>Todos os guias</h2>
  <ul>${GUIDES.map(g => `<li><a href="${g.page.path}"><strong>${g.page.h1}</strong></a> — ${g.blurb}</li>`).join('')}</ul>
</section>

<section>
  <h2>Pronto para salvar alguma coisa?</h2>
  <p>Cole qualquer link do X no <a href="/pt/">Xtracticle</a>, ou vá direto para <a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a>, <a href="/pt/artigo-do-x-para-markdown">Markdown</a>, <a href="/pt/artigo-do-x-para-epub-kindle">EPUB</a> ou <a href="/pt/thread-do-twitter-para-pdf">thread para PDF</a>.</p>
</section>`,
  faq: [],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Guias do Xtracticle',
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
