<script lang="ts">
	import { ExternalLink } from '@lucide/svelte';
	import type { GuideSource } from '$lib/content/guide';

	type Props = { sources: GuideSource[] };

	let { sources }: Props = $props();
</script>

<section aria-labelledby="fuentes-heading" class="scroll-mt-20 rounded-xl bg-muted p-4 sm:p-6">
	<h3 id="fuentes-heading" class="text-title font-semibold text-foreground">Fuentes</h3>
	<p class="mt-1 text-body text-muted-foreground">Documentos y sitios oficiales consultados.</p>
	<ul class="mt-3 flex flex-col" role="list">
		{#each sources as source (source.href)}
			<li>
				<a
					href={source.href}
					target="_blank"
					rel="noopener noreferrer"
					class="group flex min-h-11 items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<span class="flex min-w-0 flex-col">
						<span class="text-caption font-medium tracking-wide text-muted-foreground uppercase"
							>{source.host}</span
						>
						<span class="text-body text-foreground group-hover:underline">{source.label}</span>
					</span>
					<ExternalLink class="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<span class="sr-only">(se abre en una pestaña nueva)</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
