<script lang="ts">
	import { MapPin, MessageCircle } from '@lucide/svelte';
	import LandingButton from './landing-button.svelte';

	let { whatsapp, location }: { whatsapp: string; location: string | null } = $props();
</script>

<section class="bg-primary text-primary-foreground" aria-labelledby="cta-heading">
	<div class="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
		<h2 id="cta-heading" class="text-display font-semibold">¿Listo para consultarnos?</h2>
		<p class="mx-auto mt-3 max-w-xl text-body opacity-90">
			Escríbenos y te contamos disponibilidad, precios y tiempos de entrega.
		</p>
		<LandingButton href={whatsapp} tone="inverse" icon={MessageCircle} class="mt-7 px-7"
			>Escribir por WhatsApp</LandingButton
		>
		{#if location}
			<p class="mt-5 flex items-center justify-center gap-1.5 text-body opacity-80">
				<MapPin class="size-4" aria-hidden="true" />
				{location}
			</p>
		{/if}
	</div>
</section>
