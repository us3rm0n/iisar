import { supabase } from '$lib/supabase';
import type { Business, Provincia, Subscription } from '$lib/types';

export type Category = { id: string; nombre: string; slug: string };

const BUSINESS_COLUMNS =
	'id,nombre,slug,tipo,ciudad,estado,primary_color,vision,mision,category_id,categories(nombre),provincia_id,provincias(nombre,slug)';

export async function fetchCategories(): Promise<Category[]> {
	const { data } = await supabase
		.from('categories')
		.select('id,nombre,slug')
		.eq('activo', true)
		.order('nombre');
	return data ?? [];
}

export async function fetchProvincias(): Promise<{
	provincias: Provincia[];
	error: string | null;
}> {
	const { data, error } = await supabase
		.from('provincias')
		.select('id,slug,nombre,region,orden')
		.order('orden');
	return {
		provincias: error ? [] : ((data as Provincia[]) ?? []),
		error: error ? `No se pudieron cargar las provincias: ${error.message}` : null
	};
}

export async function fetchBusinesses(ownerId: string): Promise<Business[]> {
	const { data } = await supabase
		.from('businesses')
		.select(BUSINESS_COLUMNS)
		.eq('owner_id', ownerId)
		.order('created_at');
	return (data as unknown as Business[]) ?? [];
}

/** Latest subscription per business, keyed by business id. Businesses without one are omitted. */
export async function fetchLatestSubscriptions(
	businesses: Business[]
): Promise<Record<string, Subscription>> {
	const rows = await Promise.all(
		businesses.map(async ({ id }) => {
			const { data } = await supabase
				.from('subscriptions')
				.select('id,type,status,fecha_vencimiento,fecha_maxima,total')
				.eq('business_id', id)
				.order('fecha_maxima', { ascending: false })
				.limit(1)
				.maybeSingle();
			return [id, data as Subscription | null] as const;
		})
	);
	return Object.fromEntries(rows.filter((row): row is [string, Subscription] => row[1] !== null));
}

export async function insertBusiness(payload: object): Promise<{ id: string; slug: string }> {
	const { data, error } = await supabase
		.from('businesses')
		.insert(payload)
		.select('id,slug')
		.single();
	if (error) throw new Error(error.message);
	return data as { id: string; slug: string };
}

export async function insertTrialSubscription(businessId: string): Promise<void> {
	const { error } = await supabase.from('subscriptions').insert({
		business_id: businessId,
		type: 'prueba',
		total: 0,
		medio_pago: 'trial',
		status: 'aprobada'
	});
	if (error) throw new Error(`Negocio creado pero trial falló: ${error.message}`);
}

/** Returns the error message, or null when the update succeeded. */
export async function setBusinessProvincia(
	businessId: string,
	provinciaId: string | null
): Promise<string | null> {
	const { error } = await supabase
		.from('businesses')
		.update({ provincia_id: provinciaId })
		.eq('id', businessId);
	return error?.message ?? null;
}

export async function signOut(): Promise<void> {
	await supabase.auth.signOut();
}
