-- trial 7 días gratis al crear cuenta/negocio — full frontend sin webmaster
-- 1. ampliar type para incluir 'prueba'
alter table public.subscriptions drop constraint if exists subscriptions_type_check;
alter table public.subscriptions add constraint subscriptions_type_check check (type in ('prueba','mensual','semestral','anual'));

-- 2. actualizar trigger de fechas para soportar 'prueba' = 7 días sin gracia extra
create or replace function public.handle_subscription_dates() returns trigger as $$
declare
  v_interval interval;
  v_grace interval;
begin
  if new.fecha_creacion is null then new.fecha_creacion := now(); end if;

  if new.type = 'prueba' then
    v_interval := interval '7 days';
    v_grace := interval '0 days';
  elsif new.type = 'mensual' then
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

-- 3. RLS: permitir al owner insertar 'prueba' aprobada directamente (trial auto), resto solo pendiente
drop policy if exists "subs_insert_owner" on public.subscriptions;
create policy "subs_insert_owner" on public.subscriptions for insert with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  and (
    -- trial puede venir aprobada y gratis
    (type = 'prueba' and status = 'aprobada' and total = 0)
    or
    -- resto manual debe ser pendiente (webmaster aprueba después)
    (type in ('mensual','semestral','anual') and status = 'pendiente')
  )
);

-- 4. asegurar que solo 1 trial por negocio (evitar abuse)
create unique index if not exists subs_one_trial_per_business on public.subscriptions (business_id) where type = 'prueba';
