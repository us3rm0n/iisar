import { describe, expect, it } from 'vitest';
import {
	PROVINCE_BODY_MAX,
	canEditProvince,
	isDirty,
	normalizeBody,
	validateBody
} from './province-editor';

describe('canEditProvince', () => {
	it('allows only the webmaster role', () => {
		expect(canEditProvince('webmaster')).toBe(true);
		expect(canEditProvince('business')).toBe(false);
		expect(canEditProvince('Webmaster')).toBe(false);
		expect(canEditProvince('')).toBe(false);
		expect(canEditProvince(null)).toBe(false);
	});
});

describe('normalizeBody', () => {
	it('converts CRLF and lone CR to LF', () => {
		expect(normalizeBody('a\r\nb\rc\n')).toBe('a\nb\nc\n');
	});

	it('strips a trailing run of blank lines but keeps one final newline', () => {
		expect(normalizeBody('hola\n\n\n  \n')).toBe('hola\n');
		expect(normalizeBody('hola')).toBe('hola\n');
	});

	it('does not touch internal content', () => {
		expect(normalizeBody('a\n\n\nb  \n')).toBe('a\n\n\nb  \n');
		expect(normalizeBody('  sangría\n')).toBe('  sangría\n');
	});

	it('returns an empty string for whitespace-only input', () => {
		expect(normalizeBody('')).toBe('');
		expect(normalizeBody(' \n\r\n\n')).toBe('');
	});
});

describe('validateBody', () => {
	it('accepts a normal body', () => {
		expect(validateBody('### Título\n')).toEqual({ ok: true });
	});

	it('allows an empty body (clears the article; the UI asks for confirmation)', () => {
		expect(validateBody('')).toEqual({ ok: true });
		expect(validateBody('  \n ')).toEqual({ ok: true });
	});

	it('accepts exactly the maximum (counted after normalisation, final newline included)', () => {
		expect(validateBody('a'.repeat(PROVINCE_BODY_MAX - 1))).toEqual({ ok: true });
	});

	it('rejects a body over the maximum with the counts in Spanish', () => {
		const res = validateBody('a'.repeat(PROVINCE_BODY_MAX));
		expect(res).toEqual({
			ok: false,
			error: 'El contenido es demasiado largo: 20001 de 20000 caracteres como máximo.'
		});
	});

	it('measures the normalised body (CRLF counts once)', () => {
		const body = 'a\r\n'.repeat(PROVINCE_BODY_MAX / 2);
		expect(validateBody(body)).toEqual({ ok: true });
	});
});

describe('isDirty', () => {
	it('is false when only line endings or trailing blanks differ', () => {
		expect(isDirty('a\nb\n', 'a\r\nb\r\n\r\n')).toBe(false);
		expect(isDirty('a', 'a\n')).toBe(false);
	});

	it('is true when content differs', () => {
		expect(isDirty('a\n', 'b\n')).toBe(true);
		expect(isDirty('', 'x')).toBe(true);
	});
});

describe('PROVINCE_BODY_MAX', () => {
	it('mirrors the database check', () => {
		expect(PROVINCE_BODY_MAX).toBe(20000);
	});
});
