<script lang="ts">
	import { CreditCard, Mail } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { site } from '$lib/site';

	type Props = { businessName?: string; email?: string | null };

	let { businessName, email }: Props = $props();

	// Payments are manual: the owner emails the receipt and the webmaster approves it.
	const href = $derived.by(() => {
		const subject = `Comprobante de pago${businessName ? ` — ${businessName}` : ''}`;
		const body = [
			'Hola, adjunto el comprobante de pago de mi plan en iisar.',
			'',
			`Negocio: ${businessName ?? ''}`,
			`Email de la cuenta: ${email ?? ''}`,
			'Plan (mensual, semestral o anual): ',
			'Medio de pago: '
		].join('\n');
		return `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	});
</script>

<Card class="bg-muted ring-0">
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-title">
			<CreditCard class="size-5" aria-hidden="true" /> Cuando termine tu prueba
		</CardTitle>
	</CardHeader>
	<CardContent class="grid gap-3 text-body">
		<p>
			La prueba gratis dura 7 días. Al terminar, tu página sigue publicada, pero no podrás editar el
			catálogo hasta renovar.
		</p>
		<p>
			Para renovar, elige un plan mensual, semestral o anual, paga y envíanos el comprobante. Lo
			revisamos y activamos tu plan. Si quieres conocer precios y medios de pago, escríbenos al
			mismo correo.
		</p>
		<div>
			<Button {href} variant="outline" class="h-11 px-4">
				<Mail aria-hidden="true" /> Enviar comprobante por email
			</Button>
		</div>
	</CardContent>
</Card>
