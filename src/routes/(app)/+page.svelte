<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import BusinessCard from '$lib/components/business-card.svelte';
	import PageHeader from '$lib/components/page-header.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import { Search, Store, Megaphone, Plus, SearchX, AlertTriangle } from '@lucide/svelte';

	let { data } = $props();
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

	<!-- Search bar -->
	<div class="mx-auto mb-10 max-w-3xl">
		<form
			method="GET"
			role="search"
			aria-label="Buscar negocios"
			class="flex flex-col gap-2 rounded-xl border border-border bg-card p-2 sm:flex-row sm:items-center sm:gap-0 sm:p-1.5"
		>
			<div class="relative flex flex-1 items-center">
				<Search
					class="pointer-events-none absolute left-4 h-4 w-4 text-zinc-400"
					aria-hidden="true"
				/>
				<label for="q" class="sr-only">Buscar negocio o servicio</label>
				<input
					id="q"
					name="q"
					value={data.q}
					placeholder="Buscar negocio o servicio..."
					aria-label="Buscar negocio"
					class="h-11 w-full rounded-full bg-transparent pr-3 pl-10 text-[15px] placeholder:text-zinc-400 focus:outline-none"
				/>
			</div>
			<div class="hidden h-6 w-px bg-zinc-200/60 sm:block dark:bg-white/10"></div>
			<div
				class="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:pl-1"
			>
				<SelectField
					id="categoria"
					name="categoria"
					label="Categoría"
					hideLabel
					value={data.categoria}
					class="sm:flex-1"
				>
					<option value="">Todas las categorías</option>
					{#each data.categories as c (c.slug)}
						<option value={c.slug}>{c.nombre}</option>
					{/each}
				</SelectField>
				<SelectField
					id="provincia"
					name="provincia"
					label="Provincia"
					hideLabel
					value={data.provincia}
					class="sm:flex-1"
				>
					<option value="">Todas las provincias</option>
					{#each data.provincias as p (p.slug)}
						<option value={p.slug}>{p.nombre}</option>
					{/each}
				</SelectField>
				<Button type="submit" variant="pill" class="shrink-0">
					<Search class="h-4 w-4" /> Buscar
				</Button>
			</div>
		</form>
	</div>

	{#if data.provinciaProblem}
		<div
			class="mx-auto mb-8 flex max-w-3xl items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-100"
			role="alert"
		>
			<AlertTriangle class="h-4 w-4 shrink-0" aria-hidden="true" />
			{#if data.provinciaProblem === 'lookup-failed'}
				<span>No se pudo aplicar el filtro de provincia. Inténtalo de nuevo más tarde.</span>
			{:else}
				<span>La provincia «{data.provincia}» no existe. No hay resultados para ese filtro.</span>
			{/if}
		</div>
	{/if}

	{#if data.ads.length}
		<div class="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
			{#each data.ads as ad (ad.id)}
				<div class="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
						><Megaphone class="h-3.5 w-3.5" /></span
					>
					<span class="text-sm text-zinc-600 dark:text-zinc-300"
						>Publicidad · slot {ad.id.slice(0, 6)}</span
					>
					<Badge
						variant="secondary"
						class="ml-auto rounded-full bg-white/70 px-2.5 text-xs backdrop-blur dark:bg-white/10"
						>Ad</Badge
					>
				</div>
			{/each}
		</div>
	{/if}

	<section aria-labelledby="negocios-heading">
		<div class="mb-4 flex items-center justify-between">
			<h2
				id="negocios-heading"
				class="text-[15px] font-medium tracking-[-0.01em] text-zinc-900 sm:text-[16px] dark:text-white"
			>
				Negocios activos <span class="font-normal text-zinc-500">· {data.businesses.length}</span>
			</h2>
			<Badge
				variant="outline"
				class="hidden rounded-full border-zinc-200/60 bg-white/50 px-3 py-1 text-xs backdrop-blur sm:inline-flex dark:border-white/10 dark:bg-white/5"
				><Store class="mr-1 h-3 w-3" /> {data.categories.length} categorías</Badge
			>
		</div>

		{#if data.businesses.length === 0}
			<div class="rounded-xl border border-border bg-card py-12 text-center">
				<div class="mx-auto flex max-w-md flex-col items-center gap-3 px-6">
					<span
						class="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
						><SearchX class="h-7 w-7" aria-hidden="true" /></span
					>
					<p class="text-lg font-medium tracking-[-0.01em]">No hay resultados</p>
					<p class="text-sm text-zinc-500">
						Aún no hay negocios que coincidan con tu búsqueda. Sé el primero en crear tu landing.
					</p>
					<Button href="/dashboard" variant="pill" class="mt-2"
						><Plus class="h-4 w-4" /> Crear mi negocio</Button
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
	<p class="text-center text-xs text-zinc-400 dark:text-zinc-500">
		Slug MVP <code class="rounded-full bg-white/60 px-2 py-0.5 backdrop-blur dark:bg-white/10"
			>/negocio/[slug]</code
		>
		· futuro
		<code class="rounded-full bg-white/60 px-2 py-0.5 backdrop-blur dark:bg-white/10"
			>negocio.iisar.com</code
		>
	</p>
</div>
