-- iisar initial schema — SvelteKit + Supabase (pagos manuales, subscriptions con gracia)
-- Stack: public schema, RLS, pg_trgm para búsqueda

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- profiles: espejo de auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('webmaster','business','customer')) default 'business',
  display_name text,
  created_at timestamptz not null default now()
);

-- categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index categories_slug_idx on public.categories (slug);
create index categories_activo_idx on public.categories (activo);

-- businesses (cada negocio = landing page /negocio/[slug])
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique, -- para /negocio/[slug], migrar a subdomain luego con columna nullable subdomain
  subdomain text unique, -- reservado para futuro: negocio.iisar.com (null = no usado)
  nombre text not null,
  descripcion text,
  ciudad text,
  contacto text,
  estado text not null check (estado in ('pendiente','activo','pausado','vencido')) default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_owner_idx on public.businesses (owner_id);
create index businesses_category_idx on public.businesses (category_id);
create index businesses_estado_idx on public.businesses (estado);
create index businesses_slug_trgm on public.businesses using gin (slug gin_trgm_ops);
create index businesses_nombre_trgm on public.businesses using gin (nombre gin_trgm_ops);

-- products_services
create table public.products_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tipo text not null check (tipo in ('producto','servicio')),
  nombre text not null,
  descripcion text,
  precio_estimado numeric(12,2),
  moneda text not null default 'USD',
  imagen_url text,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ps_business_idx on public.products_services (business_id);
create index ps_tipo_idx on public.products_services (tipo);

-- subscriptions — tabla pedida: fecha_creacion, fecha_vencimiento, type, total, medio_pago, status, attachment, fecha_maxima (gracia)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null check (type in ('mensual','semestral','anual')),
  total numeric(12,2) not null check (total >= 0),
  medio_pago text not null, -- ej. transferencia, deposito
  status text not null check (status in ('pendiente','aprobada','rechazada','vencida')) default 'pendiente',
  attachment text, -- url storage bucket comprobantes
  fecha_creacion timestamptz not null default now(),
  fecha_vencimiento timestamptz not null,
  fecha_maxima timestamptz not null, -- vencimiento + gracia (hasta cuando aguanto antes de cortar)
  aprobada_por uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index subs_business_idx on public.subscriptions (business_id);
create index subs_status_idx on public.subscriptions (status);
create index subs_fecha_maxima_idx on public.subscriptions (fecha_maxima);

-- ad_slots — publicidad limitada no intrusiva
create table public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  ubicacion text not null check (ubicacion in ('home','category','business_page')),
  business_id uuid references public.businesses(id) on delete set null, -- quien paga el slot, null = vacío/disponible
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index ad_slots_ubicacion_idx on public.ad_slots (ubicacion);

-- helper: trigger updated_at
create or replace function public.handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

create trigger businesses_updated_at before update on public.businesses for each row execute function public.handle_updated_at();
create trigger ps_updated_at before update on public.products_services for each row execute function public.handle_updated_at();

-- helper: calcular fecha_vencimiento / fecha_maxima desde type si vienen null o si type cambia
-- gracia configurable: mensual 7d, semestral 15d, anual 30d (ajustable)
create or replace function public.handle_subscription_dates() returns trigger as $$
declare
  v_interval interval;
  v_grace interval;
begin
  -- si fecha_creacion es null usar now()
  if new.fecha_creacion is null then new.fecha_creacion := now(); end if;

  if new.type = 'mensual' then
    v_interval := interval '1 month';
    v_grace := interval '7 days';
  elsif new.type = 'semestral' then
    v_interval := interval '6 months';
    v_grace := interval '15 days';
  elsif new.type = 'anual' then
    v_interval := interval '1 year';
    v_grace := interval '30 days';
  else
    v_interval := interval '1 month';
    v_grace := interval '7 days';
  end if;

  -- solo autocalcula si no se provee explícitamente o si es insert
  if tg_op = 'INSERT' then
    if new.fecha_vencimiento is null then
      new.fecha_vencimiento := new.fecha_creacion + v_interval;
    end if;
    if new.fecha_maxima is null then
      new.fecha_maxima := new.fecha_vencimiento + v_grace;
    end if;
  end if;

  return new;
end; $$ language plpgsql;

create trigger subs_dates before insert on public.subscriptions for each row execute function public.handle_subscription_dates();

-- profiles auto-create desde auth.users
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'business', coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  return new;
end; $$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.businesses enable row level security;
alter table public.products_services enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ad_slots enable row level security;

-- helper: es webmaster?
create or replace function public.is_webmaster() returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'webmaster');
$$ language sql stable security definer set search_path = public;

-- helper: tiene suscripcion vigente para un business? (aprobada y fecha_maxima > now)
create or replace function public.has_active_subscription(b uuid) returns boolean as $$
  select exists (
    select 1 from public.subscriptions
    where business_id = b and status = 'aprobada' and fecha_maxima > now()
  );
$$ language sql stable security definer set search_path = public;

-- profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- categories: select público, write solo webmaster
create policy "categories_select" on public.categories for select using (true);
create policy "categories_write_webmaster" on public.categories for all using (public.is_webmaster()) with check (public.is_webmaster());

-- businesses: select público si activo (o owner/webmaster ve todos)
create policy "businesses_select_public" on public.businesses for select using (
  estado = 'activo' or owner_id = auth.uid() or public.is_webmaster()
);
create policy "businesses_insert_owner" on public.businesses for insert with check (
  owner_id = auth.uid() or public.is_webmaster()
);
create policy "businesses_update_owner_with_sub" on public.businesses for update using (
  owner_id = auth.uid() or public.is_webmaster()
) with check (
  owner_id = auth.uid() or public.is_webmaster()
);
-- nota: el gating de edición fino se aplica en products_services y en capa app (ver has_active_subscription). 
-- Si quieres bloquear UPDATE businesses fuera de ventana, añade: AND (public.is_webmaster() OR public.has_active_subscription(id))

create policy "businesses_delete_owner" on public.businesses for delete using (
  owner_id = auth.uid() or public.is_webmaster()
);

-- products_services: select si business activo, write solo owner con suscripcion vigente o webmaster
create policy "ps_select" on public.products_services for select using (
  exists (select 1 from public.businesses b where b.id = business_id and (b.estado = 'activo' or b.owner_id = auth.uid() or public.is_webmaster()))
);
create policy "ps_insert_gated" on public.products_services for insert with check (
  public.is_webmaster() or (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
    and public.has_active_subscription(business_id)
  )
);
create policy "ps_update_gated" on public.products_services for update using (
  public.is_webmaster() or (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
    and public.has_active_subscription(business_id)
  )
) with check (
  public.is_webmaster() or (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
    and public.has_active_subscription(business_id)
  )
);
create policy "ps_delete_gated" on public.products_services for delete using (
  public.is_webmaster() or (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
    and public.has_active_subscription(business_id)
  )
);

-- subscriptions: owner ve/inserta las suyas, webmaster ve todo y puede aprobar
create policy "subs_select" on public.subscriptions for select using (
  public.is_webmaster() or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "subs_insert_owner" on public.subscriptions for insert with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);
create policy "subs_update_webmaster" on public.subscriptions for update using (public.is_webmaster()) with check (public.is_webmaster());
-- owner puede actualizar su pendiente antes de aprobación (ej. re-subir comprobante) — opcional
create policy "subs_update_owner_pending" on public.subscriptions for update using (
  status = 'pendiente' and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  status = 'pendiente' and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
);

-- ad_slots: select público si activo, write solo webmaster
create policy "ad_select" on public.ad_slots for select using (activo = true or public.is_webmaster());
create policy "ad_write_webmaster" on public.ad_slots for all using (public.is_webmaster()) with check (public.is_webmaster());

-- storage buckets (se crean vía SQL para local; en prod se crean igual)
insert into storage.buckets (id, name, public) values ('business-assets','business-assets', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('comprobantes','comprobantes', false) on conflict (id) do nothing;

-- storage policies
create policy "business_assets_public_read" on storage.objects for select using (bucket_id = 'business-assets');
create policy "business_assets_insert_gated" on storage.objects for insert with check (
  bucket_id = 'business-assets' and (public.is_webmaster() or auth.role() = 'authenticated')
);
create policy "business_assets_update_own" on storage.objects for update using (
  bucket_id = 'business-assets' and (public.is_webmaster() or owner = auth.uid())
);
create policy "business_assets_delete_own" on storage.objects for delete using (
  bucket_id = 'business-assets' and (public.is_webmaster() or owner = auth.uid())
);

create policy "comprobantes_select" on storage.objects for select using (
  bucket_id = 'comprobantes' and (public.is_webmaster() or owner = auth.uid())
);
create policy "comprobantes_insert" on storage.objects for insert with check (
  bucket_id = 'comprobantes' and auth.role() = 'authenticated'
);
create policy "comprobantes_update_own" on storage.objects for update using (
  bucket_id = 'comprobantes' and (public.is_webmaster() or owner = auth.uid())
);
create policy "comprobantes_delete_own" on storage.objects for delete using (
  bucket_id = 'comprobantes' and (public.is_webmaster() or owner = auth.uid())
);
