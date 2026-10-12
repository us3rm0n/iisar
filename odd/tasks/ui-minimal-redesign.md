# Feature: ui-minimal-redesign

## Objective

Redesign the whole frontend as modern, minimalist and mobile-first, applying clean code (shared components, tokens, no duplicated markup).

## Problem / Why

- The owner dislikes the current look (liquid-glass, gradients, ad-hoc sizes).
- No shared custom components: card, header, select and pill-button markup is duplicated across pages.
- Raw palette classes (`zinc-*`, `amber-*`) and arbitrary sizes (`text-[28px]`, `rounded-[24px]`) bypass the tokens.
- Oversized files: dashboard (436 lines), negocio landing (414), home (239).

## Decisions (accepted 2026-10-01)

- Remove the liquid-glass effect entirely: flat backgrounds, thin borders, one accent, neutral palette.
- Work on branch `feat/ui-minimal-redesign`; deliver as chained PRs (forecast well above 400 changed lines).
- Delivery strategy: `ask-on-risk` (default); chain strategy still to be chosen by the user.

## Constraints

- Mobile-first: base styles for small screens, `min-width` breakpoints only, 44x44px touch targets, no hover-only interactions, verify at 375px.
- Icons only from `@lucide/svelte`; no emoji or glyphs (`→`) as icons.
- UI copy stays Spanish (existing project language); code, comments and identifiers in English.
- Do not break `brandCssVars` (`src/lib/utils/brand.ts`) or its tests; the landing page relies on its `--color-*` aliases.
- Planning heuristic: about 400 authored changed lines per task; advisory only.

## TDD / checks

- Strict TDD: enabled (source: project/session configuration). Runner: `pnpm test` (vitest `--run`).
- Pure-logic extractions get a RED test first. Pure markup/CSS moves rely on functional checks.
- Per task: `pnpm check`, `pnpm lint`, `pnpm test`, plus a 375px visual check for UI tasks.

## Tasks

- [x] T1 Tokens and base: strip liquid-glass and gradient body from `src/routes/layout.css`; flat neutral palette, one accent, type and spacing scale; remove arbitrary sizes. Commit `9f41a09`.
- [x] T2 Shared components: `PageHeader`, `BusinessCard`, `SelectField`, pill button variants in `src/lib/components`. Commit `bb59b65`; adopted only on home and province detail.
- [x] T3 Layout and header: flat compact header; extract auth logic from `(app)/+layout.svelte` to a module (test first). Commit `37ec83a`.
- [x] T3.1 Commit `5268d7e` (accepted by user 2026-10-02, ran right after T4 to keep a single writer on the working tree). Fix `Session.sync` race in `src/lib/session.svelte.ts:11-14` (stale role can overwrite a newer one; unhandled rejection from `getProfileRole`), with a test first. Source: review finding R3-session-sync-race.
- [x] T4 Home and Ecuador pages use shared components; move the 50-line `<style>` prose block to a shared prose class. Commit `4ba55d1`.
- [x] T5 Dashboard: extract Supabase/form logic, split the view into sections. Commit `a0c483e`.
- [x] T6 Negocio landing cleanup without breaking `brandCssVars` tests. Commit `f84872b`.
- [x] T6.1 Commit `13a0cc5` (accepted by user 2026-10-02; ran after T7) `LandingButton` (`src/lib/components/negocio/landing-button.svelte:37-38`) hardcodes `target="_blank" rel="noopener"` for every href; the hero "Llamar" button passes a `tel:` URL through it, so it can open a blank tab instead of the dialer (base page rendered `tel:` without target; `_blank` was only for WhatsApp). Fix: only external http(s) links get target/rel; pure helper with a spec first. Source: review finding R3-001 (deterministic, introduced).
- [x] T7 Auth and admin pages; remove `→` glyphs, duplicated `lucide-svelte` dependency and `lib/vitest-examples`. Commits `30ddec5`, `aa71043`, `f0a0a5f` (skip link 44px included).

## Route per task

- T1: delegated (writer trigger: 2 files + read-to-write preparation).
- T2: delegated (writer trigger: 4+ new files).
- T3: delegated (writer trigger: layout + new util + spec + auth module, 2+ non-trivial files; reading prepares the write).
- T7: delegated (writer trigger: 3 pages + layout skip link + dependency/scaffolding cleanup, 2+ non-trivial files).
- T6: delegated (writer trigger: 414-line landing split into sections, reading prepares the write).
- T3.1: delegated (spec + fix in 2 files, strict TDD with deferred-promise mocks).
- T5: delegated (writer trigger: 436-line page split into logic module + sections, reading prepares the write).
- T4: delegated (writer trigger: 3 pages + css + util/spec, 2+ non-trivial files; reading prepares the write). Launched before the user decided T3.1: T4 does not touch `session.svelte.ts`.

## Progress / verification evidence

- 2026-10-01: branch created, plan accepted.
- T1 `9f41a09` (+20/-43, 2 files). RED: none, CSS-only (no testable logic). `pnpm check` 0 errors; `pnpm test` 54 passed (parent spot check); `pnpm build` ok. RDD on (global). Assessed `medium` (executable_change), 63 changed lines, `review_due=false` (`under_budget`): stays pending in the slice; reviewed boundary remains `main`. Assess needs `--untracked-scope=exclude --expected-untracked-inventory=<hash from error>` because `.atl/ .codegraph/ odd/` are untracked.
- BASELINE FAILURE (pre-existing, not caused by this feature; CORRECTED at T3 close: 8 files, verified with `pnpm lint` exit=1): prettier fails on `content/geografia-ecuador.md`, `src/lib/supabase/helpers.ts`, `src/lib/utils/date.ts`, `src/routes/(app)/auth/login/+page.svelte`, `src/routes/(app)/auth/register/+page.svelte`, `src/routes/(app)/dashboard/+page.svelte`, `src/routes/(negocio)/negocio/[slug]/+page.server.ts`, `src/routes/(negocio)/negocio/[slug]/+page.svelte`. The earlier "4 files" count (parent) was wrong; the writers' count of 8 was right. Files in T5-T7 scope get formatted when touched. ESLint itself is clean. AGENTS.md claim "lint passes" is stale. Do NOT run `pnpm format` repo-wide (rewrites ~10 unrelated files).
- T2 `bb59b65` (+156/-131, 6 files). RED: none (presentational, no pure logic). Parent spot check: `pnpm check` 0 errors; `pnpm test` 54 passed; prettier baseline unchanged (parent's "4 files" claim was wrong, see corrected baseline entry above: 8 files). Writer: `pnpm build` ok, 375px visual check on `/` ok (no overflow, selects/button 44px, card tappable). Assessed `medium`, range `main..HEAD` 348 changed lines, `review_due=false` (`under_budget`); next commit likely crosses ~400 and triggers review.
- Behavior changes accepted in T2: province cards now share the home card design (lose per-type icon and Card shell, gain category badge at `sm+`); `artista` badge is `default` variant instead of violet.
- T2 API: `PageHeader{title,description?,actions?,align?,class?}`, `BusinessCard{business,class?}`, `SelectField{id,label,hideLabel?,value($bindable),class?,children}`, `Button variant="pill"`.
- Leftovers for T4: home search form (`rounded-xl`, `text-zinc-*`), ads/empty-state/footer blocks (raw zinc, `backdrop-blur`), province page `<style>` block and headings; `BusinessCard` type export in `ecuador/[provincia]/+page.server.ts` now unused.
- T3 `37ec83a` (+125/-83, 4 files: layout rewritten, `src/lib/utils/nav.ts`, `nav.spec.ts` (6 tests), `src/lib/session.svelte.ts`). RED observed: "Failed to resolve import './nav'" (1 file failed, 54 others passed); GREEN: 60 tests passed. Parent spot check: `pnpm check` 0 errors, `pnpm test` 60 passed, ESLint clean. Writer: `pnpm build` ok; visual 375px and 1024px logged-out OK (no overflow, 44px targets, no backdrop-filter); logged-in state NOT visually verified (only unit-tested nav).
- T3 behavior changes: header flat `h-14` at all widths; nav icon-only on phones with `sr-only` text; "Crear cuenta" label from `sm`, other labels from `md`; short "Perfil"/"Registro" labels removed.
- Native review (range `main..37ec83a`, medium, 556 lines, `slice_budget_reached`): user GRANTED consent; one lens (`review-reliability`); result `approved`; acknowledged and authority burned. Reviewed boundary is now `37ec83a`. Advisory (non-blocking, not re-reviewed): R3-session-sync-race WARNING (`session.svelte.ts:11-14`, introduced); R3-card-type-contract SUGGESTION (province page `+page.svelte:13`, categories field contract unproved, causality unknown).
- T4 `4ba55d1` (+155/-152, 7 files: home, ecuador index, province page + `+page.server.ts`, `layout.css` `.prose-content` (+57), `src/lib/utils/regions.ts` + `regions.spec.ts`). RED observed (import failure for `./regions`; 60 other tests passed), GREEN 63 passed. Parent spot check: `pnpm check` 0 errors; `pnpm test` 63 passed; ESLint exit 0; prettier flags exactly the 8 baseline files. Writer: `pnpm build` ok; DOM-metric visual check at 375px and 1024px on `/`, `/ecuador`, `/ecuador/pichincha`: no horizontal overflow; all targets >=44px except layout "Saltar al contenido" skip link (16px, from T3 layout). NOT verified: screenshots (tool could not write), so prose/table readability on phones is inferred only.
- T4 finding R3-card-type-contract resolved: province load already selects `categories(nombre,slug)`; unused exported `BusinessCard` type removed.
- T4 behavior changes: home province-problem alert neutral `bg-muted` (was amber); badges use default radius; Ecuador subtitle uses a colon instead of a dash; province index cards are plain linked tiles (no shadcn Card, no hover shadow); province heading uses `PageHeader` with region badge as `actions`.
- T4 assessment: range `37ec83a..4ba55d1`, medium, 307 changed lines, `review_due=false` (`under_budget`); stays pending in the slice, reviewed boundary stays `37ec83a`.
- T3.1 `5268d7e` (+127/-1: `src/lib/session.spec.ts` +106 (named `session.spec.ts` because the vitest server project excludes `*.svelte.spec.*`), `session.svelte.ts` +21/-1). RED observed: 3 of 5 failed on real assertions (stale role overwrite, sign-out with in-flight sync, rejected lookup); the 4th (stale rejection) surfaced an unhandled rejection. GREEN: 5/5, 68 tests total. Parent spot check: `pnpm check` 0 errors; `pnpm test` 68 passed; ESLint exit 0. Writer: `pnpm build` ok; prettier flags only the 8 baseline files. Implementation: monotonic sync id (latest wins); sign-out clears user and role immediately; rejected lookup in latest sync logs `console.error` and sets role null; stale rejections swallowed.
- Native review #2 (range `37ec83a..5268d7e`, medium, 435 lines, `slice_budget_reached`): user GRANTED consent again; 1 lens (`review-reliability`); `approved` with ZERO findings; acknowledged, authority burned. Reviewed boundary is now `5268d7e`. Reviewer left unproven: CSS token variables for body/title/caption text defined outside visible hunks (T1 tokens; build output earlier confirmed `.text-display|title|body|caption` exist).
- T5 `a0c483e` (16 files, +1310/-411; about 700 lines are specs, authored non-test change roughly 600, above the ~400 heuristic; kept as one unit because the split is natural). Page 436 -> 90 lines. New: `src/lib/dashboard/repository.ts` (anon client only) and `dashboard.svelte.ts` (`Dashboard` class: `load`, `create`, `changeProvincia`); `src/lib/utils/business-form.ts` (`TIPO_META`, defaults, slug, validation, payload, `swatchColor`) and `subscription.ts` (`summarizeSubscription`); `src/lib/components/form-field.svelte` plus six under `src/lib/components/dashboard/`; 4 spec files. RED observed per unit as import-resolution failures (modules did not exist), then GREEN; suite 68 -> 112 passed. Parent spot check: `pnpm check` 0 errors; `pnpm test` 112 passed; ESLint exit 0; prettier flags exactly the 7 remaining baseline files (dashboard now formatted). Writer: `pnpm build` ok; scan of new files found no raw palette classes, hex literals, arbitrary px/rem sizes or `backdrop-`; `/dashboard` logged-out at 375px/1024px: no overflow, all targets >=44px (DOM metrics only, no screenshots).
- T5 NOT verified: logged-in dashboard (form, list, subscription status, the three selects, province change): no local credentials; only unit-tested with mocks. Svelte components have no component tests.
- T5 behavior changes: header description plain text (the "7 días gratis" badge inside it is gone); payment notice neutral `bg-muted` (was amber), `→` glyph replaced; subscription status text has no leading dash; brand-color input has a fieldset legend plus hidden "Código de color" label instead of a visible "Color marca" label; subscriptions load in parallel; swatch validated via `swatchColor` (invalid value shows zinc fallback); default brand color is one named constant `DEFAULT_PRIMARY_COLOR` (`#ea580c`, because `BRAND_FALLBACK` is zinc); dashboard keeps `getCurrentUser` from `src/lib/auth.ts` instead of the shared `Session` (needs a loading state distinct from logged-out) and keeps its own "Salir" (redirects to `/auth/login`).
- T5 facts: no edit/delete business flows and no real comprobante upload exist ("Subir comprobante" is a no-op stub, as before). `FormField{id,label,hideLabel?,value($bindable),placeholder?,required?,class?,inputClass?,hint?}` is reusable for T7 auth pages.
- Native review #3 (range `5268d7e..a0c483e`, medium, 16 files, 1721 lines, `slice_budget_reached`): user GRANTED consent; 1 lens (`review-reliability`); `approved` with ZERO findings; acknowledged, authority burned. Reviewed boundary is now `a0c483e`. Reviewer notes (pre-existing, only moved, not caused): unchecked errors in `fetchCategories`/`fetchBusinesses`; loading flag stays true if a load rejects. Minor residual risk: if the reload after a successful create throws, the catch also shows an error although the business was created.
- T6 `f84872b` (14 files, +557/-381). Page 414 -> 95 lines; `+page.server.ts` only prettier-formatted (3 lines). New `src/lib/utils/landing.ts` + `landing.spec.ts` (`catalogTitle`, `locationLabel`, `heroEyebrow`, `businessBlurb`, `landingTitle`, `productInquiryLink`, `LandingBusiness`); 10 components in `src/lib/components/negocio/` (`landing-button`, `landing-header`, `landing-hero`, `stats-band`, `story-section`, `catalog-section`, `product-card`, `highlights-band`, `contact-cta`, `landing-footer`). RED observed (`./landing` import unresolved; 112 others passed), GREEN 123 passed. Parent spot check: `pnpm check` 0 errors; `pnpm test` 123 passed; ESLint exit 0; prettier flags exactly the 5 remaining baseline files; local DB back to 1 business (`dianisport-macas`) after the writer's temporary `zz-temp-light`/`zz-temp-dark` rows were deleted (verified with psql). `brand.ts`, `landing-bands.ts`, `whatsapp.ts` and specs untouched and passing.
- T6 writer visual (DOM metrics, local Supabase only, no screenshots): 375px no overflow on light (`#fde047`) and dark (`#0f172a`) brand; brand colors apply; buttons readable in both; all targets >=44px (footer "IISAR" link was 32px wide, fixed with `min-w-11` but NOT re-measured); ~1024px no overflow. NOT verified: empty-catalog state, story section, ads notice, `dianisport-macas` page and its `cover_url`/`logo_url` images, keyboard/focus on skip link, 404 behavior.
- T6 behavior/design changes: `BusinessCard`/`PageHeader` not reused (editorial full-bleed bands); brand color only in bands, borders and buttons; text on white (prices, Misión/Visión titles, outline buttons, highlight numbers) is neutral; highlights band is a muted band with brand borders (was dark zinc-900); footer `bg-foreground`; shadcn `Card` replaced by flat bordered blocks; hero scales up to `sm:text-5xl lg:text-6xl`. Copy, links (WhatsApp deep link, `tel:`), SEO tags unchanged.
- Native review #4 (range `a0c483e..f84872b`, medium, 14 files, 936 lines, `slice_budget_reached`): user GRANTED consent; 1 lens (`review-reliability`); `approved`; acknowledged, authority burned. Reviewed boundary is now `f84872b`. Advisory (non-blocking, not re-reviewed): R3-001 WARNING deterministic/introduced (see T6.1; parent confirmed `target="_blank" rel="noopener"` is hardcoded at `landing-button.svelte:37-38`). Reviewer could not verify `landing.spec.ts` exact wa.me URL expectation depends on `waLink` normalization (the spec passes).
- T7 (3 commits, writer ran checks on the combined tree): `30ddec5` tokenize login/register/admin (4 files, +139/-104; `FormField` gained optional `type` and `minlength`); `aa71043` remove `lucide-svelte` (`pnpm remove`, also its mention in `AGENTS.md`) and delete `src/lib/vitest-examples` (5 files, +1/-26; suite 123 -> 122 because the one `greet` test went with the folder); `f0a0a5f` skip link `sr-only focus:not-sr-only focus:inline-flex focus:min-h-11 focus:items-center` (+1/-1; 116x44px when focused at 375px). No RED/GREEN: nothing pure worth extracting (auth pages share almost no branching); markup, dependency and scaffolding changes have no component-test setup. Parent spot check: `pnpm check` 0 errors; `pnpm test` 122 passed; ESLint exit 0; prettier flags only the 3 non-UI baseline files (`content/geografia-ecuador.md`, `src/lib/supabase/helpers.ts`, `src/lib/utils/date.ts`); `rg '→' src` empty; `rg lucide-svelte` (excluding node_modules, lockfile, odd, .codegraph, .atl) empty. Writer visual (DOM metrics, local only): `/auth/login`, `/auth/register`, `/admin` at 375px and `/auth/register`, `/admin` at 1024px: no overflow, targets >=44px; skip link 44px after one Tab on login at 375px.
- T7 NOT verified: `/auth/login` at 1024px; skip link at 1024px; successful sign-in/sign-up, Supabase error messages, redirects, logged-in admin actions (no local sign-in attempted). Unfocused skip link measures about 33x1px (clipped; `px-4` overrides `sr-only` padding), only a concern if a tool flags it.
- T7 behavior/copy changes: register description now "Accede al directorio y crea tu negocio." plus a "prueba 7 días gratis" badge; admin prose reworded ("máx.", "Gracia: mensual 7d, semestral 15d, anual 30d", "Solo para usuarios con el rol webmaster en `profiles`"); error/success messages gained `role="alert"`/`role="status"`; login/register no longer use a `Card` shell. Pre-existing, unchanged: `/admin` has no role guard and renders for logged-out visitors (candidate for a separate security task).
- Native review #5 (range `f84872b..f0a0a5f`, risk HIGH because of authentication in `login`, 10 files, 272 lines, `high_risk`): user GRANTED consent; four lenses (risk, resilience, readability, reliability) launched concurrently; result `approved`; risk and resilience lenses returned 0 findings; 5 non-blocking SUGGESTIONS (informational, not re-reviewed): R2-snippet-name (`admin/+page.svelte:14`, constant `snippet` holds a class string), R2-grace-constants (`admin/+page.svelte:65-67`, grace periods 7/15/30d and ad slot limits 2/2/1 hard-coded in prose with no single source), R3-a11y-roles (`login/+page.svelte:49-53`, `role=alert/status` on conditionally rendered paragraphs), R3-formfield-passthrough (`form-field.svelte:44-52`, `type` union restricted to text/email/password), R3-no-tests-left (`greet.spec.ts` deleted; reviewer saw no tests in the candidate, the suite still has 122). Acknowledged, authority burned. Reviewed boundary is now `f0a0a5f`.
- Orchestrator slip (recorded): the first parallel capture attempt failed with `invalid_request` because zsh does not word-split an unquoted variable, so `--repository-context` never reached the CLI; envelope said `mutation_outcome: not_started`, `retry_safe: true`; STATUS reoffered the same four slots at the same revision; relaunched via `bash` with explicit args. No state was lost.
- T6.1 `13a0cc5` (3 files, +55/-2): `src/lib/utils/external-link.ts` (`externalLinkAttrs(href)`: `{target:'_blank', rel:'noopener'}` for `http(s)://` and protocol-relative `//`, case-insensitive; `{}` otherwise) + `external-link.spec.ts` (9 cases) + `landing-button.svelte` spreads it. Confirmed against pre-T6 `a0c483e`: only WhatsApp links had `target`/`rel`. RED observed (`1 failed | 15 passed` files, unresolved import `./external-link`), GREEN 131 passed. Parent spot check: `pnpm check` 0 errors; `pnpm test` 131 passed; ESLint exit 0; prettier flags only the 3 non-UI baseline files; no leftover dev server (verified with `ps`). Writer functional check on local `/negocio/dianisport-macas` (HTTP 200): four `wa.me` links keep `target="_blank" rel="noopener"`, the `tel:` link has none; nothing inserted in any DB. NOT verified: real browser dialer/tab behavior; 375px viewport. Assessed range `f0a0a5f..13a0cc5`: medium, 57 changed lines, `review_due=false` (`under_budget`): NOT natively reviewed (pending in the slice; reviewed boundary stays `f0a0a5f`).
- FINAL STATE (2026-10-02): branch `feat/ui-minimal-redesign`, 11 commits ahead of `main` (`9f41a09`..`13a0cc5`), `git diff --shortstat main..HEAD`: 56 files, +2635/-1324. Suite 131 tests (was 54 before the feature at T1). `pnpm check` 0 errors, ESLint clean, `pnpm build` ok (per-task writer runs). Prettier baseline now 3 non-UI files, not touched on purpose.
- Open follow-up: "Saltar al contenido" skip link in the layout is 16px tall (<44px target); candidate for T7 or a small fix.
- Planned T4 note: `rounded-xl` ignores the `--radius` token; shared card should use a radius-based class.

## Delivery (forecast exceeded ~400 changed lines, strategy `ask-on-risk`)

Proposed chained slices by commit (changed lines include specs; `main..` boundaries):
1. `9f41a09`, `bb59b65`, `37ec83a`: tokens, shared components, header + nav + session (reviewed #1, approved).
2. `4ba55d1`, `5268d7e`: home/Ecuador tokenization, session race fix (reviewed #2, approved).
3. `a0c483e`: dashboard split, ~1721 lines mostly specs (reviewed #3, approved).
4. `f84872b`, `13a0cc5`: negocio landing + `tel:` fix (`f84872b` reviewed #4, approved; `13a0cc5` 57 lines not reviewed).
5. `30ddec5`, `aa71043`, `f0a0a5f`: auth/admin, dependency cleanup, skip link (reviewed #5 four lenses, approved).
Chain strategy: `stacked-to-main`, chosen by the user on 2026-10-02 (each PR targets `main` and is merged in order; later PRs are rebased after each merge). No push, no PR, no merge done: those are the user's decisions. Resolve `chained-pr` and `work-unit-commits` skills by registry name before creating any PR.

## Local stacked branches (created 2026-10-02, NOT pushed, no PRs)

Each branch is built on the previous one; the first is based on `main`. `feat/ui-minimal-redesign` is untouched (tip `13a0cc5`). `13a0cc5` (T6.1) sat after the T7 commits in history, so slices 4 and 5 were rebuilt with `git cherry-pick` (new hashes, same content); `git diff feat/ui-minimal-redesign feat/ui-minimal-redesign-05-auth-cleanup` is empty (identical final tree).

| # | Branch | Tip | Review budget (additions + deletions vs previous slice) | check / tests / ESLint |
|---|--------|-----|----------------------------------------------------------|------------------------|
| 1 | `feat/ui-minimal-redesign-01-foundation` | `37ec83a` | 556 (11 files) | 0 errors / 60 / ok |
| 2 | `feat/ui-minimal-redesign-02-home-ecuador` | `5268d7e` | 435 (9 files) | 0 errors / 68 / ok |
| 3 | `feat/ui-minimal-redesign-03-dashboard` | `a0c483e` | 1721 (16 files, about 700 are specs) | 0 errors / 112 / ok |
| 4 | `feat/ui-minimal-redesign-04-landing` | `3d8cb6c` | 991 (16 files) | 0 errors / 132 / ok |
| 5 | `feat/ui-minimal-redesign-05-auth-cleanup` | `e649eba` | 272 (10 files) | 0 errors / 131 / ok |

- `pnpm build` was NOT re-run per slice (it was run per task by the writers on the cumulative tree). Slice 4 shows 132 tests because `vitest-examples` is removed only in slice 5.
- Over the 400-line budget: slices 1 (556), 2 (435), 3 (1721), 4 (991). One honest slicing pass was made along existing work-unit commits; no cohesive further split was attempted (slice 3 is one commit; splitting it into logic-with-specs vs view would rewrite it). Recommendation: `size:exception` for slices 3 and 4 (mostly new components and specs from a behavior-preserving extraction), maintainer decision for 1 and 2 (35-39% of slice 1 and 2 are small overages).
- Native review boundaries: slice 1 reviewed (#1), slice 2 reviewed (#2), slice 3 reviewed (#3), slice 4 `f84872b` reviewed (#4) but the cherry-picked `13a0cc5` (57 lines) was not, slice 5 reviewed (#5). Review receipts are bound to the original commit hashes, not to the rebuilt `3d8cb6c`/`e649eba`.

## Merge to main (2026-10-02)

User chose to merge instead of opening the stacked PRs ("merge a main, yo hago push"). `git merge --ff-only feat/ui-minimal-redesign` into local `main`: fast-forward, no merge commit; `main` tip is `13a0cc5`, 11 commits ahead of `origin/main`. The user pushes. The five local stacked branches and `feat/ui-minimal-redesign` were left in place (not deleted). Stacked-PR strategy is moot unless the user changes course.

## Remaining / follow-ups (not authorized, not started)

- `/admin` has no role guard and renders for logged-out visitors (pre-existing); candidate separate security task.
- Review suggestions: admin grace-period/ad-slot constants without a single source; `snippet` constant name; `FormField` `type` union; `role=alert/status` on conditional paragraphs.
- Not visually verified anywhere: logged-in header, logged-in dashboard, sign-in/sign-up flows, logged-in admin, real-browser `tel:` behavior, phone-viewport prose/table readability (no screenshots were possible), landing empty-catalog/story/ads states, `cover_url`/`logo_url` images.
- Pre-existing: prettier baseline on `content/geografia-ecuador.md`, `src/lib/supabase/helpers.ts`, `src/lib/utils/date.ts`; `AGENTS.md` "lint passes" claim was stale (now partly corrected: lucide mention removed).

## Next step

Local stacked branches exist (see section above). Push and PR creation only on the user's explicit request; each PR needs the Chain Context section and a dependency diagram with the current PR marked.
