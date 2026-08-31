import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Cliente anónimo para SSR (RLS respeta anon/authenticated).
 * Evita duplicar `createClient` en cada `+page.server.ts`.
 */
export function getAnonSupabase() {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
