<script lang="ts">
	import type { Provincia, ProvinciaRegion } from '$lib/types';

	type Props = {
		groups: { region: ProvinciaRegion; label: string; provincias: Provincia[] }[];
	};

	let { groups }: Props = $props();
</script>

<option value="">Sin provincia</option>
{#each groups as group (group.region)}
	<optgroup label={group.label}>
		{#each group.provincias as provincia (provincia.id)}
			<option value={provincia.id}>{provincia.nombre}</option>
		{/each}
	</optgroup>
{/each}
