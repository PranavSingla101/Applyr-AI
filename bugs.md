# Bugs

Found while redesigning the login page and the homepage CTA/footer (2026-09-23).
Each item was verified: compiled CSS checked, rendered in headless Chrome, or
checked against `context/`.

## Open

### 1. Opacity modifiers on token colors generate no CSS — High

Tailwind 3 colors here are `var(--color-*)` hex strings, so a modifier such as
`bg-error/10` can't be turned into an rgba value and Tailwind outputs nothing.
Checked in the compiled stylesheet: `bg-error/10`, `bg-warning/10` and
`border-accent/20` are missing. The elements render with no background or border.

| File | Class |
| --- | --- |
| `components/dashboard/ProfileBanner.tsx:16` | `bg-warning/10`, `border-warning/20` |
| `components/dashboard/StatsBar.tsx:14` | `bg-error/10` |
| `components/find-jobs/JobSearchControls.tsx:132` | `bg-error/10` |
| `components/find-jobs/JobsPagination.tsx:22` | `border-accent/20` |
| `components/job-details/ResearchButton.tsx:95` | `bg-warning/10` |
| `components/job-details/ResearchButton.tsx:102` | `bg-error/10` |
| `components/profile/CompletionIndicator.tsx:31` | `bg-error/10` |
| `components/profile/CompletionIndicator.tsx:48` | `stroke-error/15` |
| `components/profile/SuggestionBubble.tsx:13` | `border-accent/20` |
| `components/profile/SuggestionBubble.tsx:26` | `text-accent/60` |
| `lib/jobs.ts:148` (`matchScoreBadgeClass`) | `bg-warning/10`, so low-match badges have no background |

**Fix:** add light tokens where they're missing (`--color-error-light` now
exists; `warning-light` doesn't) and use those. Alternatively, define colors as
RGB channels (`--color-accent: 124 92 252` with `rgb(var(--color-accent) / <alpha-value>)`
in `tailwind.config.js`), which makes every `/NN` modifier work at once.

### 1a. A fresh clone doesn't build: homepage images are gitignored — High

`.gitignore` excludes `/public/images/`, but three components import files from
that folder at build time:

- `components/homepage/Features.tsx` → `public/images/jobs-lists.png`, `public/images/agnet-log.png`
- `components/homepage/Testimonial.tsx` → `public/images/user-icon.png`

`git ls-files public` lists none of them. On a fresh clone, `next build` and
`next dev` fail with "Module not found" on the homepage. It only works on this
machine because the files happen to exist locally.

**Fix:** remove `/public/images/` from `.gitignore` and commit the images that
are used (after dealing with #3 and #6, since that folder also holds the
off-brand JobPilot assets).

### 1b. Profile card always says "needs attention", even at 100% — Medium

`components/profile/CompletionIndicator.tsx` always renders the red
`AlertCircle`, the "Profile needs attention" title, and a red progress ring. A
fully complete profile shows "Profile needs attention" next to **100%** (visible
in `docs/screenshots/profile.png`).

**Fix:** branch on `percentage === 100` (or `missingFields.length === 0`) and
show a success state: success-colored ring, check icon, "Profile complete".

### 1c. Profile completion percentage uses the wrong total — Low

`computeCompletion()` in `lib/profile.ts` checks **14** fields but divides by a
hard-coded `totalFields = 13`. With one field missing it reports 92% instead of
93%, and with 14 missing, the raw value goes negative before clamping.

**Fix:** derive the total from the list of checks instead of hard-coding it.

### 2. Homepage Features section doesn't adapt to narrow screens — Medium

`components/homepage/Features.tsx` uses `grid grid-cols-2` at every width. Below
about 900px, the jobs-table and agent-log screenshots shrink to unreadable
thumbnails, and the copy wraps to 2–3 words per line.

**Fix:** use `grid-cols-1 lg:grid-cols-2`. In the second block, add
`order-last lg:order-none` to the image so the text comes first on mobile.

### 3. Homepage `agent_log` screenshot shows the wrong brand and features that aren't built — Medium

`public/images/agnet-log.png` (used in `Features.tsx`) shows "Initializing
**JobPilot** Agent…", "Tailoring resume for Stripe" and "Generating cover
letter". Cover letters and per-job resume tailoring are listed under
**Features Out of Scope** in `context/project-overview.md`, so the landing page
advertises things the product doesn't do.

**Fix:** re-capture the screenshot from the real agent log, or build it as a
component with accurate steps (discover → score → research). The file name is
also misspelled (`agnet`).

### 4. Testimonial looks made up — Medium (content/legal)

`components/homepage/Testimonial.tsx` quotes "Alex M., Senior Frontend
Engineer", who says they had "3 offers on the table". If this isn't a real
user's quote, it's a fake testimonial. That's a trust problem and, in some
regions, a consumer-protection problem.

**Fix:** replace it with a real quote you have permission to use, or remove the
section.

### 5. Footer year can go stale — Low

`components/layout/Footer.tsx` renders `new Date().getFullYear()` in a server
component on a statically generated page, so the year is set at build time and
won't change on Jan 1 until the next deploy.

### 6. Unused off-brand logo asset — Low

`public/images/logo.png` is the old **JobPilot** logo. Nothing references it, but
it's easy to pick up by mistake. Delete it.

## Fixed in this pass

- **Login page glows and error banner never rendered.** Same cause as #1
  (`bg-accent/10`, `bg-info/6`, `bg-error/10`). Fixed with solid color plus
  `opacity-*`, and a new `bg-error-light` token.
- **Login page showed raw OAuth error codes.** `?error=exchange_failed&detail=…`
  was shown to users as-is. It's now mapped to a readable sentence.
- **Bottom CTA used raw Tailwind colors.** `text-white`, `bg-white`,
  `bg-white/10`, `border-white/20` broke the tokens-only rule. It now uses
  project tokens only.
- **Footer broke on narrow screens.** Logo, nav and copyright were forced onto
  one `justify-between` row with no wrapping. It now stacks on mobile.
- **Logo PNG had an opaque white background and was unreadable at navbar size.**
  `Applyr-AI-Logo.png` is a stacked mark-over-wordmark on solid white. It showed as
  a white box on grey, and the "Applyr AI" text was about 8px tall. The mark is now
  cut out to a transparent `public/applyr-mark.png` and paired with a live text
  wordmark in `components/layout/Logo.tsx`.
