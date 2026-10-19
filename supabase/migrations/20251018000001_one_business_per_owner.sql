-- una cuenta = un negocio (por ahora). El webmaster queda exento.
-- Solo bloquea inserts nuevos: no se agrega unique constraint porque datos
-- existentes pueden tener owners con varios negocios.
create or replace function public.handle_one_business_per_owner() returns trigger as $$
begin
  if not public.is_webmaster()
     and exists (select 1 from public.businesses where owner_id = new.owner_id) then
    raise exception 'Solo puedes tener un negocio por cuenta';
  end if;
  return new;
end; $$ language plpgsql security definer set search_path = public;

drop trigger if exists one_business_per_owner on public.businesses;
create trigger one_business_per_owner before insert on public.businesses
  for each row execute function public.handle_one_business_per_owner();
