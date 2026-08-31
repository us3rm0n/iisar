import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Obtiene sesión actual y rol desde `profiles`.
 * Centraliza lógica antes duplicada en `(app)/+layout.svelte` y `dashboard`.
 */
export async function getCurrentUser(): Promise<User | null> {
	const { data } = await supabase.auth.getSession();
	return data.session?.user ?? null;
}

export async function getProfileRole(userId: string | null): Promise<string | null> {
	if (!userId) return null;
	const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
	return data?.role ?? null;
}

export function onAuthChange(callback: (user: User | null) => void) {
	const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
		callback(session?.user ?? null);
	});
	return () => sub.subscription.unsubscribe();
}
