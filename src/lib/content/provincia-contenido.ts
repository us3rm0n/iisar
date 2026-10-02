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

const PERMISSION_ERROR = 'No tenés permiso para editar este contenido.';
const GENERIC_SAVE_ERROR = 'No se pudo guardar el contenido. Intentá de nuevo en unos minutos.';

/**
 * Saves the article (upsert by province). RLS is the real permission: a non-webmaster `update`
 * affects 0 rows WITHOUT an error, so a missing returned row is also a permission failure.
 * `updated_by` is set by a DB trigger and is never sent.
 */
export async function saveProvinceBody(
	client: SupabaseClient,
	provinciaId: string,
	body: string
): Promise<{ error: string | null }> {
	const { data, error } = await client
		.from('provincia_contenido')
		.upsert({ provincia_id: provinciaId, body }, { onConflict: 'provincia_id' })
		.select('body')
		.maybeSingle();
	if (error) {
		if (error.code === '42501' || /row-level security/i.test(error.message)) {
			return { error: PERMISSION_ERROR };
		}
		console.error('Failed to save province content', error);
		return { error: GENERIC_SAVE_ERROR };
	}
	if (data == null) return { error: PERMISSION_ERROR };
	return { error: null };
}
