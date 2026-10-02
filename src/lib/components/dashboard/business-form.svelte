<script lang="ts">
	import { Plus, Store } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import FormField from '$lib/components/form-field.svelte';
	import SelectField from '$lib/components/select-field.svelte';
	import type { Category } from '$lib/dashboard/repository';
	import type { Provincia, ProvinciaRegion } from '$lib/types';
	import {
		DEFAULT_PRIMARY_COLOR,
		TIPOS,
		TIPO_META,
		resolveSlug,
		type BusinessFormValues
	} from '$lib/utils/business-form';
	import { tipoLabel } from '$lib/utils/provincias';
	import ProvinceOptions from './province-options.svelte';

	type Props = {
		form: BusinessFormValues;
		categories: Category[];
		provinciaGroups: { region: ProvinciaRegion; label: string; provincias: Provincia[] }[];
		creating: boolean;
		error: string;
		message: string;
		onsubmit: () => void;
	};

	let {
		form = $bindable(),
		categories,
		provinciaGroups,
		creating,
		error,
		message,
		onsubmit
	}: Props = $props();

	const meta = $derived(TIPO_META[form.tipo]);

	$effect(() => {
		if (form.nombre && !form.slug) form.slug = resolveSlug(form);
	});
</script>

<Card>
	<CardHeader>
		<CardTitle class="flex items-center gap-2 text-title">
			<Store class="size-5" aria-hidden="true" /> Crear {tipoLabel(form.tipo)}
		</CardTitle>
		<CardDescription class="text-body">
			Al crearlo se activa prueba <Badge>7 días</Badge> con <code>has_active_subscription</code>.
			Artista solo servicios, negocio productos+servicios, lugar es un sitio (hotel, mirador,
			atractivo) con dueño o gestor.
		</CardDescription>
	</CardHeader>
	<CardContent>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				onsubmit();
			}}
			class="grid gap-4"
		>
			<fieldset class="grid gap-1.5">
				<legend class="text-caption font-medium text-muted-foreground">Tipo</legend>
				<div class="flex flex-wrap items-center gap-2">
					{#each TIPOS as tipo (tipo)}
						<Button
							type="button"
							variant={form.tipo === tipo ? 'default' : 'outline'}
							aria-pressed={form.tipo === tipo}
							onclick={() => (form.tipo = tipo)}
							class="h-11 px-4">{tipoLabel(tipo)}</Button
						>
					{/each}
					<span class="text-caption text-muted-foreground">{meta.hint}</span>
				</div>
			</fieldset>

			<div class="grid gap-4 sm:grid-cols-2">
				<FormField
					id="nombre"
					label="Nombre *"
					bind:value={form.nombre}
					placeholder={meta.nombrePlaceholder}
					required
				/>
				<FormField id="slug" label="Slug" bind:value={form.slug} placeholder={meta.slugPlaceholder}>
					{#snippet hint()}/negocio/{resolveSlug(form) || '...'}{/snippet}
				</FormField>
			</div>

			<FormField
				id="descripcion"
				label={meta.descripcionLabel}
				bind:value={form.descripcion}
				placeholder={meta.descripcionPlaceholder}
			/>

			{#if form.tipo === 'negocio'}
				<div class="grid gap-4 sm:grid-cols-2">
					<FormField
						id="vision"
						label="Visión"
						bind:value={form.vision}
						placeholder="Ser referente en..."
					/>
					<FormField
						id="mision"
						label="Misión"
						bind:value={form.mision}
						placeholder="Ofrecer productos..."
					/>
				</div>
			{/if}

			<div class="grid gap-4 sm:grid-cols-3">
				<FormField id="ciudad" label="Ciudad" bind:value={form.ciudad} placeholder="Macas" />
				<FormField
					id="contacto"
					label="Contacto (wa/tel)"
					bind:value={form.contacto}
					placeholder="0991234567"
				/>
				<SelectField id="categoryId" label="Categoría" bind:value={form.categoryId}>
					<option value="">Sin categoría</option>
					{#each categories as category (category.id)}
						<option value={category.id}>{category.nombre}</option>
					{/each}
				</SelectField>
			</div>

			<div class="grid gap-1.5">
				<SelectField id="provinciaId" label="Provincia" bind:value={form.provinciaId}>
					<ProvinceOptions groups={provinciaGroups} />
				</SelectField>
				<p class="text-caption text-muted-foreground">
					Opcional · se muestra en la landing y en <code>/ecuador/[provincia]</code>.
				</p>
			</div>

			<fieldset class="grid gap-1.5">
				<legend class="text-caption font-medium text-muted-foreground">Color marca</legend>
				<div class="flex items-center gap-2">
					<input
						id="primaryColorPicker"
						type="color"
						bind:value={form.primaryColor}
						aria-label="Selector color marca"
						class="h-11 w-16 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1"
					/>
					<FormField
						id="primaryColor"
						label="Código de color"
						hideLabel
						bind:value={form.primaryColor}
						placeholder={DEFAULT_PRIMARY_COLOR}
						class="flex-1"
						inputClass="font-mono"
					/>
				</div>
			</fieldset>

			{#if error}
				<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive">{error}</p>
			{/if}
			{#if message}
				<p class="rounded-lg bg-muted px-3 py-2 text-body">{message}</p>
			{/if}
			<Button
				type="submit"
				variant="pill"
				disabled={creating}
				class="w-full sm:w-auto sm:self-start"
			>
				<Plus aria-hidden="true" />
				{creating ? 'Creando...' : 'Crear negocio + trial 7d'}
			</Button>
		</form>
	</CardContent>
</Card>
