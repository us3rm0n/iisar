const NON_PROSE = /^(#{1,6}(\s|$)|[-*+]\s|\d+[.)]\s|>|\||```|~~~|(-{3,}|\*{3,}|_{3,})\s*$)/;
const SOURCES_HEADING = /^#{1,6}\s*fuentes\b/i;

function toPlainText(text: string): string {
	return text
		.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/<[^>]*>/g, '')
		.replace(/`+([^`]*)`+/g, '$1')
		.replace(/(\*\*|__)(.+?)\1/g, '$2')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/(^|[^\p{L}\p{N}])_([^_]+)_(?![\p{L}\p{N}])/gu, '$1$2')
		.replace(/[<>]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function truncate(text: string, maxChars: number): string {
	if (text.length <= maxChars) return text;
	const room = Math.max(0, maxChars - 1);
	let cut = text.slice(0, room);
	if (text[room] !== ' ') {
		const lastSpace = cut.lastIndexOf(' ');
		if (lastSpace > 0) cut = cut.slice(0, lastSpace);
	}
	return `${cut.trimEnd()}…`;
}

/**
 * First paragraph of real prose of a markdown article, as plain text (never
 * markup). Skips headings, lists, quotes, tables and everything from a
 * `### Fuentes` heading on.
 */
export function markdownExcerpt(markdown: string, maxChars = 220): string {
	const paragraph: string[] = [];

	for (const raw of markdown.split(/\r?\n/)) {
		const line = raw.trim();
		if (SOURCES_HEADING.test(line)) break;
		if (line === '' || NON_PROSE.test(line)) {
			if (paragraph.length) break;
			continue;
		}
		paragraph.push(line);
	}

	const text = toPlainText(paragraph.join(' '));
	return text ? truncate(text, maxChars) : '';
}
