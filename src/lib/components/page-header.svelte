<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	type Props = {
		title: string;
		description?: string;
		actions?: Snippet;
		align?: 'start' | 'center';
		class?: string;
	};

	let { title, description, actions, align = 'start', class: className }: Props = $props();
</script>

<header
	class={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}
>
	<h1 class="text-display font-semibold text-foreground">{title}</h1>
	{#if description}
		<p class="max-w-xl text-body text-muted-foreground">{description}</p>
	{/if}
	{#if actions}
		<div class="flex flex-wrap items-center gap-2">{@render actions()}</div>
	{/if}
</header>
