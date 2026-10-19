import type { Business, BusinessTipo } from '$lib/types';
import { getBrandColors } from './brand';
import { slugify } from './slug';

/** Brand color preselected in the create form (a user-chosen value, not a theme token). */
export const DEFAULT_PRIMARY_COLOR = '#ea580c';

/** Copy and presentation per tipo, so the template never branches on `tipo === ...`. */
export const TIPO_META: Record<
	BusinessTipo,
	{
		hint: string;
		nombrePlaceholder: string;
		slugPlaceholder: string;
		descripcionLabel: string;
		descripcionPlaceholder: string;
		badge: 'default' | 'secondary' | 'outline';
	}
> = {
	negocio: {
		hint: 'productos y servicios + visión/misión',
		nombrePlaceholder: 'Sabor Andino',
		slugPlaceholder: 'sabor-andino',
		descripcionLabel: 'Descripción',
		descripcionPlaceholder: 'Menú diario...',
		badge: 'secondary'
	},
	artista: {
		hint: 'solo servicios',
		nombrePlaceholder: 'DJ Andino',
		slugPlaceholder: 'dj-andino',
		descripcionLabel: 'Bio / Descripción',
		descripcionPlaceholder: 'DJ de música andina...',
		badge: 'default'
	},
	lugar: {
		hint: 'hotel, mirador, atractivo...',
		nombrePlaceholder: 'Sabor Andino',
		slugPlaceholder: 'sabor-andino',
		descripcionLabel: 'Descripción',
		descripcionPlaceholder: 'Menú diario...',
		badge: 'outline'
	}
};

export const TIPOS = Object.keys(TIPO_META) as BusinessTipo[];

export type BusinessFormValues = {
	tipo: BusinessTipo;
	nombre: string;
	slug: string;
	descripcion: string;
	vision: string;
	mision: string;
	ciudad: string;
	contacto: string;
	categoryId: string;
	provinciaId: string;
	primaryColor: string;
};

export function emptyBusinessForm(): BusinessFormValues {
	return {
		tipo: 'negocio',
		nombre: '',
		slug: '',
		descripcion: '',
		vision: '',
		mision: '',
		ciudad: 'Macas',
		contacto: '',
		categoryId: '',
		provinciaId: '',
		primaryColor: DEFAULT_PRIMARY_COLOR
	};
}

/** After a successful create: clear the entered text but keep the choices likely to repeat. */
export function resetBusinessForm(form: BusinessFormValues): BusinessFormValues {
	return {
		...form,
		nombre: '',
		slug: '',
		descripcion: '',
		vision: '',
		mision: '',
		contacto: '',
		provinciaId: ''
	};
}

export function resolveSlug(form: Pick<BusinessFormValues, 'slug' | 'nombre'>): string {
	return slugify(form.slug || form.nombre);
}

/** Returns the error message to show, or null when the form can be submitted. */
export function validateBusinessForm(form: BusinessFormValues): string | null {
	return !resolveSlug(form) || !form.nombre.trim() ? 'Nombre y slug son requeridos' : null;
}

/** Column mapping shared by create and update: trimmed text, empty optionals as null. */
function businessFields(form: BusinessFormValues) {
	const isNegocio = form.tipo === 'negocio';
	return {
		category_id: form.categoryId || null,
		provincia_id: form.provinciaId || null,
		slug: resolveSlug(form),
		tipo: form.tipo,
		nombre: form.nombre.trim(),
		descripcion: form.descripcion.trim() || null,
		vision: isNegocio ? form.vision.trim() || null : null,
		mision: isNegocio ? form.mision.trim() || null : null,
		ciudad: form.ciudad.trim() || null,
		contacto: form.contacto.trim() || null,
		primary_color: form.primaryColor
	};
}

export function buildBusinessPayload(form: BusinessFormValues, ownerId: string) {
	return { owner_id: ownerId, ...businessFields(form), estado: 'activo' as const };
}

/** Update payload: the owner and estado are never changed from the edit form. */
export function buildBusinessUpdatePayload(form: BusinessFormValues) {
	return businessFields(form);
}

/** Prefills the edit form from a stored business. */
export function businessToForm(business: Business): BusinessFormValues {
	return {
		tipo: business.tipo,
		nombre: business.nombre,
		slug: business.slug,
		descripcion: business.descripcion ?? '',
		vision: business.vision ?? '',
		mision: business.mision ?? '',
		ciudad: business.ciudad ?? '',
		contacto: business.contacto ?? '',
		categoryId: business.category_id ?? '',
		provinciaId: business.provincia_id ?? '',
		primaryColor: business.primary_color ?? DEFAULT_PRIMARY_COLOR
	};
}

/** Shown when an owner tries to create a second business; matches the database trigger. */
export const ONE_BUSINESS_MESSAGE = 'Solo puedes tener un negocio por cuenta';

/** Accounts are limited to one business: creating is only offered while the owner has none. */
export function canCreateBusiness(businesses: readonly unknown[]): boolean {
	return businesses.length === 0;
}

/** Color safe to render as a swatch: a valid `#rrggbb`, otherwise the brand fallback. */
export function swatchColor(color: string | null | undefined): string {
	return getBrandColors({ primary_color: color }).primary;
}
