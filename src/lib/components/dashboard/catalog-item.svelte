<script lang="ts">
	import { Pencil, Trash2 } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { ProductService } from '$lib/types';
	import { CATALOG_TIPO_LABEL, formatCatalogPrice } from '$lib/utils/catalog-form';

	type Props = {
		item: ProductService;
		disabled: boolean;
		onedit: (item: ProductService) => void;
		ondelete: (item: ProductService) => void;
	};

	let { item, disabled, onedit, ondelete }: Props = $props();

	const price = $derived(formatCatalogPrice(item.precio_estimado, item.moneda));
</script>

<li
	class="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<div class="flex flex-wrap items-center gap-2">
			<Badge variant={item.tipo === 'producto' ? 'secondary' : 'outline'}
				>{CATALOG_TIPO_LABEL[item.tipo]}</Badge
			>
			<span class="text-body font-medium break-words">{item.nombre}</span>
		</div>
		{#if item.descripcion}
			<p class="text-caption break-words text-muted-foreground">{item.descripcion}</p>
		{/if}
		<p class="text-caption text-muted-foreground">{price ?? 'Sin precio'}</p>
	</div>
	<div class="flex shrink-0 gap-2">
		<Button
			type="button"
			variant="outline"
			{disabled}
			onclick={() => onedit(item)}
			aria-label="Editar {item.nombre}"
			class="h-11 px-4"><Pencil aria-hidden="true" /> Editar</Button
		>
		<Button
			type="button"
			variant="destructive"
			{disabled}
			onclick={() => ondelete(item)}
			aria-label="Eliminar {item.nombre}"
			class="h-11 px-4"><Trash2 aria-hidden="true" /> Eliminar</Button
		>
	</div>
</li>
