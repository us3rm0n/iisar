-- provincia_contenido: cuerpo editorial (markdown) del articulo de cada provincia.
-- Lo edita el webmaster desde el frontend; la lectura es publica (misma convencion que provincias/categories).
-- El contenido inicial se carga con 20251002000002_provincia_contenido_seed.sql (generado desde content/provincias).

create table public.provincia_contenido (
  provincia_id uuid primary key references public.provincias(id) on delete cascade,
  body text not null default '' check (char_length(body) <= 20000),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.provincia_contenido enable row level security;

create policy "provincia_contenido_select" on public.provincia_contenido for select using (true);
create policy "provincia_contenido_write_webmaster" on public.provincia_contenido for all using (public.is_webmaster()) with check (public.is_webmaster());

create trigger pc_updated_at before update on public.provincia_contenido for each row execute function public.handle_updated_at();

-- updated_by siempre es el usuario autenticado: el cliente no puede falsificarlo
create or replace function public.provincia_contenido_set_updated_by() returns trigger as $$
begin
  new.updated_by := auth.uid();
  return new;
end; $$ language plpgsql security invoker set search_path = public;

create trigger pc_updated_by before insert or update on public.provincia_contenido for each row execute function public.provincia_contenido_set_updated_by();
