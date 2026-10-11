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
  vinculadas a ti y caducan automáticamente. Los posts privados, protegidos y eliminados no se pueden obtener en absoluto.</p>
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

export const TOOLS: SitePage[] = [unroll, tweetpdf, mcp, privacyPage];
