import { describe, expect, it } from 'vitest';
import { PROVINCIAL_CAPITALS } from './capitals';
import { buildPlaceIndex, matchPlaces, normalizeText, resolvePlace } from './places';

const provincias = [
	{ slug: 'manabi', nombre: 'Manabí' },
	{ slug: 'loja', nombre: 'Loja' },
	{ slug: 'carchi', nombre: 'Carchi' },
	{ slug: 'sucumbios', nombre: 'Sucumbíos' },
	{ slug: 'esmeraldas', nombre: 'Esmeraldas' }
];
const capitals = [
	{ provinciaSlug: 'manabi', city: 'Portoviejo' },
	{ provinciaSlug: 'loja', city: 'Loja' },
	{ provinciaSlug: 'carchi', city: 'Tulcán' },
	{ provinciaSlug: 'sucumbios', city: 'Nueva Loja', aliases: ['Lago Agrio'] },
	{ provinciaSlug: 'esmeraldas', city: 'Esmeraldas' }
];

function index(businessCities: { ciudad: string; provinciaSlug: string | null }[] = []) {
	return buildPlaceIndex({ provincias, capitals, businessCities });
}

describe('normalizeText', () => {
	it('lowercases and strips diacritics', () => {
		expect(normalizeText('Tulcán')).toBe('tulcan');
		expect(normalizeText('MANABÍ')).toBe('manabi');
		expect(normalizeText('Cañar')).toBe('canar');
	});

	it('turns punctuation into spaces and collapses whitespace', () => {
		expect(normalizeText('  Santo-Domingo,  de   los. Tsáchilas ')).toBe(
			'santo domingo de los tsachilas'
		);
		expect(normalizeText('   ')).toBe('');
	});
});

describe('buildPlaceIndex', () => {
	it('emits one province per province, in the given order, first', () => {
		const places = index();
		expect(places.slice(0, 5).map((p) => p.name)).toEqual([
			'Manabí',
			'Loja',
			'Carchi',
			'Sucumbíos',
			'Esmeraldas'
		]);
		expect(places.slice(0, 5).every((p) => p.kind === 'provincia')).toBe(true);
		expect(places[0]).toEqual({
			kind: 'provincia',
			name: 'Manabí',
			provinciaSlug: 'manabi',
			provinciaNombre: 'Manabí'
		});
	});

	it('attaches capitals and aliases to their province', () => {
		const places = index();
		expect(places.find((p) => p.name === 'Tulcán')).toEqual({
			kind: 'ciudad',
			name: 'Tulcán',
			provinciaSlug: 'carchi',
			provinciaNombre: 'Carchi'
		});
		expect(places.find((p) => p.name === 'Lago Agrio')?.provinciaSlug).toBe('sucumbios');
		expect(places.find((p) => p.name === 'Nueva Loja')?.provinciaNombre).toBe('Sucumbíos');
	});

	it('keeps only the province when a city has the same name', () => {
		const places = index([{ ciudad: 'loja', provinciaSlug: 'loja' }]);
		expect(places.filter((p) => normalizeText(p.name) === 'loja')).toHaveLength(1);
		expect(places.find((p) => p.name === 'Loja')?.kind).toBe('provincia');
		expect(places.find((p) => p.name === 'Esmeraldas')?.kind).toBe('provincia');
	});

	it('adds business cities, with null province when unknown', () => {
		const places = index([
			{ ciudad: 'Manta', provinciaSlug: 'manabi' },
			{ ciudad: 'Cuenca', provinciaSlug: null }
		]);
		expect(places.find((p) => p.name === 'Manta')).toEqual({
			kind: 'ciudad',
			name: 'Manta',
			provinciaSlug: 'manabi',
			provinciaNombre: 'Manabí'
		});
		expect(places.find((p) => p.name === 'Cuenca')).toEqual({
			kind: 'ciudad',
			name: 'Cuenca',
			provinciaSlug: null,
			provinciaNombre: null
		});
	});

	it('treats a business city with an unknown province slug as null', () => {
		const places = index([{ ciudad: 'Manta', provinciaSlug: 'nope' }]);
		expect(places.find((p) => p.name === 'Manta')?.provinciaSlug).toBeNull();
	});

	it('dedupes business cities by normalized name keeping the first spelling', () => {
		const places = index([
			{ ciudad: 'Tulcán', provinciaSlug: 'carchi' },
			{ ciudad: 'Quevedo', provinciaSlug: null },
			{ ciudad: 'QUEVEDO', provinciaSlug: null },
			{ ciudad: 'quevedo ', provinciaSlug: null }
		]);
		expect(places.filter((p) => normalizeText(p.name) === 'tulcan')).toHaveLength(1);
		expect(places.filter((p) => normalizeText(p.name) === 'quevedo')).toEqual([
			{ kind: 'ciudad', name: 'Quevedo', provinciaSlug: null, provinciaNombre: null }
		]);
	});

	it('ignores blank cities', () => {
		const places = index([
			{ ciudad: '', provinciaSlug: null },
			{ ciudad: '   ', provinciaSlug: 'manabi' }
		]);
		expect(places.every((p) => p.name.trim() !== '')).toBe(true);
		expect(places).toHaveLength(index().length);
	});

	it('sorts cities by normalized name after the provinces, deterministically', () => {
		const input = [
			{ ciudad: 'Zaruma', provinciaSlug: null },
			{ ciudad: 'Ámbato', provinciaSlug: null },
			{ ciudad: 'Babahoyo', provinciaSlug: null }
		];
		const a = index(input);
		const b = index([...input].reverse());
		expect(a).toEqual(b);
		const cities = a.filter((p) => p.kind === 'ciudad').map((p) => normalizeText(p.name));
		expect(cities).toEqual([...cities].sort());
		expect(a.findIndex((p) => p.kind === 'ciudad')).toBe(5);
	});

	it('builds a full index from the real capitals', () => {
		const real = buildPlaceIndex({
			provincias: PROVINCIAL_CAPITALS.map((c) => ({
				slug: c.provinciaSlug,
				nombre: c.provinciaSlug
			})),
			capitals: PROVINCIAL_CAPITALS,
			businessCities: []
		});
		expect(real.filter((p) => p.kind === 'provincia')).toHaveLength(24);
	});
});

describe('matchPlaces', () => {
	const places = index([
		{ ciudad: 'Manta', provinciaSlug: 'manabi' },
		{ ciudad: 'Montecristi', provinciaSlug: 'manabi' },
		{ ciudad: 'Santa Ana de Manabí', provinciaSlug: 'manabi' }
	]);

	it('returns nothing for queries shorter than 2 normalized chars', () => {
		expect(matchPlaces(places, '')).toEqual([]);
		expect(matchPlaces(places, 'm')).toEqual([]);
		expect(matchPlaces(places, ' m ')).toEqual([]);
		expect(matchPlaces(places, '..')).toEqual([]);
	});

	it('is case and diacritic insensitive', () => {
		expect(matchPlaces(places, 'MANABI')[0].name).toBe('Manabí');
		expect(matchPlaces(places, 'tulcan')[0].name).toBe('Tulcán');
		expect(matchPlaces(places, 'sucumbios')[0].name).toBe('Sucumbíos');
	});

	it('matches aliases', () => {
		expect(matchPlaces(places, 'lago')[0].name).toBe('Lago Agrio');
	});

	it('ranks exact, then prefix, then word prefix, then contains', () => {
		const ranked = buildPlaceIndex({
			provincias: [],
			capitals: [],
			businessCities: [
				{ ciudad: 'Casa Mar', provinciaSlug: null },
				{ ciudad: 'Marcabelí', provinciaSlug: null },
				{ ciudad: 'Mar', provinciaSlug: null },
				{ ciudad: 'Armar', provinciaSlug: null }
			]
		});
		expect(matchPlaces(ranked, 'mar').map((p) => p.name)).toEqual([
			'Mar',
			'Marcabelí',
			'Casa Mar',
			'Armar'
		]);
	});

	it('breaks ties with provinces first, then alphabetically', () => {
		const tied = buildPlaceIndex({
			provincias: [{ slug: 'x', nombre: 'Manx' }],
			capitals: [],
			businessCities: [
				{ ciudad: 'Manb', provinciaSlug: null },
				{ ciudad: 'Mana', provinciaSlug: null }
			]
		});
		expect(matchPlaces(tied, 'man').map((p) => p.name)).toEqual(['Manx', 'Mana', 'Manb']);
	});

	it('respects the limit and the default of 6', () => {
		const many = buildPlaceIndex({
			provincias: [],
			capitals: [],
			businessCities: Array.from({ length: 10 }, (_, i) => ({
				ciudad: `Villa ${i}`,
				provinciaSlug: null
			}))
		});
		expect(matchPlaces(many, 'vi')).toHaveLength(6);
		expect(matchPlaces(many, 'vi', 3)).toHaveLength(3);
	});

	it('is stable across calls', () => {
		expect(matchPlaces(places, 'ma')).toEqual(matchPlaces(places, 'ma'));
	});
});

describe('resolvePlace', () => {
	const places = index([{ ciudad: 'Manta', provinciaSlug: 'manabi' }]);

	it('resolves an exact normalized match', () => {
		expect(resolvePlace(places, ' MANABÍ ')?.provinciaSlug).toBe('manabi');
		expect(resolvePlace(places, 'manta')?.kind).toBe('ciudad');
		expect(resolvePlace(places, 'lago agrio')?.name).toBe('Lago Agrio');
	});

	it('prefers the province over a city with the same name', () => {
		expect(resolvePlace(places, 'loja')?.kind).toBe('provincia');
	});

	it('returns null for partial or unknown queries', () => {
		expect(resolvePlace(places, 'mant')).toBeNull();
		expect(resolvePlace(places, 'nowhere')).toBeNull();
		expect(resolvePlace(places, '')).toBeNull();
	});
});
