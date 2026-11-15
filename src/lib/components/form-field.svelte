<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';

	type Props = {
		id: string;
		label: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		type?: 'text' | 'email' | 'password' | 'tel' | 'url';
		/** Picks the mobile keyboard (`decimal` for prices, `numeric` for whole numbers). */
		inputmode?: HTMLInputAttributes['inputmode'];
		minlength?: number;
		/** Lets browsers and password managers fill the field (`email`, `current-password`...). */
		autocomplete?: HTMLInputAttributes['autocomplete'];
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
		minlength,
		autocomplete,
		inputmode
	}: Props = $props();

	const hintId = $derived(hint ? `${id}-hint` : undefined);
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
		{autocomplete}
		{inputmode}
		aria-describedby={hintId}
	/>
	{#if hint}
		<p id={hintId} class="text-caption text-muted-foreground">{@render hint()}</p>
	{/if}
</div>
