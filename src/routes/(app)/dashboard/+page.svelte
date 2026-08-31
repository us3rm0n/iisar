<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { slugify } from '$lib/utils/slug';
	import { daysLeft } from '$lib/utils/date';
	import { getCurrentUser } from '$lib/auth';
	import type { Business, Subscription } from '$lib/types';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Store, CreditCard, ShieldCheck, UploadCloud, Plus, LogOut, MapPin } from '@lucide/svelte';

	// --- state ---
	let user: { id: string; email?: string } | null = $state(null);
	let loading = $state(true);
	let categories: { id: string; nombre: string; slug: string }[] = $state([]);
	let businesses: Business[] = $state([]);
	let subscriptions: Record<string, Subscription> = $state({});

	// form
	let tipo = $state<Business['tipo']>('negocio');
	let nombre = $state('');
	let slug = $state('');
	let descripcion = $state('');
	let vision = $state('');
	let mision = $state('');
	let ciudad = $state('Macas');
	let contacto = $state('');
	let categoryId = $state('');
	let primaryColor = $state('#ea580c');
	let creating = $state(false);
	let formError = $state('');
	let formMessage = $state('');

	// auto slug
	$effect(() => {
		if (nombre && !slug) slug = slugify(nombre);
	});

	// --- data loading ---
	async function loadCategories() {
		const { data } = await supabase.from('categories').select('id,nombre,slug').eq('activo', true).order('nombre');
		categories = data ?? [];
	}

	async function loadBusinesses(ownerId: string) {
		const { data } = await supabase
			.from('businesses')
			.select('id,nombre,slug,tipo,ciudad,estado,primary_color,vision,mision,category_id,categories(nombre)')
			.eq('owner_id', ownerId)
			.order('created_at');
		businesses = (data as unknown as Business[]) ?? [];
	}

	async function loadSubscriptions() {
		for (const business of businesses) {
			const { data } = await supabase
				.from('subscriptions')
				.select('id,type,status,fecha_vencimiento,fecha_maxima,total')
				.eq('business_id', business.id)
				.order('fecha_maxima', { ascending: false })
				.limit(1)
				.maybeSingle();
			if (data) subscriptions[business.id] = data as Subscription;
		}
	}

	async function load() {
		user = await getCurrentUser();
		if (!user) {
			loading = false;
			return;
		}
		await Promise.all([loadCategories(), loadBusinesses(user.id)]);
		await loadSubscriptions();
		loading = false;
	}

	// --- business creation (single responsibility, clean code) ---
	function buildBusinessPayload(ownerId: string, finalSlug: string) {
		return {
			owner_id: ownerId,
			category_id: categoryId || null,
			slug: finalSlug,
			tipo,
			nombre: nombre.trim(),
			descripcion: descripcion.trim() || null,
			vision: tipo === 'negocio' ? vision.trim() || null : null,
			mision: tipo === 'negocio' ? mision.trim() || null : null,
			ciudad: ciudad.trim() || null,
			contacto: contacto.trim() || null,
			estado: 'activo' as const,
			primary_color: primaryColor
		};
	}

	async function createBusinessRecord(payload: ReturnType<typeof buildBusinessPayload>) {
		const { data, error } = await supabase.from('businesses').insert(payload).select('id,slug').single();
		if (error) throw new Error(error.message);
		return data as { id: string; slug: string };
	}

	async function createTrialSubscription(businessId: string) {
		const { error } = await supabase.from('subscriptions').insert({
			business_id: businessId,
			type: 'prueba',
			total: 0,
			medio_pago: 'trial',
			status: 'aprobada'
		});
		if (error) throw new Error(`Negocio creado pero trial falló: ${error.message}`);
	}

	function resetForm() {
		nombre = '';
		slug = '';
		descripcion = '';
		vision = '';
		mision = '';
		contacto = '';
	}

	async function handleCreate(event: SubmitEvent) {
		event.preventDefault();
		if (!user) return;
		creating = true;
		formError = '';
		formMessage = '';
		try {
			const finalSlug = slugify(slug || nombre);
			if (!finalSlug || !nombre.trim()) throw new Error('Nombre y slug son requeridos');
			const payload = buildBusinessPayload(user.id, finalSlug);
			const business = await createBusinessRecord(payload);
			await createTrialSubscription(business.id);
			formMessage = `¡Negocio creado! Prueba 7 días activa. Ver en /negocio/${finalSlug}`;
			resetForm();
			await load();
		} catch (e) {
			formError = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			creating = false;
		}
	}

	async function logout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}

	onMount(load);
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<header class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Mis negocios</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Gestiona tus negocios · prueba <Badge variant="secondary">7 días gratis</Badge> al crear cuenta.
			</p>
		</div>
		{#if user}<Button variant="ghost" size="sm" onclick={logout}><LogOut class="h-4 w-4" /> Salir</Button>{/if}
	</header>

	{#if loading}
		<Card><CardContent class="p-6 text-sm text-muted-foreground">Cargando...</CardContent></Card>
	{:else if !user}
		<Card>
			<CardHeader>
				<CardTitle>Inicia sesión para crear tu negocio</CardTitle>
				<CardDescription>Frontend ya disponible — prueba 7 días automática.</CardDescription>
			</CardHeader>
			<CardContent class="flex gap-2">
				<Button href="/auth/register"><Plus class="h-4 w-4" /> Crear cuenta</Button>
				<Button href="/auth/login" variant="outline">Iniciar sesión</Button>
			</CardContent>
		</Card>
	{:else}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle class="flex items-center gap-2"><Store class="h-5 w-5" /> Crear {tipo === 'artista' ? 'artista' : 'negocio'}</CardTitle>
				<CardDescription>Al crearlo se activa prueba <Badge>7 días</Badge> con <code>has_active_subscription</code>. Artista solo servicios, negocio productos+servicios.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onsubmit={handleCreate} class="grid gap-3">
					<div class="grid gap-1.5">
						<p class="text-sm font-medium">Tipo</p>
						<div class="flex gap-2">
							<Button type="button" variant={tipo === 'negocio' ? 'default' : 'outline'} size="sm" onclick={() => (tipo = 'negocio')}>Negocio</Button>
							<Button type="button" variant={tipo === 'artista' ? 'default' : 'outline'} size="sm" onclick={() => (tipo = 'artista')}>Artista</Button>
							<span class="self-center text-xs text-muted-foreground">{tipo === 'artista' ? 'solo servicios' : 'productos y servicios + visión/misión'}</span>
						</div>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						<div class="grid gap-1.5">
							<label for="nombre" class="text-sm font-medium">Nombre *</label>
							<Input id="nombre" bind:value={nombre} placeholder={tipo === 'artista' ? 'DJ Andino' : 'Sabor Andino'} required />
						</div>
						<div class="grid gap-1.5">
							<label for="slug" class="text-sm font-medium">Slug</label>
							<Input id="slug" bind:value={slug} placeholder={tipo === 'artista' ? 'dj-andino' : 'sabor-andino'} />
							<p class="text-xs text-muted-foreground">/negocio/{slugify(slug || nombre) || '...'}</p>
						</div>
					</div>

					<div class="grid gap-1.5">
						<label for="descripcion" class="text-sm font-medium">{tipo === 'artista' ? 'Bio / Descripción' : 'Descripción'}</label>
						<Input id="descripcion" bind:value={descripcion} placeholder={tipo === 'artista' ? 'DJ de música andina...' : 'Menú diario...'} />
					</div>

					{#if tipo === 'negocio'}
						<div class="grid gap-3 sm:grid-cols-2">
							<div class="grid gap-1.5">
								<label for="vision" class="text-sm font-medium">Visión</label>
								<Input id="vision" bind:value={vision} placeholder="Ser referente en..." />
							</div>
							<div class="grid gap-1.5">
								<label for="mision" class="text-sm font-medium">Misión</label>
								<Input id="mision" bind:value={mision} placeholder="Ofrecer productos..." />
							</div>
						</div>
					{/if}

					<div class="grid gap-3 sm:grid-cols-3">
						<div class="grid gap-1.5">
							<label for="ciudad" class="text-sm font-medium">Ciudad</label>
							<Input id="ciudad" bind:value={ciudad} placeholder="Macas" />
						</div>
						<div class="grid gap-1.5">
							<label for="contacto" class="text-sm font-medium">Contacto (wa/tel)</label>
							<Input id="contacto" bind:value={contacto} placeholder="0991234567" />
						</div>
						<div class="grid gap-1.5">
							<label for="categoryId" class="text-sm font-medium">Categoría</label>
							<select id="categoryId" bind:value={categoryId} class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
								<option value="">Sin categoría</option>
								{#each categories as category}<option value={category.id}>{category.nombre}</option>{/each}
							</select>
						</div>
					</div>

					<div class="grid gap-1.5">
						<label for="primaryColor" class="text-sm font-medium">Color marca</label>
						<div class="flex gap-2">
							<Input id="primaryColorPicker" type="color" bind:value={primaryColor} class="h-10 w-20 p-1" aria-label="Selector color marca" />
							<Input id="primaryColor" bind:value={primaryColor} placeholder="#ea580c" class="flex-1 font-mono" />
						</div>
					</div>

					{#if formError}<p class="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>{/if}
					{#if formMessage}<p class="rounded bg-muted px-3 py-2 text-sm">{formMessage}</p>{/if}
					<Button type="submit" disabled={creating} class="h-11"><Plus class="h-4 w-4" /> {creating ? 'Creando...' : 'Crear negocio + trial 7d'}</Button>
				</form>
			</CardContent>
		</Card>

		{#if businesses.length}
			<div class="mb-3 flex items-center gap-2">
				<h2 class="font-semibold">Tus negocios ({businesses.length})</h2>
				<Badge variant="outline">{user.email}</Badge>
			</div>
			<ul class="grid gap-3">
				{#each businesses as business (business.id)}
					<li>
						<Card>
							<CardContent class="flex items-center justify-between gap-3 p-4">
								<div>
									<p class="flex items-center gap-2 font-medium">
										<a href="/negocio/{business.slug}" class="hover:underline">{business.nombre}</a>
										<Badge variant={business.tipo === 'artista' ? 'default' : 'secondary'}>{business.tipo}</Badge>
										<Badge variant="secondary">{business.estado}</Badge>
										{#if business.primary_color}<span class="h-3 w-3 rounded-full border" style="background:{business.primary_color}"></span>{/if}
									</p>
									<p class="flex items-center gap-1 text-sm text-muted-foreground"><MapPin class="h-3 w-3" /> {business.ciudad ?? '—'} · /negocio/{business.slug}</p>
									{#if subscriptions[business.id]}
										{@const subscription = subscriptions[business.id]}
										{@const remaining = daysLeft(subscription.fecha_maxima)}
										<p class="mt-1 text-xs">
											<Badge variant={subscription.status === 'aprobada' && remaining > 0 ? 'default' : 'destructive'}>{subscription.type} · {subscription.status}</Badge>
											{#if subscription.type === 'prueba'} — prueba {remaining > 0 ? `${remaining} días restantes` : 'vencida'}{/if}
											{#if remaining <= 0}<span class="text-destructive"> — renovar con comprobante</span>{/if}
										</p>
									{/if}
								</div>
								<Button href="/negocio/{business.slug}" variant="outline" size="sm">Ver</Button>
							</CardContent>
						</Card>
					</li>
				{/each}
			</ul>
		{/if}

		<Card class="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
			<CardHeader><CardTitle class="flex items-center gap-2 text-amber-900 dark:text-amber-100"><CreditCard class="h-5 w-5" /> Flujo pagos después de prueba</CardTitle></CardHeader>
			<CardContent class="grid gap-2 text-sm">
				<p>Tras 7d: `fecha_maxima` expira → `has_active_subscription=false` → solo lectura. Renueva subiendo comprobante a <code>comprobantes</code> con `type mensual/semestral/anual` → webmaster aprueba en `/admin`.</p>
				<div class="flex gap-2"><Button variant="outline" size="sm"><UploadCloud class="h-4 w-4" /> Subir comprobante</Button><Button href="/admin" variant="ghost" size="sm"><ShieldCheck class="h-4 w-4" /> Admin</Button></div>
			</CardContent>
		</Card>
	{/if}

	<Separator class="my-6" />
	<p class="text-xs text-muted-foreground">Tablas: <code>businesses</code> <code>subscriptions type='prueba'</code> 7d · Buckets <code>business-assets</code> / <code>comprobantes</code></p>
</div>
