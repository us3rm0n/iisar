import { getAnonSupabase } from '$lib/supabase/helpers';
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

	const { data: provincias } = await supabase.from('provincias').select('id,slug,nombre,region,orden').order('orden');

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

	if (provincia) {
		const prov = provincias?.find((p) => p.slug === provincia);
		if (prov) query = query.eq('provincia_id', prov.id);
	}

	if (q) {
		// pg_trgm ilike simple para MVP; luego migrar a tsvector
		query = query.or(`nombre.ilike.%${q}%,descripcion.ilike.%${q}%`);
	}

	const { data: businesses } = await query;

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
		categories: categories ?? [],
		provincias: provincias ?? [],
		businesses: businesses ?? [],
		ads: ads ?? []
	};
};
