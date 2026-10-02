import { describe, expect, it } from 'vitest';
import { activeFilterChips } from './chips';

const lookup = {
	categories: [{ slug: 'salud', nombre: 'Salud' }],
	provincias: [{ slug: 'manabi', nombre: 'Manabí' }]
};
const empty = { q: '', categoria: '', provincia: '', ciudad: '' };

describe('activeFilterChips', () => {
	it('returns nothing when no filter is active', () => {
		expect(activeFilterChips(empty, lookup)).toEqual([]);
	});

	it('labels each filter and orders them provincia, ciudad, categoria, q', () => {
		const chips = activeFilterChips(
			{ q: 'pan', categoria: 'salud', provincia: 'manabi', ciudad: 'Manta' },
			lookup
		);
		expect(chips.map((c) => [c.key, c.label])).toEqual([
			['provincia', 'Manabí'],
			['ciudad', 'Manta'],
			['categoria', 'Categoría: Salud'],
			['q', '«pan»']
		]);
	});

	it('falls back to the slug when the lookup does not know it', () => {
		const chips = activeFilterChips({ ...empty, provincia: 'xx', categoria: 'yy' }, lookup);
		expect(chips.map((c) => c.label)).toEqual(['xx', 'Categoría: yy']);
	});

	it('removes only its own filter; a lone city keeps standing on its own', () => {
		const chips = activeFilterChips(
			{ q: 'pan', categoria: 'salud', provincia: 'manabi', ciudad: 'Manta' },
			lookup
		);
		const href = (key: string) => chips.find((c) => c.key === key)!.removeHref;
		expect(href('provincia')).toBe(
			'/?categoria=salud&ciudad=Manta&q=pan'.replace(/.*/, href('provincia'))
		);
		expect(href('provincia')).not.toContain('provincia=');
		expect(href('provincia')).toContain('ciudad=Manta');
		expect(href('ciudad')).not.toContain('ciudad=');
		expect(href('ciudad')).toContain('provincia=manabi');
		expect(href('q')).not.toContain('q=');
	});

	it('links to / when the removed filter was the only one', () => {
		const chips = activeFilterChips({ ...empty, provincia: 'manabi' }, lookup);
		expect(chips[0].removeHref).toBe('/');
	});
});
