<script lang="ts">
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { useSession } from '$lib/session-context';
	import { adminAccess } from '$lib/utils/admin-access';
	import { Tag, Megaphone, Clock } from '@lucide/svelte';

	const session = useSession();
	const access = $derived(session ? adminAccess(session) : 'loading');

	const snippet = 'rounded-md bg-muted px-1.5 py-0.5 text-caption break-words';
</script>

<svelte:head>
	<title>Admin | IISAR</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if access === 'allowed'}
	<div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<PageHeader
			title="Admin — Webmaster"
			description="Solo para usuarios con el rol webmaster en profiles (función is_webmaster())."
		/>

		<div class="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-title"><Tag /> Categorías</CardTitle>
					<CardDescription
						>Iniciales: gastronomía, salud. Escritura solo webmaster (RLS).</CardDescription
					>
				</CardHeader>
				<CardContent class="flex flex-col gap-2">
					<code class={snippet}>select * from categories;</code>
					<p class="text-body text-muted-foreground">
						Crear: <code class={snippet}
							>insert into categories (nombre, slug) values ('Nueva','nueva');</code
						>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-title"
						><Clock /> Suscripciones pendientes</CardTitle
					>
					<CardDescription
						>Cliente sube comprobante (attachment URL), queda pendiente y el webmaster aprueba.</CardDescription
					>
				</CardHeader>
				<CardContent class="flex flex-col gap-3">
					<pre
						class="overflow-auto rounded-md bg-muted p-3 text-caption">select id, business_id, type, total, status, attachment, fecha_creacion, fecha_vencimiento, fecha_maxima from subscriptions where status='pendiente';</pre>
					<div class="flex flex-wrap gap-2">
						<Badge variant="destructive">pendiente</Badge>
						<Badge>aprobada</Badge>
						<Badge variant="secondary">vencida</Badge>
						<Badge variant="outline">rechazada</Badge>
					</div>
					<p class="text-caption">
						Aprobar: <code class={snippet}
							>update subscriptions set status='aprobada', aprobada_por = auth.uid() where id = ...;</code
						>
					</p>
					<Separator />
					<p class="text-caption text-muted-foreground">
						Gracia: mensual 7d, semestral 15d, anual 30d. Ver trigger <code class={snippet}
							>handle_subscription_dates()</code
						>
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle class="flex items-center gap-2 text-title"><Megaphone /> Publicidad</CardTitle>
					<CardDescription>No intrusiva, con límites por ubicación</CardDescription>
				</CardHeader>
				<CardContent class="flex flex-col gap-3">
					<div class="flex flex-wrap items-center gap-2 text-body">
						<Badge>home</Badge> máx. 2 <Badge variant="secondary">category</Badge> máx. 2
						<Badge variant="outline">business_page</Badge> máx. 1
					</div>
					<p class="text-body">
						Asignar <code class={snippet}>business_id</code> para ocupar el slot.
					</p>
					<code class={snippet}>select * from ad_slots where activo=true;</code>
				</CardContent>
			</Card>
		</div>

		<Separator />
		<p class="text-caption text-muted-foreground">
			Studio local:
			<a class="inline-flex min-h-11 items-center underline" href="http://127.0.0.1:54323"
				>http://127.0.0.1:54323</a
			>
			y <code class={snippet}>npx supabase status</code>
		</p>
	</div>
{:else if access === 'loading'}
	<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<p role="status" class="text-body text-muted-foreground">Verificando acceso…</p>
	</div>
{:else}
	<div class="mx-auto flex max-w-4xl flex-col items-start gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		<PageHeader title="Admin" />
		{#if access === 'signed-out'}
			<p class="text-body text-muted-foreground">Necesitás iniciar sesión para ver esta página.</p>
			<Button href="/auth/login" variant="pill" class="min-h-11">Iniciar sesión</Button>
		{:else}
			<p class="text-body text-muted-foreground">No tenés permiso para ver esta página.</p>
			<Button href="/" variant="pill" class="min-h-11">Volver al inicio</Button>
		{/if}
	</div>
{/if}
