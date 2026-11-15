import { site } from '$lib/site';
import type { RequestHandler } from './$types';

/** `/robots.txt`: private areas stay out of the index; the sitemap URL follows `site.origin`. */
export const GET: RequestHandler = () => {
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /dashboard',
		'Disallow: /auth/',
		'',
		`Sitemap: ${site.origin}/sitemap.xml`,
		''
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
