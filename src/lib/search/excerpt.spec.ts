import { describe, expect, it } from 'vitest';
import { markdownExcerpt } from './excerpt';

describe('markdownExcerpt', () => {
	it('returns the first prose paragraph', () => {
		expect(markdownExcerpt('Primera parte.\n\nSegunda parte.')).toBe('Primera parte.');
	});

	it('joins the lines of a paragraph with single spaces', () => {
		expect(markdownExcerpt('Una costa\nlarga y   hermosa.')).toBe('Una costa larga y hermosa.');
	});

	it('skips headings, lists, quotes and tables before the prose', () => {
		const md = [
			'# Manabí',
			'',
			'## Resumen',
			'',
			'- primer punto',
			'* otro punto',
			'1. numerado',
			'',
			'> una cita',
			'',
			'| a | b |',
			'|---|---|',
			'| 1 | 2 |',
			'',
			'Texto real de la provincia.',
			'',
			'Otro párrafo.'
		].join('\n');
		expect(markdownExcerpt(md)).toBe('Texto real de la provincia.');
	});

	it('ignores everything from the Fuentes heading on', () => {
		const md = '### Fuentes\n\nUn párrafo que parece prosa.';
		expect(markdownExcerpt(md)).toBe('');
		expect(markdownExcerpt('Intro.\n\n### Fuentes\n\nOtra.')).toBe('Intro.');
	});

	it('keeps link text and strips emphasis, code and HTML', () => {
		const md =
			'Visita [la playa](https://example.com/x) con **mucho** _sol_, `código` y <b>más</b> <br/>aire.';
		expect(markdownExcerpt(md)).toBe('Visita la playa con mucho sol, código y más aire.');
	});

	it('never returns markup', () => {
		const out = markdownExcerpt('Hola <script>alert(1)</script> mundo <img src=x onerror=y> fin.');
		expect(out).not.toContain('<');
		expect(out).not.toContain('>');
	});

	it('preserves Spanish accents', () => {
		expect(markdownExcerpt('Cañar, Bolívar y Galápagos: ¿qué más?')).toBe(
			'Cañar, Bolívar y Galápagos: ¿qué más?'
		);
	});

	it('truncates on a word boundary with a single ellipsis within maxChars', () => {
		const out = markdownExcerpt('uno dos tres cuatro cinco seis siete', 20);
		expect(out).toBe('uno dos tres cuatro…');
		expect(out.length).toBeLessThanOrEqual(20);
		const long = markdownExcerpt('palabra '.repeat(100), 50);
		expect(long.length).toBeLessThanOrEqual(50);
		expect(long.endsWith('…')).toBe(true);
		expect(long.endsWith(' …')).toBe(false);
	});

	it('does not truncate text that fits', () => {
		expect(markdownExcerpt('corto texto', 11)).toBe('corto texto');
	});

	it('handles a single word longer than the limit', () => {
		const out = markdownExcerpt('supercalifragilistico', 10);
		expect(out.length).toBeLessThanOrEqual(10);
		expect(out.endsWith('…')).toBe(true);
	});

	it('returns an empty string for empty or prose-less input', () => {
		expect(markdownExcerpt('')).toBe('');
		expect(markdownExcerpt('   \n\n ')).toBe('');
		expect(markdownExcerpt('# Solo título\n\n- item')).toBe('');
	});
});
