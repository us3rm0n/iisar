<script lang="ts">
	import { CreditCard, ShieldCheck, UploadCloud } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<Card class="bg-muted ring-0">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-title">
			<CreditCard class="size-5" aria-hidden="true" /> Flujo pagos después de prueba
		</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-3 text-body">
		<p>
			Tras 7d: <code>fecha_maxima</code> expira, <code>has_active_subscription</code> pasa a
			<code>false</code> y el negocio queda en solo lectura. Renueva subiendo comprobante a
			<code>comprobantes</code> con <code>type mensual/semestral/anual</code>; el webmaster aprueba
			en <code>/admin</code>.
		</p>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" class="h-11 px-4">
				<UploadCloud aria-hidden="true" /> Subir comprobante
			</Button>
			<Button href="/admin" variant="ghost" class="h-11 px-4">
				<ShieldCheck aria-hidden="true" /> Admin
			</Button>
		</div>
	</CardContent>
</Card>
