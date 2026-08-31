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
	import { Tag, Megaphone, Clock, ShieldCheck } from '@lucide/svelte';
</script>

<div class="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
	<div class="mb-6">
		<h1 class="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
			<ShieldCheck class="h-6 w-6" /> Admin — Webmaster
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Solo <code class="rounded bg-muted px-1 py-0.5">profiles.role = 'webmaster'</code> (función
			<code>is_webmaster()</code>).
		</p>
	</div>

	<div class="grid gap-4">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2"><Tag class="h-5 w-5" /> Categorías</CardTitle>
				<CardDescription
					>Iniciales: gastronomía, salud. Escritura solo webmaster (RLS).</CardDescription
				>
			</CardHeader>
			<CardContent>
				<code class="rounded bg-muted px-2 py-1 text-xs">select * from categories;</code>
				<p class="mt-2 text-sm text-muted-foreground">
					Crear: <code class="rounded bg-muted px-1 py-0.5"
						>insert into categories (nombre, slug) values ('Nueva','nueva');</code
					>
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2"
					><Clock class="h-5 w-5" /> Suscripciones pendientes</CardTitle
				>
				<CardDescription
					>Cliente sube comprobante (attachment URL) → pendiente → webmaster aprueba.</CardDescription
				>
			</CardHeader>
			<CardContent class="space-y-3">
				<pre
					class="overflow-auto rounded bg-muted p-3 text-xs">select id, business_id, type, total, status, attachment, fecha_creacion, fecha_vencimiento, fecha_maxima from subscriptions where status='pendiente';</pre>
				<div class="flex flex-wrap gap-2 text-sm">
					<Badge variant="destructive">pendiente</Badge>
					<Badge>aprobada</Badge>
					<Badge variant="secondary">vencida</Badge>
					<Badge variant="outline">rechazada</Badge>
				</div>
				<p class="text-xs">
					Aprobar: <code class="rounded bg-muted px-1 py-0.5"
						>update subscriptions set status='aprobada', aprobada_por = auth.uid() where id = ...;</code
					>
				</p>
				<Separator />
				<p class="text-xs text-muted-foreground">
					Gracia: mensual 7d · semestral 15d · anual 30d — ver trigger <code
						>handle_subscription_dates()</code
					>
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2"
					><Megaphone class="h-5 w-5" /> Publicidad</CardTitle
				>
				<CardDescription>No intrusiva — límites por ubicación</CardDescription>
			</CardHeader>
			<CardContent>
				<p class="text-sm">
					<Badge>home</Badge> max 2 · <Badge variant="secondary">category</Badge> max 2 · <Badge
						variant="outline">business_page</Badge
					> max 1. Asignar <code class="rounded bg-muted px-1 py-0.5">business_id</code> para ocupar slot.
				</p>
				<code class="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs"
					>select * from ad_slots where activo=true;</code
				>
			</CardContent>
		</Card>
	</div>

	<Separator class="my-6" />
	<p class="text-xs text-muted-foreground">
		Studio local: <a class="underline hover:text-foreground" href="http://127.0.0.1:54323"
			>http://127.0.0.1:54323</a
		>
		· <code class="rounded bg-muted px-1 py-0.5">npx supabase status</code>
	</p>
</div>
