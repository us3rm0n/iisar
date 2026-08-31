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

	let { data } = $props();
	const b = $derived(data.business as any);
	const catName = $derived(
		(b.categories as any)?.nombre ?? (b.categories as any)?.[0]?.nombre
	);
	const isArtista = $derived(b.tipo === 'artista');
	const primary = $derived(b.primary_color ?? '#18181b'); // zinc-900 fallback
	const accent = $derived(b.accent_color ?? '#fafafa');
</script>

<svelte:head>
	<title>{b.nombre} — {catName ?? (isArtista ? 'Artista' : 'Negocio')} | IISAR</title>
	<meta name="description" content={b.descripcion ?? b.bio ?? ''} />
	<meta name="theme-color" content={primary} />
</svelte:head>

<!-- Marca blanca header: nombre del negocio reemplaza IISAR -->
<header
	class="sticky top-0 z-40 border-b"
	style="background: {primary}; color: white; border-color: color-mix(in oklab, {primary} 85%, black)"
>
	<div class="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
		<a href="/negocio/{b.slug}" class="flex items-center gap-3 font-bold tracking-tight">
			{#if b.logo_url}
				<img src={b.logo_url} alt={b.nombre} class="h-8 w-8 rounded-lg bg-white object-cover p-1" />
			{:else}
				<span
					class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/20"
					>{b.nombre.slice(0, 2).toUpperCase()}</span
				>
			{/if}
			<span class="text-lg">{b.nombre}</span>
			<span class="hidden rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium capitalize sm:inline">{b.tipo}</span>
			{#if catName}<span class="hidden rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium sm:inline">{catName}</span>{/if}
		</a>
		<a href="/" class="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 hover:bg-white/15">
			<ArrowLeft class="h-3.5 w-3.5" /> Volver al directorio
		</a>
	</div>
</header>

<!-- Cover / hero con colores del negocio -->
{#if b.cover_url}
	<div class="h-40 w-full overflow-hidden sm:h-56" style="background: {accent}">
		<img src={b.cover_url} alt="" class="h-full w-full object-cover" />
	</div>
{:else}
	<div
		class="h-1.5 w-full"
		style="background: linear-gradient(90deg, {primary}, color-mix(in oklab, {primary} 70%, {accent}))"
	></div>
{/if}

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<Card class="mb-6 overflow-hidden">
		<CardHeader>
			<div class="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
				<div>
					<CardTitle class="text-2xl sm:text-3xl">{b.nombre}</CardTitle>
					{#if catName || b.ciudad}
						<CardDescription class="mt-1 flex flex-wrap items-center gap-2">
							{#if catName}<Badge variant="secondary">{catName}</Badge>{/if}
							{#if b.ciudad}<span class="flex items-center gap-1"><MapPin class="h-3 w-3" /> {b.ciudad}</span>{/if}
						</CardDescription>
					{/if}
				</div>
				{#if b.contacto}
					<div class="flex shrink-0 gap-2">
						<Button
							href={`https://wa.me/${b.contacto.replace(/\D/g, '')}`}
							target="_blank"
							size="lg"
							class="h-11 border-0 text-white hover:opacity-90"
							style="background: {primary}"
						>
							<MessageCircle class="h-4 w-4" /> Contactar
						</Button>
						<Button
							href={`tel:${b.contacto}`}
							variant="outline"
							size="lg"
							class="hidden h-11 sm:inline-flex"
							style="border-color: {primary}; color: {primary}"
						>
							<Phone class="h-4 w-4" />
						</Button>
					</div>
				{/if}
			</div>
			<p class="mt-3 text-sm text-muted-foreground sm:text-base">
				{(isArtista ? b.bio ?? b.descripcion : b.descripcion) ?? 'Sin descripción'}
			</p>
			{#if !isArtista && (b.vision || b.mision)}
				<div class="mt-4 grid gap-3 sm:grid-cols-2">
					{#if b.vision}
						<div class="rounded-xl bg-muted/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-muted-foreground">VISIÓN</p>
							<p class="mt-1 text-sm">{b.vision}</p>
						</div>
					{/if}
					{#if b.mision}
						<div class="rounded-xl bg-muted/40 p-3">
							<p class="text-xs font-semibold tracking-wide text-muted-foreground">MISIÓN</p>
							<p class="mt-1 text-sm">{b.mision}</p>
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
			class="mb-3 flex items-center gap-2 text-lg font-semibold"
			style="color: {primary}"
		>
			<ShoppingBag class="h-5 w-5" /> {isArtista ? 'Servicios' : 'Productos y servicios'}
			{#if isArtista}<Badge variant="outline" class="ml-1 text-xs font-normal">solo servicios</Badge>{/if}
		</h2>
		{#if data.productos.length === 0}
			<Card class="py-12 text-center">
				<CardContent class="flex flex-col items-center gap-3">
					<PackageOpen class="h-12 w-12 text-muted-foreground" />
					<CardTitle class="text-base">{isArtista ? 'Sin servicios aún' : 'Sin productos aún'}</CardTitle>
					<CardDescription>{isArtista ? 'Este artista aún no ha cargado servicios.' : 'Este negocio aún no ha cargado productos.'}</CardDescription>
				</CardContent>
			</Card>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				{#each data.productos as p (p.id)}
					<li>
						<Card class="h-full" style="border-color: color-mix(in oklab, {primary} 12%, transparent)">
							<CardHeader class="pb-2">
								<Badge variant="secondary" class="w-fit gap-1"><Tag class="h-3 w-3" /> {p.tipo}</Badge>
								<CardTitle class="mt-2 line-clamp-1 text-base">{p.nombre}</CardTitle>
								{#if p.descripcion}<CardDescription class="line-clamp-2">{p.descripcion}</CardDescription>{/if}
							</CardHeader>
							<CardContent>
								{#if p.precio_estimado}
									<Badge
										variant="outline"
										class="font-mono"
										style="border-color: {primary}; color: {primary}">${p.precio_estimado} {p.moneda}</Badge
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
	<footer class="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
		<span>© {new Date().getFullYear()} {b.nombre} · página creada con <a href="/" class="font-medium underline hover:text-foreground">IISAR</a></span>
		<span class="font-mono">futuro: {b.slug}.iisar.com</span>
	</footer>
</div>
