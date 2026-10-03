<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import SearchPanel from '$lib/components/search-panel.svelte';
	import { LayoutDashboard, ShieldCheck, LogIn, LogOut, MapPin, Search } from '@lucide/svelte';
	import { PROVINCIAL_CAPITALS } from '$lib/search/capitals';
	import { hasActiveFilters, parseFilters } from '$lib/search/filters';
	import { buildPlaceIndex } from '$lib/search/places';
	import { Session } from '$lib/session.svelte';
	import { provideSession } from '$lib/session-context';
	import { legalNav } from '$lib/site';
	import { navItemsFor, type NavIcon } from '$lib/utils/nav';

	let { children, data } = $props();

	const PANEL_ID = 'search-panel';
	let searchOpen = $state(false);
	let searchButton = $state<HTMLElement | null>(null);
	const filters = $derived(parseFilters(page.url.searchParams));
	const filtersActive = $derived(hasActiveFilters(filters));
	// Provinces and cities searchable from the header, built once per options change.
	const places = $derived(
		buildPlaceIndex({
			provincias: data.searchOptions.provincias,
			capitals: PROVINCIAL_CAPITALS,
			businessCities: data.searchOptions.ciudades
		})
	);

	async function closeSearch() {
		searchOpen = false;
		await tick();
		searchButton?.focus();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && searchOpen) closeSearch();
	}

	afterNavigate(() => {
		searchOpen = false;
	});

	const session = new Session();
	provideSession(session);
	const items = $derived(navItemsFor({ user: session.user, role: session.role }));
	const icons = {
		map: MapPin,
		dashboard: LayoutDashboard,
		admin: ShieldCheck,
		login: LogIn
	} satisfies Record<NavIcon, typeof MapPin>;

	onMount(session.start);
</script>

<a
	href="#main"
	class="sr-only rounded-lg bg-primary px-4 text-body text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center"
	>Saltar al contenido</a
>

<svelte:window onkeydown={onKeydown} />

<header class="sticky top-0 z-40 border-b border-border bg-background">
	<div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex min-h-11 items-center text-title font-semibold">IISAR</a>
		<nav class="flex items-center gap-1" aria-label="Principal">
			<Button
				bind:ref={searchButton}
				variant="ghost"
				class="relative h-11 min-w-11 px-3"
				aria-expanded={searchOpen}
				aria-controls={PANEL_ID}
				onclick={() => (searchOpen = !searchOpen)}
			>
				<Search />
				<span class="sr-only md:not-sr-only">Buscar</span>
				{#if filtersActive}
					<span
						class="absolute top-2 right-2 size-2 rounded-full bg-primary md:right-1"
						aria-hidden="true"
					></span>
					<span class="sr-only">filtros activos</span>
				{/if}
			</Button>
			{#each items as item (item.href)}
				{@const Icon = icons[item.icon]}
				<Button
					href={item.href}
					variant={item.primary ? 'pill' : 'ghost'}
					class={item.primary ? 'px-4' : 'h-11 min-w-11 px-3'}
				>
					<Icon />
					<span class={item.primary ? 'sr-only sm:not-sr-only' : 'sr-only md:not-sr-only'}>
						{item.label}
					</span>
				</Button>
			{/each}
			{#if session.user}
				<Button variant="ghost" class="h-11 min-w-11 px-3" onclick={session.logout}>
					<LogOut />
					<span class="sr-only md:not-sr-only">Salir</span>
				</Button>
			{/if}
		</nav>
	</div>
	{#if searchOpen}
		<div class="max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
			<SearchPanel
				id={PANEL_ID}
				categories={data.searchOptions.categories}
				provincias={data.searchOptions.provincias}
				{places}
				{filters}
				onclose={closeSearch}
			/>
		</div>
	{/if}
</header>

<main id="main" class="min-h-[calc(100vh-56px)]">
	{@render children()}
</main>

<footer class="mt-8 border-t">
	<div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
		<nav aria-label="Legal" class="mb-4">
			<ul class="flex flex-wrap gap-x-4 gap-y-2" role="list">
				{#each legalNav as item (item.href)}
					<li>
						<a
							href={item.href}
							class="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>{item.label}</a
						>
					</li>
				{/each}
			</ul>
		</nav>
		<div class="flex flex-col justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
			<span>© {new Date().getFullYear()} iisar — Directorio de negocios</span>
			<span class="text-xs">Slug MVP · futuro <code>negocio.iisar.com</code></span>
		</div>
	</div>
</footer>
