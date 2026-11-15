import { getAnonSupabase } from '$lib/supabase/helpers';
import { buildSitemap, STATIC_PATHS, type SitemapEntry } from '$lib/seo/sitemap';
import { site } from '$lib/site';
import type { RequestHandler } from './$types';

/**
 * `/sitemap.xml`: fixed public pages, every province and every active business. Uses the anon
 * client, so RLS already hides inactive businesses. A failed query logs and leaves its URLs out
 * instead of failing the whole sitemap.
 */
export const GET: RequestHandler = async () => {
	const supabase = getAnonSupabase();

	const [provincias, contenido, businesses] = await Promise.all([
		supabase.from('provincias').select('id,slug').order('orden'),
		supabase.from('provincia_contenido').select('provincia_id,updated_at'),
		supabase.from('businesses').select('slug,updated_at').eq('estado', 'activo').order('slug')
	]);

	if (provincias.error) console.error('sitemap: provincias lookup failed', provincias.error);
	if (contenido.error) console.error('sitemap: provincia_contenido lookup failed', contenido.error);
	if (businesses.error) console.error('sitemap: businesses lookup failed', businesses.error);

	const updatedByProvincia = new Map(
		(contenido.data ?? []).map((row) => [row.provincia_id as string, row.updated_at as string])
	);

	const entries: SitemapEntry[] = [
		...STATIC_PATHS.map((path) => ({ path })),
		...(provincias.data ?? []).map((p) => ({
			path: `/ecuador/${encodeURIComponent(p.slug)}`,
			lastmod: updatedByProvincia.get(p.id)
		})),
		...(businesses.data ?? []).map((b) => ({
			path: `/negocio/${encodeURIComponent(b.slug)}`,
			lastmod: b.updated_at
		}))
	];

	return new Response(buildSitemap(site.origin, entries), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
