<script lang="ts">
	import { MessageCircle, Phone } from '@lucide/svelte';
	import LandingButton from './landing-button.svelte';

	let {
		nombre,
		eyebrow,
		blurb,
		coverUrl,
		whatsapp,
		tel
	}: {
		nombre: string;
		eyebrow: string;
		blurb: string;
		coverUrl?: string | null;
		whatsapp: string | null;
		tel: string | null;
	} = $props();
</script>

<section id="top" class="relative overflow-hidden bg-primary text-primary-foreground">
	{#if coverUrl}
		<img src={coverUrl} alt="" class="absolute inset-0 size-full object-cover opacity-25" />
	{/if}
	<div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
		<p class="text-caption font-semibold tracking-widest uppercase opacity-80">{eyebrow}</p>
		<h1 class="mt-4 text-display font-bold text-balance sm:text-5xl lg:text-6xl">{nombre}</h1>
		<p class="mt-5 max-w-2xl text-body opacity-90 sm:text-title">{blurb}</p>
		{#if whatsapp || tel}
			<div class="mt-8 flex flex-wrap gap-3">
				{#if whatsapp}
					<LandingButton href={whatsapp} tone="inverse" icon={MessageCircle}
						>Contactar por WhatsApp</LandingButton
					>
				{/if}
				{#if tel}
					<LandingButton href={tel} tone="inverse-outline" icon={Phone}>Llamar</LandingButton>
				{/if}
			</div>
		{/if}
	</div>
</section>
