<script lang="ts">
	import AdsenseScript from '$lib/components/adsense-script.svelte';
	import { Megaphone } from '@lucide/svelte';
	import CatalogSection from '$lib/components/negocio/catalog-section.svelte';
	import ContactCta from '$lib/components/negocio/contact-cta.svelte';
	import HighlightsBand from '$lib/components/negocio/highlights-band.svelte';
	import LandingFooter from '$lib/components/negocio/landing-footer.svelte';
	import LandingHeader from '$lib/components/negocio/landing-header.svelte';
	import LandingHero from '$lib/components/negocio/landing-hero.svelte';
	import StatsBand from '$lib/components/negocio/stats-band.svelte';
	import StorySection from '$lib/components/negocio/story-section.svelte';
	import { firstRelation } from '$lib/supabase/helpers';
	import type { BusinessHighlight, BusinessStat, ProductService } from '$lib/types';
	import { brandCssVars, getBrandColors } from '$lib/utils/brand';
	import {
		businessBlurb,
		catalogTitle,
		heroEyebrow,
		landingTitle,
		locationLabel,
		type LandingBusiness
	} from '$lib/utils/landing';
	import { statCells } from '$lib/utils/landing-bands';
	import { tipoLabel } from '$lib/utils/provincias';
	import { waLink } from '$lib/utils/whatsapp';

	let { data } = $props();

	const business = $derived(data.business as unknown as LandingBusiness);
	const products = $derived(data.productos as ProductService[]);
	const stats = $derived(statCells(data.stats as BusinessStat[]));
	const highlights = $derived(data.highlights as BusinessHighlight[]);

	// PostgREST embeds the relation as an object or as a one-element array.
	const categoryName = $derived(firstRelation(business.categories)?.nombre);
	const location = $derived(
		locationLabel(business.ciudad, firstRelation(business.provincias)?.nombre)
	);
	const whatsapp = $derived(waLink(business.contacto));
	const tel = $derived(business.contacto ? `tel:${business.contacto}` : null);
	const hasStory = $derived(Boolean(business.vision || business.mision));
</script>

<AdsenseScript />

<svelte:head>
	<title>{landingTitle(business.nombre, business.tipo, categoryName)}</title>
	<meta name="description" content={businessBlurb(business)} />
	<meta name="theme-color" content={getBrandColors(business).primary} />
</svelte:head>

<!-- The wrapper sets the brand tokens; every `bg-primary` band below inherits them. -->
<div style={brandCssVars(business)}>
	<a
		href="#contenido"
		class="sr-only z-50 rounded bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
		>Saltar al contenido</a
	>

	<LandingHeader
		nombre={business.nombre}
		logoUrl={business.logo_url}
		showStory={hasStory}
		showCatalog={products.length > 0}
		{whatsapp}
	/>
	<LandingHero
		nombre={business.nombre}
		eyebrow={heroEyebrow([categoryName, tipoLabel(business.tipo), location])}
		blurb={businessBlurb(business)}
		coverUrl={business.cover_url}
		{whatsapp}
		{tel}
	/>
	{#if stats.length}<StatsBand {stats} />{/if}

	<div id="contenido">
		{#if data.ads.length}
			<p
				class="mx-auto flex max-w-6xl items-center gap-2 border-b px-4 py-2 text-caption text-muted-foreground sm:px-6 lg:px-8"
			>
				<Megaphone class="size-3.5" aria-hidden="true" /> Publicidad
			</p>
		{/if}
		{#if hasStory}<StorySection mision={business.mision} vision={business.vision} />{/if}
		<CatalogSection
			title={catalogTitle(business.tipo)}
			{products}
			nombre={business.nombre}
			contacto={business.contacto}
			{whatsapp}
		/>
		{#if highlights.length}<HighlightsBand {highlights} />{/if}
		{#if whatsapp}<ContactCta {whatsapp} {location} />{/if}
	</div>

	<LandingFooter nombre={business.nombre} slug={business.slug} />
</div>
