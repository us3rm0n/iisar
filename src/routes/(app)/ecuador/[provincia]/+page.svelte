<script lang="ts">
	import AdsenseScript from '$lib/components/adsense-script.svelte';
	import BusinessCard from '$lib/components/business-card.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { ArrowLeft, PackageOpen, Pencil } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';
	import GuideSources from '$lib/components/ecuador/guide-sources.svelte';
	import GuideToc from '$lib/components/ecuador/guide-toc.svelte';
	import ProvinceEditor from '$lib/components/ecuador/province-editor.svelte';
	import ProvinceHero from '$lib/components/ecuador/province-hero.svelte';
	import ProvinceNeighbors from '$lib/components/ecuador/province-neighbors.svelte';
	import { useSession } from '$lib/session-context';
	import { canEditProvince } from '$lib/utils/province-editor';
	import { regionLabel } from '$lib/utils/provincias';
	import type { Provincia } from '$lib/types';

	let { data } = $props();

	const provincia = $derived(data.provincia as Provincia);
	const businesses = $derived(data.businesses);
	const guide = $derived(data.guide);
	const hasArticle = $derived(
		guide.introHtml !== '' || guide.sections.length > 0 || guide.sources.length > 0
	);

	// Convenience only: RLS (`is_webmaster()`) is the real permission. While the role is still
	// loading (null) nothing is shown, so the page looks exactly as it does for visitors.
	const session = useSession();
	const canEdit = $derived(canEditProvince(session?.role ?? null));
	let editing = $state(false);

	async function onsaved() {
		await invalidateAll();
		editing = false;
	}
</script>

{#if hasArticle}
	<AdsenseScript />
{/if}

<svelte:head>
	<title>{provincia.nombre} — Geografía de Ecuador | IISAR</title>
	<meta
		name="description"
		content="Conoce {provincia.nombre} ({regionLabel(
			provincia.region
		)}) y los negocios, artistas y lugares registrados ahí."
	/>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<a
		href="/ecuador"
		class="mb-4 inline-flex min-h-11 items-center gap-1 text-body font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
	>
		<ArrowLeft class="size-4" aria-hidden="true" /> Todas las provincias
	</a>

	<ProvinceHero class="mb-6" nombre={provincia.nombre} region={provincia.region}>
		{#snippet actions()}
			{#if canEdit && !editing}
				<Button variant="outline" class="h-11 px-4" onclick={() => (editing = true)}>
					<Pencil aria-hidden="true" />
					{data.body === '' ? 'Agregar contenido' : 'Editar contenido'}
				</Button>
			{/if}
		{/snippet}
	</ProvinceHero>

	{#if canEdit && editing}
		<div class="mb-10 max-w-3xl">
			<ProvinceEditor
				provinciaId={provincia.id}
				initialBody={data.body}
				{onsaved}
				oncancel={() => (editing = false)}
			/>
		</div>
	{:else if hasArticle}
		<div
			class="mb-10 {guide.sections.length > 0
				? 'lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10'
				: ''}"
		>
			{#if guide.sections.length > 0}
				<div class="mb-6 lg:mb-0">
					<GuideToc sections={guide.sections} />
				</div>
			{/if}

			<article aria-labelledby="guia-heading" class="max-w-[68ch] min-w-0">
				<h2 id="guia-heading" class="sr-only">Guía de {provincia.nombre}</h2>
				{#if guide.introHtml}
					<div class="prose-content prose-lead mb-8">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- el HTML pasa por renderProvinceHtml (marked + allowlist estricta de sanitize.ts); el markdown es editable por el webmaster, nunca se inyecta sin sanear -->
						{@html guide.introHtml}
					</div>
				{/if}
				{#each guide.sections as section (section.id)}
					<section
						id={section.id}
						aria-labelledby="{section.id}-title"
						class="prose-content mb-8 scroll-mt-20"
					>
						<h3 id="{section.id}-title">{section.title}</h3>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- el HTML pasa por renderProvinceHtml (marked + allowlist estricta de sanitize.ts); el markdown es editable por el webmaster, nunca se inyecta sin sanear -->
						{@html section.html}
					</section>
				{/each}
				{#if guide.sources.length > 0}
					<GuideSources sources={guide.sources} />
				{/if}
			</article>
		</div>
	{:else}
		<p class="mb-10 text-body text-muted-foreground">
			Aún no hay contenido editorial para esta provincia.
		</p>
	{/if}

	{#if data.neighbors.length > 0}
		<div class="mb-10">
			<ProvinceNeighbors neighbors={data.neighbors} />
		</div>
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
