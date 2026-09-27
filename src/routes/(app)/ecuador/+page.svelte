<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Mountain, Waves, TreePalm, Compass } from '@lucide/svelte';
	import type { Provincia, ProvinciaRegion } from '$lib/types';

	let { data } = $props();

	const REGIONS: { key: ProvinciaRegion; label: string; icon: typeof Waves }[] = [
		{ key: 'costa', label: 'Costa', icon: Waves },
		{ key: 'sierra', label: 'Sierra', icon: Mountain },
		{ key: 'amazonia', label: 'Amazonía', icon: TreePalm },
		{ key: 'insular', label: 'Insular', icon: Compass }
	];

	const provinciasByRegion = $derived(
		REGIONS.map((r) => ({
			...r,
			provincias: (data.provincias as Provincia[]).filter((p) => p.region === r.key)
		}))
	);

	const generalTitles = $derived((data.general as { order: number; title: string }[]).map((l) => l.title));
</script>

<svelte:head>
	<title>Geografía de Ecuador | IISAR</title>
	<meta name="description" content="Recorre las 24 provincias del Ecuador por región y descubre negocios, artistas y lugares en cada una." />
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<div class="mb-8 text-center sm:mb-10">
		<h1 class="mx-auto max-w-2xl text-[28px] font-semibold tracking-[-0.02em] text-zinc-900 sm:text-[38px] dark:text-white">
			Geografía de Ecuador
		</h1>
		<p class="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-500 sm:text-[17px] dark:text-zinc-400">
			24 provincias en cuatro regiones — relieve, clima y cultura de cada una, con los negocios, artistas y lugares
			que puedes visitar.
		</p>
		{#if generalTitles.length}
			<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
				{#each generalTitles as title (title)}
					<Badge variant="outline" class="rounded-full">{title}</Badge>
				{/each}
			</div>
		{/if}
	</div>

	{#each provinciasByRegion as region (region.key)}
		<section class="mb-10" aria-labelledby="region-{region.key}-heading">
			<h2 id="region-{region.key}-heading" class="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
				<region.icon class="h-5 w-5" aria-hidden="true" />
				{region.label}
				<span class="text-sm font-normal text-zinc-500">· {region.provincias.length} {region.provincias.length === 1 ? 'provincia' : 'provincias'}</span>
			</h2>
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
				{#each region.provincias as provincia (provincia.id)}
					<li>
						<a href="/ecuador/{provincia.slug}" class="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 rounded-xl">
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
