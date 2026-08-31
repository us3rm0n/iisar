# Credenciales locales — iisar (solo dev, no producción)

> **Stack local SvelteKit + Supabase Docker** — `supabase/config.toml:1`, `src/lib/supabase.ts:1`.  
> Solo `127.0.0.1` (keys demo `npx supabase status`). No usar en prod.

## URLs

| Servicio | URL |
|----------|-----|
| **App** | http://127.0.0.1:5173/ |
| **Login / Registro** | http://127.0.0.1:5173/auth/login · http://127.0.0.1:5173/auth/register |
| **Dashboard** | http://127.0.0.1:5173/dashboard |
| **Studio** | http://127.0.0.1:54323 |
| **Mailpit** | http://127.0.0.1:54324 |
| **DB** | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## Cuentas cortas para probar roles (password `123456` para todas)

| Rol | Email | Pass | Para probar |
|-----|-------|------|-------------|
| **webmaster** | `admin@iisar.test` | `123456` | `/admin` aprueba categorías/suscripciones/ad_slots. Ve `Admin` en header solo si `profiles.role='webmaster'` (`src/routes/(app)/+layout.svelte:1`). |
| **business** | `negocio@iisar.test` | `123456` | `/dashboard` crea negocio → auto `prueba 7d`. Ya tiene `Demo Negocio` `/negocio/demo-negocio` `prueba/aprobada` hasta 2026-09-07. |
| **customer** | `cliente@iisar.test` | `123456` | Rol cliente (solo lectura, sin crear negocios). |
| **business (extra)** | `test-prueba-1756658620@iisar.test` | `test1234` | `Prueba Negocio 7d` `/negocio/prueba-negocio-7d` |

> Todos con `display_name` = Admin/Negocio/Cliente. `enable_confirmations=false` → login inmediato tras registro.

### Crear otra cuenta corta

```bash
curl -X POST http://127.0.0.1:54321/auth/v1/signup \
 -H "apikey: $ANON" -H "Content-Type: application/json" \
 -d '{"email":"a@a.com","password":"123456","data":{"display_name":"A"}}'
# cambiar rol
PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "update profiles set role='customer' where id=(select id from auth.users where email='a@a.com')"
```

## Flujo prueba 7 días

1. **Registro** `/auth/register` → `auth.users` → `profiles.role='business'` (trigger `handle_new_user()`).
2. **Dashboard** crear negocio → `businesses.estado='activo'` + `subscriptions type='prueba' total=0 aprobada 7d` (`20250831000003_trial.sql:1`, 1 trial por negocio, `fecha_maxima=creacion+7d`).
3. Mientras `has_active_subscription(business_id)` (`fecha_maxima>now()`) puede editar `products_services` y ver marca blanca `/negocio/[slug]` con `primary_color`.
4. Tras vencer → solo lectura, renovar vía comprobante `comprobantes` bucket + `mensual/semestral/anual` → webmaster aprueba en `/admin`.

## Negocios demo

| Negocio | Slug | Owner | Subs |
|---------|------|-------|------|
| Sabor Andino | `sabor-andino` | `owner@iisar.local` | `mensual/aprobada` hasta 2026-10-07 |
| Demo Negocio | `demo-negocio` | `negocio@iisar.test` | `prueba/aprobada` hasta 2026-09-07 |
| Prueba Negocio 7d | `prueba-negocio-7d` | `test-prueba...` | `prueba/aprobada` hasta 2026-09-07 |

## Supabase keys local (demo)

```env
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

Studio `http://127.0.0.1:54323` → Table Editor / Auth / Storage. `npx supabase db reset` re-aplica migraciones (borra demos).
