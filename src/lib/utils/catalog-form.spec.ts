import { describe, expect, it } from 'vitest';
import type { ProductService } from '$lib/types';
import {
	allowedCatalogTipos,
	buildCatalogPayload,
	emptyCatalogForm,
	formatCatalogPrice,
	itemToCatalogForm,
	parseCatalogPrice,
	validateCatalogForm
} from './catalog-form';

const filled = () => ({ ...emptyCatalogForm('negocio'), nombre: 'Almuerzo' });

describe('allowedCatalogTipos', () => {
	it('offers products and services to negocio and lugar', () => {
		expect(allowedCatalogTipos('negocio')).toEqual(['producto', 'servicio']);
		expect(allowedCatalogTipos('lugar')).toEqual(['producto', 'servicio']);
	});

	it('offers only services to artista', () => {
		expect(allowedCatalogTipos('artista')).toEqual(['servicio']);
	});
});

describe('emptyCatalogForm', () => {
	it('defaults to the first allowed tipo, USD and blank fields', () => {
		expect(emptyCatalogForm('negocio')).toEqual({
			tipo: 'producto',
			nombre: '',
			descripcion: '',
			precio: '',
			moneda: 'USD',
			imagenUrl: '',
			orden: ''
		});
	});

	it('starts artista on servicio', () => {
		expect(emptyCatalogForm('artista').tipo).toBe('servicio');
	});
});

describe('itemToCatalogForm', () => {
	it('prefills strings from a stored item', () => {
		const item: ProductService = {
			id: 'p1',
			tipo: 'servicio',
			nombre: 'Show',
			descripcion: null,
			precio_estimado: 12.5,
			moneda: 'USD',
			imagen_url: null,
			orden: 3
		};
		expect(itemToCatalogForm(item)).toEqual({
			tipo: 'servicio',
			nombre: 'Show',
			descripcion: '',
			precio: '12.5',
			moneda: 'USD',
			imagenUrl: '',
			orden: '3'
		});
	});

	it('leaves price and orden blank when absent', () => {
		const form = itemToCatalogForm({
			id: 'p1',
			tipo: 'producto',
			nombre: 'X',
			descripcion: 'd',
			precio_estimado: null,
			moneda: '',
			imagen_url: 'https://a.b/c.png'
		});
		expect(form.precio).toBe('');
		expect(form.orden).toBe('');
		expect(form.moneda).toBe('USD');
		expect(form.imagenUrl).toBe('https://a.b/c.png');
	});
});

describe('parseCatalogPrice', () => {
	it.each([
		['', null],
		['  ', null],
		['10', 10],
		['10.5', 10.5],
		['10,25', 10.25],
		['0', 0]
	])('parses %j as %j', (input, expected) => {
		expect(parseCatalogPrice(input)).toBe(expected);
	});

	it.each(['-1', 'abc', '1.234', '1,2,3', '1e3', '.5'])('rejects %j', (input) => {
		expect(parseCatalogPrice(input)).toBeNaN();
	});
});

describe('validateCatalogForm', () => {
	it('accepts a filled form', () => {
		expect(validateCatalogForm(filled(), 'negocio')).toBeNull();
	});

	it('requires a name', () => {
		expect(validateCatalogForm({ ...filled(), nombre: '  ' }, 'negocio')).toBe(
			'El nombre es requerido'
		);
	});

	it('rejects producto for artista', () => {
		expect(validateCatalogForm({ ...filled(), tipo: 'producto' }, 'artista')).toBe(
			'Un artista solo puede ofrecer servicios'
		);
	});

	it('rejects an invalid price', () => {
		expect(validateCatalogForm({ ...filled(), precio: '-3' }, 'negocio')).toBe(
			'El precio debe ser un número positivo con hasta 2 decimales'
		);
	});

	it('accepts a comma price', () => {
		expect(validateCatalogForm({ ...filled(), precio: '3,50' }, 'negocio')).toBeNull();
	});

	it('rejects a non-http image url', () => {
		expect(validateCatalogForm({ ...filled(), imagenUrl: 'javascript:alert(1)' }, 'negocio')).toBe(
			'La imagen debe ser una URL http(s)'
		);
		expect(validateCatalogForm({ ...filled(), imagenUrl: 'no es url' }, 'negocio')).toBe(
			'La imagen debe ser una URL http(s)'
		);
	});

	it('accepts an https image url', () => {
		expect(
			validateCatalogForm({ ...filled(), imagenUrl: ' https://x.com/a.jpg ' }, 'negocio')
		).toBeNull();
	});

	it('rejects a non-integer orden', () => {
		expect(validateCatalogForm({ ...filled(), orden: '1.5' }, 'negocio')).toBe(
			'El orden debe ser un número entero'
		);
	});
});

describe('buildCatalogPayload', () => {
	it('trims text, maps empties to null and parses numbers', () => {
		expect(
			buildCatalogPayload(
				{
					tipo: 'producto',
					nombre: ' Almuerzo ',
					descripcion: '  ',
					precio: '4,5',
					moneda: ' usd ',
					imagenUrl: '',
					orden: '2'
				},
				'b1'
			)
		).toEqual({
			business_id: 'b1',
			tipo: 'producto',
			nombre: 'Almuerzo',
			descripcion: null,
			precio_estimado: 4.5,
			moneda: 'USD',
			imagen_url: null,
			orden: 2
		});
	});

	it('defaults empty price to null, moneda to USD and orden to 0', () => {
		const payload = buildCatalogPayload({ ...filled(), moneda: '' }, 'b1');
		expect(payload.precio_estimado).toBeNull();
		expect(payload.moneda).toBe('USD');
		expect(payload.orden).toBe(0);
	});
});

describe('formatCatalogPrice', () => {
	it('formats with two decimals and the currency', () => {
		expect(formatCatalogPrice(4.5, 'USD')).toBe('$4.50 USD');
	});

	it('returns null without a price', () => {
		expect(formatCatalogPrice(null, 'USD')).toBeNull();
	});
});
