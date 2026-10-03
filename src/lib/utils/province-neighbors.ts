/**
 * Land borders between the provinces of Ecuador (a geographic fact, not data entered by users).
 * Each pair is listed once; `NEIGHBOR_MAP` derives both directions so it is symmetric by
 * construction. Galápagos is an island province and has no land neighbours.
 *
 * Pairs that could not be confirmed are left out on purpose (Tungurahua - Morona Santiago,
 * Azuay - Zamora Chinchipe): a missing chip is better than a wrong one.
 */
const BORDERS: ReadonlyArray<readonly [string, string]> = [
	['esmeraldas', 'carchi'],
	['esmeraldas', 'imbabura'],
	['esmeraldas', 'pichincha'],
	['esmeraldas', 'santo-domingo-de-los-tsachilas'],
	['esmeraldas', 'manabi'],
	['manabi', 'santo-domingo-de-los-tsachilas'],
	['manabi', 'los-rios'],
	['manabi', 'guayas'],
	['manabi', 'santa-elena'],
	['los-rios', 'santo-domingo-de-los-tsachilas'],
	['los-rios', 'cotopaxi'],
	['los-rios', 'bolivar'],
	['los-rios', 'guayas'],
	['guayas', 'santa-elena'],
	['guayas', 'bolivar'],
	['guayas', 'chimborazo'],
	['guayas', 'canar'],
	['guayas', 'azuay'],
	['guayas', 'el-oro'],
	['el-oro', 'azuay'],
	['el-oro', 'loja'],
	['carchi', 'imbabura'],
	['carchi', 'sucumbios'],
	['imbabura', 'pichincha'],
	['imbabura', 'sucumbios'],
	['pichincha', 'santo-domingo-de-los-tsachilas'],
	['pichincha', 'cotopaxi'],
	['pichincha', 'napo'],
	['pichincha', 'sucumbios'],
	['santo-domingo-de-los-tsachilas', 'cotopaxi'],
	['cotopaxi', 'bolivar'],
	['cotopaxi', 'tungurahua'],
	['cotopaxi', 'napo'],
	['tungurahua', 'bolivar'],
	['tungurahua', 'chimborazo'],
	['tungurahua', 'napo'],
	['tungurahua', 'pastaza'],
	['bolivar', 'chimborazo'],
	['chimborazo', 'canar'],
	['chimborazo', 'morona-santiago'],
	['canar', 'azuay'],
	['canar', 'morona-santiago'],
	['azuay', 'loja'],
	['azuay', 'morona-santiago'],
	['loja', 'zamora-chinchipe'],
	['zamora-chinchipe', 'morona-santiago'],
	['morona-santiago', 'pastaza'],
	['pastaza', 'napo'],
	['pastaza', 'orellana'],
	['napo', 'orellana'],
	['napo', 'sucumbios'],
	['orellana', 'sucumbios']
];

const PROVINCE_SLUGS = [
	'esmeraldas',
	'manabi',
	'los-rios',
	'guayas',
	'santa-elena',
	'el-oro',
	'carchi',
	'imbabura',
	'pichincha',
	'santo-domingo-de-los-tsachilas',
	'cotopaxi',
	'tungurahua',
	'bolivar',
	'chimborazo',
	'canar',
	'azuay',
	'loja',
	'sucumbios',
	'orellana',
	'napo',
	'pastaza',
	'morona-santiago',
	'zamora-chinchipe',
	'galapagos'
];

function buildNeighborMap(): Record<string, string[]> {
	const map: Record<string, string[]> = Object.fromEntries(
		PROVINCE_SLUGS.map((slug) => [slug, [] as string[]])
	);
	for (const [a, b] of BORDERS) {
		map[a].push(b);
		map[b].push(a);
	}
	for (const slug of PROVINCE_SLUGS) map[slug].sort();
	return map;
}

export const NEIGHBOR_MAP: Readonly<Record<string, readonly string[]>> = buildNeighborMap();

/** Slugs of the provinces that share a land border with `slug`; empty when unknown or insular. */
export function neighborsOf(slug: string): string[] {
	return Object.hasOwn(NEIGHBOR_MAP, slug) ? [...NEIGHBOR_MAP[slug]] : [];
}
