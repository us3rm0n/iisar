# Feature: guide-design

## Objective
Province editorial guides (`/ecuador/<slug>`) look richer and less plain, with no data model change.

## Problem / Why (user, 2026-10-02)
"los editoriales tambien estan muy simples a la vista"; confirmed with "dale, hacé las guías menos simples". The article is one flat prose block, sources are a raw link list, and nothing connects a guide to the rest of the site.

## Scope
- Region-tinted header (region icon from `regionIcon`, never MapPin).
- Section index ("En esta guía"): sticky sidebar on desktop, collapsible `details` on phones.
- Article split in sections (`<section id>` + heading) so anchors need no sanitizer change.
- `### Fuentes` rendered as a styled references block (host + title), external links safe.
- Neighbouring provinces: curated constant (geographic fact), symmetric, validated against the provincias seed.
- Calmer editorial typography in `.prose-content` (h4, blockquote, first paragraph lead).
Out of scope: DB fields (ficha with capital/cantones/población), new articles, header Ecuador icon.

## Constraints
Mobile-first (min-width only), 44px targets, tokens only, lucide icons only, Spanish UI copy, English code. Editor/preview and the sanitizer allowlist unchanged. Strict TDD (`pnpm test`), pure logic first. No push/merge: the user decides.

## Mode
TDD on, source: project config (strict), runner `pnpm test`.

## Tasks
- [x] T1 `src/lib/content/guide.ts`: `parseGuide(markdown)` -> `{ intro, sections[{id,title,html}], sources[{label,href,host}] }` (spec first).
- [x] T2 `src/lib/utils/province-neighbors.ts`: `neighborsOf(slug)` curated, symmetric, slugs valid (spec first).
- [x] T3 UI: header, index, sections, references, neighbours, typography; Playwright at 375px and 1024px.
- [x] T4 Wrap-up: AGENTS.md line, full checks, native review assessment, report.

## Route per task
T1-T3 delegated direct: one writer (2+ non-trivial files, preparation trigger). T4 parent.

## Progress / evidence
T1 0c4198b (RED: module missing; GREEN 17 tests). T2 559cd71 (RED: module missing; GREEN 8 tests). T3 df54a57; pnpm test 34 files/365 tests pass; check 0 errors; build ok; Playwright 375/1024 no overflow, targets >=44px except pre-existing "Registrar el mio" (32px at sm+). Neighbour pairs left out: tungurahua-morona-santiago, azuay-zamora-chinchipe.

T4 2026-10-03: AGENTS.md already documents parseGuide/neighbours; pnpm check 0 errors, pnpm test 365 passed, ESLint clean. Branch feat/ecuador-contenido-original-2 is 17 commits ahead of main; not merged/pushed (user decides).
