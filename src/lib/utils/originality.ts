/**
 * Originality metric: shared word n-grams ("shingles") between a source text
 * and a rewritten target text. Pure functions, no I/O.
 */

export interface Token {
	/** Lowercase, diacritics stripped (comparison form). */
	norm: string;
	/** True when the token started with an uppercase letter in the original. */
	cap: boolean;
}

export interface OverlapOptions {
	/** Shingle length in words. Default 7. */
	n?: number;
	/** Max readable examples in the report. Default 10. */
	maxExamples?: number;
}

export interface OverlapReport {
	n: number;
	/** Distinct target shingles that could count (not name-only or stopword-only). */
	targetShingles: number;
	/** Distinct counted shingles also present in the source. */
	shared: number;
	/** shared / targetShingles, 0 when the target has no shingles. */
	ratio: number;
	/** Readable shared sequences, capped. */
	examples: string[];
}

export const DEFAULT_N = 7;
export const DEFAULT_MAX_EXAMPLES = 10;

const STOPWORDS = new Set([
	'a',
	'al',
	'ante',
	'con',
	'de',
	'del',
	'e',
	'el',
	'en',
	'entre',
	'la',
	'las',
	'lo',
	'los',
	'o',
	'para',
	'por',
	'sin',
	'sobre',
	'u',
	'un',
	'una',
	'y'
]);

function stripNoise(text: string): string {
	return text
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/\[[^\]]*\]/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^[ \t]*(?:[-*+]|\d+[.)])[ \t]+/gm, '');
}

function stripDiacritics(word: string): string {
	return word.normalize('NFD').replace(/\p{M}/gu, '');
}

export function normalizeTokens(text: string): Token[] {
	const words = stripNoise(text).match(/[\p{L}\p{N}]+/gu) ?? [];
	return words.map((word) => ({
		norm: stripDiacritics(word).toLowerCase(),
		cap: /^\p{Lu}/u.test(word)
	}));
}

interface ShingleInfo {
	/** True while every occurrence in this text is stopwords/proper names only. */
	nameOnly: boolean;
}

function buildShingles(tokens: Token[], n: number): Map<string, ShingleInfo> {
	const shingles = new Map<string, ShingleInfo>();
	for (let i = 0; i + n <= tokens.length; i++) {
		const window = tokens.slice(i, i + n);
		const key = window.map((t) => t.norm).join(' ');
		const nameOnly = window.every((t) => STOPWORDS.has(t.norm) || t.cap);
		const known = shingles.get(key);
		if (known) known.nameOnly &&= nameOnly;
		else shingles.set(key, { nameOnly });
	}
	return shingles;
}

function isStopwordOnly(key: string): boolean {
	return key.split(' ').every((word) => STOPWORDS.has(word));
}

function countable(key: string, info: ShingleInfo): boolean {
	return !info.nameOnly && !isStopwordOnly(key);
}

export function sharedShingles(
	source: string,
	target: string,
	{ n = DEFAULT_N }: OverlapOptions = {}
): Set<string> {
	const src = buildShingles(normalizeTokens(source), n);
	const tgt = buildShingles(normalizeTokens(target), n);
	const shared = new Set<string>();
	for (const [key, tgtInfo] of tgt) {
		const srcInfo = src.get(key);
		if (!srcInfo || isStopwordOnly(key)) continue;
		if (srcInfo.nameOnly && tgtInfo.nameOnly) continue;
		shared.add(key);
	}
	return shared;
}

export function overlapReport(
	source: string,
	target: string,
	{ n = DEFAULT_N, maxExamples = DEFAULT_MAX_EXAMPLES }: OverlapOptions = {}
): OverlapReport {
	const shared = sharedShingles(source, target, { n });
	let targetShingles = 0;
	for (const [key, info] of buildShingles(normalizeTokens(target), n)) {
		if (countable(key, info)) targetShingles++;
	}
	return {
		n,
		targetShingles,
		shared: shared.size,
		ratio: targetShingles === 0 ? 0 : shared.size / targetShingles,
		examples: [...shared].slice(0, maxExamples)
	};
}
