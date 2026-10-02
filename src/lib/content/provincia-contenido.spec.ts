import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchProvinceBody } from './provincia-contenido';

/** Chainable PostgREST stand-in: every builder method returns itself and awaiting yields `result`. */
const state = { result: { data: null as unknown, error: null as { message: string } | null } };
const calls: { table: string; method: string; args: unknown[] }[] = [];
const client = {
	from(table: string) {
		const chain: Record<string, unknown> = {};
		for (const method of ['select', 'eq', 'maybeSingle']) {
			chain[method] = (...args: unknown[]) => {
				calls.push({ table, method, args });
				return chain;
			};
		}
		chain.then = (resolve: (value: unknown) => unknown) => resolve(state.result);
		return chain;
	}
} as unknown as SupabaseClient;

beforeEach(() => {
	calls.length = 0;
	state.result = { data: null, error: null };
	vi.restoreAllMocks();
});

describe('fetchProvinceBody', () => {
	it('returns the body when the row exists', async () => {
		state.result = { data: { body: '### Hola' }, error: null };
		await expect(fetchProvinceBody(client, 'p1')).resolves.toEqual({
			body: '### Hola',
			error: null
		});
		expect(calls).toEqual([
			{ table: 'provincia_contenido', method: 'select', args: ['body'] },
			{ table: 'provincia_contenido', method: 'eq', args: ['provincia_id', 'p1'] },
			{ table: 'provincia_contenido', method: 'maybeSingle', args: [] }
		]);
	});

	it('returns a null body without error when there is no row', async () => {
		state.result = { data: null, error: null };
		await expect(fetchProvinceBody(client, 'p1')).resolves.toEqual({ body: null, error: null });
	});

	it('returns a Spanish error message when the query fails', async () => {
		state.result = { data: null, error: { message: 'boom' } };
		const res = await fetchProvinceBody(client, 'p1');
		expect(res.body).toBeNull();
		expect(res.error).toBe('No se pudo cargar el contenido de la provincia: boom');
	});
});
