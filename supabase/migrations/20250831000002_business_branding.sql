-- branding per-negocio para marca blanca /negocio/[slug]
alter table public.businesses
  add column if not exists logo_url text,
  add column if not exists cover_url text,
  add column if not exists primary_color text check (primary_color is null or primary_color ~ '^#[0-9a-fA-F]{6}$'),
  add column if not exists accent_color text check (accent_color is null or accent_color ~ '^#[0-9a-fA-F]{6}$');

-- ejemplo: asignar color a negocio demo si existe
update public.businesses set primary_color = '#ea580c', accent_color = '#fff7ed' where slug = 'sabor-andino' and primary_color is null;
