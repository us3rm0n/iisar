-- seed inicial: categorías gastronomía y salud
insert into public.categories (nombre, slug) values
  ('Gastronomía','gastronomia'),
  ('Salud','salud')
on conflict (slug) do nothing;

-- ejemplo negocios y productos para dev (owner se asignará al primer usuario real o anon)
-- se deja comentado para no romper RLS sin usuario; descomentar tras crear usuario webmaster si quieres datos de prueba
-- insert into public.businesses (owner_id, category_id, slug, nombre, descripcion, ciudad, contacto, estado)
-- select 
--   (select id from public.profiles limit 1),
--   (select id from public.categories where slug='gastronomia'),
--   'ejemplo-restaurante','Restaurante Ejemplo','Menú del día y especialidades','Macas','0999999999','activo'
-- where exists (select 1 from public.profiles);

-- slots publicidad de ejemplo (home 2, category 2, business_page 2) — vacíos, sin asignar
insert into public.ad_slots (ubicacion, activo) values
  ('home', true), ('home', true),
  ('category', true), ('category', true),
  ('business_page', true), ('business_page', true)
on conflict do nothing;
