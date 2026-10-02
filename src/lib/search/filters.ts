/** Search filters shared by the header panel and the home results. */
export type SearchFilters = { q: string; categoria: string; provincia: string };

const KEYS = ['q', 'categoria', 'provincia'] as const;

/** Reads the filters from URL params: trimmed, missing values become `''`. */
export function parseFilters(params: URLSearchParams): SearchFilters {
	return {
		q: params.get('q')?.trim() ?? '',
		categoria: params.get('categoria')?.trim() ?? '',
		provincia: params.get('provincia')?.trim() ?? ''
	};
}

export function hasActiveFilters(filters: SearchFilters): boolean {
	return KEYS.some((key) => filters[key].trim() !== '');
}

/** `/` when nothing is active, otherwise `/?` with only the non-empty params. */
export function buildSearchHref(filters: SearchFilters): string {
	const params = new URLSearchParams();
	for (const key of KEYS) {
		const value = filters[key].trim();
		if (value) params.set(key, value);
	}
	const query = params.toString();
	return query ? `/?${query}` : '/';
}
