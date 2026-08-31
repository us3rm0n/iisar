import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const categoria = url.searchParams.get('categoria')?.trim() ?? '';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	const { data: categories } = await supabase
		.from('categories')
		.select('id,nombre,slug')
		.eq('activo', true)
		.order('nombre');

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
		categories: categories ?? [],
		businesses: businesses ?? [],
		ads: ads ?? []
	};
};
