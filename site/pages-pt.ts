/** Brazilian Portuguese pages. */
import { EXAMPLE, GITHUB, privacy, shortcuts, steps, type SitePage } from './blocks';

const home: SitePage = {
  id: 'pt-home',
  group: 'home',
  path: '/pt/',
  file: 'pt/index.html',
  lang: 'pt',
  isHome: true,
  title: 'Baixar artigos do X em PDF e Markdown — threads e posts | Xtracticle',
  description:
    'Baixe artigos, threads e posts do X (Twitter) em PDF, Markdown, EPUB/Kindle ou texto. Cole um link e receba um arquivo limpo com imagens — grátis e sem cadastro.',
  h1: 'Baixar artigos do X',
  sub: 'Baixe artigos, threads e posts do X (Twitter) em PDF, Markdown, EPUB ou texto — grátis e sem login.',
  primary: 'pdf',
  nav: 'Baixar artigos do X',
  sections: `
<section>
  <h2>Como baixar um artigo do X</h2>
  ${steps([
    '<strong>Copie o link do post</strong> — no X toque em <em>Compartilhar → Copiar link</em>. Qualquer post de uma thread funciona.',
    '<strong>Cole aqui em cima</strong> — o Xtracticle busca o artigo, a thread ou o post em um ou dois segundos.',
    '<strong>Escolha o formato</strong> — PDF, Markdown, EPUB/Kindle, ZIP com imagens ou texto simples.',
    '<strong>Pronto</strong> — você também pode copiar, mandar para o Obsidian ou ouvir em voz alta.',
  ])}
  <p>Quer ver o resultado antes? <a href="${EXAMPLE}">Abra um artigo de exemplo</a>.</p>
</section>

<section>
  <h2>Todos os formatos que você precisa</h2>
  <div class="xt-grid">
    <div><h3><a href="/pt/artigo-do-x-para-pdf">Artigo do X para PDF</a></h3><p>Formato A4, pronto para imprimir: imagens, link da fonte e números de página.</p></div>
    <div><h3><a href="/pt/artigo-do-x-para-markdown">Artigo do X para Markdown</a></h3><p>Mantém títulos, negrito, links, listas, citações e imagens. Front-matter YAML opcional.</p></div>
    <div><h3><a href="/pt/artigo-do-x-para-epub-kindle">Artigo do X para EPUB / Kindle</a></h3><p>Leia artigos longos no Kindle, Kobo ou Apple Books, com as imagens incluídas.</p></div>
    <div><h3><a href="/pt/salvar-artigos-do-x-no-obsidian">Salvar artigos do X no Obsidian</a></h3><p>Um clique abre uma nova nota no seu cofre com o artigo completo e os metadados.</p></div>
    <div><h3>ZIP + imagens</h3><p>Markdown e todas as imagens salvas localmente: um arquivo que continua existindo mesmo se o post for apagado.</p></div>
    <div><h3>Texto simples</h3><p>Um .txt limpo para qualquer dispositivo, script ou ferramenta de IA.</p></div>
  </div>
</section>

<section>
  <h2>Artigos, threads e posts avulsos</h2>
  <p><strong>Artigos do X</strong> (posts longos de até 100.000 caracteres): são convertidos bloco a bloco com títulos, negrito, itálico,
  tachado, links, listas, citações, código, divisores, imagem de capa, imagens, vídeos e posts incorporados.</p>
  <p><strong>Threads</strong>: são desenroladas automaticamente. Cole o primeiro post, um do meio ou o último — o Xtracticle encontra a thread
  inteira do autor e junta tudo em um único documento numerado. Respostas de outras pessoas ficam de fora. Veja como
  <a href="/pt/thread-do-twitter-para-pdf">salvar uma thread do Twitter em PDF</a>.</p>
  <p><strong>Posts avulsos</strong>: mantêm o texto, as quebras de linha, as fotos, os vídeos e o post citado. Tem muitos? Ative o
  <em>Modo em lote</em> e cole até 20 links para receber um único ZIP.</p>
  <p>Vem do Thread Reader App? Veja a <a href="/pt/alternativa-ao-thread-reader-app">comparação completa</a>.</p>
</section>

${shortcuts('pt')}

${privacy('pt')}`,
  faq: [
    { q: 'O Xtracticle é grátis?', a: 'Sim. É gratuito e de código aberto: sem conta, sem login e sem limite de uso.' },
    { q: 'Como baixo um artigo do X em PDF?', a: 'Copie o link do post, cole no Xtracticle e clique em PDF. O arquivo traz título, autor, data, link da fonte, todas as imagens e números de página.' },
    { q: 'Dá para baixar uma thread inteira do Twitter?', a: 'Sim. Cole o link de qualquer post da thread (o primeiro, um do meio ou o último). O Xtracticle reúne todos os posts do autor em um único documento numerado.' },
    { q: 'Posso salvar artigos do X no Obsidian ou no Notion?', a: 'Sim. Baixe o arquivo Markdown ou clique no botão Obsidian, que copia o artigo e abre uma nova nota. O Notion importa arquivos .md diretamente.' },
    { q: 'Por que aparece que o post não foi encontrado?', a: 'O post pode ter sido apagado, ser de uma conta privada ou ter restrição de idade. Só é possível baixar posts públicos.' },
    { q: 'Tenho um link x.com/i/article/… O que faço?', a: 'Esse é o link do leitor de artigos. Abra o artigo no X, toque em Compartilhar → Copiar link para pegar o link do post (x.com/usuario/status/…) e cole esse link.' },
  ],
};

const pdf: SitePage = {
  id: 'pt-pdf',
  group: 'pdf',
  path: '/pt/artigo-do-x-para-pdf',
  file: 'pt/artigo-do-x-para-pdf.html',
  lang: 'pt',
  title: 'Baixar artigo do X em PDF — Converter tweet em PDF grátis | Xtracticle',
  description:
    'Converta qualquer artigo ou post do X (Twitter) em PDF pronto para imprimir, com imagens, link da fonte e números de página. Grátis, sem login, no celular ou PC.',
  h1: 'Baixar artigo do X em PDF',
  sub: 'Transforme qualquer artigo, thread ou post do X (Twitter) em um PDF limpo e pronto para imprimir — com imagens e sem login.',
  primary: 'pdf',
  nav: 'Artigo do X em PDF',
  sections: `
<section>
  <h2>Como converter um artigo do X em PDF em três passos</h2>
  ${steps([
    '<strong>Copie o link</strong> do artigo do X (Compartilhar → Copiar link).',
    '<strong>Cole aqui em cima</strong> e clique em Extrair.',
    '<strong>Clique em PDF</strong> — o download começa na hora.',
  ])}
</section>

<section>
  <h2>Como fica o seu PDF</h2>
  <ul>
    <li><strong>Layout A4 limpo</strong> — sem a barra lateral do X, botões, respostas ou anúncios. Só o artigo.</li>
    <li><strong>Título, autor, data e link da fonte</strong> logo no topo, para você poder citar o PDF.</li>
    <li><strong>Imagem de capa e imagens do texto</strong> no lugar certo, ajustadas ao tamanho da página.</li>
    <li><strong>Números de página</strong> e um link clicável para o post original no rodapé.</li>
    <li><strong>Nenhuma linha cortada</strong> — as quebras de página ficam entre os parágrafos, nunca no meio deles, mesmo em artigos muito longos.</li>
  </ul>
</section>

<section>
  <h2>Dicas</h2>
  <h3>Precisa de texto selecionável e pesquisável?</h3>
  <p>O PDF é gerado para ter um layout perfeito, pixel a pixel. Se você quer grifar ou pesquisar o texto, use a exportação em <a href="/pt/artigo-do-x-para-epub-kindle">EPUB</a>
  ou <a href="/pt/artigo-do-x-para-markdown">Markdown</a> — ou aperte <code>Ctrl/Cmd + P</code> no resultado e escolha <em>Salvar como PDF</em>.</p>
  <h3>Threads em PDF</h3>
  <p>Cole qualquer post de uma thread e a thread inteira vira um único PDF. Saiba mais em <a href="/pt/thread-do-twitter-para-pdf">thread do Twitter para PDF</a>.</p>
  <h3>No iPhone</h3>
  <p>Toque em PDF, abra o arquivo na lista de downloads do Safari e use <em>Compartilhar → Salvar em Arquivos</em> ou mande para o app Livros.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'O conversor de X para PDF é grátis?', a: 'Sim, totalmente grátis: sem marca d’água, sem login e sem limites.' },
    { q: 'O PDF inclui as imagens?', a: 'Sim. A imagem de capa e todas as imagens do texto entram no PDF. Os vídeos aparecem como uma miniatura com link para o vídeo.' },
    { q: 'Dá para converter uma thread do Twitter em PDF?', a: 'Sim. Cole o link de qualquer post da thread e o Xtracticle junta a thread inteira em um único PDF.' },
    { q: 'Funciona no celular?', a: 'Sim. Funciona em qualquer navegador moderno no iPhone, Android, Mac, Windows e Linux.' },
    { q: 'Consigo converter posts privados ou apagados?', a: 'Não. Só dá para converter posts públicos que ainda estão no ar — e é justamente por isso que vale a pena guardar uma cópia em PDF.' },
  ],
};

const markdown: SitePage = {
  id: 'pt-markdown',
  group: 'markdown',
  path: '/pt/artigo-do-x-para-markdown',
  file: 'pt/artigo-do-x-para-markdown.html',
  lang: 'pt',
  title: 'Artigo do X para Markdown — Posts e threads em .md | Xtracticle',
  description:
    'Converta artigos, threads e posts do X (Twitter) em Markdown, com títulos, links, listas, imagens e front-matter YAML. Ideal para Obsidian, Notion, GitHub e IA.',
  h1: 'Artigo do X para Markdown',
  sub: 'Converta artigos, threads e posts do X (Twitter) em Markdown limpo — com formatação, links e imagens preservados.',
  primary: 'md',
  nav: 'Artigo do X em Markdown',
  sections: `
<section>
  <h2>Markdown limpo, não uma bagunça de copiar e colar</h2>
  <p>Os artigos do X são salvos como blocos de texto formatado. O Xtracticle converte cada bloco em Markdown de verdade, para que ele apareça certinho em qualquer lugar:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>No X</th><th>No seu arquivo .md</th></tr></thead>
    <tbody>
      <tr><td>Título / Subtítulo</td><td><code>## Título</code> / <code>### Subtítulo</code></td></tr>
      <tr><td>Negrito, itálico, tachado</td><td><code>**negrito**</code>, <code>*itálico*</code>, <code>~~tachado~~</code></td></tr>
      <tr><td>Links</td><td><code>[texto](https://…)</code></td></tr>
      <tr><td>Listas com marcadores / numeradas (aninhadas)</td><td><code>- item</code> / <code>1. item</code></td></tr>
      <tr><td>Citações, código, divisores</td><td><code>&gt; citação</code>, bloco de código, <code>---</code></td></tr>
      <tr><td>Imagens e vídeos</td><td><code>![legenda](url)</code>, miniatura do vídeo com link</td></tr>
      <tr><td>Posts incorporados</td><td>Link para o post incorporado</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Front-matter YAML incluído</h2>
  <p>Cada arquivo pode começar com metadados que o Obsidian (Propriedades), Hugo, Jekyll, Astro e Dataview entendem:</p>
  <pre><code>---
title: "O título do artigo"
author: "Nome do Autor (@usuario)"
source: "https://x.com/usuario/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>Não quer? Desmarque <em>Adicionar front-matter YAML ao .md</em> embaixo dos botões de download.</p>
</section>

<section>
  <h2>Perfeito para</h2>
  <ul>
    <li><strong>Anotações</strong> — Obsidian, Logseq, Notion, Bear, Joplin e qualquer editor de Markdown. Veja o <a href="/pt/salvar-artigos-do-x-no-obsidian">guia do Obsidian</a>.</li>
    <li><strong>Ferramentas de IA</strong> — Markdown é o contexto mais limpo para ChatGPT, Claude, Gemini ou NotebookLM: cole o texto para resumir, traduzir ou fazer perguntas.</li>
    <li><strong>Escrita e publicação</strong> — cite fontes em posts de blog, newsletters, documentação e READMEs no GitHub.</li>
    <li><strong>Arquivamento</strong> — baixe o <em>ZIP + imagens</em> para guardar todas as imagens no seu computador, ao lado do arquivo .md.</li>
  </ul>
</section>

${shortcuts('pt')}`,
  faq: [
    { q: 'Como converto um tweet em Markdown?', a: 'Cole o link do post no Xtracticle e clique em Markdown, ou em Copiar para mandar o Markdown direto para a área de transferência.' },
    { q: 'As imagens vêm junto no Markdown?', a: 'Sim, como links de imagem. Escolha ZIP + imagens para baixar também todas as imagens e fazer o Markdown apontar para as cópias locais.' },
    { q: 'Dá para converter threads em Markdown?', a: 'Sim. Cole qualquer post da thread; todos os posts são reunidos em um único documento Markdown numerado.' },
    { q: 'Posso desativar o front-matter YAML?', a: 'Sim. Desmarque a opção de front-matter embaixo dos botões de download. Sua escolha fica salva.' },
  ],
};

const thread: SitePage = {
  id: 'pt-thread',
  group: 'thread',
  path: '/pt/thread-do-twitter-para-pdf',
  file: 'pt/thread-do-twitter-para-pdf.html',
  lang: 'pt',
  title: 'Salvar thread do Twitter em PDF — Desenrole threads do X | Xtracticle',
  description:
    'Desenrole qualquer thread do X (Twitter) e salve tudo em um único PDF, Markdown, EPUB ou texto. Cole qualquer post da thread — sem marcar bot, sem login e grátis.',
  h1: 'Salvar thread do Twitter em PDF',
  sub: 'Desenrole qualquer thread do X (Twitter) em um único documento limpo — PDF, Markdown, EPUB ou texto. Cole qualquer post da thread.',
  primary: 'pdf',
  nav: 'Thread em PDF',
  sections: `
<section>
  <h2>Desenrole uma thread em segundos</h2>
  ${steps([
    '<strong>Copie o link</strong> de qualquer post da thread — o primeiro, um do meio ou o último.',
    '<strong>Cole aqui em cima.</strong> O Xtracticle encontra todos os posts que o autor escreveu nessa thread.',
    '<strong>Baixe</strong> a thread completa e numerada em PDF, Markdown, EPUB ou texto.',
  ])}
</section>

<section>
  <h2>Como funciona o desenrolar de threads</h2>
  <p>Uma thread é uma sequência de posts em que o autor responde a si mesmo. O Xtracticle lê essa sequência e mantém só os posts do
  próprio autor, na ordem — respostas de outras pessoas ficam de fora. Cada post recebe um número (<code>1/12</code>, <code>2/12</code>…) e mantém
  as quebras de linha, as fotos, os vídeos e os posts citados.</p>
  <p>Não precisa marcar nenhum bot na thread nem esperar resposta: tudo acontece aqui mesmo, de forma privada.</p>
</section>

<section>
  <h2>Por que salvar threads?</h2>
  <ul>
    <li><strong>Leia com calma</strong> — um documento contínuo, em vez de rolar post por post.</li>
    <li><strong>Guarde para sempre</strong> — threads são apagadas e contas ficam privadas. Uma cópia em PDF ou em <em>ZIP + imagens</em> continua sendo sua.</li>
    <li><strong>Estude e compartilhe</strong> — mande o PDF para a sua equipe, imprima ou leve o Markdown para as suas anotações ou para um assistente de IA.</li>
    <li><strong>No seu leitor digital</strong> — exporte em <a href="/pt/artigo-do-x-para-epub-kindle">EPUB para Kindle</a>.</li>
  </ul>
</section>

${shortcuts('pt')}`,
  faq: [
    { q: 'Preciso do primeiro tweet da thread?', a: 'Não. Cole qualquer post da thread e ela é montada inteira.' },
    { q: 'As respostas de outras pessoas entram?', a: 'Não. Só entram os posts do próprio autor na thread, na ordem.' },
    { q: 'Preciso marcar um bot como o @threadreaderapp?', a: 'Não. Não tem nada para postar nem marcar — é só colar o link e baixar.' },
    { q: 'Dá para desenrolar a thread de uma conta privada?', a: 'Não. Só threads públicas podem ser acessadas.' },
  ],
};

const epub: SitePage = {
  id: 'pt-epub',
  group: 'epub',
  path: '/pt/artigo-do-x-para-epub-kindle',
  file: 'pt/artigo-do-x-para-epub-kindle.html',
  lang: 'pt',
  title: 'Artigo do X para EPUB e Kindle — Leia no seu e-reader | Xtracticle',
  description:
    'Converta artigos e threads do X (Twitter) em EPUB e mande para o Kindle, Kobo, Apple Books ou Google Play Livros. Com as imagens incluídas, grátis e sem login.',
  h1: 'Artigo do X para EPUB e Kindle',
  sub: 'Leia artigos longos e threads do X (Twitter) no Kindle, Kobo ou Apple Books — como um e-book de verdade, com imagens.',
  primary: 'epub',
  nav: 'X para Kindle / EPUB',
  sections: `
<section>
  <h2>Mande um artigo do X para o seu Kindle</h2>
  ${steps([
    '<strong>Cole o link do post</strong> aqui em cima e clique em Extrair.',
    '<strong>Clique em “EPUB / Kindle”</strong> para baixar o e-book.',
    '<strong>Envie para o Kindle</strong> pelo app ou pela página Send to Kindle (Enviar para Kindle), ou mandando o arquivo por e-mail para o endereço do seu Kindle.',
  ])}
</section>

<section>
  <h2>Um e-book de verdade, não um print</h2>
  <ul>
    <li><strong>Texto ajustável</strong> — mude a fonte e o tamanho da letra no seu aparelho.</li>
    <li><strong>Imagens incorporadas</strong> no próprio arquivo, para funcionar offline.</li>
    <li><strong>Metadados</strong> — título e autor aparecem certinho na sua biblioteca.</li>
    <li><strong>EPUB 3 padrão</strong> — funciona no Kindle (via Send to Kindle), Kobo, Apple Books, Google Play Livros, PocketBook e Calibre.</li>
  </ul>
</section>

<section>
  <h2>Perfeito para leituras longas</h2>
  <p>Os artigos do X podem ter até 100.000 caracteres e as threads podem chegar a dezenas de posts. Ler tudo isso numa tela de tinta eletrônica cansa menos a vista,
  não tem distrações e funciona sem internet. Salve alguns antes de uma viagem de avião ou monte uma lista de leitura para o fim de semana.</p>
</section>

${privacy('pt')}`,
  faq: [
    { q: 'O Kindle aceita EPUB?', a: 'Sim. O Send to Kindle da Amazon aceita arquivos EPUB e converte automaticamente para o seu aparelho.' },
    { q: 'Posso ler no Apple Books?', a: 'Sim. Abra o .epub baixado no iPhone, iPad ou Mac e escolha o app Livros.' },
    { q: 'As imagens vêm junto?', a: 'Sim, as imagens ficam incorporadas no EPUB. Os vídeos aparecem como link.' },
    { q: 'Dá para converter uma thread em EPUB?', a: 'Sim. Cole qualquer post da thread e ela inteira vira um único e-book.' },
  ],
};

const obsidian: SitePage = {
  id: 'pt-obsidian',
  group: 'obsidian',
  path: '/pt/salvar-artigos-do-x-no-obsidian',
  file: 'pt/salvar-artigos-do-x-no-obsidian.html',
  lang: 'pt',
  title: 'Salvar artigos e threads do X no Obsidian em um clique | Xtracticle',
  description:
    'Salve artigos e threads do X no Obsidian em Markdown, com propriedades (autor, fonte, data, tags). Um clique, imagens locais opcionais, grátis e open source.',
  h1: 'Salvar artigos do X no Obsidian',
  sub: 'Salve artigos e threads do X (Twitter) no seu cofre do Obsidian em Markdown limpo, com propriedades — em um clique.',
  primary: 'obsidian',
  nav: 'X no Obsidian',
  sections: `
<section>
  <h2>Do X direto para o seu cofre</h2>
  ${steps([
    '<strong>Cole o link do post</strong> aqui em cima e clique em Extrair.',
    '<strong>Clique em “Obsidian”.</strong> O Markdown é copiado e o Obsidian abre uma nova nota com ele.',
    '<strong>Pronto</strong> — título, autor, fonte, datas e tags já estão nas propriedades da nota.',
  ])}
  <p>Prefere arquivos? Baixe o <strong>Markdown</strong> e jogue no seu cofre, ou o <strong>ZIP + imagens</strong> para manter as imagens offline numa pasta <code>images/</code> ao lado da nota.</p>
</section>

<section>
  <h2>Propriedades que você pode consultar</h2>
  <p>Toda nota recebe <code>title</code>, <code>author</code>, <code>source</code>, <code>published</code>, <code>saved</code>, <code>type</code> (article, thread ou post) e <code>tags</code>.
  Com o Dataview você lista tudo o que salvou do X:</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>Por que não usar um web clipper?</h2>
  <p>Os clippers genéricos se enrolam com o X: a página exige login, o conteúdo carrega de forma dinâmica e as threads ficam divididas em vários posts.
  O Xtracticle lê os dados do post diretamente, então os artigos do X mantêm os títulos e as listas, e as threads chegam como uma única nota.</p>
</section>

${shortcuts('pt')}`,
  faq: [
    { q: 'Cliquei em Obsidian e nada aconteceu.', a: 'O Obsidian precisa estar instalado neste aparelho. O Markdown também é copiado para a área de transferência, então você pode colar em qualquer nota.' },
    { q: 'Funciona com o Obsidian no iPhone ou Android?', a: 'Sim, se o app do Obsidian estiver instalado. Se não estiver, use Copiar ou baixe o arquivo .md.' },
    { q: 'Como mantenho as imagens dentro do cofre?', a: 'Baixe o ZIP + imagens e extraia no seu cofre. Os links do Markdown apontam para a pasta local de imagens.' },
    { q: 'Funciona com Logseq, Notion ou Bear?', a: 'Sim — baixe ou copie o Markdown e importe ou cole.' },
  ],
};

const alternative: SitePage = {
  id: 'pt-tra',
  group: 'tra',
  path: '/pt/alternativa-ao-thread-reader-app',
  file: 'pt/alternativa-ao-thread-reader-app.html',
  lang: 'pt',
  title: 'Alternativa grátis ao Thread Reader App — PDF e Markdown | Xtracticle',
  description:
    'Procurando uma alternativa ao Thread Reader App? O Xtracticle salva threads e artigos do X em PDF, Markdown, EPUB ou texto grátis — sem bot, sem anúncios, sem login.',
  h1: 'Uma alternativa grátis ao Thread Reader App',
  sub: 'Desenrole threads do X e salve artigos do X em PDF, Markdown, EPUB ou texto — grátis, sem marcar bot, sem anúncios e sem login.',
  primary: 'pdf',
  nav: 'Alternativa ao Thread Reader App',
  sections: `
<section>
  <h2>Por que as pessoas procuram uma alternativa</h2>
  <p>O <a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a> é um jeito bem conhecido de desenrolar threads:
  você marca <code>@threadreaderapp unroll</code> embaixo de uma thread ou cola o link no site deles. Para ler, funciona bem.
  O problema começa quando você quer <strong>guardar</strong> o que leu:</p>
  <ul>
    <li><strong>Exportar em PDF é um recurso Premium</strong> (US$ 3/mês ou US$ 30/ano no momento em que este texto foi escrito).</li>
    <li><strong>Os artigos do X não são suportados</strong> — a página de ajuda deles diz que a API do X não dá acesso ao conteúdo dos Artigos.</li>
    <li><strong>A versão grátis mostra anúncios</strong>, e não há exportação para Markdown, EPUB ou Obsidian.</li>
  </ul>
  <p>O Xtracticle foca exatamente nessa parte: transformar threads e artigos longos do X em arquivos que são seus — de graça.</p>
</section>

<section>
  <h2>Comparação lado a lado</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>Desenrolar threads</td><td>✅ Cole qualquer post da thread</td><td>✅ Marque o bot ou cole um link</td></tr>
      <tr><td>Artigos do X (textos longos)</td><td>✅ Títulos, listas, imagens, vídeos</td><td>❌ Não suportado</td></tr>
      <tr><td>PDF</td><td>✅ Grátis</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ Grátis, com front-matter YAML</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ Grátis</td><td>❌</td></tr>
      <tr><td>ZIP com imagens (arquivo offline)</td><td>✅ Grátis</td><td>❌</td></tr>
      <tr><td>Download em lote</td><td>✅ Até 20 links</td><td>❌</td></tr>
      <tr><td>Anúncios</td><td>Nenhum</td><td>No plano grátis</td></tr>
      <tr><td>Postar em público / marcar um bot</td><td>Nunca é preciso</td><td>No método do bot</td></tr>
      <tr><td>Alertas de autores e arquivamento automático</td><td>❌ Ainda não</td><td>✅ Premium</td></tr>
      <tr><td>Código aberto</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>Conferido nas páginas <a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a> e
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">Help</a> do Thread Reader App em setembro de 2026. Os recursos mudam — avise a gente no
  <a href="${GITHUB}/issues" rel="noopener">GitHub</a> se algo estiver desatualizado.</small></p>
</section>

<section>
  <h2>Trocar leva dez segundos</h2>
  ${steps([
    '<strong>Copie o link</strong> de qualquer post da thread — não precisa procurar o primeiro.',
    '<strong>Cole aqui em cima</strong> e clique em Extrair. A thread inteira é reunida e numerada.',
    '<strong>Baixe</strong> em PDF, Markdown, EPUB ou texto — ou mande para o Obsidian.',
  ])}
</section>

<section>
  <h2>Quando o Thread Reader App ainda é a melhor escolha</h2>
  <p>Se você quer <strong>desenrolar uma thread para outras pessoas dentro do próprio X</strong> (respondendo com o bot para que todo mundo na conversa receba um
  link fácil de ler), ou quer <strong>alertas e arquivos automáticos</strong> dos seus autores favoritos, o Thread Reader App faz isso e o
  Xtracticle não. Muita gente usa os dois: o Thread Reader App para ler na hora e o Xtracticle para guardar uma cópia.</p>
</section>

${shortcuts('pt')}`,
  faq: [
    { q: 'O Xtracticle é grátis mesmo?', a: 'Sim. Todos os formatos — PDF, Markdown, EPUB, ZIP e texto — são grátis, sem anúncios, sem login e sem limite de uso. O código é aberto.' },
    { q: 'O Xtracticle baixa artigos do X?', a: 'Sim. O Xtracticle converte os artigos longos do X com títulos, listas, links, imagens e vídeos. Essa é uma das principais diferenças em relação ao Thread Reader App.' },
    { q: 'Preciso marcar um bot?', a: 'Não. Cole o link no Xtracticle; nada é postado no X.' },
    { q: 'Posso importar meu arquivo do Thread Reader App?', a: 'Não diretamente. Você pode colar os links originais do X (até 20 por vez no Modo em lote) para recriá-los como arquivos Markdown.' },
  ],
};

export const PAGES_PT: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];
