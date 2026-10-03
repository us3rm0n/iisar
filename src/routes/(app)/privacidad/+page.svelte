<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import { externalLink, site } from '$lib/site';
</script>

<svelte:head>
	<title>Política de privacidad | IISAR</title>
	<meta
		name="description"
		content="Qué datos recoge iisar, para qué los usa, qué cookies y publicidad carga y cómo ejercer tus derechos."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<PageHeader
		class="mb-8"
		title="Política de privacidad"
		description={`Última actualización: ${site.legalUpdated}`}
	/>

	<div class="prose-content">
		<p>
			Esta política explica qué datos personales recoge <strong>{site.name}</strong>
			({site.tagline}), para qué los usa y cómo puedes ejercer sobre ellos tus derechos. Al navegar
			por el sitio la aceptas. Si no estás de acuerdo, puedes navegar sin registrarte.
		</p>

		<h3>1. Quién es el responsable</h3>
		<p>
			El responsable del tratamiento es <strong>{site.owner}</strong>, con domicilio en {site.location}.
			Para cualquier consulta sobre datos personales podés escribir a
			<a href="mailto:{site.contactEmail}">{site.contactEmail}</a>.
		</p>

		<h3>2. Qué datos recogemos</h3>
		<ul>
			<li>
				<strong>Sin cuenta.</strong> No creamos perfiles de visitantes anónimos. Guardamos en el servidor
				los registros técnicos de conexión (dirección IP, navegador, páginas visitadas) para seguridad
				y diagnóstico del servicio.
			</li>
			<li>
				<strong>Con cuenta.</strong> Tu dirección de correo electrónico y el identificador interno de
				tu usuario. La contraseña se guarda cifrada y nunca se muestra ni se envía.
			</li>
			<li>
				<strong>Ficha de negocio.</strong> Los datos que publicas en tu página: nombre del negocio,
				descripción, categoría, ciudad, provincia, datos de contacto (teléfono, WhatsApp o correo) e
				imágenes. <strong>Las imágenes del negocio son públicas</strong>: cualquiera con el enlace
				puede verlas.
			</li>
			<li>
				<strong>Productos y servicios.</strong> Nombre, descripción, precio estimado y moneda de cada
				producto o servicio que registres.
			</li>
			<li>
				<strong>Suscripciones y comprobantes.</strong> Plan contratado, fechas de creación,
				vencimiento y gracia, monto total, medio de pago, estado y la imagen del comprobante. Los
				comprobantes se guardan en un <strong>almacenamiento privado</strong>: solo las personas
				autorizadas a revisar tu suscripción pueden abrirlos.
			</li>
		</ul>

		<h3>3. Para qué usamos los datos</h3>
		<ul>
			<li>
				<strong>Prestar el servicio</strong>: mantener tu cuenta, mostrar tu página y gestionar tu
				suscripción.
			</li>
			<li>
				<strong>Cobrar y verificar el pago</strong>: revisar el comprobante y aprobar o rechazar la
				suscripción.
			</li>
			<li>
				<strong>Moderar el directorio</strong>: revisar fichas, productos e imágenes antes de
				publicarlos.
			</li>
			<li>
				<strong>Contenido editorial</strong>: las guías de cada provincia son redactadas y editadas
				por el webmaster del sitio.
			</li>
			<li>
				<strong>Obligaciones legales</strong>: conservar registros de pago durante el plazo que
				exija la ley.
			</li>
		</ul>
		<p>
			La base legal es tu <strong>consentimiento</strong> al registrarte y publicar una ficha, tu
			<strong>ejecución del contrato</strong> para la suscripción y el
			<strong>cumplimiento de obligaciones legales</strong> para la conservación de registros.
		</p>

		<h3>4. Cookies y publicidad</h3>
		<p>
			El sitio usa cookies propias y de terceros. Las cookies propias (por ejemplo
			<code>sb-*-auth-token</code>) guardan tu sesión iniciada y son necesarias para que funcione el
			panel. Las de terceros miden y condicionan la publicidad.
		</p>
		<p>
			Este sitio publica anuncios mediante <strong>Google AdSense</strong>. Google y sus socios
			pueden usar cookies o tecnologías similares para recoger información y personalizar anuncios
			en este y en otros sitios. Más información en las
			<a href="https://policies.google.com/technologies/ads" {...externalLink}
				>políticas de publicidad de Google</a
			>, en
			<a href="https://policies.google.com/technologies/partner-sites" {...externalLink}
				>cómo usa Google la información de los sitios web de sus socios</a
			>
			y en
			<a href="https://www.google.com/settings/ads" {...externalLink}
				>Configuración de anuncios de Google</a
			>, donde puedes desactivar la personalización.
		</p>
		<p>
			<strong>Cómo limitar la publicidad personalizada</strong>:
			<a href="https://www.google.com/settings/ads" {...externalLink}>Configuración de anuncios</a>
			o, en el navegador, las opciones de <em>No rastrear</em> o de bloqueo de cookies de terceros. Algunas
			partes del directorio pueden dejar de funcionar según el navegador.
		</p>
		<p>
			El sitio está dirigido a personas mayores de 18 años y no condiciona la publicidad al
			comportamiento de menores de edad.
		</p>

		<h3>5. Proveedores que tratan datos por nosotros</h3>
		<ul>
			<li>
				<strong>Supabase</strong> — base de datos, autenticación y almacenamiento de archivos.
			</li>
			<li><strong>Cloudflare</strong> — alojamiento, CDN y mitigación de ataques.</li>
			<li>
				<strong>Google AdSense</strong> — publicidad. Google actúa como proveedor independiente y su
				propio tratamiento se rige por sus
				<a href="https://policies.google.com/privacy" {...externalLink}>políticas de privacidad</a>.
			</li>
		</ul>
		<p>
			Supabase y Cloudflare tratan tus datos solo para prestarnos el servicio y no los usan para sus
			propios fines publicitarios. Google AdSense, en cambio, usa cookies y datos de navegación para
			mostrar anuncios, como se explica en el apartado 4.
		</p>

		<h3>6. Tus derechos</h3>
		<p>
			Puedes pedir en cualquier momento y de forma gratuita el acceso a tus datos, su corrección, su
			actualización o su eliminación, y revocar tu consentimiento. Escríbenos a
			<a href="mailto:{site.contactEmail}">{site.contactEmail}</a> desde el correo con el que te registraste
			y atendemos la solicitud en un plazo razonable.
		</p>
		<p>
			También puedes revocar el consentimiento en cualquier momento, sin que eso afecte al
			tratamiento que ya se haya hecho. Cumplimos la
			<a
				href="https://www.gob.ec/regulacion/ley-organica-de-proteccion-de-datos-personales"
				{...externalLink}>Ley Orgánica de Protección de Datos Personales</a
			>
			del Ecuador: si consideras que tu solicitud no fue atendida, puedes presentar un reclamo ante la
			autoridad de protección de datos.
		</p>

		<h3>7. Seguridad</h3>
		<p>
			La base de datos aplica políticas de seguridad a nivel de fila: cada usuario solo puede leer y
			modificar sus propios registros. Los comprobantes de pago se guardan en un almacenamiento
			privado. Ningún sistema es infalible: si ocurre una brecha que afecte tus datos, te avisaremos
			y tomaremos las medidas razonables para mitigar sus efectos.
		</p>

		<h3>8. Menores de edad</h3>
		<p>
			El sitio está dirigido a personas mayores de 18 años y no recopila datos de menores de forma
			consciente. Si crees que un menor registró datos, escríbenos y los eliminaremos.
		</p>

		<h3>9. Cambios en esta política</h3>
		<p>
			Podemos actualizar esta política cuando cambie el sitio o la normativa. La fecha de la
			cabecera indica la última versión; los cambios relevantes se anunciarán de forma visible en el
			sitio.
		</p>

		<h3>10. Contacto</h3>
		<p>
			{site.owner} — {site.location} — <a href="mailto:{site.contactEmail}">{site.contactEmail}</a>
		</p>
	</div>
</div>
