# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Auth Page — Login
File: `app/(auth)/login/page.tsx`
Last updated: 2026-07-01

| Property | Class |
| --- | --- |
| Page background | `bg-background` |
| Split card shell | `rounded-2xl border border-border shadow-[0px_4px_32px_rgba(0,0,0,0.08)] overflow-hidden` |
| Left panel background | `bg-background` |
| Right panel background | `bg-surface` |
| Panel padding | `p-10` |
| OAuth button background | `bg-surface` |
| OAuth button border | `border border-border rounded-lg` |
| OAuth button text | `text-[14px] font-medium text-text-primary` |
| OAuth button hover | `hover:bg-surface-secondary transition-colors` |
| OAuth button focus | `focus:outline-none focus:ring-2 focus:ring-accent/40` |
| OAuth button disabled | `disabled:opacity-50` |
| OAuth button spacing | `px-4 py-3 gap-3` |
| Error banner | `bg-error/10 border border-error/20 text-error rounded-lg text-[13px] text-center font-medium p-3.5` |
| Badge | `bg-surface border border-border rounded-full text-[12px] font-medium text-text-secondary shadow-sm px-3 py-1.5` |
| Hero heading | `text-[52px] leading-[1.1] font-bold text-text-primary tracking-tight` |
| Panel heading | `text-[30px] font-bold text-text-primary tracking-tight` |
| Body text | `text-[15px] leading-[26px] text-text-secondary` |
| Label text | `text-[14px] text-text-secondary` |
| Caption text | `text-[13px] text-text-secondary` |
| Muted caption | `text-[12px] text-text-muted` |
| Accent glow | `bg-accent/10 blur-[120px] rounded-full pointer-events-none` |
| Info glow | `bg-info/6 blur-[100px] rounded-full pointer-events-none` |

**Pattern notes:**
Split-panel layout: left panel = marketing copy on `bg-background`, right panel = auth form on `bg-surface`, separated by `w-px bg-border`. Card shell uses `rounded-2xl` — not `rounded-xl`. OAuth buttons use `py-3` (not `py-2.5`). Focus ring is `accent/40` (not `accent/50`). No `shadow-sm` on buttons.

---

### Navbar
File: `components/layout/Navbar.tsx`
Last updated: 2026-07-01

| Property | Class |
| --- | --- |
| Header background | `bg-surface` |
| Header border | `border-b border-border` |
| Header position | `sticky top-0 z-50` |
| Container max-width | `max-w-[1440px] mx-auto px-6 h-16` |
| Nav link gap | `gap-8` |
| Nav link (inactive) | `text-sm font-medium text-text-dark hover:text-accent transition-colors` |
| Nav link (active) | `text-sm font-medium text-accent` |
| Primary CTA | `bg-text-primary text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity` |
| Secondary button | `border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer` |
| Right group gap | `gap-4` |
| Logo image dimensions | `width={630} height={533}` with `className="h-10 w-auto"` |
| Above-fold image loading | `preload` |

**Pattern notes:**
Navbar uses `bg-surface` (not `bg-background`). Buttons use `rounded-md` — not `rounded-lg`. Primary CTA uses `hover:opacity-90` pattern (no bg-change on hover). Secondary actions use `hover:bg-surface-secondary`. Nav links have `gap-8` between items.
The logo keeps the source image's intrinsic 630:533 ratio while CSS controls its rendered height, preventing Next Image aspect-ratio warnings. Above-fold images use Next 16's `preload` prop.

---

### Standard Content Card (Profile page)
File: `components/profile/CompletionIndicator.tsx`, `components/profile/ResumeUpload.tsx`, `components/profile/ProfileForm.tsx`
Last updated: 2026-07-01

| Property | Class |
| --- | --- |
| Card shell | `rounded-2xl border border-border bg-surface p-6` |
| Card shadow | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Page column width | `max-w-3xl mx-auto px-6 py-8` |
| Gap between stacked cards | `flex flex-col gap-6` |
| Card heading | `text-base font-semibold text-text-primary` |
| Card subtitle | `text-sm text-text-secondary mt-1` |
| Section heading (inside card) | `text-sm font-semibold text-text-primary mb-4` |
| Section divider | `mt-6 pt-6 border-t border-border` |

**Pattern notes:**
This is the canonical white-card shell for any content section — matches `ui-tokens.md`'s Card spec exactly (`rounded-2xl`, not `rounded-xl`; the two-layer shadow, not `shadow-sm`). A page built from multiple cards stacks them in a `max-w-3xl` centered column with `gap-6`. A card that has several internal subsections (like the profile form) uses one continuous card with `border-t` dividers between subsections rather than separate cards per subsection — only split into separate cards for things that are conceptually distinct top-level sections (banner / resume upload / form).

---

### Form Fields (Profile page)
File: `components/profile/ProfileForm.tsx`
Last updated: 2026-07-01

| Property | Class |
| --- | --- |
| Field label | `text-xs font-medium uppercase tracking-wide text-text-secondary` |
| Field layout | `flex flex-col gap-1.5` |
| Two-column grid | `grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5` |
| Full-width field in grid | add `md:col-span-2` |
| Text input | `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent` |
| Disabled input | `disabled:bg-surface-secondary disabled:text-text-muted disabled:cursor-not-allowed` |
| Select | same as text input + `appearance-none pr-9 cursor-pointer`, paired with an absolutely positioned `ChevronDown` (`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted`) |
| Textarea | text input classes + `resize-none`, `rows={3}` |
| Tag/pill (skills, industries) | `flex items-center gap-1.5 bg-surface-secondary border border-border rounded-full pl-3 pr-2 py-1 text-sm font-medium text-text-primary`, remove icon `text-text-muted hover:text-error` |
| Secondary button (Add, Select Resume) | `bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer` |
| Primary button (Save, Generate) | `bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer` |
| Full-width primary (Save Profile) | primary button classes + `w-full py-3` |
| Inline text link/action (Add role) | `flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80 cursor-pointer` |

**Pattern notes:**
Labels are always uppercase/`text-xs`/`text-text-secondary` — never the 14px `text-text-secondary` "Card label" size from `ui-tokens.md`; the profile form's denser field grid needed the smaller label. Repeatable groups (work experience roles) reuse the same two-column grid per entry, separated by `border-t border-border` when more than one exists, with a small `text-error` "Remove" action shown only when count > 1 — never on the first entry. Checkbox-linked disable pattern (`Currently working here` → disables End Date) reuses the standard disabled input classes rather than hiding the field.

---

### Suggestion Bubble (Profile page — resume extraction conflicts)
File: `components/profile/SuggestionBubble.tsx`
Last updated: 2026-07-07

| Property | Class |
| --- | --- |
| Bubble shell | `inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent-muted border border-accent/20 pl-3 pr-1.5 py-1 text-xs font-medium text-accent` |
| Apply action (bubble text itself) | `truncate hover:underline cursor-pointer` |
| Dismiss action | `shrink-0 text-accent/60 hover:text-accent cursor-pointer`, `X` icon `h-3 w-3` |

**Pattern notes:**
Used when resume extraction (Feature 07) disagrees with a value the user already typed into a scalar field — rendered inline below the input via `Field`'s new optional `suggestion` slot (`ProfileForm.tsx`), never replacing the input itself. Uses `bg-accent-muted`/`text-accent` (the same pairing `ui-tokens.md` assigns to "missing skill" badges) rather than `info` or `warning` tokens — this is framed as an AI suggestion to consider, not an error or a neutral info banner. Clicking the bubble text applies the suggested value (overwriting what the user typed); clicking the `X` dismisses it and keeps the user's original value. Only wired for scalar fields (`ScalarProfileField` in `lib/profile.ts`) — array fields (skills/industries) and block fields (workExperience/education) are excluded, since merge-vs-conflict doesn't map cleanly onto lists or nested objects.

---

### View Generated Resume Link (Profile page — resume generation)
File: `components/profile/ResumeUpload.tsx`
Last updated: 2026-07-07

| Property | Class |
| --- | --- |
| Link (active) | `flex items-center gap-1.5 bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer`, `Eye` icon `h-4 w-4` |
| Disabled placeholder (same slot) | `flex items-center gap-1.5 bg-surface-secondary border border-border text-text-muted px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed`, same `Eye` icon |

**Pattern notes:**
Active-state classes are identical to the existing "View Current Resume" link (same file) — reused verbatim since both are "open a private PDF in a new tab" actions. Unlike "View Current Resume" (which is omitted entirely until a resume exists), this one **always renders** in the same slot next to "Generate Resume from Profile" — before a resume has been generated it renders as a greyed-out, non-interactive `<span>` (not an `<a>`) with the disabled classes above, so the layout doesn't shift when a generated resume first appears. Swaps to the active link once `generated_resume_pdf_key` exists (i.e. after a successful `/api/resume/generate` call).

---

### Completion Ring
File: `components/profile/CompletionIndicator.tsx`
Last updated: 2026-07-01

| Property | Class |
| --- | --- |
| Track circle | `stroke-error/15` |
| Progress circle | `stroke-error`, `strokeLinecap="round"` |
| Center percentage text | `text-2xl font-bold text-text-primary` |
| Missing-field pill | `px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-semibold uppercase tracking-wide` |

**Pattern notes:**
Ring color is `error` (red), not `accent` — this is a "needs attention" indicator, not a generic progress/stat ring, so it intentionally does not reuse the purple accent used elsewhere for progress bars. Built with a raw SVG circle pair (track + `strokeDasharray`/`strokeDashoffset` progress) rather than a canvas or third-party chart — no charting dependency justified for a single static ring.

---

### Find Jobs — Search Controls Card
File: `components/find-jobs/JobSearchControls.tsx`
Last updated: 2026-08-27

| Property | Class |
| --- | --- |
| Card shell | `rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Control row | `flex flex-col gap-4 md:flex-row md:items-end` |
| Field label | `text-xs font-semibold uppercase tracking-wide text-text-dark` |
| Large input | `w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent` |
| Leading input icon | `pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted` (input gets `pl-11`) |
| Pill primary button | `flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer` |
| Success banner | `flex items-center gap-3 rounded-lg bg-success-lightest px-4 py-3.5`, icon + text `text-success-darker`, text `text-sm font-medium` |

**Pattern notes:**
The only place in the app using a **pill** primary button (`rounded-full`) and the taller `rounded-xl` / `py-3` input — the profile form's `rounded-md` / `py-2` field is the default everywhere else; this card is the page's primary action surface and the design gives it more weight. Labels are `text-text-dark` and `font-semibold`, one step darker/heavier than the profile form's `text-text-secondary` / `font-medium` labels, again matching the mock. The success banner is `rounded-lg` — a deliberate second radius level inside the `rounded-2xl` card, which is the maximum nesting `ui-rules.md` allows.

---

### Find Jobs — Filter Bar Card
File: `components/find-jobs/JobFilterBar.tsx`
Last updated: 2026-08-27

| Property | Class |
| --- | --- |
| Card shell | `rounded-2xl border border-border bg-surface px-6 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Borderless filter input | `w-full border-0 bg-transparent py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none` |
| Vertical divider | `hidden h-8 w-px shrink-0 bg-border md:block` |
| Dropdown select | `appearance-none rounded-lg border border-border bg-surface py-2.5 pl-4 pr-9 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer` |
| Select chevron | `pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary` |

**Pattern notes:**
The filter input has **no border of its own** — the card is the input. This is the one input in the app that omits `border-border` and the focus ring; a bordered input inside a bordered card read as a box-in-a-box against the mock. Dropdowns reuse the profile form's native-`select` + absolutely-positioned `ChevronDown` pattern but at `rounded-lg` / `py-2.5` / `font-medium`, since here they are button-like controls rather than form fields. Divider is `md:block` only — the row stacks on narrow screens where a vertical rule makes no sense.

---

### Find Jobs — Jobs Table
File: `components/find-jobs/JobsTable.tsx`, `components/find-jobs/MatchScoreBar.tsx`, `components/find-jobs/JobsPagination.tsx`
Last updated: 2026-08-27

| Property | Class |
| --- | --- |
| Card shell | `overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (no padding — rows own it) |
| Scroll container | `overflow-x-auto`, table `w-full min-w-[860px] border-collapse` |
| Column widths | `<colgroup>` 24% / 27% / 18% / 17% / 14% |
| Header row | `bg-surface-secondary border-b border-border` |
| Header cell | `px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary` |
| Body row | `border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary` |
| Body cell | `px-6 py-5` |
| Company logo tile | `flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-secondary`, `Building2` icon `h-4 w-4 text-text-secondary` |
| Company name | `text-sm font-semibold text-text-primary` |
| Role / salary cell | `text-sm font-medium text-text-primary` |
| Date cell | `text-sm text-text-secondary` |
| Match bar track | `h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-border-light` |
| Match bar fill | `h-full rounded-full` + `bg-success` (>=90) / `bg-info` (80-89) / `bg-warning` (<80) |
| Match percentage | `text-sm font-semibold text-text-primary` |
| Empty state | `flex flex-col items-center gap-2 px-6 py-16 text-center`, `Building2` `h-5 w-5 text-text-muted`, text `text-sm text-text-muted` |
| Pagination footer | `flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between` |
| Pagination button | `flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary cursor-pointer` |
| Pagination active page | same, but `border-accent/20 bg-accent-muted text-accent` |
| Pagination disabled | same, but `text-text-muted cursor-not-allowed` (border and background unchanged) |
| Pagination ellipsis | `flex h-9 min-w-9 items-center justify-center text-sm text-text-muted` (no border) |
| Results count | `text-sm text-text-secondary`, numbers wrapped in `font-semibold text-text-primary` |

**Pattern notes:**
The first card in the app with **no padding on the shell** — `overflow-hidden` plus per-cell `px-6` lets row borders and the header background run edge to edge, which `p-6` would prevent. Match-score bands are `>=80` green, `60-79` blue, `<60` orange, centralised in `matchScoreBarClass()` in `lib/jobs.ts` and taken from `ui-rules.md` — the one spec whose hex values map cleanly onto the success/info/warning tokens. `ui-tokens.md` previously disagreed (two green bands, nothing below 50) and has been corrected to match. The bands intentionally differ from the delivered mock, which renders 88% and 85% blue. The bar is `h-1.5` (6px); both spec files previously said 4px and have been corrected to the mock. The fill width is the one sanctioned inline style in the project — it is data-driven and cannot be a Tailwind class. Pagination's active page uses `accent-muted` + `accent/20` border (the same pairing as `SuggestionBubble`), never a solid `bg-accent` fill. Since Feature 11 the pagination controls are `next/link` elements carrying the same classes — the disabled Previous/Next edges render as inert `<span>`s with the disabled classes rather than links, so a class listed above may land on an `<a>` or a `<span>` depending on state. The table's empty state has two texts: "No jobs yet — run a search above..." when no filter is active, and "No jobs match these filters — try clearing them." when one is; both use the same centred `px-6 py-16` block with a `Building2` icon in `text-text-muted`.

---

### Job Details — Header, Info Cards, Match & Description
File: `components/job-details/JobInfo.tsx`, `components/job-details/MatchScore.tsx`, `components/job-details/JobDescription.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Page column | `mx-auto flex max-w-4xl flex-col gap-6 px-8 py-8` |
| Back link | `flex w-fit items-center gap-1.5 text-sm font-medium text-text-dark transition-colors hover:text-accent`, `ChevronLeft` `h-4 w-4` |
| Card shell | `rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Job title | `text-[30px] font-bold leading-tight text-text-primary` |
| Company name | `text-sm text-text-secondary`, separated from badge by `·` in `text-text-muted` |
| Match score badge | `rounded-full px-3 py-1 text-xs font-medium` + `matchScoreBadgeClass()` (`bg-success-lightest text-success-foreground` / `bg-info-lightest text-info-foreground` / `bg-warning/10 text-warning`) |
| Company logo tile (header) | `flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary`, `Building2` `h-6 w-6 text-text-secondary` |
| Secondary button (View Job Post) | `flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary` |
| Info card row | `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4` |
| Info card | `flex items-center gap-3 rounded-2xl border border-border bg-surface p-5` + card shadow |
| Info card icon tile | `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg` + per-card pair: `bg-success-light text-success-darker` / `bg-info-light text-info-dark` / `bg-accent-light text-accent` / `bg-surface-secondary text-text-secondary` |
| Info card value | `truncate text-sm font-semibold text-text-primary` |
| Info card label | `text-xs font-medium uppercase tracking-wide text-text-muted` |
| Card section label (uppercase) | `text-xs font-medium uppercase tracking-wide text-text-secondary` |
| Card heading icon tile | `flex h-8 w-8 shrink-0 items-center justify-center rounded-full` + `bg-success-light text-success-darker` (AI) / `bg-surface-secondary text-text-secondary` (description) / `bg-accent-muted text-accent` (research) |
| Card body paragraph | `mt-5 text-sm leading-6 text-text-primary` |
| Skill group label | `text-sm text-text-secondary` ("You have" / "Gap skills") |
| Matched skill pill | `flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1 text-sm font-medium text-success-foreground`, `Check` `h-3.5 w-3.5` |
| Gap skill pill | `flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent`, `X` `h-3.5 w-3.5` |

**Pattern notes:**
Skill pills are `px-3 py-1 text-sm` — one step larger than the `px-2 py-0.5 text-xs` badge spec in `ui-tokens.md`, matching the mock, where these pills are content rather than metadata. They reuse exactly the token pairings `ui-tokens.md` assigns to matched/missing skills, so the colours stay canonical even though the sizing doesn't. The header's match badge and the table's match bar share one band function (`matchScoreBadgeClass()` / `matchScoreBarClass()` in `lib/jobs.ts`), so a job can never read green in one place and blue in another. Cards whose heading is a small uppercase label (AI Match Reasoning, Required Skills) use the label class above; cards with a real title (Job Description, Company Research) use the standard `text-base font-semibold text-text-primary` section heading — that split is the mock's, not an accident. Every section renders only when it has data — a job with no `match_reason` or no skills simply drops those cards rather than showing an empty shell.

---

### Job Details — Company Research Card
File: `components/job-details/CompanyResearch.tsx`, `components/job-details/JobActions.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Card shell | `overflow-hidden rounded-2xl border border-border bg-surface` + card shadow (no padding — header/body own it) |
| Card header row | `flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between` |
| Pill primary button (Research Company) | `flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer` |
| Body | `border-t border-border px-6 py-8` |
| Empty state | `flex flex-col items-center gap-3 py-8 text-center`, icon well `flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary` + `Building2 h-5 w-5 text-text-muted`, title `text-sm font-medium text-text-primary`, body `max-w-sm text-sm text-text-muted` |
| Dossier stack | `flex flex-col gap-6` |
| Dossier subsection heading | `text-xs font-medium uppercase tracking-wide text-text-secondary` |
| Dossier bullet list | `flex list-disc flex-col gap-1.5 pl-5`, items `text-sm leading-6 text-text-primary` |
| Tech stack pill | `rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent` |
| Sources link | `text-xs text-text-muted hover:text-accent` |
| Full-width apply CTA | `flex w-full items-center justify-center rounded-lg bg-accent px-6 py-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90` |
| Apply CTA — no URL | `flex w-full items-center justify-center rounded-lg bg-surface-secondary px-6 py-4 text-sm font-medium text-text-muted` |

**Pattern notes:**
The second unpadded card shell in the app (after `JobsTable`) — the mock's full-bleed divider under the header requires it. The Research Company button reuses the pill-primary from `JobSearchControls`, the app's only other primary-action-on-a-card surface; it now lives in the `ResearchButton` client component (Feature 13) so the card itself stays a server component — the same split the jobs table uses for its client-side controls. The button relabels to "Re-research Company" once a dossier exists, and reuses `JobSearchControls`'s success (`bg-success-lightest`) and error (`bg-error/10`) banners verbatim, so an agent run reads the same everywhere in the app. Tech-stack pills reuse the gap-skill pairing (`accent-muted`/`accent`) rather than introducing a fourth pill colour. **The dossier body (2026-08-29) is a three-tier read:** a full-width Overview paragraph at `text-base leading-7`, then a tinted "Why This Role" callout (`bg-accent-muted`, the one place a panel carries colour, because it is the card's thesis), then the remaining five sections as a `lg:grid-cols-2` grid of `rounded-xl border border-border bg-surface-secondary p-5` panels. Panels use plain dot bullets rather than pills, which keeps radius nesting at the two levels `ui-rules.md` allows (card → panel); the tech-stack pills stay *outside* the panels for the same reason. Icon chips are `h-7 w-7` — one step down from the `h-8 w-8` card-header chip, so a section never competes with the card title. Only three tones are used: green for "Your Edge" (what the candidate already has), blue for "Smart Questions" (what they should ask), purple for everything else. Empty sections are dropped entirely, and when an odd number survives, the last panel takes `lg:col-span-2` so the grid never ends on a dangling hole. The bottom Apply CTA is `rounded-lg` and `py-4`, taller than every other button in the app — it is the page's terminal action and the mock gives it full width; it is *not* the `rounded-full` pill, which stays reserved for in-card primaries.

---

### Job Details — Research Button
File: `components/job-details/ResearchButton.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Pill primary button | `flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto` |
| Status column | `flex flex-col gap-3 sm:items-end` |
| Success banner | `flex items-center gap-3 rounded-lg bg-success-lightest px-4 py-3.5`, icon + text `text-success-darker` |
| Error banner | `flex items-center gap-3 rounded-lg bg-error/10 px-4 py-3.5`, icon + text `text-error` |
| Spinner | `Loader2` at `h-4 w-4 animate-spin` |

**Pattern notes:**
The agent-run status vocabulary is shared by both agent triggers in the app (`JobSearchControls`, `ResearchButton`) — same success/error banner treatments, same `Loader2` spinner swapped in for the button's leading icon, same `disabled:opacity-60`. **Deliberate difference: this button has no loading banner** — unlike the search card, the button sits directly above the card body, so a "Researching..." label plus a banner saying the same thing was redundant. The spinning button alone carries the in-progress state; banners are reserved for terminal outcomes here. Banners sit *outside* the card body here (the card is unpadded), so the component owns its own `gap-3` column instead of relying on the card's padding.

### Dashboard — Stat Cards
File: `components/dashboard/StatsBar.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Grid | `grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4` |
| Card shell | `rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Stat label | `text-sm font-medium text-text-secondary` |
| Stat number | `mt-2 text-[30px] font-semibold leading-9 text-text-primary` |
| Footer row | `mt-3 flex items-center gap-2` |
| Trend badge (shell) | `rounded-sm px-2 py-0.5 text-xs font-medium` + one variant below |
| Trend badge — up | `bg-success-lightest text-success-darker` |
| Trend badge — down | `bg-error/10 text-error` |
| Trend badge — flat | `bg-surface-secondary text-text-secondary` |
| Caption | `text-xs text-text-muted` |

**Pattern notes:**
The trend badge is the app's only **non-pill** badge — `rounded-sm`, per the explicit carve-out in `ui-tokens.md`/`ui-rules.md`. It renders only when the stat has a comparison; cards 3 and 4 ("Companies Researched", "Jobs This Week") never have one, and cards 1 and 2 drop it when the prior week has no data. In every no-badge case the caption sits alone in the same row, so the four cards stay the same height. **Three colour variants, not the mock's one** (Feature 15): the design only ever shows a rising stat, but a falling one rendered in the green badge would read as good news, so `down` takes `bg-error/10 text-error` and `flat` a neutral `bg-surface-secondary text-text-secondary`. `trendBadgeClass()` lives in the component; the direction itself is decided in `buildDashboardStats()`. The stat number is `font-semibold` (30px/600 from `ui-tokens.md`) even though the mock reads heavier — the token is the source of truth. Card labels here are the 14px `text-text-secondary` "Card label" size, unlike the profile form's uppercase `text-xs` labels; these are card titles, not field labels.

---

### Dashboard — Recent Activity
File: `components/dashboard/RecentActivity.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Card shell | `flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface` + card shadow (no padding — header/body own it) |
| Card header | `px-6 py-5`, heading `text-base font-semibold text-text-primary` |
| Body | `flex-1 border-t border-border px-6 py-6` |
| List item | `flex gap-4 pb-10 last:pb-0` |
| Timeline rail column | `flex w-4 shrink-0 flex-col items-center` |
| Rail stub (above every dot) | `h-2 w-px bg-border` |
| Rail run (all but last item) | `w-px flex-1 bg-border` |
| Dot ring | `flex h-4 w-4 shrink-0 items-center justify-center rounded-full` + `bg-accent-light` / `bg-info-light` / `bg-success-light` |
| Dot core | `h-2 w-2 rounded-full` + `bg-accent` / `bg-info` / `bg-success-alt` |
| Entry title | `text-sm font-medium text-text-primary` |
| Entry timestamp | `mt-1 text-xs text-text-muted` |
| Empty state | `flex flex-1 flex-col items-center justify-center gap-2 border-t border-border px-6 py-16 text-center`, `Activity` `h-5 w-5 text-text-muted`, text `text-sm text-text-muted` |

**Pattern notes:**
Third unpadded card shell in the app (after `JobsTable` and `CompanyResearch`) — the mock's full-bleed divider under the header requires it. `h-full` + `flex-1` on the body make the card stretch to whatever the chart card beside it needs, so the two halves of the row stay flush. The timeline rail is built from three stacked flex children rather than an absolutely positioned line, which keeps it inside normal flow (`ui-rules.md` forbids `position: fixed`, and absolute positioning here would need an inline height). Dot ring/core pairings come from the Activity Dots table in `ui-tokens.md` via `activityDotClasses()` in `lib/dashboard.ts`. **Feature 16 settled the tone mapping**: a completed agent run is `success` (green) and a researched company is `info` (blue), per the build plan's "info blue, success green". The mock cycles three colours including `accent` purple, but its colours do not key to entry type at all — with only two real event kinds, `accent` is now unused by this card and stays available for a third.

---

### Dashboard — Chart Card
File: `components/dashboard/ChartCard.tsx`, `components/dashboard/JobsFoundChart.tsx`, `components/dashboard/CompanyResearchChart.tsx`, `components/dashboard/MatchDistributionChart.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Card shell | `flex h-full flex-col rounded-2xl border border-border bg-surface p-6` + card shadow |
| Card heading | `text-base font-semibold text-text-primary` |
| Chart well | `mt-6 min-h-[280px] flex-1` |
| Chart empty state | `flex h-full flex-col items-center justify-center gap-2 text-center`, `ChartColumnIncreasing` `h-5 w-5 text-text-muted`, text `max-w-xs text-sm text-text-muted` |
| Row 2 grid | `grid grid-cols-1 gap-6 lg:grid-cols-2` |
| Row 3 grid | `grid grid-cols-1 gap-6 lg:grid-cols-3`, Jobs Found Over Time wrapped in `lg:col-span-2` |

**Pattern notes:**
`ChartCard` stays a **server** component and only the chart inside it is `"use client"` — the same server-shell / client-island split `CompanyResearch` uses for `ResearchButton`. Chart cards have no header divider (unlike `RecentActivity`); they are plain `p-6` cards. All recharts colours are passed as `var(--color-*)` strings, never hex, and the shared axis/grid constants live in `lib/chartTheme.ts`: horizontal-only dashed grid, no axis lines, no tick lines, 12px `--color-chart-axis` ticks, `tickMargin={12}`. Bars are `radius={[4, 4, 0, 0]}` with `maxBarSize={56}`; the area chart is `type="monotone"` with `dot={false}` and a `<linearGradient>` from `--color-accent` at 0.2 to 0. **No legends** — one series per chart, so the card title names it. **Tooltips on all three** (added after Feature 17 at the developer's request, and absent from the mock): `ChartTooltip` is `rounded-lg border border-border bg-surface px-3 py-2` with `shadow-[0px_4px_12px_rgba(0,0,0,0.08)]`, the day/bucket label in `text-xs font-medium text-text-secondary` and a value line pairing the figure — coloured by the series' own tone via `CHART_TONE_COLOR` — with a muted noun. Bars take a soft `bg-surface-secondary` column cursor, the area chart a 1px `--color-border` vertical rule plus an `activeDot` in accent ringed with `--color-surface`. **Since Feature 17 the Y axis is computed** by `niceAxis()`, not hardcoded — same four-interval shape as the mock, scaled to the data. The empty state is `ChartCard`'s, not each chart's: pass `isEmpty` (from `isChartEmpty()`) and `emptyMessage`, and the well swaps the chart for a centred icon + line, reusing `RecentActivity`'s empty vocabulary. Each of the three charts has its own message naming the action that would fill it.

---

### Dashboard — Incomplete Profile Banner
File: `components/dashboard/ProfileBanner.tsx`
Last updated: 2026-08-29

| Property | Class |
| --- | --- |
| Banner shell | `flex flex-col gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between` |
| Icon | `AlertCircle` `mt-0.5 h-4 w-4 shrink-0 text-warning` |
| Title | `text-sm font-medium text-text-primary` |
| Body | `mt-1 text-xs text-text-secondary` |
| CTA link | `shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-center text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary` |

**Pattern notes:**
Not in `dashboard.png` — the mock shows a complete profile. It is the one thing on the page the build plan asks for that the design does not show, and it renders only when `computeCompletion().isComplete` is false. Uses the `warning` pair rather than `error`: an incomplete profile degrades matching, it is not a failure. This is `rounded-2xl` (not the `rounded-lg` of the in-card banners in `JobSearchControls`/`ResearchButton`) because it is a top-level page element sitting in the same column as the `rounded-2xl` cards. The CTA reuses the standard secondary button verbatim.
