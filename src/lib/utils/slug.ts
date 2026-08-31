/**
 * Convierte texto a slug URL-safe (lowercase, sin tildes, separados por -).
 * Límite 40 chars para `businesses.slug` (unique index).
 */
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 40);
}
