/** Por qué un filtro de provincia no se pudo aplicar. `null` = se aplicó o no se pidió. */
export type ProvinciaFilterProblem = 'not-found' | 'lookup-failed';

export type ProvinciaFilter = {
	/** Id por el que filtrar, o `null` si no se puede filtrar. */
	provinciaId: string | null;
	problem: ProvinciaFilterProblem | null;
};

const NO_FILTER: ProvinciaFilter = { provinciaId: null, problem: null };

/**
 * Resuelve el search param `provincia` contra las provincias ya cargadas.
 *
 * Puro: no toca Supabase. Decide en un solo lugar si el filtro es aplicable y,
 * cuando no lo es, por qué — para que la página avise en vez de fingir que no
 * hay filtro y listar todo. Un slug vacío significa "no se pidió filtro".
 *
 * @param lookupFailed la consulta de provincias falló, así que no se puede
 *   saber si el slug existe. Un fallo no debe romper la página: solo impide
 *   resolver el filtro.
 */
export function resolveProvinciaFilter(
	provincias: { id: string; slug: string }[],
	slug: string,
	lookupFailed = false
): ProvinciaFilter {
	if (!slug) return NO_FILTER;
	if (lookupFailed) return { provinciaId: null, problem: 'lookup-failed' };

	const match = provincias.find((p) => p.slug === slug);
	if (!match) return { provinciaId: null, problem: 'not-found' };

	return { provinciaId: match.id, problem: null };
}
