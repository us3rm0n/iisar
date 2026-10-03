<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { ChevronDown, Search } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import SelectField from '$lib/components/select-field.svelte';
	import { buildSearchHref, hasActiveFilters, type SearchFilters } from '$lib/search/filters';
	import type { SearchCategory, SearchProvincia } from '$lib/search/options';
	import { hrefForPlace } from '$lib/search/place-href';
	import { matchPlaces, normalizeText, type Place } from '$lib/search/places';

	type Props = {
		id: string;
		categories: SearchCategory[];
		provincias: SearchProvincia[];
		/** Searchable provinces and cities, built once by the layout. */
		places: Place[];
		/** Filters currently in the URL; they prefill the fields when the panel opens. */
		filters: SearchFilters;
		onclose: () => void;
	};

	let { id, categories, provincias, places, filters, onclose }: Props = $props();

	const SUGGESTION_LIMIT = 5;
	// Derived from the panel id so the aria-controls / listbox ids stay unique and consistent.
	const listId = $derived(`${id}-suggestions`);
	const moreId = $derived(`${id}-more`);

	// The panel is mounted only while open, so the fields start from the URL each time.
	// svelte-ignore state_referenced_locally
	let q = $state(filters.q);
	// svelte-ignore state_referenced_locally
	let categoria = $state(filters.categoria);
	// svelte-ignore state_referenced_locally
	let provincia = $state(filters.provincia);
	// A city filter is kept (hidden) so a new text search stays inside it.
	// svelte-ignore state_referenced_locally
	const ciudad = filters.ciudad;
	// svelte-ignore state_referenced_locally
	let moreOpen = $state(filters.categoria !== '' || filters.provincia !== '');
	let listOpen = $state(false);
	let activeIndex = $state(-1);
	let input = $state<HTMLInputElement | null>(null);

	const matches = $derived(matchPlaces(places, q, SUGGESTION_LIMIT));
	const queryText = $derived(q.trim());
	const suggesting = $derived(listOpen && normalizeText(q).length >= 2);
	// One entry per option: the matched places, then the plain text search.
	const optionCount = $derived(matches.length + 1);
	const activeId = $derived(
		suggesting && activeIndex >= 0 && activeIndex < optionCount
			? `${id}-option-${activeIndex}`
			: undefined
	);

	onMount(() => input?.focus());

	function current(): SearchFilters {
		return { q, categoria, provincia, ciudad };
	}

	async function go(href: string) {
		listOpen = false;
		activeIndex = -1;
		await goto(href);
		onclose();
	}

	function choose(index: number) {
		const place = matches[index];
		if (place) go(hrefForPlace(place, current()));
		else go(buildSearchHref(current()));
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		await go(buildSearchHref(current()));
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
			// First Escape only closes the suggestions; the layout closes the panel on the next one.
			event.preventDefault();
			event.stopPropagation();
			listOpen = false;
			activeIndex = -1;
		}
	}

	async function clear() {
		q = '';
		categoria = '';
		provincia = '';
		listOpen = false;
		if (hasActiveFilters(filters)) {
			await goto('/');
			onclose();
		} else {
			input?.focus();
		}
	}
</script>

<div {id} class="border-t border-border bg-background">
	<form
		method="GET"
		action="/"
		role="search"
		aria-label="Buscar negocios"
		onsubmit={submit}
		class="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8"
	>
		{#if ciudad}
			<input type="hidden" name="ciudad" value={ciudad} />
		{/if}
		<div class="flex flex-col gap-1.5">
			<label for="search-q" class="text-caption font-medium text-muted-foreground">
				Buscar negocios o lugares
			</label>
			<div class="relative flex items-center">
				<Search
					class="pointer-events-none absolute left-3 size-4 text-muted-foreground"
					aria-hidden="true"
				/>
				<input
					id="search-q"
					name="q"
					bind:value={q}
					bind:this={input}
					oninput={onInput}
					onkeydown={onKeydown}
					onblur={() => (listOpen = false)}
					placeholder="Ej.: Manabí, Cuenca, panadería"
					autocomplete="off"
					role="combobox"
					aria-autocomplete="list"
					aria-expanded={suggesting}
					aria-controls={listId}
					aria-activedescendant={activeId}
					class="h-11 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				/>
			</div>
			{#if suggesting}
				<!-- mousedown is cancelled so the input keeps focus and the click is not lost. -->
				<ul
					id={listId}
					role="listbox"
					aria-label="Sugerencias"
					class="overflow-hidden rounded-lg border border-border bg-background"
					onmousedown={(event) => event.preventDefault()}
				>
					{#each matches as place, index (place.kind + place.name)}
						<li
							id={`${id}-option-${index}`}
							role="option"
							aria-selected={index === activeIndex}
							class="flex min-h-11 cursor-pointer flex-col justify-center px-3 py-1.5 text-body text-foreground aria-selected:bg-muted"
							onclick={() => choose(index)}
							onkeydown={() => {}}
						>
							<span class="font-medium">{place.name}</span>
							<span class="text-caption text-muted-foreground">
								{place.kind === 'provincia'
									? 'Provincia'
									: `Ciudad${place.provinciaNombre ? ` · ${place.provinciaNombre}` : ''}`}
							</span>
						</li>
					{/each}
					<li
						id={`${id}-option-${matches.length}`}
						role="option"
						aria-selected={matches.length === activeIndex}
						class="flex min-h-11 cursor-pointer items-center gap-2 px-3 py-1.5 text-body text-foreground aria-selected:bg-muted {matches.length >
						0
							? 'border-t border-border'
							: ''}"
						onclick={() => choose(matches.length)}
						onkeydown={() => {}}
					>
						<Search class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<span class="min-w-0 break-words">Buscar «{queryText}» en negocios</span>
					</li>
				</ul>
			{/if}
		</div>

		<div class="flex flex-col gap-3">
			<button
				type="button"
				class="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg px-1 text-body font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
				aria-expanded={moreOpen}
				aria-controls={moreId}
				onclick={() => (moreOpen = !moreOpen)}
			>
				Más filtros
				<ChevronDown
					class="size-4 transition-transform {moreOpen ? 'rotate-180' : ''}"
					aria-hidden="true"
				/>
			</button>
			{#if moreOpen}
				<div id={moreId} class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<SelectField
						id="search-categoria"
						name="categoria"
						label="Categoría"
						bind:value={categoria}
					>
						<option value="">Todas las categorías</option>
						{#each categories as c (c.slug)}
							<option value={c.slug}>{c.nombre}</option>
						{/each}
					</SelectField>
					<SelectField
						id="search-provincia"
						name="provincia"
						label="Provincia"
						bind:value={provincia}
					>
						<option value="">Todo el Ecuador</option>
						{#each provincias as p (p.slug)}
							<option value={p.slug}>{p.nombre}</option>
						{/each}
					</SelectField>
				</div>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<Button type="submit" variant="pill" class="flex-1 sm:flex-none">
				<Search class="size-4" aria-hidden="true" /> Buscar
			</Button>
			<Button type="button" variant="outline" class="h-11 px-4" onclick={clear}>Limpiar</Button>
		</div>
	</form>
</div>
