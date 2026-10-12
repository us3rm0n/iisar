<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search, MapPin, Waves, Mountain, TreePalm, Compass, Sparkles } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { PROVINCIAL_CAPITALS } from '$lib/search/capitals';
	import { buildPlaceIndex, matchPlaces, normalizeText } from '$lib/search/places';
	import { hrefForPlace } from '$lib/search/place-href';
	import { buildSearchHref } from '$lib/search/filters';
	import type { SearchCategory, SearchProvincia, SearchCiudad } from '$lib/search/options';

	type Props = {
		categories: SearchCategory[];
		provincias: SearchProvincia[];
		ciudades?: SearchCiudad[];
		currentQ?: string;
		hasActiveFilters?: boolean;
	};

	let {
		categories = [],
		provincias = [],
		ciudades = [],
		currentQ = '',
		hasActiveFilters = false
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	let q = $state(currentQ);
	let listOpen = $state(false);
	let activeIndex = $state(-1);

	$effect(() => {
		q = currentQ;
	});

	const places = $derived(
		buildPlaceIndex({
			provincias,
			capitals: PROVINCIAL_CAPITALS,
			businessCities: ciudades
		})
	);

	const matches = $derived(matchPlaces(places, q, 5));
	const queryText = $derived(q.trim());
	const suggesting = $derived(listOpen && normalizeText(q).length >= 2);
	const optionCount = $derived(matches.length + 1);

	async function go(href: string) {
		listOpen = false;
		activeIndex = -1;
		await goto(href);
	}

	function choose(index: number) {
		const place = matches[index];
		if (place) {
			go(hrefForPlace(place, { q: '', categoria: '', provincia: '', ciudad: '' }));
		} else {
			go(buildSearchHref({ q: queryText, categoria: '', provincia: '', ciudad: '' }));
		}
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (suggesting && activeIndex >= 0) {
			choose(activeIndex);
		} else {
			await go(buildSearchHref({ q: queryText, categoria: '', provincia: '', ciudad: '' }));
		}
	}

	function onInput() {
		listOpen = true;
		activeIndex = -1;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			if (!suggesting) {
				if (normalizeText(q).length < 2) return;
				listOpen = true;
			}
			event.preventDefault();
			if (event.key === 'ArrowDown') activeIndex = (activeIndex + 1) % optionCount;
			else activeIndex = activeIndex <= 0 ? optionCount - 1 : activeIndex - 1;
		} else if (event.key === 'Enter') {
			if (suggesting && activeIndex >= 0) {
				event.preventDefault();
				choose(activeIndex);
			}
		} else if (event.key === 'Escape' && suggesting) {
			event.preventDefault();
			listOpen = false;
			activeIndex = -1;
		}
	}

	const regions = [
		{
			id: 'costa',
			name: 'Costa',
			desc: 'Playas, puertos y gastronomía marina',
			icon: Waves
		},
		{
			id: 'sierra',
			name: 'Sierra',
			desc: 'Andes, volcanes y ciudades patrimoniales',
			icon: Mountain
		},
		{
			id: 'amazonia',
			name: 'Amazonía',
			desc: 'Selva viva, aventura y naturaleza virgen',
			icon: TreePalm
		},
		{
			id: 'insular',
			name: 'Galápagos',
			desc: 'Patrimonio de la humanidad y fauna única',
			icon: Compass
		}
	];
</script>

<div
	class="relative mb-10 overflow-visible rounded-2xl border border-border bg-gradient-to-b from-muted/50 via-card to-background p-6 shadow-xs sm:p-10"
>
	<div class="mx-auto flex max-w-2xl flex-col items-center text-center">
		<Badge
			variant="outline"
			class="mb-4 inline-flex items-center gap-1.5 border-border bg-background/80 px-3 py-1 text-caption font-medium backdrop-blur-xs"
		>
			<Sparkles class="size-3.5 text-foreground" aria-hidden="true" />
			Directorio comercial & guía geográfica de Ecuador
		</Badge>

		<h1 class="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
			Encuentra lo que necesitas,
			<span class="block text-muted-foreground sm:inline">descubre cada rincón.</span>
		</h1>

		<p class="mt-3 max-w-xl text-body text-muted-foreground sm:text-base">
			Servicios, negocios y atractivos locales de las 24 provincias de Ecuador en un solo lugar.
		</p>

		<!-- Unified Smart Search Bar -->
		<div class="relative mt-6 w-full max-w-xl">
			<form
				method="GET"
				action="/"
				role="search"
				aria-label="Búsqueda inteligente"
				onsubmit={submit}
				class="flex w-full items-center gap-2 rounded-full border border-border bg-background p-1.5 shadow-xs transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40"
			>
				<div class="relative flex flex-1 items-center">
					<Search
						class="pointer-events-none absolute left-3.5 size-4 text-muted-foreground"
						aria-hidden="true"
					/>
					<input
						name="q"
						bind:value={q}
						oninput={onInput}
						onkeydown={onKeydown}
						onblur={() => (listOpen = false)}
						placeholder="¿Qué buscas o a dónde vas? (ej. Cuenca, pizza, Baños, dentista)..."
						autocomplete="off"
						role="combobox"
						aria-expanded={suggesting}
						aria-autocomplete="list"
						aria-controls={suggesting ? 'hero-suggestions-list' : undefined}
						class="h-11 w-full rounded-full border-0 bg-transparent pr-3 pl-10 text-body text-foreground outline-none placeholder:text-muted-foreground"
					/>
				</div>

				<Button type="submit" variant="pill" class="h-11 shrink-0 px-5 font-medium">
					<Search class="size-4" aria-hidden="true" />
					<span>Buscar</span>
				</Button>
			</form>

			<!-- Suggestions popover -->
			{#if suggesting}
				<ul
					id="hero-suggestions-list"
					role="listbox"
					aria-label="Sugerencias de búsqueda"
					class="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-xl border border-border bg-card p-1 text-left shadow-lg"
					onmousedown={(event) => event.preventDefault()}
				>
					{#each matches as place, index (place.kind + place.name)}
						<li
							role="option"
							aria-selected={index === activeIndex}
							class="flex min-h-11 cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-body text-card-foreground transition-colors hover:bg-muted aria-selected:bg-muted"
							onclick={() => choose(index)}
							onkeydown={() => {}}
						>
							<div class="flex items-center gap-2.5">
								<MapPin class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
								<span class="font-medium text-foreground">{place.name}</span>
							</div>
							<span class="text-caption text-muted-foreground">
								{place.kind === 'provincia'
									? 'Provincia'
									: `Ciudad${place.provinciaNombre ? ` · ${place.provinciaNombre}` : ''}`}
							</span>
						</li>
					{/each}

					<li
						role="option"
						aria-selected={matches.length === activeIndex}
						class="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-body text-foreground transition-colors hover:bg-muted aria-selected:bg-muted {matches.length >
						0
							? 'border-t border-border/60'
							: ''}"
						onclick={() => choose(matches.length)}
						onkeydown={() => {}}
					>
						<Search class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<span class="min-w-0">Buscar «<strong class="font-semibold">{queryText}</strong>» en negocios y servicios</span>
					</li>
				</ul>
			{/if}
		</div>

		<!-- Quick Category Navigation -->
		{#if categories.length > 0}
			<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
				<span class="text-caption text-muted-foreground">Categorías populares:</span>
				{#each categories.slice(0, 6) as cat (cat.slug)}
					<a
						href="/?categoria={cat.slug}"
						class="rounded-full border border-border/80 bg-background/60 px-3 py-1 text-caption text-foreground transition-colors hover:bg-muted"
					>
						{cat.nombre}
					</a>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Territorial Discovery Blocks (Ecuador by Regions) -->
	{#if !hasActiveFilters}
		<div class="mt-10 border-t border-border/60 pt-6">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-body font-semibold text-foreground">Explora Ecuador por región</h2>
				<a
					href="/ecuador"
					class="text-caption font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
				>
					Ver las 24 provincias $\rightarrow$
				</a>
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{#each regions as region (region.id)}
					{@const Icon = region.icon}
					<a
						href="/ecuador#region-{region.id}"
						class="group flex flex-col gap-1 rounded-xl border border-border/60 bg-background/70 p-4 transition-all hover:border-border hover:bg-background hover:shadow-xs"
					>
						<div class="flex items-center gap-2">
							<span
								class="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
							>
								<Icon class="size-4" aria-hidden="true" />
							</span>
							<span class="text-body font-medium text-foreground">{region.name}</span>
						</div>
						<p class="mt-1 text-caption text-muted-foreground">
							{region.desc}
						</p>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
