<script lang="ts">
	import type { BusinessStat } from '$lib/types';

	let { stats }: { stats: BusinessStat[] } = $props();
</script>

<section
	class="border-t border-primary-foreground/15 bg-primary text-primary-foreground"
	aria-label="Métricas"
>
	<dl
		class="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-4 lg:px-8"
	>
		{#each stats as stat (stat.id)}
			<div class="text-center">
				<dt class="text-display font-bold">{stat.valor}</dt>
				<dd class="mt-1 text-caption tracking-widest uppercase opacity-80">{stat.etiqueta}</dd>
			</div>
		{/each}
	</dl>
</section>
