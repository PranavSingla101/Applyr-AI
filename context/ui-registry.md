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
