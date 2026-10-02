<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { LayoutDashboard, ShieldCheck, LogIn, LogOut, UserPlus, MapPin } from '@lucide/svelte';
	import { Session } from '$lib/session.svelte';
	import { navItemsFor, type NavIcon } from '$lib/utils/nav';

	let { children } = $props();

	const session = new Session();
	const items = $derived(navItemsFor({ user: session.user, role: session.role }));
	const icons = {
		map: MapPin,
		dashboard: LayoutDashboard,
		admin: ShieldCheck,
		login: LogIn,
		register: UserPlus
	} satisfies Record<NavIcon, typeof MapPin>;

	onMount(session.start);
</script>

<a
	href="#main"
	class="sr-only rounded-lg bg-primary px-4 text-body text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center"
	>Saltar al contenido</a
>

<header class="sticky top-0 z-40 border-b border-border bg-background">
	<div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
		<a href="/" class="flex min-h-11 items-center text-title font-semibold">IISAR</a>
		<nav class="flex items-center gap-1" aria-label="Principal">
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
</header>

<main id="main" class="min-h-[calc(100vh-56px)]">
	{@render children()}
</main>

<footer class="mt-8 border-t">
	<div
		class="mx-auto flex max-w-5xl flex-col justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8"
	>
		<span>© {new Date().getFullYear()} iisar — Directorio de negocios</span>
		<span class="text-xs">Slug MVP · futuro <code>negocio.iisar.com</code></span>
	</div>
</footer>
