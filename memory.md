# Memory — Phase 5 Dashboard (Features 14–17) — build plan complete

Last updated: 2026-08-29

## What was built

**Features 14, 15, 16, 17 — the whole dashboard, mock UI through to real data. All 17 features in `build-plan.md` are now built. Everything is uncommitted.**

- `app/dashboard/page.tsx` — replaced the "welcome" placeholder with the real page. Server component; five user-scoped InsForge queries in one `Promise.all` feed every panel.
- `components/dashboard/` — `StatsBar.tsx`, `RecentActivity.tsx`, `ProfileBanner.tsx`, `ChartCard.tsx` (server shell), `ChartTooltip.tsx`, and three `"use client"` recharts components: `JobsFoundChart.tsx`, `CompanyResearchChart.tsx`, `MatchDistributionChart.tsx`.
- `lib/dashboard.ts` — all dashboard logic, pure and `now`-injectable: `buildDashboardStats()`, `buildRecentActivity()`, `buildJobsFoundOverTime()`, `buildCompanyResearchActivity()`, `buildMatchScoreDistribution()`, `isChartEmpty()`, `activityWindowStartISO()`, `activityDotClasses()`, plus every row/entry type.
- `lib/chartTheme.ts` — shared recharts styling: `CHART_TICK`, `CHART_GRID_COLOR`, `CHART_GRID_DASH`, `CHART_MARGIN`, `CHART_TONE_COLOR`, `CHART_BAR_CURSOR`, `CHART_LINE_CURSOR`, `niceAxis()`.
- `lib/profile.ts` — extracted `profileRowToValues()`, `EMPTY_PROFILE_VALUES`, `ProfileRow`; `app/profile/page.tsx` now shares them with the dashboard so the two can't disagree about profile completeness.
- `migrations/20260829130958_add-company-researched-at.sql` — **applied to the live backend.** Adds `jobs.company_researched_at timestamptz` + a partial index, and backfills from the newest `agent_logs` row per job (all 4 existing researched jobs recovered real timestamps).
- `app/api/agent/research/route.ts` — now stamps `company_researched_at` on every dossier save.
- `package.json` — added `recharts@3.10.1`.
- `app/globals.css` + `tailwind.config.js` — new `--color-chart-axis` token (#9CA3AF), which `ui-tokens.md` had specified as a bare hex with no variable.
- `context/` — `progress-tracker.md`, `ui-registry.md`, `architecture.md`, `library-docs.md`, `ui-tokens.md`, `code-standards.md` all updated.

## Decisions made

- **The charts read InsForge, not PostHog** — developer's call, so the feature title "17 Analytics Charts — PostHog Data" is now wrong. All three plot columns that already exist in `jobs` (`found_at`, `match_score`, `company_researched_at`). Consequence: charts provably agree with the stat cards, no read credential needed, no ad-blocker/outage risk. This deleted the Query API layer, Suspense boundaries and chart error states from the approved plan. **PostHog capture is untouched** — all four events still fire and back the PostHog dashboards.
- `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_PROJECT_ID` (492786) are in `.env.local` but **unused**, commented as such. Key value is `[REDACTED_API_KEY]` — it is only in `.env.local`, which is gitignored.
- **Where the design and the build plan disagree, the design wins** (set in Feature 14, held since): stat card 4 is "Jobs This Week" not "Cover Letters Generated"; the blue chart is "Company Research Activity" not "Resume Tailoring Activity"; both time-series charts show a rolling 7 days Mon–Sun, not the plan's 30.
- **Where the design would misrepresent real data, the data wins.** The distribution's lowest bucket is `<60%`, not the design's `50-60%` — all nine live jobs score under 60, so the design's banding would have hidden eight of them.
- **Trend badges are computed, not decorative.** Total Jobs Found trends on percentage *change*; Avg. Match Rate on percentage *points*. Both disappear when the prior week is empty (caption switches to "All time" / "Across all jobs"). `StatsBar` has three badge variants — green up, red down, neutral flat — because a falling stat in the design's green badge reads as good news.
- **Activity tones:** completed agent run → `success` green, researched company → `info` blue (per the build plan). The mock cycles three colours including purple, but its colours key to nothing; `accent` is unused by that card.
- **A dossier needed its own timestamp.** `found_at` is when a job was *discovered*; on live data that is ~15 hours before it was researched, so ordering the activity feed by `found_at` produced a visibly wrong result. Hence the migration. Rejected alternative: deriving it from `agent_logs` (a job with no `run_id` is never logged, so coverage is incomplete).
- **Server shell / client island split for charts.** `ChartCard` stays a server component; only the recharts child is `"use client"` — same pattern `CompanyResearch` uses for `ResearchButton`.
- **Tooltips on all three charts** (added last, at the developer's request; not in the design). Custom `content` always — recharts' default renders the raw dataKey ("count : 30") in its own inline styles.

## Problems solved

- **InsForge PostgREST rejects aggregate functions** — `select("match_score.avg()")` returns `400 PGRST123`. No `avg()`, `sum()` or `group by` to push down. Counts come from `count: "exact"` (unaffected by `.limit()`); averages and buckets are computed in app code over a sample capped at `JOB_STATS_ROW_LIMIT` (5000).
- **Postgres sorts NULL *first* on DESC.** `.order(col, { ascending: false }).limit(n)` on a nullable column returns the rows with *no* value. Fix is `nullsFirst: false`, which the SDK does forward — verified. This would have made the Recent Activity feed show only legacy rows.
- **`type="natural"` draws negative values.** On a week with one spike (9 jobs Friday, 0 otherwise — the live table exactly) the spline undershoots below the axis. All count charts must use `monotone`.
- **Hardcoded chart axes clip real data.** `[0,12]`/`[0,100]` were mock-fitted; `niceAxis()` now reproduces the mock's exact scales while scaling to the data (verified no clipping 0→1000).
- **`Date.now()` in a server component trips `react-hooks/purity`.** The clock read lives in `lib/dashboard.ts` (`activityWindowStartISO()`) instead.
- **Verification without being able to log in.** Every feature since 06 has this limitation. The working method: a throwaway route under `app/(preview)/`, screenshotted via headless Chromium over raw CDP (the `ms-playwright` chromium cache is present but `playwright-core` is not installed). For tooltips, `Input.dispatchMouseEvent` drives a real hover. Preview routes were deleted after each use.

## Current state

- **Works:** the whole dashboard — four stat cards, Recent Activity, all three charts, incomplete-profile banner, chart empty states, chart tooltips. `tsc --noEmit` and `eslint app components lib` clean.
- **Live data is thin and makes the page look sparse but correct:** 9 jobs all found on one day, all scoring under 60; 4 researched companies; 1 completed agent run. So there are no trend badges (no prior week to compare), the distribution is a single `<60%` bar, and Jobs Found Over Time is one spike.
- **Never verified in a real browser session.** Everything above was checked through preview routes, not by logging in. No feature since 06 has had a genuine authenticated pass.
- **Feature 13 remains degraded** — see Open questions. That is the one known functional gap in the app.
- Nothing is committed. `git status` shows the whole of Phase 3–5 plus this session's work as modified/untracked.

## Next session starts with

**A real browser pass over the authenticated app.** Log in properly and walk `/dashboard`, `/find-jobs`, `/find-jobs/[id]`, `/profile`. This is the single largest untested surface — twelve features have been shipped on indirect verification. Specifically confirm: the dashboard renders end to end for a logged-in user, the incomplete-profile banner appears and links correctly, and the research route's new `company_researched_at` write works after a live run.

After that, the obvious candidates are committing this work (it is a very large uncommitted diff) and Feature 13's open blocker.

## Open questions

- **Feature 13's company domain resolution (unchanged, still open).** Adzuna blocks both server-side `fetch` and Browserbase's datacenter IPs, so the tracking `redirect_url` never resolves to the employer's real site and every run falls back to guessing `https://www.{companySlug}.com`. No dossier has yet been built from a real company website. Unexplored, in rough order of promise: Browserbase residential proxies (`proxies: true` — one attempt failed to create a session); resolving the domain via a search engine in the browser; asking the AI for the likely domain and verifying it loads. The UI reports this honestly via the amber "partial" banner.
- **Gemini free tier allows ~20 requests/day on `3.6-flash`**, and one research run spends several — roughly one or two runs per day before quota errors.
- **Should the unused PostHog read credentials stay in `.env.local`?** Nothing reads them. Kept so the Query API can be revisited without re-provisioning; strip them if that is not planned.
- **The `<60%` bucket may want revisiting once scores improve.** It exists because every current job scores under 60 — which may itself say something about the matcher or the profile rather than about the chart.
- `JOB_STATS_ROW_LIMIT` (5000) is unexercised; no user is near it.
