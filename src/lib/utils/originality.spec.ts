import { describe, expect, it } from 'vitest';
import { normalizeTokens, overlapReport, sharedShingles } from './originality';

const SOURCE =
	'El rio Zafiro nace en las colinas del norte y recorre lentamente los valles fertiles hasta llegar al lago grande donde viven muchas aves migratorias durante el invierno.';

describe('normalizeTokens', () => {
	it('lowercases, strips diacritics and records leading capitals', () => {
		const tokens = normalizeTokens('Árbol Grande, camión');
		expect(tokens.map((t) => t.norm)).toEqual(['arbol', 'grande', 'camion']);
		expect(tokens.map((t) => t.cap)).toEqual([true, true, false]);
	});

	it('ignores html comments, bracket placeholders and markdown marks', () => {
		const text = [
			'<!-- p. 63 -->',
			'## Lección uno',
			'[Ilustración: mapa de la zona]',
			'- **negrita** y _cursiva_',
			'1. primer punto',
			'| col a | col b |'
		].join('\n');
		expect(normalizeTokens(text).map((t) => t.norm)).toEqual([
			'leccion',
			'uno',
			'negrita',
			'y',
			'cursiva',
			'primer',
			'punto',
			'col',
			'a',
			'col',
			'b'
		]);
	});

	it('keeps the text of markdown links but drops the url', () => {
		expect(normalizeTokens('ver [la guia](http://x.test/a) hoy').map((t) => t.norm)).toEqual([
			'ver',
			'la',
			'guia',
			'hoy'
		]);
	});

	it('returns nothing for empty input', () => {
		expect(normalizeTokens('')).toEqual([]);
		expect(normalizeTokens('  \n <!-- only noise --> ')).toEqual([]);
	});
});

describe('sharedShingles', () => {
	it('finds every shingle for identical text', () => {
		const shared = sharedShingles(SOURCE, SOURCE, { n: 7 });
		expect(shared.size).toBeGreaterThan(10);
	});

	it('finds nothing for fully original text', () => {
		const target =
			'Los pescadores de la costa salen antes del amanecer porque la marea baja facilita la captura de camarones.';
		expect(sharedShingles(SOURCE, target).size).toBe(0);
	});

	it('is insensitive to case, diacritics and markup', () => {
		const target = '## **EL RÍO ZAFIRO NACE EN LAS COLINAS DEL NORTE** <!-- p. 1 -->';
		expect(sharedShingles(SOURCE, target, { n: 7 }).size).toBeGreaterThan(0);
	});

	it('catches a light synonym paraphrase at n=5 but not n=7', () => {
		// Two synonym swaps leave only short shared runs.
		const paraphrase =
			'El rio Zafiro nace en las lomas del norte y atraviesa despacio los valles fertiles hasta alcanzar el lago grande donde habitan muchas aves migratorias durante el invierno.';
		expect(sharedShingles(SOURCE, paraphrase, { n: 5 }).size).toBeGreaterThan(0);
		expect(sharedShingles(SOURCE, paraphrase, { n: 7 }).size).toBe(0);
	});

	it('ignores shingles made only of stopwords', () => {
		const a = 'de la el y en los de la el y en los';
		expect(sharedShingles(a, a, { n: 4 }).size).toBe(0);
	});

	it('ignores shingles made of proper names and stopwords in both texts', () => {
		const a = 'Santo Domingo de los Tsachilas';
		const b = 'visitamos Santo Domingo de los Tsachilas ayer';
		expect(sharedShingles(a, b, { n: 5 }).size).toBe(0);
	});

	it('keeps name shingles when one side writes them in lowercase words', () => {
		const a = 'Santo Domingo de los Tsachilas';
		const b = 'santo domingo de los tsachilas';
		expect(sharedShingles(a, b, { n: 5 }).size).toBe(1);
	});

	it('returns empty for empty inputs and for n larger than the text', () => {
		expect(sharedShingles('', SOURCE).size).toBe(0);
		expect(sharedShingles(SOURCE, '').size).toBe(0);
		expect(sharedShingles('uno dos tres', 'uno dos tres', { n: 7 }).size).toBe(0);
	});
});

describe('overlapReport', () => {
	it('reports a full overlap for identical text', () => {
		const report = overlapReport(SOURCE, SOURCE, { n: 7 });
		expect(report.n).toBe(7);
		expect(report.shared).toBeGreaterThan(0);
		expect(report.ratio).toBe(1);
		expect(report.targetShingles).toBe(report.shared);
	});

	it('reports zero for original text', () => {
		const report = overlapReport(
			SOURCE,
			'Una frase completamente distinta sobre montanas nevadas y pueblos lejanos.'
		);
		expect(report).toMatchObject({ n: 7, shared: 0, ratio: 0, examples: [] });
	});

	it('caps readable examples', () => {
		const long = Array.from({ length: 40 }, (_, i) => `palabra${i}`).join(' ');
		const report = overlapReport(long, long, { n: 3, maxExamples: 4 });
		expect(report.examples).toHaveLength(4);
		expect(report.examples[0]).toBe('palabra0 palabra1 palabra2');
	});

	it('handles empty target without dividing by zero', () => {
		expect(overlapReport(SOURCE, '')).toMatchObject({ targetShingles: 0, shared: 0, ratio: 0 });
	});
});
