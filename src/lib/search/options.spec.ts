import { describe, expect, it, vi } from 'vitest';
import { fetchSearchOptions } from './options';

type Result = { data: unknown; error: { message: string } | null };

/** Chainable PostgREST stand-in: awaiting a table query yields that table's result. */
function fakeClient(results: Record<string, Result>) {
	const calls: { table: string; method: string; args: unknown[] }[] = [];
	const from = (table: string) => {
		const chain: Record<string, unknown> = {};
		for (const method of ['select', 'eq', 'order']) {
			chain[method] = (...args: unknown[]) => {
				calls.push({ table, method, args });
				return chain;
			};
		}
		chain.then = (resolve: (value: unknown) => unknown) => resolve(results[table]);
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
