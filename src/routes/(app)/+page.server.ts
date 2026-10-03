import { error, redirect } from '@sveltejs/kit';
import { getAnonSupabase } from '$lib/supabase/helpers';
import { buildSearchHref, parseFilters } from '$lib/search/filters';
import { canonicalizePlaceQuery } from '$lib/search/intent';
import { toIlikePattern } from '$lib/search/ilike';
import { buildPlaceIndex } from '$lib/search/places';
import { PROVINCIAL_CAPITALS } from '$lib/search/capitals';
import { markdownExcerpt } from '$lib/search/excerpt';
import { fetchProvinceBody } from '$lib/content/provincia-contenido';
import { resolveProvinciaFilter } from '$lib/utils/provincia-filter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	// Same parsing as the header panel prefill, so both agree on what counts as a filter.
	const filters = parseFilters(url.searchParams);
	const { q, categoria, provincia, ciudad } = filters;

	// Categories and provinces come from the layout (header search panel): no duplicate queries.
	const {
		searchOptions: { categories, provincias, ciudades, provinciasError }
	} = await parent();

	// A query that exactly names a place becomes that place's filter; the redirect keeps the
	// URL equal to the real state (and cannot loop: `q` is empty afterwards).
	const canonical = canonicalizePlaceQuery(
		filters,
		buildPlaceIndex({
			provincias,
			capitals: PROVINCIAL_CAPITALS,
			businessCities: ciudades
		})
	);
	if (canonical) throw redirect(303, buildSearchHref(canonical));

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

	const ciudadPattern = toIlikePattern(ciudad);
	if (ciudadPattern) query = query.ilike('ciudad', `%${ciudadPattern}%`);

	const qPattern = toIlikePattern(q);
	if (qPattern) {
		// pg_trgm ilike simple para MVP; luego migrar a tsvector
		query = query.or(
			`nombre.ilike.%${qPattern}%,descripcion.ilike.%${qPattern}%,ciudad.ilike.%${qPattern}%`
		);
	}

	// A text filter made only of punctuation cannot match anything: ignoring it would list every
	// business under a chip that says the list is filtered.
	const unusableTextFilter =
		(ciudad !== '' && ciudadPattern === '') || (q !== '' && qPattern === '');

	// Slug desconocido o filtro irresoluble: no ejecutar la query como si no
	// hubiera filtro, no hay nada que listar.
	const { data: businesses, error: businessesError } =
		provinciaProblem || unusableTextFilter ? { data: [], error: null } : await query;

	if (businessesError) throw error(500, 'No se pudieron cargar los negocios');

	// Guide for the province card: the excerpt is best effort and never breaks the page.
	const guideProvincia = provinciaId ? provincias.find((p) => p.id === provinciaId) : undefined;
	let guide: {
		provincia: { slug: string; nombre: string; region: string };
		excerpt: string;
	} | null = null;
	if (guideProvincia && provinciaId) {
		const { body, error: bodyError } = await fetchProvinceBody(supabase, provinciaId);
		if (bodyError) console.error('search: province guide failed', bodyError);
		guide = {
			provincia: {
				slug: guideProvincia.slug,
				nombre: guideProvincia.nombre,
				region: guideProvincia.region
			},
			excerpt: bodyError ? '' : markdownExcerpt(body ?? '')
		};
	}

	return {
		q,
		categoria,
		provincia,
		ciudad,
		guide,
		provinciaProblem,
		businesses: businesses ?? []
	};
};
