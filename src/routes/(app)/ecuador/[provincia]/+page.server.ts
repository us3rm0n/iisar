import { error } from '@sveltejs/kit';
import { getAnonSupabase } from '$lib/supabase/helpers';
import { fetchProvinceBody } from '$lib/content/provincia-contenido';
import { renderProvinceHtml } from '$lib/content/render';
import type { Business, Provincia } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const supabase = getAnonSupabase();

	const { data: provincia, error: provinciaError } = await supabase
		.from('provincias')
		.select('id,slug,nombre,region,orden')
		.eq('slug', params.provincia)
		.maybeSingle();

	if (provinciaError) throw error(500, 'No se pudo cargar la provincia');
	if (!provincia) throw error(404, 'Provincia no encontrada');

	const { data: businesses, error: businessesError } = await supabase
		.from('businesses')
		.select('id,nombre,slug,tipo,descripcion,ciudad,category_id, categories(nombre,slug)')
		.eq('provincia_id', provincia.id)
		.eq('estado', 'activo')
		.order('nombre');

	if (businessesError) throw error(500, 'No se pudieron cargar los negocios de esta provincia');

	// A content failure must not take the whole page down: log it and render without the article.
	const { body, error: bodyError } = await fetchProvinceBody(supabase, provincia.id);
	if (bodyError) console.error(bodyError);
	const markdown = body ?? '';

	return {
		provincia: provincia as Provincia,
		body: markdown,
		lessonHtml: markdown ? renderProvinceHtml(markdown) : '',
		businesses: (businesses ?? []) as unknown as Business[]
	};
};
