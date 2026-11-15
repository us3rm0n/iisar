import { describe, expect, it } from 'vitest';
import { buildSitemap } from './sitemap';

describe('buildSitemap', () => {
	it('joins origin and path, with lastmod as a date', () => {
		const xml = buildSitemap('https://iisar.com/', [
			{ path: '/' },
			{ path: '/ecuador/azuay', lastmod: '2026-10-03T12:34:56Z' }
		]);
		expect(xml).toContain('<url><loc>https://iisar.com/</loc></url>');
		expect(xml).toContain(
			'<url><loc>https://iisar.com/ecuador/azuay</loc><lastmod>2026-10-03</lastmod></url>'
		);
		expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
	});

	it('escapes XML and drops invalid dates', () => {
		const xml = buildSitemap('https://iisar.com', [{ path: '/negocio/a&b', lastmod: 'nope' }]);
		expect(xml).toContain('<loc>https://iisar.com/negocio/a&amp;b</loc></url>');
		expect(xml).not.toContain('<lastmod>');
	});

	it('keeps the first of duplicate paths', () => {
		const xml = buildSitemap('https://iisar.com', [
			{ path: '/ecuador', lastmod: '2026-01-01' },
			{ path: '/ecuador', lastmod: '2026-02-02' }
		]);
		expect(xml.match(/<url>/g)).toHaveLength(1);
		expect(xml).toContain('2026-01-01');
	});
});
