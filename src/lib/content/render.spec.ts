import { describe, expect, it } from 'vitest';
import { renderProvinceHtml, wrapTables } from './render';

describe('renderProvinceHtml: legit markdown', () => {
	it('returns an empty string for empty or whitespace input', () => {
		expect(renderProvinceHtml('')).toBe('');
		expect(renderProvinceHtml('  \n\t ')).toBe('');
	});

	it('renders headings, paragraphs, emphasis and lists', () => {
		const out = renderProvinceHtml(
			'### Clima\n\nTexto con **negrita** y *énfasis*.\n\n- uno\n- dos\n\n1. a\n2. b\n'
		);
		expect(out).toContain('<h3>Clima</h3>');
		expect(out).toContain('<strong>negrita</strong>');
		expect(out).toContain('<em>énfasis</em>');
		expect(out).toContain('<ul>');
		expect(out).toContain('<ol>');
		expect(out).toContain('<li>uno</li>');
	});

	it('renders blockquotes, inline code and escaped fenced code', () => {
		const out = renderProvinceHtml('> cita\n\nUsa `x`.\n\n```\n<script>alert(1)</script>\n```\n');
		expect(out).toContain('<blockquote>');
		expect(out).toContain('<code>x</code>');
		expect(out).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
		expect(out).not.toContain('<script');
	});

	it('wraps GFM tables in .table-scroll', () => {
		const out = renderProvinceHtml('| a | b |\n|---|---|\n| 1 | 2 |\n');
		expect(out).toContain('<div class="table-scroll"><table>');
		expect(out).toContain('</table></div>');
		expect(out).toContain('<th>a</th>');
	});

	it('keeps http, https, mailto, relative and anchor links', () => {
		const out = renderProvinceHtml(
			'[a](http://a.test) [b](https://b.test) [c](mailto:c@d.test) [d](/ecuador) [e](#fuentes)'
		);
		expect(out).toContain('href="http://a.test"');
		expect(out).toContain('href="https://b.test"');
		expect(out).toContain('href="mailto:c@d.test"');
		expect(out).toContain('href="/ecuador"');
		expect(out).toContain('href="#fuentes"');
	});

	it('renders a Fuentes list with hardened external links', () => {
		const out = renderProvinceHtml(
			'### Fuentes\n\n- [INEC](https://www.ecuadorencifras.gob.ec)\n- [Wiki](https://es.wikipedia.org/wiki/Ecuador)\n'
		);
		expect(out).toContain('<h3>Fuentes</h3>');
		expect(out.match(/rel="noopener noreferrer"/g)).toHaveLength(2);
		expect(out.match(/target="_blank"/g)).toHaveLength(2);
	});

	it('does not add target to relative links', () => {
		const out = renderProvinceHtml('[x](/ecuador/pichincha)');
		expect(out).not.toContain('target=');
	});
});

describe('renderProvinceHtml: hostile markdown', () => {
	const hostileLinks = [
		'[x](javascript:alert(1))',
		'[x](JaVaScRiPt:alert(1))',
		'[x](&#106;avascript:alert(1))',
		'[x](java\tscript:alert(1))',
		'[x](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)'
	];

	for (const md of hostileLinks) {
		it(`neutralises ${JSON.stringify(md)}`, () => {
			const out = renderProvinceHtml(md);
			expect(out).not.toMatch(/href="\s*(javascript|data|vbscript)/i);
			expect(out).not.toMatch(/href=/i);
		});
	}

	it('neutralises raw HTML embedded in markdown', () => {
		const out = renderProvinceHtml(
			'### T\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n<div style="x">y</div>\n'
		);
		expect(out).toContain('<h3>T</h3>');
		expect(out).not.toMatch(/<(script|img|div style)/i);
	});
});

describe('wrapTables', () => {
	it('wraps every table, with or without attributes, in .table-scroll', () => {
		const html = '<table><tr><td>a</td></tr></table><table class="x"><tr><td>b</td></tr></table>';
		expect(wrapTables(html)).toBe(
			'<div class="table-scroll"><table><tr><td>a</td></tr></table></div>' +
				'<div class="table-scroll"><table class="x"><tr><td>b</td></tr></table></div>'
		);
	});

	it('leaves html without tables untouched', () => {
		expect(wrapTables('<p>sin tablas</p>')).toBe('<p>sin tablas</p>');
	});
});
