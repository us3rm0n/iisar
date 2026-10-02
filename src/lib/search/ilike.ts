/**
 * Makes user text safe to embed in a PostgREST `.or()` / `ilike` filter value.
 * Removes the characters of the filter grammar (`,` `(` `)` and `\`), escapes the
 * LIKE wildcards `%` and `_`, collapses whitespace and trims. Returns `''` when
 * nothing useful is left; callers skip the filter then.
 */
export function toIlikePattern(raw: string): string {
	const cleaned = raw
		.replace(/[,()\\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (!/[\p{L}\p{N}%_]/u.test(cleaned)) return '';
	return cleaned.replace(/[%_]/g, '\\$&');
}
