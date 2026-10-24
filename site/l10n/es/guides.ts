/**
 * Guías en español: artículos informativos sobre los Artículos de X (Twitter), los hilos y el archivado.
 * Los datos sobre X se escriben "a la fecha de redacción (octubre de 2026)" porque X cambia estas reglas a menudo.
 */
import { archiveCheck, privacy, type FAQ, type ExportKey, type SitePage } from '../../blocks';

const HUB = '/es/guias';
const WHEN = 'a la fecha de redacción (octubre de 2026)';
const WHEN_CAP = 'A la fecha de redacción (octubre de 2026)';

const back = `<p><a href="${HUB}">← Todas las guías</a></p>`;

const takeaways = (items: string[]) =>
  `<section>
  <h2>Puntos clave</h2>
  <ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>
</section>`;

interface GuideInput {
  slug: string;
  title: string;
  description: string;
  h1: string;
  sub: string;
  primary: ExportKey;
  sections: string;
  faq: FAQ[];
}

/** Spanish slug → English guide slug; `group` must match the English page so hreflang links the versions. */
const EN_SLUG: Record<string, string> = {
  'que-son-los-articulos-de-x': 'what-are-x-articles',
  'leer-articulos-de-x-sin-cuenta': 'read-x-articles-without-account',
  'recuperar-tweets-borrados': 'recover-deleted-tweets',
  'articulos-de-x-vs-substack': 'x-articles-vs-substack',
  'copia-de-seguridad-articulos-de-x': 'backup-x-articles',
  'como-ver-tweets-borrados': 'how-to-see-deleted-tweets',
  'encontrar-tweets-en-wayback-machine': 'find-tweets-on-wayback-machine',
  'como-escribir-un-articulo-en-x': 'how-to-write-x-article',
  'limites-de-los-articulos-de-x': 'x-articles-limits',
};

const guide = (g: GuideInput): SitePage => ({
  id: `es-guide-${EN_SLUG[g.slug]}`,
  group: `guide-${EN_SLUG[g.slug]}`,
  path: `${HUB}/${g.slug}`,
  file: `es/guias/${g.slug}.html`,
  lang: 'es',
  title: g.title,
  description: g.description,
  h1: g.h1,
  sub: g.sub,
  primary: g.primary,
  nav: '',
  sections: `${g.sections}\n${back}`,
  faq: g.faq,
});

/* Enlaces internos reutilizados */
const L = {
  home: '/es/',
  pdf: '/es/articulo-de-x-a-pdf',
  md: '/es/articulo-de-x-a-markdown',
  epub: '/es/articulo-de-x-a-epub-kindle',
  thread: '/es/hilo-de-twitter-a-pdf',
  obsidian: '/es/guardar-articulos-de-x-en-obsidian',
  tweet: '/es/tweet-a-pdf',
  unroll: '/es/desenrollar-hilo-de-twitter',
};

/* ─── 1. Qué son los artículos de X ─── */

const whatAre = guide({
  slug: 'que-son-los-articulos-de-x',
  title: 'Qué son los artículos de X y cómo guardarlos | Xtracticle',
  description:
    'Los artículos de X son posts largos con títulos, imágenes y listas. Quién puede publicarlos, en qué se diferencian de un hilo y cómo guardarlos.',
  h1: '¿Qué son los artículos de X?',
  sub: 'Los artículos de X son publicaciones largas y con formato que se publican directamente en X: quién puede escribirlos, en qué se diferencian de los hilos y cómo conservar una copia.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Un artículo de X es una publicación larga y con formato (títulos, imágenes, listas) que se publica de forma nativa en X, en lugar de una cadena de posts cortos.',
  `Publicar es una función de pago: ${WHEN}, X indica que está limitada a suscriptores de Premium, Premium+, Premium Business y Premium Organizations. Leer no tiene ese requisito.`,
  'Los artículos son distintos de los hilos (muchos posts cortos enlazados) y de los posts largos sueltos.',
  'Para conservar uno, pega su enlace en <a href="/es/">Xtracticle</a> y descárgalo en PDF, Markdown, EPUB o ZIP.',
])}

<section>
  <h2>Qué es un artículo de X</h2>
  <p>Un artículo de X es un texto largo que vive en X como un único documento. En lugar de dividir una idea en un hilo numerado, el autor escribe un solo artículo con título, una imagen de portada opcional y texto estructurado. El centro de ayuda de X describe los artículos como "una nueva forma de compartir contenido escrito de formato largo en X".</p>
  <p>Según guías de terceros, los artículos pueden llegar a unos 100.000 caracteres, muy por encima de los 280 de un post clásico. Que nosotros sepamos, X no ha publicado una cifra concreta en su página de ayuda, así que toma ese número como aproximado.</p>

  <h2>Quién puede publicar artículos de X</h2>
  <p>X lanzó los artículos en marzo de 2024 como función de Premium+. En enero de 2026 amplió el acceso a todos los suscriptores de Premium, según informó <a href="https://www.storyboard18.com/digital/x-expands-long-form-articles-access-to-all-premium-subscribers-87544.htm" rel="noopener nofollow">Storyboard18</a>. La propia <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">página de ayuda de artículos</a> de X dice que publicar está limitado a suscriptores de Premium y Premium+, Premium Businesses y Premium Organizations.</p>
  <p>Cualquiera puede leer un artículo publicado, según los controles de audiencia que haya elegido su autor. No necesitas pagar para leer uno.</p>
</section>

<section>
  <h2>Artículos de X frente a posts, hilos y notas</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Post</th><th>Hilo</th><th>Artículo de X</th></tr></thead>
    <tbody>
      <tr><td>Estructura</td><td>Un post corto</td><td>Varios posts enlazados de un mismo autor</td><td>Un documento con título</td></tr>
      <tr><td>Formato</td><td>Texto plano, medios</td><td>Texto plano, medios en cada post</td><td>Títulos, negrita, cursiva, listas, medios incrustados</td></tr>
      <tr><td>Flujo de lectura</td><td>Cronología</td><td>Desplazarse por respuestas a uno mismo</td><td>Vista de lectura propia</td></tr>
      <tr><td>Quién puede crearlo</td><td>Cualquiera</td><td>Cualquiera</td><td>Suscriptores de pago</td></tr>
    </tbody>
  </table></div>
  <p>Un hilo sigue siendo un conjunto de posts, así que cada parte puede recibir "me gusta", respuestas y citas por separado. Un artículo se lee como una sola pieza. Los posts largos sueltos, disponibles para algunos suscriptores, siguen siendo posts normales y no tienen títulos.</p>
</section>

<section>
  <h2>Funciones de formato</h2>
  <p>Según la página de ayuda de X, los artículos pueden contener imágenes, vídeo, GIF, posts incrustados y enlaces, y el texto admite títulos, subtítulos, negrita, cursiva, tachado, sangría y listas numeradas o con viñetas. Eso los acerca más a una entrada de blog que a un hilo.</p>

  <h2>Cómo encontrar artículos de X</h2>
  <ul>
    <li>Abre la pestaña <strong>Artículos</strong> en la navegación lateral de X en escritorio, si está disponible para tu cuenta.</li>
    <li>Mira el perfil de un autor: sus artículos aparecen junto a sus posts.</li>
    <li>Busca términos que aparezcan en el título y filtra por las personas a las que sigues.</li>
    <li>Para una lista semanal seleccionada a mano (en inglés), consulta <a href="/best-x-articles">Best X Articles</a>.</li>
  </ul>
  <p>Al compartir un artículo, X puede darte un enlace de lectura del tipo <code>x.com/i/article/…</code>. El enlace del post, <code>x.com/usuario/status/…</code>, es el que esperan la mayoría de las herramientas.</p>
</section>

<section>
  <h2>Cómo guardar un artículo de X</h2>
  <p>X no tiene un botón integrado de "exportar a PDF" para el artículo de otra persona. Las opciones prácticas son:</p>
  <ol>
    <li><strong>Imprimir desde el navegador.</strong> Funciona, pero incluye la interfaz de X y a menudo corta las imágenes entre páginas.</li>
    <li><strong>Copiar y pegar.</strong> Pierde casi todo el formato y las imágenes.</li>
    <li><strong>Xtracticle.</strong> Pega el enlace del post y descarga un archivo limpio con título, autor, fecha, enlace a la fuente e imágenes: <a href="${L.pdf}">artículo de X a PDF</a>, <a href="${L.md}">Markdown</a> o <a href="${L.epub}">EPUB para Kindle</a>.</li>
  </ol>
  <p>Guardar una copia importa porque los autores pueden borrar sus posts o estos pueden desaparecer si se suspende una cuenta. Consulta <a href="${HUB}/recuperar-tweets-borrados">qué se puede y qué no se puede recuperar</a>.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Qué es un artículo de X?', a: 'Un artículo de X es una publicación larga que se publica de forma nativa en X, con título, títulos internos, listas, imágenes y otros medios, en lugar de una cadena de posts cortos.' },
    { q: '¿Quién puede publicar artículos de X?', a: 'A la fecha de redacción (octubre de 2026), X indica que publicar está limitado a suscriptores de Premium, Premium+, Premium Business y Premium Organizations. Se abrió a todos los niveles de Premium en enero de 2026, tras lanzarse como función de Premium+ en marzo de 2024.' },
    { q: '¿Tengo que pagar para leer un artículo de X?', a: 'No. Cualquiera puede leer los artículos publicados, según la configuración de audiencia que haya elegido el autor.' },
    { q: '¿En qué se diferencia un artículo de X de un hilo?', a: 'Un hilo es una serie de posts independientes, cada uno con sus propios "me gusta" y respuestas. Un artículo es un único documento con formato, con título y encabezados.' },
    { q: '¿Cómo guardo un artículo de X en PDF?', a: 'Copia el enlace del post, pégalo en Xtracticle y haz clic en PDF. Obtienes un archivo A4 limpio con imágenes y un enlace al original.' },
  ],
});

/* ─── 2. Leer sin cuenta ─── */

const readWithout = guide({
  slug: 'leer-articulos-de-x-sin-cuenta',
  title: 'Leer artículos e hilos de X sin cuenta | Xtracticle',
  description:
    'Cómo leer artículos, hilos y posts de X (Twitter) sin iniciar sesión: qué funciona, qué bloquea X y el truco de cambiar x.com por xtracticle.com.',
  h1: 'Cómo leer artículos de X sin cuenta',
  sub: 'Resumen: cambia x.com por xtracticle.com en la dirección y el artículo público se abre completo, sin iniciar sesión.',
  primary: 'pdf',
  sections: `
${takeaways([
  'X suele mostrar a los visitantes sin sesión un aviso de inicio de sesión, una vista recortada o un hilo incompleto, y este comportamiento cambia con el tiempo.',
  'Sustituye <code>x.com</code> por <code>xtracticle.com</code> en la barra de direcciones para leer el artículo, hilo o post público completo sin iniciar sesión.',
  'Esto solo funciona con contenido público. No se pueden mostrar cuentas protegidas, posts eliminados ni posts con restricción de edad.',
  'Después puedes descargar lo que estás leyendo en PDF, Markdown o EPUB.',
])}

<section>
  <h2>Qué pasa al abrir X sin iniciar sesión</h2>
  <p>Que un visitante sin sesión vea un post completo depende del tipo de contenido, del país y de la política vigente de X, que ha cambiado más de una vez. En la práctica puedes ver un post suelto pero no las respuestas, un aviso para iniciar sesión o un hilo parcial. Como las reglas cambian, no prometemos ningún comportamiento concreto de x.com.</p>
  <p>Aun así, lo público es público. Si el autor no ha protegido su cuenta, cualquiera puede leer el post. El problema es solo lo cómodo que resulta hacerlo en el sitio oficial sin iniciar sesión.</p>
</section>

<section>
  <h2>Método 1: cambia el dominio</h2>
  <p>En cualquier post o artículo de X, cambia <code>x.com</code> por <code>xtracticle.com</code> en la barra de direcciones y pulsa Enter.</p>
  ${'<p><code>x.com/usuario/status/123</code> → <code>xtracticle.com/usuario/status/123</code></p>'}
  <p>La página carga el contenido público a través de la API de código abierto FxTwitter y lo muestra como texto legible con imágenes. Sin cuenta, sin banner de cookies encima del artículo y sin instalar ninguna app. Los hilos se desenrollan en una sola página al abrir cualquier post del hilo.</p>
  <p>En el móvil también hay una opción de un toque: añade el Atajo de iPhone o el bookmarklet para el navegador desde la <a href="${L.home}">página principal</a>.</p>

  <h2>Método 2: pega el enlace</h2>
  ${'<ol class="xt-steps"><li>En la app de X o en el sitio, toca <em>Compartir → Copiar enlace</em>.</li><li>Abre <a href="/es/">xtracticle.com</a> y pega el enlace.</li><li>Léelo allí, o descárgalo en <a href="/es/articulo-de-x-a-pdf">PDF</a> para leerlo sin conexión.</li></ol>'}
  <p>Si el enlace se parece a <code>x.com/i/article/…</code>, abre el artículo en X y copia en su lugar el enlace del post (el que lleva <code>/status/</code>).</p>
</section>

<section>
  <h2>Qué funciona y qué no</h2>
  <div class="xt-table-wrap"><table>
    <thead><tr><th>Contenido</th><th>Sin iniciar sesión con Xtracticle</th></tr></thead>
    <tbody>
      <tr><td>Artículo público de X</td><td>Sí, con texto completo, formato e imágenes</td></tr>
      <tr><td>Hilo público</td><td>Sí, los posts del propio autor unidos en orden</td></tr>
      <tr><td>Post público suelto, con fotos y post citado</td><td>Sí</td></tr>
      <tr><td>Respuestas de otras personas</td><td>No, se dejan fuera</td></tr>
      <tr><td>Cuentas protegidas (privadas)</td><td>No</td></tr>
      <tr><td>Contenido eliminado o suspendido</td><td>No</td></tr>
      <tr><td>Posts con restricción de edad o solo para usuarios con sesión</td><td>A menudo no</td></tr>
    </tbody>
  </table></div>
  <p>Si algo aparece como "no encontrado", casi siempre corresponde a una de las tres últimas filas.</p>
</section>

<section>
  <h2>Otras formas de leer sin cuenta</h2>
  <ul>
    <li><strong>Un resultado de buscador.</strong> Algunos posts muestran una vista previa, pero normalmente es solo un fragmento.</li>
    <li><strong>El PDF o la captura de otra persona.</strong> Sirve para leer, pero no puedes comprobar que coincida con el original.</li>
    <li><strong>Un resumen por RSS o correo</strong> del autor, si lo ofrece.</li>
  </ul>
  <p>Si lees contenido de X con frecuencia, guardar lo bueno es más fácil que volver a buscarlo. La página de <a href="${L.thread}">hilo de X a PDF</a> cubre los hilos largos.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Puedo leer artículos de X sin cuenta?', a: 'Los artículos públicos se pueden leer sin cuenta cambiando x.com por xtracticle.com en la dirección, o pegando el enlace en Xtracticle. Los posts protegidos o eliminados no se pueden mostrar.' },
    { q: '¿Cómo funciona el truco de x.com a xtracticle.com?', a: 'Xtracticle usa la misma ruta que X. Si cambias solo el dominio, por ejemplo de x.com/usuario/status/123 a xtracticle.com/usuario/status/123, se abre ese post aquí.' },
    { q: '¿Muestra las respuestas?', a: 'No. En los hilos muestra los posts escritos por el autor original. Las respuestas de otros usuarios se dejan fuera.' },
    { q: '¿Por qué un post dice que no se encontró?', a: 'El post puede estar eliminado, ser de una cuenta protegida o suspendida, o tener restricción de edad. Solo se pueden mostrar posts públicos.' },
    { q: '¿Es legal leer posts de esta manera?', a: 'Lee contenido que el autor publicó de forma pública. Respeta los derechos de autor: guardar una copia para tu lectura personal no es lo mismo que republicarla.' },
  ],
});

/* ─── 3. Recuperar tweets borrados ─── */

const deleted = guide({
  slug: 'recuperar-tweets-borrados',
  title: 'Cómo recuperar tweets borrados: 4 sitios donde buscar (2026) | Xtracticle',
  description:
    'Recupera posts borrados de X (Twitter): tu archivo de datos antiguo, Wayback Machine, archive.today y capturas. Pega el enlace y busca en los archivos con un clic.',
  h1: '¿Se pueden recuperar tweets borrados?',
  sub: 'A veces, pero rara vez desde el propio X. Estas son las opciones que existen, qué tan fiable es cada una y cómo evitar necesitarlas.',
  primary: 'zip',
  sections: `
${takeaways([
  'Cuando se borra un post, X deja de mostrarlo, y herramientas como Xtracticle tampoco pueden obtenerlo.',
  'Tus propios posts borrados solo se pueden recuperar si tienes un archivo de datos de X anterior al borrado.',
  'Los posts borrados de otras personas sobreviven solo si alguien los guardó: Wayback Machine, archive.today o una captura de pantalla. La cobertura es irregular.',
  'La solución fiable es guardar los posts y artículos importantes mientras siguen en línea, en PDF o en ZIP con imágenes.',
])}

${archiveCheck('es')}

<section>
  <h2>La respuesta honesta</h2>
  <p>No existe un botón de "deshacer el borrado". Cuando un autor elimina un post, X deja de mostrarlo, y cualquier herramienta que lea posts públicos, incluida <a href="/es/">Xtracticle</a>, lo reportará como no encontrado. Solo queda la copia que alguien hizo antes. Todo lo que sigue son maneras de buscar esa copia, y ninguna está garantizada.</p>
</section>

<section>
  <h2>Opción 1: tu propio archivo de datos de X</h2>
  <p>Si el post borrado era tuyo, revisa cualquier archivo de tu cuenta que hayas descargado antes de borrarlo. X te permite solicitar uno en <em>Configuración y privacidad → Tu cuenta → Descargar un archivo de tus datos</em>, tras verificar tu identidad. Según la <a href="https://help.x.com/articles/20170320" rel="noopener nofollow">página de ayuda</a> de X, recibes un correo o una notificación cuando está listo y descargas un archivo .zip con la sesión iniciada. Un archivo nuevo creado después del borrado no contendrá el post, así que esto solo ayuda si ya tenías uno anterior.</p>

  <h2>Opción 2: Wayback Machine</h2>
  <p>La <a href="https://web.archive.org/" rel="noopener nofollow">Wayback Machine</a> del Internet Archive a veces conserva una captura de un post o de un perfil. Pega la URL exacta del post (<code>x.com/usuario/status/…</code>, y prueba también la forma antigua con <code>twitter.com</code>) en el cuadro de búsqueda y abre el calendario de capturas. Informes de terceros dicen que X ha dificultado que los archivadores capturen perfiles de forma fiable, y que la cobertura es mayor para cuentas muy conocidas o páginas que alguien guardó manualmente. Para un post poco conocido que se borró enseguida, no esperes resultados.</p>
  <p>También puedes añadir tú mismo una página en vivo con Save Page Now en <code>web.archive.org/save/</code>. Eso solo sirve si lo haces antes del borrado.</p>

  <h2>Opción 3: archive.today y servicios similares</h2>
  <p>Servicios como archive.today permiten que cualquiera haga una captura de una página. Busca allí la URL del post. Igual que con Wayback Machine, solo existe si alguien la guardó antes.</p>
</section>

<section>
  <h2>Opción 4: caché de buscadores y capturas de pantalla</h2>
  <ul>
    <li><strong>Caché de buscadores.</strong> Google retiró sus enlaces públicos de "caché", así que en 2026 es una vía casi sin salida. Los resultados de búsqueda pueden seguir mostrando un fragmento antiguo durante un tiempo tras el borrado, pero no puedes depender de ello.</li>
    <li><strong>Capturas de pantalla de otras personas.</strong> Las citas, respuestas y noticias suelen incluir capturas. Son evidencia de que el post existió, no prueba de lo que decía exactamente, porque las capturas son fáciles de falsificar.</li>
    <li><strong>Citas del post borrado.</strong> Una cita de un post borrado normalmente lo muestra como no disponible, así que no esperes que conserve el texto.</li>
  </ul>
  <p>Desconfía de los sitios que prometen "recuperar cualquier tweet borrado". No pueden obtener datos que X ha eliminado; como mucho buscan en los mismos archivos que se mencionan arriba.</p>
</section>

<section>
  <h2>La solución real: guárdalo mientras está en línea</h2>
  <p>Si un post o artículo te importa, ya sea una fuente para tu trabajo, un comprobante, un anuncio o algo que quizá debas citar, guárdalo ahora:</p>
  <ul>
    <li>El <a href="${L.pdf}">PDF</a> conserva el diseño, las imágenes, el autor, la fecha y un enlace al original, y es fácil de compartir.</li>
    <li>El <strong>ZIP con imágenes</strong> guarda el Markdown y cada imagen como archivos independientes: un archivo duradero para usar sin conexión.</li>
    <li>El <strong>Modo lote</strong> acepta hasta 20 enlaces a la vez en un solo ZIP.</li>
  </ul>
  <p>Una copia guardada muestra lo que decía el post cuando lo guardaste. No prueba su autenticidad ante un tercero, pero registra la fecha, el autor y el enlace a la fuente. Para tus propias copias de seguridad, consulta <a href="${HUB}/copia-de-seguridad-articulos-de-x">cómo hacer copia de seguridad de tus artículos e hilos de X</a>.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Puedo recuperar un tweet borrado?', a: 'Solo si existe una copia en otro lugar: un archivo de datos de X anterior de tu cuenta, una captura de Wayback Machine o archive.today, o una captura de pantalla. X no restaura los posts eliminados.' },
    { q: '¿Xtracticle puede descargar un post borrado?', a: 'No. Xtracticle lee posts públicos que siguen en línea. Un post borrado se reporta como no encontrado, y por eso es importante guardar a tiempo los posts relevantes.' },
    { q: '¿Wayback Machine tiene tweets borrados?', a: 'A veces. Solo funciona si el post o el perfil se capturó antes del borrado, y la cobertura es irregular: sobre todo cuentas conocidas o páginas que alguien guardó manualmente.' },
    { q: '¿X conserva los posts borrados en mi archivo de datos?', a: 'Un archivo creado después de borrar un post no lo incluye. Un archivo que descargaste antes seguirá conteniendo lo que tenía en ese momento.' },
    { q: '¿Cómo protejo un post antes de que desaparezca?', a: 'Pega el enlace en Xtracticle y descarga un PDF, o un ZIP con imágenes si también quieres los medios como archivos.' },
  ],
});

/* ─── 4. Artículos de X vs Substack vs Medium ─── */

const versus = guide({
  slug: 'articulos-de-x-vs-substack',
  title: 'Artículos de X vs Substack vs Medium, comparados | Xtracticle',
  description:
    'Artículos de X, Substack y Medium comparados para escritores: audiencia, monetización, propiedad, opciones de exportación y SEO. Y cómo respaldar tus artículos.',
  h1: 'Artículos de X vs Substack vs Medium',
  sub: 'Tres lugares para publicar textos largos, comparados en audiencia, dinero, propiedad, exportación y visibilidad en buscadores.',
  primary: 'md',
  sections: `
${takeaways([
  'Los artículos de X te dan alcance inmediato dentro de X, pero con menos control: no hay lista de suscriptores ni exportación integrada de artículos.',
  'Substack gira en torno a una lista de correo que puedes exportar, y se queda con una parte de las suscripciones de pago.',
  'Medium paga a sus miembros según el tiempo de lectura y tiene descubrimiento integrado, pero tu audiencia pertenece a la plataforma.',
  'Muchos escritores usan X para darse a conocer y un newsletter o blog como base. En cualquier caso, respalda tus artículos de X en Markdown.',
])}

<section>
  <h2>De un vistazo</h2>
  <p>Las reglas y comisiones de las plataformas cambian. La tabla resume cómo funciona cada una ${WHEN}; consulta los términos vigentes de cada plataforma antes de decidir.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Artículos de X</th><th>Substack</th><th>Medium</th></tr></thead>
    <tbody>
      <tr><td>Audiencia principal</td><td>Tus seguidores y la cronología de X</td><td>Suscriptores por correo</td><td>Lectores y miembros de Medium</td></tr>
      <tr><td>Quién puede publicar</td><td>Suscriptores de los niveles Premium</td><td>Cualquiera</td><td>Cualquiera</td></tr>
      <tr><td>Monetización</td><td>Pagos a creadores de X basados en la interacción de usuarios Premium</td><td>Suscripciones de pago; Substack cobra un 10 % más las comisiones de procesamiento de pagos</td><td>Programa de socios, con pagos según el tiempo de lectura de los miembros</td></tr>
      <tr><td>Propiedad de la audiencia</td><td>Seguidores, no una lista que puedas exportar</td><td>La lista de suscriptores se puede exportar</td><td>Seguidores y correo dentro de la plataforma</td></tr>
      <tr><td>Exportación de publicaciones</td><td>Sin exportación integrada de artículos</td><td>Exporta publicaciones y suscriptores</td><td>Exportación de los datos de la cuenta</td></tr>
    </tbody>
  </table></div>
</section>

<section>
  <h2>Audiencia y descubrimiento</h2>
  <p><strong>Los artículos de X</strong> están donde ya hay una audiencia. Si tienes seguidores, un artículo puede llegar a ellos sin ningún registro nuevo, y los buenos posts pueden difundirse con los reposts. La otra cara es que la cronología decide qué se ve, y los seguidores no son una lista que controles.</p>
  <p><strong>Substack</strong> entrega las publicaciones en la bandeja de entrada de los suscriptores, así que el alcance es más predecible pero parte de cero. También tiene sus propias recomendaciones y su app.</p>
  <p><strong>Medium</strong> tiene lectores y feeds por temas integrados, lo que ayuda a que los escritores nuevos sean encontrados. Sin embargo, gran parte de la audiencia funciona con un modelo de membresía con límite de lecturas, y el alcance depende de la distribución de Medium.</p>

  <h2>Monetización</h2>
  <p>X cambió en noviembre de 2024 los pagos a creadores para basarlos en la interacción de suscriptores Premium en lugar de los ingresos publicitarios (<a href="https://www.mediapost.com/publications/article/400171/x-ends-ad-revenue-share-for-creators-focuses-on-p.html" rel="noopener nofollow">MediaPost</a>). Substack te deja fijar los precios de las suscripciones de pago y cobra un 10 % más las comisiones de Stripe (<a href="https://faq.substack.com/p/how-do-paid-subscriptions-on-substack" rel="noopener nofollow">Substack FAQ</a>). Medium reparte las cuotas de membresía según el tiempo de lectura de los miembros (<a href="https://help.medium.com/hc/en-us/articles/360036691193" rel="noopener nofollow">Medium Help</a>). Los ingresos en las tres varían mucho, y no citamos cifras.</p>
</section>

<section>
  <h2>Propiedad y portabilidad</h2>
  <p>Esta es la mayor diferencia. Una publicación de Substack incluye una lista de suscriptores exportable y publicaciones exportables, así que puedes mudarte a otra plataforma. X ofrece un archivo de datos de la cuenta con tus posts, pero, hasta donde sabemos, los artículos no están claramente incluidos, y no hay una exportación de tus artículos con un clic. Medium te permite descargar los datos de tu cuenta, aunque tus lectores se quedan en Medium.</p>
  <p>Si publicas artículos en X, guarda tu propia copia. La <a href="${L.md}">exportación a Markdown de Xtracticle</a> convierte un artículo en un archivo .md limpio (con front-matter opcional) que puedes reutilizar en un blog, en Substack o en Obsidian. La <a href="${HUB}/copia-de-seguridad-articulos-de-x">guía de copia de seguridad</a> muestra un flujo de trabajo.</p>

  <h2>SEO e indexación</h2>
  <p>Las páginas de Substack y Medium son páginas web públicas normales que los buscadores indexan. El contenido de X también se indexa, pero X es una app pesada y orientada al inicio de sesión, y cuánto de un artículo es rastreable o se muestra a usuarios sin sesión cambia con el tiempo. Considera X como un canal de distribución y tu propio dominio o newsletter como el lugar que gana tráfico de búsqueda duradero.</p>
</section>

<section>
  <h2>¿Cuál elegir?</h2>
  <ul>
    <li><strong>Ya tienes seguidores en X</strong> y quieres probar contenido largo: publica en X y copia las mejores piezas a un newsletter.</li>
    <li><strong>Quieres una relación con suscriptores y un nivel de pago:</strong> Substack.</li>
    <li><strong>Quieres que te descubran lectores que no te conocen:</strong> Medium, con las contrapartidas descritas arriba.</li>
  </ul>
  <p>No son excluyentes. Una configuración habitual es escribir una vez, publicar en tu propio newsletter y compartir en X.</p>
</section>`,
  faq: [
    { q: '¿Los artículos de X son mejores que Substack?', a: 'Sirven para objetivos distintos. Los artículos de X llegan directamente a tus seguidores actuales en X; Substack te da una lista de correo exportable y suscripciones de pago. Muchos escritores usan ambos.' },
    { q: '¿Puedo exportar mis artículos de X?', a: 'X no tiene una exportación de artículos con un clic. Puedes guardar cada uno como Markdown, PDF o ZIP con Xtracticle pegando su enlace.' },
    { q: '¿Cómo gana dinero Substack con los escritores?', a: 'A la fecha de redacción (octubre de 2026), Substack se queda con el 10 % de los ingresos por suscripciones de pago, más las comisiones de procesamiento de pagos de Stripe. Consulta su FAQ para ver los términos vigentes.' },
    { q: '¿Cómo paga Medium a los escritores?', a: 'A través del Programa de socios, que reparte las cuotas de membresía según el tiempo que los miembros leen o escuchan las historias de un escritor.' },
    { q: '¿Cuál es mejor para SEO?', a: 'El contenido en tu propio dominio o en el archivo de tu newsletter suele dar la visibilidad de búsqueda más duradera. Las páginas de Substack y Medium son páginas web públicas; X es sobre todo un canal de distribución social.' },
  ],
});

/* ─── 5. Copia de seguridad ─── */

const backup = guide({
  slug: 'copia-de-seguridad-articulos-de-x',
  title: 'Copia de seguridad de tus artículos e hilos de X | Xtracticle',
  description:
    'Respalda tus artículos e hilos de X: qué cubre el archivo de datos de X, exportaciones a Markdown y ZIP con imágenes, flujo con Obsidian y Modo lote.',
  h1: 'Cómo hacer copia de seguridad de tus artículos e hilos de X',
  sub: 'Un plan de dos capas para escritores: el archivo de la cuenta de X como red de seguridad, más archivos Markdown o ZIP por artículo que sí puedes abrir y reutilizar.',
  primary: 'md',
  sections: `
${takeaways([
  'Conviene solicitar el archivo de datos de la cuenta de X, pero según lo que pudimos verificar, está pensado en torno a posts, medios y datos de la cuenta, y puede que no incluya tus artículos como documentos legibles.',
  'Para cada artículo o hilo, exporta Markdown o un ZIP con imágenes usando <a href="/es/articulo-de-x-a-markdown">Xtracticle</a>.',
  'El Modo lote acepta hasta 20 enlaces y devuelve un solo ZIP.',
  'Guarda los archivos en Obsidian, Notion o una carpeta sincronizada con una segunda copia.',
])}

<section>
  <h2>Capa 1: el archivo de datos de la cuenta de X</h2>
  <p>Solicítalo en la app de X o en el sitio: <em>Configuración y privacidad → Tu cuenta → Descargar un archivo de tus datos</em>. Verificas tu identidad con un código enviado a tu correo o teléfono, tocas <em>Solicitar datos</em> y X te avisa cuando está listo. Luego descargas el .zip desde la configuración con la sesión iniciada (<a href="https://help.x.com/articles/20170320" rel="noopener nofollow">X Help</a>). Guías de terceros señalan que el enlace de descarga puede caducar tras poco tiempo, así que descárgalo cuanto antes.</p>
  <h3>Qué cubre</h3>
  <p>El archivo se organiza en archivos de datos más carpetas de medios: tus posts, los datos de tu cuenta y más. Sirve como registro de que escribiste algo y cuándo.</p>
  <h3>La salvedad para los artículos</h3>
  <p>No encontramos ninguna documentación de X que indique que los artículos se incluyan como documentos con formato, y las descripciones del contenido del archivo mencionan posts, no artículos. Abre tu propio archivo y compruébalo antes de confiar en él; no lo hemos verificado para todas las cuentas. Aunque el texto esté ahí, se guarda como archivos de datos, no como un artículo legible con su diseño y sus imágenes.</p>
</section>

<section>
  <h2>Capa 2: exporta tú mismo cada artículo</h2>
  <h3>Un artículo o un hilo</h3>
  ${'<ol class="xt-steps"><li>Abre tu artículo en X y toca <em>Compartir → Copiar enlace</em>. (Si el enlace contiene <code>/i/article/</code>, usa en su lugar el enlace del post con <code>/status/</code>.)</li><li>Pégalo en <a href="/es/">Xtracticle</a>.</li><li>Elige <strong>Markdown</strong> para un archivo de texto, o <strong>ZIP + imágenes</strong> para conservar además cada imagen como archivo.</li></ol>'}
  <p>Para un hilo, pega cualquiera de sus posts y todo el hilo del autor se une en orden.</p>
  <h3>Muchos a la vez: Modo lote</h3>
  <p>Activa el <em>Modo lote</em>, pega hasta 20 enlaces y descarga un solo ZIP. Repite en grupos de 20 si tu catálogo es más grande.</p>
  <h3>Qué formato elegir</h3>
  <ul>
    <li><strong>Markdown (.md):</strong> ideal para reutilizar, editar y llevar a otra plataforma. Mira la <a href="${L.md}">exportación a Markdown</a>.</li>
    <li><strong>ZIP + imágenes:</strong> Markdown más los medios, una copia completa para usar sin conexión.</li>
    <li><strong>PDF:</strong> ideal para compartir y como registro de diseño fijo. Mira <a href="${L.pdf}">artículo de X a PDF</a>.</li>
  </ul>
</section>

<section>
  <h2>Mantenlos organizados</h2>
  <h3>Obsidian</h3>
  <p>Xtracticle puede abrir un artículo como una nota nueva en tu bóveda, con front-matter que incluye título, autor, fuente, fechas y etiquetas. Los detalles están en <a href="${L.obsidian}">Guardar artículos de X en Obsidian</a>.</p>
  <h3>Notion</h3>
  <p>Notion puede importar archivos Markdown: usa <em>Import → Text &amp; Markdown</em> y elige los archivos .md.</p>
  <h3>Un sistema de carpetas sencillo</h3>
  <ul>
    <li>Una carpeta por año, con archivos llamados <code>AAAA-MM-DD-titulo.md</code>.</li>
    <li>Guarda las imágenes junto al archivo (la exportación en ZIP ya lo hace).</li>
    <li>Conserva el enlace original de X en el front-matter para poder rastrear siempre la fuente.</li>
  </ul>
  <p>Sigue la regla 3-2-1: al menos dos copias en dispositivos o servicios distintos, una de ellas fuera de tu casa u oficina, por ejemplo en almacenamiento en la nube o en un repositorio Git privado.</p>
</section>

<section>
  <h2>Hazlo una rutina</h2>
  <p>Respalda cada artículo cuando lo publiques, porque en ese momento tienes el enlace. Solicita un archivo nuevo de tu cuenta de X cada pocos meses como segunda capa. Si además quieres tener presente el riesgo de los posts borrados, lee <a href="${HUB}/recuperar-tweets-borrados">qué se puede y qué no se puede recuperar</a>.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿El archivo de datos de X incluye mis artículos?', a: 'No encontramos documentación de X que diga que los artículos se incluyen como documentos con formato. Revisa tu propio archivo y conserva exportaciones por artículo como segunda copia.' },
    { q: '¿Cómo respaldo un artículo de X con sus imágenes?', a: 'Pega el enlace del post en Xtracticle y elige ZIP + imágenes. Obtienes un archivo Markdown con cada imagen guardada a su lado.' },
    { q: '¿Puedo respaldar muchos artículos a la vez?', a: 'Sí. El Modo lote acepta hasta 20 enlaces y devuelve un solo ZIP.' },
    { q: '¿Puedo respaldar artículos de otras personas?', a: 'Puedes guardar cualquier artículo público para lectura personal o consulta. Respeta los derechos de autor y no lo republiques sin permiso.' },
    { q: '¿Puedo pasar los archivos Markdown a Notion u Obsidian?', a: 'Sí. Obsidian abre directamente los archivos .md, y Notion puede importar Markdown con Import → Text & Markdown.' },
  ],
});

/* ─── 6. Ver tweets borrados ─── */

const seeDeleted = guide({
  slug: 'como-ver-tweets-borrados',
  title: 'Cómo ver tweets borrados: busca en los archivos con un clic | Xtracticle',
  description:
    'Ver tweets borrados de otra cuenta: pega el enlace del post y busca a la vez en Wayback Machine y archive.today. Además, citas, capturas y lo que nunca funciona.',
  h1: 'Cómo ver tweets borrados',
  sub: 'Ver el post borrado de otra persona solo es posible si alguien hizo una copia antes. Aquí verás dónde suelen existir copias y qué son callejones sin salida.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Cuando se borra un post, X deja de mostrarlo. Nadie, ni siquiera Xtracticle, puede volver a obtenerlo de X.',
  'Solo puedes ver el post borrado de otra persona si alguien lo copió antes: una captura de un archivo web, una captura de pantalla, una noticia o un archivo guardado.',
  'Los mejores lugares donde buscar son Wayback Machine, archive.today y los posts o artículos que citaron el post borrado.',
  'Los sitios que prometen "mostrar cualquier tweet borrado" no pueden acceder a datos que X ha eliminado. Desconfía de ellos.',
  'Si un post te importa, guárdalo mientras está en línea como <a href="/es/tweet-a-pdf">PDF</a> o ZIP.',
])}

${archiveCheck('es')}

<section>
  <h2>Tus propios posts borrados frente a los de otra persona</h2>
  <p>Son dos problemas distintos. Para <strong>tus propios</strong> posts, un archivo de datos de X anterior todavía puede contenerlos; esa vía se explica en <a href="${HUB}/recuperar-tweets-borrados">¿Se pueden recuperar tweets borrados?</a>. Esta guía trata de los posts de <strong>otras personas</strong>, donde no tienes un archivo propio y dependes de copias hechas por terceros.</p>
  <p>Conviene ser realista desde el principio. No hay una página oculta de X, ni una URL especial, ni un ajuste de cuenta que revele un post borrado. Si existe una copia, existe en otro lugar.</p>
</section>

<section>
  <h2>Dónde podría existir una copia</h2>
  <h3>1. Archivos web</h3>
  <p>La Wayback Machine del Internet Archive y archive.today hacen capturas de páginas web. Si alguien archivó el post, o el perfil del autor, antes del borrado, puedes abrir esa captura. La cobertura es mayor para cuentas conocidas y para posts que alguien guardó a propósito, y menor para posts corrientes que se borraron en pocos minutos. Sigue los pasos exactos en <a href="${HUB}/encontrar-tweets-en-wayback-machine">cómo encontrar tweets en la Wayback Machine</a>.</p>
  <h3>2. Citas, respuestas y menciones</h3>
  <p>Es habitual reaccionar a un post citándolo. Si el original se borra después, X normalmente muestra la cita con un aviso de que el post no está disponible, así que el texto en sí desaparece. Las respuestas y otros posts que lo describen o parafrasean aún pueden darte una idea de qué trataba. Considéralos relatos de segunda mano.</p>
  <h3>3. Capturas de pantalla</h3>
  <p>Periodistas, verificadores de datos y usuarios corrientes hacen capturas de posts que probablemente desaparezcan. Buscar una frase distintiva del post, o el nombre de usuario del autor junto con un tema, puede sacar esas imágenes a la luz. Una captura demuestra que algo se publicó, pero es fácil de falsificar o recortar, así que por sí sola es una prueba débil. Busca una segunda fuente independiente.</p>
  <h3>4. Cobertura en noticias y blogs</h3>
  <p>Si el post fue noticia, los artículos suelen incrustarlo o citarlo. Algunas incrustaciones siguen mostrando el texto incluso después de que se borre el original, aunque eso depende de cómo se construyó la página y no es algo en lo que confiar.</p>
  <h3>5. Fragmentos de buscadores</h3>
  <p>Un resultado de búsqueda puede seguir mostrando un fragmento antiguo poco tiempo después del borrado. Google retiró sus enlaces públicos de "caché", así que ya no puedes abrir la página almacenada desde el resultado. Si ves un fragmento, cópialo o haz una captura de inmediato, porque puede desaparecer cuando se actualice el índice.</p>
</section>

<section>
  <h2>Lo que no funciona</h2>
  <ul>
    <li><strong>Sitios "visor de tweets borrados".</strong> No pueden leer datos que X ha eliminado. En el mejor caso buscan en los mismos archivos públicos en los que puedes buscar tú. En el peor, te piden tu inicio de sesión de X o un pago.</li>
    <li><strong>Adivinar la URL.</strong> La dirección de un post borrado devuelve "no encontrado", uses x.com, twitter.com o un espejo.</li>
    <li><strong>Trucos del navegador y el truco de cambiar el dominio.</strong> Reemplazar x.com por xtracticle.com solo lee posts que siguen en línea. Para los borrados el resultado es no encontrado. Mira <a href="${HUB}/leer-articulos-de-x-sin-cuenta">leer X sin cuenta</a> para saber qué sí puede hacer.</li>
    <li><strong>Pedírselo al soporte de X.</strong> X no da a otros usuarios acceso al post borrado de otra persona.</li>
  </ul>
  <p>Las cuentas protegidas son un caso aparte: sus posts nunca fueron públicos, así que normalmente los archivos no tienen nada.</p>
</section>

<section>
  <h2>Un orden práctico para probar</h2>
  <ol>
    <li>Pega la URL del post, si la tienes, en la Wayback Machine, usando tanto la forma de x.com como la de twitter.com.</li>
    <li>Comprueba la misma URL en archive.today.</li>
    <li>Busca entre comillas una frase distintiva del post para encontrar capturas, citas o cobertura.</li>
    <li>Revisa los otros canales del autor. Es frecuente que se republique en otro lugar una declaración borrada.</li>
    <li>Si encuentras una copia, anota dónde y cuándo la encontraste, y no la des por exacta hasta tener una segunda fuente.</li>
  </ol>
  <p>Si no aparece nada, da el post por perdido. Es el resultado habitual para los posts poco conocidos.</p>
</section>

<section>
  <h2>Guarda los posts importantes mientras están en línea</h2>
  <p>La única forma fiable de ver un post más adelante es conservar tu propia copia. Pega el enlace en <a href="/es/">Xtracticle</a> y descarga un PDF con el autor, la fecha, las imágenes y un enlace al original, o un ZIP con las imágenes como archivos. Para un hilo largo usa <a href="${L.thread}">hilo de X a PDF</a>, y para leer primero un hilo como una sola página, prueba <a href="${L.unroll}">desenrollar un hilo de Twitter</a>. Un archivo guardado registra lo que viste y cuándo lo viste. No es una prueba para un tercero, pero es mucho mejor que la memoria. Los escritores pueden montar una rutina con la <a href="${HUB}/copia-de-seguridad-articulos-de-x">guía de copia de seguridad</a>.</p>
  <p>Copia solo lo que necesites para tu propia referencia, y respeta los derechos de autor y la privacidad del autor cuando lo compartas.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Puedo ver el tweet borrado de otra persona?', a: 'Solo si se hizo una copia antes de que se borrara, por ejemplo una captura de Wayback Machine o archive.today, una captura de pantalla o una noticia que lo citó. X no muestra los posts borrados a nadie.' },
    { q: '¿Hay algún sitio web que muestre cualquier tweet borrado?', a: 'No. Los sitios que lo afirman no pueden leer datos que X ha eliminado. Buscan en los mismos archivos públicos en los que puedes buscar tú, y algunos piden tu inicio de sesión o un pago, así que ten cuidado.' },
    { q: '¿Una cita conserva el texto borrado?', a: 'Normalmente no. X muestra el post citado como no disponible una vez que se borra el original, aunque las palabras del autor que cita se conservan.' },
    { q: '¿Xtracticle puede mostrar un post borrado?', a: 'No. Xtracticle lee posts públicos que siguen en línea, y un post borrado se reporta como no encontrado.' },
    { q: '¿Cómo me aseguro de poder ver un post más adelante?', a: 'Guárdalo mientras está en línea. Pega el enlace en Xtracticle y descarga un PDF o un ZIP con imágenes.' },
  ],
});

/* ─── 7. Wayback Machine ─── */

const wayback = guide({
  slug: 'encontrar-tweets-en-wayback-machine',
  title: 'Wayback Machine Twitter: encontrar tweets archivados y borrados | Xtracticle',
  description:
    'Busca tweets y perfiles de X en Wayback Machine: formas de URL que funcionan, búsqueda con comodín de todos los posts archivados de una cuenta, archive.today y búsqueda en un clic.',
  h1: 'Cómo encontrar tweets en la Wayback Machine',
  sub: 'Una lista precisa para buscar en el Internet Archive posts y perfiles archivados de X (Twitter), y una mirada honesta a sus límites.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Busca primero la URL exacta del post, tanto con <code>x.com</code> como con <code>twitter.com</code>, y luego prueba la URL del perfil.',
  'Una búsqueda con comodín como <code>web.archive.org/web/*/twitter.com/username/status/*</code> lista todas las URL de posts archivados de una cuenta.',
  'Los puntos azules del calendario son capturas correctas. Los naranjas o rojos suelen mostrar una página de error.',
  'La cobertura de X es irregular, y que no haya resultados no significa que el post nunca existiera.',
  'Save Page Now puede fallar con X, así que para cualquier cosa importante conserva también tu propia copia.',
])}

${archiveCheck('es')}

<section>
  <h2>Antes de empezar</h2>
  <p>La Wayback Machine de <a href="https://web.archive.org/" rel="noopener nofollow">web.archive.org</a> almacena capturas de páginas web. No guarda una copia completa de X. Un tweet aparece allí solo si el rastreador del Internet Archive, o una persona que usó Save Page Now, capturó esa página. Según la <a href="https://help.archive.org/help/using-the-wayback-machine/" rel="noopener nofollow">página de ayuda</a> del Internet Archive, la cobertura es incompleta y las páginas que dependen de JavaScript son difíciles de archivar. X es justo ese tipo de sitio, y informes de terceros dicen que además ha restringido el acceso automatizado. Así que ajusta tus expectativas: las cuentas conocidas y los posts muy compartidos tienen más posibilidades.</p>
  <p>Necesitas la dirección del post. Si no la tienes, intenta encontrarla primero a partir de una cita, una noticia o el perfil del autor.</p>
</section>

<section>
  <h2>Paso a paso</h2>
  <h3>1. Busca la URL exacta del post</h3>
  <p>Pega el enlace completo en el cuadro de búsqueda de web.archive.org. El formato es <code>https://x.com/username/status/1234567890</code>. Si solo conoces la dirección antigua, usa <code>https://twitter.com/username/status/1234567890</code>. El ID de status es la parte que identifica el post, así que importa más que el dominio.</p>
  <h3>2. Prueba todas las variantes de la URL</h3>
  <p>El mismo post puede estar guardado bajo varias direcciones. Prueba estas una por una:</p>
  <ul>
    <li><code>x.com/username/status/ID</code></li>
    <li><code>twitter.com/username/status/ID</code></li>
    <li><code>mobile.twitter.com/username/status/ID</code></li>
    <li><code>www.twitter.com/username/status/ID</code></li>
    <li>La misma URL con un <code>?s=20</code> final u otro parámetro de seguimiento, si la copiaste de un enlace para compartir</li>
  </ul>
  <h3>3. Usa un comodín para listarlo todo de una cuenta</h3>
  <p>Si no conoces el ID de status, pide todas las URL capturadas bajo una ruta. El Internet Archive documenta la forma con comodín <code>web.archive.org/web/*/example.com/*</code>. Para X, queda así:</p>
  <p><code>web.archive.org/web/*/twitter.com/username/status/*</code></p>
  <p>Haz lo mismo con <code>x.com</code>. El resultado es una lista larga de URL de posts archivados. Usa la función de búsqueda de tu navegador para encontrar un ID de status o una parte de la dirección. Si la lista es muy larga, el archivo también ofrece una interfaz CDX que devuelve los mismos datos en una tabla simple. Una consulta como <code>web.archive.org/cdx/search/cdx?url=twitter.com/username/status/*&amp;fl=timestamp,original,statuscode&amp;collapse=urlkey</code> funciona con muchas cuentas, pero revisa la documentación CDX del Internet Archive para ver los parámetros vigentes.</p>
  <h3>4. Revisa la página del perfil</h3>
  <p>Busca <code>twitter.com/username</code> y <code>x.com/username</code>. Una captura del perfil puede mostrar los posts recientes tal como se veían en esa fecha. Es más probable que un post corto que estuvo activo unos días aparezca aquí que como página capturada propia.</p>
  <h3>5. Lee el calendario</h3>
  <p>Cuando una URL tiene capturas, ves un calendario del año. Los puntos y enlaces marcan los días con captura, y los colores muestran el estado que recibió el rastreador. Según el Internet Archive, azul significa éxito, verde una redirección, naranja un error de cliente y rojo un error de servidor. Elige una fecha azul, idealmente justo antes de que se borrara el post. Las capturas pueden tardar varias horas en aparecer después de hacerse.</p>
  <h3>6. Abre la captura y compruébala</h3>
  <p>A veces las páginas archivadas se cargan sin imágenes ni respuestas, o muestran un aviso de inicio de sesión en lugar del post. Prueba las capturas anteriores y posteriores del calendario, porque alguna puede haberse renderizado mejor. Anota la dirección completa del archivo, con su marca de tiempo, si vas a citarla.</p>
</section>

<section>
  <h2>Save Page Now y sus límites con X</h2>
  <p>Para archivar tú mismo una página en vivo, usa Save Page Now en <code>web.archive.org/save</code>, pega la URL y envíala. Según el Internet Archive, esto guarda una página a demanda y no guarda sitios enteros. Hazlo antes de que algo se borre, porque no puede capturar un post que ya no existe.</p>
  <p>En X, Save Page Now puede fallar o producir una captura que muestre una pantalla de inicio de sesión, porque X suele bloquear las solicitudes automatizadas. Si eso pasa, la captura no sirve como registro. Por eso recomendamos una segunda copia en tus propios archivos. <a href="${L.tweet}">Tweet a PDF</a> y <a href="/es/">Xtracticle</a> renderizan el post público y guardan el resultado por ti.</p>
</section>

<section>
  <h2>Alternativa: archive.today</h2>
  <p>archive.today (también accesible en direcciones como archive.ph) es un archivo independiente que permite que cualquiera envíe una página. Busca allí la URL del post, o pégala en el cuadro de guardado si el post sigue en línea. Tiene su propia cobertura y sus propios huecos, y sus dominios cambian de vez en cuando, así que busca la dirección vigente. Úsalo como segunda opinión cuando la Wayback Machine no tenga nada.</p>
</section>

<section>
  <h2>Por qué puede que no encuentres nada</h2>
  <ul>
    <li>El post se borró antes de que algún rastreador o usuario lo guardara.</li>
    <li>La cuenta es protegida, así que la página nunca fue pública.</li>
    <li>La captura existe pero solo muestra un muro de inicio de sesión o un error.</li>
    <li>El proceso de exclusión del Internet Archive lo eliminó, algo que puede hacer a petición.</li>
  </ul>
  <p>Para ver el panorama completo, incluido tu propio archivo de datos, lee <a href="${HUB}/recuperar-tweets-borrados">¿se pueden recuperar tweets borrados?</a> y <a href="${HUB}/como-ver-tweets-borrados">cómo ver tweets borrados</a>. Los hilos que quieras conservar es mejor guardarlos con <a href="${L.thread}">hilo de X a PDF</a> o con <a href="${L.unroll}">el desenrollador de hilos</a>.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿La Wayback Machine guarda tweets?', a: 'A veces. Solo almacena un post si su rastreador o un usuario capturó esa página. La cobertura de X es irregular y mayor en cuentas conocidas.' },
    { q: '¿Debo buscar en x.com o en twitter.com?', a: 'En ambos. Las capturas antiguas suelen estar bajo twitter.com, las recientes pueden estar bajo x.com, y el mismo ID de status puede aparecer en cualquiera de los dos.' },
    { q: '¿Cómo listo todos los tweets archivados de una cuenta?', a: 'Usa una búsqueda con comodín como web.archive.org/web/*/twitter.com/username/status/* y repítela con x.com.' },
    { q: '¿Puedo usar Save Page Now con un tweet?', a: 'Puedes intentarlo, pero X suele bloquear a los archivadores, así que la captura puede mostrar una pantalla de inicio de sesión. Tampoco puede capturar un post que ya se borró.' },
    { q: '¿Y si la Wayback Machine no tiene nada?', a: 'Prueba archive.today y busca capturas de pantalla o citas. Si no existe ninguna, el post probablemente no se pueda recuperar.' },
  ],
});

/* ─── 8. Cómo escribir un artículo en X ─── */

const writeArticle = guide({
  slug: 'como-escribir-un-articulo-en-x',
  title: 'Cómo escribir y publicar un artículo en X | Xtracticle',
  description:
    'Cómo escribir un artículo en X: quién puede publicar, dónde está el editor, formato e imagen de portada, edición tras publicar y cómo respaldarlo.',
  h1: 'Cómo escribir y publicar un artículo en X',
  sub: 'Desde los requisitos hasta el botón de publicar: qué necesitas, qué ofrece el editor y cómo conservar una copia de tu pieza terminada.',
  primary: 'md',
  sections: `
${takeaways([
  `Publicar artículos requiere un plan de pago: ${WHEN}, la página de ayuda de X lo limita a cuentas Premium, Premium+, Premium Business y Premium Organizations.`,
  'Abre el área de Artículos desde la navegación de X y elige escribir un artículo nuevo. La disponibilidad en las apps ha variado, así que la versión web en x.com es el lugar más seguro para empezar.',
  'Puedes usar título, imagen de portada, títulos internos, listas, enlaces, imágenes, vídeo y posts incrustados.',
  'Según X, editar un artículo publicado lo deja fuera de línea hasta que lo vuelvas a publicar.',
  'Respalda cada artículo cuando lo publiques. Consulta <a href="/es/guias/copia-de-seguridad-articulos-de-x">la guía de copia de seguridad</a>.',
])}

<section>
  <h2>Quién puede escribir un artículo</h2>
  <p>X lanzó los artículos en 2024 para suscriptores de Premium+ y después amplió el acceso. ${WHEN_CAP}, la <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">página de ayuda de artículos</a> de X dice que publicar está limitado a suscriptores de Premium y Premium+, Premium Businesses y Premium Organizations. Los nombres y precios de los planes cambian, así que revisa tu propia cuenta si no ves la opción.</p>
  <p>Cualquiera puede leer un artículo publicado. Para más contexto, mira <a href="${HUB}/que-son-los-articulos-de-x">¿Qué son los artículos de X?</a></p>
</section>

<section>
  <h2>Paso a paso</h2>
  <ol class="xt-steps">
    <li>Inicia sesión en x.com desde una computadora con una cuenta que cumpla los requisitos.</li>
    <li>Busca <strong>Artículos</strong> en la navegación de la izquierda. Si no lo ves, revisa tu suscripción o busca la opción para escribir un artículo en el menú del compositor de posts.</li>
    <li>Elige <strong>Escribir</strong> para abrir un borrador nuevo. X guarda los borradores para que puedas volver más tarde.</li>
    <li>Añade un título y luego el cuerpo. Añade una imagen de portada si quieres.</li>
    <li>Revisa la vista previa y pulsa <strong>Publicar</strong>. El artículo aparece en tu perfil y se puede compartir como un post.</li>
  </ol>
  <p>Los nombres y las posiciones exactas de los menús cambian cuando X actualiza el producto. Si un nombre difiere del indicado arriba, guíate por lo que muestre tu pantalla.</p>
</section>

<section>
  <h2>Qué puede hacer el editor</h2>
  <p>Según la página de ayuda de X, los artículos pueden contener imágenes, vídeo, GIF, posts incrustados y enlaces. El formato de texto abarca títulos, subtítulos, negrita, cursiva, tachado, sangría y listas numeradas o con viñetas.</p>
  <h3>Imagen de portada</h3>
  <p>La portada aparece en la parte superior del artículo y, normalmente, en la vista previa de la cronología. La página de ayuda de X no da dimensiones de imagen que hayamos podido verificar. Una imagen ancha funciona mejor porque la vista previa la recorta, así que mantén cualquier texto bien dentro del marco y comprueba cómo se ve después de publicar.</p>
  <h3>Incrustar posts y medios</h3>
  <p>Pega el enlace de otro post para incrustarlo, y añade imágenes donde apoyen una idea. Vale la pena añadir texto alternativo por accesibilidad si el editor lo ofrece.</p>
</section>

<section>
  <h2>Editar y eliminar</h2>
  <p>Según la página de ayuda de X, para cambiar un artículo publicado lo abres, usas el menú de tres puntos y eliges <em>Edit Article</em>. Eso lo despublica, y los lectores no pueden verlo hasta que lo vuelvas a publicar. Por eso conviene hacer las ediciones de una sola vez y evitar corregir erratas en horas de mucho tráfico. El mismo menú ofrece la opción de eliminar. Hasta donde sabemos, ${WHEN} X no tenía un programador de publicaciones integrado para artículos, así que se publica cuando pulsas el botón.</p>
</section>

<section>
  <h2>Consejos para artículos fáciles de leer</h2>
  <ul>
    <li><strong>Empieza por lo importante.</strong> El título y los dos primeros párrafos deciden si la gente sigue leyendo.</li>
    <li><strong>Dale a cada título una sola función.</strong> Los lectores leen por encima, así que los títulos deben contar la historia por sí solos.</li>
    <li><strong>Mantén los párrafos cortos</strong> y usa una lista para pasos o comparaciones.</li>
    <li><strong>Usa imágenes con un propósito</strong>, como gráficos, capturas o ejemplos.</li>
    <li><strong>Enlaza tus fuentes.</strong> Genera confianza y ayuda a los lectores a verificarte.</li>
    <li><strong>¿Convertirás un hilo en artículo?</strong> Reescríbelo. Los ganchos y la numeración de un hilo suenan raros en un solo documento.</li>
    <li><strong>Compártelo con un post de enganche</strong> que exprese la idea principal, no solo el título.</li>
  </ul>
</section>

<section>
  <h2>Después de publicar: guardar y compartir</h2>
  <p>X no tiene un botón de exportar para un artículo. Pega el enlace del post (el que lleva <code>/status/</code>) en <a href="/es/">Xtracticle</a> para obtener un PDF que compartir, o Markdown y ZIP para reutilizar el texto en otro lugar. Los lectores pueden hacer lo mismo con <a href="${L.pdf}">artículo de X a PDF</a>, incluso sin cuenta, como se describe en <a href="${HUB}/leer-articulos-de-x-sin-cuenta">leer artículos de X sin cuenta</a>. Los escritores deberían mantener su propio archivo, porque los posts pueden borrarse o las cuentas suspenderse. Para una rutina completa, mira <a href="${HUB}/copia-de-seguridad-articulos-de-x">cómo hacer copia de seguridad de tus artículos de X</a>.</p>
  <p>Si estás comparando X con otros lugares donde publicar, <a href="${HUB}/articulos-de-x-vs-substack">Artículos de X vs Substack vs Medium</a> los compara. Para las reglas de longitud y medios, mira los <a href="${HUB}/limites-de-los-articulos-de-x">límites de los artículos de X</a>.</p>
</section>

${privacy('es')}`,
  faq: [
    { q: '¿Quién puede escribir un artículo en X?', a: 'A la fecha de redacción (octubre de 2026), X indica que publicar está limitado a cuentas Premium, Premium+, Premium Business y Premium Organizations. Cualquiera puede leer los artículos.' },
    { q: '¿Dónde escribo un artículo de X?', a: 'Usa la opción Artículos en la navegación de X en x.com y elige escribir un artículo nuevo. El nombre y la posición pueden cambiar, y la disponibilidad en las apps ha variado.' },
    { q: '¿Puedo editar un artículo de X después de publicarlo?', a: 'Sí. Según X, usa el menú de tres puntos y elige Edit Article. Esto lo despublica hasta que lo vuelvas a publicar.' },
    { q: '¿Puedo programar un artículo de X?', a: 'No encontramos un programador integrado para artículos. Algunas herramientas de terceros ofrecen programación, así que revísalas antes de depender de ello.' },
    { q: '¿Cómo guardo mi artículo de X?', a: 'Pega el enlace del post en Xtracticle y descarga Markdown, PDF o un ZIP con imágenes.' },
  ],
});

/* ─── 9. Límites de los artículos de X ─── */

const limits = guide({
  slug: 'limites-de-los-articulos-de-x',
  title: 'Límites de artículos de X: longitud y requisitos | Xtracticle',
  description:
    'Límite de longitud de los artículos de X, medios y quién puede publicarlos o leerlos. Cifras aproximadas, reglas de edición y comparación con posts largos e hilos.',
  h1: 'Límites de los artículos de X: longitud, medios y requisitos',
  sub: 'Qué extensión puede tener un artículo de X, qué puedes incluir, quién puede publicar y quién puede leer, con las cifras inciertas señaladas.',
  primary: 'pdf',
  sections: `
${takeaways([
  'Que nosotros sepamos, X no ha publicado una cifra firme de longitud para los artículos. Fuentes de terceros sitúan el límite en unos 100.000 caracteres, aproximadamente 15.000 palabras.',
  `Publicar requiere un plan de pago. ${WHEN_CAP}, X lista Premium, Premium+, Premium Business y Premium Organizations.`,
  'Cualquiera puede leer un artículo público, según la configuración del autor. No hace falta suscripción.',
  'Los artículos pueden incluir imágenes, vídeo, GIF, enlaces y posts incrustados, con títulos y listas.',
  'Editar un artículo publicado lo deja fuera de línea hasta que lo vuelvas a publicar.',
])}

<section>
  <h2>Límite de longitud</h2>
  <p>La <a href="https://help.x.com/en/using-x/articles" rel="noopener nofollow">página de ayuda de artículos</a> de X describe lo que pueden contener los artículos, pero no encontramos allí un número concreto de caracteres. Informes del lanzamiento en 2024 decían que los probadores llegaron a un tope algo superior a los 100.000 caracteres, que varias fuentes convierten en unas 15.000 palabras, y las guías actualizadas en 2026 siguen repitiendo la misma cifra. Social Media Today estimó un número de palabras mayor con la misma cifra de caracteres, porque las palabras son más cortas de lo que la gente supone, así que el número de palabras es solo una guía aproximada.</p>
  <p>Toma los 100.000 caracteres como una cifra aproximada. En la práctica pocos artículos se acercan a ese tamaño: equivale a un capítulo corto de un libro o a un ensayo larguísimo. Si vas a escribir algo tan largo, un documento descargable puede servir mejor a tus lectores.</p>
</section>

<section>
  <h2>Medios y formato</h2>
  <p>Según X, los artículos pueden incluir imágenes, vídeo, GIF, posts incrustados y enlaces. El texto puede usar títulos, subtítulos, negrita, cursiva, tachado, sangría y listas numeradas o con viñetas. No pudimos verificar los límites de tamaño de archivo para imágenes o vídeo en el editor de artículos, así que fíjate en el propio editor por si aparece algún error antes de publicar un archivo grande.</p>
</section>

<section>
  <h2>Quién puede publicar y quién puede leer</h2>
  <ul>
    <li><strong>Publicar:</strong> cuentas de los niveles Premium. La función empezó con Premium+ en 2024, y la página de ayuda actual de X lista a los suscriptores de Premium y Premium+ además de Premium Businesses y Premium Organizations. Las reglas pueden cambiar, así que revisa tu cuenta.</li>
    <li><strong>Leer:</strong> cualquiera que pueda ver el post. Los artículos públicos se pueden abrir sin pagar. Los lectores sin sesión pueden encontrar avisos o vistas limitadas en x.com, como se explica en <a href="${HUB}/leer-articulos-de-x-sin-cuenta">leer X sin cuenta</a>.</li>
    <li><strong>Visibilidad:</strong> un artículo se publica en tu perfil y se comparte mediante un post. El contenido de las cuentas protegidas sigue limitado a los seguidores aprobados.</li>
  </ul>
  <p>Para más contexto, mira <a href="${HUB}/que-son-los-articulos-de-x">¿Qué son los artículos de X?</a> y la guía paso a paso <a href="${HUB}/como-escribir-un-articulo-en-x">cómo escribir un artículo de X</a>.</p>
</section>

<section>
  <h2>Editar después de publicar</h2>
  <p>Según la página de ayuda de X, puedes editar un artículo publicado desde el menú de tres puntos con <em>Edit Article</em>. Eso lo despublica, y permanece oculto hasta que lo vuelvas a publicar. Eliminar está disponible en el mismo menú. Como un artículo eliminado también desaparece para los lectores, guarda antes una copia si puedes necesitarlo más adelante (consulta <a href="${HUB}/copia-de-seguridad-articulos-de-x">la guía de copia de seguridad</a>).</p>
</section>

<section>
  <h2>Artículos frente a posts largos e hilos</h2>
  <p>Las cifras de abajo son aproximadas y se basan en informes de terceros ${WHEN}.</p>
  <div class="xt-table-wrap"><table>
    <thead><tr><th></th><th>Post estándar</th><th>Post largo</th><th>Hilo</th><th>Artículo de X</th></tr></thead>
    <tbody>
      <tr><td>Longitud</td><td>280 caracteres para la mayoría de las cuentas</td><td>Según informes, hasta unos 25.000 caracteres para suscriptores de pago</td><td>Muchos posts, cada uno con su propio límite</td><td>Unos 100.000 caracteres (aproximado)</td></tr>
      <tr><td>Títulos y listas</td><td>No</td><td>No</td><td>No</td><td>Sí</td></tr>
      <tr><td>Título e imagen de portada</td><td>No</td><td>No</td><td>No</td><td>Sí</td></tr>
      <tr><td>Quién puede crearlo</td><td>Cualquiera</td><td>Suscriptores de pago</td><td>Cualquiera</td><td>Cuentas de los niveles Premium</td></tr>
      <tr><td>Interacción</td><td>Un post</td><td>Un post</td><td>Cada post por separado</td><td>Un post que enlaza al artículo</td></tr>
    </tbody>
  </table></div>
  <p>Elige un post largo para una sola idea que no necesita estructura, un hilo cuando quieres una conversación con respuestas en cada paso, y un artículo cuando la pieza necesita títulos, imágenes y una experiencia de lectura propia.</p>
</section>

<section>
  <h2>Guardar lo que lees</h2>
  <p>La longitud no es un problema para guardar: un artículo largo se convierte en un archivo de varias páginas. Pega el enlace en <a href="/es/">Xtracticle</a> o usa <a href="${L.pdf}">artículo de X a PDF</a>. Para hilos existe <a href="${L.thread}">hilo de X a PDF</a>, y los posts sueltos se guardan con <a href="${L.tweet}">tweet a PDF</a>.</p>
</section>`,
  faq: [
    { q: '¿Cuál es el límite de caracteres de los artículos de X?', a: 'X no indica una cifra firme que hayamos podido encontrar. Fuentes de terceros hablan de unos 100.000 caracteres, aproximadamente 15.000 palabras. Tómalo como una cifra aproximada.' },
    { q: '¿Quién puede publicar artículos de X?', a: 'A la fecha de redacción (octubre de 2026), X lista cuentas Premium, Premium+, Premium Business y Premium Organizations.' },
    { q: '¿Necesito Premium para leer un artículo de X?', a: 'No. Los artículos públicos se pueden leer sin suscripción.' },
    { q: '¿Puedo editar un artículo de X después de publicarlo?', a: 'Sí. Según la página de ayuda de X, elige Edit Article en el menú de tres puntos. El artículo se despublica hasta que lo vuelvas a publicar.' },
    { q: '¿En qué se diferencia un artículo de un post largo?', a: 'Un post largo sigue siendo un post normal, sin títulos ni encabezados. Un artículo tiene título, imagen de portada opcional, títulos internos, listas y medios incrustados, y admite más texto.' },
  ],
});

/* ─── Índice ─── */

const GUIDES: { page: SitePage; blurb: string }[] = [
  { page: whatAre, blurb: 'Qué son los artículos de X, quién puede publicarlos, en qué se diferencian de los hilos y cómo guardarlos.' },
  { page: readWithout, blurb: 'Lee artículos, hilos y posts de X sin iniciar sesión, incluido el truco de cambiar x.com por xtracticle.com.' },
  { page: deleted, blurb: 'Qué se puede y qué no se puede recuperar cuando se borra un post, y cómo proteger los importantes.' },
  { page: versus, blurb: 'Los artículos de X frente a Substack y Medium en audiencia, dinero, propiedad, exportación y SEO.' },
  { page: backup, blurb: 'Un plan práctico para respaldar tus propios artículos e hilos de X en Markdown, ZIP y PDF.' },
  { page: seeDeleted, blurb: 'Dónde podría existir una copia del post borrado de otra persona, qué nunca funciona y cómo guardar posts antes.' },
  { page: wayback, blurb: 'Paso a paso: formas de URL, búsqueda con comodín, calendario, Save Page Now y archive.today para tweets archivados.' },
  { page: writeArticle, blurb: 'Quién puede publicar un artículo de X, dónde está el editor, formato, edición y cómo respaldarlo.' },
  { page: limits, blurb: 'Límite aproximado de longitud, medios, quién puede publicar o leer, y una tabla frente a posts largos e hilos.' },
];

const hub: SitePage = {
  id: 'es-guides',
  group: 'guides',
  path: HUB,
  file: 'es/guias.html',
  lang: 'es',
  title: 'Guías: guardar, leer y archivar contenido de X | Xtracticle',
  description:
    'Guías prácticas sobre los artículos de X (Twitter): qué son, cómo leerlos sin iniciar sesión, recuperar posts borrados, comparar plataformas y respaldar tus textos.',
  h1: 'Guías: guardar, leer y archivar contenido de X',
  sub: 'Guías breves y prácticas sobre artículos, hilos y posts de X, y cómo conservar una copia.',
  primary: 'pdf',
  nav: 'Guías',
  sections: `
<section>
  <h2>Todas las guías</h2>
  <ul>${GUIDES.map(g => `<li><a href="${g.page.path}"><strong>${g.page.h1}</strong></a> — ${g.blurb}</li>`).join('')}</ul>
</section>

<section>
  <h2>¿Listo para guardar algo?</h2>
  <p>Pega cualquier enlace de X en <a href="${L.home}">Xtracticle</a>, o ve directo a <a href="${L.pdf}">artículo de X a PDF</a>, <a href="${L.md}">Markdown</a>, <a href="${L.epub}">EPUB</a> o <a href="${L.thread}">hilo a PDF</a>.</p>
</section>`,
  faq: [],
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Guías de Xtracticle',
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
