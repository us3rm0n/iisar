import type { Business, BusinessTipo } from '$lib/types';
import { tipoLabel } from './provincias';
import { waLink } from './whatsapp';

/** Business row as the landing load returns it: `Business` plus the branding images. */
export type LandingBusiness = Business & {
	logo_url?: string | null;
	cover_url?: string | null;
};

/** Catalog heading, named after what each type of business offers. */
export function catalogTitle(tipo: BusinessTipo): string {
	if (tipo === 'artista') return 'Servicios';
	if (tipo === 'lugar') return 'Servicios y experiencias';
	return 'Productos y servicios';
}

/** "Macas, Morona Santiago", built only from what the business has loaded. */
export function locationLabel(
	ciudad: string | null | undefined,
	provincia: string | null | undefined
): string | null {
	return [ciudad, provincia].filter(Boolean).join(', ') || null;
}

/** Small uppercase line above the hero title. */
export function heroEyebrow(parts: (string | null | undefined)[]): string {
	return parts.filter(Boolean).join(' · ');
}

export function businessBlurb(business: Pick<Business, 'descripcion' | 'bio'>): string {
	return business.descripcion ?? business.bio ?? '';
}

export function landingTitle(
	nombre: string,
	tipo: BusinessTipo,
	categoryName: string | null | undefined
): string {
	return `${nombre} — ${categoryName ?? tipoLabel(tipo)} | IISAR`;
}

/** Per-product CTA: the message already names the product, so WhatsApp opens prefilled. */
export function productInquiryLink(
	contacto: string | null | undefined,
	productName: string,
	businessName: string
): string | null {
	return waLink(contacto, `Hola, me interesa «${productName}» de ${businessName}.`);
}
