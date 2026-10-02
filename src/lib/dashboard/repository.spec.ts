import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Chainable PostgREST stand-in: every builder method returns itself and awaiting yields `result`. */
const db = vi.hoisted(() => {
	const state = { result: { data: null as unknown, error: null as { message: string } | null } };
	const calls: { table: string; method: string; args: unknown[] }[] = [];
	const from = (table: string) => {
		const chain: Record<string, unknown> = {};
		for (const method of [
			'select',
			'insert',
			'update',
			'eq',
			'order',
			'limit',
			'single',
			'maybeSingle'
		]) {
			chain[method] = (...args: unknown[]) => {
				calls.push({ table, method, args });
				return chain;
			};
		}
		chain.then = (resolve: (value: unknown) => unknown) => resolve(state.result);
		return chain;
	};
	return { state, calls, from };
});

vi.mock('$lib/supabase', () => ({ supabase: { from: db.from, auth: { signOut: vi.fn() } } }));

import {
	fetchLatestSubscriptions,
	fetchProvincias,
	insertBusiness,
	insertTrialSubscription,
	setBusinessProvincia
} from './repository';
import type { Business } from '$lib/types';

beforeEach(() => {
	db.calls.length = 0;
	db.state.result = { data: null, error: null };
});

describe('fetchProvincias', () => {
	it('returns rows without error', async () => {
		db.state.result = { data: [{ id: 'p1' }], error: null };
		expect(await fetchProvincias()).toEqual({ provincias: [{ id: 'p1' }], error: null });
	});

	it('reports the failure in Spanish and returns no rows', async () => {
		db.state.result = { data: null, error: { message: 'boom' } };
		expect(await fetchProvincias()).toEqual({
			provincias: [],
			error: 'No se pudieron cargar las provincias: boom'
		});
	});
});

describe('insertBusiness', () => {
	it('returns the created id and slug', async () => {
		db.state.result = { data: { id: 'b1', slug: 's' }, error: null };
		expect(await insertBusiness({ nombre: 'x' })).toEqual({ id: 'b1', slug: 's' });
	});

	it('throws the database message', async () => {
		db.state.result = { data: null, error: { message: 'duplicate slug' } };
		await expect(insertBusiness({ nombre: 'x' })).rejects.toThrow('duplicate slug');
	});
});

describe('insertTrialSubscription', () => {
	it('inserts an approved zero-cost trial', async () => {
		await insertTrialSubscription('b1');
		expect(db.calls.find((c) => c.method === 'insert')?.args[0]).toEqual({
			business_id: 'b1',
			type: 'prueba',
			total: 0,
			medio_pago: 'trial',
			status: 'aprobada'
		});
	});

	it('explains that the business exists when the trial fails', async () => {
		db.state.result = { data: null, error: { message: 'rls' } };
		await expect(insertTrialSubscription('b1')).rejects.toThrow(
			'Negocio creado pero trial falló: rls'
		);
	});
});

describe('setBusinessProvincia', () => {
	it('returns null on success and updates the right row', async () => {
		expect(await setBusinessProvincia('b1', 'p1')).toBeNull();
		expect(db.calls.find((c) => c.method === 'update')?.args[0]).toEqual({ provincia_id: 'p1' });
		expect(db.calls.find((c) => c.method === 'eq')?.args).toEqual(['id', 'b1']);
	});

	it('returns the error message on failure', async () => {
		db.state.result = { data: null, error: { message: 'denied' } };
		expect(await setBusinessProvincia('b1', null)).toBe('denied');
	});
});

describe('fetchLatestSubscriptions', () => {
	it('keys the latest subscription by business and skips businesses without one', async () => {
		db.state.result = { data: { id: 's1' }, error: null };
		const result = await fetchLatestSubscriptions([{ id: 'b1' }, { id: 'b2' }] as Business[]);
		expect(Object.keys(result)).toEqual(['b1', 'b2']);

		db.state.result = { data: null, error: null };
		expect(await fetchLatestSubscriptions([{ id: 'b3' }] as Business[])).toEqual({});
	});
});
