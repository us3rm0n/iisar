<script lang="ts">
	import PageHeader from '$lib/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardTitle } from '$lib/components/ui/card';
	import { Mail, MapPin } from '@lucide/svelte';
	import { site } from '$lib/site';
</script>

<svelte:head>
	<title>Contacto | IISAR</title>
	<meta
		name="description"
		content="Escríbenos a iisar: registro de un negocio, dudas sobre una suscripción, publicidad o reportar un dato incorrecto."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<PageHeader
		class="mb-8"
		title="Contacto"
		description="Escribinos y te respondemos por correo. Atendemos Ecuador en español."
	/>

	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
		<Button href="mailto:{site.contactEmail}" size="lg" class="h-11 px-4">
			<Mail aria-hidden="true" />
			{site.contactEmail}
		</Button>
	</div>

	<ul class="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
		<li>
			<Card class="h-full">
				<CardContent class="flex flex-col gap-2">
					<CardTitle class="flex items-center gap-2 text-base">
						<Mail class="size-4" aria-hidden="true" /> Correo
					</CardTitle>
					<CardDescription>
						La vía más rápida. Escribenos desde el correo con el que registraste tu cuenta si tu
						consulta es sobre tu ficha o tu suscripción.
					</CardDescription>
				</CardContent>
			</Card>
		</li>
		<li>
			<Card class="h-full">
				<CardContent class="flex flex-col gap-2">
					<CardTitle class="flex items-center gap-2 text-base">
						<MapPin class="size-4" aria-hidden="true" /> Domicilio
					</CardTitle>
					<CardDescription>
						{site.owner}<br />
						{site.location}
					</CardDescription>
				</CardContent>
			</Card>
		</li>
	</ul>

	<div class="prose-content">
		<h3>Qué escribirnos</h3>
		<ul>
			<li>
				<strong>Quiero registrar mi negocio.</strong> Creá una cuenta en el sitio y seguí el proceso de
				registro; el aviso aparece en tu panel.
			</li>
			<li>
				<strong>Consulta sobre mi suscripción o comprobante.</strong> Indicá el nombre del negocio y el
				correo de la cuenta.
			</li>
			<li>
				<strong>Un dato está mal o quiero editar mi ficha.</strong> Entrá a tu panel y corregilo vos mismo;
				si no podés, escribinos.
			</li>
			<li>
				<strong>Reportar contenido ajeno o un problema del sitio.</strong> Contá qué página es y qué falla.
			</li>
			<li><strong>Publicidad.</strong> Escribinos al mismo correo con el asunto «Publicidad».</li>
		</ul>

		<h3>Antes de escribir</h3>
		<p>
			La información pública de cada provincia ya se puede consultar y corregir sin escribirnos:
			está en las guías de <a href="/ecuador">geografía del Ecuador</a>. Para datos de negocios
			concretos, empezá por tu panel.
		</p>
	</div>
</div>
