-- Bandas de la landing: métricas del negocio ("$25-$45", "5 deportes") y
-- diferenciadores ("Personalización total", "Calidad artesanal").
--
-- Son tablas hijas como products_services, no columnas jsonb: el orden es
-- explícito y consultable, y cada una tiene exactamente los campos que necesita
-- su banda. Las bandas de la landing son data-gated, así que un negocio sin
-- filas simplemente no las renderiza.

-- business_stats: cifra grande + rótulo ("$25-$45" / "precio por uniforme")
create table public.business_stats (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  valor text not null,
  etiqueta text not null,
  orden int not null default 0
);
create index business_stats_business_idx on public.business_stats (business_id, orden);

-- business_highlights: número + título + descripción ("01 Personalización total")
create table public.business_highlights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  titulo text not null,
  descripcion text not null,
  orden int not null default 0
);
create index business_highlights_business_idx on public.business_highlights (business_id, orden);

alter table public.business_stats enable row level security;
alter table public.business_highlights enable row level security;

-- select público cuando el negocio está activo (misma convención que ps_select)
create policy "business_stats_select" on public.business_stats for select using (
  exists (select 1 from public.businesses b where b.id = business_id and (b.estado = 'activo' or b.owner_id = auth.uid() or public.is_webmaster()))
);

create policy "business_highlights_select" on public.business_highlights for select using (
  exists (select 1 from public.businesses b where b.id = business_id and (b.estado = 'activo' or b.owner_id = auth.uid() or public.is_webmaster()))
);

-- write: owner con suscripción vigente, o webmaster. Mismo gating que products_services,
-- para que no se puedan meter métricas de un negocio que no está pagando.
create policy "business_stats_write_gated" on public.business_stats for all using (
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

create policy "business_highlights_write_gated" on public.business_highlights for all using (
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
