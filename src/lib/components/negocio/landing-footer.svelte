<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import { initials } from '$lib/utils/brand';

	let { nombre, slug }: { nombre: string; slug: string } = $props();
</script>

<footer class="border-t bg-foreground text-background">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
	>
		<span class="flex items-center gap-2 font-semibold">
			<span
				class="inline-flex size-7 items-center justify-center rounded bg-background/10 text-caption"
				>{initials(nombre)}</span
			>
			{nombre}
		</span>
		<p class="text-caption opacity-80">
			© {new Date().getFullYear()} · <span class="font-mono">{slug}.iisar.com</span> · página creada
			con
			<a
				href="/"
				class="inline-flex min-h-11 min-w-11 items-center justify-center font-medium underline"
				>IISAR</a
			>
		</p>
		<a href="/" class="inline-flex min-h-11 items-center gap-1.5 text-body">
			<ArrowLeft class="size-4" /> Volver al directorio
		</a>
	</div>
</footer>
