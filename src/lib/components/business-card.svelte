<script lang="ts">
	import { ArrowRight, MapPin } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { firstRelation } from '$lib/supabase/helpers';
	import { tipoLabel } from '$lib/utils/provincias';
	import { cn } from '$lib/utils';
	import type { Business } from '$lib/types';

	type Props = {
		business: Pick<Business, 'slug' | 'nombre' | 'tipo' | 'descripcion' | 'ciudad' | 'categories'>;
		class?: string;
	};

	let { business, class: className }: Props = $props();

	const categoryName = $derived(firstRelation(business.categories)?.nombre);
</script>

<a
	href="/negocio/{business.slug}"
	class={cn(
		'flex h-full min-h-11 flex-col gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
		className
	)}
>
	<div class="flex items-start justify-between gap-2">
		<h3 class="line-clamp-1 text-title font-medium">{business.nombre}</h3>
		<div class="flex shrink-0 gap-1">
			<Badge variant={business.tipo === 'artista' ? 'default' : 'secondary'}>
				{tipoLabel(business.tipo ?? 'negocio')}
			</Badge>
			{#if categoryName}
				<Badge variant="outline" class="hidden sm:inline-flex">{categoryName}</Badge>
			{/if}
		</div>
	</div>
	{#if business.ciudad}
		<p class="flex items-center gap-1 text-caption text-muted-foreground">
			<MapPin class="size-3" aria-hidden="true" />
			{business.ciudad}
		</p>
	{/if}
	<p class="line-clamp-2 text-body text-muted-foreground">
		{business.descripcion ?? 'Sin descripción'}
	</p>
	<span class="mt-auto inline-flex items-center gap-1 text-caption font-medium text-foreground">
		Ver landing <ArrowRight class="size-3" aria-hidden="true" />
	</span>
</a>
