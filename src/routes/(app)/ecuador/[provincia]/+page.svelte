<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui/card';
	import { ArrowLeft, MapPin, Store, Palette, Landmark, PackageOpen } from '@lucide/svelte';
	import type { Provincia } from '$lib/types';
	import type { BusinessCard } from './+page.server';

	let { data } = $props();

	const provincia = $derived(data.provincia as Provincia);
	const businesses = $derived(data.businesses as BusinessCard[]);

	const REGION_LABELS: Record<string, string> = {
		costa: 'Costa',
		sierra: 'Sierra',
		amazonia: 'Amazonía',
		insular: 'Insular'
	};

	const TIPO_META: Record<string, { label: string; icon: typeof Store }> = {
		negocio: { label: 'Negocio', icon: Store },
		artista: { label: 'Artista', icon: Palette },
		lugar: { label: 'Lugar', icon: Landmark }
	};
</script>

<svelte:head>
	<title>{provincia.nombre} — Geografía de Ecuador | IISAR</title>
	<meta name="description" content="Conoce {provincia.nombre} ({REGION_LABELS[provincia.region]}) y los negocios, artistas y lugares registrados ahí." />
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<a href="/ecuador" class="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
		<ArrowLeft class="h-4 w-4" /> Todas las provincias
	</a>

	<div class="mb-6 flex flex-wrap items-center gap-2">
		<h1 class="text-2xl font-semibold tracking-[-0.01em] text-zinc-900 sm:text-3xl dark:text-white">{provincia.nombre}</h1>
		<Badge variant="secondary" class="rounded-full"><MapPin class="mr-1 h-3 w-3" /> {REGION_LABELS[provincia.region] ?? provincia.region}</Badge>
	</div>

	{#if data.lessonHtml}
		<article class="ecuador-content mb-10 max-w-none">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- markdown de confianza del repo (content/geografia-ecuador.md), renderizado server-side, no input de usuario -->
			{@html data.lessonHtml}
		</article>
	{:else}
		<p class="mb-10 text-sm text-muted-foreground">Aún no hay contenido editorial para esta provincia.</p>
	{/if}

	<section aria-labelledby="negocios-heading">
		<h2 id="negocios-heading" class="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
			Negocios, artistas y lugares en {provincia.nombre}
			<span class="text-sm font-normal text-zinc-500">· {businesses.length}</span>
		</h2>

		{#if businesses.length === 0}
			<Card class="py-10 text-center">
				<CardContent class="flex flex-col items-center gap-3">
					<PackageOpen class="h-10 w-10 text-muted-foreground" />
					<CardTitle class="text-base">Sin registros aún</CardTitle>
					<CardDescription>Nadie ha registrado un negocio, artista o lugar en {provincia.nombre} todavía.</CardDescription>
					<Button href="/dashboard" size="sm" class="mt-1">Registrar el mío</Button>
				</CardContent>
			</Card>
		{:else}
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
				{#each businesses as business (business.id)}
					{@const meta = TIPO_META[business.tipo] ?? TIPO_META.negocio}
					<li>
						<a href="/negocio/{business.slug}" class="block h-full min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 rounded-xl">
							<Card class="h-full transition-shadow hover:shadow-md">
								<CardHeader class="pb-2">
									<div class="flex items-center justify-between gap-2">
										<CardTitle class="line-clamp-1 text-base">{business.nombre}</CardTitle>
										<Badge variant="outline" class="shrink-0 gap-1 rounded-full"><meta.icon class="h-3 w-3" /> {meta.label}</Badge>
									</div>
									{#if business.ciudad}
										<CardDescription class="flex items-center gap-1"><MapPin class="h-3 w-3" /> {business.ciudad}</CardDescription>
									{/if}
								</CardHeader>
								{#if business.descripcion}
									<CardContent>
										<p class="line-clamp-2 text-sm text-muted-foreground">{business.descripcion}</p>
									</CardContent>
								{/if}
							</Card>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.ecuador-content :global(h3) {
		margin-top: 1.75rem;
		margin-bottom: 0.5rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: hsl(var(--foreground));
	}
	.ecuador-content :global(p) {
		margin-top: 0.5rem;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: hsl(var(--foreground));
	}
	.ecuador-content :global(ul),
	.ecuador-content :global(ol) {
		margin-top: 0.5rem;
		padding-left: 1.25rem;
		font-size: 0.9375rem;
		line-height: 1.6;
	}
	.ecuador-content :global(ul) {
		list-style: disc;
	}
	.ecuador-content :global(ol) {
		list-style: decimal;
	}
	.ecuador-content :global(strong) {
		font-weight: 600;
	}
	.ecuador-content :global(table) {
		margin-top: 0.75rem;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.ecuador-content :global(.table-scroll) {
		margin-top: 0.75rem;
		overflow-x: auto;
	}
	.ecuador-content :global(th),
	.ecuador-content :global(td) {
		border: 1px solid hsl(var(--border));
		padding: 0.4rem 0.6rem;
		text-align: left;
	}
	.ecuador-content :global(th) {
		background: hsl(var(--muted));
		font-weight: 600;
	}
</style>
