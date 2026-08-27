# Memory — Resume Generation (Feature 08) + InsForge Project Migration

Last updated: 2026-08-27

## What was built

**Feature 08 — Resume PDF Generation from Profile (complete, committed in `d91eecc`)**

- `app/api/resume/generate/route.ts` (new) — loads the profile, gates on `full_name` plus at least one work-experience entry with company+title, calls **GPT-5.4 nano** (`max_completion_tokens: 1000`) to write a professional summary and 3–5 polished bullets per role from the raw `responsibilities` text, renders through `lib/pdf/ResumeDocument.tsx` with `@react-pdf/renderer`'s `renderToBuffer()`, uploads to storage, updates `profiles`.
- `app/api/resume/generated/route.ts` (new) — download route, mirrors `app/api/resume/route.ts`.
- `lib/pdf/ResumeDocument.tsx` (new) — the react-pdf document.
- `migrations/20260707135434_add-generated-resume-columns.sql` (applied) — `profiles.generated_resume_pdf_url` / `generated_resume_pdf_key`.
- `components/profile/ResumeUpload.tsx` — "View Generated Resume" link plus loading/error state for the previously unwired `onGenerateResume` button.
- **08a fix** — extraction results were never persisted: `handleExtract` in `ProfilePageClient.tsx` only set local React state. Added a `persistValues()` helper calling the existing `saveProfile()` Server Action, invoked after the blank-fill merge and after `handleAcceptSuggestion`.

**Backend migration + client cleanup (committed and pushed as `2e5aba7`, 2026-08-27)**

- Repointed the app at a **new InsForge project** (appkey `jbhjs7m4`, API base `https://jbhjs7m4.us-east.insforge.app`). Details in `context/progress-tracker.md` entry INF-1.
- `lib/insforge-client.ts` — removed the globally-instantiated `createBrowserClient()`; sign-out now goes through the existing `/api/auth/logout` route only.
- `components/layout/Navbar.tsx` — auth state moved to `useSyncExternalStore` driven by a custom `applyr-auth-changed` window event plus `storage`, replacing pathname-keyed `useState`.
- `instrumentation-client.ts` + `lib/posthog-client.ts` — `advanced_disable_feature_flags: true` (Applyr doesn't use flags; kills dev-console noise). Event capture unchanged.
- `next.config.ts` — added `images.minimumCacheTTL: 2678400`; without it the optimizer inherited `max-age=0, must-revalidate` from `/public` and images blanked out and re-fetched on every navigation.
- Logo/hero images — intrinsic 630×533 dimensions with `h-10 w-auto`, and Next 16's `preload` in place of the deprecated `priority`. Homepage/login component polish across `Hero`, `Features`, `Testimonial`, `Navbar`, `Footer`, `login/page.tsx`.
- `.gitignore` — `backups/` ignored (holds user email + profile data).

## Decisions made

- **GPT-5.4 nano now covers both resume extraction and resume generation.** Everything else (matching, company research) still uses GPT-4o. GPT-5.4 nano rejects `max_tokens` — always use `max_completion_tokens`. Documented in `library-docs.md`/`architecture.md`/`build-plan.md` so it doesn't get "corrected" back.
- **Generated resume lives at a separate storage path** — `resumes/{user_id}/generated-resume.pdf`, not overwriting the user's uploaded `resumes/{user_id}/resume.pdf`. Deviates from the original build-plan text on purpose: Feature 07 extraction must keep reading the user's original upload. Hence the separate `generated_resume_pdf_*` columns.
- **Backup dump deliberately not replayed during migration** — the InsForge `.sql.gz` is a full-instance `pg_dump` starting with `DROP SCHEMA IF EXISTS` across `auth`/`storage`/`system`/`payments`/`realtime`; replaying it into a fresh project would clobber that project's managed internals and its JWT secrets. Schema was rebuilt by replaying the repo's own 4 migrations instead.
- Extraction never overwrites a field the user filled; blanks auto-fill, conflicts render dismissable suggestion bubbles on the 13 scalar fields only.
- All agent-adjacent AI logic stays behind API routes, never Server Actions.

## Problems solved

- **Old InsForge project was auto-paused past the free plan's 30-day restore window** — restore required Pro, declined. Recovered onto a fresh free project by replaying migrations. Two things migrations do *not* recreate and that had to be done by hand: the private `resumes` storage bucket (originally made in the dashboard) and `auth.allowed_redirect_urls` (restored via `config apply` from the committed `insforge.toml`).
- **`insforge db query` rejects SQL that begins with a `--` comment line** (parsed as a CLI flag) — strip comments first.
- **Repeated 401s on logged-out homepage visits** — the InsForge SSR browser client auto-calls `/api/auth/refresh` on init when no token exists. Removing the unused client fixed it.
- **Images blanking and reloading on every navigation** — `minimumCacheTTL` in `next.config.ts`.
- Earlier, still-relevant fixes: `serverExternalPackages: ["pdf-parse"]` for Turbopack bundling of `pdfjs-dist` workers; `max_completion_tokens` for GPT-5.4 nano; `experimental.serverActions.bodySizeLimit: "5mb"`; deduping extracted arrays via `Set`.

## Current state

- Phases 1–2 complete (Features 01–08 all checked off). Phase 3 not started.
- `main` is clean and pushed through `2e5aba7`. `npx tsc --noEmit` passes.
- **Data loss from the migration:** the 4 previously uploaded resume PDFs are gone permanently — `storage.objects` stores only metadata, never bytes. The single `public.profiles` row was restored successfully after first sign-in (26 skills, 2 work-experience entries, 2 preferred locations intact), with the four storage-pointer columns nulled so the UI doesn't render dead links. A resume needs re-uploading before Extract or Generate can be exercised.
- **Never verified live in a browser:** Features 06/07/08 all share the same limitation — no headless login (OAuth-only UI, email signup needs a verification inbox). Build/typecheck/lint pass; the suggestion-bubble accept/dismiss flow and the generate → view-PDF → confirm-original-untouched flow have not been clicked through by a human.
- A `next.config.ts` change needs a manual dev-server restart to take effect. The agent must never restart or kill the dev server.

## Next session starts with

Feature 09 — **Find Jobs Page — Full UI**, per `context/build-plan.md`. Phase 3. Run `/architect` first per project rules.

Optionally before that: re-upload a resume against the new backend and manually click through Extract (suggestion bubbles) and Generate, since neither has ever been human-verified and the migration wiped the test files.

## Open questions

- None blocking.
