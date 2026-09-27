export type BusinessTipo = 'negocio' | 'artista' | 'lugar';
export type SubscriptionType = 'prueba' | 'mensual' | 'semestral' | 'anual';
export type SubscriptionStatus = 'pendiente' | 'aprobada' | 'rechazada' | 'vencida';
export type ProvinciaRegion = 'costa' | 'sierra' | 'amazonia' | 'insular';

export type Provincia = {
	id: string;
	slug: string;
	nombre: string;
	region: ProvinciaRegion;
	orden: number;
};

export type Business = {
	id: string;
	slug: string;
	tipo: BusinessTipo;
	nombre: string;
	descripcion: string | null;
	bio: string | null;
	vision: string | null;
	mision: string | null;
	ciudad: string | null;
	contacto: string | null;
	estado: string;
	primary_color: string | null;
	accent_color: string | null;
	category_id: string | null;
	provincia_id: string | null;
	categories?: { nombre: string; slug: string } | null;
	provincias?: { nombre: string; slug: string } | null;
};

export type Subscription = {
	id: string;
	type: SubscriptionType;
	status: SubscriptionStatus;
	total: number;
	fecha_vencimiento: string;
	fecha_maxima: string;
};

export type ProductService = {
	id: string;
	tipo: 'producto' | 'servicio';
	nombre: string;
	descripcion: string | null;
	precio_estimado: number | null;
	moneda: string;
	imagen_url: string | null;
};
