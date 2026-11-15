<script lang="ts">
	import { Save, Trash2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import FormField from '$lib/components/form-field.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import type { CatalogTipo } from '$lib/types';
	import { CATALOG_TIPO_LABEL, type CatalogFormValues } from '$lib/utils/catalog-form';
	import { IMAGE_ACCEPT } from '$lib/utils/image-upload';

	type Props = {
		form: CatalogFormValues;
		/** Prefix for input ids, unique per business. */
		idPrefix: string;
		tipos: CatalogTipo[];
		editing: boolean;
		busy: boolean;
		/** True while the picked photo is uploading. */
		uploading: boolean;
		error: string;
		/** Uploads the picked photo; the catalog sets `form.imagenUrl` when it is done. */
		onupload: (file: File) => Promise<void>;
		onsubmit: () => void;
		oncancel: () => void;
	};

	let {
		form = $bindable(),
		idPrefix,
		tipos,
		editing,
		busy,
		uploading,
		error,
		onupload,
		onsubmit,
		oncancel
	}: Props = $props();

	async function onpick(event: Event & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		await onupload(file);
		// Cleared so picking the same file again (after an error) fires `change`.
		input.value = '';
	}
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
			inputmode="decimal"
			label="Precio estimado"
			bind:value={form.precio}
			placeholder="4,50"
		/>
		<FormField id="{idPrefix}-moneda" label="Moneda" bind:value={form.moneda} placeholder="USD" />
		<FormField
			id="{idPrefix}-orden"
			inputmode="numeric"
			label="Orden"
			bind:value={form.orden}
			placeholder="0"
		/>
	</div>

	<div class="flex flex-col gap-1.5">
		<label for="{idPrefix}-imagen" class="text-caption font-medium text-muted-foreground">
			Foto
		</label>
		{#if form.imagenUrl}
			<div class="flex items-center gap-3">
				<img
					src={form.imagenUrl}
					alt="Foto actual"
					class="size-16 shrink-0 rounded-lg border border-border object-cover"
				/>
				<Button
					type="button"
					variant="outline"
					disabled={busy || uploading}
					onclick={() => (form.imagenUrl = '')}
					class="h-11 px-4"><Trash2 aria-hidden="true" /> Quitar foto</Button
				>
			</div>
		{/if}
		<input
			id="{idPrefix}-imagen"
			type="file"
			accept={IMAGE_ACCEPT}
			disabled={busy || uploading}
			onchange={onpick}
			aria-describedby="{idPrefix}-imagen-hint"
			class="block w-full cursor-pointer rounded-lg text-body text-foreground outline-none file:mr-3 file:h-11 file:cursor-pointer file:rounded-lg file:border file:border-solid file:border-input file:bg-background file:px-4 file:font-medium file:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
		/>
		<p id="{idPrefix}-imagen-hint" class="text-caption text-muted-foreground">
			{form.imagenUrl ? 'Elige otra foto para reemplazarla. ' : ''}JPG, PNG o WebP de hasta 2 MB.
		</p>
		{#if uploading}
			<p class="text-caption text-foreground" role="status">Subiendo foto…</p>
		{/if}
	</div>

	{#if error}
		<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
			{error}
		</p>
	{/if}
	<div class="flex flex-col gap-2 sm:flex-row">
		<Button type="submit" variant="pill" disabled={busy || uploading} class="w-full sm:w-auto">
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
