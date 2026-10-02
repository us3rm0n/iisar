import { describe, expect, it } from 'vitest';
import { buildSeedSql } from './content-seed';

/** Extracts [slug, tag, body] from every emitted statement, mimicking Postgres dollar-quote lexing. */
function parse(sql: string): { slug: string; tag: string; body: string }[] {
	const out: { slug: string; tag: string; body: string }[] = [];
	const re = /select id, (\$[A-Za-z0-9_]*\$)/g;
	let match: RegExpExecArray | null;
	while ((match = re.exec(sql))) {
		const delim = match[1];
		const start = match.index + match[0].length;
		const end = sql.indexOf(delim, start);
		const body = sql.slice(start, end);
		const rest = sql.slice(end + delim.length);
		const slug =
			/^ from public\.provincias where slug = '([a-z0-9-]+)' on conflict \(provincia_id\) do nothing;/.exec(
				rest
			)?.[1];
		out.push({ slug: slug ?? '', tag: delim, body });
		re.lastIndex = end + delim.length;
	}
	return out;
}

describe('buildSeedSql', () => {
	it('emits a header, one idempotent insert per entry and a trailing newline', () => {
		const sql = buildSeedSql([{ slug: 'guayas', body: 'Hola' }]);
		expect(sql.startsWith('--')).toBe(true);
		expect(sql).toMatch(/generated/i);
		expect(sql).toMatch(/do not edit/i);
		expect(sql).toContain(
			"insert into public.provincia_contenido (provincia_id, body) select id, $c$Hola$c$ from public.provincias where slug = 'guayas' on conflict (provincia_id) do nothing;"
		);
		expect(sql.endsWith('\n')).toBe(true);
		expect(sql.endsWith('\n\n')).toBe(false);
	});

	it('is deterministic and sorted by slug regardless of input order', () => {
		const a = { slug: 'manabi', body: 'M' };
		const b = { slug: 'el-oro', body: 'E' };
		const c = { slug: 'guayas', body: 'G' };
		const one = buildSeedSql([a, b, c]);
		const two = buildSeedSql([c, a, b]);
		expect(one).toBe(two);
		expect(parse(one).map((e) => e.slug)).toEqual(['el-oro', 'guayas', 'manabi']);
	});

	it('does not mutate the input list', () => {
		const list = [
			{ slug: 'b', body: '1' },
			{ slug: 'a', body: '2' }
		];
		buildSeedSql(list);
		expect(list.map((e) => e.slug)).toEqual(['b', 'a']);
	});

	it('handles an empty list with header only', () => {
		const sql = buildSeedSql([]);
		expect(sql).not.toContain('insert into');
		expect(sql.startsWith('--')).toBe(true);
		expect(sql.endsWith('\n')).toBe(true);
	});

	it('chooses a different tag when the body contains $c$', () => {
		const body = 'precio $c$ raro';
		const [entry] = parse(buildSeedSql([{ slug: 'x', body }]));
		expect(entry.tag).not.toBe('$c$');
		expect(entry.body).toBe(body);
	});

	it('avoids a tag whose closing delimiter would form at the body boundary', () => {
		const body = 'termina en $c';
		const [entry] = parse(buildSeedSql([{ slug: 'x', body }]));
		expect(entry.tag).not.toBe('$c$');
		expect(entry.body).toBe(body);
	});

	it('keeps trying longer tags when several collide', () => {
		const body = '$c$ $c1$ $c2$';
		const [entry] = parse(buildSeedSql([{ slug: 'x', body }]));
		expect(entry.tag).not.toMatch(/^\$c[12]?\$$/);
		expect(entry.body).toBe(body);
	});

	it('throws when no safe tag can be found', () => {
		const tags = ['c', ...Array.from({ length: 64 }, (_, i) => `c${i + 1}`)];
		const body = tags.map((t) => `$${t}$`).join(' ');
		expect(() => buildSeedSql([{ slug: 'x', body }])).toThrow();
	});

	it.each(['Guayas', 'a b', "a'b", 'a;b', '', 'ñandú', 'a_b', '../x'])(
		'throws on invalid slug %j',
		(slug) => {
			expect(() => buildSeedSql([{ slug, body: 'x' }])).toThrow(/slug/i);
		}
	);

	it('throws on duplicate slugs', () => {
		expect(() =>
			buildSeedSql([
				{ slug: 'a', body: '1' },
				{ slug: 'a', body: '2' }
			])
		).toThrow(/duplicate/i);
	});

	it('round-trips special characters and multiline bodies intact', () => {
		const body =
			'# Título ñ á\n\nO\'Brien "dijo" \\n \\\\ back\\slash\n$1 $$ $a$ $ 50$\n| a | b |\n|---|---|\n😀 日本語\n\n';
		const [entry] = parse(buildSeedSql([{ slug: 'x', body }]));
		expect(entry.body).toBe(body);
	});

	it('round-trips an empty body', () => {
		const [entry] = parse(buildSeedSql([{ slug: 'x', body: '' }]));
		expect(entry.body).toBe('');
	});
});
