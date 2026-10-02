<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { Subscription } from '$lib/types';
	import { summarizeSubscription } from '$lib/utils/subscription';

	let { subscription }: { subscription: Subscription } = $props();

	const summary = $derived(summarizeSubscription(subscription));
</script>

<p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-muted-foreground">
	<Badge variant={summary.variant}>{summary.label}</Badge>
	{#if summary.trialNote}<span>{summary.trialNote}</span>{/if}
	{#if summary.needsRenewal}<span class="text-destructive">renovar con comprobante</span>{/if}
</p>
