import { describe, expect, it } from 'vitest';
import {
	DEFAULT_PRIMARY_COLOR,
	TIPOS,
	TIPO_META,
	buildBusinessPayload,
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
