import { describe, expect, it } from 'vitest';
import type { Business } from '$lib/types';
import {
	DEFAULT_PRIMARY_COLOR,
	TIPOS,
	TIPO_META,
	buildBusinessPayload,
	buildBusinessUpdatePayload,
	businessToForm,
	canCreateBusiness,
	emptyBusinessForm,
	resetBusinessForm,
	resolveSlug,
	swatchColor,
	validateBusinessForm
} from './business-form';

const filled = () => ({
	...emptyBusinessForm(),
	nombre: '  Sabor Andino ',
	descripcion: ' Menú diario ',
	vision: ' Ser referente ',
	mision: ' Ofrecer productos ',
	ciudad: ' Macas ',
	contacto: ' 0991234567 ',
	categoryId: 'cat-1',
	provinciaId: 'prov-1',
	primaryColor: '#112233'
});

describe('emptyBusinessForm', () => {
	it('starts as a negocio in Macas with the default brand color', () => {
		expect(emptyBusinessForm()).toMatchObject({
			tipo: 'negocio',
			nombre: '',
			slug: '',
			ciudad: 'Macas',
			primaryColor: DEFAULT_PRIMARY_COLOR
		});
	});

	it('returns a fresh object each call', () => {
		expect(emptyBusinessForm()).not.toBe(emptyBusinessForm());
	});
});

describe('resetBusinessForm', () => {
	it('clears the entered text and province but keeps tipo, ciudad, category and color', () => {
		const form = { ...filled(), tipo: 'artista' as const, slug: 'sabor-andino' };
		const reset = resetBusinessForm(form);
		expect(reset).toMatchObject({
			nombre: '',
			slug: '',
			descripcion: '',
			vision: '',
			mision: '',
			contacto: '',
			provinciaId: '',
			tipo: 'artista',
			ciudad: ' Macas ',
			categoryId: 'cat-1',
			primaryColor: '#112233'
		});
	});
});

describe('resolveSlug', () => {
	it('prefers the typed slug, normalised', () => {
		expect(resolveSlug({ ...filled(), slug: 'Mi Café' })).toBe('mi-cafe');
	});

	it('falls back to the name when the slug is empty', () => {
		expect(resolveSlug({ ...filled(), slug: '' })).toBe('sabor-andino');
	});
});

describe('validateBusinessForm', () => {
	it('accepts a form with a name', () => {
		expect(validateBusinessForm(filled())).toBeNull();
	});

	it('rejects a blank name', () => {
		expect(validateBusinessForm({ ...filled(), nombre: '   ', slug: 'abc' })).toBe(
			'Nombre y slug son requeridos'
		);
	});

	it('rejects when no slug can be derived', () => {
		expect(validateBusinessForm({ ...filled(), nombre: '!!!', slug: '' })).toBe(
			'Nombre y slug son requeridos'
		);
	});
});

describe('buildBusinessPayload', () => {
	it('trims text and keeps vision and mission for negocio', () => {
		expect(buildBusinessPayload(filled(), 'owner-1')).toEqual({
			owner_id: 'owner-1',
			category_id: 'cat-1',
			provincia_id: 'prov-1',
			slug: 'sabor-andino',
			tipo: 'negocio',
			nombre: 'Sabor Andino',
			descripcion: 'Menú diario',
			vision: 'Ser referente',
			mision: 'Ofrecer productos',
			ciudad: 'Macas',
			contacto: '0991234567',
			estado: 'activo',
			primary_color: '#112233'
		});
	});

	it('drops vision and mission for other tipos', () => {
		const payload = buildBusinessPayload({ ...filled(), tipo: 'artista' }, 'o');
		expect(payload.vision).toBeNull();
		expect(payload.mision).toBeNull();
	});

	it('maps empty optional fields to null', () => {
		const payload = buildBusinessPayload(
			{ ...filled(), descripcion: '', ciudad: ' ', contacto: '', categoryId: '', provinciaId: '' },
			'o'
		);
		expect(payload).toMatchObject({
			descripcion: null,
			ciudad: null,
			contacto: null,
			category_id: null,
			provincia_id: null
		});
	});
});

describe('swatchColor', () => {
	it('keeps a valid hex color', () => {
		expect(swatchColor('#ABCDEF')).toBe('#ABCDEF');
	});

	it.each([null, undefined, '', 'red', 'url(javascript:alert(1))', '#fff'])(
		'falls back to a safe color for %s',
		(value) => {
			expect(swatchColor(value)).toMatch(/^#[0-9a-fA-F]{6}$/);
		}
	);
});

describe('TIPO_META', () => {
	it('covers every tipo', () => {
		expect(TIPOS).toEqual(['negocio', 'artista', 'lugar']);
		for (const tipo of TIPOS) expect(TIPO_META[tipo].hint).toBeTruthy();
	});
});

describe('canCreateBusiness', () => {
	it('allows creating when the owner has no business yet', () => {
		expect(canCreateBusiness([])).toBe(true);
	});

	it('refuses once the owner already has one or more', () => {
		expect(canCreateBusiness([{ id: 'b1' }])).toBe(false);
		expect(canCreateBusiness([{ id: 'b1' }, { id: 'b2' }])).toBe(false);
	});
});

const stored = (over: Partial<Business> = {}): Business => ({
	id: 'b1',
	slug: 'sabor-andino',
	tipo: 'negocio',
	nombre: 'Sabor Andino',
	descripcion: 'Menú diario',
	bio: null,
	vision: 'Ser referente',
	mision: 'Ofrecer productos',
	ciudad: 'Macas',
	contacto: '0991234567',
	estado: 'activo',
	primary_color: '#112233',
	accent_color: null,
	category_id: 'cat-1',
	provincia_id: 'prov-1',
	...over
});

describe('businessToForm', () => {
	it('prefills every editable field from the stored business', () => {
		expect(businessToForm(stored())).toEqual({
			tipo: 'negocio',
			nombre: 'Sabor Andino',
			slug: 'sabor-andino',
			descripcion: 'Menú diario',
			vision: 'Ser referente',
			mision: 'Ofrecer productos',
			ciudad: 'Macas',
			contacto: '0991234567',
			categoryId: 'cat-1',
			provinciaId: 'prov-1',
			primaryColor: '#112233'
		});
	});

	it('maps missing values to empty strings and the default color', () => {
		const form = businessToForm(
			stored({
				descripcion: null,
				vision: null,
				mision: null,
				ciudad: null,
				contacto: null,
				category_id: null,
				provincia_id: null,
				primary_color: null
			})
		);
		expect(form).toMatchObject({
			descripcion: '',
			vision: '',
			mision: '',
			ciudad: '',
			contacto: '',
			categoryId: '',
			provinciaId: '',
			primaryColor: DEFAULT_PRIMARY_COLOR
		});
	});
});

describe('buildBusinessUpdatePayload', () => {
	it('maps the same fields as the create payload without owner_id or estado', () => {
		const { owner_id, estado, ...shared } = buildBusinessPayload(filled(), 'owner-1');
		expect(owner_id).toBe('owner-1');
		expect(estado).toBe('activo');
		const update = buildBusinessUpdatePayload(filled());
		expect(update).toEqual(shared);
		expect(update).not.toHaveProperty('owner_id');
		expect(update).not.toHaveProperty('estado');
	});

	it('round-trips a stored business unchanged', () => {
		const business = stored();
		expect(buildBusinessUpdatePayload(businessToForm(business))).toEqual({
			category_id: business.category_id,
			provincia_id: business.provincia_id,
			slug: business.slug,
			tipo: business.tipo,
			nombre: business.nombre,
			descripcion: business.descripcion,
			vision: business.vision,
			mision: business.mision,
			ciudad: business.ciudad,
			contacto: business.contacto,
			primary_color: business.primary_color
		});
	});
});
