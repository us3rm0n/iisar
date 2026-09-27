import { marked } from 'marked';
import type { ProvinciaRegion } from '$lib/types';
import { parseEcuadorLessons, wrapTables, type ParsedLesson } from './ecuador';

// `.server.ts`: SvelteKit garantiza que este módulo (y el markdown de 231 KB que carga)
// nunca llega al bundle de cliente. Usar solo desde `+page.server.ts` / `load`.
const files = import.meta.glob('/content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const markdown = files['/content/geografia-ecuador.md'] ?? '';
const parsed = parseEcuadorLessons(markdown);

export function getGeneralLessons(): ParsedLesson[] {
	return parsed.general;
}

export function getRegionContent(region: ProvinciaRegion): ParsedLesson | undefined {
	return parsed.regions[region];
}

export function getProvinceContent(slug: string): ParsedLesson | undefined {
	return parsed.provincias[slug];
}

/** Renderiza el cuerpo (markdown de confianza, del repo) de una lección a HTML. */
export function renderLessonHtml(lesson: ParsedLesson): string {
	return wrapTables(marked.parse(lesson.body, { async: false }) as string);
}
