<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Mountain, Waves, TreePalm, Compass } from '@lucide/svelte';
	import { groupByRegion } from '$lib/utils/provincias';
	import type { Provincia, ProvinciaRegion } from '$lib/types';

	let { data } = $props();

	// Las etiquetas de región viven en $lib/utils/provincias; aquí solo los íconos.
	const REGION_ICONS: Record<ProvinciaRegion, typeof Waves> = {
		costa: Waves,
		sierra: Mountain,
		amazonia: TreePalm,
		insular: Compass
	};

	const provincesByRegion = $derived(
		groupByRegion(data.provincias as Provincia[]).map((group) => ({
			...group,
			icon: REGION_ICONS[group.region]
		}))
	);

	const generalTitles = $derived(
		(data.general as { order: number; title: string }[]).map((l) => l.title)
	);
</script>

<svelte:head>
	<title>Geografía de Ecuador | IISAR</title>
	<meta
		name="description"
		content="Recorre las 24 provincias del Ecuador por región y descubre negocios, artistas y lugares en cada una."
	/>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<div class="mb-8 text-center sm:mb-10">
		<h1
			class="mx-auto max-w-2xl text-[28px] font-semibold tracking-[-0.02em] text-zinc-900 sm:text-[38px] dark:text-white"
		>
			Geografía de Ecuador
		</h1>
		<p
			class="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-500 sm:text-[17px] dark:text-zinc-400"
		>
			24 provincias en cuatro regiones — relieve, clima y cultura de cada una, con los negocios,
			artistas y lugares que puedes visitar.
		</p>
		{#if generalTitles.length}
			<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
				{#each generalTitles as title (title)}
					<Badge variant="outline" class="rounded-full">{title}</Badge>
				{/each}
			</div>
		{/if}
	</div>

	{#each provincesByRegion as region (region.region)}
		<section class="mb-10" aria-labelledby="region-{region.region}-heading">
			<h2
				id="region-{region.region}-heading"
				class="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white"
			>
				<region.icon class="h-5 w-5" aria-hidden="true" />
				{region.label}
				<span class="text-sm font-normal text-zinc-500"
					>· {region.provincias.length}
					{region.provincias.length === 1 ? 'provincia' : 'provincias'}</span
				>
			</h2>
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
				{#each region.provincias as provincia (provincia.id)}
					<li>
						<a
							href="/ecuador/{provincia.slug}"
							class="block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:outline-none"
						>
							<Card class="h-full min-h-[44px] transition-shadow hover:shadow-md">
								<CardHeader>
									<CardTitle class="text-base">{provincia.nombre}</CardTitle>
									<CardDescription>Lección {provincia.orden}</CardDescription>
								</CardHeader>
							</Card>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
