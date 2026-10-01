/**
 * Enlace de WhatsApp para los CTA de la landing.
 *
 * Puro. `contacto` se guarda como texto libre ("0991 234 567"), así que se
 * normaliza a dígitos antes de construir la URL. Devuelve `null` cuando no hay
 * un número usable, para que la vista pueda ocultar el CTA en vez de renderizar
 * un enlace roto.
 *
 * @param message texto prellenado; se omite del URL si está vacío.
 */
export function waLink(contacto: string | null | undefined, message?: string): string | null {
	const digits = (contacto ?? '').replace(/\D/g, '');
	if (!digits) return null;

	const base = `https://wa.me/${digits}`;
	const text = message?.trim();
	return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
