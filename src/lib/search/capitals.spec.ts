import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROVINCIAL_CAPITALS } from './capitals';

function seededSlugs(): string[] {
	const sql = readFileSync(
		new URL('../../../supabase/migrations/20250831000005_provincias.sql', import.meta.url),
		'utf8'
	);
	const block = sql.slice(sql.indexOf('insert into public.provincias'));
	return [...block.matchAll(/^\s*\('([a-z-]+)',/gm)].map((match) => match[1]);
}

describe('PROVINCIAL_CAPITALS', () => {
	it('has exactly 24 entries with unique slugs', () => {
		expect(PROVINCIAL_CAPITALS).toHaveLength(24);
		expect(new Set(PROVINCIAL_CAPITALS.map((c) => c.provinciaSlug)).size).toBe(24);
	});

	it('covers exactly the seeded province slugs', () => {
		const seeded = seededSlugs();
		expect(seeded).toHaveLength(24);
		expect(new Set(PROVINCIAL_CAPITALS.map((c) => c.provinciaSlug))).toEqual(new Set(seeded));
	});

	it('has a non-blank city for every province', () => {
		for (const capital of PROVINCIAL_CAPITALS) expect(capital.city.trim()).not.toBe('');
	});

	it('keeps the well-known aliases', () => {
		const sucumbios = PROVINCIAL_CAPITALS.find((c) => c.provinciaSlug === 'sucumbios');
		expect(sucumbios?.city).toBe('Nueva Loja');
		expect(sucumbios?.aliases).toContain('Lago Agrio');
	});
});
