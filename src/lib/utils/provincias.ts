import type { BusinessTipo, Provincia, ProvinciaRegion } from '$lib/types';

/**
 * Taxonomía geográfica del Ecuador. Fuente única de verdad: las etiquetas de
 * región y de tipo vivían duplicadas en tres páginas y cada copia divergía.
 */
export const REGION_LABELS: Record<ProvinciaRegion, string> = {
	costa: 'Costa',
	sierra: 'Sierra',
	amazonia: 'Amazonía',
	insular: 'Insular'
};

/** Orden canónico de presentación. El orden de claves del record lo define. */
export const REGIONS = Object.keys(REGION_LABELS) as ProvinciaRegion[];

export const TIPO_LABELS: Record<BusinessTipo, string> = {
	negocio: 'Negocio',
	artista: 'Artista',
	lugar: 'Lugar'
};

/** Etiqueta de región, o el valor crudo si el dato llega con una región desconocida. */
export function regionLabel(region: string): string {
	return REGION_LABELS[region as ProvinciaRegion] ?? region;
}

/** Etiqueta de tipo de negocio, o el valor crudo si el dato llega con un tipo desconocido. */
export function tipoLabel(tipo: string): string {
	return TIPO_LABELS[tipo as BusinessTipo] ?? tipo;
}

/**
 * Agrupa provincias por región en orden canónico y descarta los grupos vacíos,
 * para que ninguna página renderice una sección sin contenido.
 */
export function groupByRegion(provincias: Provincia[]): {
	region: ProvinciaRegion;
	label: string;
	provincias: Provincia[];
}[] {
	return REGIONS.map((region) => ({
		region,
		label: REGION_LABELS[region],
		provincias: provincias.filter((p) => p.region === region)
	})).filter((group) => group.provincias.length > 0);
}
