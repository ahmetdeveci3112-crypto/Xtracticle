import { GITHUB } from '../../blocks';
import type { ProCopy } from '../../pro-page';

/** Brazilian Portuguese copy of the /pro page ("você"). */
export const PRO_PT: ProCopy = {
  title: 'Xtracticle Pro — Arquivos completos, CSV, lotes de 200 links, chave de API | Xtracticle',
  description:
    'Xtracticle Pro: todos os posts arquivados de uma conta com exportação em CSV, lotes de 200 links, uma chave pessoal de MCP/API com cota maior e PDFs sem linha de crédito. US$ 5/mês, US$ 36/ano ou US$ 59 uma única vez.',
  h1: 'Xtracticle Pro',
  sub: 'Tudo o que é básico continua grátis. O Pro adiciona os recursos pesados e paga os servidores: sem conta, só uma chave de licença.',
  nav: 'Pro',
  pitch:
    'O Xtracticle é gratuito, não tem anúncios e não pede login, e isso não vai mudar. O Pro existe para as poucas tarefas caras de rodar: ' +
    'arquivos inteiros, lotes grandes e assistentes de IA que leem o X o dia todo. Comprá-lo mantém a ferramenta gratuita de graça.',
  featuresH2: 'O que o Pro adiciona',
  features: [
    '<strong>A lista completa de posts arquivados</strong> no <a href="/pt/localizador-de-tweets-apagados">localizador de tweets apagados</a>: todos os posts que a Wayback Machine guarda de uma conta (até 1.500), não só os 50 mais recentes, com <strong>exportação em CSV</strong>.',
    '<strong>Modo em lote com até 200 links</strong> em um único ZIP, em vez de 20.',
    '<strong>Uma chave pessoal de MCP / API</strong>: envie sua chave de licença como <code>Authorization: Bearer</code> ao <a href="/pt/servidor-mcp">servidor MCP</a> e à API de Markdown, e os limites de requisições do plano gratuito deixam de valer para você.',
    '<strong>Sem a linha “Salvo com Xtracticle”</strong> nos PDFs e EPUBs que você exportar.',
    '<strong>Acesso antecipado às novidades</strong>: os usuários Pro recebem primeiro, e os pedidos deles definem o roteiro.',
  ],
  pricingH2: 'Preços',
  monthly: 'Mensal',
  yearly: 'Anual',
  lifetime: 'Vitalício',
  perMonth: '/ mês',
  perYear: '/ ano',
  once: 'pagamento único',
  monthlyNote: 'Cancele quando quiser.',
  yearlyNote: 'Dá US$ 3 por mês: 40% de desconto.',
  lifetimeNote: 'Preço de lançamento para os 100 primeiros compradores. Pague uma vez e fique com ele para sempre.',
  buy: 'Assinar o Pro',
  soon: 'O Pro está quase pronto. As vendas abrem em alguns dias; até lá, tudo nesta página continua grátis.',
  checkoutHint:
    'Os pagamentos são processados pela <a href="https://gumroad.com" rel="noopener">Gumroad</a> (cartão, Apple Pay, Google Pay). Sua chave de licença aparece na página do recibo logo após o pagamento e também chega por e-mail da Gumroad; nenhuma conta é criada no Xtracticle.',
  keyH2: 'Já tem uma chave? Digite aqui',
  keyIntro: 'Cole a chave de licença do seu recibo da Gumroad (na página após o pagamento ou no e-mail). O Pro fica ativo neste navegador; repita em cada dispositivo que você usa.',
  keyLabel: 'Chave de licença',
  activate: 'Ativar',
  msgWorking: 'Verificando a chave…',
  msgOk: 'O Pro está ativo neste navegador. Aproveite!',
  msgAlready: 'O Pro já está ativo neste navegador.',
  msgInvalid: 'Esta chave não foi reconhecida. Confira se há erros de digitação ou se a assinatura terminou.',
  msgLimit: 'Esta chave já foi ativada vezes demais. Se você é o comprador, fale conosco pelo GitHub ou com @DvciAhmet no X e nós a redefinimos.',
  msgUpstream: 'O servidor de licenças não respondeu. Tente novamente em um minuto.',
  msgUnavailable: 'O Pro ainda não abriu. Volte em alguns dias.',
  msgRate: 'Muitas tentativas. Aguarde alguns segundos e tente de novo.',
  msgNetwork: 'Erro de rede: verifique sua conexão e tente novamente.',
  success: 'Pagamento recebido, obrigado! Sua chave de licença está no recibo da Gumroad e no e-mail da Gumroad. Cole-a abaixo para ativar o Pro.',
  faq: [
    { q: 'Como recebo minha chave de licença?', a: 'Logo após o pagamento, a Gumroad mostra sua chave de licença na página do recibo e a envia por e-mail (ela também aparece na página de download do produto na Gumroad). Cole a chave no formulário desta página e o Pro fica ativo nesse navegador.' },
    { q: 'Preciso de uma conta?', a: 'Não. O Xtracticle não tem contas. A chave é a única coisa que verificamos; ela fica guardada criptografada em um cookie no seu dispositivo por períodos de 30 dias e se renova sozinha enquanto seu plano estiver ativo.' },
    { q: 'Em quantos dispositivos uma chave funciona?', a: 'Em todos os dispositivos que você usa: digite a mesma chave em cada navegador. A chave é verificada uma vez por dia, então continua funcionando enquanto seu plano estiver ativo.' },
    { q: 'Posso cancelar?', a: 'Sim, a qualquer momento, pelo link “Manage membership” (gerenciar assinatura) no recibo ou no e-mail de assinatura da Gumroad. O Pro continua ativo até o fim do período pago. O plano vitalício é um pagamento único: não há nada a cancelar.' },
    { q: 'Tem reembolso?', a: 'Sim: 14 dias, sem perguntas. Abra uma issue no GitHub ou mande mensagem para @DvciAhmet no X e o pagamento é devolvido.' },
    { q: 'O Pro muda o que os usuários gratuitos recebem?', a: 'Não. Posts avulsos, threads, artigos, todos os formatos de exportação, os primeiros 50 posts arquivados e os lotes de 20 continuam grátis, sem anúncios e sem login.' },
    { q: 'Onde tiro dúvidas?', a: `Abra uma issue no GitHub (${GITHUB.replace('https://', '')}) ou mande uma mensagem para @DvciAhmet no X.` },
  ],
};
