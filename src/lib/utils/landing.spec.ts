import { describe, it, expect } from 'vitest';
import {
	businessBlurb,
	catalogTitle,
	heroEyebrow,
	landingTitle,
	locationLabel,
	productInquiryLink
} from './landing';

describe('catalogTitle', () => {
	it('names the catalog after what each business type offers', () => {
		expect(catalogTitle('artista')).toBe('Servicios');
		expect(catalogTitle('lugar')).toBe('Servicios y experiencias');
		expect(catalogTitle('negocio')).toBe('Productos y servicios');
	});
});

describe('locationLabel', () => {
	it('joins city and province', () => {
		expect(locationLabel('Macas', 'Morona Santiago')).toBe('Macas, Morona Santiago');
	});

	it('keeps only what is loaded', () => {
		expect(locationLabel('Macas', undefined)).toBe('Macas');
		expect(locationLabel(null, 'Morona Santiago')).toBe('Morona Santiago');
	});

	it('is null when neither is loaded, so the view can hide the line', () => {
		expect(locationLabel(null, undefined)).toBeNull();
		expect(locationLabel('', '')).toBeNull();
	});
});

describe('heroEyebrow', () => {
	it('joins the present parts with a middle dot', () => {
		expect(heroEyebrow(['Gastronomía', 'Negocio', 'Macas'])).toBe('Gastronomía · Negocio · Macas');
	});

	it('drops missing parts instead of leaving empty separators', () => {
		expect(heroEyebrow([undefined, 'Negocio', null, ''])).toBe('Negocio');
	});
});

describe('businessBlurb', () => {
	it('prefers the description, then the bio, then an empty string', () => {
		expect(businessBlurb({ descripcion: 'd', bio: 'b' })).toBe('d');
		expect(businessBlurb({ descripcion: null, bio: 'b' })).toBe('b');
		expect(businessBlurb({ descripcion: null, bio: null })).toBe('');
	});
});

describe('landingTitle', () => {
	it('uses the category name when the business has one', () => {
		expect(landingTitle('Café Sol', 'negocio', 'Gastronomía')).toBe(
			'Café Sol — Gastronomía | IISAR'
		);
	});

	it('falls back to the business type label', () => {
		expect(landingTitle('Café Sol', 'lugar', undefined)).toBe('Café Sol — Lugar | IISAR');
	});
});

describe('productInquiryLink', () => {
	it('prefills a WhatsApp message naming the product and the business', () => {
		const link = productInquiryLink('0991 234 567', 'Café', 'Café Sol');
		expect(link).toBe(
			`https://wa.me/0991234567?text=${encodeURIComponent('Hola, me interesa «Café» de Café Sol.')}`
		);
	});

	it('is null without a usable number, so the CTA is hidden', () => {
		expect(productInquiryLink(null, 'Café', 'Café Sol')).toBeNull();
	});
});
