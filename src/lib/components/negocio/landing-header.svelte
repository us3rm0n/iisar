<script lang="ts">
	import { MessageCircle } from '@lucide/svelte';
	import { initials } from '$lib/utils/brand';
	import LandingButton from './landing-button.svelte';

	let {
		nombre,
		logoUrl,
		showStory,
		showCatalog,
		whatsapp
	}: {
		nombre: string;
		logoUrl?: string | null;
		showStory: boolean;
		showCatalog: boolean;
		whatsapp: string | null;
	} = $props();

	const link = 'hidden min-h-11 items-center px-3 text-body opacity-80 sm:flex';
</script>

<header class="sticky top-0 z-40 bg-primary text-primary-foreground">
	<div
		class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8"
	>
		<a href="#top" class="flex min-h-11 min-w-0 items-center gap-2 font-semibold sm:gap-3">
			{#if logoUrl}
				<img
					src={logoUrl}
					alt=""
					class="size-8 shrink-0 rounded-lg bg-primary-foreground object-cover p-1"
				/>
			{:else}
				<span
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-caption"
					>{initials(nombre)}</span
				>
			{/if}
			<span class="line-clamp-1">{nombre}</span>
		</a>
		<nav class="flex shrink-0 items-center gap-1" aria-label="Secciones">
			{#if showStory}<a href="#sobre" class={link}>Nosotros</a>{/if}
			{#if showCatalog}<a href="#catalogo" class={link}>Catálogo</a>{/if}
			{#if whatsapp}
				<LandingButton href={whatsapp} tone="inverse" icon={MessageCircle} class="px-4"
					>Contactar</LandingButton
				>
			{/if}
		</nav>
	</div>
</header>
