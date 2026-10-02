import { describe, expect, it } from 'vitest';
import { canonicalizePlaceQuery } from './intent';
import { buildPlaceIndex } from './places';

const index = buildPlaceIndex({
	provincias: [
		{ slug: 'manabi', nombre: 'Manabí' },
		{ slug: 'morona-santiago', nombre: 'Morona Santiago' }
	],
	capitals: [{ provinciaSlug: 'manabi', city: 'Portoviejo' }],
	businessCities: [
		{ ciudad: 'Macas', provinciaSlug: 'morona-santiago' },
		{ ciudad: 'Quevedo', provinciaSlug: null }
	]
});
const base = { q: '', categoria: '', provincia: '', ciudad: '' };

describe('canonicalizePlaceQuery', () => {
	it('turns a province name into the province filter and clears q', () => {
		expect(canonicalizePlaceQuery({ ...base, q: 'Manabí' }, index)).toEqual({
			...base,
			provincia: 'manabi'
		});
	});

	it('ignores case and accents and keeps the category', () => {
		expect(canonicalizePlaceQuery({ ...base, q: 'MANABI', categoria: 'salud' }, index)).toEqual({
			...base,
			categoria: 'salud',
			provincia: 'manabi'
		});
	});

	it('turns a city into ciudad plus its province', () => {
		expect(canonicalizePlaceQuery({ ...base, q: 'macas' }, index)).toEqual({
			...base,
			ciudad: 'Macas',
			provincia: 'morona-santiago'
		});
	});

	it('leaves provincia empty for a city without province', () => {
		expect(canonicalizePlaceQuery({ ...base, q: 'Quevedo' }, index)).toEqual({
			...base,
			ciudad: 'Quevedo'
		});
	});

	it('returns null for a partial name or an unknown text', () => {
		expect(canonicalizePlaceQuery({ ...base, q: 'mana' }, index)).toBeNull();
		expect(canonicalizePlaceQuery({ ...base, q: 'zzzz' }, index)).toBeNull();
		expect(canonicalizePlaceQuery(base, index)).toBeNull();
	});

	it('returns null when a place filter is already set', () => {
		expect(canonicalizePlaceQuery({ ...base, q: 'Manabí', provincia: 'loja' }, index)).toBeNull();
		expect(canonicalizePlaceQuery({ ...base, q: 'Manabí', ciudad: 'Macas' }, index)).toBeNull();
	});
});
