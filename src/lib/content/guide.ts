import { slugify } from '$lib/utils/slug';
import { renderProvinceHtml } from './render';

export type GuideSection = { id: string; title: string; html: string };
export type GuideSource = { label: string; href: string; host: string };
export type Guide = { introHtml: string; sections: GuideSection[]; sources: GuideSource[] };

type RawSection = { title: string; lines: string[] };

const SECTION_HEADING = /^###[ \t]+(.+?)[ \t]*#*[ \t]*$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const SOURCES_TITLE = /^fuentes$/i;
const SOURCE_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/;

/** Heading markdown -> plain text (links keep their text, emphasis and code marks are dropped). */
function plainTitle(markdown: string): string {
	return markdown
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]/g, '')
		.trim();
}

/** Splits at `###` headings that are not inside a fenced code block. */
function splitSections(markdown: string): { intro: string; sections: RawSection[] } {
	const introLines: string[] = [];
	const sections: RawSection[] = [];
	let current: string[] = introLines;
	let fence: string | null = null;

	for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
		const fenceMatch = FENCE.exec(line);
		if (fenceMatch) {
			const marker = fenceMatch[1];
			if (fence === null) fence = marker;
			else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null;
		}
		const heading = fence === null ? SECTION_HEADING.exec(line) : null;
		if (heading) {
			current = [];
			sections.push({ title: plainTitle(heading[1]), lines: current });
		} else {
			current.push(line);
		}
	}
	return { intro: introLines.join('\n'), sections };
}

function parseSource(line: string): GuideSource | null {
	const match = SOURCE_ITEM.exec(line);
	if (!match) return null;
	try {
		const url = new URL(match[2]);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
		if (!url.hostname) return null;
		return {
			label: match[1].trim(),
			href: match[2],
			host: url.hostname.replace(/^www\./, '')
		};
	} catch {
		return null;
	}
}

function uniqueId(title: string, taken: Set<string>): string {
	const base = slugify(title) || 'seccion';
	let id = base;
	for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
	taken.add(id);
	return id;
}

/**
 * Splits a province article into an intro, `###` sections and a references list. The trailing
 * "Fuentes" section becomes `sources` (http/https links only). Every HTML fragment goes through
 * `renderProvinceHtml`, so the sanitizer allowlist still applies.
 */
export function parseGuide(markdown: string): Guide {
	const { intro, sections: raw } = splitSections(markdown);

	let sources: GuideSource[] = [];
	const last = raw[raw.length - 1];
	if (last && SOURCES_TITLE.test(last.title)) {
		raw.pop();
		sources = last.lines.flatMap((line) => parseSource(line) ?? []);
	}

	const taken = new Set<string>();
	return {
		introHtml: renderProvinceHtml(intro),
		sections: raw.map(({ title, lines }) => ({
			id: uniqueId(title, taken),
			title,
			html: renderProvinceHtml(lines.join('\n'))
		})),
		sources
	};
}
