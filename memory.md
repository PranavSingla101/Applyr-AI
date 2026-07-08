# Memory — AI Profile Extraction from Resume (Feature 07)

Last updated: 2026-07-07

## What was built

- `app/api/resume/extract/route.ts` (new) — `POST` API route. Auths the caller, reads `resume_pdf_key` off `profiles`, downloads the PDF from InsForge Storage, extracts text via `pdf-parse` v2's `PDFParse` class, rejects sub-50-char text with "Could not extract text from this PDF. Please try a different file.", then calls **GPT-5.4 nano** (`response_format: json_object`, `temperature: 0.3`, `max_completion_tokens: 800`) to return JSON matching `ProfileFormValues`.
- `lib/profile.ts` — added `SCALAR_FIELDS` (exported, 13 scalar keys), `ScalarProfileField` type, `mergeExtractedProfile()` (blank-fields-only merge; `workExperience`/`education` merged as whole blocks, arrays deduped via `Set`), and `diffExtractedProfile()` (finds scalar fields where the user's typed value and the extracted value disagree — feeds the conflict-suggestion UI).
- `components/profile/SuggestionBubble.tsx` (new) — small pill (`bg-accent-muted`/`text-accent`) showing "Resume says '...'"; click the text to apply, click the `X` to dismiss.
- `components/profile/ProfileForm.tsx` — `Field` helper gained an optional `suggestion` slot; all 13 scalar fields now render a `SuggestionBubble` when a conflict exists. Enum fields (workAuthorization/experienceLevel/remotePreference) map the raw value to its human label via small lookup objects before display.
- `components/profile/ProfilePageClient.tsx` — added `saveResume()`-backed immediate upload-on-select (fixed a pre-existing bug where resumes only persisted after clicking the unrelated "Save Profile" button at the bottom of the page), `handleExtract()`, `suggestions` state, `handleAcceptSuggestion`/`handleDismissSuggestion`, and auto-clearing a field's suggestion when the user edits that field manually.
- `actions/profile.ts` — added `saveResume(file)` (upload + persist `resume_pdf_url`/`resume_pdf_key` independently of the full profile save).
- `app/api/resume/route.ts` — now reads `resume_pdf_key` from the DB instead of hardcoding the storage path.
- `migrations/20260707123443_add-resume-pdf-key.sql` (new, applied) — added `profiles.resume_pdf_key`.
- `next.config.ts` — added `experimental.serverActions.bodySizeLimit: "5mb"` (was defaulting to 1MB, silently failing on resumes over that) and `serverExternalPackages: ["pdf-parse"]` (fixes a Turbopack bundling issue — see Problems solved).
- `.env.local` — removed a duplicate empty `OPENAI_API_KEY=` line that was shadowing the real key (env loaders keep the first occurrence of a duplicate).
- `context/architecture.md`, `context/build-plan.md`, `context/library-docs.md` — updated to record GPT-5.4 nano as a deliberate, scoped exception to the "always GPT-4o" rule (resume extraction only), the `max_completion_tokens` requirement for that model, and `pdf-parse` v2's `PDFParse` class API (replacing the old v1 `pdf(buffer)` docs, which were wrong for the installed version).
- `context/ui-registry.md` — added the Suggestion Bubble pattern entry.
- `context/progress-tracker.md` — Feature 07 checked off, decision entries 07/07b/07c/07d added, "Next" pointer moved to Feature 08.

## Decisions made

- **Model exception:** GPT-5.4 nano is used *only* for resume profile extraction; every other AI call in the app (matching, research synthesis, resume generation) stays on GPT-4o. Explicit developer decision, documented in three context files so it doesn't get "corrected" back.
- **Merge semantics:** extraction never overwrites a field the user already filled in. Blank fields get auto-filled silently; non-blank fields that conflict get a dismissable suggestion bubble instead of being overwritten or dropped.
- **Route not Server Action:** extraction lives behind `app/api/resume/extract/route.ts`, not a Server Action, per the project invariant that only API routes call agent-adjacent logic.
- **Resume upload fires immediately on file-select** (via `saveResume()`), not deferred to the big "Save Profile" button — this was actually a bug fix (see Problems solved) that changed the original Feature 06 design intentionally.
- Suggestion bubbles are scoped to the 13 scalar fields only — arrays (skills/industries) and block fields (workExperience/education) are excluded because "which item conflicts" doesn't map cleanly onto a single bubble.

## Problems solved

- **Resume never actually persisted across tab switches** — root cause was the upload only firing on the unrelated "Save Profile" click, far from the resume widget with no indication it was required; the local blob preview made it look saved when it wasn't. Fixed by uploading immediately on file selection via a new `saveResume()` action.
- **`next build` failing at page-data-collection** — `new OpenAI(...)` was instantiated at module scope; moved inside the request handler.
- **Duplicate `OPENAI_API_KEY=` in `.env.local`** shadowed the real key (first occurrence wins) — removed the stale empty line.
- **"Could not extract text from this PDF" on a real, valid resume** — reproduced by downloading the actual stored object via `npx @insforge/cli storage download` and running the identical `PDFParse` call in plain Node: it worked (3826 chars extracted). The failure was specific to Turbopack's server bundle mangling `pdf-parse` v2's underlying `pdfjs-dist` worker/wasm resolution. Fixed with `serverExternalPackages: ["pdf-parse"]` in `next.config.ts`. **Requires a dev server restart to take effect** (config changes aren't hot-reloaded, and the agent cannot restart the dev server per project rules) — confirm this restart happened if extraction still fails on a real PDF.
- **`400 Unsupported parameter: 'max_tokens'`** — GPT-5.4 nano is on OpenAI's newer parameter surface (like the `o1`/reasoning family) and requires `max_completion_tokens` instead. Fixed, scoped only to the GPT-5.4 nano call.
- **React "duplicate key" console error** — GPT-5.4 nano returned a `skills`/`industries` array with a duplicate entry; `mergeExtractedProfile` now dedupes extracted arrays via `Set` before assigning.

## Current state

- Feature 07 is code-complete and checked off. Typecheck, lint, and `next build` all pass clean after every change in this session.
- Extraction has been verified against a real uploaded resume at the `pdf-parse` layer (standalone repro), and the `max_tokens` fix was confirmed against a live dev-server error log the user pasted in. The suggestion-bubble UI (this session's last change) has **not yet been manually clicked through in the browser** — build/typecheck pass, but the actual bubble-click accept/dismiss behavior needs a human pass.
- Dev server was running throughout on `localhost:3000`, never restarted/killed by the agent. The `serverExternalPackages` fix requires a manual restart the user needs to do themselves if not already done.
- Phase 1 (01–04) and Phase 2 Features 05–07 are complete. Feature 08 (Resume PDF Generation from Profile) is next.

## Next session starts with

- Confirm with the user whether the suggestion-bubble accept/dismiss flow works correctly in the browser (upload a resume with at least one field that conflicts with something already typed, verify bubble appears, click-to-apply and click-X-to-dismiss both behave as described).
- Then start Feature 08 — Resume PDF Generation from Profile: `POST /api/resume/generate`, GPT-4o (not GPT-5.4 nano — that exception is scoped to extraction only) generates professional resume content from current profile data, `@react-pdf/renderer`'s `renderToBuffer()` renders it, buffer uploaded to `resumes/{user_id}/resume.pdf` (overwrite), `resume_pdf_url`/`resume_pdf_key` updated in `profiles`. Per `context/build-plan.md` Feature 08.

## Open questions

- None blocking. Only outstanding item is the manual browser click-through of the suggestion bubbles noted above.
