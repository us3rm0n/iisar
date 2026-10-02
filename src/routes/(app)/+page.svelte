<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import BusinessCard from '$lib/components/business-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import { Store, Plus, SearchX, AlertTriangle } from '@lucide/svelte';

	let { data } = $props();

	const filtersActive = $derived(Boolean(data.q || data.categoria || data.provincia));
</script>

<svelte:head>
	<title>iisar — Directorio de negocios y servicios</title>
	<meta
		name="description"
		content="Encuentra productos y servicios por categoría. Cada negocio con su landing page."
	/>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<PageHeader
		align="center"
		class="mx-auto mb-8 max-w-2xl sm:mb-10"
		title="Descubre negocios cerca de ti"
		description="Directorio de productos y servicios · gastronomía, salud, artistas y más. Cada negocio con su landing page."
	/>

	{#if filtersActive}
		<div class="mb-6 flex items-center justify-between gap-3 text-body text-muted-foreground">
			<span>Resultados filtrados</span>
			<a
				href="/"
				class="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-foreground underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				>Limpiar</a
			>
		</div>
	{/if}

	{#if data.provinciaProblem}
		<div
			class="mx-auto mb-8 flex max-w-3xl items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-body text-foreground"
			role="alert"
		>
			<AlertTriangle class="size-4 shrink-0" aria-hidden="true" />
			{#if data.provinciaProblem === 'lookup-failed'}
				<span>No se pudo aplicar el filtro de provincia. Inténtalo de nuevo más tarde.</span>
			{:else}
				<span>La provincia «{data.provincia}» no existe. No hay resultados para ese filtro.</span>
			{/if}
		</div>
	{/if}

	<section aria-labelledby="negocios-heading">
		<div class="mb-4 flex items-center justify-between">
			<h2 id="negocios-heading" class="text-title font-medium text-foreground">
				Negocios activos <span class="font-normal text-muted-foreground"
					>· {data.businesses.length}</span
				>
			</h2>
			<Badge variant="outline" class="hidden sm:inline-flex"
				><Store aria-hidden="true" /> {data.searchOptions.categories.length} categorías</Badge
			>
		</div>

		{#if data.businesses.length === 0}
			<div class="rounded-lg border border-border bg-card py-12 text-center">
				<div class="mx-auto flex max-w-md flex-col items-center gap-3 px-6">
					<span
						class="flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground"
						><SearchX class="size-7" aria-hidden="true" /></span
					>
					<p class="text-title font-medium">No hay resultados</p>
					<p class="text-body text-muted-foreground">
						Aún no hay negocios que coincidan con tu búsqueda. Sé el primero en crear tu landing.
					</p>
					<Button href="/dashboard" variant="pill" class="mt-2"
						><Plus class="size-4" aria-hidden="true" /> Crear mi negocio</Button
					>
				</div>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
				{#each data.businesses as b (b.id)}
					<li>
						<BusinessCard business={b} />
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<Separator class="my-10 opacity-50" />
	<p class="text-center text-caption text-muted-foreground">
		Slug MVP <code class="rounded-md bg-muted px-2 py-0.5">/negocio/[slug]</code>
		· futuro
		<code class="rounded-md bg-muted px-2 py-0.5">negocio.iisar.com</code>
	</p>
</div>
