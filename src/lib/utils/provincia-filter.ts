/**
 * Resolves the `provincia` search param against the loaded list of provincias.
 *
 * Pure: does not touch Supabase. An empty slug means "no filter requested".
 * A non-empty slug that matches nothing sets `notFound` so the caller can
 * surface a notice instead of silently returning every business.
 */
export function resolveProvinciaFilter(
	provincias: { id: string; slug: string }[],
	slug: string
): { provinciaId: string | null; notFound: boolean } {
	if (!slug) return { provinciaId: null, notFound: false };

	const match = provincias.find((p) => p.slug === slug);
	if (!match) return { provinciaId: null, notFound: true };

	return { provinciaId: match.id, notFound: false };
}
