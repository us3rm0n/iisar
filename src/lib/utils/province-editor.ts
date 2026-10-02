/**
 * Maximum article length in characters. Single source of truth for the UI; it mirrors the
 * `check (char_length(body) <= 20000)` constraint on `provincia_contenido`
 * (migration `20251002000001_provincia_contenido.sql`). Change both together.
 */
export const PROVINCE_BODY_MAX = 20000;

/** Convenience only: the real permission is RLS (`is_webmaster()`) on `provincia_contenido`. */
export function canEditProvince(role: string | null): boolean {
	return role === 'webmaster';
}

/**
 * Canonical form of a body: LF line endings, no trailing run of blank lines and exactly one final
 * newline. Internal content is never trimmed. A whitespace-only body becomes `''`.
 */
export function normalizeBody(raw: string): string {
	const lf = raw.replace(/\r\n?/g, '\n');
	if (lf.trim() === '') return '';
	return lf.replace(/(\n[ \t]*)+$/, '') + '\n';
}

export type BodyValidation = { ok: true } | { ok: false; error: string };

/**
 * Validates the body that would be stored (the normalised one). An empty body is ALLOWED: it is
 * how an article is cleared; the UI must ask for an explicit confirmation before saving it.
 */
export function validateBody(body: string): BodyValidation {
	const length = normalizeBody(body).length;
	if (length > PROVINCE_BODY_MAX) {
		return {
			ok: false,
			error: `El contenido es demasiado largo: ${length} de ${PROVINCE_BODY_MAX} caracteres como máximo.`
		};
	}
	return { ok: true };
}

/** True when the draft differs from the original once both are normalised. */
export function isDirty(original: string, draft: string): boolean {
	return normalizeBody(original) !== normalizeBody(draft);
}
