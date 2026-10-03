## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm (also npm works, lockfile is pnpm-lock.yaml)
- **Add-ons**: prettier, eslint, vitest, tailwindcss, sveltekit-adapter, shadcn-svelte, lucide
- **Stack**: SvelteKit + Supabase (sin backend custom). Supabase = Auth/DB/Storage/RLS + Edge Runtime local. Pagos manuales.
- **UI**: shadcn-svelte (`components.json:1`, `src/lib/components/ui/*`, `src/lib/utils.ts:1` con `cn`), iconos `@lucide/svelte`. Tailwind v4 con variables zinc en `src/routes/layout.css:1`. `svelte.config.js:1` define `adapter-cloudflare` + `vitePreprocess` (Cloudflare Pages, local `vite dev` sin adapter).

---

# AGENTS.md — iisar

## Stack & Boundaries (verificado 2026-08-31)

- SvelteKit `src/routes/` — `+page.server.ts` hace queries Supabase SSR; `/negocio/[slug]` landing por negocio (futura migración a `negocio.iisar.com` vía campo `businesses.subdomain`). Layout `src/routes/+layout.svelte:1` header sticky con `shadcn/Button` + iconos `lucide` (Store/LayoutDashboard/ShieldCheck), `lang="es"` en `src/app.html:2`.
- Supabase local Docker `supabase/` — migración `supabase/migrations/20250831000001_initial_schema.sql`, seed `supabase/seed.sql`. Tablas: `profiles`, `categories` (seed: gastronomia, salud), `businesses`, `products_services`, `subscriptions`, `ad_slots` (tabla sin uso en la UI: el home ya no muestra publicidad). Buckets: `business-assets` (public), `comprobantes` (private).
- Env: `PUBLIC_SUPABASE_URL/ANON_KEY` (expuestas, `$env/static/public`) + `SUPABASE_SERVICE_ROLE_KEY` (solo server, `$env/static/private` vía `supabase.server.ts` — nunca al browser). `DATABASE_URL` solo para migraciones local, no se bunddea al cliente. Local `cp .env.example → .env` (Docker `127.0.0.1:54321/54322`); Pages: setear `PUBLIC_` en Build env y `SUPABASE_SERVICE_ROLE_KEY` como Encrypted en Cloudflare Dashboard (no en git). Ports local: API 54321, DB 54322, Studio 54323, Mailpit 54324 — ver `npx supabase status`.
- Búsqueda: botón "Buscar" en el header (`(app)/+layout.svelte`) abre `search-panel.svelte`: un solo campo con sugerencias de lugares (combobox) y "Más filtros" (categoría/provincia) plegado. URL: GET `/?q&categoria&provincia&ciudad`. Opciones y ciudades vienen de `(app)/+layout.server.ts` (`$lib/search/options.ts`, nunca lanza: corre en todas las rutas); lugares = 24 provincias + 24 capitales (`$lib/search/capitals.ts`) + ciudades de negocios activos (`$lib/search/places.ts`, sin tildes ni mayúsculas); un nombre exacto de lugar en `q` se canonicaliza con 303 (`$lib/search/intent.ts`); texto del usuario → `$lib/search/ilike.ts` antes de PostgREST (`,` `(` `)` rompían el filtro). El home lista resultados con chips quitables (`$lib/search/chips.ts`) y, si hay provincia, una tarjeta con el extracto de su guía (`$lib/search/excerpt.ts`, desde `provincia_contenido`). Sin ciudades cargadas aparte: no hay tabla de cantones.
- Lib: `src/lib/supabase.ts` (cliente anon, `$env/static/public`), `src/lib/supabase.server.ts` (service_role, solo server). UI: `src/lib/components/ui/{button,card,input,badge,separator,select}` + `src/lib/utils.ts:1`.

## Comandos verificados (orden: install → supabase → dev/check/lint/test → build)

```bash
pnpm install                          # instala deps (lock pnpm-lock.yaml) — verificado 14s
npx supabase start                    # levanta Docker local (DB 54322, Studio 54323) — verificado
npx supabase status                   # URLs + anon/service keys
npx supabase db reset                 # aplica migraciones + seed (pg_trgm, RLS, buckets) — verificado
pnpm dev -- --open                    # SvelteKit dev (vite)
pnpm check                            # svelte-kit sync + svelte-check — pasa
pnpm lint                             # prettier --check + eslint — eslint pasa; prettier falla solo en 2 archivos base ajenos a esta feature: `src/lib/supabase/helpers.ts` y `src/lib/utils/date.ts` (eslint relaja require-each-key/no-navigation/no-explicit-any para MVP)
pnpm format                           # prettier --write
pnpm test                             # vitest --run (1 test pass 316ms) — single test: pnpm run test:unit -- --run -t "<name>"
pnpm build && pnpm preview            # vite build SSR + client — pasa (adapter-cloudflare, `pnpm-workspace.yaml` con `dangerouslyAllowAllBuilds` para workerd/esbuild)
npx supabase stop                     # baja stack local
```

- No CI workflows ni `opencode.json` repo-local aún; global en `~/.config/opencode/opencode.json`.

## DB Monetización (fuente de verdad)

- `subscriptions` — campos: `fecha_creacion`, `fecha_vencimiento` (= creacion + interval por `type`: mensual 1m, semestral 6m, anual 1y), `fecha_maxima` (= vencimiento + gracia 7/15/30d), `type`, `total`, `medio_pago`, `status` (pendiente/aprobada/rechazada/vencida), `attachment` (url comprobante en bucket `comprobantes`), `aprobada_por`.
- Ventana edición: `has_active_subscription(business_id)` = `exists subscriptions status=aprobada and fecha_maxima > now()`. RLS bloquea `products_services` insert/update/delete si no hay suscripción vigente; `businesses` lectura pública si `estado=activo`.
- Flujo manual: owner crea business → crea subscription pendiente + sube comprobante → webmaster aprueba en Studio o `update subscriptions set status='aprobada'` → gracia: entre `fecha_vencimiento` y `fecha_maxima` aviso, tras `fecha_maxima` solo lectura hasta renovar.
- Categorías: `categories` escritura solo `is_webmaster()` (role webmaster en `profiles`). Seed iniciales: gastronomia, salud.

## Contenido editorial de provincias

- Fuente de verdad: tabla `provincia_contenido` (`provincia_id` PK, `body` markdown <= 20000, `updated_at/by`). RLS: lectura pública, escritura solo `is_webmaster()`.
- Render: `renderProvinceHtml` (`src/lib/content/render.ts`: marked + allowlist `xss`, JS puro, apto para Cloudflare Workers y navegador).
- Edición: inline en `/ecuador/<slug>` solo para el webmaster (textarea markdown + vista previa); la RLS es el control real, el botón es comodidad.
- Borradores en `content/provincias/*.md`; seed con `pnpm content:seed-sql` → migración `20251002000002_provincia_contenido_seed.sql` (`on conflict do nothing`, nunca pisa ediciones de la UI). Ver `content/README.md`.
- Producción: el mantenedor aplica la migración con `supabase db push`.
- Originalidad: `pnpm check:originality -- --source 15fdc3a:content/geografia-ecuador.md --target content/provincias` (el libro fuente ya no está en el árbol, solo en el historial git).

## Gotchas locales

- Supabase requiere Docker; `supabase start` descarga imágenes ~1-2GB primera vez; `db reset` recrea DB y re-seed.
- En prod sin credenciales: usar `.env` local; no commitear `SUPABASE_SERVICE_ROLE_KEY`. `.env` ignorado por `.gitignore`.
- RLS está activo en todas las tablas públicas — probar con `anon`/`authenticated` keys, no con `service_role` que bypasea.
- ESLint en `eslint.config.js:27` desactiva temporalmente `svelte/require-each-key` y `no-navigation-without-resolve` para no bloquear lint MVP; reactivar cuando `+page` use `resolve()`.

## Convenciones agentes

- Mantener AGENTS compacto; citar `package.json:6`, `supabase/migrations/*`, `vite.config.ts` como fuente ejecutable.
- Preferir `search_graph`/`trace_path` tras indexar; fallback grep para literales/config.
