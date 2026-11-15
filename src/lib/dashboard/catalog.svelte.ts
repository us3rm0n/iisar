import type { Business, ProductService } from '$lib/types';
import {
	allowedCatalogTipos,
	buildCatalogPayload,
	catalogFields,
	emptyCatalogForm,
	itemToCatalogForm,
	validateCatalogForm
} from '$lib/utils/catalog-form';
import { validateImageFile } from '$lib/utils/image-upload';
import * as repository from './repository';

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Error desconocido');

/** Catalog state for one business: its items plus the create/edit form and actions. */
export class Catalog {
	business = $state<Business | null>(null);
	items = $state<ProductService[]>([]);
	loading = $state(true);

	/** True while the create or edit form is shown. */
	formOpen = $state(false);
	/** Item being edited; null while creating. */
	editingId = $state<string | null>(null);
	form = $state(emptyCatalogForm('negocio'));
	saving = $state(false);
	/** True while a photo picked in the form is being uploaded. */
	uploading = $state(false);
	error = $state('');
	message = $state('');

	tipos = $derived(allowedCatalogTipos(this.business?.tipo ?? 'negocio'));

	load = async (business: Business) => {
		this.business = business;
		this.loading = true;
		try {
			this.items = await repository.fetchCatalog(business.id);
		} catch (e) {
			this.items = [];
			this.error = errorMessage(e);
		} finally {
			this.loading = false;
		}
	};

	startCreate = () => {
		if (!this.business) return;
		this.editingId = null;
		this.form = emptyCatalogForm(this.business.tipo);
		this.formOpen = true;
		this.error = '';
		this.message = '';
	};

	startEdit = (item: ProductService) => {
		this.editingId = item.id;
		this.form = itemToCatalogForm(item);
		this.formOpen = true;
		this.error = '';
		this.message = '';
	};

	cancel = () => {
		this.formOpen = false;
		this.editingId = null;
		this.error = '';
	};

	save = async () => {
		const business = this.business;
		if (!business) return;
		this.saving = true;
		this.error = '';
		this.message = '';
		try {
			const invalid = validateCatalogForm(this.form, business.tipo);
			if (invalid) throw new Error(invalid);
			if (this.editingId) {
				await repository.updateCatalogItem(this.editingId, catalogFields(this.form));
				this.message = 'Cambios guardados';
			} else {
				await repository.insertCatalogItem(buildCatalogPayload(this.form, business.id));
				this.message = 'Ítem agregado';
			}
			this.formOpen = false;
			this.editingId = null;
			await this.load(business);
		} catch (e) {
			this.error = errorMessage(e);
		} finally {
			this.saving = false;
		}
	};

	/** Uploads the photo picked in the form and points the item at it; saved with the form. */
	uploadImage = async (file: File) => {
		const business = this.business;
		if (!business) return;
		this.error = '';
		const invalid = validateImageFile(file);
		if (invalid) {
			this.error = invalid;
			return;
		}
		this.uploading = true;
		try {
			this.form.imagenUrl = await repository.uploadCatalogImage(business.id, file);
		} catch (e) {
			this.error = errorMessage(e);
		} finally {
			this.uploading = false;
		}
	};

	/** `confirm` is injectable for tests; the browser dialog is the default. */
	remove = async (
		item: ProductService,
		confirm: (text: string) => boolean = (text) => window.confirm(text)
	) => {
		const business = this.business;
		if (!business || !confirm(`¿Eliminar «${item.nombre}» del catálogo?`)) return;
		this.error = '';
		this.message = '';
		try {
			await repository.deleteCatalogItem(item.id);
			if (this.editingId === item.id) this.cancel();
			this.message = 'Ítem eliminado';
			await this.load(business);
		} catch (e) {
			this.error = errorMessage(e);
		}
	};
}
