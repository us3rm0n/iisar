/** A province and its capital city (plus alternative names people actually type). */
export type ProvincialCapital = { provinciaSlug: string; city: string; aliases?: string[] };

/**
 * The 24 provincial capitals of Ecuador. `provinciaSlug` matches the seeded
 * `provincias.slug` values (checked by `capitals.spec.ts`).
 */
export const PROVINCIAL_CAPITALS: ProvincialCapital[] = [
	{ provinciaSlug: 'esmeraldas', city: 'Esmeraldas' },
	{ provinciaSlug: 'manabi', city: 'Portoviejo' },
	{ provinciaSlug: 'los-rios', city: 'Babahoyo' },
	{ provinciaSlug: 'guayas', city: 'Guayaquil' },
	{ provinciaSlug: 'santa-elena', city: 'Santa Elena' },
	{ provinciaSlug: 'el-oro', city: 'Machala' },
	{ provinciaSlug: 'carchi', city: 'Tulcán' },
	{ provinciaSlug: 'imbabura', city: 'Ibarra' },
	{ provinciaSlug: 'pichincha', city: 'Quito' },
	{ provinciaSlug: 'santo-domingo-de-los-tsachilas', city: 'Santo Domingo' },
	{ provinciaSlug: 'cotopaxi', city: 'Latacunga' },
	{ provinciaSlug: 'tungurahua', city: 'Ambato' },
	{ provinciaSlug: 'bolivar', city: 'Guaranda' },
	{ provinciaSlug: 'chimborazo', city: 'Riobamba' },
	{ provinciaSlug: 'canar', city: 'Azogues' },
	{ provinciaSlug: 'azuay', city: 'Cuenca' },
	{ provinciaSlug: 'loja', city: 'Loja' },
	{ provinciaSlug: 'sucumbios', city: 'Nueva Loja', aliases: ['Lago Agrio'] },
	{
		provinciaSlug: 'orellana',
		city: 'Francisco de Orellana',
		aliases: ['Coca', 'Orellana']
	},
	{ provinciaSlug: 'napo', city: 'Tena' },
	{ provinciaSlug: 'pastaza', city: 'Puyo' },
	{ provinciaSlug: 'morona-santiago', city: 'Macas' },
	{ provinciaSlug: 'zamora-chinchipe', city: 'Zamora' },
	{ provinciaSlug: 'galapagos', city: 'Puerto Baquerizo Moreno' }
];
