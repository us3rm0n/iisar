-- provincias: taxonomía geográfica pública (sin owner), usada por /ecuador y por businesses.provincia_id
-- orden = número de lección en content/geografia-ecuador.md (para navegación editorial consistente)

create table public.provincias (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  region text not null check (region in ('costa','sierra','amazonia','insular')),
  orden int not null
);
create index provincias_region_idx on public.provincias (region);
create index provincias_orden_idx on public.provincias (orden);

alter table public.provincias enable row level security;

-- select público (anon + authenticated), write solo webmaster (misma convención que categories)
create policy "provincias_select" on public.provincias for select using (true);
create policy "provincias_write_webmaster" on public.provincias for all using (public.is_webmaster()) with check (public.is_webmaster());

-- seed 24 provincias, agrupadas por región (orden = número de lección)
insert into public.provincias (slug, nombre, region, orden) values
  -- costa
  ('esmeraldas','Esmeraldas','costa',4),
  ('manabi','Manabí','costa',5),
  ('los-rios','Los Ríos','costa',6),
  ('guayas','Guayas','costa',7),
  ('santa-elena','Santa Elena','costa',8),
  ('el-oro','El Oro','costa',9),
  -- sierra
  ('carchi','Carchi','sierra',11),
  ('imbabura','Imbabura','sierra',12),
  ('pichincha','Pichincha','sierra',13),
  ('santo-domingo-de-los-tsachilas','Santo Domingo de los Tsáchilas','sierra',14),
  ('cotopaxi','Cotopaxi','sierra',15),
  ('tungurahua','Tungurahua','sierra',16),
  ('bolivar','Bolívar','sierra',17),
  ('chimborazo','Chimborazo','sierra',18),
  ('canar','Cañar','sierra',19),
  ('azuay','Azuay','sierra',20),
  ('loja','Loja','sierra',21),
  -- amazonía
  ('sucumbios','Sucumbíos','amazonia',23),
  ('orellana','Orellana','amazonia',24),
  ('napo','Napo','amazonia',25),
  ('pastaza','Pastaza','amazonia',26),
  ('morona-santiago','Morona Santiago','amazonia',27),
  ('zamora-chinchipe','Zamora Chinchipe','amazonia',28),
  -- insular
  ('galapagos','Galápagos','insular',29)
on conflict (slug) do nothing;

-- businesses.provincia_id: ubicación opcional de un negocio/artista/lugar
alter table public.businesses
  add column if not exists provincia_id uuid references public.provincias(id) on delete set null;
create index if not exists businesses_provincia_idx on public.businesses (provincia_id);

-- businesses.tipo: ampliar para incluir 'lugar' (hoteles, miradores, atractivos con dueño/gestor)
alter table public.businesses drop constraint if exists businesses_tipo_check;
alter table public.businesses add constraint businesses_tipo_check check (tipo in ('negocio','artista','lugar'));

-- nota: seed.sql no tiene businesses de ejemplo activos (bloque comentado), nada que retro-asignar a provincia_id.
