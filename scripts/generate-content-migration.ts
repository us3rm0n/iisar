/**
 * Generates the SQL migration that seeds province articles into `provincia_contenido`.
 *
 * Usage:
 *   pnpm content:seed-sql [-- --out <path>]
 *
 * Reads content/provincias/<slug>.md (slug = file name without `.md`).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { buildSeedSql } from '../src/lib/utils/content-seed.ts';

const SOURCE_DIR = 'content/provincias';
const DEFAULT_OUT = 'supabase/migrations/20251002000002_provincia_contenido_seed.sql';
const MAX_BODY = 20000;

function main(): number {
	const { values } = parseArgs({ options: { out: { type: 'string', default: DEFAULT_OUT } } });
	const files = readdirSync(SOURCE_DIR)
		.filter((name) => name.endsWith('.md'))
		.sort();
	if (files.length === 0) {
		console.error(`No .md files found in ${SOURCE_DIR}`);
		return 2;
	}
	const entries = files.map((name) => ({
		slug: name.slice(0, -'.md'.length),
		body: readFileSync(join(SOURCE_DIR, name), 'utf8')
	}));
	const tooLong = entries.filter((e) => e.body.length > MAX_BODY);
	if (tooLong.length > 0) {
		for (const e of tooLong) console.error(`${e.slug}: ${e.body.length} chars exceeds ${MAX_BODY}`);
		return 1;
	}
	writeFileSync(values.out, buildSeedSql(entries));
	console.log(`Wrote ${values.out} (${entries.length} provinces)`);
	return 0;
}

process.exitCode = main();
