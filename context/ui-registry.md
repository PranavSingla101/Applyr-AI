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

**Pattern notes:**
Navbar uses `bg-surface` (not `bg-background`). Buttons use `rounded-md` — not `rounded-lg`. Primary CTA uses `hover:opacity-90` pattern (no bg-change on hover). Secondary actions use `hover:bg-surface-secondary`. Nav links have `gap-8` between items.

