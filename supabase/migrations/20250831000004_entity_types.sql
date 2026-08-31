-- modelo negocio vs artista para probar landing diferenciada
alter table public.businesses
  add column if not exists tipo text not null default 'negocio' check (tipo in ('negocio','artista')),
  add column if not exists bio text,
  add column if not exists vision text,
  add column if not exists mision text,
  add column if not exists historia text,
  add column if not exists valores text,
  add column if not exists redes jsonb default '{}'::jsonb;

-- indice para filtrar por tipo en home
create index if not exists businesses_tipo_idx on public.businesses (tipo);

-- helper artista
create or replace function public.is_artista(b uuid) returns boolean as $$
  select exists (select 1 from public.businesses where id = b and tipo = 'artista');
$$ language sql stable;

-- enforce: artista solo puede tener servicios (no productos) via trigger
create or replace function public.handle_ps_artista_check() returns trigger as $$
begin
  if public.is_artista(new.business_id) and new.tipo = 'producto' then
    raise exception 'Artistas solo pueden tener servicios (tipo=servicio), no productos';
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists ps_artista_check on public.products_services;
create trigger ps_artista_check before insert or update on public.products_services
  for each row execute function public.handle_ps_artista_check();
