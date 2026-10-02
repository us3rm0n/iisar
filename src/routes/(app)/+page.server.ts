import { error } from '@sveltejs/kit';
import { getAnonSupabase } from '$lib/supabase/helpers';
import { parseFilters } from '$lib/search/filters';
import { resolveProvinciaFilter } from '$lib/utils/provincia-filter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	// Same parsing as the header panel prefill, so both agree on what counts as a filter.
	const { q, categoria, provincia } = parseFilters(url.searchParams);

	// Categories and provinces come from the layout (header search panel): no duplicate queries.
	const {
		searchOptions: { categories, provincias, provinciasError }
	} = await parent();

	const supabase = getAnonSupabase();

	// Provinces are auxiliary: a failed lookup (logged by the layout loader) must not
	// break the page. Without a filter the home still lists businesses; with one we
	// cannot resolve it, so `resolveProvinciaFilter` reports the problem and we list nothing.
	const { provinciaId, problem: provinciaProblem } = resolveProvinciaFilter(
		provincias,
		provincia,
		provinciasError
	);

	let query = supabase
		.from('businesses')
		.select('id,nombre,slug,tipo,descripcion,ciudad,category_id, categories(nombre,slug)')
		.eq('estado', 'activo')
		.order('created_at', { ascending: false })
		.limit(20);

	if (categoria) {
		const cat = categories.find((c) => c.slug === categoria);
		if (cat) query = query.eq('category_id', cat.id);
	}

	if (provinciaId) query = query.eq('provincia_id', provinciaId);

	if (q) {
		// pg_trgm ilike simple para MVP; luego migrar a tsvector
		query = query.or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`);
	}

	// Slug desconocido o filtro irresoluble: no ejecutar la query como si no
	// hubiera filtro, no hay nada que listar.
	const { data: businesses, error: businessesError } = provinciaProblem
		? { data: [], error: null }
		: await query;

	if (businessesError) throw error(500, 'No se pudieron cargar los negocios');

	return {
		q,
		categoria,
		provincia,
		provinciaProblem,
		businesses: businesses ?? []
	};
};
