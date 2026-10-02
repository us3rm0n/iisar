import { getCurrentUser } from '$lib/auth';
import type { Business, Provincia, Subscription } from '$lib/types';
import {
	buildBusinessPayload,
	emptyBusinessForm,
	resetBusinessForm,
	resolveSlug,
	validateBusinessForm
} from '$lib/utils/business-form';
import { groupByRegion } from '$lib/utils/provincias';
import * as repository from './repository';

type DashboardUser = { id: string; email?: string };

/** Owner dashboard state: loaded data plus the create-business form and its actions. */
export class Dashboard {
	user = $state<DashboardUser | null>(null);
	loading = $state(true);
	categories = $state<repository.Category[]>([]);
	provincias = $state<Provincia[]>([]);
	businesses = $state<Business[]>([]);
	subscriptions = $state<Record<string, Subscription>>({});
	provinciaError = $state('');

	form = $state(emptyBusinessForm());
	creating = $state(false);
	formError = $state('');
	formMessage = $state('');

	provinciasByRegion = $derived(groupByRegion(this.provincias));

	load = async () => {
		this.user = await getCurrentUser();
		if (!this.user) {
			this.loading = false;
			return;
		}
		const [categories, { provincias, error }, businesses] = await Promise.all([
			repository.fetchCategories(),
			repository.fetchProvincias(),
			repository.fetchBusinesses(this.user.id)
		]);
		this.categories = categories;
		this.provincias = provincias;
		if (error) this.provinciaError = error;
		this.businesses = businesses;
		this.subscriptions = {
			...this.subscriptions,
			...(await repository.fetchLatestSubscriptions(businesses))
		};
		this.loading = false;
	};

	create = async () => {
		if (!this.user) return;
		this.creating = true;
		this.formError = '';
		this.formMessage = '';
		try {
			const invalid = validateBusinessForm(this.form);
			if (invalid) throw new Error(invalid);
			const slug = resolveSlug(this.form);
			const business = await repository.insertBusiness(
				buildBusinessPayload(this.form, this.user.id)
			);
			await repository.insertTrialSubscription(business.id);
			this.formMessage = `¡Negocio creado! Prueba 7 días activa. Ver en /negocio/${slug}`;
			this.form = resetBusinessForm(this.form);
			await this.load();
		} catch (e) {
			this.formError = e instanceof Error ? e.message : 'Error desconocido';
		} finally {
			this.creating = false;
		}
	};

	/** Returns false when the update failed, so the caller can restore the select. */
	changeProvincia = async (business: Business, provinciaId: string): Promise<boolean> => {
		this.provinciaError = '';
		const next = provinciaId || null;
		const error = await repository.setBusinessProvincia(business.id, next);
		if (error) {
			this.provinciaError = `No se pudo actualizar la provincia: ${error}`;
			return false;
		}
		const saved = this.provincias.find((p) => p.id === next);
		business.provincia_id = next;
		business.provincias = saved ? [{ nombre: saved.nombre, slug: saved.slug }] : null;
		return true;
	};
}
