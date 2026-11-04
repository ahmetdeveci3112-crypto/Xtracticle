import { GITHUB } from '../../blocks';
import type { ProCopy } from '../../pro-page';

/** Spanish copy of the /pro page ("tú"). */
export const PRO_ES: ProCopy = {
  title: 'Xtracticle Pro — Archivos completos, CSV, lotes de 200 enlaces, clave de API | Xtracticle',
  description:
    'Xtracticle Pro: todos los posts archivados de una cuenta con exportación a CSV, lotes de 200 enlaces, una clave personal de MCP/API con más cuota y PDF sin línea de crédito. 5 $/mes, 36 $/año o 59 $ una sola vez.',
  h1: 'Xtracticle Pro',
  sub: 'Todo lo básico sigue siendo gratis. Pro añade las funciones pesadas y paga los servidores: sin cuenta, solo una clave de licencia.',
  nav: 'Pro',
  pitch:
    'Xtracticle es gratis, no tiene anuncios y no pide iniciar sesión, y eso no va a cambiar. Pro es para las pocas tareas que cuestan caro de ejecutar: ' +
    'archivos completos, lotes grandes y asistentes de IA que leen X todo el día. Comprarlo mantiene gratis la herramienta gratuita.',
  featuresH2: 'Qué añade Pro',
  features: [
    '<strong>La lista completa de posts archivados</strong> en el <a href="/es/buscador-de-tweets-borrados">buscador de tweets borrados</a>: todos los posts que Wayback Machine guarda de una cuenta (hasta 1500), no solo los 50 más recientes, con <strong>exportación a CSV</strong>.',
    '<strong>Modo por lotes con hasta 200 enlaces</strong> en un solo ZIP, en vez de 20.',
    '<strong>Una clave personal de MCP / API</strong>: envía tu clave de licencia como <code>Authorization: Bearer</code> al <a href="/es/servidor-mcp">servidor MCP</a> y a la API de Markdown, y los límites de peticiones del plan gratuito dejan de aplicarse a ti.',
    '<strong>Sin la línea «Guardado con Xtracticle»</strong> en los PDF y EPUB que exportes.',
    '<strong>Acceso anticipado a las novedades</strong>: los usuarios Pro las reciben primero y sus peticiones marcan la hoja de ruta.',
  ],
  pricingH2: 'Precios',
  monthly: 'Mensual',
  yearly: 'Anual',
  lifetime: 'De por vida',
  perMonth: '/ mes',
  perYear: '/ año',
  once: 'pago único',
  monthlyNote: 'Cancela cuando quieras.',
  yearlyNote: 'Sale a 3 $ al mes: un 40 % menos.',
  lifetimeNote: 'Precio de lanzamiento para los primeros 100 compradores. Paga una vez y quédatelo para siempre.',
  buy: 'Pasar a Pro',
  soon: 'Pro está casi listo. La compra se abre en unos días; hasta entonces todo lo de esta página sigue siendo gratis.',
  checkoutHint:
    'Los pagos los gestiona <a href="https://gumroad.com" rel="noopener">Gumroad</a> (tarjeta, Apple Pay, Google Pay). Tu clave de licencia aparece en la página del recibo justo después de pagar y también te llega por correo desde Gumroad; no se crea ninguna cuenta en Xtracticle.',
  keyH2: '¿Ya tienes una clave? Introdúcela aquí',
  keyIntro: 'Pega la clave de licencia de tu recibo de Gumroad (en la página posterior al pago o en el correo). Pro se activa en este navegador; repítelo en cada dispositivo que uses.',
  keyLabel: 'Clave de licencia',
  activate: 'Activar',
  msgWorking: 'Comprobando la clave…',
  msgOk: 'Pro está activo en este navegador. ¡A disfrutarlo!',
  msgAlready: 'Pro ya está activo en este navegador.',
  msgInvalid: 'No reconocemos esta clave. Revisa que no haya erratas o si la suscripción ha terminado.',
  msgLimit: 'Esta clave se ha activado demasiadas veces. Si eres el comprador, escríbenos por GitHub o a @DvciAhmet en X y la restableceremos.',
  msgUpstream: 'El servidor de licencias no respondió. Inténtalo de nuevo en un minuto.',
  msgUnavailable: 'Pro aún no está abierto. Vuelve a pasarte en unos días.',
  msgRate: 'Demasiados intentos. Espera unos segundos y vuelve a intentarlo.',
  msgNetwork: 'Error de red: comprueba tu conexión y vuelve a intentarlo.',
  success: 'Pago recibido, ¡gracias! Tu clave de licencia está en tu recibo de Gumroad y en el correo de Gumroad. Pégala abajo para activar Pro.',
  faq: [
    { q: '¿Cómo recibo mi clave de licencia?', a: 'Justo después del pago, Gumroad muestra tu clave de licencia en la página del recibo y te la envía por correo (también aparece en la página de descarga del producto en Gumroad). Pégala en el formulario de esta página y Pro queda activo en ese navegador.' },
    { q: '¿Necesito una cuenta?', a: 'No. Xtracticle no tiene cuentas. Lo único que comprobamos es la clave; se guarda cifrada en una cookie de tu dispositivo durante 30 días cada vez y se renueva sola mientras tu plan esté activo.' },
    { q: '¿En cuántos dispositivos funciona una clave?', a: 'En todos los dispositivos que uses: introduce la misma clave en cada navegador. La clave se comprueba una vez al día, así que sigue funcionando mientras tu plan esté activo.' },
    { q: '¿Puedo cancelar?', a: 'Sí, cuando quieras, desde el enlace «Manage membership» (gestionar suscripción) de tu recibo o del correo de suscripción de Gumroad. Pro sigue activo hasta el final del periodo pagado. El plan de por vida es un pago único: no hay nada que cancelar.' },
    { q: '¿Hay reembolso?', a: 'Sí: 14 días, sin preguntas. Abre un issue en GitHub o escribe a @DvciAhmet en X y te devolvemos el pago.' },
    { q: '¿Pro cambia lo que reciben los usuarios gratuitos?', a: 'No. Los posts sueltos, los hilos, los artículos, todos los formatos de exportación, los primeros 50 posts archivados y los lotes de 20 siguen siendo gratis, sin anuncios y sin iniciar sesión.' },
    { q: '¿Dónde pregunto mis dudas?', a: `Abre un issue en GitHub (${GITHUB.replace('https://', '')}) o envía un mensaje a @DvciAhmet en X.` },
  ],
};
