import type { BusinessTipo, CatalogTipo, ProductService } from '$lib/types';

export const DEFAULT_MONEDA = 'USD';

export type CatalogFormValues = {
	tipo: CatalogTipo;
	nombre: string;
	descripcion: string;
	/** Raw price text; a comma is accepted as decimal separator. */
	precio: string;
	moneda: string;
	imagenUrl: string;
	/** Raw position text; empty means 0. */
	orden: string;
};

export const CATALOG_TIPO_LABEL: Record<CatalogTipo, string> = {
	producto: 'Producto',
	servicio: 'Servicio'
};

/** Artists only offer services (mirrors the `ps_artista_check` trigger). */
export function allowedCatalogTipos(businessTipo: BusinessTipo): CatalogTipo[] {
	return businessTipo === 'artista' ? ['servicio'] : ['producto', 'servicio'];
}

export function emptyCatalogForm(businessTipo: BusinessTipo): CatalogFormValues {
	return {
		tipo: allowedCatalogTipos(businessTipo)[0],
		nombre: '',
		descripcion: '',
		precio: '',
		moneda: DEFAULT_MONEDA,
		imagenUrl: '',
		orden: ''
	};
}

/** Prefills the edit form from a stored item. */
export function itemToCatalogForm(item: ProductService): CatalogFormValues {
	return {
		tipo: item.tipo,
		nombre: item.nombre,
		descripcion: item.descripcion ?? '',
		precio: item.precio_estimado == null ? '' : String(item.precio_estimado),
		moneda: item.moneda || DEFAULT_MONEDA,
		imagenUrl: item.imagen_url ?? '',
		orden: item.orden == null ? '' : String(item.orden)
	};
}

const PRICE_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;

/** Empty → null; a non-negative number with up to 2 decimals → number; anything else → NaN. */
export function parseCatalogPrice(value: string): number | null {
	const text = value.trim();
	if (!text) return null;
	return PRICE_PATTERN.test(text) ? Number(text.replace(',', '.')) : NaN;
}

function parseOrden(value: string): number {
	const text = value.trim();
	if (!text) return 0;
	return /^-?\d+$/.test(text) ? Number(text) : NaN;
}

function isHttpUrl(value: string): boolean {
	try {
		const { protocol } = new URL(value);
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}

/** Returns the error message to show, or null when the form can be submitted. */
export function validateCatalogForm(
	form: CatalogFormValues,
	businessTipo: BusinessTipo
): string | null {
	if (!form.nombre.trim()) return 'El nombre es requerido';
	if (!allowedCatalogTipos(businessTipo).includes(form.tipo)) {
		return 'Un artista solo puede ofrecer servicios';
	}
	if (Number.isNaN(parseCatalogPrice(form.precio))) {
		return 'El precio debe ser un número positivo con hasta 2 decimales';
	}
	const imagenUrl = form.imagenUrl.trim();
	if (imagenUrl && !isHttpUrl(imagenUrl)) return 'La imagen debe ser una URL http(s)';
	if (Number.isNaN(parseOrden(form.orden))) return 'El orden debe ser un número entero';
	return null;
}

/** Column mapping shared by insert and update (validate first). Updates never move an item. */
export function catalogFields(form: CatalogFormValues) {
	return {
		tipo: form.tipo,
		nombre: form.nombre.trim(),
		descripcion: form.descripcion.trim() || null,
		precio_estimado: parseCatalogPrice(form.precio),
		moneda: form.moneda.trim().toUpperCase() || DEFAULT_MONEDA,
		imagen_url: form.imagenUrl.trim() || null,
		orden: parseOrden(form.orden)
	};
}

export function buildCatalogPayload(form: CatalogFormValues, businessId: string) {
	return { business_id: businessId, ...catalogFields(form) };
}

/** Display price, e.g. `$4.50 USD`; null when the item has no price. */
export function formatCatalogPrice(precio: number | null, moneda: string): string | null {
	if (precio == null) return null;
	return `$${precio.toFixed(2)} ${moneda || DEFAULT_MONEDA}`;
}
