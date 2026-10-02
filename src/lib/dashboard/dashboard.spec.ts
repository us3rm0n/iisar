import { beforeEach, describe, expect, it, vi } from 'vitest';

const repo = vi.hoisted(() => ({
	fetchCategories: vi.fn(),
	fetchProvincias: vi.fn(),
	fetchBusinesses: vi.fn(),
	fetchLatestSubscriptions: vi.fn(),
	insertBusiness: vi.fn(),
	insertTrialSubscription: vi.fn(),
	setBusinessProvincia: vi.fn()
}));
const auth = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));

vi.mock('./repository', () => repo);
vi.mock('$lib/auth', () => auth);

import { Dashboard } from './dashboard.svelte';
import type { Business } from '$lib/types';

const business = (over: Partial<Business> = {}) =>
	({ id: 'b1', slug: 'sabor', provincia_id: null, provincias: null, ...over }) as Business;

beforeEach(() => {
	vi.resetAllMocks();
	repo.fetchCategories.mockResolvedValue([
		{ id: 'c1', nombre: 'Gastronomía', slug: 'gastronomia' }
	]);
	repo.fetchProvincias.mockResolvedValue({ provincias: [], error: null });
	repo.fetchBusinesses.mockResolvedValue([]);
	repo.fetchLatestSubscriptions.mockResolvedValue({});
});

describe('Dashboard.load', () => {
	it('stops loading without fetching data when logged out', async () => {
		auth.getCurrentUser.mockResolvedValue(null);
		const dashboard = new Dashboard();
		await dashboard.load();
		expect(dashboard.user).toBeNull();
		expect(dashboard.loading).toBe(false);
		expect(repo.fetchBusinesses).not.toHaveBeenCalled();
	});

	it('loads categories, provinces, businesses and subscriptions for the user', async () => {
		auth.getCurrentUser.mockResolvedValue({ id: 'u1', email: 'a@b.c' });
		repo.fetchProvincias.mockResolvedValue({
			provincias: [
				{ id: 'p1', slug: 'pichincha', nombre: 'Pichincha', region: 'sierra', orden: 1 }
			],
			error: null
		});
		repo.fetchBusinesses.mockResolvedValue([business()]);
		repo.fetchLatestSubscriptions.mockResolvedValue({ b1: { id: 's1' } });
		const dashboard = new Dashboard();
		await dashboard.load();
		expect(repo.fetchBusinesses).toHaveBeenCalledWith('u1');
		expect(repo.fetchLatestSubscriptions).toHaveBeenCalledWith([business()]);
		expect(dashboard.categories).toHaveLength(1);
		expect(dashboard.provinciasByRegion.map((g) => g.region)).toEqual(['sierra']);
		expect(dashboard.subscriptions).toEqual({ b1: { id: 's1' } });
		expect(dashboard.loading).toBe(false);
	});

	it('surfaces a province loading error', async () => {
		auth.getCurrentUser.mockResolvedValue({ id: 'u1' });
		repo.fetchProvincias.mockResolvedValue({ provincias: [], error: 'No se pudieron cargar' });
		const dashboard = new Dashboard();
		await dashboard.load();
		expect(dashboard.provinciaError).toBe('No se pudieron cargar');
	});
});

describe('Dashboard.create', () => {
	async function ready() {
		auth.getCurrentUser.mockResolvedValue({ id: 'u1' });
		const dashboard = new Dashboard();
		await dashboard.load();
		vi.clearAllMocks();
		repo.fetchCategories.mockResolvedValue([]);
		repo.fetchProvincias.mockResolvedValue({ provincias: [], error: null });
		repo.fetchBusinesses.mockResolvedValue([]);
		repo.fetchLatestSubscriptions.mockResolvedValue({});
		auth.getCurrentUser.mockResolvedValue({ id: 'u1' });
		return dashboard;
	}

	it('rejects an empty name without touching the database', async () => {
		const dashboard = await ready();
		await dashboard.create();
		expect(dashboard.formError).toBe('Nombre y slug son requeridos');
		expect(repo.insertBusiness).not.toHaveBeenCalled();
		expect(dashboard.creating).toBe(false);
	});

	it('creates the business and trial, reports success, resets and reloads', async () => {
		const dashboard = await ready();
		dashboard.form.nombre = 'Sabor Andino';
		repo.insertBusiness.mockResolvedValue({ id: 'b9', slug: 'sabor-andino' });
		await dashboard.create();
		expect(repo.insertBusiness).toHaveBeenCalledWith(
			expect.objectContaining({ owner_id: 'u1', slug: 'sabor-andino', nombre: 'Sabor Andino' })
		);
		expect(repo.insertTrialSubscription).toHaveBeenCalledWith('b9');
		expect(dashboard.formMessage).toBe(
			'¡Negocio creado! Prueba 7 días activa. Ver en /negocio/sabor-andino'
		);
		expect(dashboard.formError).toBe('');
		expect(dashboard.form.nombre).toBe('');
		expect(repo.fetchBusinesses).toHaveBeenCalledTimes(1);
		expect(dashboard.creating).toBe(false);
	});

	it('shows the insert error and skips the trial', async () => {
		const dashboard = await ready();
		dashboard.form.nombre = 'Sabor';
		repo.insertBusiness.mockRejectedValue(new Error('duplicate slug'));
		await dashboard.create();
		expect(dashboard.formError).toBe('duplicate slug');
		expect(repo.insertTrialSubscription).not.toHaveBeenCalled();
		expect(dashboard.form.nombre).toBe('Sabor');
		expect(dashboard.creating).toBe(false);
	});

	it('shows the trial error and does not reset the form', async () => {
		const dashboard = await ready();
		dashboard.form.nombre = 'Sabor';
		repo.insertBusiness.mockResolvedValue({ id: 'b9', slug: 'sabor' });
		repo.insertTrialSubscription.mockRejectedValue(new Error('Negocio creado pero trial falló: x'));
		await dashboard.create();
		expect(dashboard.formError).toBe('Negocio creado pero trial falló: x');
		expect(dashboard.formMessage).toBe('');
		expect(dashboard.form.nombre).toBe('Sabor');
	});

	it('uses a generic message for non-Error rejections', async () => {
		const dashboard = await ready();
		dashboard.form.nombre = 'Sabor';
		repo.insertBusiness.mockRejectedValue('nope');
		await dashboard.create();
		expect(dashboard.formError).toBe('Error desconocido');
	});
});

describe('Dashboard.changeProvincia', () => {
	async function ready() {
		auth.getCurrentUser.mockResolvedValue({ id: 'u1' });
		repo.fetchProvincias.mockResolvedValue({
			provincias: [
				{ id: 'p1', slug: 'pichincha', nombre: 'Pichincha', region: 'sierra', orden: 1 }
			],
			error: null
		});
		repo.fetchBusinesses.mockResolvedValue([business()]);
		const dashboard = new Dashboard();
		await dashboard.load();
		return dashboard;
	}

	it('updates the business and its embedded province on success', async () => {
		const dashboard = await ready();
		repo.setBusinessProvincia.mockResolvedValue(null);
		const ok = await dashboard.changeProvincia(dashboard.businesses[0], 'p1');
		expect(ok).toBe(true);
		expect(repo.setBusinessProvincia).toHaveBeenCalledWith('b1', 'p1');
		expect(dashboard.businesses[0].provincia_id).toBe('p1');
		expect(dashboard.businesses[0].provincias).toEqual([
			{ nombre: 'Pichincha', slug: 'pichincha' }
		]);
	});

	it('clears the province when the empty option is chosen', async () => {
		const dashboard = await ready();
		repo.setBusinessProvincia.mockResolvedValue(null);
		await dashboard.changeProvincia(dashboard.businesses[0], '');
		expect(repo.setBusinessProvincia).toHaveBeenCalledWith('b1', null);
		expect(dashboard.businesses[0].provincias).toBeNull();
	});

	it('keeps the old value and reports the error on failure, clearing it on the next try', async () => {
		const dashboard = await ready();
		repo.setBusinessProvincia.mockResolvedValueOnce('denied').mockResolvedValueOnce(null);
		expect(await dashboard.changeProvincia(dashboard.businesses[0], 'p1')).toBe(false);
		expect(dashboard.provinciaError).toBe('No se pudo actualizar la provincia: denied');
		expect(dashboard.businesses[0].provincia_id).toBeNull();
		expect(await dashboard.changeProvincia(dashboard.businesses[0], 'p1')).toBe(true);
		expect(dashboard.provinciaError).toBe('');
	});
});
