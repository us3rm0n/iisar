import { error } from '@sveltejs/kit';
import { getAnonSupabase } from '$lib/supabase/helpers';
import { getProvinceContent, renderLessonHtml } from '$lib/content/ecuador.server';
import type { Business, Provincia } from '$lib/types';
import type { PageServerLoad } from './$types';

export type BusinessCard = Pick<
	Business,
	'id' | 'nombre' | 'slug' | 'tipo' | 'descripcion' | 'ciudad' | 'category_id' | 'categories'
>;

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

	const lesson = getProvinceContent(provincia.slug);

	return {
		provincia: provincia as Provincia,
		lessonTitle: lesson?.title ?? provincia.nombre,
		lessonHtml: lesson ? renderLessonHtml(lesson) : null,
		businesses: (businesses ?? []) as unknown as BusinessCard[]
	};
};
