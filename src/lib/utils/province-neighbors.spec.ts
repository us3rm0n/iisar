import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { neighborsOf, NEIGHBOR_MAP } from './province-neighbors';

function seededSlugs(): string[] {
	const sql = readFileSync(
		new URL('../../../supabase/migrations/20250831000005_provincias.sql', import.meta.url),
		'utf8'
	);
	const block = sql.slice(sql.indexOf('insert into public.provincias'));
	return [...block.matchAll(/^\s*\('([a-z-]+)',/gm)].map((match) => match[1]);
}

describe('province neighbours', () => {
	const seeded = seededSlugs();

	it('reads the 24 seeded slugs', () => {
		expect(seeded).toHaveLength(24);
	});

	it('has an entry for every seeded province and nothing else', () => {
		expect(Object.keys(NEIGHBOR_MAP).sort()).toEqual([...seeded].sort());
	});

	it('only references valid slugs, without self-neighbours or duplicates', () => {
		for (const [slug, neighbors] of Object.entries(NEIGHBOR_MAP)) {
			expect(neighbors, slug).not.toContain(slug);
			expect(new Set(neighbors).size, slug).toBe(neighbors.length);
			for (const neighbor of neighbors)
				expect(seeded, `${slug} -> ${neighbor}`).toContain(neighbor);
		}
	});

	it('is symmetric', () => {
		for (const [slug, neighbors] of Object.entries(NEIGHBOR_MAP)) {
			for (const neighbor of neighbors) {
				expect(NEIGHBOR_MAP[neighbor], `${neighbor} should list ${slug}`).toContain(slug);
			}
		}
	});

	it('gives every mainland province at least one neighbour', () => {
		for (const slug of seeded.filter((s) => s !== 'galapagos')) {
			expect(neighborsOf(slug).length, slug).toBeGreaterThan(0);
		}
	});

	it('matches well-known borders', () => {
		expect([...neighborsOf('esmeraldas')].sort()).toEqual(
			['carchi', 'imbabura', 'manabi', 'pichincha', 'santo-domingo-de-los-tsachilas'].sort()
		);
		expect(neighborsOf('santa-elena').sort()).toEqual(['guayas', 'manabi']);
		expect(neighborsOf('el-oro')).toContain('loja');
		expect(neighborsOf('zamora-chinchipe')).toContain('morona-santiago');
	});

	it('gives Galápagos no neighbours', () => {
		expect(neighborsOf('galapagos')).toEqual([]);
	});

	it('returns an empty list for an unknown slug', () => {
		expect(neighborsOf('atlantida')).toEqual([]);
		expect(neighborsOf('')).toEqual([]);
		expect(neighborsOf('constructor')).toEqual([]);
	});
});
