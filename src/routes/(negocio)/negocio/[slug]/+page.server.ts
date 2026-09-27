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

	const { data: productos } = await supabase
		.from('products_services')
		.select('id,nombre,descripcion,precio_estimado,moneda,tipo,imagen_url')
		.eq('business_id', business.id)
		.order('orden');

	const { data: ads } = await supabase
		.from('ad_slots')
		.select('id')
		.eq('ubicacion', 'business_page')
		.eq('activo', true)
		.limit(1);

	return { business, productos: productos ?? [], ads: ads ?? [] };
};
