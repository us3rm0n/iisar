<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import {
		ArrowLeft,
		MapPin,
		Phone,
		MessageCircle,
		Megaphone,
		ShoppingBag,
		Tag,
		PackageOpen
	} from '@lucide/svelte';
	import { getBrandColors, brandCssVars, initials } from '$lib/utils/brand';
	import type { Business, ProductService } from '$lib/types';

	const TIPO_LABEL: Record<string, string> = {
		negocio: 'Negocio',
		artista: 'Artista',
		lugar: 'Lugar'
	};

	let { data } = $props();
	const business = $derived(
		data.business as unknown as Business & {
			categories?: any;
			logo_url?: string;
			cover_url?: string;
		}
	);
	const categoryName = $derived(
		(business.categories as any)?.nombre ?? (business.categories as any)?.[0]?.nombre
	);
	// Supabase may embed the relation as an object or a single-element array.
	const provincia = $derived(
		(Array.isArray(business.provincias) ? business.provincias[0] : business.provincias) as
			| { nombre: string; slug: string }
			| null
			| undefined
	);
	const isArtista = $derived(business.tipo === 'artista');
	const isLugar = $derived(business.tipo === 'lugar');
	const { primary } = $derived(getBrandColors(business));
	const brandStyle = $derived(brandCssVars(business));
	const products = $derived(data.productos as ProductService[]);
</script>

<svelte:head>
	<title>{business.nombre} — {categoryName ?? TIPO_LABEL[business.tipo] ?? 'Negocio'} | IISAR</title
	>
	<meta name="description" content={business.descripcion ?? business.bio ?? ''} />
	<meta name="theme-color" content={primary} />
</svelte:head>

<div style={brandStyle}>
	<header
		class="sticky top-0 z-40 border-b border-primary-foreground/15 bg-primary text-primary-foreground"
	>
		<div
			class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8"
		>
			<a href="/negocio/{business.slug}" class="flex items-center gap-3 font-bold tracking-tight">
				{#if business.logo_url}
					<img
						src={business.logo_url}
						alt={business.nombre}
						class="h-8 w-8 rounded-lg bg-white object-cover p-1"
					/>
				{:else}
					<span
						class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/20"
						>{initials(business.nombre)}</span
					>
				{/if}
				<span class="text-lg">{business.nombre}</span>
				<span
					class="hidden rounded-full bg-primary-foreground/15 px-2 py-0.5 text-xs font-medium sm:inline"
					>{TIPO_LABEL[business.tipo] ?? business.tipo}</span
				>
				{#if categoryName}<span
						class="hidden rounded-full bg-primary-foreground/10 px-2 py-0.5 text-xs font-medium sm:inline"
						>{categoryName}</span
					>{/if}
			</a>
			<a
				href="/"
				class="inline-flex items-center gap-1 rounded-md bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium text-primary-foreground ring-1 ring-primary-foreground/20 hover:bg-primary-foreground/15"
			>
				<ArrowLeft class="h-3.5 w-3.5" /> Volver al directorio
			</a>
		</div>
	</header>

	{#if business.cover_url}
		<div class="h-40 w-full overflow-hidden bg-accent sm:h-56">
			<img src={business.cover_url} alt="" class="h-full w-full object-cover" />
		</div>
	{:else}
		<div
			class="h-1.5 w-full"
			style="background: linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))"
		></div>
	{/if}

	<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<Card class="mb-6 overflow-hidden">
			<CardHeader>
				<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
					<div>
						<CardTitle class="text-2xl sm:text-3xl">{business.nombre}</CardTitle>
						{#if categoryName || business.ciudad || provincia}
							<CardDescription class="mt-1 flex flex-wrap items-center gap-2">
								{#if categoryName}<Badge variant="secondary">{categoryName}</Badge>{/if}
								{#if business.ciudad}<span class="flex items-center gap-1"
										><MapPin class="h-3 w-3" /> {business.ciudad}</span
									>{/if}
								{#if provincia?.slug}
									<a
										href="/ecuador/{provincia.slug}"
										class="flex items-center gap-1 underline-offset-2 hover:underline"
										><MapPin class="h-3 w-3" /> {provincia.nombre}</a
									>
								{/if}
							</CardDescription>
						{/if}
					</div>
					{#if business.contacto}
						<div class="flex shrink-0 gap-2">
							<Button
								href={`https://wa.me/${business.contacto.replace(/\D/g, '')}`}
								target="_blank"
								size="lg"
								class="h-11 border-0 bg-primary text-primary-foreground hover:opacity-90"
							>
								<MessageCircle class="h-4 w-4" /> Contactar
							</Button>
							<Button
								href={`tel:${business.contacto}`}
								variant="outline"
								size="lg"
								class="hidden h-11 border-primary text-primary sm:inline-flex"
							>
								<Phone class="h-4 w-4" />
							</Button>
						</div>
					{/if}
				</div>
				<p class="mt-3 text-sm text-muted-foreground sm:text-base">
					{(isArtista ? (business.bio ?? business.descripcion) : business.descripcion) ??
						'Sin descripción'}
				</p>
				{#if !isArtista && (business.vision || business.mision)}
					<div class="mt-4 grid gap-3 sm:grid-cols-2">
						{#if business.vision}
							<div class="rounded-xl bg-muted/40 p-3">
								<p class="text-xs font-semibold tracking-wide text-muted-foreground">VISIÓN</p>
								<p class="mt-1 text-sm">{business.vision}</p>
							</div>
						{/if}
						{#if business.mision}
							<div class="rounded-xl bg-muted/40 p-3">
								<p class="text-xs font-semibold tracking-wide text-muted-foreground">MISIÓN</p>
								<p class="mt-1 text-sm">{business.mision}</p>
							</div>
						{/if}
					</div>
				{/if}
			</CardHeader>
		</Card>

		{#if data.ads.length}
			<Card class="mb-6 border-dashed bg-muted/30">
				<CardContent class="flex items-center gap-2 p-3 text-sm text-muted-foreground"
					><Megaphone class="h-4 w-4" /> Publicidad</CardContent
				>
			</Card>
		{/if}

		<section aria-labelledby="productos-heading">
			<h2
				id="productos-heading"
				class="mb-3 flex items-center gap-2 text-lg font-semibold text-primary"
			>
				<ShoppingBag class="h-5 w-5" />
				{isArtista ? 'Servicios' : isLugar ? 'Servicios y experiencias' : 'Productos y servicios'}
				{#if isArtista}<Badge variant="outline" class="ml-1 text-xs font-normal"
						>solo servicios</Badge
					>{/if}
			</h2>
			{#if products.length === 0}
				<Card class="py-12 text-center">
					<CardContent class="flex flex-col items-center gap-3">
						<PackageOpen class="h-12 w-12 text-muted-foreground" />
						<CardTitle class="text-base"
							>{isArtista || isLugar ? 'Sin servicios aún' : 'Sin productos aún'}</CardTitle
						>
						<CardDescription
							>{isArtista
								? 'Este artista aún no ha cargado servicios.'
								: isLugar
									? 'Este lugar aún no ha cargado servicios.'
									: 'Este negocio aún no ha cargado productos.'}</CardDescription
						>
					</CardContent>
				</Card>
			{:else}
				<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{#each products as product (product.id)}
						<li>
							<Card class="h-full border-primary/20">
								<CardHeader class="pb-2">
									<Badge variant="secondary" class="w-fit gap-1"
										><Tag class="h-3 w-3" /> {product.tipo}</Badge
									>
									<CardTitle class="mt-2 line-clamp-1 text-base">{product.nombre}</CardTitle>
									{#if product.descripcion}<CardDescription class="line-clamp-2"
											>{product.descripcion}</CardDescription
										>{/if}
								</CardHeader>
								<CardContent>
									{#if product.precio_estimado}
										<Badge variant="outline" class="border-primary font-mono text-primary"
											>${product.precio_estimado} {product.moneda}</Badge
										>
									{/if}
								</CardContent>
							</Card>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<Separator class="my-8" />
		<footer
			class="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
		>
			<span
				>© {new Date().getFullYear()}
				{business.nombre} · página creada con
				<a href="/" class="font-medium underline hover:text-foreground">IISAR</a></span
			>
			<span class="font-mono">futuro: {business.slug}.iisar.com</span>
		</footer>
	</div>
</div>
