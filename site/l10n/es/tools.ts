import { GITHUB, privacy, samplePdfFigure, shortcuts, steps, type SitePage } from '../../blocks';

/* ─── Desenrollar hilo de Twitter ─── */

const unroll: SitePage = {
  id: 'es-unroll',
  group: 'unroll',
  path: '/es/desenrollar-hilo-de-twitter',
  file: 'es/desenrollar-hilo-de-twitter.html',
  lang: 'es',
  title: 'Desenrollar hilo de Twitter: léelo en una página | Xtracticle',
  description:
    'Desenrolla cualquier hilo de Twitter/X al instante: pega un post y léelo en una sola página, sin bot y sin registro. Luego guárdalo en PDF, Markdown o EPUB.',
  h1: 'Desenrollar hilo de Twitter',
  sub: 'Lee cualquier hilo de X (Twitter) como una sola página limpia. Pega el enlace de cualquier post del hilo, sin bots y sin iniciar sesión.',
  primary: 'md',
  nav: 'Desenrollar hilo',
  sections: `
<section>
  <p><strong>Xtracticle es una herramienta gratuita para desenrollar un hilo de Twitter (X):</strong> pega el enlace de cualquier post
  del hilo y toda la cadena del autor aparece debajo como una página continua y numerada, lista para leer. Guardarlo es opcional: no
  hay cuenta, no hay anuncios y nadie recibe una notificación.</p>
  <h2>Cómo desenrollar un hilo en tres pasos</h2>
  ${steps([
    '<strong>Copia el enlace</strong> de cualquier post del hilo (el primero, uno intermedio o el último) con Compartir → Copiar enlace.',
    '<strong>Pégalo arriba</strong> y pulsa Extraer. El hilo se abre como una sola página, en orden.',
    '<strong>Léelo aquí</strong>, pulsa <em>Escuchar</em> para oírlo en voz alta o descárgalo en Markdown, PDF, EPUB o texto.',
  ])}
</section>

<section>
  <h2>Qué significa "desenrollar" aquí</h2>
  <p>Un hilo es una cadena de posts en la que el autor se va respondiendo a sí mismo. Leerlo en X implica cargar cada post, saltarte las
  respuestas de otras personas y perder el hilo (nunca mejor dicho). Desenrollar une los posts del autor en un solo documento numerado
  (<code>1/12</code>, <code>2/12</code>…) y conserva los saltos de línea, las fotos, los posts citados y las miniaturas de vídeo.</p>
  <ul>
    <li><strong>Sirve cualquier post.</strong> No necesitas el primero; pega el que tengas.</li>
    <li><strong>Solo los posts del autor.</strong> Las respuestas de otras personas no se incluyen.</li>
    <li><strong>Muchos tipos de enlace.</strong> Funcionan enlaces de x.com, twitter.com, fxtwitter, vxtwitter, nitter y xcancel, enlaces <code>/i/web/status/</code> y el ID del post a secas.</li>
    <li><strong>Solo hilos públicos.</strong> Las cuentas privadas no se pueden leer.</li>
  </ul>
</section>

<section>
  <h2>Desenrollar sin mencionar a un bot</h2>
  <p>La forma clásica de desenrollar un hilo es responder debajo con <em>@threadreaderapp unroll</em> y esperar. Ese método tiene ventajas
  reales, como una página compartible que otras personas pueden encontrar, pero también costos que conviene conocer:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Mencionar a un bot</th><th>Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Velocidad</td><td>Esperar hasta que el bot responda</td><td>Al instante, justo después de pegar</td></tr>
      <tr><td>Visibilidad</td><td>Tu solicitud es una respuesta pública</td><td>No se publica nada; es privado</td></tr>
      <tr><td>Cuenta</td><td>Hace falta una cuenta de X para mencionar al bot</td><td>Sin iniciar sesión</td></tr>
      <tr><td>Formatos</td><td>Una página web</td><td>Página, PDF, Markdown, EPUB, texto, ZIP</td></tr>
      <tr><td>Página pública para otros</td><td>Sí, una URL compartida</td><td>No; compartes el archivo o el enlace</td></tr>
    </tbody>
  </table></div>
  <p>Consulta la <a href="/es/alternativa-a-thread-reader-app">comparación completa y honesta con Thread Reader App</a>.</p>
</section>

<section>
  <h2>Léelo y luego consérvalo</h2>
  <p>Desenrollar sirve para leer, pero los hilos no duran para siempre: los autores borran posts y las cuentas pasan a privadas. Cuando
  ya tienes el hilo en pantalla, puedes guardar una copia en el formato que prefieras.</p>
  <ul>
    <li><a href="/es/hilo-de-twitter-a-pdf">Hilo a PDF</a>: un documento numerado e imprimible, con fotos, enlace a la fuente y números de página. El PDF se genera como imagen, así que su texto no se puede seleccionar.</li>
    <li><a href="/es/articulo-de-x-a-markdown">Markdown</a>: texto seleccionable con front-matter YAML opcional, para Obsidian, Notion o un asistente de IA.</li>
    <li><a href="/es/articulo-de-x-a-epub-kindle">EPUB 3</a>: un libro electrónico adaptable para tu lector.</li>
    <li><strong>ZIP con imágenes</strong>: Markdown más todas las imágenes guardadas en local.</li>
    <li><strong>Texto plano</strong> o exportación a Obsidian con un clic.</li>
  </ul>
  <p>¿Tienes muchos hilos? Activa el Modo lote, pega hasta 20 enlaces y recibe un solo ZIP con archivos Markdown.</p>
  <p>¿Buscas un artículo de X en lugar de un hilo? Usa la página de <a href="/es/articulo-de-x-a-pdf">artículo de X a PDF</a>. La herramienta también está en la <a href="/es/">página principal</a>, y las <a href="/es/guias">guías</a> cubren flujos de trabajo habituales.</p>
</section>

${shortcuts('es')}

${privacy('es')}`,
  faq: [
    { q: '¿Cómo desenrollo un hilo de Twitter?', a: 'Copia el enlace de cualquier post del hilo, pégalo en Xtracticle y pulsa Extraer. El hilo completo se abre como una página numerada.' },
    { q: '¿Necesito el primer post del hilo?', a: 'No. Sirve el primero, uno intermedio o el último. Xtracticle encuentra el resto del hilo del autor.' },
    { q: '¿Tengo que etiquetar a un bot como @threadreaderapp?', a: 'No. No se publica ni se menciona nada. Pegas un enlace y ves el resultado al instante, sin cuenta.' },
    { q: '¿Se incluyen las respuestas de otras personas?', a: 'No. Solo se unen, en orden, los posts del propio autor dentro del hilo.' },
    { q: '¿Puedo escuchar un hilo en lugar de leerlo?', a: 'Sí. Usa el botón Escuchar para que se lea en voz alta.' },
    { q: '¿Puedo guardar después el hilo desenrollado?', a: 'Sí, en PDF, Markdown (con front-matter YAML opcional), EPUB, texto plano o un ZIP con imágenes. El Modo lote acepta hasta 20 enlaces y devuelve un solo ZIP con archivos Markdown.' },
    { q: '¿Funciona con cuentas privadas?', a: 'No. Solo se pueden desenrollar hilos públicos.' },
  ],
};

/* ─── Tweet a PDF ─── */

const tweetpdf: SitePage = {
  id: 'es-tweetpdf',
  group: 'tweetpdf',
  path: '/es/tweet-a-pdf',
  file: 'es/tweet-a-pdf.html',
  lang: 'es',
  title: 'Tweet a PDF: guarda cualquier post de X en PDF | Xtracticle',
  description:
    'Guarda cualquier tweet o post de X como PDF A4 limpio, con fotos, post citado, fecha y enlace a la fuente. Gratis, sin registro ni marca de agua; en móvil y PC.',
  h1: 'Tweet a PDF',
  sub: 'Guarda cualquier post de X (Twitter) como un PDF A4 limpio, con texto, fotos, post citado, fecha y enlace a la fuente.',
  primary: 'pdf',
  nav: 'Tweet a PDF',
  sections: `
<section>
  <p><strong>Xtracticle es un conversor gratuito de tweet a PDF:</strong> pega el enlace de un solo post de X (Twitter) y descárgalo como un
  PDF A4 ordenado, sin capturas de pantalla, sin cuenta y sin marca de agua. Funciona en iPhone, Android y computadora.</p>
  <h2>Guardar un tweet como PDF en tres pasos</h2>
  ${steps([
    '<strong>Copia el enlace del post</strong> (Compartir → Copiar enlace). Sirven los enlaces de x.com, twitter.com, fxtwitter, vxtwitter, nitter y xcancel, y también el ID del post a secas.',
    '<strong>Pégalo arriba</strong> y pulsa Extraer.',
    '<strong>Haz clic en PDF</strong>: el archivo se descarga de inmediato.',
  ])}
</section>

<section>
  <h2>Qué contiene el PDF</h2>
  <ul>
    <li><strong>El texto completo</strong>, con los saltos de línea originales del autor.</li>
    <li><strong>Las fotos</strong> en su lugar, ajustadas a la página.</li>
    <li><strong>El post citado</strong>, si el tweet cita otro.</li>
    <li><strong>Autor y fecha</strong> en la parte superior.</li>
    <li><strong>Un enlace a la fuente</strong> en el que se puede hacer clic para volver al post original, y números de página.</li>
    <li><strong>Los vídeos como miniaturas con enlace</strong>, porque un PDF no puede reproducir vídeo.</li>
  </ul>
  <p>La página es una hoja A4 limpia: sin la barra lateral de X, sin botones, sin tendencias y sin respuestas.</p>
  ${samplePdfFigure('es')}
  <p>El PDF se genera como imagen: así el diseño queda exacto, pero el texto no se puede seleccionar. Si necesitas buscar o copiar el
  texto, exporta en su lugar <a href="/es/articulo-de-x-a-markdown">Markdown</a> o <a href="/es/articulo-de-x-a-epub-kindle">EPUB</a>.</p>
  <p>¿Necesitas las fotos del post y no una página? El <a href="/es/descargar-imagenes-de-twitter">descargador de imágenes de Twitter</a> guarda
  todas las fotos del post en calidad original, en un solo ZIP.</p>
</section>

<section>
  <h2>¿Por qué guardar un tweet como PDF?</h2>
  <ul>
    <li><strong>Comprobantes y confirmaciones</strong>: una declaración pública de una empresa sobre un reembolso, un retraso o una promesa.</li>
    <li><strong>Anuncios</strong>: notas de versión, ofertas de empleo, detalles de eventos y cambios de políticas que quieras conservar.</li>
    <li><strong>Pruebas y citas</strong>: una copia con fecha y enlace a la fuente, más fácil de entregar que una captura recortada.</li>
    <li><strong>Notas de investigación</strong>: archiva el post junto a tus fuentes, con autor y fecha incluidos.</li>
  </ul>
  <p>Ten en cuenta que un PDF es un registro de lo que decía el post cuando lo guardaste. No es un documento con certificación legal.</p>
</section>

<section>
  <h2>Posts, hilos y artículos</h2>
  <h3>Un tweet suelto</h3>
  <p>Es esta página. Un enlace, un PDF.</p>
  <h3>Un hilo</h3>
  <p>Si el post forma parte de un hilo, usa la página de <a href="/es/hilo-de-twitter-a-pdf">hilo de Twitter a PDF</a>. Pega cualquier post
  del hilo y todos los posts del autor se unen en un único PDF numerado. Si primero quieres leer el hilo en pantalla, prueba
  <a href="/es/desenrollar-hilo-de-twitter">desenrollar hilo de Twitter</a>.</p>
  <h3>Un artículo largo</h3>
  <p>Los artículos de X conservan sus títulos, listas e imágenes. Usa <a href="/es/articulo-de-x-a-pdf">artículo de X a PDF</a>.</p>
</section>

<section>
  <h2>Posts eliminados</h2>
  <p>Xtracticle lee posts públicos que siguen en línea. Si un post ya se eliminó, o su cuenta pasó a privada, no se puede guardar
  después. Por eso conviene exportar una copia mientras está activo. Lee <a href="/es/guias/recuperar-tweets-borrados">qué se puede y qué no se puede recuperar</a>.
  ¿Necesitas varios posts? El Modo lote acepta hasta 20 enlaces y devuelve un solo ZIP con archivos Markdown. La herramienta está en la
  <a href="/es/">página principal</a>, y las <a href="/es/guias">guías</a> tienen más flujos de trabajo.</p>
</section>

${shortcuts('es')}

${privacy('es')}`,
  faq: [
    { q: '¿Cómo guardo un tweet como PDF?', a: 'Copia el enlace del post (Compartir → Copiar enlace), pégalo en Xtracticle, pulsa Extraer y haz clic en PDF.' },
    { q: '¿El PDF incluye las fotos y el post citado?', a: 'Sí. Se incluyen las fotos y el post que se cita. Los vídeos aparecen como una miniatura con enlace al vídeo.' },
    { q: '¿El conversor de tweet a PDF es gratis?', a: 'Sí. Es gratuito, no requiere iniciar sesión y no añade marca de agua.' },
    { q: '¿Puedo seleccionar o buscar el texto del PDF?', a: 'No. El PDF se genera como imagen para que el diseño quede exacto. Si necesitas texto seleccionable, usa la exportación a Markdown o EPUB.' },
    { q: '¿Puedo guardar un tweet que ya se borró?', a: 'No. Solo se pueden guardar posts públicos que siguen en línea, así que exporta una copia antes de que desaparezca.' },
    { q: '¿Y los hilos y los artículos largos?', a: 'Para hilos usa la página de hilo de X a PDF, que une todo el hilo del autor. Para artículos largos usa artículo de X a PDF.' },
    { q: '¿Puedo guardar varios tweets a la vez?', a: 'Sí. El Modo lote acepta hasta 20 enlaces y los devuelve como archivos Markdown en un ZIP. Para PDF, guarda cada post por separado.' },
  ],
};

/* ─── Servidor MCP ─── */

const ENDPOINT = 'https://xtracticle.com/mcp';
const CURSOR_LINK = `cursor://anysphere.cursor-deeplink/mcp/install?name=xtracticle&config=${btoa(JSON.stringify({ url: ENDPOINT }))}`;
const SAMPLE_ID = '1765884209527394325';

const code = (s: string) => `<pre><code>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

const mcp: SitePage = {
  id: 'es-mcp',
  group: 'mcp',
  path: '/es/servidor-mcp',
  file: 'es/servidor-mcp.html',
  lang: 'es',
  title: 'Servidor MCP para X: lee artículos e hilos con IA | Xtracticle',
  description:
    'Servidor MCP remoto y gratuito para que Claude, ChatGPT, Cursor y otros asistentes de IA lean artículos, hilos y posts de X (Twitter) en Markdown. Sin API key.',
  h1: 'Servidor MCP para artículos e hilos de X',
  sub: 'Deja que tu asistente de IA lea cualquier post, hilo o artículo público de X (Twitter) como Markdown limpio: gratis y sin API key.',
  primary: 'md',
  nav: 'Servidor MCP',
  sections: `
<section>
  <p><strong>Los asistentes de IA no pueden abrir enlaces de X</strong>: la página necesita JavaScript y, a menudo, iniciar sesión. El
  servidor MCP de Xtracticle lo resuelve: añade una URL a Claude, ChatGPT, Cursor o cualquier otro cliente MCP y pega un enlace de X
  en el chat.</p>
  <ul>
    <li><strong>Endpoint:</strong> <code>${ENDPOINT}</code> (Streamable HTTP, sin autenticación)</li>
    <li><strong>Herramienta:</strong> <code>read_x_post</code>, que devuelve en Markdown un post, un hilo completo del autor (desde cualquiera de sus posts) o un artículo de X</li>
    <li><strong>Gratis y de código abierto</strong>: el servidor forma parte del <a href="${GITHUB}" rel="noopener">repositorio de Xtracticle</a></li>
  </ul>
</section>

<section>
  <h2>Añádelo a tu asistente de IA</h2>
  <h3>Claude Code</h3>
  ${code(`claude mcp add --transport http xtracticle ${ENDPOINT}`)}
  <h3>Claude (escritorio y web)</h3>
  <p>Abre <em>Settings → Connectors → Add custom connector</em>, ponle el nombre <em>Xtracticle</em> y pega <code>${ENDPOINT}</code>.</p>
  <h3>ChatGPT</h3>
  <p>Con el modo desarrollador activado, abre <em>Settings → Connectors → Create</em>, pega <code>${ENDPOINT}</code> y elige <em>No authentication</em>.</p>
  <h3>Cursor</h3>
  <p><a href="${CURSOR_LINK}">Añadir a Cursor</a>, o pon esto en <code>~/.cursor/mcp.json</code>:</p>
  ${code(`{
  "mcpServers": {
    "xtracticle": { "url": "${ENDPOINT}" }
  }
}`)}
  <h3>VS Code (GitHub Copilot)</h3>
  <p>Añade esto a <code>.vscode/mcp.json</code>:</p>
  ${code(`{
  "servers": {
    "xtracticle": { "type": "http", "url": "${ENDPOINT}" }
  }
}`)}
  <h3>Otros clientes</h3>
  <p>Sirve cualquier cliente que admita servidores MCP remotos mediante Streamable HTTP. Los clientes que solo admiten servidores locales (stdio) pueden usar un puente:</p>
  ${code(`npx -y mcp-remote ${ENDPOINT}`)}
</section>

<section>
  <h2>La herramienta read_x_post</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Argumento</th><th>Valor por defecto</th><th>Qué hace</th></tr></thead>
    <tbody>
      <tr><td><code>url</code></td><td>—</td><td>Enlace del post (x.com, twitter.com, fxtwitter, nitter…) o ID numérico del post. Sirve cualquier post de un hilo.</td></tr>
      <tr><td><code>format</code></td><td><code>markdown</code></td><td><code>markdown</code> o <code>text</code></td></tr>
      <tr><td><code>include_thread</code></td><td><code>true</code></td><td>Desenrolla el hilo del propio autor; con <code>false</code> devuelve solo el post enlazado</td></tr>
      <tr><td><code>front_matter</code></td><td><code>false</code></td><td>Antepone front-matter YAML (título, autor, fuente, fecha, tipo)</td></tr>
      <tr><td><code>max_chars</code> / <code>offset</code></td><td>40.000 / 0</td><td>Recorre por páginas los documentos muy largos</td></tr>
    </tbody>
  </table></div>
  <p>El resultado es el Markdown (con título, autor, fecha y enlace a la fuente al principio) más metadatos: tipo (artículo, hilo o post),
  número de palabras, tiempo de lectura, URL de las imágenes, el enlace original y un enlace de descarga donde el usuario puede guardar
  el post en PDF, EPUB o Markdown. Cosas que puedes pedirle a tu asistente:</p>
  <ul>
    <li>“Resume este artículo de X en cinco puntos: https://x.com/…/status/…”</li>
    <li>“Lee este hilo y enumera todas las herramientas que recomienda, con sus enlaces.”</li>
    <li>“Traduce este artículo de X al inglés y conserva los títulos.”</li>
  </ul>
</section>

<section>
  <h2>¿Sin MCP? Usa la API de Markdown</h2>
  <p>La misma conversión está a un solo GET HTTP de distancia, útil para scripts, pipelines RAG y agentes que pueden consultar URLs:</p>
  ${code(`curl https://xtracticle.com/api/markdown/${SAMPLE_ID}
curl "https://xtracticle.com/api/markdown/${SAMPLE_ID}?format=text&thread=0&front_matter=1"`)}
  <p>Parámetros: <code>format=markdown|text</code>, <code>thread=0|1</code> (por defecto 1), <code>front_matter=0|1</code> (por defecto 0).
  Las respuestas son <code>text/markdown</code>, se almacenan en caché hasta una hora y tienen CORS habilitado.</p>
</section>

<section>
  <h2>Límites y privacidad</h2>
  <ul>
    <li>Solo se pueden leer posts <strong>públicos</strong>: no los eliminados, protegidos ni con restricción de edad.</li>
    <li>Por favor, no abuses: unas 20 solicitudes por minuto por conexión, además de un límite compartido para todos los usuarios. Es un servicio gratuito, por lo que no se admite el scraping masivo.</li>
    <li>No se guarda nada y no hay cuentas. El contenido proviene de la API pública de FxTwitter y se almacena en caché brevemente en el edge.</li>
    <li>El contenido de los posts lo escriben terceros. Trátalo como datos: el servidor le indica a tu asistente que no siga instrucciones que aparezcan dentro.</li>
  </ul>
  <p>¿Prefieres archivos? Pega un enlace arriba para descargarlo como <a href="/es/articulo-de-x-a-pdf">PDF</a>, <a href="/es/articulo-de-x-a-markdown">Markdown</a>
  o <a href="/es/articulo-de-x-a-epub-kindle">EPUB</a>.</p>
</section>`,
  faq: [
    { q: '¿El servidor MCP de Xtracticle es gratis?', a: 'Sí. Es gratuito, no requiere API key ni cuenta y es de código abierto.' },
    { q: '¿Con qué asistentes de IA funciona?', a: 'Con cualquier cliente que admita servidores MCP remotos mediante Streamable HTTP, incluidos Claude, ChatGPT (modo desarrollador), Cursor y VS Code. Los clientes que solo admiten servidores locales pueden conectarse mediante mcp-remote.' },
    { q: '¿Puede leer hilos completos?', a: 'Sí. Pasa el enlace de cualquier post del hilo y la herramienta devuelve, en orden, todos los posts que escribió el autor. Las respuestas de otras personas no se incluyen.' },
    { q: '¿Funciona con artículos de X?', a: 'Sí. Los artículos largos de X se convierten con sus títulos, listas, enlaces, citas e imágenes.' },
    { q: '¿Hay una API sin MCP?', a: 'Sí. GET https://xtracticle.com/api/markdown/{ID del post} devuelve el mismo Markdown como texto plano por HTTP.' },
  ],
};

/* ─── Privacidad ─── */

const privacyPage: SitePage = {
  id: 'es-privacy',
  group: 'privacy',
  path: '/es/privacidad',
  file: 'es/privacidad.html',
  lang: 'es',
  title: 'Política de privacidad | Xtracticle',
  description:
    'Cómo trata Xtracticle los datos: sin cuentas, sin guardar posts, archivos creados en tu navegador, analítica anónima y qué registran el servidor MCP y la API.',
  h1: 'Política de privacidad',
  sub: 'Resumen: sin cuentas, sin subidas de archivos y no guardamos los posts que descargas.',
  primary: 'pdf',
  nav: 'Privacidad',
  sections: `
<section>
  <p><em>Última actualización: 3 de octubre de 2026.</em> Esta política abarca xtracticle.com, su API de Markdown (<code>/api/markdown/…</code>)
  y su servidor MCP (<code>/mcp</code>). Xtracticle es un proyecto gratuito y de código abierto; el
  <a href="${GITHUB}" rel="noopener">código fuente</a> muestra exactamente qué hace.</p>
</section>

<section>
  <h2>Lo que no recopilamos</h2>
  <ul>
    <li>Ni cuentas, ni inicios de sesión, ni correos electrónicos, ni datos de pago.</li>
    <li>Ninguna subida de archivos: los PDF, EPUB, ZIP y demás archivos se crean en tu navegador y nunca se nos envían.</li>
    <li>No vendemos ni compartimos datos personales y no usamos rastreadores publicitarios.</li>
  </ul>
</section>

<section>
  <h2>Contenido de los posts</h2>
  <p>Cuando pegas un enlace (o un asistente de IA llama al servidor MCP), obtenemos ese post <strong>público</strong> de X a través de la API
  de código abierto FxTwitter. Para que el servicio sea rápido y esté siempre disponible, los datos del post se almacenan en caché en la
  red edge de Cloudflare: el documento convertido hasta una hora y una copia de respaldo hasta siete días. Las copias en caché no están
  vinculadas a ti y caducan automáticamente. Los posts privados, protegidos y eliminados no se pueden obtener en absoluto. Cuando pegas un enlace
  de perfil, solo enviamos el nombre de la cuenta a la API CDX de Internet Archive para listar sus posts archivados; los resultados se guardan en caché
  hasta 30 días y no están vinculados a ti. Para listar los últimos posts de una cuenta y descargarlos en ZIP, obtenemos sus posts públicos recientes a través de la API de FxTwitter; la lista se guarda en caché hasta 15 minutos y no está vinculada a ti.</p>
</section>

<section>
  <h2>Analítica y registros</h2>
  <ul>
    <li><strong>Sitio web:</strong> Google Analytics cuenta vistas de página y eventos anónimos (por ejemplo, “PDF descargado” o el formato
    de exportación) para saber qué funciones se usan. Como en cualquier vista de página, ve la dirección de la página que abres, que en una
    página para compartir como <code>/usuario/status/123</code> incluye el enlace del post, pero no el contenido de los posts que descargas.</li>
    <li><strong>Servidor MCP y API:</strong> los registros de solicitudes de Cloudflare guardan datos técnicos de cada llamada (el ID del post,
    el tipo de documento, el tamaño y el tiempo de respuesta, y el user-agent del cliente) para depuración y prevención de abusos. Cloudflare
    también procesa las direcciones IP para aplicar límites de uso. Cloudflare conserva los registros durante un tiempo limitado y no se usan
    para identificarte.</li>
  </ul>
</section>

<section>
  <h2>Guardado en tu navegador</h2>
  <p>Tus enlaces recientes, el tema y el idioma elegidos se guardan únicamente en el almacenamiento local de tu navegador. Borra los datos
  del navegador para eliminarlos.</p>
</section>

<section>
  <h2>Terceros</h2>
  <ul>
    <li><strong>Cloudflare</strong> aloja el sitio, la API y el servidor MCP.</li>
    <li><strong>FxTwitter</strong> proporciona los datos públicos de los posts.</li>
    <li><strong>Google Analytics</strong> proporciona estadísticas de uso anónimas.</li>
    <li>Las imágenes de las vistas previas y las exportaciones se cargan desde los servidores de medios de X (pbs.twimg.com).</li>
  </ul>
</section>

<section>
  <h2>Contacto</h2>
  <p>Preguntas o solicitudes de eliminación: <a href="${GITHUB}/issues" rel="noopener">abre un issue en GitHub</a>.</p>
</section>`,
  faq: [],
};

/* ─── Buscador de tweets borrados ─── */

const deletedFinder: SitePage = {
  id: 'es-deleted-finder',
  group: 'deleted-finder',
  path: '/es/buscador-de-tweets-borrados',
  file: 'es/buscador-de-tweets-borrados.html',
  lang: 'es',
  title: 'Ver tweets borrados: buscador gratis, sin login | Xtracticle',
  description:
    'Pega el enlace de un perfil o un @usuario y buscamos en Wayback Machine las capturas de sus posts, también los borrados. Gratis y sin iniciar sesión.',
  h1: 'Buscador de tweets borrados',
  sub: 'Pega el enlace de un perfil de X (Twitter) o un @usuario, no el de un post, y verás las copias archivadas de los posts de esa cuenta en Wayback Machine.',
  primary: 'md',
  nav: 'Tweets borrados',
  sections: `
<section>
  <p><strong>El buscador de tweets borrados de Xtracticle busca en Wayback Machine los posts de una cuenta.</strong> Escribe un @usuario o pega
  el enlace del perfil y verás los posts de esa cuenta que guardó el Internet Archive, del más reciente al más antiguo, cada uno con el enlace
  a su captura. Si un post se borró de X después de que alguien lo archivara, esa captura es la forma de volver a verlo. Es gratis y no hace falta cuenta.</p>
  <h2>Cómo ver tweets borrados en tres pasos</h2>
  ${steps([
    '<strong>Indica la cuenta:</strong> escribe <code>@usuario</code> o pega el enlace del perfil (<code>x.com/usuario</code>). Usa el perfil, no el enlace de un post concreto.',
    '<strong>Pulsa Extraer.</strong> Xtracticle pide a Wayback Machine todos los posts de esa cuenta que tenga guardados. El archivo es lento, así que puede tardar hasta un minuto.',
    '<strong>Abre una captura.</strong> La lista muestra hasta 50 posts archivados, del más reciente al más antiguo, con su fecha. <em>Abrir captura</em> enseña la copia archivada y <em>Probar el post en X</em> comprueba si el post sigue publicado.',
  ])}
  <p><strong>¿Quieres pillar el próximo?</strong> El archivo solo tiene lo que alguien guardó. El <a href="/es/rastreador-de-tweets-borrados">rastreador de tweets borrados</a>
  vigila una cuenta cada hora y guarda el texto de cualquier post que borre a partir de ahora.</p>
</section>

<section>
  <h2>Qué puede encontrar y qué no</h2>
  <p>Un post borrado solo se puede ver si alguien hizo una copia antes de que desapareciera. Esta herramienta busca un tipo de copia, las capturas
  de Wayback Machine, y no esconde sus límites:</p>
  <ul>
    <li><strong>Encuentra posts archivados.</strong> Cualquier post de la cuenta que haya guardado Wayback Machine, siga publicado o se haya borrado después.</li>
    <li><strong>No encuentra lo que nadie archivó.</strong> Un post borrado antes de que alguien lo guardara se ha perdido. Ninguna herramienta puede recuperarlo, porque X ya no lo sirve.</li>
    <li><strong>No marca qué posts se borraron.</strong> X no lo indica. Usa <em>Probar el post en X</em>: si se abre, sigue en línea; si aparece como no encontrado, se borró o la cuenta pasó a ser privada.</li>
    <li><strong>Las cuentas privadas no se pueden leer.</strong> Los posts protegidos nunca fueron públicos, así que los archivos normalmente tampoco los tienen.</li>
    <li><strong>Las capturas varían.</strong> Las antiguas suelen conservar el texto; algunas de 2020 en adelante muestran una página de X vacía.</li>
    <li><strong>En cuentas muy activas la lista se recorta.</strong> Se muestran los 50 posts archivados más recientes y el total aparece encima.</li>
  </ul>
  <p>Si la cuenta sigue activa, el mismo panel tiene el botón <em>Descargar los últimos 20 posts (ZIP)</em>. Guarda los 20 posts públicos más
  recientes de la cuenta como archivos Markdown mientras siguen en línea, que es la única forma fiable de conservar un post para después.</p>
</section>

<section>
  <h2>¿Buscas un solo post borrado?</h2>
  <p>Si tienes el enlace del propio post (<code>x.com/usuario/status/…</code>), pégalo en su lugar. Cuando X ya no lo muestra, Xtracticle te ofrece
  búsquedas de ese post exacto en Wayback Machine y en archive.today con un clic, además de un acceso a los demás posts archivados de la cuenta.
  La búsqueda puede no dar resultados: los archivos solo guardan copias hechas antes del borrado. La
  <a href="/es/guias/encontrar-tweets-en-wayback-machine">guía de Wayback Machine</a> explica las búsquedas manuales paso a paso.</p>
</section>

<section>
  <h2>Un visor de tweets borrados para el archivo de Twitter</h2>
  <p>Cada enlace <em>Abrir captura</em> es un visor de ese tweet borrado: la página de Wayback Machine muestra el post tal como se veía en
  twitter.com o x.com cuando se capturó, con su texto y, a menudo, sus imágenes. Los posts anteriores a mayo de 2024 se abren en su captura de
  twitter.com y los posteriores en x.com, así que la misma búsqueda cubre los años de Twitter y los de X.</p>
  <ul>
    <li><strong>Buscar en el archivo de Twitter de una cuenta eliminada.</strong> El perfil de una cuenta desactivada o suspendida desaparece de X,
    pero sus posts archivados no. Escribe el antiguo @usuario: si Wayback Machine capturó sus posts, la lista sigue apareciendo.</li>
    <li><strong>¿Prefieres buscar por palabras o fechas?</strong> El <a href="/es/buscador-de-tweets">buscador de tweets</a> prepara una búsqueda en X o
    en Google de los posts antiguos de una cuenta por palabras y rango de fechas, junto a la misma lista del archivo.</li>
    <li><strong>Wayback Machine para X.</strong> Esta página es un atajo hacia ella. El sitio archive.org solo busca una URL cada vez,
    mientras que esta página lista todos los posts capturados de la cuenta.</li>
  </ul>
</section>

<section>
  <h2>¿Búsqueda gratuita o rastreador de tweets borrados de pago?</h2>
  <p>Los servicios de pago como TrackTweets vigilan una cuenta y guardan una copia de cada post que borra desde el día en que empiezas a
  seguirla. Responden a otra pregunta distinta a la de esta página y cobran por cuenta:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Rastreador de pago</th></tr></thead>
    <tbody>
      <tr><td>Qué encuentra</td><td>Posts archivados en el pasado, incluidos los borrados antes de que miraras</td><td>Posts borrados después de empezar el seguimiento</td></tr>
      <tr><td>Precio</td><td>Gratis · Pro desde 36 $/año para la lista completa y CSV</td><td>Unos 9 $ al mes por cuenta (TrackTweets, en el momento de escribir esto)</td></tr>
      <tr><td>Cuenta</td><td>Sin iniciar sesión ni conectar nada</td><td>Registro y suscripción</td></tr>
      <tr><td>Ideal para</td><td>Echar un vistazo puntual a lo que publicó una cuenta</td><td>Vigilar cuentas concretas de forma continua</td></tr>
    </tbody>
  </table></div>
  <p>¿Necesitas más que los 50 más recientes? <a href="/es/pro">Xtracticle Pro</a> muestra todos los posts archivados que Wayback Machine guarda
  de una cuenta (hasta 1500) y los exporta a CSV. Desde 3 $ al mes con pago anual, o 59 $ una sola vez. Pro incluye además <a href="/es/rastreador-de-tweets-borrados">Watch, un rastreador de tweets borrados</a>:
  revisa cada hora hasta 5 cuentas públicas (2 en el plan de por vida) y guarda el texto de cualquier post que se elimine, como feed o resumen por correo.</p>
</section>

<section>
  <h2>Más información</h2>
  <ul>
    <li><a href="/es/guias/como-ver-tweets-borrados">Cómo ver tweets borrados</a>: dónde puede quedar una copia y qué no funciona nunca.</li>
    <li><a href="/es/guias/recuperar-tweets-borrados">¿Se pueden recuperar tweets borrados?</a>: tus propios posts, tu archivo de datos de X y sus límites.</li>
    <li><a href="/es/guias/encontrar-tweets-en-wayback-machine">Cómo encontrar tweets en la Wayback Machine</a>: búsquedas manuales y URL con comodines.</li>
  </ul>
  <p>Para guardar un post o un hilo que sigue en línea, usa la herramienta de la <a href="/es/">página de inicio</a>,
  <a href="/es/desenrollar-hilo-de-twitter">desenrolla un hilo de Twitter</a> para leerlo en una sola página o consérvalo como archivo con
  <a href="/es/hilo-de-twitter-a-pdf">hilo de Twitter a PDF</a> y <a href="/es/tweet-a-pdf">tweet a PDF</a>.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Cómo puedo ver los tweets borrados de alguien?', a: 'Escribe su @usuario o pega el enlace de su perfil en Xtracticle y pulsa Extraer. Verás los posts de esa cuenta archivados en Wayback Machine, con el enlace a cada captura. Los posts borrados solo aparecen si alguien los archivó antes de que se borraran.' },
    { q: '¿Puede mostrar un tweet borrado que nunca se archivó?', a: 'No. Cuando un post se borra, X deja de servirlo. Si nadie lo archivó antes, no queda ninguna copia que una herramienta pueda mostrar.' },
    { q: '¿La lista indica qué tweets se borraron?', a: 'No, porque X no informa de los borrados. Pulsa Probar el post en X en una entrada: si se abre, sigue publicado; si no se encuentra, se borró o la cuenta es privada.' },
    { q: '¿El buscador de tweets borrados es gratis?', a: 'Sí. Es gratis, no pide iniciar sesión y nunca te pide conectar tu cuenta de X.' },
    { q: '¿Puedo buscar un post borrado concreto?', a: 'Sí. Pega el enlace del post en lugar del perfil. Si X ya no lo muestra, Xtracticle te ofrece búsquedas de ese post en Wayback Machine y archive.today con un clic.' },
    { q: '¿Funciona con cuentas privadas?', a: 'No. Los posts protegidos nunca fueron públicos, así que no se pueden leer y los archivos normalmente no los tienen.' },
    { q: '¿Puedo ver los tweets borrados de una cuenta eliminada?', a: 'A menudo, sí. Escribe el antiguo @usuario: si Wayback Machine capturó los posts de la cuenta antes de que se desactivara o suspendiera, aparecen en una lista con un enlace a cada captura.' },
    { q: '¿Es lo mismo que Wayback Machine para Twitter?', a: 'Usa el archivo de Wayback Machine. La diferencia es que lista de una vez todos los posts capturados de una cuenta, en lugar de buscar una URL cada vez.' },
  ],
};

/* ─── Rastreador de tweets borrados ─── */

const deletedTracker: SitePage = {
  id: 'es-deleted-tracker',
  group: 'deleted-tracker',
  path: '/es/rastreador-de-tweets-borrados',
  file: 'es/rastreador-de-tweets-borrados.html',
  lang: 'es',
  title: 'Rastreador de tweets borrados y avisos de tweets nuevos | Xtracticle',
  description:
    'Vigila una cuenta pública de X gratis durante 14 días. Si borra un post, Xtracticle guarda su texto y te avisa por RSS o correo. Sin tarjeta ni login en X.',
  h1: 'Rastreador de tweets borrados',
  sub: 'Vigila una cuenta pública de X (Twitter) y guarda una copia de cada post que borre. Pruébalo gratis 14 días: escribe el @usuario y luego tu correo.',
  primary: 'md',
  nav: 'Rastreador de tweets borrados',
  sections: `
<section>
  <p><strong>Un tweet borrado solo se puede ver si alguien guardó una copia antes de que desapareciera.</strong> Xtracticle Watch es esa copia.
  Añade una cuenta pública y Xtracticle lee sus posts más recientes cada hora. Cuando un post que ya había visto desaparece de X, recibes
  su texto, su fecha y los enlaces a sus archivos multimedia, más una copia de Wayback Machine si existe, en un feed privado y en un correo diario.</p>
  <h2>Cómo rastrear los tweets que borra una cuenta</h2>
  ${steps([
    '<strong>Empieza la prueba gratuita.</strong> Escribe arriba el <code>@usuario</code> de la cuenta, introduce tu correo en el cuadro de Watch que aparece bajo sus posts archivados y haz clic en el enlace de confirmación que te enviamos. Una cuenta durante 14 días: sin tarjeta, sin cuenta de Xtracticle, sin login en X.',
    '<strong>Elige de qué quieres enterarte.</strong> El enlace abre tu página de prueba con un feed RSS / JSON privado para tu lector; elige posts borrados, posts nuevos o ambos. Cuando algo cambia, un resumen diario llega al correo que confirmaste.',
    '<strong>Sigue vigilando con Pro.</strong> Al terminar los 14 días, la vigilancia simplemente se detiene. <a href="/es/pro">Xtracticle Pro</a> la mantiene y vigila hasta 5 cuentas (2 con el plan de por vida). El pago lo gestiona Gumroad y la clave de licencia llega por correo.',
  ])}
  <p>La misma búsqueda lista lo que Wayback Machine ya archivó de la cuenta, así que también puedes ver
  qué se publicó, y qué se borró, antes de empezar a vigilarla.</p>
</section>

<section>
  <h2>Qué detecta Watch y qué no</h2>
  <ul>
    <li><strong>Posts borrados después de añadir la cuenta.</strong> Watch guarda una instantánea de los ~40 posts más recientes de la cuenta y compara cada hora. Un post que desaparece se vuelve a comprobar en X antes de contar como borrado, así que una cronología lenta no provoca falsas alarmas.</li>
    <li><strong>No los borrados antes de empezar.</strong> Para esos, usa el <a href="/es/buscador-de-tweets-borrados">buscador de tweets borrados</a>, que busca en Wayback Machine.</li>
    <li><strong>No los borrados a los pocos minutos.</strong> Un post que se publica y se borra entre dos comprobaciones horarias no llega a verse.</li>
    <li><strong>Solo cuentas públicas.</strong> Si una cuenta pasa a ser privada o se desactiva, la vigilancia se pausa y recibes un único aviso.</li>
    <li><strong>También posts nuevos.</strong> Configura la vigilancia en <em>nuevos</em> o <em>ambos</em> y el mismo feed te avisa cuando la cuenta publica, sin tener que seguirla.</li>
  </ul>
</section>

<section>
  <h2>Avisos de tweets nuevos, también</h2>
  <p>La misma vigilancia funciona como rastreador de tweets para los posts nuevos de una cuenta. Configúrala en <em>nuevos</em> y recibes un aviso cuando la cuenta
  publica, sin seguirla, sin una cuenta de X y sin activar las notificaciones de X. Elige <em>ambos</em> para enterarte de los posts nuevos y de los
  borrados en un mismo feed.</p>
  <ul>
    <li><strong>Dónde llegan los avisos:</strong> un feed RSS / JSON privado para cualquier lector de feeds (o la app de RSS de Slack) y un resumen diario por correo.</li>
    <li><strong>Con qué frecuencia:</strong> cada hora aproximadamente. Watch es una herramienta de vigilancia, no un servicio de notificaciones push en tiempo real.</li>
    <li><strong>Qué contiene un aviso:</strong> el texto del post, la fecha, el enlace y los enlaces a los archivos multimedia, para que puedas leerlo sin abrir X.</li>
  </ul>
</section>

<section>
  <h2>¿Xtracticle Watch u otro rastreador?</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle Pro</th><th>Rastreador de pago habitual</th></tr></thead>
    <tbody>
      <tr><td>Precio</td><td>5 $ al mes o 36 $ al año para 5 cuentas · 59 $ una vez para 2</td><td>Unos 9 $ al mes por cuenta (TrackTweets, en el momento de escribir esto)</td></tr>
      <tr><td>Prueba gratuita</td><td>14 días, 1 cuenta, solo confirmación por correo, sin tarjeta</td><td>Varía</td></tr>
      <tr><td>Registro</td><td>Ninguno. Una clave de licencia, sin login en X ni nada conectado</td><td>Cuenta y suscripción</td></tr>
      <tr><td>Avisos</td><td>Feed RSS / JSON privado, resumen diario por correo</td><td>Varía</td></tr>
      <tr><td>Borrados anteriores</td><td>Archivo completo de Wayback de la cuenta (hasta 1500 posts) con CSV</td><td>Normalmente solo desde el día en que empiezas</td></tr>
      <tr><td>Incluye además</td><td>Guardado por lotes de 200 enlaces, clave MCP / API, PDF sin la línea de crédito</td><td>—</td></tr>
    </tbody>
  </table></div>
  <p><a href="/es/pro">Consulta Xtracticle Pro y sus precios</a>. Guardar posts, hilos y Artículos en el resto del sitio sigue siendo gratis.</p>
</section>

<section>
  <h2>Quién usa un rastreador de tweets borrados</h2>
  <ul>
    <li><strong>Periodistas e investigadores</strong> que necesitan un registro de lo que dijo un personaje público, una empresa o una cuenta oficial, aunque luego lo retire.</li>
    <li><strong>Responsables de marca y de comunidad</strong> que siguen los anuncios de competidores y socios.</li>
    <li><strong>Quien sigue una polémica pública</strong> en la que los posts suelen desaparecer después.</li>
  </ul>
  <p>Watch solo lee lo que una cuenta publica abiertamente, los mismos posts que cualquiera ve en x.com. Nunca inicia sesión en X y no ve
  cuentas privadas. Consulta la <a href="/es/privacidad">página de privacidad</a> para saber qué se almacena y cómo pedir que se excluya una cuenta.</p>
</section>

<section>
  <h2>Más información</h2>
  <ul>
    <li><a href="/es/buscador-de-tweets-borrados">Buscador de tweets borrados</a>: busca en Wayback Machine los posts archivados de una cuenta, gratis.</li>
    <li><a href="/es/guias/como-ver-tweets-borrados">Cómo ver tweets borrados</a>: dónde puede quedar una copia y qué no funciona nunca.</li>
    <li><a href="/es/guias/encontrar-tweets-en-wayback-machine">Cómo encontrar tweets en la Wayback Machine</a>: búsquedas manuales y URL con comodines.</li>
  </ul>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Puedo recibir un aviso cuando alguien borra un tweet?', a: 'Sí. Añade la cuenta pública a Xtracticle Watch (parte de Xtracticle Pro). Revisa la cuenta cada hora y, cuando se borra un post que ya había visto, lo añade a tu feed RSS privado y a tu resumen diario por correo con el texto del post.' },
    { q: '¿Hay prueba gratuita?', a: 'Sí. Vigila una cuenta pública gratis durante 14 días: escríbela arriba, introduce tu correo y haz clic en el enlace de confirmación que te enviamos. No hace falta tarjeta ni clave de licencia, hay una prueba por dirección de correo y no se cobra nada: al terminar la prueba, la vigilancia simplemente se detiene. Para seguir vigilando, o para vigilar hasta 5 cuentas, consigue Xtracticle Pro.' },
    { q: '¿Puedo recibir avisos cuando una cuenta tuitea?', a: 'Sí. Configura la vigilancia en posts nuevos (o en nuevos y borrados). Xtracticle revisa la cuenta cada hora aproximadamente y añade cada post nuevo a tu feed privado y a tu resumen diario por correo, sin seguir la cuenta en X.' },
    { q: '¿Con qué rapidez detecta el rastreador un borrado?', a: 'Las cuentas se revisan cada hora aproximadamente. El feed se actualiza en la siguiente revisión tras el borrado; el resumen por correo sale una vez al día.' },
    { q: '¿Puede mostrar tweets borrados antes de empezar a rastrear?', a: 'Watch no, porque nunca los vio. Usa el buscador de tweets borrados gratuito, que lista los posts archivados en Wayback Machine, incluidos los que se borraron después.' },
    { q: '¿Tengo que iniciar sesión con mi cuenta de X?', a: 'No. Xtracticle nunca te pide el login de X. Pro se activa con una clave de licencia que Gumroad te envía por correo tras el pago.' },
    { q: '¿Cuántas cuentas puedo rastrear?', a: 'Cinco cuentas públicas con el plan mensual o anual y dos con el plan de por vida de pago único. Puedes cambiar de cuentas en cualquier momento en la página de Pro.' },
    { q: '¿Funciona con cuentas privadas?', a: 'No. Los posts protegidos no son públicos, así que no se pueden leer. Si una cuenta vigilada pasa a ser privada, la vigilancia se pausa y recibes un único aviso.' },
  ],
};

/* ─── Descargar imágenes de Twitter ─── */

const imageDownloader: SitePage = {
  id: 'es-image-dl',
  group: 'image-dl',
  path: '/es/descargar-imagenes-de-twitter',
  file: 'es/descargar-imagenes-de-twitter.html',
  lang: 'es',
  title: 'Descargar imágenes de Twitter: fotos de X en tamaño original | Xtracticle',
  description:
    'Descarga todas las fotos de un tweet, hilo o Artículo de X en calidad original, en un solo ZIP con el texto del post. Gratis, sin login, sin marca de agua ni app.',
  h1: 'Descargar imágenes de Twitter',
  sub: 'Guarda todas las fotos de un post, hilo o Artículo de X (Twitter) en calidad original, con el texto, en un solo ZIP.',
  primary: 'zip',
  nav: 'Descargar imágenes',
  sections: `
<section>
  <p><strong>Xtracticle es un descargador gratuito de imágenes de Twitter:</strong> pega el enlace de un post y descarga un ZIP con todas las fotos
  que contiene, en el tamaño original que guarda X, junto al texto del post en Markdown. Funciona con tweets sueltos, hilos completos y Artículos
  largos de X, en ordenador y móvil, sin cuenta ni app.</p>
  <h2>Descarga las imágenes de un tweet en tres pasos</h2>
  ${steps([
    '<strong>Copia el enlace del post</strong> (Compartir → Copiar enlace). Valen los enlaces de x.com, twitter.com, fxtwitter, vxtwitter, nitter y xcancel, y también el ID del post a secas.',
    '<strong>Pégalo arriba</strong> y pulsa Extraer. Debajo aparecen el post, sus fotos y el post citado.',
    '<strong>Pulsa ZIP.</strong> Recibes un solo archivo con las fotos en una carpeta <code>images</code> y el texto como un archivo Markdown que apunta a ellas.',
  ])}
</section>

<section>
  <h2>Qué obtienes</h2>
  <ul>
    <li><strong>Calidad original.</strong> Las fotos se descargan en el tamaño más grande que guarda X (<code>name=orig</code>), no en la vista previa comprimida que ves en el timeline.</li>
    <li><strong>Todas las fotos a la vez.</strong> Las cuatro fotos de un post, las del post citado y, en un hilo o un Artículo de X, todas las imágenes, en el orden del documento.</li>
    <li><strong>El texto, también.</strong> El ZIP incluye un archivo Markdown con el texto del post, el autor, la fecha y el enlace de origen, para que las fotos no pierdan su contexto.</li>
    <li><strong>Sin marca de agua ni registro.</strong> No se añade nada a las imágenes y no se publica nada en X.</li>
  </ul>
  <p>¿Solo quieres el texto? La misma página también exporta a <a href="/es/tweet-a-pdf">PDF</a>, <a href="/es/articulo-de-x-a-markdown">Markdown</a>,
  EPUB y texto plano.</p>
</section>

<section>
  <h2>Tweets, hilos y Artículos</h2>
  <h3>Un solo tweet</h3>
  <p>Pega el enlace del post. El ZIP contiene las fotos de ese post y las de cualquier post que cite.</p>
  <h3>Un hilo entero</h3>
  <p>Pega cualquier post del hilo. Xtracticle une los posts del autor en orden, así que un solo ZIP guarda las imágenes de todo el hilo.
  Si prefieres leerlo antes, <a href="/es/desenrollar-hilo-de-twitter">desenrolla el hilo</a>.</p>
  <h3>Un Artículo de X</h3>
  <p>Los Artículos largos conservan su imagen de portada y todas las imágenes del texto, numeradas en orden de lectura. Para una copia imprimible, mira <a href="/es/articulo-de-x-a-pdf">Artículo de X a PDF</a>.</p>
</section>

<section>
  <h2>Lo que no hace</h2>
  <ul>
    <li><strong>No descarga vídeos.</strong> Los vídeos y GIF aparecen como una miniatura con enlace en el Markdown; el ZIP no contiene el vídeo en sí.</li>
    <li><strong>Solo posts públicos.</strong> Las cuentas protegidas no se pueden leer.</li>
    <li><strong>Sin posts borrados.</strong> Cuando se borra un post, X deja de servir sus imágenes. Para buscar una copia archivada, usa el <a href="/es/buscador-de-tweets-borrados">buscador de tweets borrados</a>.</li>
    <li><strong>El modo por lotes guarda texto.</strong> El modo por lotes admite hasta 20 enlaces y devuelve un ZIP de archivos Markdown cuyos enlaces de imagen apuntan a X. Para tener las fotos en local, guarda cada post por separado.</li>
  </ul>
  <p>Las imágenes pertenecen a quienes las publicaron. Guárdalas para tus propios registros, investigación o referencia, y pide permiso antes de reutilizar el trabajo de otra persona.</p>
</section>

${shortcuts('es')}

${privacy('es')}`,
  faq: [
    { q: '¿Cómo descargo las imágenes de un tweet?', a: 'Copia el enlace del post, pégalo en Xtracticle, pulsa Extraer y luego ZIP. El archivo contiene todas las fotos del post en calidad original y el texto en Markdown.' },
    { q: '¿Las imágenes se descargan en calidad original?', a: 'Sí. Las fotos se obtienen en el tamaño más grande que guarda X (name=orig), no en la vista previa comprimida del timeline.' },
    { q: '¿Puedo descargar todas las imágenes de un hilo de una vez?', a: 'Sí. Pega cualquier post del hilo; el ZIP incluye las fotos de todos los posts del autor en ese hilo, en orden.' },
    { q: '¿Descarga vídeos o GIF?', a: 'No. Los vídeos y GIF se muestran como una miniatura con enlace. El ZIP contiene fotos y texto.' },
    { q: '¿El descargador de imágenes de Twitter es gratis?', a: 'Sí. Es gratis, no pide login ni app y no añade marca de agua.' },
    { q: '¿Funciona en iPhone y Android?', a: 'Sí. Funciona en el navegador. En el móvil, el ZIP va a tu carpeta de Descargas o a la app Archivos.' },
    { q: '¿Puedo descargar imágenes de una cuenta privada?', a: 'No. Solo se pueden leer posts públicos.' },
  ],
};

/* ─── Buscador de tweets ─── */

const tweetFinder: SitePage = {
  id: 'es-tweet-finder',
  group: 'tweet-finder',
  path: '/es/buscador-de-tweets',
  file: 'es/buscador-de-tweets.html',
  lang: 'es',
  title: 'Buscador de tweets: encuentra tweets antiguos por fecha | Xtracticle',
  description:
    'Encuentra tweets antiguos de una cuenta: arma una búsqueda en X por palabras y fechas, busca en Google sin iniciar sesión o lista posts archivados en Wayback Machine. Gratis.',
  h1: 'Buscador de tweets',
  sub: 'Encuentra tweets antiguos de cualquier cuenta pública, por palabras y fechas. Escribe el @usuario y elige cómo buscar.',
  primary: 'md',
  nav: 'Buscador de tweets',
  sections: `
<section>
  <p><strong>El buscador de tweets de Xtracticle busca los posts antiguos de una cuenta en tres sitios a la vez:</strong> el buscador propio de X, el
  índice de Google de las páginas de X y Wayback Machine. Escribe un @usuario y verás los posts de esa cuenta que capturó el Internet Archive.
  Añade palabras o un rango de fechas en el cuadro de búsqueda y obtendrás búsquedas listas para X y Google. Nada que instalar y aquí no hace falta cuenta.</p>
  <h2>Encuentra un tweet antiguo en tres pasos</h2>
  ${steps([
    '<strong>Indica la cuenta:</strong> escribe <code>@usuario</code> o pega el enlace del perfil y pulsa Extraer para listar sus posts archivados, del más reciente al más antiguo.',
    '<strong>Acota la búsqueda:</strong> en el cuadro de búsqueda, añade una palabra o una <code>"frase entre comillas"</code> y una fecha de inicio y de fin. La consulta aparece mientras escribes.',
    '<strong>Elige una búsqueda:</strong> <em>Buscar en X</em> abre el buscador de X con la consulta; <em>Buscar con Google</em> funciona sin iniciar sesión; <em>Publicaciones archivadas</em> lista las copias de Wayback Machine. ¿Lo encontraste? Pega el enlace del post en la <a href="/es/">página de inicio</a> para guardarlo como PDF o Markdown.',
  ])}
</section>

<section>
  <h2>Qué búsqueda usar</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Buscar en X</th><th>Buscar con Google</th><th>Publicaciones archivadas</th></tr></thead>
    <tbody>
      <tr><td>Login</td><td>X te pide iniciar sesión</td><td>No</td><td>No</td></tr>
      <tr><td>Cobertura</td><td>La más completa para posts públicos que siguen online</td><td>Solo posts que Google ha indexado</td><td>Solo posts que alguien archivó</td></tr>
      <tr><td>Posts borrados</td><td>No</td><td>Rara vez, hasta que Google retira la página</td><td>Sí, si se archivaron antes de borrarse</td></tr>
      <tr><td>Fechas</td><td>Exactas (<code>since:</code> / <code>until:</code>)</td><td>Aproximadas (<code>after:</code> / <code>before:</code>, según la fecha de indexación)</td><td>Se muestran por cada captura</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Los operadores de búsqueda que hay detrás</h2>
  <p>El cuadro arma una búsqueda avanzada de X. También puedes escribir estos operadores directamente en la barra de búsqueda de X:</p>
  <ul>
    <li><code>from:username</code> solo posts de esa cuenta. <code>to:username</code> encuentra las respuestas enviadas a ella.</li>
    <li><code>since:2021-01-01 until:2021-12-31</code> limita las fechas. <code>until</code> es excluyente: el post debe ser anterior a ese día.</li>
    <li><code>"frase exacta"</code> busca las palabras en ese orden; <code>-palabra</code> excluye una palabra; <code>OR</code> busca una u otra.</li>
    <li><code>filter:media</code>, <code>filter:links</code> y <code>-filter:replies</code> dejan solo los posts con medios, con enlaces o sin respuestas.</li>
    <li><code>min_faves:100</code> y <code>min_retweets:50</code> dejan solo los posts populares.</li>
  </ul>
  <p>Por ejemplo, <code>from:NASA "Artemis" since:2022-11-01 until:2022-12-01</code> lista los posts de la NASA sobre Artemis en noviembre de 2022.</p>
</section>

<section>
  <h2>Si el tweet se borró</h2>
  <p>El buscador de X no muestra posts borrados y Google los retira al volver a rastrear. Wayback Machine es el sitio que queda por mirar. El
  <a href="/es/buscador-de-tweets-borrados">buscador de tweets borrados</a> lo explica en detalle. Para que te avisen cuando una cuenta borre algo a partir de ahora,
  usa el <a href="/es/rastreador-de-tweets-borrados">rastreador de tweets borrados</a>.</p>
  <p>¿Buscas tus propios tweets antiguos? Tu archivo de datos de X (Ajustes → Tu cuenta → Descargar un archivo de tus datos) contiene todos los
  posts que no has borrado; la <a href="/es/guias/recuperar-tweets-borrados">guía de recuperación</a> explica qué incluye.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Cómo encuentro un tweet antiguo de alguien?', a: 'Escribe su @usuario en el buscador de tweets de Xtracticle, añade palabras o un rango de fechas y abre la búsqueda en X o en Google. Pulsa Extraer para listar también sus posts archivados en Wayback Machine.' },
    { q: '¿Puedo buscar tweets por fecha?', a: 'Sí. Elige una fecha de inicio y una de fin: la búsqueda en X usa since: y until:, que son exactos. after: y before: de Google son aproximados porque usan la fecha en que Google indexó la página.' },
    { q: '¿Puedo buscar tweets sin cuenta de X?', a: 'El buscador propio de X te pide iniciar sesión. Buscar con Google y la lista de publicaciones archivadas funcionan sin ningún login.' },
    { q: '¿Encuentra tweets borrados?', a: 'Solo a través de archivos. X y Google dejan de mostrar un post cuando se borra; la lista de Wayback Machine lo muestra si alguien lo archivó antes.' },
    { q: '¿El buscador de tweets es gratis?', a: 'Sí. Es gratis, no requiere registro y nunca te pide tu login de X.' },
    { q: '¿Funciona con cuentas privadas?', a: 'No. Los posts protegidos solo los ven los seguidores aprobados en X, así que ninguna búsqueda externa puede encontrarlos.' },
  ],
};

export const TOOLS: SitePage[] = [unroll, tweetpdf, deletedFinder, deletedTracker, imageDownloader, tweetFinder, mcp, privacyPage];
