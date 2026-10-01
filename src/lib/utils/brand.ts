export const BRAND_FALLBACK = {
	primary: '#18181b',
	accent: '#fafafa'
} as const;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * Normaliza colores de `businesses.primary_color/accent_color` con fallback zinc.
 * Cualquier valor que no sea `#rrggbb` (mismo formato que exige el check de la DB) usa el fallback.
 */
export function getBrandColors(business: {
	primary_color?: string | null;
	accent_color?: string | null;
}) {
	const valid = (color: string | null | undefined, fallback: string) =>
		color && HEX_COLOR.test(color) ? color : fallback;
	return {
		primary: valid(business.primary_color, BRAND_FALLBACK.primary),
		accent: valid(business.accent_color, BRAND_FALLBACK.accent)
	};
}

export function initials(name: string): string {
	return name.slice(0, 2).toUpperCase();
}

/** Foreground legible reusando los mismos valores del tema zinc en `src/routes/layout.css`. */
const LIGHT_FOREGROUND = '0 0% 98%';
const DARK_FOREGROUND = '240 10% 3.9%';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const clean = hex.replace('#', '');
	return {
		r: parseInt(clean.slice(0, 2), 16),
		g: parseInt(clean.slice(2, 4), 16),
		b: parseInt(clean.slice(4, 6), 16)
	};
}

/** Convierte un hex `#rrggbb` al triplete `H S% L%` que esperan los tokens shadcn (`hsl(var(--primary))`). */
export function hexToHslTriplet(hex: string): string {
	const { r, g, b } = hexToRgb(hex);
	const rn = r / 255;
	const gn = g / 255;
	const bn = b / 255;
	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const l = (max + min) / 2;
	const delta = max - min;

	let h = 0;
	let s = 0;
	if (delta !== 0) {
		s = delta / (1 - Math.abs(2 * l - 1));
		switch (max) {
			case rn:
				h = ((gn - bn) / delta) % 6;
				break;
			case gn:
				h = (bn - rn) / delta + 2;
				break;
			default:
				h = (rn - gn) / delta + 4;
		}
		h *= 60;
		if (h < 0) h += 360;
	}

	const round = (n: number, decimals = 0) => Number(n.toFixed(decimals));
	return `${round(h)} ${round(s * 100)}% ${round(l * 100, l * 100 === Math.round(l * 100) ? 0 : 1)}%`;
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
	const channel = (c: number) => {
		const cs = c / 255;
		return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(l1: number, l2: number): number {
	const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
	return (lighter + 0.05) / (darker + 0.05);
}

/** Elige el foreground (blanco/negro del tema) con mejor contraste sobre `hex`, por luminancia WCAG. */
export function readableForeground(hex: string): string {
	const luminance = relativeLuminance(hexToRgb(hex));
	const contrastWithWhite = contrastRatio(luminance, 1);
	const contrastWithBlack = contrastRatio(luminance, 0);
	return contrastWithWhite >= contrastWithBlack ? LIGHT_FOREGROUND : DARK_FOREGROUND;
}

/**
 * Construye un `style=` que sobreescribe los tokens de marca del negocio.
 *
 * Hay que sobreescribir **dos** capas, no una:
 * 1. Los tokens shadcn (`--primary`, `--accent`, ...) que usa el CSS propio.
 * 2. Los alias `--color-*` que declara el `@theme` de `src/routes/layout.css`
 *    como `hsl(var(--primary))`.
 *
 * La razón del punto 2: Tailwind v4 compila `bg-primary` a
 * `background-color: var(--color-primary)`. Una custom property se sustituye
 * (y se congela) en el elemento donde está declarada, así que el `@theme` de
 * `:root` resuelve `--color-primary` una sola vez con el zinc por defecto y ese
 * valor ya sustituido es el que hereda el árbol. Poner `--primary` en un
 * wrapper NO cambia las utilidades `bg-primary` / `text-primary` /
 * `border-primary`: sin el alias, la landing de marca renderiza siempre el
 * fallback zinc.
 */
export function brandCssVars(business: {
	primary_color?: string | null;
	accent_color?: string | null;
}): string {
	const { primary, accent } = getBrandColors(business);
	const primaryHsl = hexToHslTriplet(primary);
	const accentHsl = hexToHslTriplet(accent);

	return [
		`--primary: ${primaryHsl}`,
		`--primary-foreground: ${readableForeground(primary)}`,
		`--accent: ${accentHsl}`,
		`--accent-foreground: ${readableForeground(accent)}`,
		`--ring: ${primaryHsl}`,
		// Alias para que las utilidades de Tailwind resuelvan la marca del negocio.
		`--color-primary: hsl(var(--primary))`,
		`--color-primary-foreground: hsl(var(--primary-foreground))`,
		`--color-accent: hsl(var(--accent))`,
		`--color-accent-foreground: hsl(var(--accent-foreground))`,
		`--color-ring: hsl(var(--ring))`
	].join('; ');
}
