<script lang="ts">
	import { MessageCircle, Tag } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import type { ProductService } from '$lib/types';
	import LandingButton from './landing-button.svelte';

	let { product, inquiryHref }: { product: ProductService; inquiryHref: string | null } = $props();
</script>

<article class="flex h-full flex-col overflow-hidden rounded-lg border border-primary/20 bg-card">
	{#if product.imagen_url}
		<img
			src={product.imagen_url}
			alt={product.nombre}
			class="aspect-4/3 w-full object-cover"
			loading="lazy"
		/>
	{/if}
	<div class="flex flex-1 flex-col gap-2 p-5">
		<div class="flex items-start justify-between gap-3">
			<Badge variant="secondary" class="gap-1 capitalize"
				><Tag class="size-3" /> {product.tipo}</Badge
			>
			{#if product.precio_estimado}
				<span class="font-mono text-body font-semibold">
					${product.precio_estimado}
					<span class="text-caption font-normal text-muted-foreground">{product.moneda}</span>
				</span>
			{/if}
		</div>
		<h3 class="text-title font-semibold">{product.nombre}</h3>
		{#if product.descripcion}
			<p class="text-body text-muted-foreground">{product.descripcion}</p>
		{/if}
		{#if inquiryHref}
			<LandingButton href={inquiryHref} tone="outline" icon={MessageCircle} class="mt-auto w-full"
				>Consultar</LandingButton
			>
		{/if}
	</div>
</article>
