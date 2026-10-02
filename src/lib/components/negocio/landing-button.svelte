<script lang="ts" module>
	export type LandingButtonTone = 'inverse' | 'inverse-outline' | 'brand' | 'outline';
</script>

<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	let {
		href,
		tone = 'brand',
		icon: Icon,
		class: className,
		children
	}: {
		href: string;
		tone?: LandingButtonTone;
		icon?: Component<{ class?: string }>;
		class?: string;
		children: Snippet;
	} = $props();

	// "inverse" tones sit on a `bg-primary` band: they swap the brand pair so the
	// contrast chosen by `readableForeground` is kept.
	const TONES: Record<LandingButtonTone, string> = {
		inverse: 'bg-primary-foreground text-primary [a]:hover:bg-primary-foreground/90',
		'inverse-outline':
			'border-primary-foreground/40 bg-transparent text-primary-foreground [a]:hover:bg-primary-foreground/10',
		brand: '',
		outline: 'border-border bg-transparent text-foreground'
	};
</script>

<Button
	{href}
	target="_blank"
	rel="noopener"
	variant={tone === 'outline' ? 'outline' : 'pill'}
	class={cn('h-11 rounded-full', TONES[tone], className)}
>
	{#if Icon}<Icon class="size-4" />{/if}
	{@render children()}
</Button>
