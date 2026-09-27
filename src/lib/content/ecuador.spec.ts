import { describe, it, expect } from 'vitest';
import { parseEcuadorLessons, wrapTables } from './ecuador';

const FIXTURE = `# Geografía de Ecuador

## Índice

- algo

## Lección 1 — El relieve

Contenido de relieve.

## Lección 2 — El clima

Contenido de clima.

## Lección 3 — Región Litoral o Costa

Intro a la costa.

## Lección 4 — Esmeraldas

Contenido de Esmeraldas.

## Lección 5 — Manabí

Contenido de Manabí.

## Lección 22 — Región Amazónica u Oriental

Intro amazónica.

## Lección 23 — Sucumbíos

Contenido de Sucumbíos.

## Lección 29 — Región Insular o Galápagos

Contenido de Galápagos.

## Evaluación

Preguntas finales.
`;

describe('parseEcuadorLessons', () => {
	const parsed = parseEcuadorLessons(FIXTURE);

	it('classifies Índice and Evaluación as general', () => {
		const titles = parsed.general.map((l) => l.title);
		expect(titles).toContain('Índice');
		expect(titles).toContain('Evaluación');
	});

	it('classifies lessons 1 and 2 as general (relieve, clima)', () => {
		const titles = parsed.general.map((l) => l.title);
		expect(titles).toContain('El relieve');
		expect(titles).toContain('El clima');
	});

	it('classifies "Región ..." lessons by region key', () => {
		expect(parsed.regions.costa?.title).toBe('Región Litoral o Costa');
		expect(parsed.regions.costa?.body).toContain('Intro a la costa.');
		expect(parsed.regions.amazonia?.title).toBe('Región Amazónica u Oriental');
	});

	it('keys province lessons by ascii kebab slug', () => {
		expect(parsed.provincias.esmeraldas?.title).toBe('Esmeraldas');
		expect(parsed.provincias.esmeraldas?.body).toContain('Contenido de Esmeraldas.');
		expect(parsed.provincias.manabi?.title).toBe('Manabí');
		expect(parsed.provincias.sucumbios?.title).toBe('Sucumbíos');
	});

	it('aliases the insular region content as the galapagos province (only province in that region)', () => {
		expect(parsed.provincias.galapagos?.body).toContain('Contenido de Galápagos.');
	});

	it('preserves appearance order', () => {
		expect(parsed.general.find((l) => l.title === 'Índice')?.order).toBe(1);
		expect(parsed.general.find((l) => l.title === 'El relieve')?.order).toBe(2);
	});
});

describe('wrapTables', () => {
	it('wraps every table, with or without attributes, in a horizontal scroll container', () => {
		const html =
			'<p>a</p><table><tr><td>1</td></tr></table><table class="x"><tr><td>2</td></tr></table>';
		expect(wrapTables(html)).toBe(
			'<p>a</p><div class="table-scroll"><table><tr><td>1</td></tr></table></div>' +
				'<div class="table-scroll"><table class="x"><tr><td>2</td></tr></table></div>'
		);
	});

	it('leaves html without tables untouched', () => {
		expect(wrapTables('<p>sin tablas</p>')).toBe('<p>sin tablas</p>');
	});
});
