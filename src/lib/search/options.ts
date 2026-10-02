import type { SupabaseClient } from '@supabase/supabase-js';

export type SearchCategory = { id: string; nombre: string; slug: string };
export type SearchProvincia = {
	id: string;
	slug: string;
	nombre: string;
	region: string;
	orden: number;
};
export type SearchOptions = {
	categories: SearchCategory[];
	provincias: SearchProvincia[];
	provinciasError: boolean;
};

/**
 * Loads the lists that feed the header search panel. Both are auxiliary: a
 * failed query is logged and yields an empty list, so no page breaks because
 * of the search options. `provinciasError` lets the home tell a failed lookup
 * apart from an unknown slug.
 */
export async function fetchSearchOptions(
	client: Pick<SupabaseClient, 'from'>
): Promise<SearchOptions> {
	const [categoriesResult, provinciasResult] = await Promise.all([
		client.from('categories').select('id,nombre,slug').eq('activo', true).order('nombre'),
		client.from('provincias').select('id,slug,nombre,region,orden').order('orden')
	]);

	if (categoriesResult.error)
		console.error('search: categories lookup failed', categoriesResult.error);
	if (provinciasResult.error)
		console.error('search: provincias lookup failed', provinciasResult.error);

	return {
		categories: categoriesResult.error ? [] : ((categoriesResult.data ?? []) as SearchCategory[]),
		provincias: provinciasResult.error ? [] : ((provinciasResult.data ?? []) as SearchProvincia[]),
		provinciasError: Boolean(provinciasResult.error)
	};
}
