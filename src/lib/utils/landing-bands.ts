import type { BusinessStat } from '$lib/types';

/** Cuántas métricas caben en la banda de estadísticas sin saturarla. */
export const STAT_BAND_LIMIT = 4;

/** Grilla de los diferenciadores: 1 columna en móvil, 2 en tablet, 3 en desktop. */
export const HIGHLIGHT_COLUMNS = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

/** "01", "02", ... "10" — el formato de índice con cero a la izquierda del diseño. */
export function padOrdinal(n: number): string {
	return n > 0 && n < 10 ? `0${n}` : String(n);
}

/**
 * Métricas listas para renderizar: ordenadas por `orden`, sin entradas a medio
 * cargar y recortadas a la banda. Puro — la vista solo itera el resultado.
 *
 * Se descartan las entradas con `valor` o `etiqueta` en blanco para que la banda
 * no muestre una celda a medio llenar cuando el dato está a medio cargar.
 */
export function statCells(stats: BusinessStat[]): BusinessStat[] {
	return stats
		.filter((s) => s.valor.trim() && s.etiqueta.trim())
		.sort((a, b) => a.orden - b.orden)
		.slice(0, STAT_BAND_LIMIT);
}
