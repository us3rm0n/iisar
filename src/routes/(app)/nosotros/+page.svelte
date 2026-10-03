<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardTitle } from '$lib/components/ui/card';
	import { BookOpen, MapPinned, Store, Users } from '@lucide/svelte';
	import { site } from '$lib/site';

	const pilares = [
		{
			icon: Store,
			title: 'Un directorio útil',
			description:
				'Fichas de negocios, artistas y lugares con categoría, provincia y contacto directo. Si no estás en el mapa, nadie te encuentra.'
		},
		{
			icon: BookOpen,
			title: 'Contenido propio',
			description:
				'Guías originales de las 24 provincias, escritas y verificadas contra fuentes oficiales, no copiadas de ningún libro.'
		},
		{
			icon: MapPinned,
			title: 'Cobertura de todo el país',
			description:
				'Costa, Sierra, Amazonía y Galápagos. Empezamos por lo local: Macas, Morona Santiago, y seguimos con el resto del Ecuador.'
		},
		{
			icon: Users,
			title: 'Publicidad sin posiciones premium',
			description:
				'El directorio se sostiene con publicidad de Google. Apoyarlo no cambia el orden de los resultados: todos los negocios aparecen igual.'
		}
	];
</script>

<svelte:head>
	<title>Sobre iisar</title>
	<meta
		name="description"
		content="Qué es iisar, quién está detrás del directorio de negocios del Ecuador y cómo se publica una ficha."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<PageHeader
		class="mb-8"
		title="Sobre iisar"
		description="Un directorio de negocios y servicios del Ecuador, hecho desde Macas y mantenido a mano."
	/>

	<div class="prose-content mb-10">
		<p>
			{site.name} ({site.tagline}) reúne los negocios, artistas y lugares del Ecuador en un solo
			lugar y los acompaña con guías de geografía que se leen en serio. Nació de una constatación
			simple: en las ciudades pequeñas, el negocio que no aparece en ningún directorio simplemente
			no existe para quien lo busca.
		</p>
		<p>
			El proyecto lo mantiene <strong>{site.owner}</strong> desde {site.location}, revisando fichas
			y planes una por una. No hay equipo de ventas: los avisos que ves en el sitio financian el
			hosting y el tiempo.
		</p>

		<h3>En qué creemos</h3>
		<ul>
			<li>
				<strong>La información pública tiene que ser de aquí.</strong> Las guías se escriben con fuentes
				oficiales y se pueden corregir desde el mismo sitio.
			</li>
			<li>
				<strong>La ficha de un negocio le pertenece a su dueño.</strong> Editarla es sencillo y no requiere
				permiso nuestro más allá de la revisión.
			</li>
			<li>
				<strong>La publicidad no compra lugar.</strong> Apoyar económicamente al directorio no te pone
				arriba: el orden de los resultados es el mismo para todos.
			</li>
		</ul>
	</div>

	<ul class="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
		{#each pilares as pilar (pilar.title)}
			<li>
				<Card class="h-full">
					<CardContent class="flex flex-col gap-2">
						<pilar.icon class="size-5 text-muted-foreground" aria-hidden="true" />
						<CardTitle class="text-base">{pilar.title}</CardTitle>
						<CardDescription>{pilar.description}</CardDescription>
					</CardContent>
				</Card>
			</li>
		{/each}
	</ul>

	<div class="prose-content mb-8">
		<h3>Cómo se publica una ficha</h3>
		<ol>
			<li>Creás una cuenta con tu correo.</li>
			<li>Registrás tu negocio con categoría, ciudad y contacto.</li>
			<li>Elegís un plan, pagás por adelantado y subís el comprobante.</li>
			<li>El webmaster revisa y aprueba; tu página queda activa con tu propia URL.</li>
		</ol>
		<p>
			Cuando la suscripción vence, tu ficha pasa a modo lectura durante un período de gracia y
			después queda visible pero congelada hasta que renueves. Los detalles están en los
			<a href="/terminos">términos y condiciones</a>.
		</p>
	</div>

	<Button href="/contacto" size="lg" class="h-11 px-4">Escribinos</Button>
</div>
