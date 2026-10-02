import type { SupabaseClient } from '@supabase/supabase-js';
import { normalizeText } from './places';

export type SearchCategory = { id: string; nombre: string; slug: string };
export type SearchProvincia = {
	id: string;
	slug: string;
	nombre: string;
	region: string;
	orden: number;
};
export type SearchCiudad = { ciudad: string; provinciaSlug: string | null };
export type SearchOptions = {
	categories: SearchCategory[];
	provincias: SearchProvincia[];
	/** Distinct cities of active businesses (feeds the place index). */
	ciudades: SearchCiudad[];
	provinciasError: boolean;
};

/**
 * Loads the lists that feed the header search panel. Both are auxiliary: a
 * failed query is logged and yields an empty list, so no page breaks because
 * of the search options. `provinciasError` lets the home tell a failed lookup
 * apart from an unknown slug.
 */
const CITY_ROWS_LIMIT = 500;
const CITIES_MAX = 200;

export async function fetchSearchOptions(
	client: Pick<SupabaseClient, 'from'>
): Promise<SearchOptions> {
	const [categoriesResult, provinciasResult, ciudadesResult] = await Promise.all([
		client.from('categories').select('id,nombre,slug').eq('activo', true).order('nombre'),
		client.from('provincias').select('id,slug,nombre,region,orden').order('orden'),
		client
			.from('businesses')
			.select('ciudad,provincia_id')
			.eq('estado', 'activo')
			.not('ciudad', 'is', null)
			.limit(CITY_ROWS_LIMIT)
	]);

	if (categoriesResult.error)
		console.error('search: categories lookup failed', categoriesResult.error);
	if (provinciasResult.error)
		console.error('search: provincias lookup failed', provinciasResult.error);
	if (ciudadesResult.error) console.error('search: cities lookup failed', ciudadesResult.error);

	const provincias = provinciasResult.error
		? []
		: ((provinciasResult.data ?? []) as SearchProvincia[]);

	return {
		categories: categoriesResult.error ? [] : ((categoriesResult.data ?? []) as SearchCategory[]),
		provincias,
		ciudades: ciudadesResult.error ? [] : toCities(ciudadesResult.data, provincias),
		provinciasError: Boolean(provinciasResult.error)
	};
}

/** Distinct cities (by normalized name, first spelling wins) with their province slug. */
function toCities(rows: unknown, provincias: SearchProvincia[]): SearchCiudad[] {
	const slugById = new Map(provincias.map((p) => [p.id, p.slug]));
	const seen = new Set<string>();
	const cities: SearchCiudad[] = [];
	for (const row of (rows ?? []) as { ciudad: string | null; provincia_id: string | null }[]) {
		const ciudad = row.ciudad?.trim() ?? '';
		const key = normalizeText(ciudad);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		cities.push({
			ciudad,
			provinciaSlug: (row.provincia_id && slugById.get(row.provincia_id)) || null
		});
		if (cities.length >= CITIES_MAX) break;
	}
	return cities;
}

/**
 * Safe entry point for the layout load, which wraps every `(app)` route: it must
 * never throw. A rejected query or a failing client factory degrades to empty
 * lists with `provinciasError` set, so the home can tell a failed lookup apart
 * from an unknown slug.
 */
export async function loadSearchOptions(
	getClient: () => Pick<SupabaseClient, 'from'>
): Promise<SearchOptions> {
	try {
		return await fetchSearchOptions(getClient());
	} catch (error) {
		console.error('search: options could not be loaded', error);
		return { categories: [], provincias: [], ciudades: [], provinciasError: true };
	}
}
