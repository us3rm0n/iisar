import { describe, it, expect } from 'vitest';
import { hexToHslTriplet, readableForeground, brandCssVars } from './brand';

describe('hexToHslTriplet', () => {
	it('converts pure red to its HSL triplet', () => {
		expect(hexToHslTriplet('#ff0000')).toBe('0 100% 50%');
	});

	it('converts white and black', () => {
		expect(hexToHslTriplet('#ffffff')).toBe('0 0% 100%');
		expect(hexToHslTriplet('#000000')).toBe('0 0% 0%');
	});
});

describe('readableForeground', () => {
	it('picks a light foreground for a dark background', () => {
		expect(readableForeground('#18181b')).toBe('0 0% 98%');
	});

	it('picks a dark foreground for a light background', () => {
		expect(readableForeground('#fafafa')).toBe('240 10% 3.9%');
	});
});

describe('brandCssVars', () => {
	it('builds a style string overriding the shadcn tokens with the brand colors', () => {
		const style = brandCssVars({ primary_color: '#ea580c', accent_color: '#fff7ed' });
		expect(style).toContain('--primary:');
		expect(style).toContain('--primary-foreground:');
		expect(style).toContain('--accent:');
		expect(style).toContain('--accent-foreground:');
		expect(style).toContain('--ring:');
	});

	it('falls back to the zinc brand when the business has no colors', () => {
		const style = brandCssVars({ primary_color: null, accent_color: null });
		expect(style).toContain(hexToHslTriplet('#18181b'));
	});

	// Tailwind v4 compila `bg-primary` a `var(--color-primary)`, y el `@theme` de
	// layout.css lo declara como `hsl(var(--primary))`. Esa sustitución se resuelve y
	// congela en `:root`, así que sobreescribir solo `--primary` en un wrapper no
	// alcanza: hay que sobreescribir también el alias `--color-*`.
	it.each([
		['--color-primary', '--primary'],
		['--color-primary-foreground', '--primary-foreground'],
		['--color-accent', '--accent'],
		['--color-accent-foreground', '--accent-foreground'],
		['--color-ring', '--ring']
	])('aliases %s to the brand override so utilities resolve the business color', (alias, token) => {
		const style = brandCssVars({ primary_color: '#ea580c', accent_color: '#fff7ed' });
		expect(style).toContain(`${alias}: hsl(var(${token}))`);
	});

	it('falls back to the zinc brand when a color is not a #rrggbb hex', () => {
		const style = brandCssVars({ primary_color: '#fff', accent_color: 'red' });
		expect(style).not.toContain('NaN');
		expect(style).toBe(brandCssVars({ primary_color: null, accent_color: null }));
	});
});
