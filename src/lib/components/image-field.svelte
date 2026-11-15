<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { IMAGE_ACCEPT, validateImageFile } from '$lib/utils/image-upload';

	type Props = {
		id: string;
		label: string;
		/** Public URL of the current image; empty when there is none. */
		value?: string;
		/** True while a picked file is uploading, so the form can hold its submit button. */
		uploading?: boolean;
		/** Uploads the file and resolves to its public URL. */
		upload: (file: File) => Promise<string>;
		disabled?: boolean;
		/** Extra help shown before the accepted formats. */
		hint?: string;
		/** Classes of the preview (size and aspect ratio). */
		previewClass?: string;
	};

	let {
		id,
		label,
		value = $bindable(''),
		uploading = $bindable(false),
		upload,
		disabled = false,
		hint = '',
		previewClass = 'size-16'
	}: Props = $props();

	let error = $state('');

	async function onpick(event: Event & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		error = validateImageFile(file) ?? '';
		if (!error) {
			uploading = true;
			try {
				value = await upload(file);
			} catch (e) {
				error = e instanceof Error ? e.message : 'No se pudo subir la imagen.';
			} finally {
				uploading = false;
			}
		}
		// Cleared so picking the same file again (after an error) fires `change`.
		input.value = '';
	}
</script>

<div class="flex flex-col gap-1.5">
	<label for={id} class="text-caption font-medium text-muted-foreground">{label}</label>
	{#if value}
		<div class="flex items-center gap-3">
			<img
				src={value}
				alt="{label} actual"
				class={cn('shrink-0 rounded-lg border border-border object-cover', previewClass)}
			/>
			<Button
				type="button"
				variant="outline"
				disabled={disabled || uploading}
				onclick={() => (value = '')}
				class="h-11 px-4"><Trash2 aria-hidden="true" /> Quitar</Button
			>
		</div>
	{/if}
	<input
		{id}
		type="file"
		accept={IMAGE_ACCEPT}
		disabled={disabled || uploading}
		onchange={onpick}
		aria-describedby="{id}-hint"
		class="block w-full cursor-pointer rounded-lg text-body text-foreground outline-none file:mr-3 file:h-11 file:cursor-pointer file:rounded-lg file:border file:border-solid file:border-input file:bg-background file:px-4 file:font-medium file:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
	/>
	<p id="{id}-hint" class="text-caption text-muted-foreground">
		{hint}
		{value ? 'Elige otro archivo para cambiar la imagen.' : ''} JPG, PNG o WebP de hasta 2 MB.
	</p>
	{#if uploading}
		<p class="text-caption text-foreground" role="status">Subiendo imagen…</p>
	{/if}
	{#if error}
		<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive" role="alert">
			{error}
		</p>
	{/if}
</div>
