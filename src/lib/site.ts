/**
 * Identity of the site in a single place.
 *
 * The legal pages (`/privacidad`, `/terminos`), `/contacto`, `/nosotros` and the site footer all
 * read these values, so changing the contact email or the address updates every page at once.
 *
 * Keep it truthful. These are the values a human reads to reach the owner of the site: Google
 * rejects an AdSense account when the privacy policy or the contact page cannot be verified.
 */

export const site = {
	name: 'iisar',
	tagline: 'Directorio de negocios y servicios',
	/** Public origin. Confirm it matches the deployed domain before publishing the legal pages. */
	origin: 'https://iisar.com',
	/** Owner of the site and of the personal data it processes. */
	owner: 'Vidal Juank',
	contactEmail: 'us3rm0n@gmail.com',
	location: 'Macas, Morona Santiago, Ecuador',
	/** Date shown by the legal pages. Bump it when their text changes. */
	legalUpdated: '2 de octubre de 2026'
} as const;

/** Footer links to the legal and about pages. */
export const legalNav = [
	{ href: '/nosotros', label: 'Sobre iisar' },
	{ href: '/contacto', label: 'Contacto' },
	{ href: '/privacidad', label: 'Privacidad' },
	{ href: '/terminos', label: 'Términos' }
] as const;

/** Opens a new tab without leaking the opener, the convention used across the site. */
export const externalLink = {
	target: '_blank',
	rel: 'noopener noreferrer'
} as const;
