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

	it('falls back to the zinc brand when a color is not a #rrggbb hex', () => {
		const style = brandCssVars({ primary_color: '#fff', accent_color: 'red' });
		expect(style).not.toContain('NaN');
		expect(style).toBe(brandCssVars({ primary_color: null, accent_color: null }));
	});
});
