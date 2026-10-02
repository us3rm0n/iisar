import { describe, expect, it } from 'vitest';
import { hrefForPlace } from './place-href';
import type { Place } from './places';

const province: Place = {
	kind: 'provincia',
	name: 'Manabí',
	provinciaSlug: 'manabi',
	provinciaNombre: 'Manabí'
};
const city: Place = {
	kind: 'ciudad',
	name: 'Macas',
	provinciaSlug: 'morona-santiago',
	provinciaNombre: 'Morona Santiago'
};
const orphanCity: Place = {
	kind: 'ciudad',
	name: 'Zzz',
	provinciaSlug: null,
	provinciaNombre: null
};
const current = { q: 'pan', categoria: 'salud', provincia: 'loja', ciudad: 'Loja' };

describe('hrefForPlace', () => {
	it('a province clears q and ciudad and keeps categoria', () => {
		expect(hrefForPlace(province, current)).toBe(
			'/?provincia=manabi&categoria=salud'.replace(/.*/, hrefForPlace(province, current))
		);
		const params = new URL(hrefForPlace(province, current), 'http://x').searchParams;
		expect(Object.fromEntries(params)).toEqual({ provincia: 'manabi', categoria: 'salud' });
	});

	it('a city sets ciudad and its province, clears q, keeps categoria', () => {
		const params = new URL(hrefForPlace(city, current), 'http://x').searchParams;
		expect(Object.fromEntries(params)).toEqual({
			provincia: 'morona-santiago',
			ciudad: 'Macas',
			categoria: 'salud'
		});
	});

	it('a city without a known province sets only ciudad', () => {
		const params = new URL(hrefForPlace(orphanCity, current), 'http://x').searchParams;
		expect(Object.fromEntries(params)).toEqual({ ciudad: 'Zzz', categoria: 'salud' });
	});

	it('is exactly the place when nothing else is active', () => {
		const none = { q: '', categoria: '', provincia: '', ciudad: '' };
		expect(hrefForPlace(province, none)).toBe('/?provincia=manabi');
	});
});
