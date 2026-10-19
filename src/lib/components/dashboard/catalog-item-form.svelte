<script lang="ts">
	import { Save } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import FormField from '$lib/components/form-field.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import type { CatalogTipo } from '$lib/types';
	import { CATALOG_TIPO_LABEL, type CatalogFormValues } from '$lib/utils/catalog-form';

	type Props = {
		form: CatalogFormValues;
		/** Prefix for input ids, unique per business. */
		idPrefix: string;
		tipos: CatalogTipo[];
		editing: boolean;
		busy: boolean;
		error: string;
		onsubmit: () => void;
		oncancel: () => void;
	};

	let {
		form = $bindable(),
		idPrefix,
		tipos,
		editing,
		busy,
		error,
		onsubmit,
		oncancel
	}: Props = $props();
</script>

<form
	onsubmit={(event) => {
		event.preventDefault();
		onsubmit();
	}}
	class="grid gap-4 rounded-lg border border-border bg-muted/40 p-4"
	aria-label={editing ? 'Editar ítem del catálogo' : 'Agregar ítem al catálogo'}
>
	<div class="grid gap-4 sm:grid-cols-2">
		<SelectField id="{idPrefix}-tipo" label="Tipo" bind:value={form.tipo}>
			{#each tipos as tipo (tipo)}
				<option value={tipo}>{CATALOG_TIPO_LABEL[tipo]}</option>
			{/each}
		</SelectField>
		<FormField
			id="{idPrefix}-nombre"
			label="Nombre *"
			bind:value={form.nombre}
			placeholder="Almuerzo del día"
			required
		/>
	</div>

	<FormField
		id="{idPrefix}-descripcion"
		label="Descripción"
		bind:value={form.descripcion}
		placeholder="Sopa, segundo y jugo"
	/>

	<div class="grid gap-4 sm:grid-cols-3">
		<FormField
			id="{idPrefix}-precio"
			label="Precio estimado"
			bind:value={form.precio}
			placeholder="4,50"
		/>
		<FormField id="{idPrefix}-moneda" label="Moneda" bind:value={form.moneda} placeholder="USD" />
		<FormField id="{idPrefix}-orden" label="Orden" bind:value={form.orden} placeholder="0" />
	</div>

	<FormField
		id="{idPrefix}-imagen"
		label="Imagen (URL)"
		bind:value={form.imagenUrl}
		placeholder="https://..."
	/>

	{#if error}
		<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
			{error}
		</p>
	{/if}
	<div class="flex flex-col gap-2 sm:flex-row">
		<Button type="submit" variant="pill" disabled={busy} class="w-full sm:w-auto">
			<Save aria-hidden="true" />
			{busy ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar al catálogo'}
		</Button>
		<Button
			type="button"
			variant="outline"
			disabled={busy}
			onclick={oncancel}
			class="h-11 w-full px-4 sm:w-auto">Cancelar</Button
		>
	</div>
</form>
