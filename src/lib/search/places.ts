import type { ProvincialCapital } from './capitals';

export type PlaceKind = 'provincia' | 'ciudad';
export type Place = {
	kind: PlaceKind;
	name: string;
	provinciaSlug: string | null;
	provinciaNombre: string | null;
};

/** Lowercase, no diacritics, punctuation as spaces, collapsed and trimmed. */
export function normalizeText(text: string): string {
	return text
		.normalize('NFD')
		.replace(/\p{M}+/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
}

type BuildInput = {
	provincias: { slug: string; nombre: string }[];
	capitals: ProvincialCapital[];
	businessCities: { ciudad: string; provinciaSlug: string | null }[];
};

/**
 * Builds the searchable places: every province, then the capital cities (and
 * their aliases) and the cities found on businesses. Names are deduped by
 * normalized text; a city that shares its name with a province is dropped.
 */
export function buildPlaceIndex({ provincias, capitals, businessCities }: BuildInput): Place[] {
	const nombreBySlug = new Map(provincias.map((p) => [p.slug, p.nombre]));
	const provinceNames = new Set(provincias.map((p) => normalizeText(p.nombre)));

	const places: Place[] = provincias.map((p) => ({
		kind: 'provincia',
		name: p.nombre,
		provinciaSlug: p.slug,
		provinciaNombre: p.nombre
	}));

	const cities = new Map<string, Place>();
	const addCity = (name: string, slug: string | null) => {
		const key = normalizeText(name);
		if (!key || provinceNames.has(key) || cities.has(key)) return;
		const provinciaNombre = slug ? (nombreBySlug.get(slug) ?? null) : null;
		cities.set(key, {
			kind: 'ciudad',
			name: name.trim(),
			provinciaSlug: provinciaNombre ? slug : null,
			provinciaNombre
		});
	};

	for (const capital of capitals) {
		addCity(capital.city, capital.provinciaSlug);
		for (const alias of capital.aliases ?? []) addCity(alias, capital.provinciaSlug);
	}
	for (const business of businessCities) addCity(business.ciudad, business.provinciaSlug);

	const sorted = [...cities.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
	return [...places, ...sorted.map(([, place]) => place)];
}

function rank(name: string, query: string): number {
	if (name === query) return 0;
	if (name.startsWith(query)) return 1;
	if (name.split(' ').some((word) => word.startsWith(query))) return 2;
	return name.includes(query) ? 3 : -1;
}

/** Best places for a partial query: exact, prefix, word prefix, contains. */
export function matchPlaces(index: Place[], query: string, limit = 6): Place[] {
	const q = normalizeText(query);
	if (q.length < 2) return [];

	return index
		.map((place) => ({ place, name: normalizeText(place.name) }))
		.map((entry) => ({ ...entry, score: rank(entry.name, q) }))
		.filter((entry) => entry.score >= 0)
		.sort(
			(a, b) =>
				a.score - b.score ||
				(a.place.kind === b.place.kind ? 0 : a.place.kind === 'provincia' ? -1 : 1) ||
				(a.name < b.name ? -1 : a.name > b.name ? 1 : 0)
		)
		.slice(0, Math.max(0, limit))
		.map((entry) => entry.place);
}

/** The place whose normalized name equals the query (province wins); no fuzzy guessing. */
export function resolvePlace(index: Place[], query: string): Place | null {
	const q = normalizeText(query);
	if (!q) return null;
	const hits = index.filter((place) => normalizeText(place.name) === q);
	return hits.find((place) => place.kind === 'provincia') ?? hits[0] ?? null;
}
