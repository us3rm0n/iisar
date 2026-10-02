<script lang="ts">
	import { MessageCircle, PackageOpen } from '@lucide/svelte';
	import type { ProductService } from '$lib/types';
	import { productInquiryLink } from '$lib/utils/landing';
	import LandingButton from './landing-button.svelte';
	import ProductCard from './product-card.svelte';

	let {
		title,
		products,
		nombre,
		contacto,
		whatsapp
	}: {
		title: string;
		products: ProductService[];
		nombre: string;
		contacto: string | null;
		whatsapp: string | null;
	} = $props();
</script>

<section id="catalogo" aria-labelledby="catalogo-heading">
	<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
		<h2
			id="catalogo-heading"
			class="flex items-center justify-center gap-2 text-center text-display font-semibold"
		>
			{title}
			<span class="text-body font-normal text-muted-foreground">· {products.length}</span>
		</h2>

		{#if products.length === 0}
			<div class="mt-8 flex flex-col items-center gap-3 rounded-lg border px-4 py-14 text-center">
				<PackageOpen class="size-10 text-muted-foreground" aria-hidden="true" />
				<h3 class="text-title font-semibold">Sin productos ni servicios aún</h3>
				<p class="max-w-md text-body text-muted-foreground">
					{nombre} todavía no cargó su catálogo. Escríbenos y te contamos qué tiene para vos.
				</p>
				{#if whatsapp}
					<LandingButton href={whatsapp} icon={MessageCircle} class="mt-1">
						Consultar por WhatsApp
					</LandingButton>
				{/if}
			</div>
		{:else}
			<ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
				{#each products as product (product.id)}
					<li>
						<ProductCard
							{product}
							inquiryHref={productInquiryLink(contacto, product.nombre, nombre)}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
