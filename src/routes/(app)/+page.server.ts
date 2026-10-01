import { error } from '@sveltejs/kit';
import { getAnonSupabase } from '$lib/supabase/helpers';
import { resolveProvinciaFilter } from '$lib/utils/provincia-filter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const categoria = url.searchParams.get('categoria')?.trim() ?? '';
	const provincia = url.searchParams.get('provincia')?.trim() ?? '';

	const supabase = getAnonSupabase();

	const { data: categories } = await supabase
		.from('categories')
		.select('id,nombre,slug')
		.eq('activo', true)
		.order('nombre');

	const { data: provincias, error: provinciasError } = await supabase
		.from('provincias')
		.select('id,slug,nombre,region,orden')
		.order('orden');

	// Provinces are auxiliary: a failed lookup must not break the page. Without a
	// filter the home still lists businesses; with one we cannot resolve it, so
	// `resolveProvinciaFilter` reports the problem and we list nothing.
	if (provinciasError) console.error('home: provincias lookup failed', provinciasError);
	const { provinciaId, problem: provinciaProblem } = resolveProvinciaFilter(
		provincias ?? [],
		provincia,
		Boolean(provinciasError)
	);

	let query = supabase
		.from('businesses')
		.select('id,nombre,slug,tipo,descripcion,ciudad,category_id, categories(nombre,slug)')
		.eq('estado', 'activo')
		.order('created_at', { ascending: false })
		.limit(20);

	if (categoria) {
		const cat = categories?.find((c) => c.slug === categoria);
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

	// ad slots home (max 2 no intrusivo)
	const { data: ads } = await supabase
		.from('ad_slots')
		.select('id,ubicacion,business_id')
		.eq('ubicacion', 'home')
		.eq('activo', true)
		.limit(2);

	return {
		q,
		categoria,
		provincia,
		provinciaProblem,
		categories: categories ?? [],
		provincias: provincias ?? [],
		businesses: businesses ?? [],
		ads: ads ?? []
	};
};
