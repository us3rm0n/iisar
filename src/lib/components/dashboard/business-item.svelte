<script lang="ts">
	import { Landmark, MapPin } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import SelectField from '$lib/components/select-field.svelte';
	import type { Business, Provincia, ProvinciaRegion, Subscription } from '$lib/types';
	import { TIPO_META, swatchColor } from '$lib/utils/business-form';
	import { tipoLabel } from '$lib/utils/provincias';
	import ProvinceOptions from './province-options.svelte';
	import SubscriptionStatus from './subscription-status.svelte';

	type Props = {
		business: Business;
		subscription?: Subscription;
		provinciaGroups: { region: ProvinciaRegion; label: string; provincias: Provincia[] }[];
		/** Resolves to false when saving failed, so the select can be restored. */
		onprovincia: (business: Business, provinciaId: string) => Promise<boolean>;
	};

	let { business, subscription, provinciaGroups, onprovincia }: Props = $props();
</script>

<li
	class="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start"
>
	<div class="flex min-w-0 flex-1 flex-col gap-2">
		<div class="flex flex-wrap items-center gap-2">
			<a
				href="/negocio/{business.slug}"
				class="inline-flex min-h-11 items-center text-title font-medium underline-offset-4 hover:underline"
				>{business.nombre}</a
			>
			<Badge variant={TIPO_META[business.tipo].badge}>{tipoLabel(business.tipo)}</Badge>
			<Badge variant="secondary">{business.estado}</Badge>
			{#if business.primary_color}
				<span
					class="size-3 rounded-full border border-border"
					style:background-color={swatchColor(business.primary_color)}
					aria-hidden="true"
				></span>
			{/if}
		</div>
		<p class="flex items-center gap-1 text-caption text-muted-foreground">
			<MapPin class="size-3 shrink-0" aria-hidden="true" />
			{business.ciudad ?? '—'} · /negocio/{business.slug}
		</p>
		{#if subscription}<SubscriptionStatus {subscription} />{/if}
		<div class="flex items-end gap-2">
			<Landmark class="mb-3 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<SelectField
				id="provincia-{business.id}"
				label="Provincia de {business.nombre}"
				hideLabel
				value={business.provincia_id ?? ''}
				onchange={async (event) => {
					const select = event.currentTarget;
					if (!(await onprovincia(business, select.value))) {
						select.value = business.provincia_id ?? '';
					}
				}}
				class="min-w-0 flex-1 sm:w-56 sm:flex-none"
			>
				<ProvinceOptions groups={provinciaGroups} />
			</SelectField>
		</div>
	</div>
	<Button href="/negocio/{business.slug}" variant="outline" class="h-11 shrink-0 px-4">Ver</Button>
</li>
