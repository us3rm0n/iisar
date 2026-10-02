import { buildSearchHref, type SearchFilters } from './filters';

export type FilterChip = {
	key: keyof SearchFilters;
	label: string;
	removeHref: string;
};

type Lookup = {
	categories: { slug: string; nombre: string }[];
	provincias: { slug: string; nombre: string }[];
};

/**
 * One removable chip per active filter, in a stable order. Filters are
 * independent: removing a province keeps the city (a city stands on its own).
 */
export function activeFilterChips(filters: SearchFilters, lookup: Lookup): FilterChip[] {
	const labels: Record<keyof SearchFilters, string> = {
		provincia:
			lookup.provincias.find((p) => p.slug === filters.provincia)?.nombre ?? filters.provincia,
		ciudad: filters.ciudad,
		categoria: `Categoría: ${
			lookup.categories.find((c) => c.slug === filters.categoria)?.nombre ?? filters.categoria
		}`,
		q: `«${filters.q}»`
	};

	return (['provincia', 'ciudad', 'categoria', 'q'] as const)
		.filter((key) => filters[key].trim() !== '')
		.map((key) => ({
			key,
			label: labels[key],
			removeHref: buildSearchHref({ ...filters, [key]: '' })
		}));
}
