import { slugify } from '$lib/utils/slug';
import type { ProvinciaRegion } from '$lib/types';

export type ParsedLesson = {
	order: number;
	title: string;
	slug: string;
	body: string;
};

export type ParsedEcuadorContent = {
	general: ParsedLesson[];
	regions: Partial<Record<ProvinciaRegion, ParsedLesson>>;
	provincias: Record<string, ParsedLesson>;
};

const HEADING_RE = /^##\s+(.+?)\s*$/;
const LESSON_RE = /^Lecci[oó]n\s+(\d+)\s+—\s+(.+)$/;

// Palabras que identifican una lección de "región" (intro de Costa/Sierra/Amazonía/Insular)
// vs. una lección de provincia puntual.
const REGION_KEYWORDS: Array<[ProvinciaRegion, RegExp]> = [
	['costa', /Litoral|Costa/i],
	['sierra', /Interandina|Sierra/i],
	['amazonia', /Amaz[oó]nica|Oriental/i],
	['insular', /Insular|Gal[aá]pagos/i]
];

// Las lecciones 1 y 2 (relieve, clima) son contenido general, no atadas a una región/provincia.
const GENERAL_LESSON_NUMBERS = new Set([1, 2]);

function classifyRegion(title: string): ProvinciaRegion | null {
	for (const [key, re] of REGION_KEYWORDS) {
		if (re.test(title)) return key;
	}
	return null;
}

/**
 * Parsea `content/geografia-ecuador.md` en lecciones generales, de región y de provincia.
 * Puro: no toca el filesystem (ver `ecuador.server.ts` para la carga real del archivo).
 */
export function parseEcuadorLessons(markdown: string): ParsedEcuadorContent {
	const lines = markdown.split('\n');
	const sections: { title: string; bodyLines: string[] }[] = [];

	for (const line of lines) {
		const match = HEADING_RE.exec(line);
		if (match) {
			sections.push({ title: match[1].trim(), bodyLines: [] });
		} else if (sections.length > 0) {
			sections[sections.length - 1].bodyLines.push(line);
		}
	}

	const general: ParsedLesson[] = [];
	const regions: Partial<Record<ProvinciaRegion, ParsedLesson>> = {};
	const provincias: Record<string, ParsedLesson> = {};

	sections.forEach((section, index) => {
		const order = index + 1;
		const body = section.bodyLines.join('\n').trim();
		const lessonMatch = LESSON_RE.exec(section.title);
		const lessonNumber = lessonMatch ? Number(lessonMatch[1]) : null;
		const displayTitle = lessonMatch ? lessonMatch[2].trim() : section.title;

		if (section.title === 'Índice' || section.title === 'Evaluación') {
			general.push({ order, title: section.title, slug: slugify(section.title), body });
			return;
		}

		if (lessonNumber !== null && GENERAL_LESSON_NUMBERS.has(lessonNumber)) {
			general.push({ order, title: displayTitle, slug: slugify(displayTitle), body });
			return;
		}

		const regionKey = classifyRegion(displayTitle);
		if (regionKey) {
			const lesson: ParsedLesson = {
				order,
				title: displayTitle,
				slug: slugify(displayTitle),
				body
			};
			regions[regionKey] = lesson;
			return;
		}

		const slug = slugify(displayTitle);
		provincias[slug] = { order, title: displayTitle, slug, body };
	});

	// La región Insular solo tiene una provincia (Galápagos) y el contenido fuente la trata
	// como una sola lección combinada ("Región Insular o Galápagos"), sin lección propia de
	// provincia. Decisión de contenido: exponer ese mismo texto también como la provincia
	// "galapagos" para que /ecuador/galapagos tenga contenido, igual que las demás provincias.
	if (regions.insular && !provincias.galapagos) {
		provincias.galapagos = regions.insular;
	}

	return { general, regions, provincias };
}

/**
 * Envuelve cada `<table>` (con o sin atributos) en un contenedor con scroll horizontal,
 * para que las tablas anchas del contenido no rompan el layout mobile-first.
 */
export function wrapTables(html: string): string {
	return html
		.replace(/<table(\s[^>]*)?>/g, (tag) => `<div class="table-scroll">${tag}`)
		.replace(/<\/table>/g, '</table></div>');
}
