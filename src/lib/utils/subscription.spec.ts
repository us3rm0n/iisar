import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { summarizeSubscription } from './subscription';
import type { Subscription } from '$lib/types';

const NOW = new Date('2026-10-01T12:00:00Z');
const inDays = (days: number) => new Date(NOW.getTime() + days * 86_400_000).toISOString();

const sub = (over: Partial<Subscription> = {}): Subscription => ({
	id: 's1',
	type: 'prueba',
	status: 'aprobada',
	total: 0,
	fecha_vencimiento: inDays(1),
	fecha_maxima: inDays(5),
	...over
});

describe('summarizeSubscription', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(NOW);
	});
	afterEach(() => vi.useRealTimers());

	it('shows an active approved trial with days remaining', () => {
		expect(summarizeSubscription(sub())).toEqual({
			label: 'prueba · aprobada',
			variant: 'default',
			trialNote: 'prueba 5 días restantes',
			needsRenewal: false
		});
	});

	it('flags an expired trial and asks for renewal', () => {
		expect(summarizeSubscription(sub({ fecha_maxima: inDays(-1) }))).toEqual({
			label: 'prueba · aprobada',
			variant: 'destructive',
			trialNote: 'prueba vencida',
			needsRenewal: true
		});
	});

	it('has no trial note for paid plans', () => {
		const summary = summarizeSubscription(sub({ type: 'mensual' }));
		expect(summary.trialNote).toBeNull();
		expect(summary.variant).toBe('default');
	});

	it('is destructive when not approved even with days left', () => {
		const summary = summarizeSubscription(sub({ type: 'anual', status: 'pendiente' }));
		expect(summary.variant).toBe('destructive');
		expect(summary.needsRenewal).toBe(false);
	});

	it('asks for renewal on an expired paid plan', () => {
		const summary = summarizeSubscription(sub({ type: 'mensual', fecha_maxima: inDays(-3) }));
		expect(summary).toMatchObject({ trialNote: null, needsRenewal: true, variant: 'destructive' });
	});
});
