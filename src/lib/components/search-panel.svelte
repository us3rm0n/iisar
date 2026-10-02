<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Search } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import SelectField from '$lib/components/select-field.svelte';
	import { buildSearchHref, hasActiveFilters, type SearchFilters } from '$lib/search/filters';
	import type { SearchCategory, SearchProvincia } from '$lib/search/options';

	type Props = {
		id: string;
		categories: SearchCategory[];
		provincias: SearchProvincia[];
		/** Filters currently in the URL; they prefill the fields when the panel opens. */
		filters: SearchFilters;
		onclose: () => void;
	};

	let { id, categories, provincias, filters, onclose }: Props = $props();

	// The panel is mounted only while open, so the fields start from the URL each time.
	// svelte-ignore state_referenced_locally
	let q = $state(filters.q);
	// svelte-ignore state_referenced_locally
	let categoria = $state(filters.categoria);
	// svelte-ignore state_referenced_locally
	let provincia = $state(filters.provincia);
	let input = $state<HTMLInputElement | null>(null);

	onMount(() => input?.focus());

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		await goto(buildSearchHref({ q, categoria, provincia }));
		onclose();
	}

	async function clear() {
		q = '';
		categoria = '';
		provincia = '';
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
		class="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:px-8"
	>
		<div class="flex flex-col gap-1.5 lg:flex-1">
			<label for="search-q" class="text-caption font-medium text-muted-foreground">
				Buscar negocios
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
					placeholder="Nombre o descripción"
					autocomplete="off"
					class="h-11 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-body text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				/>
			</div>
		</div>
		<SelectField
			id="search-categoria"
			name="categoria"
			label="Categoría"
			bind:value={categoria}
			class="lg:w-52"
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
			class="lg:w-52"
		>
			<option value="">Todo el Ecuador</option>
			{#each provincias as p (p.slug)}
				<option value={p.slug}>{p.nombre}</option>
			{/each}
		</SelectField>
		<div class="flex items-center gap-2">
			<Button type="submit" variant="pill" class="flex-1 lg:flex-none">
				<Search class="size-4" aria-hidden="true" /> Buscar
			</Button>
			<Button type="button" variant="outline" class="h-11 px-4" onclick={clear}>Limpiar</Button>
		</div>
	</form>
</div>
