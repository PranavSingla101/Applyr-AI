# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** Phase 1 — Foundation (Homepage, Auth, PostHog, Database Schema)
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 04 Database Schema (2026-07-01): was previously checked off but never actually implemented — backend had zero tables/buckets. Rebuilt via migration `migrations/20260701074301_create-core-schema.sql`: all 4 tables + `resumes` private bucket, RLS scoped to `auth.uid()` on every table, `ON DELETE CASCADE` from all `user_id`/`profiles.id` FKs to `auth.users(id)`, `profiles.updated_at` auto-touched via `system.update_updated_at()` trigger, `text[]` columns default `'{}'`, indexes on `jobs(user_id, match_score)` and `jobs(user_id, found_at)` for Feature 11's sort/filter needs. `resumes` bucket is private (auth-required); per-user `{user_id}/` path scoping is enforced by app code always writing under the authenticated caller's own id, not by a storage-level RLS policy — InsForge storage only exposes a public/private toggle at the bucket level, no path-level ACL.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
