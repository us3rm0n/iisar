<script lang="ts">
	type Neighbor = { slug: string; nombre: string };
	type Props = { neighbors: Neighbor[] };

	let { neighbors }: Props = $props();
</script>

{#if neighbors.length > 0}
	<nav aria-labelledby="vecinas-heading">
		<h2 id="vecinas-heading" class="mb-3 text-title font-semibold text-foreground">
			Provincias vecinas
		</h2>
		<ul class="flex flex-wrap gap-2" role="list">
			{#each neighbors as neighbor (neighbor.slug)}
				<li>
					<a
						href="/ecuador/{neighbor.slug}"
						class="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-4 text-body font-medium text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>{neighbor.nombre}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
