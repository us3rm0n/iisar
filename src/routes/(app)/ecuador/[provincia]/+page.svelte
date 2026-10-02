<script lang="ts">
	import BusinessCard from '$lib/components/business-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { ArrowLeft, MapPin, PackageOpen } from '@lucide/svelte';
	import { regionLabel } from '$lib/utils/provincias';
	import type { Provincia } from '$lib/types';

	let { data } = $props();

	const provincia = $derived(data.provincia as Provincia);
	const businesses = $derived(data.businesses);
</script>

<svelte:head>
	<title>{provincia.nombre} — Geografía de Ecuador | IISAR</title>
	<meta
		name="description"
		content="Conoce {provincia.nombre} ({regionLabel(
			provincia.region
		)}) y los negocios, artistas y lugares registrados ahí."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<a
		href="/ecuador"
		class="mb-4 inline-flex min-h-11 items-center gap-1 text-body font-medium text-muted-foreground hover:text-foreground"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Todas las provincias
	</a>

	<PageHeader class="mb-6" title={provincia.nombre}>
		{#snippet actions()}
			<Badge variant="secondary"
				><MapPin aria-hidden="true" /> {regionLabel(provincia.region)}</Badge
			>
		{/snippet}
	</PageHeader>

	{#if data.lessonHtml}
		<article class="prose-content mb-10">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- el HTML pasa por renderProvinceHtml (marked + allowlist estricta de sanitize.ts); el markdown es editable por el webmaster, nunca se inyecta sin sanear -->
			{@html data.lessonHtml}
		</article>
	{:else}
		<p class="mb-10 text-body text-muted-foreground">
			Aún no hay contenido editorial para esta provincia.
		</p>
	{/if}

	<section aria-labelledby="negocios-heading">
		<h2 id="negocios-heading" class="mb-3 text-title font-semibold text-foreground">
			Negocios, artistas y lugares en {provincia.nombre}
			<span class="text-body font-normal text-muted-foreground">· {businesses.length}</span>
		</h2>

		{#if businesses.length === 0}
			<Card class="py-10 text-center">
				<CardContent class="flex flex-col items-center gap-3">
					<PackageOpen class="size-10 text-muted-foreground" aria-hidden="true" />
					<CardTitle class="text-base">Sin registros aún</CardTitle>
					<CardDescription
						>Nadie ha registrado un negocio, artista o lugar en {provincia.nombre} todavía.</CardDescription
					>
					<Button href="/dashboard" size="sm" class="mt-1 h-11 w-full sm:h-8 sm:w-auto"
						>Registrar el mío</Button
					>
				</CardContent>
			</Card>
		{:else}
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
				{#each businesses as business (business.id)}
					<li>
						<BusinessCard {business} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
