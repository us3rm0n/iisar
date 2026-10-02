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

	it('prefers ending on a complete sentence when one fits, without an ellipsis', () => {
		const text =
			'Manabí es una provincia costera. Su capital es Portoviejo y tiene muchas playas. Aquí empieza una tercera oración mucho más larga que ya no cabe en el límite.';
		const result = markdownExcerpt(text, 90);
		expect(result).toBe(
			'Manabí es una provincia costera. Su capital es Portoviejo y tiene muchas playas.'
		);
		expect(result.length).toBeLessThanOrEqual(90);
		expect(result.endsWith('…')).toBe(false);
	});

	it('keeps as many whole sentences as fit', () => {
		const text = 'Uno dos tres. Cuatro cinco seis. Siete ocho nueve diez once doce.';
		expect(markdownExcerpt(text, 35)).toBe('Uno dos tres. Cuatro cinco seis.');
		expect(markdownExcerpt(text, 16)).toBe('Uno dos tres.');
	});

	it('does not split a sentence on decimals or inner abbreviations', () => {
		const text = 'La superficie ronda los 9 500 km² y la altura es de 2.850 m. Otra frase corta.';
		expect(markdownExcerpt(text, 62)).toBe(
			'La superficie ronda los 9 500 km² y la altura es de 2.850 m.'
		);
	});

	it('falls back to a word-boundary cut with an ellipsis when not even one sentence fits', () => {
		const result = markdownExcerpt(
			'Esta es una única oración extremadamente larga que no cabe por ningún motivo en el límite.',
			30
		);
		expect(result.endsWith('…')).toBe(true);
		expect(result.length).toBeLessThanOrEqual(30);
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
