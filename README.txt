Estructura del proyecto
-----------------------

* **index.html** – Página principal del sitio donde se muestran el héroe, la descripción del Dr. Raúl Izquierdo, los problemas que resuelve, los cursos, la sección de “¿Cómo funciona?”, las asesorías personalizadas, los beneficios, el formulario de newsletter y los datos de contacto.
* **css/** – Carpeta que contiene las hojas de estilos que definen el aspecto del sitio. El archivo principal es `main.css`. Puedes editarlo para ajustar colores, fuentes, tamaños o espaciado.
* **js/** – Carpeta con los scripts JavaScript. Aquí se encuentran `main.js` (funciones de navegación, validación y envío del formulario) y `payments.js` (código relacionado con las páginas de pago de cursos/asesorías).
* **img/** – Carpeta con las imágenes en uso. Está subdividida en varias carpetas como `hero` (foto del doctor), `icons` (iconos), `medical` (fotos de contexto médico), `asesorias` y `og` (imagen para redes sociales). Para cambiar una imagen, reemplaza el archivo por otro con el mismo nombre y extensión.
* **pages/** – Carpeta que contiene el resto de páginas: asesorías (`asesorias.html`), blog (`blog.html` y los artículos en `blog/`), aviso de privacidad (`aviso-de-privacidad.html`), cursos y páginas de agradecimiento, entre otras. Edítalas según sea necesario.
* **api/** – Carpeta con scripts de servidor. El archivo `subscribe.php` recibe las solicitudes del formulario de newsletter y envía los datos al correo configurado.
* **robots.txt** y **sitemap.xml** – Archivos para buscadores. `robots.txt` indica a los robots de búsqueda qué archivos rastrear, y `sitemap.xml` les muestra la estructura del sitio para mejorar el SEO.
* **favicon.ico** y **favicon.png** – Iconos del sitio que se muestran en la pestaña del navegador.

Dónde editar
-------------

* **Textos e imágenes de la página principal**: abre `index.html` en un editor de texto. Secciones importantes están marcadas con comentarios como `<!-- Aquí va el formulario de suscripción (newsletter) -->` para ubicar el formulario. Modifica los textos entre las etiquetas `<p>`, `<h2>`, etc. Si cambias una imagen, reemplaza el archivo en `img/` con el mismo nombre.
* **Estilos**: modifica `css/main.css` para ajustar colores, tamaños de letra, márgenes, etc. Cada clase tiene un comentario explicando su función.
* **Otras páginas**: dentro de `pages/` encontrarás los demás documentos. Edita el contenido HTML según tus necesidades. Por ejemplo, `asesorias.html` para la página de asesorías o `blog/` para artículos del blog.
* **Newsletter**: el formulario se encuentra en `index.html` bajo la sección Newsletter. Ya no requiere un checkbox de aceptación; solo se pide nombre y email. El envío se maneja mediante `api/subscribe.php`.

Cómo subir la carpeta a Cyberduck
----------------------------------

1. **Descarga y descomprime** el archivo `V11.zip` en tu computadora. Obtendrás una carpeta con la estructura descrita arriba.
2. **Abre Cyberduck** y conecta con tu cuenta de GoDaddy (introduce tu usuario y contraseña de hosting). Si no tienes Cyberduck, puedes descargarlo gratuitamente.
3. En el panel izquierdo de Cyberduck, **navega a la carpeta pública** de tu servidor, normalmente llamada `public_html`, `www` o similar.
4. **Arrastra y suelta** todos los archivos y carpetas del proyecto descomprimido (index.html, css/, js/, img/, pages/, api/, favicon.ico, favicon.png, robots.txt y sitemap.xml) dentro de esa carpeta en el servidor. Si te pregunta si deseas reemplazar archivos existentes, acepta para actualizar el sitio.
5. Espera a que se complete la transferencia. **Visita tu dominio** (por ejemplo, `https://rulmanzana.com`) desde un navegador para confirmar que todo funciona correctamente. Es posible que debas borrar la caché del navegador o esperar unos minutos para ver los cambios reflejados.

¡Listo! Con esta estructura organizada y los comentarios en el código, modificar y mantener tu sitio será mucho más sencillo.