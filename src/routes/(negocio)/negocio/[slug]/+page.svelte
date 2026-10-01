<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		ArrowLeft,
		MapPin,
		Phone,
		MessageCircle,
		Megaphone,
		Tag,
		PackageOpen
	} from '@lucide/svelte';
	import { getBrandColors, brandCssVars, initials } from '$lib/utils/brand';
	import { tipoLabel } from '$lib/utils/provincias';
	import { waLink } from '$lib/utils/whatsapp';
	import { HIGHLIGHT_COLUMNS, padOrdinal, statCells } from '$lib/utils/landing-bands';
	import { firstRelation } from '$lib/supabase/helpers';
	import type { Business, BusinessHighlight, BusinessStat, ProductService } from '$lib/types';

	let { data } = $props();
	const business = $derived(
		data.business as unknown as Business & {
			logo_url?: string;
			cover_url?: string;
		}
	);

	// PostgREST embebida la relación como objeto o como arreglo de un elemento.
	const categoryName = $derived(firstRelation(business.categories)?.nombre);
	const provincia = $derived(firstRelation(business.provincias));
	const { primary } = $derived(getBrandColors(business));
	const brandStyle = $derived(brandCssVars(business));
	const products = $derived(data.productos as ProductService[]);
	const stats = $derived(statCells(data.stats as BusinessStat[]));
	const highlights = $derived(data.highlights as BusinessHighlight[]);

	/** "Macas, Morona Santiago" — solo con lo que el negocio tenga cargado. */
	const location = $derived(
		[business.ciudad, provincia?.nombre].filter(Boolean).join(', ') || null
	);
	const whatsapp = $derived(waLink(business.contacto));
	const tel = $derived(business.contacto ? `tel:${business.contacto}` : null);
	const hasStory = $derived(Boolean(business.vision || business.mision));
	const catalogTitle = $derived(
		business.tipo === 'artista'
			? 'Servicios'
			: business.tipo === 'lugar'
				? 'Servicios y experiencias'
				: 'Productos y servicios'
	);
	/** CTA por producto, con el nombre ya escrito: el mensaje prellena WhatsApp. */
	const productWa = (product: ProductService) =>
		waLink(business.contacto, `Hola, me interesa «${product.nombre}» de ${business.nombre}.`);
</script>

<svelte:head>
	<title>{business.nombre} — {categoryName ?? tipoLabel(business.tipo)} | IISAR</title>
	<meta name="description" content={business.descripcion ?? business.bio ?? ''} />
	<meta name="theme-color" content={primary} />
</svelte:head>

<!--
	El wrapper fija los tokens de marca; todas las bandas full-bleed de abajo
	usan `bg-primary` / `bg-primary-foreground` y heredan la marca sin estilos inline.
-->
<div style={brandStyle}>
	<a
		href="#contenido"
		class="sr-only z-50 rounded bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
		>Saltar al contenido</a
	>

	<header class="sticky top-0 z-40 bg-primary text-primary-foreground">
		<div
			class="mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8"
		>
			<a href="#top" class="flex min-w-0 min-h-11 items-center gap-2 font-bold sm:gap-3">
				{#if business.logo_url}
					<img
						src={business.logo_url}
						alt=""
						class="h-8 w-8 shrink-0 rounded-lg bg-white object-cover p-1"
					/>
				{:else}
					<span
						class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 text-sm ring-1 ring-primary-foreground/20"
						>{initials(business.nombre)}</span
					>
				{/if}
				<span class="line-clamp-1">{business.nombre}</span>
			</a>
			<nav class="flex shrink-0 items-center gap-1.5" aria-label="Secciones">
				{#if hasStory}
					<a
						href="#sobre"
						class="-my-2 hidden min-h-11 items-center px-3 text-sm opacity-80 hover:opacity-100 sm:flex"
						>Nosotros</a
					>
				{/if}
				{#if products.length}
					<a
						href="#catalogo"
						class="-my-2 hidden min-h-11 items-center px-3 text-sm opacity-80 hover:opacity-100 sm:flex"
						>Catálogo</a
					>
				{/if}
				{#if whatsapp}
					<a
						href={whatsapp}
						target="_blank"
						rel="noopener"
						class="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary-foreground px-4 text-sm font-medium text-primary transition-opacity hover:opacity-90"
						><MessageCircle class="h-4 w-4" /> Contactar</a
					>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Hero: banda de marca a sangre completa, sin constrainla al ancho del contenido. -->
	<section id="top" class="relative overflow-hidden bg-primary text-primary-foreground">
		{#if business.cover_url}
			<img
				src={business.cover_url}
				alt=""
				class="absolute inset-0 h-full w-full object-cover opacity-25"
			/>
		{/if}
		<div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
			<p
				class="text-xs font-semibold uppercase tracking-[0.2em] opacity-80 sm:text-sm"
			>
				{[categoryName, tipoLabel(business.tipo), location].filter(Boolean).join(' · ')}
			</p>
			<h1
				class="mt-4 text-balance text-[2.75rem] font-bold leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl"
			>
				{business.nombre}
			</h1>
			<p class="mt-5 max-w-2xl text-base leading-relaxed opacity-90 sm:text-lg">
				{business.descripcion ?? business.bio ?? ''}
			</p>
			{#if whatsapp || tel}
				<div class="mt-8 flex flex-wrap gap-3">
					{#if whatsapp}
						<Button
							href={whatsapp}
							target="_blank"
							rel="noopener"
							size="lg"
							class="h-12 rounded-full bg-primary-foreground px-6 text-primary hover:opacity-90"
						>
							<MessageCircle class="h-4 w-4" /> Contactar por WhatsApp
						</Button>
					{/if}
					{#if tel}
						<Button
							href={tel}
							variant="outline"
							size="lg"
							class="h-12 rounded-full border-primary-foreground/40 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10"
						>
							<Phone class="h-4 w-4" /> Llamar
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</section>

	<!-- Banda de métricas: data-gated, se oculta si el negocio no cargó ninguna. -->
	{#if stats.length}
		<section
			class="border-t border-primary-foreground/15 bg-primary text-primary-foreground"
			aria-label="Métricas"
		>
			<dl
				class="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-4 lg:px-8"
			>
				{#each stats as stat (stat.id)}
					<div class="text-center">
						<dt class="text-2xl font-bold tracking-tight sm:text-3xl">{stat.valor}</dt>
						<dd class="mt-1 text-xs tracking-[0.15em] uppercase opacity-80">
							{stat.etiqueta}
						</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/if}

	<div id="contenido">
		{#if data.ads.length}
			<div class="border-b bg-muted/40">
				<div class="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
					<p class="flex items-center gap-2 text-xs text-muted-foreground">
						<Megaphone class="h-3.5 w-3.5" aria-hidden="true" /> Publicidad
					</p>
				</div>
			</div>
		{/if}

		<!--
			Misión / visión: solo si el negocio las cargó. Antes se gateaba por
			`tipo === 'negocio'`, que descartaba la data que un artista o lugar sí tenía.
		-->
		{#if hasStory}
			<section id="sobre" class="bg-muted/40" aria-labelledby="sobre-heading">
				<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
					<h2
						id="sobre-heading"
						class="text-center text-2xl font-bold tracking-tight sm:text-3xl"
					>
						Propósito y visión
					</h2>
					<div class="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2">
						{#if business.mision}
							<Card class="border-primary/20">
								<CardHeader>
									<CardTitle class="text-sm tracking-[0.15em] text-primary uppercase"
										>Misión</CardTitle
									>
									<CardDescription class="text-base leading-relaxed"
										>{business.mision}</CardDescription
									>
								</CardHeader>
							</Card>
						{/if}
						{#if business.vision}
							<Card class="border-primary/20">
								<CardHeader>
									<CardTitle class="text-sm tracking-[0.15em] text-primary uppercase"
										>Visión</CardTitle
									>
									<CardDescription class="text-base leading-relaxed"
										>{business.vision}</CardDescription
									>
								</CardHeader>
							</Card>
						{/if}
					</div>
				</div>
			</section>
		{/if}

		<section id="catalogo" class="bg-background" aria-labelledby="catalogo-heading">
			<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
				<h2
					id="catalogo-heading"
					class="flex items-center justify-center gap-2 text-center text-2xl font-bold tracking-tight sm:text-3xl"
				>
					{catalogTitle}
					<span class="text-sm font-normal text-muted-foreground">· {products.length}</span>
				</h2>

				{#if products.length === 0}
					<Card class="mt-8 py-14 text-center">
						<CardContent class="flex flex-col items-center gap-3">
							<PackageOpen class="h-12 w-12 text-muted-foreground" aria-hidden="true" />
							<CardTitle class="text-base">Sin productos ni servicios aún</CardTitle>
						<CardDescription
							>{business.nombre} todavía no cargó su catálogo. Escríbenos y te contamos
							qué tiene para vos.</CardDescription
						>
						{#if whatsapp}
							<Button href={whatsapp} target="_blank" rel="noopener" class="mt-1 h-11">
								<MessageCircle class="h-4 w-4" /> Consultar por WhatsApp
							</Button>
						{/if}
					</CardContent>
				</Card>
				{:else}
					<ul
						class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
						role="list"
					>
						{#each products as product (product.id)}
							<li class="h-full">
								<Card class="flex h-full flex-col border-primary/20">
									{#if product.imagen_url}
										<img
											src={product.imagen_url}
											alt={product.nombre}
											class="aspect-[4/3] w-full rounded-t-xl object-cover"
											loading="lazy"
										/>
									{/if}
									<CardHeader>
										<div class="flex items-start justify-between gap-3">
											<Badge variant="secondary" class="gap-1 capitalize"
												><Tag class="h-3 w-3" /> {product.tipo}</Badge
											>
											{#if product.precio_estimado}
												<span class="font-mono text-sm font-semibold text-primary"
													>${product.precio_estimado}
													<span class="text-xs font-normal text-muted-foreground"
														>{product.moneda}</span
													></span
												>
											{/if}
										</div>
										<CardTitle class="mt-2 text-base">{product.nombre}</CardTitle>
										{#if product.descripcion}
											<CardDescription class="leading-relaxed"
												>{product.descripcion}</CardDescription
											>
										{/if}
									</CardHeader>
									{#if productWa(product)}
										<CardContent class="mt-auto pt-0">
											<Button
												href={productWa(product)}
												target="_blank"
												rel="noopener"
												variant="outline"
												size="sm"
												class="h-11 w-full border-primary text-primary hover:bg-primary/5"
											>
												<MessageCircle class="h-4 w-4" /> Consultar
											</Button>
										</CardContent>
									{/if}
								</Card>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</section>

		<!-- Diferenciadores: banda oscura a sangre completa, data-gated. -->
		{#if highlights.length}
			<section class="bg-zinc-900 text-zinc-100" aria-labelledby="diferenciales-heading">
				<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
					<p class="text-center text-xs tracking-[0.2em] text-zinc-400 uppercase">
						Diferenciales
					</p>
					<h2
						id="diferenciales-heading"
						class="mt-3 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl"
					>
						Por qué elegirnos
					</h2>
					<ul class="mt-8 grid gap-6 sm:mt-10 sm:gap-8 {HIGHLIGHT_COLUMNS}" role="list">
						{#each highlights as highlight, i (highlight.id)}
							<li>
								<span class="font-mono text-3xl font-bold text-primary" aria-hidden="true"
									>{padOrdinal(i + 1)}</span
								>
								<h3 class="mt-2 font-semibold text-white">{highlight.titulo}</h3>
								<p class="mt-2 text-sm leading-relaxed text-zinc-400">
									{highlight.descripcion}
								</p>
							</li>
						{/each}
					</ul>
				</div>
			</section>
		{/if}

		{#if whatsapp}
			<section class="bg-primary text-primary-foreground" aria-labelledby="cta-heading">
				<div class="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
					<h2 id="cta-heading" class="text-2xl font-bold tracking-tight sm:text-3xl">
						¿Listo para consultarnos?
					</h2>
					<p class="mx-auto mt-3 max-w-xl opacity-90">
						Escríbenos y te contamos disponibilidad, precios y tiempos de entrega.
					</p>
					<Button
						href={whatsapp}
						target="_blank"
						rel="noopener"
						size="lg"
						class="mt-7 h-12 rounded-full bg-primary-foreground px-7 text-primary hover:opacity-90"
					>
						<MessageCircle class="h-4 w-4" /> Escribir por WhatsApp
					</Button>
					{#if location}
						<p class="mt-5 flex items-center justify-center gap-1.5 text-sm opacity-80">
							<MapPin class="h-4 w-4" aria-hidden="true" /> {location}
						</p>
					{/if}
				</div>
			</section>
		{/if}
	</div>

	<footer class="bg-zinc-900 text-zinc-300">
		<div
			class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
		>
			<span class="flex items-center gap-2 font-semibold text-white">
				<span
					class="inline-flex h-7 w-7 items-center justify-center rounded bg-white/10 text-xs"
					>{initials(business.nombre)}</span
				>
				{business.nombre}
			</span>
			<p class="text-xs">
				© {new Date().getFullYear()} · <span class="font-mono">{business.slug}.iisar.com</span>
				· página creada con
				<a href="/" class="font-medium text-white underline hover:text-zinc-100">IISAR</a>
			</p>
			<a
				href="/"
				class="-my-2 inline-flex min-h-11 items-center gap-1.5 text-sm hover:text-white"
			>
				<ArrowLeft class="h-4 w-4" /> Volver al directorio
			</a>
		</div>
	</footer>
</div>
