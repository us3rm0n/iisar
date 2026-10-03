<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';
	import type { GuideSection } from '$lib/content/guide';

	type Props = { sections: GuideSection[] };

	let { sections }: Props = $props();

	let open = $state(false);
</script>

{#snippet links()}
	<ol class="flex flex-col">
		{#each sections as section (section.id)}
			<li>
				<a
					href="#{section.id}"
					class="flex min-h-11 items-center rounded-md px-3 text-body text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					onclick={() => (open = false)}>{section.title}</a
				>
			</li>
		{/each}
	</ol>
{/snippet}

<nav aria-label="En esta guía (menú plegable)" class="lg:hidden">
	<details bind:open class="rounded-lg border border-border bg-card">
		<summary
			class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-4 text-body font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden"
		>
			En esta guía
			<ChevronDown
				class="size-4 transition-transform {open ? 'rotate-180' : ''}"
				aria-hidden="true"
			/>
		</summary>
		<div class="border-t border-border p-2">
			{@render links()}
		</div>
	</details>
</nav>

<nav aria-label="En esta guía" class="sticky top-20 hidden self-start lg:block">
	<p class="mb-2 px-3 text-caption font-semibold tracking-wide text-muted-foreground uppercase">
		En esta guía
	</p>
	{@render links()}
</nav>
