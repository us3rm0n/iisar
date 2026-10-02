import { describe, expect, it, vi } from 'vitest';
import { fetchSearchOptions, loadSearchOptions } from './options';

type Result = { data: unknown; error: { message: string } | null };

/** Chainable PostgREST stand-in: awaiting a table query yields that table's result. */
function fakeClient(results: Record<string, Result>) {
	const calls: { table: string; method: string; args: unknown[] }[] = [];
	const from = (table: string) => {
		const chain: Record<string, unknown> = {};
		for (const method of ['select', 'eq', 'order', 'not', 'limit']) {
			chain[method] = (...args: unknown[]) => {
				calls.push({ table, method, args });
				return chain;
			};
		}
		chain.then = (resolve: (value: unknown) => unknown) =>
			resolve(results[table] ?? { data: [], error: null });
		return chain;
	};
	return { client: { from } as never, calls };
}

describe('fetchSearchOptions', () => {
	it('returns categories and provincias on success', async () => {
		const { client, calls } = fakeClient({
			categories: { data: [{ id: 'c1', nombre: 'Salud', slug: 'salud' }], error: null },
			provincias: {
				data: [{ id: 'p1', slug: 'loja', nombre: 'Loja', region: 'sierra', orden: 1 }],
				error: null
			}
		});
		const options = await fetchSearchOptions(client);
		expect(options.categories).toHaveLength(1);
		expect(options.provincias).toHaveLength(1);
		expect(options.provinciasError).toBe(false);
		expect(calls).toContainEqual({ table: 'categories', method: 'eq', args: ['activo', true] });
		expect(calls).toContainEqual({ table: 'categories', method: 'order', args: ['nombre'] });
		expect(calls).toContainEqual({ table: 'provincias', method: 'order', args: ['orden'] });
	});

	it('returns an empty category list when categories fail, without throwing', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { client } = fakeClient({
			categories: { data: null, error: { message: 'boom' } },
			provincias: { data: [{ id: 'p1' }], error: null }
		});
		const options = await fetchSearchOptions(client);
		expect(options.categories).toEqual([]);
		expect(options.provincias).toHaveLength(1);
		expect(options.provinciasError).toBe(false);
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	it('flags provinciasError and returns an empty list when provincias fail', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { client } = fakeClient({
			categories: { data: [{ id: 'c1', nombre: 'Salud', slug: 'salud' }], error: null },
			provincias: { data: null, error: { message: 'boom' } }
		});
		const options = await fetchSearchOptions(client);
		expect(options.provincias).toEqual([]);
		expect(options.provinciasError).toBe(true);
		expect(options.categories).toHaveLength(1);
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});

describe('fetchSearchOptions business cities', () => {
	const provincias = {
		data: [
			{ id: 'p1', slug: 'loja', nombre: 'Loja', region: 'sierra', orden: 1 },
			{ id: 'p2', slug: 'manabi', nombre: 'Manabí', region: 'costa', orden: 2 }
		],
		error: null
	};

	it('maps provincia_id to the slug and queries only active businesses with a city', async () => {
		const { client, calls } = fakeClient({
			provincias,
			businesses: {
				data: [
					{ ciudad: 'Manta', provincia_id: 'p2' },
					{ ciudad: 'Zamora', provincia_id: null },
					{ ciudad: 'Cuenca', provincia_id: 'unknown' }
				],
				error: null
			}
		});
		const { ciudades } = await fetchSearchOptions(client);
		expect(ciudades).toEqual([
			{ ciudad: 'Manta', provinciaSlug: 'manabi' },
			{ ciudad: 'Zamora', provinciaSlug: null },
			{ ciudad: 'Cuenca', provinciaSlug: null }
		]);
		expect(calls).toContainEqual({
			table: 'businesses',
			method: 'select',
			args: ['ciudad,provincia_id']
		});
		expect(calls).toContainEqual({ table: 'businesses', method: 'eq', args: ['estado', 'activo'] });
		expect(calls).toContainEqual({
			table: 'businesses',
			method: 'not',
			args: ['ciudad', 'is', null]
		});
		expect(calls).toContainEqual({ table: 'businesses', method: 'limit', args: [500] });
	});

	it('de-duplicates by normalized name keeping the first spelling', async () => {
		const { client } = fakeClient({
			provincias,
			businesses: {
				data: [
					{ ciudad: 'Quevedo', provincia_id: 'p1' },
					{ ciudad: ' QUEVEDO ', provincia_id: 'p2' },
					{ ciudad: 'Mantá', provincia_id: null },
					{ ciudad: 'manta', provincia_id: null },
					{ ciudad: '  ', provincia_id: null }
				],
				error: null
			}
		});
		const { ciudades } = await fetchSearchOptions(client);
		expect(ciudades).toEqual([
			{ ciudad: 'Quevedo', provinciaSlug: 'loja' },
			{ ciudad: 'Mantá', provinciaSlug: null }
		]);
	});

	it('returns at most 200 cities', async () => {
		const rows = Array.from({ length: 300 }, (_, i) => ({
			ciudad: `Ciudad ${i}`,
			provincia_id: null
		}));
		const { client } = fakeClient({ provincias, businesses: { data: rows, error: null } });
		expect((await fetchSearchOptions(client)).ciudades).toHaveLength(200);
	});

	it('logs a failed query and returns no cities without flagging provinciasError', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { client } = fakeClient({
			provincias,
			businesses: { data: null, error: { message: 'boom' } }
		});
		const options = await fetchSearchOptions(client);
		expect(options.ciudades).toEqual([]);
		expect(options.provinciasError).toBe(false);
		expect(options.provincias).toHaveLength(2);
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});

describe('loadSearchOptions (never throws: it runs in the layout of every page)', () => {
	it('returns the options when everything works', async () => {
		const { client } = fakeClient({
			categories: { data: [{ id: 'c1', nombre: 'Salud', slug: 'salud' }], error: null },
			provincias: { data: [{ id: 'p1' }], error: null }
		});
		const options = await loadSearchOptions(() => client);
		expect(options.categories).toHaveLength(1);
		expect(options.provinciasError).toBe(false);
	});

	it('returns empty lists and flags provinciasError when a query rejects', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const rejecting = {
			from: () => {
				const chain: Record<string, unknown> = {};
				for (const method of ['select', 'eq', 'order', 'not', 'limit']) chain[method] = () => chain;
				chain.then = (_resolve: unknown, reject: (reason: unknown) => unknown) =>
					reject(new Error('network down'));
				return chain;
			}
		};
		const options = await loadSearchOptions(() => rejecting as never);
		expect(options).toEqual({
			categories: [],
			provincias: [],
			ciudades: [],
			provinciasError: true
		});
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});

	it('returns empty lists and flags provinciasError when creating the client throws', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const options = await loadSearchOptions(() => {
			throw new Error('no env');
		});
		expect(options).toEqual({
			categories: [],
			provincias: [],
			ciudades: [],
			provinciasError: true
		});
		expect(spy).toHaveBeenCalled();
		spy.mockRestore();
	});
});
