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

### Auth Page
**Path:** `app/(auth)/login/page.tsx`

**Patterns:**
- **Ambient Background Glow:** `absolute bg-accent/15 blur-[120px] rounded-full pointer-events-none mix-blend-multiply opacity-70`
- **Centered Card Container:** `w-full bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] relative overflow-hidden`
- **Card Top Accent Border:** `absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-info to-success-alt opacity-80`
- **Social Login Button:** `w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-lg bg-surface text-[14px] font-medium text-text-primary hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 cursor-pointer shadow-sm`
- **Primary Heading:** `text-[24px] leading-[32px] font-semibold text-text-primary tracking-tight`

