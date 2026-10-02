<script lang="ts">
	import { Check, Eye, Pencil, TriangleAlert } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { renderProvinceHtml } from '$lib/content/render';
	import { saveProvinceBody } from '$lib/content/provincia-contenido';
	import { supabase } from '$lib/supabase';
	import {
		PROVINCE_BODY_MAX,
		isDirty,
		normalizeBody,
		validateBody
	} from '$lib/utils/province-editor';

	type Props = {
		provinciaId: string;
		initialBody: string;
		onsaved: () => void | Promise<void>;
		oncancel: () => void;
	};

	let { provinciaId, initialBody, onsaved, oncancel }: Props = $props();

	const TABS = ['edit', 'preview'] as const;
	type Tab = (typeof TABS)[number];

	// Seeded once on purpose: the draft belongs to the editor while it is open.
	// svelte-ignore state_referenced_locally
	let draft = $state(initialBody);
	let tab = $state<Tab>('edit');
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let confirmingEmpty = $state(false);

	const normalized = $derived(normalizeBody(draft));
	const length = $derived(normalized.length);
	const validation = $derived(validateBody(draft));
	const dirty = $derived(isDirty(initialBody, draft));
	const isEmpty = $derived(normalized === '');
	const nearLimit = $derived(length >= PROVINCE_BODY_MAX * 0.9);
	const shownError = $derived(saveError ?? (validation.ok ? null : validation.error));
	const previewHtml = $derived(renderProvinceHtml(draft));

	function onkeydown(event: KeyboardEvent) {
		const index = TABS.indexOf(tab);
		let next: number;
		if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
		else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = TABS.length - 1;
		else return;
		event.preventDefault();
		tab = TABS[next];
		document.getElementById(`province-tab-${tab}`)?.focus();
	}

	function requestSave() {
		if (saving || !dirty || !validation.ok) return;
		if (isEmpty && !confirmingEmpty) {
			confirmingEmpty = true;
			return;
		}
		void save();
	}

	async function save() {
		saving = true;
		saveError = null;
		const { error } = await saveProvinceBody(supabase, provinciaId, normalized);
		if (error) {
			saveError = error;
			confirmingEmpty = false;
			saving = false;
			return;
		}
		try {
			await onsaved();
		} catch {
			// The write already succeeded; only refreshing the page failed.
			saveError = 'Se guardó, pero no se pudo actualizar la página. Recargala para ver el cambio.';
		} finally {
			saving = false;
		}
	}
</script>

<section aria-labelledby="province-editor-heading" class="mb-10 flex flex-col gap-4">
	<h2 id="province-editor-heading" class="text-title font-semibold text-foreground">
		Editar contenido
	</h2>

	<div role="tablist" aria-label="Modo del editor" class="flex gap-1 lg:hidden">
		{#each TABS as id (id)}
			<button
				type="button"
				role="tab"
				id="province-tab-{id}"
				aria-selected={tab === id}
				aria-controls="province-panel-{id}"
				tabindex={tab === id ? 0 : -1}
				{onkeydown}
				onclick={() => (tab = id)}
				class="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-4 text-body font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 {tab ===
				id
					? 'bg-primary text-primary-foreground'
					: 'bg-background text-foreground hover:bg-muted'}"
			>
				{#if id === 'edit'}
					<Pencil class="size-4" aria-hidden="true" /> Editar
				{:else}
					<Eye class="size-4" aria-hidden="true" /> Vista previa
				{/if}
			</button>
		{/each}
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<div
			role="tabpanel"
			id="province-panel-edit"
			aria-labelledby="province-tab-edit"
			class="flex-col gap-1.5 lg:flex {tab === 'edit' ? 'flex' : 'hidden'}"
		>
			<label for="province-body" class="text-caption font-medium text-muted-foreground">
				Contenido (Markdown)
			</label>
			<textarea
				id="province-body"
				bind:value={draft}
				disabled={saving}
				aria-describedby="province-help province-count"
				aria-invalid={!validation.ok}
				spellcheck="true"
				class="min-h-80 w-full rounded-lg border border-input bg-transparent p-3 text-body outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive lg:min-h-96 dark:bg-input/30"
			></textarea>
			<p id="province-help" class="text-caption text-muted-foreground">
				Usá ### para los títulos y [texto](https://…) para los enlaces.
			</p>
			<p
				id="province-count"
				class="text-caption {validation.ok ? 'text-muted-foreground' : 'text-destructive'}"
			>
				{length} / {PROVINCE_BODY_MAX}
			</p>
			<p class="sr-only" aria-live="polite">
				{nearLimit ? `${length} de ${PROVINCE_BODY_MAX} caracteres` : ''}
			</p>
		</div>

		<div
			role="tabpanel"
			id="province-panel-preview"
			aria-labelledby="province-tab-preview"
			class="flex-col gap-1.5 lg:flex {tab === 'preview' ? 'flex' : 'hidden'}"
		>
			<span class="text-caption font-medium text-muted-foreground" aria-hidden="true">
				Vista previa
			</span>
			<div class="min-h-80 rounded-lg border border-border p-3 lg:min-h-96">
				{#if previewHtml}
					<article class="prose-content">
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- el HTML sale de renderProvinceHtml (marked + allowlist estricta de sanitize.ts) -->
						{@html previewHtml}
					</article>
				{:else}
					<p class="text-body text-muted-foreground">Nada para mostrar todavía.</p>
				{/if}
			</div>
		</div>
	</div>

	{#if shownError}
		<p role="alert" class="flex items-start gap-2 text-body text-destructive">
			<TriangleAlert class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
			{shownError}
		</p>
	{/if}

	{#if confirmingEmpty}
		<div
			class="flex flex-col gap-3 rounded-lg border border-destructive p-3"
			role="group"
			aria-labelledby="province-confirm-text"
		>
			<p id="province-confirm-text" class="text-body text-foreground">
				El contenido está vacío: al guardar se borra el artículo de esta provincia. ¿Confirmás?
			</p>
			<div class="flex flex-col gap-2 sm:flex-row">
				<Button variant="pill" disabled={saving} onclick={requestSave}>
					{saving ? 'Guardando…' : 'Sí, borrar el contenido'}
				</Button>
				<Button
					variant="outline"
					class="h-11 px-6"
					disabled={saving}
					onclick={() => (confirmingEmpty = false)}
				>
					Volver
				</Button>
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-2 sm:flex-row">
			<Button variant="pill" disabled={saving || !dirty || !validation.ok} onclick={requestSave}>
				{#if saving}
					Guardando…
				{:else}
					<Check aria-hidden="true" /> Guardar
				{/if}
			</Button>
			<Button variant="outline" class="h-11 px-6" disabled={saving} onclick={oncancel}>
				Cancelar
			</Button>
		</div>
	{/if}
</section>
