# Memory — Database Schema Build (Feature 04)

Last updated: 2026-07-01

## What was built

- `migrations/20260701074301_create-core-schema.sql` (new) — creates all 4 InsForge Postgres tables (`profiles`, `agent_runs`, `jobs`, `agent_logs`) per `context/architecture.md`, applied via `npx @insforge/cli db migrations up`.
- `resumes` storage bucket created (private) via `npx @insforge/cli storage create-bucket resumes --private`.
- `context/progress-tracker.md` — added a "Decisions Made During Build" entry documenting the rebuild (the tracker had `04 Database Schema` checked off, but the backend actually had zero tables/buckets until this session).
- Saved a decision memory to InsForge project memory (`npx @insforge/cli memory remember`) covering the same rebuild, so it's discoverable from any future session on this backend.

## Decisions made

- RLS enabled on all 4 tables, policies scoped to `auth.uid()` (`id = auth.uid()` for `profiles`, `user_id = auth.uid()` elsewhere), with both `USING` and `WITH CHECK` on every policy.
- `ON DELETE CASCADE` from every `user_id`/`profiles.id` FK to `auth.users(id)` — no orphaned rows after a user is deleted.
- `profiles.updated_at` auto-touched via a `BEFORE UPDATE` trigger (`system.update_updated_at()`), not left to app code to set manually.
- `text[]` columns default to `'{}'` (never null) so app code can safely `.map()`/`.length` them; `jsonb` columns (`work_experience`, `education`, `company_research`) stay nullable with no default, matching existing UI empty states.
- Added `jobs(user_id, match_score)` and `jobs(user_id, found_at)` indexes ahead of time for Feature 11's sort/filter needs.
- `jobs.source` has a `CHECK (source IN ('search','url'))` constraint per the architecture invariant.
- **Storage access-control limitation (important, verified via SQL, not assumed):** InsForge storage buckets only support a bucket-level public/private toggle. `storage.objects` has `relrowsecurity = false` and zero policies — there is no per-object/per-path RLS in this backend. So "own files only" for `resumes/{user_id}/...` is **not** enforced by the database — it depends entirely on app code always deriving the path from the authenticated session's own user id, never from client-supplied input. This is weaker than the DB-table RLS and should be treated as a real thing to verify when the resume upload routes (Features 06/08) are built — confirm they never trust a client-provided `userId` for the storage path.

## Problems solved

N/A — clean build, no bugs hit while creating the schema.

## Current state

- Backend now has all 4 tables + `resumes` bucket live and verified via `get-table-schema` (columns, FKs, indexes, RLS policies, trigger all confirmed present).
- **Auth (from prior session) — GitHub and Google OAuth confirmed fully working, considered done.** The earlier one-off GitHub `?error=auth_failed` flake did not reproduce on subsequent attempts and is no longer being tracked as an open issue; login/callback/session/sign-out are all working end-to-end for both providers.
- Progress tracker's Phase 1 (`01`–`04`) is now genuinely complete, not just checked off.
- `/find-jobs` and `/profile` routes still return 404 — pages not built yet (Phase 2 not started).

## Next session starts with

- Phase 2, Feature 05 — Profile Page: Full UI (mock data, no save logic yet), per `context/build-plan.md`.
- When Feature 06 (Profile Save Logic) or 08 (Resume PDF Generation) is built, double-check the storage upload path always uses the server-derived session user id, not a client-supplied one — see the storage RLS limitation noted above.

## Open questions

None open. (GitHub OAuth flake from the previous session is resolved/closed — see Current state.)
