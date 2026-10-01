import { describe, it, expect } from 'vitest';
import {
	REGION_LABELS,
	REGIONS,
	TIPO_LABELS,
	groupByRegion,
	regionLabel,
	tipoLabel
} from './provincias';
import type { Provincia } from '$lib/types';

function provincia(slug: string, region: Provincia['region']): Provincia {
	return { id: `id-${slug}`, slug, nombre: slug, region, orden: 1 };
}

describe('region taxonomy', () => {
	it('lists the four regions in canonical display order', () => {
		expect(REGIONS).toEqual(['costa', 'sierra', 'amazonia', 'insular']);
	});

	it('exposes one label per region, and only for declared regions', () => {
		expect(Object.keys(REGION_LABELS)).toEqual(REGIONS);
	});
});

describe('tipoLabel', () => {
	it('labels every declared business tipo', () => {
		expect(Object.keys(TIPO_LABELS)).toEqual(['negocio', 'artista', 'lugar']);
	});

	it('returns the raw tipo for unknown values instead of undefined', () => {
		expect(tipoLabel('bar')).toBe('bar');
	});
});

describe('regionLabel', () => {
	it('returns the Spanish label for a known region', () => {
		expect(regionLabel('amazonia')).toBe('Amazonía');
	});

	it('returns the raw region for unknown values instead of undefined', () => {
		expect(regionLabel('galapagos')).toBe('galapagos');
	});
});

describe('groupByRegion', () => {
	it('groups provincias under their region, preserving canonical region order', () => {
		const result = groupByRegion([
			provincia('napo', 'amazonia'),
			provincia('azuay', 'sierra'),
			provincia('guayas', 'costa')
		]);

		expect(result.map((g) => [g.region, g.provincias.map((p) => p.slug)])).toEqual([
			['costa', ['guayas']],
			['sierra', ['azuay']],
			['amazonia', ['napo']]
		]);
	});

	it('drops regions with no provincias so pages render no empty section', () => {
		const result = groupByRegion([provincia('azuay', 'sierra')]);

		expect(result.map((g) => g.region)).toEqual(['sierra']);
	});

	it('returns no groups for an empty list', () => {
		expect(groupByRegion([])).toEqual([]);
	});
});
