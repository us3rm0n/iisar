<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import { site } from '$lib/site';
</script>

<svelte:head>
	<title>Términos y condiciones | IISAR</title>
	<meta
		name="description"
		content="Las condiciones de uso del directorio iisar: registro, suscripciones, contenido publicado y responsabilidad."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<PageHeader
		class="mb-8"
		title="Términos y condiciones"
		description={`Última actualización: ${site.legalUpdated}`}
	/>

	<div class="prose-content">
		<p>
			Estos términos regulan el uso de <strong>{site.name}</strong> ({site.tagline}), operado por
			{site.owner}. Al registrarte o publicar una ficha aceptas estas condiciones.
		</p>

		<h3>1. Qué es el directorio</h3>
		<p>
			iisar es un directorio público de negocios, artistas y lugares del Ecuador, con guías
			editoriales de sus 24 provincias. La información de las fichas la publica cada dueño de
			negocio o lugar y la revisa el webmaster del sitio. <strong
				>No verificamos cada dato ni respondemos por el servicio que preste un negocio publicado.</strong
			> La publicidad financia el proyecto y no garantiza una posición preferente: el orden de los resultados
			no depende de quién pague.
		</p>

		<h3>2. Registro y cuenta</h3>
		<p>
			Podés registrarte con una dirección de correo válido. Sos responsable de la confidencialidad
			de tu contraseña y de toda actividad realizada desde tu cuenta. Una cuenta es personal: no la
			compartas ni la vendas. Podemos suspender cuentas que publiquen contenido ilegal, engañoso o
			que viole los derechos de terceros.
		</p>

		<h3>3. Suscripciones</h3>
		<ul>
			<li>
				<strong>Pago previo y revisión manual.</strong> El pago se realiza por adelantado, fuera de iisar,
				y se aprueba o rechaza a mano tras revisar el comprobante.
			</li>
			<li>
				<strong>Vigencia.</strong> La suscripción corre desde la fecha de aprobación hasta la fecha de
				vencimiento del plan contratado (mensual, semestral o anual).
			</li>
			<li>
				<strong>Período de gracia.</strong> Al vencer, la ficha sigue visible durante un período de gracia;
				después solo queda en modo lectura hasta que se renueve.
			</li>
			<li>
				<strong>Sin pago automático.</strong> No hay débito automático: cada renovación requiere un nuevo
				pago y una nueva aprobación.
			</li>
		</ul>

		<h3>4. Contenido publicado por ti</h3>
		<p>
			Cuando registras una ficha, sus productos o imágenes nos concedes una licencia para mostrarlos
			dentro del directorio. Sos el único responsable de tener los derechos de publicación sobre lo
			que subes, y debes:
		</p>
		<ul>
			<li>Describir tu negocio con veracidad y sin datos de contacto de terceros.</li>
			<li>Subir solo imágenes que te pertenezcan o de las que tengas permiso.</li>
			<li>
				No publicar contenido ilegal, ofensivo, discriminatorio o que infrinja derechos de propiedad
				intelectual.
			</li>
		</ul>
		<p>Podemos editar o retirar cualquier contenido que incumpla estas reglas, sin previo aviso.</p>

		<h3>5. Propiedad intelectual</h3>
		<p>
			El diseño, el código y las guías editoriales de iisar pertenecen a sus autores. Cada negocio
			es propietario del nombre, los textos y las imágenes que publica en su ficha. Si consideras
			que alguien está usando tu material, escríbenos a
			<a href="mailto:{site.contactEmail}">{site.contactEmail}</a> y lo revisamos.
		</p>

		<h3>6. Uso no permitido</h3>
		<p>
			No puedes usar el directorio para enviar spam, intentar acceder a cuentas ajenas, automatizar
			consultas que degrade el servicio ni copiar el contenido del sitio para republicarlo.
		</p>

		<h3>7. Disponibilidad y cambios</h3>
		<p>
			El servicio se ofrece «como está»: puede interrumpirse por mantenimiento o causas fuera de
			nuestro control. Podemos modificar o desactivar cualquier parte del sitio; si tu suscripción
			está pagada y vigente, avisaremos antes de retirar tu ficha.
		</p>

		<h3>8. Limitación de responsabilidad</h3>
		<p>
			Respondemos por el daño directo que causemos por incumplimiento de estas condiciones. No
			respondemos por lucro cesante, pérdida de clientes ni daños indirectos. Nada en estos términos
			excluye la responsabilidad que no puede excluirse por ley.
		</p>

		<h3>9. Ley aplicable</h3>
		<p>
			Estos términos se rigen por las leyes de la República del Ecuador. Cualquier controversia se
			someterá a los jueces ordinarios del domicilio de {site.location}.
		</p>

		<h3>10. Contacto</h3>
		<p>
			Preguntas o reclamos: <a href="mailto:{site.contactEmail}">{site.contactEmail}</a>. Conoce
			<a href="/privacidad">cómo tratamos tus datos</a> o
			<a href="/contacto">escríbenos</a>.
		</p>
	</div>
</div>
