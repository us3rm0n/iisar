<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	type Props = {
		id: string;
		label: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		type?: 'text' | 'email' | 'password';
		minlength?: number;
		/** Keep the label for assistive tech only. */
		hideLabel?: boolean;
		class?: string;
		inputClass?: string;
		/** Helper text under the input. */
		hint?: Snippet;
	};

	let {
		id,
		label,
		value = $bindable(''),
		hideLabel = false,
		class: className,
		inputClass,
		hint,
		placeholder,
		required,
		type = 'text',
		minlength
	}: Props = $props();
</script>

<div class={cn('flex flex-col gap-1.5', className)}>
	<label
		for={id}
		class={cn('text-caption font-medium text-muted-foreground', hideLabel && 'sr-only')}
	>
		{label}
	</label>
	<Input
		{id}
		bind:value
		class={cn('sm:h-11', inputClass)}
		{type}
		{placeholder}
		{required}
		{minlength}
	/>
	{#if hint}
		<p class="text-caption text-muted-foreground">{@render hint()}</p>
	{/if}
</div>
