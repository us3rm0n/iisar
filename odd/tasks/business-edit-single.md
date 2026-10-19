# business-edit-single

## Objective

Let an owner edit their business after creating it, and limit each user to one business for now.

## Problem

- The dashboard only creates businesses; besides the provincia select there is no way to change a business after creation.
- Nothing stops a user from creating several businesses (each with its own 7-day trial).

## Scope

- Database: enforce at most one business per owner (webmaster exempt), so the rule holds even outside the UI.
- Dashboard: hide the create form once the owner has a business; offer an edit form prefilled with the business data.
- Out of scope: subscription gating of business edits, premium features, deleting businesses.

## Constraints

- RLS/trigger is the real control; the UI is convenience.
- Existing local data may already contain owners with several businesses: the migration must not fail on them (only block new inserts).
- Reuse `business-form.svelte` and `$lib/utils/business-form.ts`; keep tests alongside.

## Delivery

- Strategy: `ask-on-risk`. Forecast ~300 authored changed lines (under the 400 budget).
- Branch: `feat/business-edit-single`.

## Tasks

- [x] T1 — One business per owner: migration with a `before insert` trigger on `businesses` that raises when a non-webmaster owner already has one; dashboard hides the create form when `businesses.length >= 1` and shows why. Route: delegated (writer, 2+ files).
- [x] T2 — Edit business: repository `updateBusiness`, update payload builder (no `owner_id`/`estado`), dashboard edit mode prefilling `business-form.svelte` from the business, save/cancel, reload. Route: delegated (writer, 2+ files).

## Acceptance criteria

- A second insert by the same non-webmaster owner fails with a clear error message; the dashboard does not offer the create form when a business exists.
- The owner can open an edit form for their business, change fields (nombre, slug, descripcion, vision/mision, ciudad, contacto, categoria, provincia, color) and save; the list and landing reflect it.

## Checks

- `pnpm test`, `pnpm check`, `pnpm lint` (prettier known failures: `src/lib/supabase/helpers.ts`, `src/lib/utils/date.ts`).
- `npx supabase db reset` applies the migration (if Docker is running).

## Progress

- Created 2026-10-18.
- T1 done: migration `20251018000001_one_business_per_owner.sql` (`before insert` trigger, webmaster exempt, no unique constraint); `canCreateBusiness` + `ONE_BUSINESS_MESSAGE` in `$lib/utils/business-form.ts`; `Dashboard.canCreate` and a guard in `Dashboard.create`; dashboard hides the create form once a business exists. Evidence: RED 4 failing tests, then `pnpm test` 369/369 pass; `pnpm check` 0 errors; `npx supabase db reset` skipped (local stack not running). Pre-existing lint failures on the base: prettier on `odd/tasks/{ecuador-original-content,guide-design,ui-minimal-redesign}.md`, `src/lib/components/home-hero.svelte`, `src/lib/supabase/helpers.ts`, `src/lib/utils/date.ts`; eslint `svelte/prefer-writable-derived` in `home-hero.svelte`. Commit `fb97a19`.
- T2 done: `updateBusiness` in the dashboard repository (throws on error; `BUSINESS_COLUMNS` now include `descripcion`, `contacto`); `businessToForm` and `buildBusinessUpdatePayload` (shares the `businessFields` mapping with `buildBusinessPayload`, omits `owner_id`/`estado`); `Dashboard` edit state (`editingId`, `editForm`, `saving`, `editError`, `editMessage`, `startEdit`, `cancelEdit`, `saveEdit`); `business-form.svelte` gains `mode` (`create`/`edit`), `busy` and `oncancel`; "Editar" button in `business-item.svelte`. Evidence: RED 10 failing tests, then `pnpm test` 379/379 pass; `pnpm check` 0 errors; lint only shows the pre-existing failures listed in T1. `src/lib/dashboard/repository.spec.ts` was outside the edit surface, so `updateBusiness` has no repository-level unit test. Next: manual check in the browser and review.
