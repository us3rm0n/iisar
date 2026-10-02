import { FilterXSS } from 'xss';

/**
 * Strict allowlist sanitizer for province articles. Pure JS (no DOM, no Node built-ins), so the
 * same function runs on the Cloudflare Workers runtime and in the browser (editor preview).
 *
 * Unknown tags are escaped as text (never passed through); `script`/`style` bodies are dropped.
 */
const WHITE_LIST: Record<string, string[]> = {
	h2: [],
	h3: [],
	h4: [],
	p: [],
	ul: [],
	ol: [],
	li: [],
	strong: [],
	em: [],
	a: ['href', 'title'],
	br: [],
	hr: [],
	blockquote: [],
	code: [],
	pre: [],
	table: [],
	thead: [],
	tbody: [],
	tr: [],
	th: [],
	td: []
};

const NAMED_ENTITIES: Record<string, string> = {
	tab: '\t',
	newline: '\n',
	colon: ':',
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	sol: '/',
	lpar: '(',
	rpar: ')'
};

/** Decodes the way a browser would before it parses the URL, so obfuscated schemes are caught. */
function decodeEntities(value: string): string {
	return value.replace(
		/&(?:#(\d+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z]+));?/g,
		(match, dec, hex, name) => {
			if (dec || hex) {
				const code = dec ? parseInt(dec, 10) : parseInt(hex, 16);
				return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
			}
			return NAMED_ENTITIES[String(name).toLowerCase()] ?? match;
		}
	);
}

/** Only http(s), mailto, root-relative paths and #anchors survive. Everything else is dropped. */
function isSafeHref(raw: string): boolean {
	// eslint-disable-next-line no-control-regex, no-irregular-whitespace -- browsers ignore these characters inside URLs
	const decoded = decodeEntities(raw).replace(/[\u0000- \u007f-\u009f​-‍﻿]/g, '');
	if (/^https?:\/\/[^/\\]/i.test(decoded) || /^mailto:/i.test(decoded)) return true;
	if (decoded.startsWith('#')) return true;
	return /^\/(?![/\\])/.test(decoded);
}

// Own escaper: `xss` is CommonJS and Node ESM only exposes the named exports it can detect statically.
function escapeAttrValue(value: string): string {
	return value.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const filter = new FilterXSS({
	whiteList: WHITE_LIST,
	stripIgnoreTagBody: ['script', 'style'],
	allowCommentTag: false,
	onTagAttr(tag, name, value) {
		if (tag === 'a' && name === 'href') {
			return isSafeHref(value) ? `href="${escapeAttrValue(value)}"` : '';
		}
		return undefined;
	}
});

const EXTERNAL_LINK = /<a\s([^>]*\bhref="https?:\/\/[^>]*)>/gi;

/** Sanitizes article HTML against a strict allowlist and hardens external links. Idempotent. */
export function sanitizeArticleHtml(html: string): string {
	return filter
		.process(html)
		.replace(
			EXTERNAL_LINK,
			(_m, attrs: string) => `<a ${attrs} target="_blank" rel="noopener noreferrer">`
		);
}
