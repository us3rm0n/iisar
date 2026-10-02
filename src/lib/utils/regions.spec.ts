import { describe, it, expect } from 'vitest';
import { REGIONS } from './provincias';
import { REGION_ICONS, regionIcon } from './regions';

describe('region icons', () => {
	it('has exactly one icon per canonical region', () => {
		expect(Object.keys(REGION_ICONS).sort()).toEqual([...REGIONS].sort());
	});

	it('returns the mapped icon for a known region', () => {
		expect(regionIcon('costa')).toBe(REGION_ICONS.costa);
	});

	it('falls back to a generic icon for an unknown region', () => {
		expect(regionIcon('desconocida')).toBeDefined();
		expect(Object.values(REGION_ICONS)).not.toContain(regionIcon('desconocida'));
	});
});
