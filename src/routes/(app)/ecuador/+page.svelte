<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import PageHeader from '$lib/components/page-header.svelte';
	import { groupByRegion } from '$lib/utils/provincias';
	import { regionIcon } from '$lib/utils/regions';
	import type { Provincia } from '$lib/types';

	let { data } = $props();

	const provincesByRegion = $derived(
		groupByRegion(data.provincias as Provincia[]).map((group) => ({
			...group,
			icon: regionIcon(group.region)
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
	<PageHeader
		align="center"
		class="mx-auto mb-8 max-w-2xl sm:mb-10"
		title="Geografía de Ecuador"
		description="24 provincias en cuatro regiones: relieve, clima y cultura de cada una, con los negocios, artistas y lugares que puedes visitar."
	>
		{#snippet actions()}
			{#if generalTitles.length}
				{#each generalTitles as title (title)}
					<Badge variant="outline">{title}</Badge>
				{/each}
			{/if}
		{/snippet}
	</PageHeader>

	{#each provincesByRegion as region (region.region)}
		<section class="mb-10" aria-labelledby="region-{region.region}-heading">
			<h2
				id="region-{region.region}-heading"
				class="mb-4 flex items-center gap-2 text-title font-semibold text-foreground"
			>
				<region.icon class="size-5" aria-hidden="true" />
				{region.label}
				<span class="text-body font-normal text-muted-foreground"
					>· {region.provincias.length}
					{region.provincias.length === 1 ? 'provincia' : 'provincias'}</span
				>
			</h2>
			<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
				{#each region.provincias as provincia (provincia.id)}
					<li>
						<a
							href="/ecuador/{provincia.slug}"
							class="flex h-full min-h-11 flex-col gap-1 rounded-lg border border-border bg-card p-4 text-card-foreground outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
						>
							<span class="text-body font-medium">{provincia.nombre}</span>
							<span class="text-caption text-muted-foreground">Lección {provincia.orden}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
