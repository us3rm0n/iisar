<script lang="ts">
	import type { BusinessHighlight } from '$lib/types';
	import { HIGHLIGHT_COLUMNS, padOrdinal } from '$lib/utils/landing-bands';

	let { highlights }: { highlights: BusinessHighlight[] } = $props();
</script>

<section class="border-y-2 border-primary bg-muted/40" aria-labelledby="diferenciales-heading">
	<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
		<p class="text-center text-caption tracking-widest text-muted-foreground uppercase">
			Diferenciales
		</p>
		<h2 id="diferenciales-heading" class="mt-3 text-center text-display font-semibold">
			Por qué elegirnos
		</h2>
		<ul class="mt-8 grid gap-6 sm:mt-10 sm:gap-8 {HIGHLIGHT_COLUMNS}" role="list">
			{#each highlights as highlight, i (highlight.id)}
				<li>
					<span class="font-mono text-display font-bold text-muted-foreground" aria-hidden="true"
						>{padOrdinal(i + 1)}</span
					>
					<h3 class="mt-2 text-title font-semibold">{highlight.titulo}</h3>
					<p class="mt-2 text-body text-muted-foreground">{highlight.descripcion}</p>
				</li>
			{/each}
		</ul>
	</div>
</section>
