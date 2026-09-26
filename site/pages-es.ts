/** Spanish pages. */
import { EXAMPLE, GITHUB, privacy, shortcuts, steps, type SitePage } from './blocks';

const home: SitePage = {
  id: 'es-home',
  group: 'home',
  path: '/es/',
  file: 'es/index.html',
  lang: 'es',
  isHome: true,
  title: 'Descargar artículos e hilos de X en PDF y Markdown | Xtracticle',
  description:
    'Descarga artículos, hilos y posts de X (Twitter) en PDF, Markdown, EPUB/Kindle o texto. Pega un enlace y obtén un archivo limpio con imágenes, gratis y sin registro.',
  h1: 'Descargar artículos de X',
  sub: 'Descarga artículos, hilos y posts de X (Twitter) en PDF, Markdown, EPUB o texto — gratis y sin iniciar sesión.',
  primary: 'pdf',
  nav: 'Descargar artículos de X',
  sections: `
<section>
  <h2>Cómo descargar un artículo de X</h2>
  ${steps([
    '<strong>Copia el enlace del post</strong> — en X toca <em>Compartir → Copiar enlace</em>. Sirve cualquier post de un hilo.',
    '<strong>Pégalo arriba</strong> — Xtracticle obtiene el artículo, el hilo o el post en uno o dos segundos.',
    '<strong>Elige el formato</strong> — PDF, Markdown, EPUB/Kindle, ZIP con imágenes o texto plano.',
    '<strong>Listo</strong> — también puedes copiarlo, enviarlo a Obsidian o escucharlo en voz alta.',
  ])}
  <p>¿Quieres ver el resultado primero? <a href="${EXAMPLE}">Abre un artículo de ejemplo</a>.</p>
</section>

<section>
  <h2>Todos los formatos que necesitas</h2>
  <div class="xt-grid">
    <div><h3><a href="/es/articulo-de-x-a-pdf">PDF</a></h3><p>Tamaño A4 y listo para imprimir: imágenes, enlace a la fuente y números de página.</p></div>
    <div><h3><a href="/es/articulo-de-x-a-markdown">Markdown (.md)</a></h3><p>Conserva títulos, negritas, enlaces, listas, citas e imágenes. Front-matter YAML opcional.</p></div>
    <div><h3><a href="/es/articulo-de-x-a-epub-kindle">EPUB / Kindle</a></h3><p>Lee artículos largos en Kindle, Kobo o Apple Books, con las imágenes incluidas.</p></div>
    <div><h3><a href="/es/guardar-articulos-de-x-en-obsidian">Obsidian</a></h3><p>Con un clic se abre una nota nueva en tu bóveda con el artículo completo y sus metadatos.</p></div>
    <div><h3>ZIP + imágenes</h3><p>Markdown y todas las imágenes en local: un archivo que sobrevive aunque borren el post.</p></div>
    <div><h3>Texto plano</h3><p>Un .txt limpio para cualquier dispositivo, script o herramienta de IA.</p></div>
  </div>
</section>

<section>
  <h2>Artículos, hilos y posts sueltos</h2>
  <p><strong>Artículos de X</strong> (posts largos de hasta 100.000 caracteres): se convierten bloque a bloque con títulos, negritas,
  cursivas, tachados, enlaces, listas, citas, código, separadores, imagen de portada, imágenes, vídeos y posts incrustados.</p>
  <p><strong>Hilos</strong>: se desenrollan automáticamente. Pega el primer post, uno intermedio o el último y Xtracticle encuentra el hilo
  completo del autor y lo une en un único documento numerado. Las respuestas de otras personas no se incluyen.
  Más detalles en <a href="/es/hilo-de-twitter-a-pdf">hilo de Twitter a PDF</a>.</p>
  <p><strong>Posts sueltos</strong>: conservan el texto, los saltos de línea, las fotos, los vídeos y el post citado. ¿Tienes muchos?
  Activa el <em>Modo lote</em> y pega hasta 20 enlaces para recibir un solo ZIP.</p>
  <p>¿Vienes de Thread Reader App? Mira la <a href="/es/alternativa-a-thread-reader-app">comparación completa</a>.</p>
</section>

${shortcuts('es')}

${privacy('es')}`,
  faq: [
    { q: '¿Xtracticle es gratis?', a: 'Sí. Es gratuito y de código abierto: sin cuenta, sin inicio de sesión y sin límites de uso.' },
    { q: '¿Cómo descargo un artículo de X en PDF?', a: 'Copia el enlace del post, pégalo en Xtracticle y pulsa PDF. El archivo incluye título, autor, fecha, enlace a la fuente, todas las imágenes y números de página.' },
    { q: '¿Puedo descargar un hilo completo de Twitter?', a: 'Sí. Pega el enlace de cualquier post del hilo (el primero, uno intermedio o el último). Xtracticle reúne todos los posts del autor en un único documento numerado.' },
    { q: '¿Puedo guardar artículos de X en Obsidian o Notion?', a: 'Sí. Descarga el archivo Markdown o pulsa el botón Obsidian, que copia el artículo y abre una nota nueva. Notion importa archivos .md directamente.' },
    { q: '¿Por qué dice que no se encontró el post?', a: 'Puede que el post se haya eliminado, sea de una cuenta privada o tenga restricción de edad. Solo se pueden descargar posts públicos.' },
    { q: 'Tengo un enlace x.com/i/article/… ¿Qué hago?', a: 'Es el enlace del lector de artículos. Abre el artículo en X, toca Compartir → Copiar enlace para obtener el enlace del post (x.com/usuario/status/…) y pégalo.' },
  ],
};

const pdf: SitePage = {
  id: 'es-pdf',
  group: 'pdf',
  path: '/es/articulo-de-x-a-pdf',
  file: 'es/articulo-de-x-a-pdf.html',
  lang: 'es',
  title: 'Descargar artículo de X en PDF gratis, con imágenes | Xtracticle',
  description:
    'Convierte un artículo o post de X (Twitter) en un PDF limpio y listo para imprimir, con imágenes, enlace a la fuente y números de página. Gratis y sin registro.',
  h1: 'Convertir artículo de X a PDF',
  sub: 'Convierte cualquier artículo, hilo o post de X (Twitter) en un PDF limpio y listo para imprimir — con imágenes y sin iniciar sesión.',
  primary: 'pdf',
  nav: 'Artículo de X a PDF',
  sections: `
<section>
  <h2>Cómo pasar un artículo de X a PDF en tres pasos</h2>
  ${steps([
    '<strong>Copia el enlace</strong> del artículo de X (Compartir → Copiar enlace).',
    '<strong>Pégalo arriba</strong> y pulsa Extraer.',
    '<strong>Pulsa PDF</strong> — el archivo se descarga al instante.',
  ])}
</section>

<section>
  <h2>Así queda tu PDF</h2>
  <ul>
    <li><strong>Un diseño A4 limpio</strong> — sin la barra lateral de X, botones, respuestas ni anuncios. Solo el artículo.</li>
    <li><strong>Título, autor, fecha y enlace a la fuente</strong> al principio, para que puedas citar el PDF.</li>
    <li><strong>Imagen de portada e imágenes internas</strong> en su sitio, ajustadas al ancho de la página.</li>
    <li><strong>Números de página</strong> y un enlace clicable al post original en el pie de página.</li>
    <li><strong>Sin líneas cortadas</strong> — los saltos de página caen entre párrafos, nunca en medio, incluso en artículos muy largos.</li>
  </ul>
</section>

<section>
  <h2>Consejos</h2>
  <h3>¿Necesitas texto seleccionable y con búsqueda?</h3>
  <p>El PDF se genera para que el diseño quede perfecto al píxel. Si quieres subrayar o buscar en el texto, usa la exportación a
  <a href="/es/articulo-de-x-a-epub-kindle">EPUB</a> o a <a href="/es/articulo-de-x-a-markdown">Markdown</a>, o pulsa
  <code>Ctrl/Cmd + P</code> sobre el resultado y elige <em>Guardar como PDF</em>.</p>
  <h3>Hilos en PDF</h3>
  <p>Pega cualquier post de un hilo y el hilo completo se convierte en un solo PDF. Más información en
  <a href="/es/hilo-de-twitter-a-pdf">hilo de Twitter a PDF</a>.</p>
  <h3>En iPhone</h3>
  <p>Pulsa PDF, abre la descarga desde la lista de descargas de Safari y usa <em>Compartir → Guardar en Archivos</em> o envíalo a Libros.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿El conversor de X a PDF es gratis?', a: 'Sí, totalmente gratis: sin marca de agua, sin iniciar sesión y sin límites.' },
    { q: '¿El PDF incluye las imágenes?', a: 'Sí. Se incluyen la imagen de portada y todas las imágenes del artículo. Los vídeos aparecen como una miniatura con enlace al vídeo.' },
    { q: '¿Puedo convertir un hilo de Twitter a PDF?', a: 'Sí. Pega el enlace de cualquier post del hilo y Xtracticle une el hilo completo en un único PDF.' },
    { q: '¿Funciona en el móvil?', a: 'Sí. Funciona en cualquier navegador moderno en iPhone, Android, Mac, Windows y Linux.' },
    { q: '¿Puedo convertir posts privados o eliminados?', a: 'No. Solo se pueden convertir posts públicos que sigan en línea, y justo por eso conviene guardar una copia en PDF.' },
  ],
};

const markdown: SitePage = {
  id: 'es-markdown',
  group: 'markdown',
  path: '/es/articulo-de-x-a-markdown',
  file: 'es/articulo-de-x-a-markdown.html',
  lang: 'es',
  title: 'Artículo de X a Markdown: convierte posts e hilos a .md | Xtracticle',
  description:
    'Convierte artículos, hilos y posts de X (Twitter) a Markdown limpio con títulos, enlaces, listas, imágenes y front-matter YAML. Ideal para Obsidian, Notion y la IA.',
  h1: 'Convertir artículo de X a Markdown',
  sub: 'Convierte artículos, hilos y posts de X (Twitter) a Markdown limpio — con el formato, los enlaces y las imágenes intactos.',
  primary: 'md',
  nav: 'Artículo de X a Markdown',
  sections: `
<section>
  <h2>Markdown limpio, no un copia y pega desordenado</h2>
  <p>Los artículos de X se guardan como bloques de texto enriquecido. Xtracticle convierte cada bloque a Markdown correcto para que se vea bien en cualquier sitio:</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>En X</th><th>En tu archivo .md</th></tr></thead>
    <tbody>
      <tr><td>Título / subtítulo</td><td><code>## Título</code> / <code>### Subtítulo</code></td></tr>
      <tr><td>Negrita, cursiva, tachado</td><td><code>**negrita**</code>, <code>*cursiva*</code>, <code>~~tachado~~</code></td></tr>
      <tr><td>Enlaces</td><td><code>[texto](https://…)</code></td></tr>
      <tr><td>Listas con viñetas / numeradas (anidadas)</td><td><code>- elemento</code> / <code>1. elemento</code></td></tr>
      <tr><td>Citas, código, separadores</td><td><code>&gt; cita</code>, bloque de código, <code>---</code></td></tr>
      <tr><td>Imágenes y vídeos</td><td><code>![pie de foto](url)</code>, miniatura del vídeo con enlace</td></tr>
      <tr><td>Posts incrustados</td><td>Enlace al post incrustado</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Incluye front-matter YAML</h2>
  <p>Cada archivo puede empezar con metadatos que entienden Obsidian (Propiedades), Hugo, Jekyll, Astro y Dataview:</p>
  <pre><code>---
title: "El título del artículo"
author: "Nombre del autor (@usuario)"
source: "https://x.com/usuario/status/123…"
published: 2026-03-01
saved: 2026-09-26
type: article
tags: [x, article]
---</code></pre>
  <p>¿No lo quieres? Desmarca <em>Añadir front-matter YAML al .md</em> debajo de los botones de descarga.</p>
</section>

<section>
  <h2>Perfecto para</h2>
  <ul>
    <li><strong>Tomar notas</strong> — Obsidian, Logseq, Notion, Bear, Joplin y cualquier editor Markdown. Mira la <a href="/es/guardar-articulos-de-x-en-obsidian">guía de Obsidian</a>.</li>
    <li><strong>Herramientas de IA</strong> — Markdown es el contexto más limpio para ChatGPT, Claude, Gemini o NotebookLM: pégalo para resumir, traducir o hacer preguntas.</li>
    <li><strong>Escribir y publicar</strong> — cita fuentes en entradas de blog, newsletters, documentación y READMEs de GitHub.</li>
    <li><strong>Archivar</strong> — descarga <em>ZIP + imágenes</em> para guardar cada imagen en local junto al archivo .md.</li>
  </ul>
</section>

${shortcuts('es')}`,
  faq: [
    { q: '¿Cómo convierto un tweet a Markdown?', a: 'Pega el enlace del post en Xtracticle y pulsa Markdown, o Copiar para llevar el Markdown al portapapeles.' },
    { q: '¿El Markdown incluye las imágenes?', a: 'Sí, como enlaces a las imágenes. Elige ZIP + imágenes para descargar también cada imagen y que el Markdown apunte a las copias locales.' },
    { q: '¿Convierte hilos a Markdown?', a: 'Sí. Pega cualquier post de un hilo y todos los posts se unen en un único documento Markdown numerado.' },
    { q: '¿Puedo desactivar el front-matter YAML?', a: 'Sí. Desmarca la opción de front-matter debajo de los botones de descarga. Tu elección se recuerda.' },
  ],
};

const thread: SitePage = {
  id: 'es-thread',
  group: 'thread',
  path: '/es/hilo-de-twitter-a-pdf',
  file: 'es/hilo-de-twitter-a-pdf.html',
  lang: 'es',
  title: 'Convertir hilo de Twitter a PDF: desenrolla hilos de X | Xtracticle',
  description:
    'Desenrolla cualquier hilo de X (Twitter) y guárdalo en un solo PDF, Markdown, EPUB o texto. Pega cualquier post del hilo: sin mencionar bots, sin registro y gratis.',
  h1: 'Convertir hilo de Twitter a PDF',
  sub: 'Desenrolla cualquier hilo de X (Twitter) en un solo documento limpio — PDF, Markdown, EPUB o texto. Pega cualquier post del hilo.',
  primary: 'pdf',
  nav: 'Hilo de Twitter a PDF',
  sections: `
<section>
  <h2>Desenrolla un hilo en segundos</h2>
  ${steps([
    '<strong>Copia el enlace</strong> de cualquier post del hilo: el primero, uno intermedio o el último.',
    '<strong>Pégalo arriba.</strong> Xtracticle encuentra todos los posts que el autor escribió en ese hilo.',
    '<strong>Descarga</strong> el hilo unido y numerado en PDF, Markdown, EPUB o texto.',
  ])}
</section>

<section>
  <h2>Cómo se desenrolla un hilo</h2>
  <p>Un hilo es una cadena de posts en la que el autor se responde a sí mismo. Xtracticle lee esa cadena y se queda solo con los posts
  del propio autor, en orden; las respuestas de otras personas quedan fuera. Cada post va numerado (<code>1/12</code>, <code>2/12</code>…) y conserva
  sus saltos de línea, fotos, vídeos y posts citados.</p>
  <p>No hace falta mencionar a un bot debajo del hilo ni esperar una respuesta: todo ocurre aquí mismo, en privado.</p>
</section>

<section>
  <h2>¿Por qué guardar hilos?</h2>
  <ul>
    <li><strong>Leer con comodidad</strong> — un documento continuo en lugar de ir post por post.</li>
    <li><strong>Conservarlo para siempre</strong> — los hilos se borran y las cuentas se vuelven privadas. Una copia en PDF o en <em>ZIP + imágenes</em> sigue siendo tuya.</li>
    <li><strong>Estudiar y compartir</strong> — envía el PDF a tu equipo, imprímelo o lleva el Markdown a tus notas o a un asistente de IA.</li>
    <li><strong>En tu lector electrónico</strong> — exporta a <a href="/es/articulo-de-x-a-epub-kindle">EPUB para Kindle</a>.</li>
  </ul>
</section>

${shortcuts('es')}`,
  faq: [
    { q: '¿Necesito el primer tweet del hilo?', a: 'No. Pega cualquier post del hilo y se arma el hilo completo.' },
    { q: '¿Se incluyen las respuestas de otras personas?', a: 'No. Solo se incluyen los posts del propio autor en el hilo, en orden.' },
    { q: '¿Tengo que etiquetar a un bot como @threadreaderapp?', a: 'No. No hay que publicar ni etiquetar nada: pega el enlace y descarga.' },
    { q: '¿Puedo desenrollar un hilo de una cuenta privada?', a: 'No. Solo se puede acceder a hilos públicos.' },
  ],
};

const epub: SitePage = {
  id: 'es-epub',
  group: 'epub',
  path: '/es/articulo-de-x-a-epub-kindle',
  file: 'es/articulo-de-x-a-epub-kindle.html',
  lang: 'es',
  title: 'Artículo de X a EPUB y Kindle: léelo en tu e-reader | Xtracticle',
  description:
    'Convierte artículos e hilos de X (Twitter) a EPUB y envíalos a Kindle, Kobo, Apple Books o Google Play Libros. Con las imágenes incluidas, gratis y sin registro.',
  h1: 'Artículo de X a EPUB y Kindle',
  sub: 'Lee artículos e hilos largos de X (Twitter) en tu Kindle, Kobo o Apple Books — como un libro electrónico de verdad, con imágenes.',
  primary: 'epub',
  nav: 'X a Kindle / EPUB',
  sections: `
<section>
  <h2>Envía un artículo de X a tu Kindle</h2>
  ${steps([
    '<strong>Pega el enlace del post</strong> arriba y pulsa Extraer.',
    '<strong>Pulsa “EPUB / Kindle”</strong> para descargar el libro electrónico.',
    '<strong>Envíalo a tu Kindle</strong> con la app o la web de Send to Kindle, o por correo a tu dirección de Kindle.',
  ])}
</section>

<section>
  <h2>Un libro electrónico de verdad, no una captura de pantalla</h2>
  <ul>
    <li><strong>Texto adaptable</strong> — cambia la fuente y el tamaño en tu dispositivo.</li>
    <li><strong>Imágenes incluidas</strong> dentro del archivo, así funciona sin conexión.</li>
    <li><strong>Metadatos</strong> — el título y el autor aparecen bien en tu biblioteca.</li>
    <li><strong>EPUB 3 estándar</strong> — compatible con Kindle (mediante Send to Kindle), Kobo, Apple Books, Google Play Libros, PocketBook y Calibre.</li>
  </ul>
</section>

<section>
  <h2>Ideal para lecturas largas</h2>
  <p>Los artículos de X pueden tener hasta 100.000 caracteres y los hilos pueden llegar a decenas de posts. Leerlos en una pantalla de tinta electrónica
  cansa menos la vista, no tiene distracciones y funciona sin conexión. Guarda unos cuantos antes de un vuelo o arma tu lista de lectura para el fin de semana.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Kindle es compatible con EPUB?', a: 'Sí. Send to Kindle de Amazon acepta archivos EPUB y los convierte automáticamente para tu dispositivo.' },
    { q: '¿Puedo leerlo en Apple Books?', a: 'Sí. Abre el .epub descargado en tu iPhone, iPad o Mac y elige Libros.' },
    { q: '¿Se incluyen las imágenes?', a: 'Sí, las imágenes van incrustadas en el EPUB. Los vídeos se incluyen como enlace.' },
    { q: '¿Puedo convertir un hilo a EPUB?', a: 'Sí. Pega cualquier post del hilo y el hilo completo se convierte en un único libro electrónico.' },
  ],
};

const obsidian: SitePage = {
  id: 'es-obsidian',
  group: 'obsidian',
  path: '/es/guardar-articulos-de-x-en-obsidian',
  file: 'es/guardar-articulos-de-x-en-obsidian.html',
  lang: 'es',
  title: 'Guardar artículos e hilos de X en Obsidian con un clic | Xtracticle',
  description:
    'Guarda artículos e hilos de X (Twitter) en Obsidian como Markdown limpio con propiedades: autor, fuente, fecha y etiquetas. Un clic, gratis y de código abierto.',
  h1: 'Guardar artículos de X en Obsidian',
  sub: 'Guarda artículos e hilos de X (Twitter) en tu bóveda de Obsidian como Markdown limpio con propiedades — con un solo clic.',
  primary: 'obsidian',
  nav: 'X a Obsidian',
  sections: `
<section>
  <h2>De X a tu bóveda</h2>
  ${steps([
    '<strong>Pega el enlace del post</strong> arriba y pulsa Extraer.',
    '<strong>Pulsa “Obsidian”.</strong> El Markdown se copia y Obsidian abre una nota nueva con el contenido.',
    '<strong>Listo</strong> — título, autor, fuente, fechas y etiquetas ya están en las propiedades de la nota.',
  ])}
  <p>¿Prefieres archivos? Descarga <strong>Markdown</strong> y suéltalo en tu bóveda, o <strong>ZIP + imágenes</strong> para tener las imágenes sin conexión en una carpeta <code>images/</code> junto a la nota.</p>
</section>

<section>
  <h2>Propiedades que puedes consultar</h2>
  <p>Cada nota incluye <code>title</code>, <code>author</code>, <code>source</code>, <code>published</code>, <code>saved</code>, <code>type</code> (article, thread o post) y <code>tags</code>.
  Con Dataview puedes listar todo lo que has guardado de X:</p>
  <pre><code>TABLE author, published, type
FROM #x
SORT saved DESC</code></pre>
</section>

<section>
  <h2>¿Por qué no un web clipper?</h2>
  <p>Los clippers genéricos se atascan con X: la página exige iniciar sesión, el contenido se carga de forma dinámica y los hilos están repartidos en muchos posts.
  Xtracticle lee directamente los datos del post, así que los artículos de X conservan sus títulos y listas, y los hilos llegan como una sola nota.</p>
</section>

${shortcuts('es')}`,
  faq: [
    { q: 'No pasa nada al pulsar Obsidian.', a: 'Obsidian tiene que estar instalado en este dispositivo. El Markdown también se copia al portapapeles, así que puedes pegarlo en cualquier nota.' },
    { q: '¿Funciona con Obsidian en iPhone o Android?', a: 'Sí, si tienes la app de Obsidian instalada. Si no, usa Copiar o descarga el archivo .md.' },
    { q: '¿Cómo guardo las imágenes dentro de mi bóveda?', a: 'Descarga ZIP + imágenes y descomprímelo en tu bóveda. Los enlaces del Markdown apuntan a la carpeta local de imágenes.' },
    { q: '¿Funciona con Logseq, Notion o Bear?', a: 'Sí: descarga o copia el Markdown e impórtalo o pégalo.' },
  ],
};

const alternative: SitePage = {
  id: 'es-tra',
  group: 'tra',
  path: '/es/alternativa-a-thread-reader-app',
  file: 'es/alternativa-a-thread-reader-app.html',
  lang: 'es',
  title: 'Alternativa gratis a Thread Reader App: PDF y Markdown | Xtracticle',
  description:
    '¿Buscas una alternativa a Thread Reader App? Xtracticle desenrolla hilos y guarda artículos de X en PDF, Markdown o EPUB gratis: sin bots, sin anuncios ni registro.',
  h1: 'Una alternativa gratis a Thread Reader App',
  sub: 'Desenrolla hilos de X y guarda artículos de X en PDF, Markdown, EPUB o texto — gratis, sin mencionar bots, sin anuncios y sin iniciar sesión.',
  primary: 'pdf',
  nav: 'Alternativa a Thread Reader App',
  sections: `
<section>
  <h2>Por qué la gente busca una alternativa</h2>
  <p><a href="https://threadreaderapp.com" rel="nofollow noopener">Thread Reader App</a> es una forma muy conocida de desenrollar hilos:
  mencionas <code>@threadreaderapp unroll</code> debajo de un hilo o pegas un enlace en su web. Para leer funciona bien.
  El problema aparece cuando quieres <strong>conservar</strong> lo que lees:</p>
  <ul>
    <li><strong>Exportar a PDF es una función Premium</strong> (3 $/mes o 30 $/año en el momento de escribir esto).</li>
    <li><strong>No admite artículos de X</strong> — su página de ayuda indica que la API de X no da acceso al contenido de los artículos.</li>
    <li><strong>La versión gratuita muestra anuncios</strong> y no ofrece exportación a Markdown, EPUB ni Obsidian.</li>
  </ul>
  <p>Xtracticle se centra justo en esa parte: convertir hilos y artículos largos de X en archivos que son tuyos, gratis.</p>
</section>

<section>
  <h2>Comparación lado a lado</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Xtracticle</th><th>Thread Reader App</th></tr></thead>
    <tbody>
      <tr><td>Desenrollar hilos</td><td>✅ Pega cualquier post del hilo</td><td>✅ Menciona al bot o pega un enlace</td></tr>
      <tr><td>Artículos de X (formato largo)</td><td>✅ Títulos, listas, imágenes, vídeos</td><td>❌ No compatible</td></tr>
      <tr><td>PDF</td><td>✅ Gratis</td><td>Premium</td></tr>
      <tr><td>Markdown / Obsidian</td><td>✅ Gratis, con front-matter YAML</td><td>❌</td></tr>
      <tr><td>EPUB / Kindle</td><td>✅ Gratis</td><td>❌</td></tr>
      <tr><td>ZIP con imágenes (archivo sin conexión)</td><td>✅ Gratis</td><td>❌</td></tr>
      <tr><td>Descarga por lotes</td><td>✅ Hasta 20 enlaces</td><td>❌</td></tr>
      <tr><td>Anuncios</td><td>Ninguno</td><td>En el plan gratuito</td></tr>
      <tr><td>Publicar en abierto / etiquetar a un bot</td><td>Nunca hace falta</td><td>Con el método del bot</td></tr>
      <tr><td>Alertas de autores y archivado automático</td><td>❌ Todavía no</td><td>✅ Premium</td></tr>
      <tr><td>Código abierto</td><td>✅ MIT</td><td>❌</td></tr>
    </tbody>
  </table></div>
  <p><small>Comprobado con las páginas <a href="https://threadreaderapp.com/premium" rel="nofollow noopener">Premium</a> y
  <a href="https://threadreaderapp.com/help" rel="nofollow noopener">Help</a> de Thread Reader App en septiembre de 2026. Las funciones cambian: avísanos en
  <a href="${GITHUB}/issues" rel="noopener">GitHub</a> si algo está desactualizado.</small></p>
</section>

<section>
  <h2>Cambiarte lleva diez segundos</h2>
  ${steps([
    '<strong>Copia el enlace</strong> de cualquier post del hilo, no hace falta buscar el primero.',
    '<strong>Pégalo arriba</strong> y pulsa Extraer. El hilo completo se une y se numera.',
    '<strong>Descárgalo</strong> en PDF, Markdown, EPUB o texto, o envíalo a Obsidian.',
  ])}
</section>

<section>
  <h2>Cuándo Thread Reader App sigue siendo la mejor opción</h2>
  <p>Si quieres <strong>desenrollar un hilo para otras personas dentro de X</strong> (respondiendo con el bot para que todos en la conversación reciban un
  enlace legible), o quieres <strong>alertas y archivos automáticos</strong> de tus autores favoritos, Thread Reader App lo hace y
  Xtracticle no. Mucha gente usa los dos: Thread Reader App para leer en el momento y Xtracticle para guardar una copia.</p>
</section>

${shortcuts('es')}`,
  faq: [
    { q: '¿Xtracticle es gratis de verdad?', a: 'Sí. Todos los formatos (PDF, Markdown, EPUB, ZIP y texto) son gratis, sin anuncios, sin iniciar sesión y sin límites de uso. El código es abierto.' },
    { q: '¿Xtracticle puede descargar artículos de X?', a: 'Sí. Xtracticle convierte los artículos largos de X con sus títulos, listas, enlaces, imágenes y vídeos. Es una de las principales diferencias con Thread Reader App.' },
    { q: '¿Tengo que etiquetar a un bot?', a: 'No. Pega el enlace en Xtracticle; no se publica nada en X.' },
    { q: '¿Puedo importar mi archivo de Thread Reader App?', a: 'No directamente. Puedes pegar los enlaces originales de X (hasta 20 a la vez en Modo lote) para recrearlos como archivos Markdown.' },
  ],
};

export const PAGES_ES: SitePage[] = [home, pdf, markdown, thread, epub, obsidian, alternative];
