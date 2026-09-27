import { describe, it, expect } from 'vitest';
import { resolveProvinciaFilter } from './provincia-filter';

const PROVINCIAS = [
	{ id: 'p-azuay', slug: 'azuay' },
	{ id: 'p-guayas', slug: 'guayas' }
];

describe('resolveProvinciaFilter', () => {
	it('returns no filter and not-found=false when slug is empty', () => {
		expect(resolveProvinciaFilter(PROVINCIAS, '')).toEqual({
			provinciaId: null,
			notFound: false
		});
	});

	it('resolves the provincia id when the slug matches', () => {
		expect(resolveProvinciaFilter(PROVINCIAS, 'azuay')).toEqual({
			provinciaId: 'p-azuay',
			notFound: false
		});
	});

	it('flags not-found and returns no id when the slug matches no provincia', () => {
		expect(resolveProvinciaFilter(PROVINCIAS, 'no-existe')).toEqual({
			provinciaId: null,
			notFound: true
		});
	});
});
