<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Search, Store, MapPin, Megaphone, Plus, SearchX, AlertTriangle } from '@lucide/svelte';
	import { firstRelation } from '$lib/supabase/helpers';
	import type { Business } from '$lib/types';

	let { data } = $props();

	// PostgREST embebida la relación como objeto o como arreglo de un elemento.
	// Solo se pide el campo que se lee, no la fila completa.
	const categoryName = (business: Pick<Business, 'categories'>) =>
		firstRelation(business.categories)?.nombre;
</script>

<svelte:head>
	<title>iisar — Directorio de negocios y servicios</title>
	<meta
		name="description"
		content="Encuentra productos y servicios por categoría. Cada negocio con su landing page."
	/>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
	<!-- Hero Apple -->
	<div class="mb-8 text-center sm:mb-10">
		<h1
			class="mx-auto max-w-2xl text-[30px] font-semibold tracking-[-0.03em] text-zinc-900 sm:text-[42px] sm:leading-[0.95] lg:text-[48px] dark:text-white"
		>
			Descubre negocios cerca de ti
		</h1>
		<p
			class="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-500 sm:text-[17px] dark:text-zinc-400"
		>
			Directorio de productos y servicios · gastronomía, salud, artistas y más. Cada negocio con su
			landing page.
		</p>
	</div>

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
				<label for="categoria" class="sr-only">Categoría</label>
				<select
					id="categoria"
					name="categoria"
					value={data.categoria}
					aria-label="Filtrar por categoría"
					class="h-11 w-full rounded-full bg-transparent px-3 py-2 text-sm text-zinc-600 focus:outline-none sm:flex-1 dark:text-zinc-300"
				>
					<option value="">Todas las categorías</option>
					{#each data.categories as c (c.slug)}
						<option value={c.slug}>{c.nombre}</option>
					{/each}
				</select>
				<label for="provincia" class="sr-only">Provincia</label>
				<select
					id="provincia"
					name="provincia"
					value={data.provincia}
					aria-label="Filtrar por provincia"
					class="h-11 w-full rounded-full bg-transparent px-3 py-2 text-sm text-zinc-600 focus:outline-none sm:flex-1 dark:text-zinc-300"
				>
					<option value="">Todas las provincias</option>
					{#each data.provincias as p (p.slug)}
						<option value={p.slug}>{p.nombre}</option>
					{/each}
				</select>
				<Button
					type="submit"
					size="lg"
					class="h-11 shrink-0 rounded-full bg-zinc-900 px-6 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
				>
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
					<Button
						href="/dashboard"
						class="mt-2 rounded-full bg-zinc-900 px-6 text-white dark:bg-white dark:text-zinc-900"
						><Plus class="h-4 w-4" /> Crear mi negocio</Button
					>
				</div>
			</div>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
				{#each data.businesses as b (b.id)}
					<li>
						<a
							href="/negocio/{b.slug}"
							class="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:translate-y-[-2px] hover:shadow-[0_20px_56px_rgba(0,0,0,0.10)] focus-visible:ring-2 focus-visible:ring-zinc-900/20 focus-visible:outline-none"
						>
							<div class="flex items-start justify-between gap-2">
								<h3
									class="line-clamp-1 text-[16px] leading-tight font-medium tracking-[-0.01em] text-zinc-900 group-hover:underline dark:text-white"
								>
									{b.nombre}
								</h3>
								<div class="flex shrink-0 gap-1">
									<Badge
										variant={b.tipo === 'artista' ? 'default' : 'secondary'}
										class="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize {b.tipo ===
										'artista'
											? 'bg-violet-600 text-white'
											: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'}"
										>{b.tipo ?? 'negocio'}</Badge
									>
									{#if categoryName(b)}
										<Badge
											variant="outline"
											class="hidden rounded-full bg-white/60 px-2 py-0.5 text-[11px] sm:inline-flex dark:bg-white/10"
											>{categoryName(b)}</Badge
										>
									{/if}
								</div>
							</div>
							{#if b.ciudad}
								<p class="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
									<MapPin class="h-3 w-3" />
									{b.ciudad}
								</p>
							{/if}
							<p
								class="mt-3 line-clamp-2 min-h-[40px] text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400"
							>
								{b.descripcion ?? 'Sin descripción'}
							</p>
							<span
								class="mt-4 inline-flex items-center text-xs font-medium text-zinc-900 dark:text-white"
								>Ver landing <span class="ml-1 transition-transform group-hover:translate-x-0.5"
									>→</span
								></span
							>
						</a>
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
