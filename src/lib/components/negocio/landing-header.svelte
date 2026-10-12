<script lang="ts">
	import { ArrowLeft, MessageCircle } from '@lucide/svelte';
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

	const link =
		'hidden min-h-11 items-center px-3 text-body text-muted-foreground hover:text-foreground sm:flex transition-colors';
</script>

<header class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
	<div
		class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8"
	>
		<div class="flex items-center gap-3">
			<a
				href="/"
				class="inline-flex min-h-11 items-center gap-1.5 text-body font-medium text-muted-foreground transition-colors hover:text-foreground"
				aria-label="Volver al directorio IISAR"
			>
				<ArrowLeft class="size-4" aria-hidden="true" />
				<span class="hidden sm:inline">Directorio</span>
			</a>
			<span class="text-border sm:inline" aria-hidden="true">/</span>
			<a href="#top" class="flex min-h-11 min-w-0 items-center gap-2 font-semibold sm:gap-2.5">
				{#if logoUrl}
					<img
						src={logoUrl}
						alt=""
						class="size-7 shrink-0 rounded-md border border-border object-cover"
					/>
				{:else}
					<span
						class="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-caption font-medium text-foreground"
						>{initials(nombre)}</span
					>
				{/if}
				<span class="line-clamp-1 text-foreground">{nombre}</span>
			</a>
		</div>

		<nav class="flex shrink-0 items-center gap-1" aria-label="Secciones">
			{#if showStory}<a href="#sobre" class={link}>Nosotros</a>{/if}
			{#if showCatalog}<a href="#catalogo" class={link}>Catálogo</a>{/if}
			{#if whatsapp}
				<LandingButton href={whatsapp} tone="brand" icon={MessageCircle} class="px-4">
					Contactar
				</LandingButton>
			{/if}
		</nav>
	</div>
</header>
