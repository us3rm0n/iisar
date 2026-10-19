<script lang="ts">
	import { Package, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Catalog } from '$lib/dashboard/catalog.svelte';
	import type { Business } from '$lib/types';
	import CatalogItem from './catalog-item.svelte';
	import CatalogItemForm from './catalog-item-form.svelte';

	type Props = { business: Business };

	let { business }: Props = $props();

	const catalog = new Catalog();

	// Reload when the dashboard refreshes the business (e.g. its tipo was edited).
	$effect(() => {
		catalog.load(business);
	});
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-title">
			<Package class="size-5" aria-hidden="true" />
			Catálogo de {business.nombre}
		</CardTitle>
		<CardDescription class="text-body">
			{business.tipo === 'artista'
				? 'Los servicios que ofreces se muestran en tu landing.'
				: 'Los productos y servicios se muestran en tu landing.'}
			Requiere suscripción vigente.
		</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col gap-3">
		{#if catalog.message}
			<p class="rounded-lg bg-muted px-3 py-2 text-body" role="status">{catalog.message}</p>
		{/if}
		{#if catalog.error && !catalog.formOpen}
			<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
				{catalog.error}
			</p>
		{/if}

		{#if catalog.formOpen}
			<CatalogItemForm
				bind:form={catalog.form}
				idPrefix="catalog-{business.id}"
				tipos={catalog.tipos}
				editing={catalog.editingId !== null}
				busy={catalog.saving}
				error={catalog.error}
				onsubmit={catalog.save}
				oncancel={catalog.cancel}
			/>
		{:else}
			<Button
				type="button"
				variant="outline"
				onclick={catalog.startCreate}
				class="h-11 self-start px-4"><Plus aria-hidden="true" /> Agregar</Button
			>
		{/if}

		{#if catalog.loading}
			<p class="text-body text-muted-foreground">Cargando catálogo...</p>
		{:else if catalog.items.length}
			<ul class="grid gap-3">
				{#each catalog.items as item (item.id)}
					<CatalogItem
						{item}
						disabled={catalog.saving}
						onedit={catalog.startEdit}
						ondelete={(target) => catalog.remove(target)}
					/>
				{/each}
			</ul>
		{:else}
			<p class="text-body text-muted-foreground">Aún no hay ítems en el catálogo.</p>
		{/if}
	</CardContent>
</Card>
