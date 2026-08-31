export const BRAND_FALLBACK = {
	primary: '#18181b',
	accent: '#fafafa'
} as const;

/**
 * Normaliza colores de `businesses.primary_color/accent_color` con fallback zinc.
 */
export function getBrandColors(business: { primary_color?: string | null; accent_color?: string | null }) {
	return {
		primary: business.primary_color ?? BRAND_FALLBACK.primary,
		accent: business.accent_color ?? BRAND_FALLBACK.accent
	};
}

export function initials(name: string): string {
	return name.slice(0, 2).toUpperCase();
}
