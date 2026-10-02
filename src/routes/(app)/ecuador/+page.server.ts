import { error } from '@sveltejs/kit';
import { getAnonSupabase } from '$lib/supabase/helpers';
import type { Provincia } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const supabase = getAnonSupabase();

	const { data: provincias, error: dbError } = await supabase
		.from('provincias')
		.select('id,slug,nombre,region,orden')
		.order('orden');

	if (dbError) throw error(500, 'No se pudo cargar la geografía de Ecuador');

	return {
		provincias: (provincias ?? []) as Provincia[]
	};
};
