<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Store, CreditCard, Clock, ShieldCheck, UploadCloud, Plus, LogOut, MapPin } from '@lucide/svelte';

	let user: any = $state(null);
	let loading = $state(true);
	let categories: any[] = $state([]);
	let businesses: any[] = $state([]);
	let subs: Record<string, any> = $state({});

	// form crear negocio — soporta negocio vs artista
	let tipo = $state<'negocio' | 'artista'>('negocio');
	let nombre = $state('');
	let slug = $state('');
	let descripcion = $state('');
	let vision = $state('');
	let mision = $state('');
	let ciudad = $state('Macas');
	let contacto = $state('');
	let category_id = $state('');
	let primary_color = $state('#ea580c');
	let creating = $state(false);
	let formErr = $state('');
	let formMsg = $state('');

	function slugify(s: string) {
		return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
	}
	$effect(() => {
		if (nombre && !slug) slug = slugify(nombre);
	});

	async function load() {
		const { data: { session } } = await supabase.auth.getSession();
		user = session?.user ?? null;
		if (!user) {
			loading = false;
			return;
		}
		const { data: cats } = await supabase.from('categories').select('id,nombre,slug').eq('activo', true).order('nombre');
		categories = cats ?? [];
		const { data: biz } = await supabase.from('businesses').select('id,nombre,slug,tipo,ciudad,estado,primary_color,vision,mision,category_id,categories(nombre)').eq('owner_id', user.id).order('created_at');
		businesses = biz ?? [];
		// cargar subs vigentes por negocio
		for (const b of businesses) {
			const { data: s } = await supabase.from('subscriptions').select('id,type,status,fecha_vencimiento,fecha_maxima,total').eq('business_id', b.id).order('fecha_maxima', { ascending: false }).limit(1).maybeSingle();
			if (s) subs[b.id] = s;
		}
		loading = false;
	}

	async function handleCreate(e: SubmitEvent) {
		e.preventDefault();
		if (!user) return;
		creating = true;
		formErr = '';
		formMsg = '';
		const finalSlug = slugify(slug || nombre);
		const { data: biz, error } = await supabase.from('businesses').insert({
			owner_id: user.id,
			category_id: category_id || null,
			slug: finalSlug,
			tipo,
			nombre,
			descripcion: descripcion || null,
			vision: tipo === 'negocio' ? vision || null : null,
			mision: tipo === 'negocio' ? mision || null : null,
			ciudad: ciudad || null,
			contacto: contacto || null,
			estado: 'activo',
			primary_color
		}).select('id,slug').single();
		if (error) {
			formErr = error.message;
			creating = false;
			return;
		}
		// trial 7 días auto-aprobada
		const { error: subErr } = await supabase.from('subscriptions').insert({
			business_id: biz.id,
			type: 'prueba',
			total: 0,
			medio_pago: 'trial',
			status: 'aprobada'
		});
		if (subErr) {
			formErr = 'Negocio creado pero trial falló: ' + subErr.message;
			creating = false;
			return;
		}
		formMsg = `¡Negocio creado! Prueba 7 días activa. Ver en /negocio/${finalSlug}`;
		nombre = ''; slug = ''; descripcion = ''; contacto = '';
		creating = false;
		await load();
	}

	async function logout() {
		await supabase.auth.signOut();
		goto('/auth/login');
	}

	function daysLeft(fecha_maxima: string) {
		const diff = new Date(fecha_maxima).getTime() - Date.now();
		return Math.ceil(diff / 86400000);
	}

	onMount(load);
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Mis negocios</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Gestiona tus negocios · prueba <Badge variant="secondary">7 días gratis</Badge> al crear cuenta.
			</p>
		</div>
		{#if user}<Button variant="ghost" size="sm" onclick={logout}><LogOut class="h-4 w-4" /> Salir</Button>{/if}
	</div>

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
						<label class="text-sm font-medium">Tipo</label>
						<div class="flex gap-2">
							<Button type="button" variant={tipo === 'negocio' ? 'default' : 'outline'} size="sm" onclick={() => (tipo = 'negocio')}>Negocio</Button>
							<Button type="button" variant={tipo === 'artista' ? 'default' : 'outline'} size="sm" onclick={() => (tipo = 'artista')}>Artista</Button>
							<span class="self-center text-xs text-muted-foreground">{tipo === 'artista' ? 'solo servicios' : 'productos y servicios + visión/misión'}</span>
						</div>
					</div>
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="grid gap-1.5">
							<label class="text-sm font-medium">Nombre *</label>
							<Input bind:value={nombre} placeholder={tipo === 'artista' ? 'DJ Andino' : 'Sabor Andino'} required />
						</div>
						<div class="grid gap-1.5">
							<label class="text-sm font-medium">Slug</label>
							<Input bind:value={slug} placeholder={tipo === 'artista' ? 'dj-andino' : 'sabor-andino'} />
							<p class="text-xs text-muted-foreground">/negocio/{slugify(slug || nombre) || '...'}</p>
						</div>
					</div>
					<div class="grid gap-1.5">
						<label class="text-sm font-medium">{tipo === 'artista' ? 'Bio / Descripción' : 'Descripción'}</label>
						<Input bind:value={descripcion} placeholder={tipo === 'artista' ? 'DJ de música andina...' : 'Menú diario...'} />
					</div>
					{#if tipo === 'negocio'}
						<div class="grid gap-3 sm:grid-cols-2">
							<div class="grid gap-1.5">
								<label class="text-sm font-medium">Visión</label>
								<Input bind:value={vision} placeholder="Ser referente en..." />
							</div>
							<div class="grid gap-1.5">
								<label class="text-sm font-medium">Misión</label>
								<Input bind:value={mision} placeholder="Ofrecer productos..." />
							</div>
						</div>
					{/if}
					<div class="grid gap-3 sm:grid-cols-3">
						<div class="grid gap-1.5">
							<label class="text-sm font-medium">Ciudad</label>
							<Input bind:value={ciudad} placeholder="Macas" />
						</div>
						<div class="grid gap-1.5">
							<label class="text-sm font-medium">Contacto (wa/tel)</label>
							<Input bind:value={contacto} placeholder="0991234567" />
						</div>
						<div class="grid gap-1.5">
							<label class="text-sm font-medium">Categoría</label>
							<select bind:value={category_id} class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
								<option value="">Sin categoría</option>
								{#each categories as c}<option value={c.id}>{c.nombre}</option>{/each}
							</select>
						</div>
					</div>
					<div class="grid gap-1.5">
						<label class="text-sm font-medium">Color marca</label>
						<div class="flex gap-2">
							<Input type="color" bind:value={primary_color} class="h-10 w-20 p-1" />
							<Input bind:value={primary_color} placeholder="#ea580c" class="flex-1 font-mono" />
						</div>
					</div>
					{#if formErr}<p class="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{formErr}</p>{/if}
					{#if formMsg}<p class="rounded bg-muted px-3 py-2 text-sm">{formMsg}</p>{/if}
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
				{#each businesses as b}
					<li>
						<Card>
							<CardContent class="flex items-center justify-between gap-3 p-4">
								<div>
									<p class="font-medium flex items-center gap-2">
										<a href="/negocio/{b.slug}" class="hover:underline">{b.nombre}</a>
										<Badge variant={b.tipo === 'artista' ? 'default' : 'secondary'}>{b.tipo}</Badge>
										<Badge variant="secondary">{b.estado}</Badge>
										{#if b.primary_color}<span class="h-3 w-3 rounded-full border" style="background:{b.primary_color}"></span>{/if}
									</p>
									<p class="text-sm text-muted-foreground flex items-center gap-1"><MapPin class="h-3 w-3" /> {b.ciudad ?? '—'} · /negocio/{b.slug}</p>
									{#if subs[b.id]}
										{@const s = subs[b.id]}
										{@const d = daysLeft(s.fecha_maxima)}
										<p class="mt-1 text-xs">
											<Badge variant={s.status==='aprobada' && d>0 ? 'default' : 'destructive'}>{s.type} · {s.status}</Badge>
											{#if s.type==='prueba'} — prueba {d>0 ? `${d} días restantes` : 'vencida'}{/if}
											{#if d<=0}<span class="text-destructive"> — renovar con comprobante</span>{/if}
										</p>
									{/if}
								</div>
								<div class="flex gap-1">
									<Button href="/negocio/{b.slug}" variant="outline" size="sm">Ver</Button>
								</div>
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
