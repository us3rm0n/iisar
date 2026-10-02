<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { ChevronDown } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	type Props = Omit<HTMLSelectAttributes, 'children' | 'class'> & {
		id: string;
		label: string;
		/** Keep the label for assistive tech only. */
		hideLabel?: boolean;
		value?: string | null;
		class?: string;
		children: Snippet;
	};

	let {
		id,
		label,
		hideLabel = false,
		value = $bindable(''),
		class: className,
		children,
		...restProps
	}: Props = $props();
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
	<label
		for={id}
		class={cn('text-caption font-medium text-muted-foreground', hideLabel && 'sr-only')}
	>
		{label}
	</label>
	<div class="relative">
		<select
			{id}
			bind:value
			class="h-11 w-full appearance-none rounded-lg border border-input bg-background pr-9 pl-3 text-body text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
			{...restProps}
		>
			{@render children()}
		</select>
		<ChevronDown
			class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
			aria-hidden="true"
		/>
	</div>
</div>
