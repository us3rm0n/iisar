<script lang="ts">
	import type { Snippet } from 'svelte';
	import { regionIcon } from '$lib/utils/regions';
	import { regionLabel } from '$lib/utils/provincias';
	import { cn } from '$lib/utils';

	type Props = { nombre: string; region: string; actions?: Snippet; class?: string };

	let { nombre, region, actions, class: className }: Props = $props();

	// Tokens only: each region gets a different strength of the same palette.
	const TINTS: Record<string, string> = {
		costa: 'bg-primary/5',
		sierra: 'bg-primary/10',
		amazonia: 'bg-secondary',
		insular: 'bg-muted'
	};

	const Icon = $derived(regionIcon(region));
</script>

<header
	class={cn(
		'flex flex-col gap-4 rounded-xl border border-border p-4 sm:p-6',
		TINTS[region] ?? 'bg-muted',
		className
	)}
>
	<p class="flex items-center gap-2 text-body font-medium text-muted-foreground">
		<span
			class="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground"
		>
			<Icon class="size-5" aria-hidden="true" />
		</span>
		<span>Región {regionLabel(region)}</span>
	</p>
	<h1 class="text-display font-semibold text-foreground">{nombre}</h1>
	{#if actions}
		<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
	{/if}
</header>
