import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseGuide } from './guide';

function article(slug: string): string {
	return readFileSync(new URL(`../../../content/provincias/${slug}.md`, import.meta.url), 'utf8');
}

describe('parseGuide with real articles', () => {
	it('splits manabi into intro, sections and sources', () => {
		const guide = parseGuide(article('manabi'));

		expect(guide.introHtml).toContain('Manabí se extiende sobre la costa central');
		expect(guide.introHtml).not.toContain('<h3');
		expect(guide.sections.map((s) => s.title)).toEqual([
			'Estaciones y paisajes protegidos',
			'Habitantes y trabajo',
			'Sombreros, mesa y memoria'
		]);
		expect(guide.sections.map((s) => s.id)).toEqual([
			'estaciones-y-paisajes-protegidos',
			'habitantes-y-trabajo',
			'sombreros-mesa-y-memoria'
		]);
		expect(guide.sections[1].html).toContain('<p>');
		expect(guide.sections[1].html).not.toContain('<h3');
		expect(guide.sections.some((s) => /^fuentes$/i.test(s.title))).toBe(false);
	});

	it('extracts the manabi sources with label, href and host without www', () => {
		const { sources } = parseGuide(article('manabi'));

		expect(sources).toHaveLength(7);
		expect(sources[0]).toEqual({
			label: 'Gobierno Provincial de Manabí: PDOT Manabí 2030',
			href: 'https://www.manabi.gob.ec/wp-content/uploads/2022/09/PDOT_Manabi_2030_v1.1..pdf',
			host: 'manabi.gob.ec'
		});
		expect(sources[2].host).toBe('congope.gob.ec');
	});

	it('parses every bundled article without losing its sources', () => {
		for (const slug of ['guayas', 'esmeraldas', 'imbabura', 'pichincha', 'los-rios']) {
			const guide = parseGuide(article(slug));
			expect(guide.sections.length, slug).toBeGreaterThan(0);
			expect(guide.sources.length, slug).toBeGreaterThan(0);
			expect(guide.introHtml, slug).not.toBe('');
		}
	});
});

describe('parseGuide edge cases', () => {
	it('returns an empty guide for empty or blank input', () => {
		const empty = { introHtml: '', sections: [], sources: [] };
		expect(parseGuide('')).toEqual(empty);
		expect(parseGuide('  \n\n ')).toEqual(empty);
	});

	it('keeps everything as intro when there are no sections', () => {
		const guide = parseGuide('Solo un párrafo.\n\nOtro párrafo.');
		expect(guide.introHtml).toContain('Otro párrafo.');
		expect(guide.sections).toEqual([]);
		expect(guide.sources).toEqual([]);
	});

	it('handles an article that starts with a section (empty intro)', () => {
		const guide = parseGuide('### Clima\n\nTexto.');
		expect(guide.introHtml).toBe('');
		expect(guide.sections).toHaveLength(1);
	});

	it('handles CRLF line endings', () => {
		const guide = parseGuide(
			'Intro.\r\n\r\n### Clima\r\n\r\nTexto.\r\n\r\n### Fuentes\r\n\r\n- [INEC: Censo](https://www.inec.gob.ec/x)\r\n'
		);
		expect(guide.sections.map((s) => s.title)).toEqual(['Clima']);
		expect(guide.sources).toEqual([
			{ label: 'INEC: Censo', href: 'https://www.inec.gob.ec/x', host: 'inec.gob.ec' }
		]);
	});

	it('makes duplicate section ids unique', () => {
		const guide = parseGuide('### Clima\n\na\n\n### Clima\n\nb\n\n### Clima\n\nc');
		expect(guide.sections.map((s) => s.id)).toEqual(['clima', 'clima-2', 'clima-3']);
	});

	it('falls back to a generic id when the title has no slug characters', () => {
		const guide = parseGuide('### ¿¡?!\n\na');
		expect(guide.sections[0].id).toBe('seccion');
	});

	it('does not split on headings inside code fences', () => {
		const guide = parseGuide(
			'### Uno\n\n```\n### no es seccion\n```\n\n~~~\n### tampoco\n~~~\n\nfin'
		);
		expect(guide.sections).toHaveLength(1);
		expect(guide.sections[0].html).toContain('no es seccion');
	});

	it('keeps #### headings inside their section', () => {
		const guide = parseGuide('### Uno\n\n#### Detalle\n\ntexto');
		expect(guide.sections).toHaveLength(1);
		expect(guide.sections[0].html).toContain('<h4');
	});

	it('does not treat ## or a hash without space as a section', () => {
		const guide = parseGuide('## Grande\n\n###sinespacio\n\ntexto');
		expect(guide.sections).toEqual([]);
	});

	it('uses plain text for titles, stripping inline markdown', () => {
		const guide = parseGuide('### El **Cotopaxi** y [la sierra](https://x.ec) `norte`\n\na');
		expect(guide.sections[0].title).toBe('El Cotopaxi y la sierra norte');
	});

	it('matches Fuentes case-insensitively and only as the last section', () => {
		const last = parseGuide('### Clima\n\na\n\n### FUENTES\n\n- [A](https://a.ec/x)');
		expect(last.sections.map((s) => s.title)).toEqual(['Clima']);
		expect(last.sources).toHaveLength(1);

		const middle = parseGuide('### Fuentes\n\n- [A](https://a.ec/x)\n\n### Clima\n\nb');
		expect(middle.sections.map((s) => s.title)).toEqual(['Fuentes', 'Clima']);
		expect(middle.sources).toEqual([]);
	});

	it('ignores unsafe, malformed and non-link source items', () => {
		const guide = parseGuide(
			[
				'### Fuentes',
				'',
				'- [Bueno](http://www.ejemplo.ec/a)',
				'- [Script](javascript:alert(1))',
				'- [Mail](mailto:a@b.ec)',
				'- [Relativo](/ecuador/manabi)',
				'- [Roto](https://)',
				'- texto suelto',
				'- [sin enlace]',
				'* [Estrella](https://b.ec/x "titulo")',
				'1. [Numerado](https://c.ec/y)',
				'',
				'Un párrafo final.'
			].join('\n')
		);
		expect(guide.sources).toEqual([
			{ label: 'Bueno', href: 'http://www.ejemplo.ec/a', host: 'ejemplo.ec' },
			{ label: 'Estrella', href: 'https://b.ec/x', host: 'b.ec' },
			{ label: 'Numerado', href: 'https://c.ec/y', host: 'c.ec' }
		]);
	});

	it('returns no sources when Fuentes has no list', () => {
		const guide = parseGuide('### Clima\n\na\n\n### Fuentes\n\nSin lista.');
		expect(guide.sections).toHaveLength(1);
		expect(guide.sources).toEqual([]);
	});

	it('sanitizes section html (scripts never survive)', () => {
		const guide = parseGuide('### Uno\n\n<script>alert(1)</script>texto');
		expect(guide.sections[0].html).not.toContain('<script');
	});
});
