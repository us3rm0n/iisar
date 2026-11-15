/** One `<url>` of the sitemap. `path` is site-relative (`/ecuador/azuay`). */
export type SitemapEntry = {
	path: string;
	/** Last modification, any value `Date` parses. Omitted when missing or invalid. */
	lastmod?: string | null;
};

/** Public pages with fixed paths. Private ones (`/admin`, `/dashboard`, `/auth/*`) never go here. */
export const STATIC_PATHS = [
	'/',
	'/ecuador',
	'/nosotros',
	'/contacto',
	'/privacidad',
	'/terminos'
] as const;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/** `YYYY-MM-DD`, the W3C date format sitemaps accept, or `null` for a missing or bad date. */
function toLastmod(value: string | null | undefined): string | null {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/** Builds the sitemap XML. Duplicate paths keep the first entry. */
export function buildSitemap(origin: string, entries: SitemapEntry[]): string {
	const base = origin.replace(/\/+$/, '');
	const seen = new Set<string>();
	const urls: string[] = [];

	for (const entry of entries) {
		if (seen.has(entry.path)) continue;
		seen.add(entry.path);
		const loc = `<loc>${escapeXml(base + entry.path)}</loc>`;
		const lastmod = toLastmod(entry.lastmod);
		urls.push(`\t<url>${loc}${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`);
	}

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}
