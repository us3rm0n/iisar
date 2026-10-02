import type { SupabaseClient } from '@supabase/supabase-js';

/** Loads the raw markdown article of a province. No row is not an error: `body` is `null`. */
export async function fetchProvinceBody(
	client: SupabaseClient,
	provinciaId: string
): Promise<{ body: string | null; error: string | null }> {
	const { data, error } = await client
		.from('provincia_contenido')
		.select('body')
		.eq('provincia_id', provinciaId)
		.maybeSingle();
	if (error) {
		return {
			body: null,
			error: `No se pudo cargar el contenido de la provincia: ${error.message}`
		};
	}
	return { body: (data as { body: string } | null)?.body ?? null, error: null };
}
