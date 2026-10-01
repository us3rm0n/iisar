import { describe, it, expect } from 'vitest';
import { padOrdinal, statCells, HIGHLIGHT_COLUMNS } from './landing-bands';
import type { BusinessStat } from '$lib/types';

function stat(overrides: Partial<BusinessStat> = {}): BusinessStat {
	return { id: 's1', valor: '$25', etiqueta: 'precio', orden: 0, ...overrides };
}

describe('padOrdinal', () => {
	it('pads to two digits so 1..9 read as 01..09', () => {
		expect(padOrdinal(1)).toBe('01');
		expect(padOrdinal(9)).toBe('09');
	});

	it('leaves three or more digits untouched', () => {
		expect(padOrdinal(10)).toBe('10');
		expect(padOrdinal(100)).toBe('100');
	});

	it('is 1-based, so 0 is out of contract and returned unpadded rather than crashing', () => {
		expect(padOrdinal(0)).toBe('0');
	});
});

describe('statCells', () => {
	it('sorts by orden then trims to the four-cell band of the reference', () => {
		const cells = statCells([
			stat({ id: 'a', orden: 3 }),
			stat({ id: 'b', orden: 1 }),
			stat({ id: 'c', orden: 2 }),
			stat({ id: 'd', orden: 4 }),
			stat({ id: 'e', orden: 5 })
		]);
		expect(cells.map((c) => c.id)).toEqual(['b', 'c', 'a', 'd']);
	});

	it('keeps only complete pairs, so a half-filled cell never renders', () => {
		const cells = statCells([
			stat({ id: 'ok' }),
			stat({ id: 'sin-valor', valor: '   ' }),
			stat({ id: 'sin-etiqueta', etiqueta: '' })
		]);
		expect(cells.map((c) => c.id)).toEqual(['ok']);
	});

	it('returns an empty list when there is nothing to show, so the band stays hidden', () => {
		expect(statCells([])).toEqual([]);
	});
});

describe('HIGHLIGHT_COLUMNS', () => {
	it('lays the highlight grid out 1 / 2 / 3 columns across breakpoints', () => {
		expect(HIGHLIGHT_COLUMNS).toBe('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
	});
});
