# Contenido editorial

`content/provincias/<slug>.md` contiene los borradores de los artículos de cada provincia (texto original, no copiado de ninguna fuente).

- Tras el seed, la base de datos (`provincia_contenido`) es la fuente de verdad; el webmaster edita desde `/ecuador/<slug>`. Los archivos son solo borradores y punto de partida del seed.
- Nueva provincia: crea `content/provincias/<slug>.md` (el slug debe existir en `provincias`), ejecuta `pnpm content:seed-sql` y revisa la nueva migración en `supabase/migrations/` (usa `on conflict do nothing`). El mantenedor la aplica en producción con `supabase db push`.
- Originalidad: `pnpm check:originality -- --source 15fdc3a:content/geografia-ecuador.md --target content/provincias`.
- La transcripción del libro de texto (`content/geografia-ecuador.md`) se retiró del árbol; el historial de git la conserva (commit `15fdc3a` y anteriores). Purgar el historial es una decisión aparte del mantenedor.
