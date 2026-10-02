import { buildSearchHref, type SearchFilters } from './filters';
import type { Place } from './places';

/** Search URL for a chosen place; the text query is consumed, the category kept. */
export function hrefForPlace(place: Place, current: SearchFilters): string {
	if (place.kind === 'provincia') {
		return buildSearchHref({
			q: '',
			categoria: current.categoria,
			provincia: place.provinciaSlug ?? '',
			ciudad: ''
		});
	}
	return buildSearchHref({
		q: '',
		categoria: current.categoria,
		provincia: place.provinciaSlug ?? '',
		ciudad: place.name
	});
}
