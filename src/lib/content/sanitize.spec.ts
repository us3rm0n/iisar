import { describe, expect, it } from 'vitest';
import { sanitizeArticleHtml } from './sanitize';

const ALLOWED_TAGS =
	'h2|h3|h4|p|ul|ol|li|strong|em|a|br|hr|blockquote|code|pre|table|thead|tbody|tr|th|td';

/** Any `<` left in the output must open or close an allowlisted tag; everything else is escaped text. */
function expectOnlyAllowedMarkup(out: string) {
	const stray = out.match(new RegExp(`<(?!/?(?:${ALLOWED_TAGS})(?=[\\s>/]))`, 'g'));
	expect(stray).toBeNull();
}

describe('sanitizeArticleHtml: XSS vectors', () => {
	const vectors: [string, string][] = [
		['script', '<script>alert(1)</script>'],
		['img onerror', '<img src=x onerror=alert(1)>'],
		['svg onload', '<svg onload=alert(1)>'],
		['iframe javascript', '<iframe src="javascript:alert(1)"></iframe>'],
		['style', '<style>body{display:none}</style>'],
		['link', '<link rel="stylesheet" href="https://evil.test/x.css">'],
		['meta refresh', '<meta http-equiv="refresh" content="0;url=https://evil.test">'],
		['object', '<object data="x.swf"></object>'],
		['embed', '<embed src="x.swf">'],
		['form', '<form action="https://evil.test"><input name=a></form>'],
		['math', '<math><mi xlink:href="javascript:alert(1)">x</mi></math>'],
		['nested script', '<scr<script>ipt>alert(1)</scr</script>ipt>'],
		['uppercase', '<SCRIPT>alert(1)</SCRIPT><IMG SRC=x ONERROR=alert(1)>'],
		['base', '<base href="https://evil.test/">'],
		['div style', '<div style="background:url(javascript:alert(1))">x</div>']
	];

	for (const [name, payload] of vectors) {
		it(`neutralises ${name}`, () => {
			const out = sanitizeArticleHtml(payload);
			expectOnlyAllowedMarkup(out);
			expect(out).not.toMatch(/<script/i);
			expect(out).not.toMatch(
				/<(img|svg|iframe|style|link|meta|object|embed|form|math|base|div)\b/i
			);
		});
	}

	it('drops script and style bodies entirely', () => {
		expect(sanitizeArticleHtml('<p>a</p><script>alert(1)</script>')).toBe('<p>a</p>');
		expect(sanitizeArticleHtml('<style>body{display:none}</style><p>a</p>')).toBe('<p>a</p>');
	});

	it('removes HTML comments', () => {
		const out = sanitizeArticleHtml('<p>a</p><!-- <script>alert(1)</script> -->');
		expect(out).not.toContain('<!--');
		expect(out).not.toContain('<script');
	});

	it('strips style, class, id and on* attributes from allowed tags', () => {
		const out = sanitizeArticleHtml(
			'<p style="color:red" class="x" id="y" onclick="alert(1)" onmouseover="alert(1)">hi</p>'
		);
		expect(out).toBe('<p>hi</p>');
	});

	it('does not let a title break out of its attribute', () => {
		// The whole title must stay inside ONE quoted attribute value (no extra attributes).
		const single = /^<a href="\/x" title="[^"]*">x<\/a>$/;
		expect(
			sanitizeArticleHtml('<a href="/x" title="&quot; onmouseover=&quot;alert(1)">x</a>')
		).toMatch(single);
		expect(sanitizeArticleHtml(`<a href="/x" title='" onmouseover="alert(1)'>x</a>`)).toMatch(
			single
		);
	});
});

describe('sanitizeArticleHtml: href schemes', () => {
	const bad = [
		'javascript:alert(1)',
		'JaVaScRiPt:alert(1)',
		'&#106;avascript:alert(1)',
		'&#x6A;avascript:alert(1)',
		'java&Tab;script:alert(1)',
		'java&#9;script:alert(1)',
		'java\tscript:alert(1)',
		'java\nscript:alert(1)',
		'  javascript:alert(1)',
		'\u0001javascript:alert(1)',
		'javascript&colon;alert(1)',
		'vbscript:msgbox(1)',
		'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
		'//evil.test/x',
		'ftp://evil.test/x',
		'file:///etc/passwd'
	];

	for (const href of bad) {
		it(`drops href ${JSON.stringify(href)}`, () => {
			const out = sanitizeArticleHtml(`<a href="${href}">x</a>`);
			expect(out).not.toMatch(/href=/i);
			expect(out).toContain('>x</a>');
		});
	}

	const good: [string, string][] = [
		['https://example.com/a?b=1&amp;c=2', 'https://example.com/a?b=1&amp;c=2'],
		['http://example.com', 'http://example.com'],
		['mailto:hola@example.com', 'mailto:hola@example.com'],
		['/ecuador/pichincha', '/ecuador/pichincha'],
		['#fuentes', '#fuentes']
	];

	for (const [href, expected] of good) {
		it(`keeps href ${href}`, () => {
			expect(sanitizeArticleHtml(`<a href="${href}">x</a>`)).toContain(`href="${expected}"`);
		});
	}
});

describe('sanitizeArticleHtml: links and idempotency', () => {
	it('adds target and rel to external http(s) links only', () => {
		expect(sanitizeArticleHtml('<a href="https://example.com">x</a>')).toBe(
			'<a href="https://example.com" target="_blank" rel="noopener noreferrer">x</a>'
		);
		expect(sanitizeArticleHtml('<a href="http://example.com" title="t">x</a>')).toMatch(
			/target="_blank" rel="noopener noreferrer"/
		);
		for (const href of ['/ecuador', '#x', 'mailto:a@b.co']) {
			const out = sanitizeArticleHtml(`<a href="${href}">x</a>`);
			expect(out).not.toContain('target=');
			expect(out).not.toContain('rel=');
		}
	});

	it('ignores caller-supplied target and rel', () => {
		const out = sanitizeArticleHtml('<a href="https://e.com" target="_self" rel="opener">x</a>');
		expect(out).toBe('<a href="https://e.com" target="_blank" rel="noopener noreferrer">x</a>');
	});

	it('is idempotent', () => {
		const inputs = [
			'<h3>T</h3><p><a href="https://e.com" title="x">l</a> <strong>b</strong></p>',
			'<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">x</a>',
			'<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>',
			'<pre><code>&lt;b&gt; &amp; x</code></pre>'
		];
		for (const input of inputs) {
			const once = sanitizeArticleHtml(input);
			expect(sanitizeArticleHtml(once)).toBe(once);
		}
	});

	it('keeps all allowlisted structural tags', () => {
		const html =
			'<h2>a</h2><h3>b</h3><h4>c</h4><ul><li>x</li></ul><ol><li>y</li></ol><blockquote><p>q <em>e</em><br></p></blockquote><hr><table><thead><tr><th>h</th></tr></thead><tbody><tr><td>d</td></tr></tbody></table>';
		expect(sanitizeArticleHtml(html)).toBe(html);
	});
});
