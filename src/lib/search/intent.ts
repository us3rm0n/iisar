import type { SearchFilters } from './filters';
import { resolvePlace, type Place } from './places';

/**
 * When `q` exactly names a place and no place filter is set yet, returns the
 * filters with that place applied and `q` cleared (the canonical form of the
 * search); otherwise `null`.
 */
export function canonicalizePlaceQuery(
	filters: SearchFilters,
	index: Place[]
): SearchFilters | null {
	if (filters.provincia !== '' || filters.ciudad !== '') return null;
	const place = resolvePlace(index, filters.q);
	if (!place) return null;

	return {
		...filters,
		q: '',
		provincia: place.provinciaSlug ?? '',
		ciudad: place.kind === 'ciudad' ? place.name : ''
	};
}
