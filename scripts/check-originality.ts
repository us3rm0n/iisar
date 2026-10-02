/**
 * Measures shared word n-grams between a source text and rewritten content.
 *
 * Usage:
 *   pnpm check:originality -- --source <commit>:content/geografia-ecuador.md --target content/provincias [--n 7] [--max 0]
 *
 * The source book transcription was removed from the working tree (chore(content) commit that
 * follows 7fd7af3); it now exists only in git history. Use commit 15fdc3a (or any commit before
 * the removal) as <commit>, e.g. `--source 15fdc3a:content/geografia-ecuador.md`.
 *
 * Exit code 1 when shared shingles exceed --max (default 0).
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { DEFAULT_N, overlapReport } from '../src/lib/utils/originality.ts';

function readSource(spec: string): string {
	const match = /^([^:/\s][^:\s]*):(.+)$/.exec(spec);
	if (match) {
		const [, ref, path] = match;
		return execFileSync('git', ['show', `${ref}:${path}`], {
			encoding: 'utf8',
			maxBuffer: 64 * 1024 * 1024
		});
	}
	return readFileSync(spec, 'utf8');
}

function listTargets(target: string): string[] {
	if (!statSync(target).isDirectory()) return [target];
	return readdirSync(target, { recursive: true, encoding: 'utf8' })
		.filter((name) => name.endsWith('.md'))
		.sort()
		.map((name) => join(target, name));
}

function main(): number {
	const { values } = parseArgs({
		args: process.argv.slice(2).filter((arg) => arg !== '--'),
		options: {
			source: { type: 'string' },
			target: { type: 'string' },
			n: { type: 'string', default: String(DEFAULT_N) },
			max: { type: 'string', default: '0' }
		}
	});
	const n = Number(values.n);
	const max = Number(values.max);
	if (!values.source || !values.target || !Number.isInteger(n) || n < 1 || !(max >= 0)) {
		console.error(
			'Usage: check:originality --source <git-ref>:<path> --target <path-or-dir> [--n 7] [--max 0]'
		);
		return 2;
	}

	const source = readSource(values.source);
	const files = listTargets(values.target);
	if (files.length === 0) {
		console.error(`No .md files found in ${values.target}`);
		return 2;
	}

	const texts = files.map((file) => readFileSync(file, 'utf8'));
	if (files.length > 1) {
		for (const [i, file] of files.entries()) {
			const report = overlapReport(source, texts[i], { n });
			console.log(
				`${file}: shared ${report.shared}/${report.targetShingles} (${(report.ratio * 100).toFixed(1)}%)`
			);
			for (const example of report.examples) console.log(`  - ${example}`);
		}
	}

	const total = overlapReport(source, texts.join('\n\n'), { n });
	if (files.length === 1) for (const example of total.examples) console.log(`  - ${example}`);
	const verdict = total.shared > max ? 'FAIL' : 'OK';
	console.log(
		`${verdict}: n=${n} files=${files.length} shared=${total.shared}/${total.targetShingles} ` +
			`(${(total.ratio * 100).toFixed(1)}%) max=${max}`
	);
	return total.shared > max ? 1 : 0;
}

process.exitCode = main();
