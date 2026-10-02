import { describe, expect, it } from 'vitest';
import { buildSearchHref, hasActiveFilters, parseFilters } from './filters';

describe('parseFilters', () => {
	it('returns empty strings when nothing is set', () => {
		expect(parseFilters(new URLSearchParams())).toEqual({ q: '', categoria: '', provincia: '' });
	});

	it('trims values and ignores unrelated params', () => {
		const params = new URLSearchParams('q=%20pizza%20&categoria=salud&provincia=%20&x=1');
		expect(parseFilters(params)).toEqual({ q: 'pizza', categoria: 'salud', provincia: '' });
	});
});

describe('hasActiveFilters', () => {
	it('is false when every filter is empty', () => {
		expect(hasActiveFilters({ q: '', categoria: '', provincia: '' })).toBe(false);
	});

	it.each([
		[{ q: 'a', categoria: '', provincia: '' }],
		[{ q: '', categoria: 'salud', provincia: '' }],
		[{ q: '', categoria: '', provincia: 'guayas' }]
	])('is true when any filter is set (%j)', (filters) => {
		expect(hasActiveFilters(filters)).toBe(true);
	});
});

describe('buildSearchHref', () => {
	it('returns the home path when nothing is active', () => {
		expect(buildSearchHref({ q: '', categoria: '', provincia: '' })).toBe('/');
		expect(buildSearchHref({ q: '  ', categoria: '', provincia: '' })).toBe('/');
	});

	it('includes only non-empty params in a stable order', () => {
		expect(buildSearchHref({ provincia: 'guayas', categoria: '', q: 'pizza' })).toBe(
			'/?q=pizza&provincia=guayas'
		);
		expect(buildSearchHref({ q: 'a', categoria: 'salud', provincia: 'loja' })).toBe(
			'/?q=a&categoria=salud&provincia=loja'
		);
	});

	it('url-encodes values and trims them', () => {
		expect(buildSearchHref({ q: ' café & té ', categoria: '', provincia: '' })).toBe(
			'/?q=caf%C3%A9+%26+t%C3%A9'
		);
	});
});
