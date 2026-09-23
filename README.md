<div align="center">

<img src="public/applyr-mark.png" alt="" width="72" />

# Applyr AI

### Job hunting is hard. Your tools shouldn't be.

An AI job-hunting agent. It finds live job listings, scores each one against your real profile, researches the company in a cloud browser, and tracks all of it on one dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![InsForge](https://img.shields.io/badge/Backend-InsForge-7c5cfc)](https://insforge.dev)
[![Groq](https://img.shields.io/badge/LLM-Groq%20gpt--oss--20b-f55036)](https://groq.com)
[![Browserbase](https://img.shields.io/badge/Browser-Browserbase%20%2B%20Stagehand-111827)](https://www.browserbase.com)

</div>

<br />

<img src="docs/screenshots/homepage.png" alt="Applyr homepage: headline, call-to-action buttons, and a framed dashboard screenshot with floating match-score and company-research cards" width="100%" />

<br />

## Contents

- [What Applyr does](#what-applyr-does)
- [Screenshots](#screenshots)
- [Feature map](#feature-map)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Authentication](#authentication)
- [The agent pipelines](#the-agent-pipelines)
- [Resume pipeline](#resume-pipeline)
- [Dashboard data](#dashboard-data)
- [Data model](#data-model)
- [UI and design system](#ui-and-design-system)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Engineering rules](#engineering-rules)
- [Analytics events](#analytics-events)
- [Scope](#scope)
- [Project docs](#project-docs)

<br />

## What Applyr does

Job hunting means the same three chores over and over: **find** postings, **decide** which ones are worth your time, and **research** each company well enough to sound informed. Applyr hands all three to an agent.

| Step | You | Applyr |
|---|---|---|
| 1. Profile | Fill in a profile once, or upload a resume | Extracts your resume into the form as suggestions you accept one by one, and can generate a clean resume PDF from your profile |
| 2. Discover | Enter a job title and location | Searches live Adzuna listings and scores **every** result 0–100 against your profile, with matched skills, missing skills, and a written reason |
| 3. Decide | Filter and sort your scored jobs | Keeps high and low matches alike, so nothing is thrown away at scoring time |
| 4. Research | Click **Research Company** on a job | Opens the company's site in a cloud browser, reads the homepage plus up to three sub-pages, and writes a 9-part dossier tailored to you |
| 5. Apply | Click **Apply** | Sends you to the company's own apply page. Applyr never auto-applies and never uses Easy Apply |

Every step writes to the same Postgres database, and the dashboard reads straight from it, so its numbers always match what you've actually done.

<br />

## Screenshots

<table>
<tr>
<td width="50%">

**Dashboard**: four stat cards, a recent-activity feed, and three charts built from your own jobs data

<img src="docs/screenshots/dashboard.png" alt="Dashboard with stat cards, recent activity, and charts" width="100%" />

</td>
<td width="50%">

**Find Jobs**: search controls, then every scored job with filter, sort, and 20-per-page pagination

<img src="docs/screenshots/find-jobs.png" alt="Find Jobs page with the scored jobs table" width="100%" />

</td>
</tr>
<tr>
<td width="50%">

**Job details**: the structured posting, the match reasoning, your skills vs. the role, and the company dossier

<img src="docs/screenshots/job-details.png" alt="Job details page with match reasoning and skills" width="100%" />

</td>
<td width="50%">

**Profile**: the data every job is scored against, plus resume upload, extraction, and generation

<img src="docs/screenshots/profile.png" alt="Profile page with completion ring and resume tools" width="100%" />

</td>
</tr>
<tr>
<td width="50%">

**Sign in**: Google or GitHub OAuth through InsForge, next to a product preview panel

<img src="docs/screenshots/login.png" alt="Split login page: OAuth buttons on the left, dark product preview on the right" width="100%" />

</td>
<td width="50%">

**Mobile**: every public page adapts down to phone width

<img src="docs/screenshots/mobile.png" alt="Homepage and login page at phone width" width="100%" />

</td>
</tr>
</table>

<details>
<summary><strong>Full homepage</strong> (click to expand)</summary>
<br />
<img src="docs/screenshots/homepage-full.png" alt="Full-length homepage: hero, features, testimonial, call to action, and footer" width="100%" />
</details>

> The four signed-in screenshots were captured before the September 2026 navbar and logo refresh. Page content is unchanged; only the header looks slightly different now.

<br />

## Feature map

```mermaid
mindmap
  root((Applyr AI))
    Profile
      Resume-style form, 14 required fields
      Completion ring with missing-field chips
      Resume PDF upload to InsForge Storage
      AI extraction offered as accept or dismiss suggestions
      AI-generated resume PDF
    Job discovery
      Adzuna live search, IT jobs only
      Country detection for US, UK, Canada, Australia
      Skips jobs you already have
      AI score 0 to 100 with written reason
      Matched and missing skills
    Find Jobs
      Filter by All, High, Low match
      Sort by score, newest, oldest
      Text filter by company or role
      20 jobs per page
    Company research
      One Browserbase session per run
      Stagehand driven by Gemini reads pages
      Homepage plus up to 3 sub-pages
      9-part dossier personalised to you
      Honest partial state when browsing fails
    Dashboard
      Total jobs, average match, companies researched, jobs this week
      Five most recent agent actions
      Jobs found and research activity over 7 days
      Match score distribution
    Platform
      Google and GitHub OAuth with PKCE
      Row-level security on every table
      PostHog product events
      Token-only design system
```

<br />

## How it works

```mermaid
flowchart TD
    A([Sign in with Google or GitHub]) --> B[Build your profile<br/>form, or resume extraction]
    B --> C{Find Jobs}
    C --> D[Adzuna returns live listings<br/>for title + location + country]
    D --> E[Skip jobs already saved]
    E --> F[LLM scores each new job<br/>0–100 against your profile]
    F --> G[(All scored jobs saved,<br/>high and low)]
    G --> H[Open a job]
    H --> I{Research Company}
    I --> J[Cloud browser reads the company site<br/>Stagehand + Gemini]
    J --> K[LLM writes the dossier<br/>edge · gaps · questions · prep]
    K --> L[Apply on the company's own page]
    G --> M[Dashboard]
    K --> M

    classDef start fill:#7c5cfc,stroke:#5e4cff,color:#fff
    classDef step fill:#ffffff,stroke:#e7eaf3,color:#101828
    classDef ai fill:#61a8ff,stroke:#155dfc,color:#fff
    classDef store fill:#10b981,stroke:#007a55,color:#fff
    classDef decision fill:#faf5ff,stroke:#7c5cfc,color:#101828
    class A start
    class B,E,H,L,M step
    class D,F,J,K ai
    class G store
    class C,I decision
```

<br />

## Architecture

Applyr is a **single Next.js 16 App Router application**, with no separate backend service. [InsForge](https://insforge.dev) provides auth, Postgres, and file storage as one hosted platform. The two agent pipelines, job discovery and company research, are plain TypeScript modules inside the app, and only API routes call them.

```mermaid
flowchart LR
    subgraph Browser
        UI["Pages<br/>Server + Client Components"]
    end

    subgraph Next["Applyr · Next.js 16"]
        Proxy["proxy.ts<br/>session refresh + route guard"]
        Actions["Server Actions<br/>actions/"]
        Routes["API Routes<br/>app/api/"]
        Agent["Agent layer<br/>agent/"]
        Lib["Clients + pure helpers<br/>lib/"]
    end

    subgraph InsForge
        Auth[(Auth)]
        DB[(Postgres + RLS)]
        Storage[(Storage<br/>resumes bucket)]
    end

    subgraph External
        Adzuna[Adzuna API]
        Groq["Groq · openai/gpt-oss-20b"]
        BB["Browserbase + Stagehand v4"]
        Gemini["Gemini 3.6 Flash"]
        PH[PostHog]
    end

    UI --> Proxy
    UI -->|profile + resume saves| Actions --> DB
    Actions --> Storage
    UI -->|search / research / resume AI| Routes
    Routes --> Agent
    Routes -->|writes + agent_logs| DB
    Routes --> Storage
    Agent --> Adzuna
    Agent --> Groq
    Agent --> BB --> Gemini
    Proxy -.-> Auth
    UI -.->|events| PH
    Routes -.->|server events| PH

    classDef app fill:#7c5cfc,stroke:#5e4cff,color:#fff
    classDef data fill:#61a8ff,stroke:#155dfc,color:#fff
    classDef ext fill:#f9fafb,stroke:#e7eaf3,color:#101828
    class UI,Proxy,Actions,Routes,Agent,Lib app
    class Auth,DB,Storage data
    class Adzuna,Groq,BB,Gemini,PH ext
```

### Layer ownership

```mermaid
mindmap
  root((Codebase layers))
    app
      Pages read data and render components
      API routes handle auth, validation, DB writes, and call agent code
      No business logic
    agent
      Adzuna search and country detection
      Job scoring
      Company URL resolution and link picking
      Browsing and dossier synthesis
      Never imports React, components, or actions
    actions
      saveProfile and saveResume
      UI-triggered mutations only
      Never call agent code
    components
      UI only
      No database calls
    lib
      InsForge browser and server clients
      Groq client and JSON-schema helpers
      Stagehand session factory
      Pure data shaping for jobs, dashboard, profile
```

<br />

## Authentication

Sign-in is **server-driven OAuth with PKCE**. The browser never handles tokens. It only follows redirects and carries cookies.

```mermaid
sequenceDiagram
    autonumber
    participant U as Browser
    participant L as /api/auth/login
    participant P as Google / GitHub
    participant C as /api/auth/callback
    participant I as InsForge Auth
    participant X as proxy.ts

    U->>L: GET ?provider=google&redirectTo=/dashboard
    L->>I: signInWithOAuth (skipBrowserRedirect)
    I-->>L: provider URL + codeVerifier
    L-->>U: 302 to provider · sets httpOnly code_verifier + redirect_to cookies (10 min)
    U->>P: consent
    P-->>U: 302 to /api/auth/callback?insforge_code=…
    U->>C: GET callback
    C->>I: exchangeOAuthCode(code, verifier) in server mode
    I-->>C: accessToken + refreshToken
    C-->>U: 302 to redirectTo · setAuthCookies()
    U->>X: every later request
    X->>I: updateSession() refreshes tokens when needed
    X-->>U: protected route without session → /login?redirectTo=…
```

- **Protected routes:** `/dashboard`, `/find-jobs`, `/find-jobs/[id]` and `/profile` are gated in `proxy.ts`. This is Next 16's replacement for `middleware.ts`. A signed-in visitor to `/login` is sent to `/dashboard`.
- **Readable errors only:** failed logins come back to `/login?error=…`. The page shows a plain sentence. The raw code only goes to the server console and PostHog (`oauth_login_failed`).
- **Refresh endpoint:** `/api/auth/refresh` is the SDK's refresh router, and `/api/auth/logout` clears the session.

<br />

## The agent pipelines

### 1. Job discovery: `POST /api/agent/find`

```mermaid
sequenceDiagram
    autonumber
    participant U as Find Jobs page
    participant R as /api/agent/find
    participant DB as InsForge DB
    participant Az as Adzuna
    participant G as Groq

    U->>R: { jobTitle, location }
    R->>DB: load profile (the scoring baseline)
    R->>DB: insert agent_runs (status: running)
    R->>R: detectCountry(location) → us | gb | ca | au
    R->>Az: search (category=it-jobs, 10 results)
    Az-->>R: listings
    R->>DB: which source_urls does this user already have?
    R->>R: drop duplicates before spending any LLM calls
    par every new job, Promise.allSettled
        R->>G: scoreJob(job, profile), strict JSON schema
        G-->>R: score · reason · matched[] · missing[]
    end
    R->>DB: insert all scored jobs, not only strong ones
    R->>DB: agent_runs → completed, jobs_found
    R->>DB: agent_logs entries along the way
    R-->>U: "Found N jobs and saved M strong matches."
```

- **Why keep every score:** low matches are still saved. That's how the **Low Match** filter works later, and it lets you decide for yourself.
- **Strong match:** a score of `MATCH_THRESHOLD` = **70** or more (`lib/utils.ts`), the single source of truth.
- **One failure doesn't sink the run:** `Promise.allSettled` means a single failed scoring call doesn't lose the rest of the batch.

### 2. Company research: `POST /api/agent/research`

```mermaid
sequenceDiagram
    autonumber
    participant U as Job details page
    participant R as /api/agent/research
    participant URL as agent/company-url.ts
    participant BB as Browserbase session
    participant SH as Stagehand (Gemini)
    participant G as Groq
    participant DB as InsForge DB

    U->>R: { jobId }
    R->>DB: load job + profile
    R->>URL: resolve homepage (follow redirect, strip subdomain,<br/>else fall back to www.‹company›.com)
    R->>BB: open ONE session (120 s limit)
    BB->>SH: goto homepage → extract(overview, tech, links)
    R->>URL: classify links by URL, pick up to 3<br/>(about · careers · engineering · blog)
    loop each sub-page
        BB->>SH: goto → extract()
    end
    R->>BB: close session (always, in finally)
    R->>G: synthesise dossier (browser already closed)
    G-->>R: 9-field dossier
    R->>DB: jobs.company_research + company_researched_at
    R-->>U: dossier + browsed flag → success or "partial" banner
```

**The dossier** (`jobs.company_research`, strict JSON schema):

| Field | What it contains |
|---|---|
| `companyOverview` | What the company does, from its own pages |
| `techStack` | Technologies mentioned on the site or in the posting |
| `culture` | Values and working-style signals |
| `whyThisRole` | Why the role probably exists right now |
| `yourEdge` | Where *your* skills and past work line up with this company |
| `gapsToAddress` | Your missing skills, reframed as a strategy |
| `smartQuestions` | Questions that show you did your homework |
| `interviewPrep` | Talking points drawn from the research |
| `sources` | The pages that were actually opened, not the model's claims |

**Design choices worth knowing:**

- **Two models, on purpose.** Stagehand sends about 9k tokens per page, which exceeds Groq's free-tier limit of 8k tokens per minute. So Gemini drives the browser, and Groq handles every payload the app controls.
- **The session never stays open during a slow model call.** Browsing and synthesis are separate steps, so a costly cloud browser isn't held open while the LLM thinks.
- **Research always returns a dossier.** Every Stagehand call is wrapped in `try/catch`. If the site can't be read, the dossier is written from the posting and your profile instead, and the UI shows an amber **partial** state rather than claiming success.
- **Links are classified by URL, not by the model.** Asked for a URL, the model returns internal element IDs, so sub-page URLs come from `page.snapshot().urlMap`.

<br />

## Resume pipeline

```mermaid
flowchart LR
    A[Upload a PDF] --> B["saveResume()<br/>Server Action"] --> C[("resumes/‹user›/resume.pdf")]
    C --> D["/api/resume/extract<br/>pdf-parse → text"] --> E[Groq → strict<br/>profile schema] --> F[Suggestion bubbles:<br/>accept or dismiss each field]

    H[(profiles row)] --> I["/api/resume/generate<br/>Groq → summary + role bullets"] --> J["@react-pdf/renderer<br/>ResumeDocument"] --> K[("resumes/‹user›/generated-resume.pdf")]

    classDef store fill:#10b981,stroke:#007a55,color:#fff
    classDef ai fill:#61a8ff,stroke:#155dfc,color:#fff
    classDef step fill:#ffffff,stroke:#e7eaf3,color:#101828
    class C,H,K store
    class E,I ai
    class A,B,D,F,J step
```

- **Nothing is overwritten silently:** extraction never writes over your profile. Each extracted value shows up next to its field, and you choose whether to accept it.
- **Two separate files:** the generated resume is stored apart from your upload, so generating a new one never replaces your original.

<br />

## Dashboard data

The dashboard reads the database directly. PostHog is only used for event tracking, so the charts and the stat cards can never disagree.

| Widget | Source | Logic (`lib/dashboard.ts`) |
|---|---|---|
| Total jobs found | `jobs` | Count for the user, with week-over-week trend |
| Avg. match rate | `jobs.match_score` | Mean over scored jobs, with week-over-week trend |
| Companies researched | `jobs.company_researched_at` | Count of non-null |
| Jobs this week | `jobs.found_at` | Rolling 7-day window |
| Recent activity | `agent_runs` + researched `jobs` | Merged, newest first, top 5 |
| Jobs found over time | `jobs.found_at` | Per-day buckets, last 7 days (UTC) |
| Company research activity | `jobs.company_researched_at` | Per-day buckets, last 7 days |
| Match score distribution | `jobs.match_score` | `<60 · 60–70 · 70–80 · 80–90 · 90–100` |

The aggregation functions take the date (`now`) as a parameter instead of reading the clock, so they can be tested without any date mocking.

<br />

## Data model

Four tables and one storage bucket. **Every table has row-level security**, with owner-only select, insert, update and delete policies keyed on `auth.uid()`.

```mermaid
erDiagram
    AUTH_USERS ||--|| profiles : "id"
    AUTH_USERS ||--o{ agent_runs : "user_id"
    AUTH_USERS ||--o{ jobs : "user_id"
    agent_runs |o--o{ jobs : "run_id (set null)"
    agent_runs ||--o{ agent_logs : "run_id (cascade)"
    jobs |o--o{ agent_logs : "job_id (set null)"

    profiles {
        uuid id PK
        text full_name
        text current_title
        text experience_level
        text_array skills
        jsonb work_experience
        jsonb education
        text_array job_titles_seeking
        text remote_preference
        text resume_pdf_key
        text generated_resume_pdf_key
        boolean is_complete
    }
    agent_runs {
        uuid id PK
        uuid user_id FK
        text status "running | completed | failed"
        text job_title_searched
        text location_searched
        int jobs_found
    }
    jobs {
        uuid id PK
        uuid run_id FK
        uuid user_id FK
        text source "search | url"
        text source_url
        text title
        text company
        text_array responsibilities
        text_array requirements
        int match_score
        text match_reason
        text_array matched_skills
        text_array missing_skills
        jsonb company_research
        timestamptz company_researched_at
        timestamptz found_at
    }
    agent_logs {
        uuid id PK
        uuid run_id FK
        uuid job_id FK
        text message
        text level "info | success | warning | error"
    }
```

- **Storage:** a private `resumes` bucket, with objects at `{user_id}/resume.pdf` and `{user_id}/generated-resume.pdf`. Storage RLS limits each user to their own folder.
- **Migrations:** kept in [`migrations/`](migrations), timestamped and applied in order with the InsForge CLI.

<br />

## UI and design system

The UI is **token-driven**. Every color, radius, and surface comes from CSS variables in `app/globals.css`, mapped to Tailwind utilities in `tailwind.config.js`. Components never use hex values or Tailwind's built-in palette (`bg-purple-500`).

### Color tokens

| | Token | Value | Used for |
|---|---|---|---|
| ![](https://img.shields.io/badge/-%20%20%20-7c5cfc?style=flat-square) | `accent` | `#7c5cfc` | Primary actions, active nav, focus rings, brand |
| ![](https://img.shields.io/badge/-%20%20%20-101828?style=flat-square) | `text-primary` | `#101828` | Headings, body text, dark buttons |
| ![](https://img.shields.io/badge/-%20%20%20-6a7282?style=flat-square) | `text-secondary` | `#6a7282` | Labels, supporting copy |
| ![](https://img.shields.io/badge/-%20%20%20-f6f7fb?style=flat-square) | `background` | `#f6f7fb` | Page background |
| ![](https://img.shields.io/badge/-%20%20%20-e7eaf3?style=flat-square) | `border` | `#e7eaf3` | Every border and divider |
| ![](https://img.shields.io/badge/-%20%20%20-10b981?style=flat-square) | `success` | `#10b981` | Match ≥ 80, matched skills |
| ![](https://img.shields.io/badge/-%20%20%20-61a8ff?style=flat-square) | `info` | `#61a8ff` | Match 60–79, research activity |
| ![](https://img.shields.io/badge/-%20%20%20-ff8904?style=flat-square) | `warning` | `#ff8904` | Match < 60, partial research |
| ![](https://img.shields.io/badge/-%20%20%20-ef4444?style=flat-square) | `error` | `#ef4444` | Errors, missing profile fields |
| ![](https://img.shields.io/badge/-%20%20%20-111827?style=flat-square) | `overlay` | `#111827` | Dark showcase panels (login, homepage CTA) |

### Visual language

| Element | Rule |
|---|---|
| Font | Inter via `next/font/google` |
| Cards | White, `1px` `border`, `16px` radius, soft two-layer shadow. Color goes *inside* cards, never on them |
| Buttons | `8px` radius (`rounded-md`). Primary is dark `text-primary` in light areas and `accent` on dark panels. Secondary is white with a border |
| Badges | Pill shaped, `12px`, weight 500, a light tint behind a darker text color |
| Match score | 6px bar in three bands, driven by `matchScoreBarClass()` in one place |
| Layout | Top navbar only, 1440px max width, no sidebar |
| Dark panels | `overlay` background, a faint dot grid, blurred `accent` and `info` glows |
| Brand | `components/layout/Logo.tsx`: a transparent "A" mark plus a live text wordmark, so it stays sharp at any size and on any background |

### Screens and their components

| Screen | Route | Built from |
|---|---|---|
| Homepage | `/` | `Navbar`, `Hero` (pastel glow, trust row, framed screenshot with floating cards), `Features`, `Testimonial`, `BottomCTA` (dark panel), `Footer` |
| Sign in | `/login` | Split layout: OAuth form on the left, dark product preview on the right built from the real `MatchScoreBar` and activity-dot styles |
| Dashboard | `/dashboard` | `ProfileBanner`, `StatsBar`, `RecentActivity`, `ChartCard` wrapping three Recharts charts themed from `lib/chartTheme.ts` |
| Find Jobs | `/find-jobs` | `JobSearchControls`, `JobFilterBar`, `JobsTable`, `MatchScoreBar`, `JobsPagination` |
| Job details | `/find-jobs/[id]` | `JobInfo`, `MatchScore`, `JobDescription`, `ResearchButton`, `CompanyResearch`, `JobActions` |
| Profile | `/profile` | `CompletionIndicator`, `ResumeUpload`, `SuggestionBubble`, `ProfileForm` |

- **Navbar:** see-through with a blur. It centers three section links for visitors and switches to Dashboard / Find Jobs / Profile with icons once you're signed in. On phones it shows icons only.
- **Where the rules live:** exact class recipes for every component are in [`context/ui-registry.md`](context/ui-registry.md), and the token spec is in [`context/ui-tokens.md`](context/ui-tokens.md).

> **Tailwind caveat:** tokens are `var(--color-*)` hex strings in Tailwind 3, so opacity modifiers like `bg-accent/10` **compile to nothing**. Use a dedicated light token (`bg-error-light`), a solid color plus `opacity-*`, or `bg-[color:color-mix(...)]`.

<br />

## Tech stack

| Layer | Tool | Role in Applyr |
|---|---|---|
| Framework | **Next.js 16.2** (App Router) · **React 19.2** | Pages, API routes, Server Actions, `proxy.ts` |
| Language | **TypeScript** (strict) | Throughout |
| Styling | **Tailwind CSS 3.4** + CSS-variable tokens | Token-only design system |
| Backend | **InsForge** (`@insforge/sdk`) | Auth (OAuth + PKCE), Postgres + RLS, Storage |
| Job data | **Adzuna API** | Live listings, `category=it-jobs` |
| LLM | **Groq**, `openai/gpt-oss-20b` via the `openai` SDK | Scoring, resume extraction and generation, dossier synthesis. Every call uses a strict `json_schema` |
| Cloud browser | **Browserbase** | One research session per run |
| Browser automation | **Stagehand v4** + **Gemini 3.6 Flash** | Navigating pages and structured extraction |
| Validation | **Zod 4** | Stagehand extraction schemas |
| PDF | **pdf-parse** · **@react-pdf/renderer** | Reading uploaded resumes, rendering generated ones |
| Charts | **Recharts 3.10** | The three dashboard charts |
| Icons | **lucide-react** | All icons |
| Analytics | **PostHog** (`posthog-js`, `posthog-node`) | Product events, proxied through `/ingest` |

<br />

## Project structure

```
applyr/
├── app/
│   ├── layout.tsx                  Root layout: Inter font, PostHog provider, smooth scroll
│   ├── page.tsx                    Homepage
│   ├── (auth)/login/page.tsx       Sign-in page
│   ├── dashboard/page.tsx          Parallel queries → stats, activity, charts
│   ├── find-jobs/page.tsx          Search + filtered, sorted, paginated jobs
│   ├── find-jobs/[id]/page.tsx     Job details + company research
│   ├── profile/page.tsx            Profile form + resume tools
│   └── api/
│       ├── auth/{login,callback,refresh,logout}/   OAuth + session endpoints
│       ├── agent/find/route.ts                   Discovery + scoring run
│       ├── agent/research/route.ts               Company research run
│       └── resume/{extract,generate,generated}/  Resume AI + file URLs
├── agent/                          Agent logic, no React imports
│   ├── adzuna.ts                   Search, country detection, salary formatting
│   ├── matcher.ts                  scoreJob(): strict-schema LLM scoring
│   ├── company-url.ts              Homepage resolution + sub-page selection (no browser)
│   ├── research.ts                 browseCompany() + synthesiseDossier()
│   └── types.ts
├── actions/profile.ts              saveProfile(), saveResume()
├── components/
│   ├── layout/                     Navbar, Footer, Logo
│   ├── homepage/                   Hero, Features, Testimonial, BottomCTA
│   ├── dashboard/  find-jobs/  job-details/  profile/
│   └── providers/PostHogProvider.tsx
├── lib/
│   ├── insforge-client.ts / insforge-server.ts   Browser vs. server clients
│   ├── ai.ts                       Groq client, model, JSON-schema helpers
│   ├── stagehand.ts                Browserbase + Gemini session factory
│   ├── jobs.ts  dashboard.ts  profile.ts        Pure data shaping
│   ├── navigation.ts               Nav link lists shared by Navbar + Footer
│   ├── chartTheme.ts  agent-logs.ts  utils.ts
│   └── pdf/ResumeDocument.tsx      React-PDF resume template
├── migrations/                     Timestamped SQL, applied with the InsForge CLI
├── proxy.ts                        Session refresh + protected-route guard
├── insforge.toml                   Auth redirect URLs and backend config
├── docs/screenshots/               Images used in this README
├── context/                        Architecture, design tokens, build plan, progress
└── bugs.md                         Verified open bugs, by severity
```

<br />

## Getting started

### Prerequisites

- Node.js 20+
- An [InsForge](https://insforge.dev) project
- API keys for [Adzuna](https://developer.adzuna.com/), [Groq](https://console.groq.com/), [Browserbase](https://www.browserbase.com/) and [Google AI Studio](https://aistudio.google.com/) (Gemini). [PostHog](https://posthog.com/) is optional.

> ⚠️ **Fresh clones currently fail to build.** `.gitignore` excludes `public/images/`, but the homepage imports three images from that folder. Until that's fixed ([bugs.md #1a](bugs.md)), add placeholder `jobs-lists.png`, `agnet-log.png` and `user-icon.png` files to `public/images/`.

### 1. Install

```bash
git clone <this-repo>
cd applyr
npm install
```

### 2. Environment

Create `.env.local`. These are all the variables the code reads:

```bash
# InsForge: auth, database, storage
NEXT_PUBLIC_INSFORGE_URL=
NEXT_PUBLIC_INSFORGE_ANON_KEY=

# Job discovery
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

# LLM: scoring, resume extraction and generation, dossier synthesis
GROQ_API_KEY=

# Company research: cloud browser + the model that drives it
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
GOOGLE_API_KEY=

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

Research degrades gracefully: without `GOOGLE_API_KEY`, `canBrowse()` returns false and dossiers are written from the posting and your profile alone.

### 3. Backend

```bash
npx -y @insforge/cli login
npx -y @insforge/cli link                      # choose your InsForge project
npx -y @insforge/cli db migrations up --all    # tables, RLS, storage policies
npx -y @insforge/cli storage create-bucket resumes --private
npx -y @insforge/cli config apply              # pushes insforge.toml (OAuth redirect URLs)
```

Then enable the **Google** and **GitHub** OAuth providers in your InsForge project's auth settings. `insforge.toml` already allows `http://localhost:3000/api/auth/callback`; add your production callback URL there before deploying.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run lint       # ESLint (includes React Compiler rules)
npx tsc --noEmit   # type-check
npm run build      # production build
```

Sign in, fill out your profile (or upload a resume and accept the extracted suggestions), then go to **Find Jobs**.

<br />

## Engineering rules

These are enforced across the codebase, and [`AGENTS.md`](AGENTS.md) makes them binding for AI coding agents working on the repo.

- **API routes hold no UI logic. Components hold no database logic.**
- **`agent/` never imports from `components/` or `actions/`.** Agent code can run and be tested on its own.
- **Server Actions never call agent functions.** Only API routes do.
- **Every Stagehand call is wrapped in `try/catch`,** and the session is always closed in `finally`.
- **Every query is scoped to the current `user_id`,** with RLS as a second layer of protection.
- **Adzuna is always searched with `category=it-jobs`.**
- **The match threshold comes from one place:** `MATCH_THRESHOLD` in `lib/utils.ts`.
- **Every LLM response is constrained** by a strict `json_schema`, not just requested as JSON.
- **Users never see raw error messages.** Details go to logs and PostHog.
- **Easy Apply is never used.** Only the company's own apply URL.
- **Components use design tokens only.** No hex values and no raw Tailwind colors.

<br />

## Analytics events

| Event | Fired from | When |
|---|---|---|
| `hero_cta_clicked` · `bottom_cta_clicked` · `navbar_get_started_clicked` | Client | Homepage calls to action |
| `login_provider_selected` | Client | A Google or GitHub button is clicked |
| `oauth_login_completed` · `oauth_login_failed` | Server | OAuth callback outcome |
| `job_search_started` · `job_found` | Server | Discovery run |
| `company_researched` | Server | Dossier saved |
| `user_signed_out` | Client | Sign out |

The browser client sends events through Next rewrites at `/ingest/*`, which keeps ad blockers from dropping them.

<br />

## Scope

**Built:** OAuth sign-in · profile with resume extraction and generation · Adzuna discovery with AI scoring · filter, sort and pagination · job details · company research agent · dashboard with stats, activity and charts · PostHog events · responsive public pages.

**Deliberately out of scope:** auto-applying or form filling · cover letters · per-job resume tailoring · scheduled or background runs · notifications · multiple resume versions · team accounts · payments · browser extension · mobile app.

<br />

## Project docs

The [`context/`](context) folder is the project's working spec:

| File | Contents |
|---|---|
| [`project-overview.md`](context/project-overview.md) | Product scope, user flows, success criteria |
| [`architecture.md`](context/architecture.md) | Stack, boundaries, data flow, schema, invariants |
| [`ui-tokens.md`](context/ui-tokens.md) · [`ui-rules.md`](context/ui-rules.md) | Design tokens and visual rules |
| [`ui-registry.md`](context/ui-registry.md) | Exact class recipes for every shipped component |
| [`code-standards.md`](context/code-standards.md) · [`library-docs.md`](context/library-docs.md) | Coding conventions and library gotchas |
| [`build-plan.md`](context/build-plan.md) · [`progress-tracker.md`](context/progress-tracker.md) | The 17-feature build plan and its status |

<br />

<div align="center">

Jobs data by <a href="https://www.adzuna.com">Adzuna</a> · Backend by <a href="https://insforge.dev">InsForge</a> · Research browsing by <a href="https://www.browserbase.com">Browserbase</a>

</div>
