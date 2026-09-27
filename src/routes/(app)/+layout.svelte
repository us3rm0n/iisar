<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { LayoutDashboard, ShieldCheck, LogIn, LogOut, UserPlus, MapPin } from '@lucide/svelte';
	import { supabase } from '$lib/supabase';
	import { getCurrentUser, getProfileRole, onAuthChange } from '$lib/auth';

	let { children } = $props();
	let user: { id: string } | null = $state(null);
	let role: string | null = $state(null);

	async function syncAuth(nextUser: { id: string } | null) {
		user = nextUser;
		role = await getProfileRole(nextUser?.id ?? null);
	}

	onMount(() => {
		void (async () => await syncAuth((await getCurrentUser()) as unknown as never))();
		const unsubscribe = onAuthChange((nextUser) => void syncAuth(nextUser as unknown as never));
		return unsubscribe;
	});

	async function logout() {
		await supabase.auth.signOut();
		location.href = '/';
	}
</script>

<a
	href="#main"
	class="sr-only z-50 rounded bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
	>Saltar al contenido</a
>

<header class="sticky top-0 z-40 border-b border-white/20 bg-white/55 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/45 dark:border-white/10 dark:bg-zinc-900/40">
	<div
		class="mx-auto flex h-[60px] max-w-5xl items-center justify-between gap-3 px-4 sm:h-[68px] sm:px-6 lg:px-8"
	>
		<a href="/" class="text-lg font-semibold tracking-[-0.02em]">IISAR</a>
		<nav class="flex items-center gap-1.5 sm:gap-2" aria-label="Principal">
			<Button href="/ecuador" variant="ghost" size="sm" class="h-9 rounded-full px-4 hover:bg-white/60 dark:hover:bg-white/10">
				<MapPin class="h-4 w-4" /> <span class="ml-1 hidden sm:inline">Ecuador</span>
			</Button>
			{#if user}
				<Button href="/dashboard" variant="outline" size="sm" class="h-9 rounded-full border-zinc-200/60 bg-white/60 backdrop-blur hover:bg-white/80 dark:border-white/10 dark:bg-white/10">
					<LayoutDashboard class="h-4 w-4" />
					<span class="ml-1 hidden sm:inline">Mi perfil</span><span class="ml-1 sm:hidden">Perfil</span>
				</Button>
				<Button variant="ghost" size="sm" class="h-9 rounded-full bg-white/0 hover:bg-white/60 dark:hover:bg-white/10" onclick={logout}>
					<LogOut class="h-4 w-4" /> <span class="ml-1 hidden sm:inline">Salir</span>
				</Button>
			{:else}
				<Button href="/auth/login" variant="ghost" size="sm" class="h-9 rounded-full px-4 hover:bg-white/60 dark:hover:bg-white/10">
					<LogIn class="h-4 w-4" /> <span class="ml-1 hidden sm:inline">Entrar</span>
				</Button>
				<Button href="/auth/register" variant="default" size="sm" class="h-9 rounded-full bg-zinc-900 px-5 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:bg-zinc-800 dark:bg-white dark:text-zinc-900">
					<UserPlus class="h-4 w-4" /> <span class="ml-1 hidden sm:inline">Crear cuenta</span><span class="ml-1 sm:hidden">Registro</span>
				</Button>
			{/if}
			{#if role === 'webmaster'}
				<Button href="/admin" variant="ghost" size="sm" class="h-9 rounded-full hover:bg-white/60 dark:hover:bg-white/10">
					<ShieldCheck class="h-4 w-4" /> <span class="ml-1 hidden sm:inline">Admin</span>
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
