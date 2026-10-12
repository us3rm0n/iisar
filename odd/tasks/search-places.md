# Feature: search-places

## Objective

Integrate Ecuador's places into the main search: typing a province or a city finds it, shows that province's editorial guide next to the matching businesses, and the search UI stays simple at first sight.

## Problem / Why (user feedback, 2026-10-02)

- The Ecuador geography section feels separate from the rest of the directory.
- Searching "Manabí" today does nothing useful: the home query only matches `nombre` and `descripcion` of businesses.
- The search panel shows three fields at once and looks complex at first sight.
- User, verbatim: "en la opcion de busqueda si quiero que se integre la busqueda de las provincias y ciudades del ecuador" (the header Ecuador icon stays as is for now).

## Decisions (2026-10-02)

- One text field is the primary input; category and province move under a "Más filtros" disclosure.
- Place suggestions appear as the user types (accessible combobox/listbox, keyboard operable), grouped as "Lugares" and "Buscar «texto» en negocios".
- A place is a province or a city. A place query (exact normalized match, or a chosen suggestion) filters businesses by that province (and by `ciudad` for a city) and shows a guide card on the home with an excerpt of `provincia_contenido` and a link to `/ecuador/<slug>`.
- City data source for v1 (there is NO cities table): the 24 provincial capitals (curated constant, with aliases such as "Lago Agrio" for Nueva Loja) plus the distinct `ciudad` values of active businesses with their province. A full canton dataset (221) is a later extension; web search is capped in this session so no external dataset was fetched.
- The free-text search also matches `businesses.ciudad` (so "Manta" finds businesses in Manta even if the city is not in the place index).
- URL semantics: `/?provincia=<slug>` for a province, `/?ciudad=<name>&provincia=<slug>` for a city, `/?q=` for text; empty params are never emitted.

## Constraints

- Mobile-first (min-width only), 44px targets, no hover-only, tokens only, lucide icons only, UI copy Spanish; code, comments and identifiers English.
- The layout load wraps every `(app)` route: anything added there must never throw (use the `loadSearchOptions` pattern) and must stay cheap.
- Strict TDD (runner `pnpm test`): pure logic gets a RED spec first; Svelte components have no component-test setup (functional check with Playwright).
- The guide card depends on production migrations `20251002000001/2` (user applies them); without them the card still links to the province page with no excerpt.
- No push, PR or merge: the user decides.

## Tasks

- [x] T1 DONE (commits `beba390` places/capitals/excerpt + 3 specs, +545; `parent fix` excerpt ends on a whole sentence when one fits). Parent verification: tree clean, `pnpm check` 0 errors, tests green, ESLint/build ok; ran the real functions with an esbuild-bundled script: index of 49 places (24 provinces + 25 cities), "tulcan"/"TULCÁN" -> Tulcán, "lago" -> Lago Agrio, "coca" -> Coca, "loja" -> province Loja first then Nueva Loja, 1 char -> nothing, exact `resolvePlace` ("mana" -> null, "Quito" -> city); the writer's capital table (24) checked against my own knowledge and the provincias seed (spec reads the migration). Excerpts of the 8 real articles are plain text (no markup); the original cut mid-sentence ("... Fue…"), so a RED spec was added first (3 failing) and the fix prefers whole sentences, falling back to a word-boundary cut with an ellipsis. Original scope: Pure place logic: `src/lib/search/places.ts` (`normalizeText`, `buildPlaceIndex`, `matchPlaces`, `resolvePlace`), `src/lib/search/capitals.ts` (24 capitals with aliases, slugs verified against the provincias seed), `src/lib/search/excerpt.ts` (`markdownExcerpt`).
- [x] T2 DONE (commits `dc5e749` city filter + `ilike.ts` + `intent.ts` + specs, `9c26c9d` business cities in the options + home place resolution; 323 tests). Parent verification: tree clean, nothing from `.atl/ .codegraph/ odd/` tracked (the writer's first two commit attempts had swept them in; it soft-reset and re-staged by explicit paths), `pnpm check` 0 errors, ESLint/build ok; INDEPENDENT curl run against the local server with `dianisport-macas` as witness: wildcards are literal (`/?q=dianisp_rt`, `/?q=dian%25port`, `/?q=dian%5Fsport` do NOT find the business, which proves the LIKE escape works against PostgREST, a point the writer had not verified); controls match (`q=dianisport`, `q=Maca` (city match), `/?ciudad=Macas&provincia=morona-santiago`); `/?q=Manabí` and `/?q=manabi` -> 303 `/?provincia=manabi`; `/?q=Macas` -> 303 `/?provincia=morona-santiago&ciudad=Macas`; `q=a,b)`, `q=x),nombre.ilike.%25`, `q=%25` -> 200 (before this task a comma or paren in q broke the PostgREST filter and 500'd: PRE-EXISTING bug fixed); dev server stopped. Writer notes: the `guide` field is returned by the home load but not rendered yet (T3); the `fetchProvinceBody` error path of the home load has no spec (no home-load test setup); URL param order is provincia then ciudad (ciudad appended after the existing params, as specified). Original scope: Data and server: extend `fetchSearchOptions` with business cities; home `+page.server.ts` resolves a place query, filters by province/ciudad, searches `ciudad` in free text, and returns the guide (province + excerpt) for the card; `buildSearchHref`/`parseFilters` learn `ciudad`.
- [x] T3 DONE (commits `814a375` chips + `hrefForPlace` + specs (first writer, before a 429 cut it off), `b9402aa` single-field combobox panel + header wiring, `1e042c6` chips row + province guide card on the home; the second writer committed in small steps on purpose). Parent verification: tree clean; the T3 commits touch none of the owner's AdSense/legal files; 332 tests, `pnpm check` 0 errors, ESLint/build ok; no `MapPin` in the new UI; independent SSR run: `/` no form, no ads, search button present, 4 legal footer links intact; `/?provincia=manabi` guide card WITH excerpt and chip "Quitar filtro: Manabí" + "Limpiar todo"; `/?provincia=zamora-chinchipe` (no article) shows the fallback "Todavía no hay guía editorial"; `/?ciudad=Macas&provincia=morona-santiago` two chips; `/?categoria=salud` chip and no guide. Writer's browser run (a)-(j) at 375px and 1024px all passed (suggestions, ArrowDown+Enter, Escape order, "Más filtros" auto-open, chip removal, search from `/ecuador`, no overflow, targets >= 44px). Playwright MCP browser was locked by ANOTHER session (the owner works in parallel in this tree), so the writer used `playwright-core` + cached Chromium headless. Not verified: real touch device, screen reader. Original scope: UI: search panel redesign (single field, live suggestions, "Más filtros" disclosure) and the guide card on the home; Playwright check at 375px and 1024px.
- [x] T4 DONE. INCIDENT: after a usage-limit cut the tree contained UNCOMMITTED work that was not ours (the owner's AdSense work: `static/ads.txt`, `adsbygoogle` script in `src/app.html`, legal pages, `src/lib/site.ts`, legal footer); confirmed with the owner and committed on its own as `f9f8c4d` before relaunching the UI writer (engram also reported multiple active runtime sessions). NATIVE REVIEW (range `31fcf46..1e042c6`, medium (executable change in `src/app.html`), 29 files, 1997 lines, `slice_budget_reached`, user GRANTED, 1 lens): `approved` with 4 findings, 3 fixed and 1 known: WARNING R3-listid-const (`search-panel.svelte:22-23`: `listId`/`moreId` were the literal strings `-suggestions`/`-more`, an interpolation lost in editing; FIXED with `$derived` from the panel id), WARNING R3-terminos-garbled (`terminos/+page.svelte:101`: a Cyrillic word `причиmos` inside the liability clause of the owner's terms: FIXED to "causemos"; scanning `src`/`static` for Cyrillic now returns nothing), WARNING R3-city-ilike-unfiltered (`+page.server.ts:60-61`: a `ciudad` (and also `q`) made only of punctuation was silently ignored and listed every business under a chip saying the list was filtered: FIXED, such filters now list nothing; verified by curl: `/?q=%2C%2C%2C`, `/?ciudad=%29%29`, `/?q=%25` list no business while controls still list `dianisport-macas`; the substring match of `ciudad` is kept on purpose (lenient)), SUGGESTION R3-search-panel-untested (known: no component test setup; the legal terms also used `externalLink` on internal links so `/privacidad` and `/contacto` opened in a new tab: FIXED). Fix commits `a27889c` (search) and `240ea6a` (legal terms). `AGENTS.md` search line rewritten. The three fix commits are NOT natively reviewed (small). Reviewed boundary now `1e042c6`. LIMITS: cities are only the 24 capitals + cities of active businesses (no cantons table; a full cantons dataset is a later extension); the guide card needs the two production migrations; the Ecuador pin icon in the header was left as is on purpose. NOT done: the visual enrichment of the editorials (point 3 of the feedback: region header, section index, references, neighbouring provinces). Original scope: Wrap-up: docs (`AGENTS.md`), full checks, review per native RDD, report.

## Route per task

(recorded as each task starts)

## Progress / verification evidence

- 2026-10-02: branch `feat/search-places` from `main` (`31fcf46`).

## Next step

T1.
