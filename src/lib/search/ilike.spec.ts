import { describe, expect, it } from 'vitest';
import { toIlikePattern } from './ilike';

describe('toIlikePattern', () => {
	it('keeps plain text and accents', () => {
		expect(toIlikePattern('café Manabí')).toBe('café Manabí');
	});

	it('collapses whitespace and trims', () => {
		expect(toIlikePattern('  a \t  b\n c ')).toBe('a b c');
	});

	it('removes characters that break the PostgREST filter grammar', () => {
		expect(toIlikePattern('a,b')).toBe('a b');
		expect(toIlikePattern('x),nombre.ilike.%')).toBe('x nombre.ilike.\\%');
		expect(toIlikePattern('f(x)\\y')).toBe('f x y');
	});

	it('escapes LIKE wildcards', () => {
		expect(toIlikePattern('100%')).toBe('100\\%');
		expect(toIlikePattern('a_b')).toBe('a\\_b');
	});

	it('returns an empty string when nothing useful is left', () => {
		expect(toIlikePattern('')).toBe('');
		expect(toIlikePattern('  ')).toBe('');
		expect(toIlikePattern(',()\\ ,')).toBe('');
	});
});
