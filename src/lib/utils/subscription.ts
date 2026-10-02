import type { Subscription } from '$lib/types';
import { daysLeft } from './date';

export type SubscriptionSummary = {
	label: string;
	variant: 'default' | 'destructive';
	/** Extra line for trials: remaining days or expired. */
	trialNote: string | null;
	needsRenewal: boolean;
};

/** Derives what the dashboard shows for a business's latest subscription. */
export function summarizeSubscription(subscription: Subscription): SubscriptionSummary {
	const remaining = daysLeft(subscription.fecha_maxima);
	const active = subscription.status === 'aprobada' && remaining > 0;
	return {
		label: `${subscription.type} · ${subscription.status}`,
		variant: active ? 'default' : 'destructive',
		trialNote:
			subscription.type === 'prueba'
				? `prueba ${remaining > 0 ? `${remaining} días restantes` : 'vencida'}`
				: null,
		needsRenewal: remaining <= 0
	};
}
