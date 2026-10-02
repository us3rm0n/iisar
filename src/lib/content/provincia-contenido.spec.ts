import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchProvinceBody, saveProvinceBody } from './provincia-contenido';

/** Chainable PostgREST stand-in: every builder method returns itself and awaiting yields `result`. */
const state = {
	result: { data: null as unknown, error: null as { message: string; code?: string } | null }
};
const calls: { table: string; method: string; args: unknown[] }[] = [];
const client = {
	from(table: string) {
		const chain: Record<string, unknown> = {};
		for (const method of ['select', 'eq', 'upsert', 'maybeSingle']) {
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

describe('saveProvinceBody', () => {
	it('upserts by provincia_id and returns no error when the row came back', async () => {
		state.result = { data: { body: 'nuevo\n' }, error: null };
		await expect(saveProvinceBody(client, 'p1', 'nuevo\n')).resolves.toEqual({ error: null });
		expect(calls).toEqual([
			{
				table: 'provincia_contenido',
				method: 'upsert',
				args: [{ provincia_id: 'p1', body: 'nuevo\n' }, { onConflict: 'provincia_id' }]
			},
			{ table: 'provincia_contenido', method: 'select', args: ['body'] },
			{ table: 'provincia_contenido', method: 'maybeSingle', args: [] }
		]);
	});

	it('never sends updated_by', async () => {
		state.result = { data: { body: 'x' }, error: null };
		await saveProvinceBody(client, 'p1', 'x');
		const upsert = calls.find((c) => c.method === 'upsert');
		expect(JSON.stringify(upsert?.args)).not.toContain('updated_by');
	});

	it('maps an RLS violation to a permission message without leaking SQL details', async () => {
		state.result = {
			data: null,
			error: {
				code: '42501',
				message: 'new row violates row-level security policy for table "provincia_contenido"'
			}
		};
		await expect(saveProvinceBody(client, 'p1', 'x')).resolves.toEqual({
			error: 'No tenés permiso para editar este contenido.'
		});
	});

	it('treats a silent no-op (no row, no error) as a permission failure', async () => {
		state.result = { data: null, error: null };
		await expect(saveProvinceBody(client, 'p1', 'x')).resolves.toEqual({
			error: 'No tenés permiso para editar este contenido.'
		});
	});

	it('returns a generic Spanish message for other errors and does not leak details', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		state.result = { data: null, error: { message: 'connection reset by peer' } };
		const res = await saveProvinceBody(client, 'p1', 'x');
		expect(res.error).toBe('No se pudo guardar el contenido. Intentá de nuevo en unos minutos.');
		expect(res.error).not.toContain('connection');
	});
});
