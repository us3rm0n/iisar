import { describe, it, expect } from 'vitest';
import { resolveProvinciaFilter } from './provincia-filter';

const PROVINCIAS = [
	{ id: 'p-azuay', slug: 'azuay' },
	{ id: 'p-guayas', slug: 'guayas' }
];

const RESOLVED = { provinciaId: 'p-azuay', problem: null };

describe('resolveProvinciaFilter', () => {
	it('applies no filter when slug is empty', () => {
		expect(resolveProvinciaFilter(PROVINCIAS, '')).toEqual({
			provinciaId: null,
			problem: null
		});
	});

	it('resolves the provincia id when the slug matches', () => {
		expect(resolveProvinciaFilter(PROVINCIAS, 'azuay')).toEqual(RESOLVED);
	});

	it('reports not-found when the slug matches no provincia', () => {
		expect(resolveProvinciaFilter(PROVINCIAS, 'no-existe')).toEqual({
			provinciaId: null,
			problem: 'not-found'
		});
	});

	it('reports not-found even for an empty provincia list', () => {
		expect(resolveProvinciaFilter([], 'azuay')).toEqual({
			provinciaId: null,
			problem: 'not-found'
		});
	});

	describe('when the provincias lookup failed', () => {
		it('reports lookup-failed instead of claiming the slug does not exist', () => {
			expect(resolveProvinciaFilter([], 'azuay', true)).toEqual({
				provinciaId: null,
				problem: 'lookup-failed'
			});
		});

		it('stays quiet when no filter was requested: the page can still list businesses', () => {
			expect(resolveProvinciaFilter([], '', true)).toEqual({
				provinciaId: null,
				problem: null
			});
		});
	});
});
