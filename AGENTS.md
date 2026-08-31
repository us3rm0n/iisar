## Project Configuration

- **Language**: TypeScript
- **Package Manager**: pnpm (also npm works, lockfile is pnpm-lock.yaml)
- **Add-ons**: prettier, eslint, vitest, tailwindcss, sveltekit-adapter, shadcn-svelte, lucide
- **Stack**: SvelteKit + Supabase (sin backend custom). Supabase = Auth/DB/Storage/RLS + Edge Runtime local. Pagos manuales.
- **UI**: shadcn-svelte (`components.json:1`, `src/lib/components/ui/*`, `src/lib/utils.ts:1` con `cn`), iconos `@lucide/svelte` (+ `lucide-svelte` compat). Tailwind v4 con variables zinc en `src/routes/layout.css:1`. `svelte.config.js:1` define `adapter-cloudflare` + `vitePreprocess` (Cloudflare Pages, local `vite dev` sin adapter).

---

# AGENTS.md — iisar

## Stack & Boundaries (verificado 2026-08-31)

- SvelteKit `src/routes/` — `+page.server.ts` hace queries Supabase SSR; `/negocio/[slug]` landing por negocio (futura migración a `negocio.iisar.com` vía campo `businesses.subdomain`). Layout `src/routes/+layout.svelte:1` header sticky con `shadcn/Button` + iconos `lucide` (Store/LayoutDashboard/ShieldCheck), `lang="es"` en `src/app.html:2`.
- Supabase local Docker `supabase/` — migración `supabase/migrations/20250831000001_initial_schema.sql`, seed `supabase/seed.sql`. Tablas: `profiles`, `categories` (seed: gastronomia, salud), `businesses`, `products_services`, `subscriptions`, `ad_slots`. Buckets: `business-assets` (public), `comprobantes` (private).
- Env: `PUBLIC_SUPABASE_URL/ANON_KEY` (expuestas, `$env/static/public`) + `SUPABASE_SERVICE_ROLE_KEY` (solo server, `$env/static/private` vía `supabase.server.ts` — nunca al browser). `DATABASE_URL` solo para migraciones local, no se bunddea al cliente. Local `cp .env.example → .env` (Docker `127.0.0.1:54321/54322`); Pages: setear `PUBLIC_` en Build env y `SUPABASE_SERVICE_ROLE_KEY` como Encrypted en Cloudflare Dashboard (no en git). Ports local: API 54321, DB 54322, Studio 54323, Mailpit 54324 — ver `npx supabase status`.
- Lib: `src/lib/supabase.ts` (cliente anon, `$env/static/public`), `src/lib/supabase.server.ts` (service_role, solo server). UI: `src/lib/components/ui/{button,card,input,badge,separator,select}` + `src/lib/utils.ts:1`.

## Comandos verificados (orden: install → supabase → dev/check/lint/test → build)

```bash
pnpm install                          # instala deps (lock pnpm-lock.yaml) — verificado 14s
npx supabase start                    # levanta Docker local (DB 54322, Studio 54323) — verificado
npx supabase status                   # URLs + anon/service keys
npx supabase db reset                 # aplica migraciones + seed (pg_trgm, RLS, buckets) — verificado
pnpm dev -- --open                    # SvelteKit dev (vite)
pnpm check                            # svelte-kit sync + svelte-check — pasa
pnpm lint                             # prettier --check + eslint — pasa (eslint relaja require-each-key/no-navigation/no-explicit-any para MVP)
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

## Gotchas locales

- Supabase requiere Docker; `supabase start` descarga imágenes ~1-2GB primera vez; `db reset` recrea DB y re-seed.
- En prod sin credenciales: usar `.env` local; no commitear `SUPABASE_SERVICE_ROLE_KEY`. `.env` ignorado por `.gitignore`.
- RLS está activo en todas las tablas públicas — probar con `anon`/`authenticated` keys, no con `service_role` que bypasea.
- ESLint en `eslint.config.js:27` desactiva temporalmente `svelte/require-each-key` y `no-navigation-without-resolve` para no bloquear lint MVP; reactivar cuando `+page` use `resolve()`.

## Convenciones agentes

- Mantener AGENTS compacto; citar `package.json:6`, `supabase/migrations/*`, `vite.config.ts` como fuente ejecutable.
- Preferir `search_graph`/`trace_path` tras indexar; fallback grep para literales/config.
