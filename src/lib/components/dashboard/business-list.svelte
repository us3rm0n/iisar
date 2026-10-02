<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Business, Provincia, ProvinciaRegion, Subscription } from '$lib/types';
	import BusinessItem from './business-item.svelte';

	type Props = {
		businesses: Business[];
		subscriptions: Record<string, Subscription>;
		provinciaGroups: { region: ProvinciaRegion; label: string; provincias: Provincia[] }[];
		email?: string;
		error: string;
		onprovincia: (business: Business, provinciaId: string) => Promise<boolean>;
	};

	let { businesses, subscriptions, provinciaGroups, email, error, onprovincia }: Props = $props();
</script>

<section class="flex flex-col gap-3" aria-labelledby="businesses-heading">
	<div class="flex flex-wrap items-center gap-2">
		<h2 id="businesses-heading" class="text-title font-semibold">
			Tus negocios ({businesses.length})
		</h2>
		{#if email}<Badge variant="outline" class="max-w-full truncate">{email}</Badge>{/if}
	</div>
	{#if error}
		<p class="rounded-lg bg-destructive/10 px-3 py-2 text-body text-destructive">{error}</p>
	{/if}
	<ul class="grid gap-3">
		{#each businesses as business (business.id)}
			<BusinessItem
				{business}
				subscription={subscriptions[business.id]}
				{provinciaGroups}
				{onprovincia}
			/>
		{/each}
	</ul>
</section>
