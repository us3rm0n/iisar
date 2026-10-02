<script lang="ts">
	let { mision, vision }: { mision: string | null; vision: string | null } = $props();

	const entries = $derived(
		[
			{ label: 'Misión', text: mision },
			{ label: 'Visión', text: vision }
		].filter((entry) => entry.text)
	);
</script>

<section id="sobre" class="border-b bg-muted/40" aria-labelledby="sobre-heading">
	<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
		<h2 id="sobre-heading" class="text-center text-display font-semibold">Propósito y visión</h2>
		<div class="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2">
			{#each entries as entry (entry.label)}
				<div class="rounded-lg border border-primary/20 bg-background p-5">
					<h3 class="text-caption font-semibold tracking-widest uppercase">{entry.label}</h3>
					<p class="mt-2 text-body text-muted-foreground">{entry.text}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
