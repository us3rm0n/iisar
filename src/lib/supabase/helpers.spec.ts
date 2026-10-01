import { describe, it, expect } from 'vitest';
import { firstRelation } from './helpers';

type Relation = { nombre: string };

describe('firstRelation', () => {
	it('returns the object when PostgREST embeds a one-to-one relation as an object', () => {
		expect(firstRelation<Relation>({ nombre: 'Salud' })).toEqual({ nombre: 'Salud' });
	});

	it('unwraps a single-element array', () => {
		expect(firstRelation<Relation>([{ nombre: 'Salud' }])).toEqual({ nombre: 'Salud' });
	});

	it('returns null for null and undefined', () => {
		expect(firstRelation<Relation>(null)).toBeNull();
		expect(firstRelation<Relation>(undefined)).toBeNull();
	});

	it('returns null for an empty array instead of yielding undefined', () => {
		expect(firstRelation<Relation>([])).toBeNull();
	});

	it('ignores extra array entries and takes the first', () => {
		expect(firstRelation<Relation>([{ nombre: 'Primero' }, { nombre: 'Segundo' }])).toEqual({
			nombre: 'Primero'
		});
	});
});
