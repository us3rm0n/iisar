/**
 * Días restantes hasta fecha_maxima (gracia de suscripción).
 * Positivo = vigente, 0/- = vencida.
 */
export function daysLeft(fechaMaxima: string | Date): number {
	const diff = new Date(fechaMaxima).getTime() - Date.now();
	return Math.ceil(diff / 86_400_000);
}

export function formatDateShort(date: string | Date): string {
	return new Date(date).toLocaleDateString('es-EC', { year: 'numeric', month: 'short', day: 'numeric' });
}
