import { describe, expect, it } from 'vitest';
import { buildSearchHref, hasActiveFilters, parseFilters } from './filters';

describe('parseFilters', () => {
	it('returns empty strings when nothing is set', () => {
		expect(parseFilters(new URLSearchParams())).toEqual({
			q: '',
			categoria: '',
			provincia: '',
			ciudad: ''
		});
	});

	it('reads ciudad trimmed', () => {
		expect(parseFilters(new URLSearchParams('ciudad=%20Macas%20')).ciudad).toBe('Macas');
	});

	it('trims values and ignores unrelated params', () => {
		const params = new URLSearchParams('q=%20pizza%20&categoria=salud&provincia=%20&x=1');
		expect(parseFilters(params)).toEqual({
			q: 'pizza',
			categoria: 'salud',
			provincia: '',
			ciudad: ''
		});
	});
});

describe('hasActiveFilters', () => {
	it('is false when every filter is empty', () => {
		expect(hasActiveFilters({ q: '', categoria: '', provincia: '', ciudad: '' })).toBe(false);
	});

	it.each([
		[{ q: 'a', categoria: '', provincia: '', ciudad: '' }],
		[{ q: '', categoria: 'salud', provincia: '', ciudad: '' }],
		[{ q: '', categoria: '', provincia: 'guayas', ciudad: '' }],
		[{ q: '', categoria: '', provincia: '', ciudad: 'Macas' }]
	])('is true when any filter is set (%j)', (filters) => {
		expect(hasActiveFilters(filters)).toBe(true);
	});
});

describe('buildSearchHref', () => {
	it('returns the home path when nothing is active', () => {
		expect(buildSearchHref({ q: '', categoria: '', provincia: '', ciudad: '' })).toBe('/');
		expect(buildSearchHref({ q: '  ', categoria: '', provincia: '', ciudad: '' })).toBe('/');
	});

	it('includes only non-empty params in a stable order', () => {
		expect(buildSearchHref({ provincia: 'guayas', categoria: '', q: 'pizza', ciudad: '' })).toBe(
			'/?q=pizza&provincia=guayas'
		);
		expect(buildSearchHref({ q: 'a', categoria: 'salud', provincia: 'loja', ciudad: '' })).toBe(
			'/?q=a&categoria=salud&provincia=loja'
		);
	});

	it('url-encodes values and trims them', () => {
		expect(buildSearchHref({ q: ' café & té ', categoria: '', provincia: '', ciudad: '' })).toBe(
			'/?q=caf%C3%A9+%26+t%C3%A9'
		);
	});

	it('emits ciudad after the other params, encoded and skipping empties', () => {
		expect(
			buildSearchHref({ q: 'a', categoria: 'salud', provincia: 'loja', ciudad: 'Santo Domingo' })
		).toBe('/?q=a&categoria=salud&provincia=loja&ciudad=Santo+Domingo');
		expect(buildSearchHref({ q: '', categoria: '', provincia: '', ciudad: 'Macas' })).toBe(
			'/?ciudad=Macas'
		);
		expect(
			buildSearchHref({ q: '', categoria: '', provincia: 'morona-santiago', ciudad: 'Macas' })
		).toBe('/?provincia=morona-santiago&ciudad=Macas');
	});
});
