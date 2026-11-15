import { beforeEach, describe, expect, it, vi } from 'vitest';

const repo = vi.hoisted(() => ({
	fetchCatalog: vi.fn(),
	insertCatalogItem: vi.fn(),
	updateCatalogItem: vi.fn(),
	deleteCatalogItem: vi.fn()
}));

vi.mock('./repository', () => repo);

import { Catalog } from './catalog.svelte';
import type { Business, ProductService } from '$lib/types';

const business = (over: Partial<Business> = {}) =>
	({ id: 'b1', tipo: 'negocio', nombre: 'Sabor', ...over }) as Business;

const item = (over: Partial<ProductService> = {}): ProductService => ({
	id: 'p1',
	tipo: 'producto',
	nombre: 'Almuerzo',
	descripcion: null,
	precio_estimado: 4.5,
	moneda: 'USD',
	imagen_url: null,
	orden: 0,
	...over
});

const confirmAll = () => true;

beforeEach(() => {
	vi.resetAllMocks();
	repo.fetchCatalog.mockResolvedValue([item()]);
	repo.insertCatalogItem.mockResolvedValue(undefined);
	repo.updateCatalogItem.mockResolvedValue(undefined);
	repo.deleteCatalogItem.mockResolvedValue(undefined);
});

async function loaded(over: Partial<Business> = {}) {
	const catalog = new Catalog();
	await catalog.load(business(over));
	return catalog;
}

describe('Catalog.load', () => {
	it('fetches the items of the business', async () => {
		const catalog = await loaded();
		expect(repo.fetchCatalog).toHaveBeenCalledWith('b1');
		expect(catalog.items).toHaveLength(1);
		expect(catalog.loading).toBe(false);
		expect(catalog.formOpen).toBe(false);
	});

	it('shows the error when fetching fails', async () => {
		repo.fetchCatalog.mockRejectedValue(new Error('boom'));
		const catalog = await loaded();
		expect(catalog.items).toEqual([]);
		expect(catalog.error).toBe('boom');
		expect(catalog.loading).toBe(false);
	});
});

describe('Catalog.startCreate / startEdit / cancel', () => {
	it('opens an empty form with the tipo allowed for artista', async () => {
		const catalog = await loaded({ tipo: 'artista' });
		catalog.startCreate();
		expect(catalog.formOpen).toBe(true);
		expect(catalog.editingId).toBeNull();
		expect(catalog.form.tipo).toBe('servicio');
		expect(catalog.tipos).toEqual(['servicio']);
	});

	it('prefills the form when editing', async () => {
		const catalog = await loaded();
		catalog.startEdit(item({ nombre: 'Café' }));
		expect(catalog.editingId).toBe('p1');
		expect(catalog.form.nombre).toBe('Café');
	});

	it('closes the form on cancel', async () => {
		const catalog = await loaded();
		catalog.startEdit(item());
		catalog.cancel();
		expect(catalog.formOpen).toBe(false);
		expect(catalog.editingId).toBeNull();
	});
});

describe('Catalog.save', () => {
	it('inserts a new item and reloads', async () => {
		const catalog = await loaded();
		catalog.startCreate();
		catalog.form.nombre = ' Café ';
		catalog.form.precio = '1,5';
		await catalog.save();
		expect(repo.insertCatalogItem).toHaveBeenCalledWith(
			expect.objectContaining({ business_id: 'b1', nombre: 'Café', precio_estimado: 1.5 })
		);
		expect(repo.fetchCatalog).toHaveBeenCalledTimes(2);
		expect(catalog.formOpen).toBe(false);
		expect(catalog.message).toBe('Ítem agregado');
		expect(catalog.saving).toBe(false);
	});

	it('updates an edited item', async () => {
		const catalog = await loaded();
		catalog.startEdit(item());
		catalog.form.nombre = 'Almuerzo ejecutivo';
		await catalog.save();
		expect(repo.updateCatalogItem).toHaveBeenCalledWith(
			'p1',
			expect.objectContaining({ nombre: 'Almuerzo ejecutivo' })
		);
		expect(repo.updateCatalogItem.mock.calls[0][1]).not.toHaveProperty('business_id');
		expect(catalog.message).toBe('Cambios guardados');
	});

	it('does not call the repository when the form is invalid', async () => {
		const catalog = await loaded();
		catalog.startCreate();
		await catalog.save();
		expect(repo.insertCatalogItem).not.toHaveBeenCalled();
		expect(catalog.error).toBe('El nombre es requerido');
		expect(catalog.formOpen).toBe(true);
	});

	it('keeps the form open and shows the repository error', async () => {
		repo.updateCatalogItem.mockRejectedValue(new Error('No se pudo guardar'));
		const catalog = await loaded();
		catalog.startEdit(item());
		await catalog.save();
		expect(catalog.error).toBe('No se pudo guardar');
		expect(catalog.formOpen).toBe(true);
		expect(catalog.saving).toBe(false);
	});
});

describe('Catalog.remove', () => {
	it('deletes after confirmation and reloads', async () => {
		const catalog = await loaded();
		await catalog.remove(item(), confirmAll);
		expect(repo.deleteCatalogItem).toHaveBeenCalledWith('p1');
		expect(repo.fetchCatalog).toHaveBeenCalledTimes(2);
		expect(catalog.message).toBe('Ítem eliminado');
	});

	it('does nothing when not confirmed', async () => {
		const catalog = await loaded();
		await catalog.remove(item(), () => false);
		expect(repo.deleteCatalogItem).not.toHaveBeenCalled();
	});

	it('shows the repository error', async () => {
		repo.deleteCatalogItem.mockRejectedValue(new Error('No se pudo eliminar'));
		const catalog = await loaded();
		await catalog.remove(item(), confirmAll);
		expect(catalog.error).toBe('No se pudo eliminar');
	});

	it('closes the form when deleting the item being edited', async () => {
		const catalog = await loaded();
		catalog.startEdit(item());
		await catalog.remove(item(), confirmAll);
		expect(catalog.formOpen).toBe(false);
	});
});
