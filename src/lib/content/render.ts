import { marked } from 'marked';
import { sanitizeArticleHtml } from './sanitize';

/**
 * Envuelve cada `<table>` (con o sin atributos) en un contenedor con scroll horizontal,
 * para que las tablas anchas del contenido no rompan el layout mobile-first.
 */
export function wrapTables(html: string): string {
	return html
		.replace(/<table(\s[^>]*)?>/g, (tag) => `<div class="table-scroll">${tag}`)
		.replace(/<\/table>/g, '</table></div>');
}

/**
 * Markdown -> sanitized HTML for province articles. The body is user-editable (webmaster), so it
 * is never trusted: sanitize BEFORE wrapping tables (the wrapper div is added afterwards).
 * Pure JS: safe on the server (Workers) and in the browser (editor preview).
 */
export function renderProvinceHtml(markdown: string): string {
	if (!markdown.trim()) return '';
	const html = marked.parse(markdown, { async: false, gfm: true });
	return wrapTables(sanitizeArticleHtml(html));
}
