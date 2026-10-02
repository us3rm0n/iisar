import { Compass, Globe, Mountain, TreePalm, Waves } from '@lucide/svelte';
import type { ProvinciaRegion } from '$lib/types';

/** Single source of truth for region icons; labels live in `provincias.ts`. */
export const REGION_ICONS: Record<ProvinciaRegion, typeof Waves> = {
	costa: Waves,
	sierra: Mountain,
	amazonia: TreePalm,
	insular: Compass
};

/** Icon for a region, or a generic one when the data carries an unknown region. */
export function regionIcon(region: string): typeof Waves {
	return REGION_ICONS[region as ProvinciaRegion] ?? Globe;
}
