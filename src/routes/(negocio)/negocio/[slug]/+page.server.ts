import { getAnonSupabase } from '$lib/supabase/helpers';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const supabase = getAnonSupabase();

	const { data: business } = await supabase
		.from('businesses')
		.select(
			'id,nombre,slug,tipo,descripcion,bio,vision,mision,historia,valores,redes,ciudad,contacto,category_id,provincia_id,logo_url,cover_url,primary_color,accent_color, categories(nombre,slug), provincias(nombre,slug)'
		)
		.eq('slug', params.slug)
		.single();

	if (!business) throw error(404, 'Negocio no encontrado');

	// Las tres son independientes, así que van en paralelo. Las bandas son
	// decoración: si fallan la landing se renderiza igual, sin ellas, en vez de
	// caer en 500 por un dato accesorio (mismo criterio que las provincias en el home).
	const [productos, stats, highlights, ads] = await Promise.all([
		supabase
			.from('products_services')
			.select('id,nombre,descripcion,precio_estimado,moneda,tipo,imagen_url')
			.eq('business_id', business.id)
			.order('orden'),
		supabase
			.from('business_stats')
			.select('id,valor,etiqueta,orden')
			.eq('business_id', business.id)
			.order('orden'),
		supabase
			.from('business_highlights')
			.select('id,titulo,descripcion,orden')
			.eq('business_id', business.id)
			.order('orden'),
		supabase
			.from('ad_slots')
			.select('id')
			.eq('ubicacion', 'business_page')
			.eq('activo', true)
			.limit(1)
	]);

	if (stats.error) console.error('landing: business_stats lookup failed', stats.error);
	if (highlights.error) console.error('landing: business_highlights lookup failed', highlights.error);

	return {
		business,
		productos: productos.data ?? [],
		stats: stats.data ?? [],
		highlights: highlights.data ?? [],
		ads: ads.data ?? []
	};
};
