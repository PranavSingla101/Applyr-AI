<div align="center">

<img src="public/Applyr-AI-Logo.png" alt="Applyr AI" width="280" />

### Job hunting is hard. Your tools shouldn't be.

Applyr is an AI agent that finds jobs, scores them against your real skills, researches every company before you apply, and shows the whole thing on one dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![InsForge](https://img.shields.io/badge/Backend-InsForge-7c5cfc)](https://insforge.dev)

</div>

<br />

<img src="docs/screenshots/homepage.png" alt="Applyr homepage" width="100%" />

<br />

## What Applyr does

Job hunting means the same three chores on repeat: find postings, figure out which ones are actually worth your time, and dig up enough about each company to sound informed at interview. Applyr runs all three as background agent work instead of manual tabs-open research.

1. **You set up a profile once** — skills, experience, work history, resume.
2. **The agent finds jobs for you.** Give it a title and location; it pulls live listings and scores every single one against your profile, 0–100, with a plain-English reason.
3. **The agent researches the company** the moment you're interested in a role — real pages, real tech stack, real culture signals — and hands you a dossier instead of a blank tab.
4. **You apply with full context**, straight to the company's own application page.

Everything that happens along the way — jobs found, companies researched, match rates — lands on a dashboard that reads the same database the rest of the app writes to, so the numbers on screen are never staged.

<br />

## See it in action

<table>
<tr>
<td width="50%">

**Dashboard** — stats, recent activity, and analytics built on live data

<img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%" />

</td>
<td width="50%">

**Find Jobs** — every scored result, filterable and sortable

<img src="docs/screenshots/find-jobs.png" alt="Find Jobs" width="100%" />

</td>
</tr>
<tr>
<td width="50%">

**Job Details** — match reasoning plus a full company dossier

<img src="docs/screenshots/job-details.png" alt="Job details with company research" width="100%" />

</td>
<td width="50%">

**Profile** — the source of truth the agent scores every job against

<img src="docs/screenshots/profile.png" alt="Profile page" width="100%" />

</td>
</tr>
</table>

<details>
<summary><strong>Sign in</strong> — Google / GitHub OAuth via InsForge</summary>
<br />
<img src="docs/screenshots/login.png" alt="Login page" width="70%" />
</details>

<br />

## How it works

```mermaid
flowchart TD
    A([Sign in with Google or GitHub]) --> B[Build your profile<br/>skills, experience, resume]
    B --> C{Find Jobs}
    C --> D[Adzuna searches live listings<br/>for your title + location]
    D --> E[Groq LLM scores every job<br/>0-100 against your profile]
    E --> F[(Every result saved —<br/>not just the strong matches)]
    F --> G[You open a job you like]
    G --> H{Research Company}
    H --> I[Browserbase opens the company site<br/>Stagehand + Gemini read it]
    I --> J[Groq synthesizes a dossier —<br/>tech stack, culture, why this role,<br/>smart questions, interview prep]
    J --> K[You apply — straight to the<br/>company's own apply page]
    F --> L[Dashboard —<br/>stats, activity, charts]
    J --> L

    classDef start fill:#7c5cfc,stroke:#5e4cff,color:#fff
    classDef action fill:#ffffff,stroke:#e7eaf3,color:#101828
    classDef ai fill:#61a8ff,stroke:#155dfc,color:#fff
    classDef store fill:#10b981,stroke:#007a55,color:#fff
    classDef decision fill:#faf5ff,stroke:#7c5cfc,color:#101828

    class A start
    class B,G,K action
    class D,I ai
    class E,J ai
    class F store
    class C,H decision
    class L action
```

That's the entire product from the outside. The rest of this document is what's running underneath it.

<br />

## Architecture

Applyr is a single Next.js 16 (App Router) application. There's no separate backend service — **InsForge** provides auth, the Postgres database, file storage, and realtime as one hosted platform, and two external AI-driven pipelines (job discovery, company research) run as agent code inside the same app, called only from API routes.

```mermaid
flowchart LR
    subgraph Client["Browser"]
        UI[Next.js App Router<br/>Server + Client Components]
    end

    subgraph App["Applyr — Next.js 16"]
        Actions["Server Actions<br/>(actions/)"]
        Routes["API Routes<br/>(app/api/)"]
        Agents["Agent Layer<br/>(agent/)"]
    end

    subgraph Backend["InsForge"]
        Auth[(Auth)]
        DB[(Postgres DB)]
        Storage[(File Storage)]
    end

    subgraph External["External Services"]
        Adzuna[Adzuna API<br/>job listings]
        Groq[Groq — openai/gpt-oss-20b<br/>matching · extraction · synthesis]
        BB[Browserbase + Stagehand v4<br/>cloud browser]
        Gemini[Gemini 3.6 Flash<br/>drives the browser]
        PostHog[PostHog<br/>event analytics]
    end

    UI -->|mutations| Actions --> DB
    UI -->|trigger agent runs| Routes --> Agents
    Agents -->|search| Adzuna
    Agents -->|score / extract / synthesize| Groq
    Agents -->|research a company| BB --> Gemini
    Agents -->|writes and logs| DB
    UI -->|resume PDFs| Storage
    UI -.->|auth session| Auth
    UI -.->|capture events| PostHog

    classDef app fill:#7c5cfc,stroke:#5e4cff,color:#fff
    classDef backend fill:#61a8ff,stroke:#155dfc,color:#fff
    classDef external fill:#f9fafb,stroke:#e7eaf3,color:#101828
    class UI,Actions,Routes,Agents app
    class Auth,DB,Storage backend
    class Adzuna,Groq,BB,Gemini,PostHog external
```

### The rules this system never breaks

These are enforced invariants, not suggestions — they're what keeps agent code, UI code, and data writes from tangling into each other as the app grows:

- **API routes hold no UI logic. Components hold no DB logic.** Each layer does exactly one job.
- **`agent/` never imports from `components/` or `actions/`.** Agent logic has zero React dependency — it can run, or be tested, on its own.
- **Server Actions never call agent functions.** UI-triggered mutations (saving a profile) go through `actions/`; anything agent-driven (searching, researching) goes through an API route instead.
- **Every Stagehand browser action is wrapped in `try/catch`.** A failed page read gets logged and skipped — it never takes down the whole research run.
- **Company research always returns something.** Even when the browser can't reach the company's site, the LLM still synthesizes a dossier from the job posting alone, and the UI says so honestly (an amber "partial" state) rather than pretending the browser succeeded.

<br />

## Under the hood: the two agent pipelines

### Job discovery

```mermaid
sequenceDiagram
    participant U as User
    participant R as /api/agent/find
    participant Az as Adzuna API
    participant G as Groq (gpt-oss-20b)
    participant DB as InsForge DB

    U->>R: POST { jobTitle, location }
    R->>DB: create agent_runs (status: running)
    R->>Az: search jobs (category=it-jobs)
    Az-->>R: listings
    R->>R: drop duplicates already saved for this user
    par scored in parallel
        R->>G: score job vs. profile
        G-->>R: { score, reason, matched/missing skills }
    end
    R->>DB: insert every scored job (not just strong matches)
    R->>DB: update agent_runs (completed, jobs_found)
    R-->>U: { found, saved, strongMatches, duplicates }
```

Every scored job is persisted — the low matches too. That's what lets the Find Jobs page filter by "Low Match" later without having thrown the data away at scoring time.

### Company research

```mermaid
sequenceDiagram
    participant U as User
    participant R as /api/agent/research
    participant BB as Browserbase session
    participant SH as Stagehand v4 (Gemini)
    participant G as Groq (gpt-oss-20b)
    participant DB as InsForge DB

    U->>R: POST { jobId }
    R->>R: resolve company homepage<br/>(follow redirect, strip subdomain)
    R->>BB: open one browser session
    BB->>SH: goto homepage → extract()
    SH-->>BB: overview, tech signals
    BB->>SH: visit up to 3 sub-pages (about, careers, engineering…)
    SH-->>BB: culture, stack, team signals
    BB-->>R: close session
    R->>G: synthesize dossier from everything gathered
    G-->>R: overview, why-this-role, tech stack,<br/>your edge, gaps, smart questions, interview prep
    R->>DB: save to jobs.company_research + company_researched_at
    R-->>U: dossier (flags 'partial' if the browser step failed)
```

One browser session, visited sequentially, closed before the AI synthesis call ever runs — the expensive part (an open cloud browser) and the reasoning part never overlap.

<br />

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Full-stack React, server components by default |
| Language | **TypeScript**, strict mode | No `any`, no unchecked promises |
| Styling | **Tailwind CSS 3.4** + shadcn/ui | Design-token driven — no hardcoded colors anywhere |
| Auth · DB · Storage · Realtime | **InsForge** | One Postgres-backed platform instead of four separate services |
| Job discovery | **Adzuna API** | Live job listing search |
| AI reasoning | **Groq** — `openai/gpt-oss-20b` | Matching, resume extraction/generation, research synthesis |
| Cloud browser | **Browserbase** | Runs the company-research browser session |
| Browser control | **Stagehand v4** | Navigates and reads company pages, driven by Gemini |
| Browser-driving model | **Gemini 3.6 Flash** | Groq's free tier can't take Stagehand's ~9k-token page payloads |
| Charts | **Recharts 3.10** | The three dashboard charts, styled from one shared theme file |
| PDF generation | **@react-pdf/renderer** | Renders the AI-tailored resume |
| Analytics | **PostHog** | Event capture — the dashboard's numbers come from the DB, not this |

<br />

## Data model

Four tables, all scoped to `auth.uid()` with row-level security — a user only ever sees their own rows.

```mermaid
erDiagram
    profiles ||--o{ agent_runs : "runs searches"
    profiles ||--o{ jobs : "owns"
    agent_runs ||--o{ jobs : "produced"
    agent_runs ||--o{ agent_logs : "logs"
    jobs ||--o{ agent_logs : "references"

    profiles {
        uuid id PK
        text full_name
        array skills
        jsonb work_experience
        jsonb education
        text resume_pdf_url
        boolean is_complete
    }
    agent_runs {
        uuid id PK
        uuid user_id FK
        text status
        text job_title_searched
        int jobs_found
    }
    jobs {
        uuid id PK
        uuid run_id FK
        uuid user_id FK
        text title
        text company
        int match_score
        array matched_skills
        array missing_skills
        jsonb company_research
        timestamptz company_researched_at
    }
    agent_logs {
        uuid id PK
        uuid run_id FK
        text message
        text level
    }
```

<br />

## Project structure

```
applyr/
├── app/
│   ├── page.tsx                    → Homepage
│   ├── (auth)/login/               → OAuth sign-in
│   ├── dashboard/                  → Stats, activity, charts
│   ├── find-jobs/                  → Search + results + [id] detail page
│   ├── profile/                    → Profile form + resume management
│   └── api/
│       ├── agent/find/             → Triggers Adzuna discovery + scoring
│       ├── agent/research/         → Triggers company research
│       └── resume/                 → Extract from / generate to PDF
├── agent/                          → All agent logic — zero React imports
│   ├── adzuna.ts                   → Job search
│   ├── matcher.ts                  → LLM scoring against a profile
│   ├── research.ts                 → Company research orchestration
│   ├── company-url.ts              → Homepage resolution (no browser)
│   └── extractor.ts                → Job description structuring
├── actions/                        → Server Actions — UI mutations only
├── components/                     → UI only, no DB calls
│   ├── dashboard/  find-jobs/  job-details/  profile/  homepage/  layout/
├── lib/                            → Client init + shared utilities
│   ├── insforge-client.ts / insforge-server.ts
│   ├── stagehand.ts   ai.ts   adzuna.ts   dashboard.ts   chartTheme.ts
├── migrations/                     → SQL migrations, applied via InsForge CLI
└── context/                        → Architecture, design tokens, and build docs
```

<br />

## Getting started

### Prerequisites

- Node.js 20+
- An [InsForge](https://insforge.dev) project (Postgres + Auth + Storage)
- API keys for: [Adzuna](https://developer.adzuna.com/), [Groq](https://console.groq.com/), [Browserbase](https://www.browserbase.com/), [Google AI Studio](https://aistudio.google.com/) (Gemini), and optionally [PostHog](https://posthog.com/)

### Install

```bash
git clone <this-repo>
cd applyr
npm install
```

### Configure environment

Create `.env.local` with:

```bash
# InsForge — auth, database, storage
NEXT_PUBLIC_INSFORGE_URL=
NEXT_PUBLIC_INSFORGE_ANON_KEY=
INSFORGE_API_KEY=

# Job discovery
ADZUNA_APP_ID=
ADZUNA_APP_KEY=

# AI reasoning — matching, extraction, synthesis
GROQ_API_KEY=

# Company research — cloud browser + the model that drives it
BROWSERBASE_API_KEY=
BROWSERBASE_PROJECT_ID=
GOOGLE_API_KEY=

# Analytics (optional — event capture only, not required for the app to run)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

### Set up the database

Apply the migrations in `migrations/` to your InsForge project via the InsForge CLI, then create a private `resumes` storage bucket (this one step isn't in a migration — see `context/architecture.md`).

```bash
npx @insforge/cli db migrations up --all
```

### Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google or GitHub, and fill out a profile to get started.

<br />

## Known limitation

Company research works end-to-end — the browser session, Gemini extraction, and dossier synthesis are all verified live — but it currently can't reliably resolve a real company domain to visit: **Adzuna's tracking redirect blocks both server-side `fetch` and Browserbase's datacenter IPs**, so most runs fall back to guessing `https://www.{companyName}.com`, which is wrong for a lot of companies. The UI is honest about this — a run that couldn't browse the real site shows an amber "partial" banner instead of a false success. See `context/progress-tracker.md` for the options being weighed (residential proxies, in-browser search-engine resolution, or an AI-guessed-and-verified domain).

<br />

<div align="center">

Built with Next.js, InsForge, and a genuinely excessive amount of context engineering.

</div>
