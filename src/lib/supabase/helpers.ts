import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Cliente anónimo para SSR (RLS respeta anon/authenticated).
 * Evita duplicar `createClient` en cada `+page.server.ts`.
 */
export function getAnonSupabase() {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Normaliza una relación embebida por PostgREST. Según la relación, la devuelve
 * como objeto o como arreglo de un elemento; sin esto cada página repetía el
 * mismo `Array.isArray(...) ? [0] : ...` con casts a `any`.
 */
export function firstRelation<T>(relation: T | T[] | null | undefined): T | null {
	if (Array.isArray(relation)) return relation[0] ?? null;
	return relation ?? null;
}

