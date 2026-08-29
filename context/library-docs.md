# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to Applyr.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Check AGENTS.md for an installed InsForge skill. If an InsForge MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client vs Server

Two separate instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context only
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

```typescript
// lib/insforge-server.ts — server context only
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

**Rules:**

- Browser client — Client Components, browser-side auth state, realtime subscriptions
- Server client — Server Components, API routes, Server Actions, agent functions
- Never use browser client in server context
- Never use server client in browser context

---

### Auth

```typescript
// Get current user in server context
const insforge = await createInsforgeServer();
const {
  data: { user },
  error,
} = await insforge.auth.getUser();
if (!user) redirect("/login");
```

---

### DB Queries

```typescript
// Read
const { data, error } = await insforge
  .from("jobs")
  .select("*")
  .eq("user_id", user.id)
  .order("found_at", { ascending: false });

// Insert
const { data, error } = await insforge
  .from("jobs")
  .insert({ user_id: user.id, title, company, match_score })
  .select()
  .single();

// Update
const { error } = await insforge
  .from("jobs")
  .update({ company_research: dossier })
  .eq("id", jobId)
  .eq("user_id", user.id); // always scope to user
```

**Rules:**

- Always scope queries to `user_id` — never query without user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row

---

### Storage

```typescript
// Upload file
const { data, error } = await insforge.storage
  .from("resumes")
  .upload(`${userId}/resume.pdf`, fileBuffer, {
    contentType: "application/pdf",
    upsert: true, // overwrites existing file
  });

// Get public URL
const { data } = insforge.storage
  .from("resumes")
  .getPublicUrl(`${userId}/resume.pdf`);

const url = data.publicUrl;
```

**Storage paths:**

- Base resume: `resumes/{user_id}/resume.pdf`

**Rules:**

- Always use `upsert: true` for base resume uploads — overwrites existing file
- Always save the public URL back to the DB after upload
- Never write files to disk — always upload buffer directly to storage

### Counting and aggregating

`{ count: "exact" }` works and is the cheap way to get a total — the count is
the number of matching rows, **unaffected by `.limit()` / `.range()`**, so one
query can carry both a page of rows and the true total. Add `head: true` when
only the number is wanted; the response then transfers no rows at all:

```typescript
const { count } = await insforge.database
  .from("jobs")
  .select("id", { count: "exact", head: true })
  .eq("user_id", user.id)
  .not("company_research", "is", null);
```

### Ordering on a nullable column

Postgres sorts `NULL` **first** on a `DESC` order, so a `.order(col, { ascending: false }).limit(n)`
on a nullable column returns the rows that have no value at all — verified live,
2026-08-29. Pass `nullsFirst: false`; the SDK forwards it to PostgREST's
`.nullslast` and it genuinely changes the result:

```typescript
.order("company_researched_at", { ascending: false, nullsFirst: false })
```

This bit the Recent Activity feed (Feature 16), where legacy rows with no
`company_researched_at` would otherwise have taken every slot in the top five.

**Aggregate functions are disabled on this project.** `select("match_score.avg()")`
returns `400 PGRST123: Use of aggregate functions is not allowed` — verified
live against the real backend, 2026-08-29. There is no `avg()`, `sum()` or
`group by` to push down, so a statistic like "average match score" must either
be computed in app code from a bounded column read, or moved into a Postgres
function called through `insforge.database.rpc()`. The dashboard stats take the
first route (`buildDashboardStats()` in `lib/dashboard.ts`): counts come from
`count: "exact"`, and averages are computed over a `select("match_score, found_at")`
capped at `JOB_STATS_ROW_LIMIT`. Revisit this if a user's job table ever gets
large enough for that read to matter — the counts stay exact regardless.

---

## Adzuna API

**Check first:** Check AGENTS.md for an installed Adzuna skill. If none exists — use this file and the official Adzuna API docs.

### Job Search

```typescript
// lib/adzuna.ts
export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs", // always filter to IT jobs
    results_per_page: "10",
    "content-type": "application/json",
  });

  // Only add where if location is provided
  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
```

### Response Shape

Each Adzuna job result contains:

```typescript
type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1"; // "1" means salary is estimated
  contract_type?: string;
  created: string; // ISO date string
  category: { tag: string; label: string };
};
```

### Saving Jobs to DB

```typescript
// Map Adzuna result to jobs table
const jobRecord = {
  user_id: userId,
  run_id: runId,
  source: "search", // always 'search' for Adzuna jobs
  source_url: job.redirect_url,
  external_apply_url: job.redirect_url,
  title: job.title,
  company: job.company.display_name,
  location: job.location.display_name,
  salary: job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
    : null,
  job_type: job.contract_type || "fulltime",
  about_role: job.description, // Adzuna returns snippet — used as description
  match_score: scoredJob.matchScore,
  match_reason: scoredJob.matchReason,
  matched_skills: scoredJob.matchedSkills,
  missing_skills: scoredJob.missingSkills,
  found_at: new Date().toISOString(),
};
```

**Rules:**

- Always include `category=it-jobs` — never search Adzuna without this filter
- Never pass `where` if location is empty — omit the parameter entirely
- `source` is always `'search'` for Adzuna jobs — never any other value
- `salary_is_predicted: "1"` means Adzuna estimated the salary — this is normal
- Adzuna description is a snippet — GPT-4o scores from it, not a full description
- Default country to `'us'` — support `gb`, `au`, `ca` as alternatives

---

## Browserbase

**Check first:** Check AGENTS.md for an installed Browserbase skill. If a Browserbase MCP server is configured — use it. The skill/MCP will have the latest session management and API patterns.

### Session Creation — Company Research

```typescript
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY! });

// Single session for company research — sequential page visits
const session = await bb.sessions.create({
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  timeout: 120, // 2 minute session — visits 3-4 pages max
});
```

**Important — Browserbase runs independently from your Next.js server:**
Browserbase sessions run on Browserbase's cloud infrastructure, not inside your Next.js API route. The API route triggers the Browserbase session and returns a response while the session continues running independently on Browserbase's platform. Do not add `maxDuration` or any timeout configuration to Next.js API routes to accommodate Browserbase session length.

**Rules:**

- Always use single sessions — never parallel sessions (free plan limit)
- Session timeout is 120 seconds — sufficient for 3-4 page visits
- Always end sessions cleanly — call stagehand.close() when done
- Project ID always from `process.env.BROWSERBASE_PROJECT_ID` — never hardcode
- Browserbase client lives in `lib/browserbase.ts` — always import from there

---

## Stagehand

**Version note:** this project is on **Stagehand v4** (`@browserbasehq/stagehand` 4.x). v4 rewrote the API — it drives the browser over CDP directly, so `act`/`extract`/`observe` live on the **Stagehand instance**, not on `page`. Any snippet using `new Stagehand({...})`, `stagehand.init()`, `stagehand.page`, `modelName`, or `modelClientOptions` is pre-v4 and wrong. When in doubt read `node_modules/@browserbasehq/stagehand/dist/index.d.mts` — it is the only source of truth.

### Initialisation

Always go through `lib/stagehand.ts` — never construct a session inline:

```typescript
import { browserbase, Stagehand } from "@browserbasehq/stagehand";

const browser = await browserbase.launch({
  apiKey: process.env.BROWSERBASE_API_KEY!,
  projectId: process.env.BROWSERBASE_PROJECT_ID!,
  api_timeout: 120, // seconds — NOT `timeout`, see below
});

const stagehand = await Stagehand.create({
  browser,
  model: { generate: groqGenerate }, // bring-your-own-LLM — see below
  logging: { level: "off" },
});

const page = await stagehand.browser.context.activePage();
await page.goto(url);
```

### Gemini drives the browser, Groq does everything else

**The browser layer runs on Gemini (`google/gemini-3.6-flash`), not Groq.** Stagehand sends a whole page tree per extraction — ~9k tokens for one homepage — and this Groq account's free tier caps at **8k tokens per minute across every call**, so page extraction failed with `413 Request too large` on the first real site. Gemini is one of Stagehand's five built-in providers, so it needs no callback: `model: { modelName, apiKey }`.

Model id matters: **`gemini-2.5-flash` is refused for newly created keys** ("no longer available to new users"); the API itself names `gemini-3.6-flash` as the replacement.

Everything we control the payload size of — matching, extraction, resume generation, research synthesis — stays on Groq via `lib/ai.ts`.

`GOOGLE_API_KEY` gates browser research. When it is absent, `canBrowse()` is false and research skips straight to synthesis with a clear log line, rather than opening a session that cannot read anything.

**Free-tier reality:** `gemini-3.6-flash` allows **20 requests/day** on the free tier, and one research run (homepage + 3 sub-pages) spends several — so roughly one or two runs per day before quota errors. Stagehand retries three times internally, then throws; `browseCompany()` catches per page, so a quota error degrades that page rather than the run.

### The bring-your-own-LLM callback (kept, currently unused by the browser)

Stagehand v4 has **no `baseURL` option**. Any provider outside the five built-ins goes through the callback — `groqGenerate` in `lib/ai.ts`, passed as `model: { generate }`. The callback owns the transport: it converts Stagehand's content blocks to chat messages, calls Groq, and returns

```typescript
{ role: "assistant", content: { type: "text", text }, outputFormat: "json_schema", structuredContent: JSON.parse(text) }
```

Its schemas are generated by Stagehand from our Zod shapes, so they are sent with **`strict: false`** — they need not satisfy Groq's strict-mode rules, and a rejected schema is a 400 for the whole page. Our own prompts keep `jsonSchemaFormat()`/`aiObject()` strict mode.

### Reading links off a page

**Never ask the model for a URL in an extract schema.** Stagehand answers with its own internal element ids (`"0-1819"`), which are keys into a snapshot map, not links — navigating to one sends the browser to a nonexistent path. Real hrefs come from the snapshot:

```typescript
const snapshot = await page.snapshot(); // { formattedTree, xpathMap, urlMap }
const urls = Object.values(snapshot.urlMap);
```

`Locator.innerHtml()` is not an alternative — on a freshly loaded page it throws `Stagehand extension world not ready`.

Classifying those URLs by keyword (`/about`, `/careers`, `/blog`…) is cheaper and steadier than a model call — see `agent/company-url.ts`.

### extract()

```typescript
import { z } from "zod";

const result = await stagehand.extract(
  "Extract the company overview, main product, and any technology mentions.",
  z.object({
    companyOverview: z.string(),
    mainProduct: z.string(),
    techMentions: z.array(z.string()),
  }),
);

result.data; // typed from the schema — the payload is under `.data`, not the result itself
```

### act()

```typescript
// Always wrap in try/catch — act() lives on the instance, not on page
try {
  await stagehand.act("Click the About link in the navigation");
} catch (error) {
  await logAgentError(jobId, null, error);
}
```

Navigation is not an `act()` — use `page.goto(url)`.

**Gotchas that cost real time:**

- **zod must be pinned to exactly the version Stagehand pins** (`4.4.3` today). Two copies of zod in the tree makes every schema a type error, because `z.ZodType` from one copy is not assignable to the other.
- **`@browserbasehq/stagehand` must be in `serverExternalPackages`** in `next.config.ts` — it resolves bundled browser-extension assets through a package-relative `import.meta.url` that Turbopack cannot follow, and the build fails with `Module not found: Can't resolve '../'`.
- **The session lifetime is `api_timeout`, not `timeout`**, in the current Browserbase SDK. The old name is accepted silently and ignored, leaving the session on the project default.
- The package is ESM-only (`exports` declares `import` alone), so CJS-based tooling cannot require it.

### Company Research Pattern

Three-step process: homepage extraction → sub-page extraction → synthesis with `AI_MODEL`.
Job description and user profile come from DB — never re-fetch what you already have.
Browser's only job is the company website.

```typescript
// Step 1 — Homepage extraction (v4 signature: instruction, schema)
const homepageData = await stagehand.extract(
  "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
  z.object({
    oneLiner: z.string().describe("What the company does in one sentence"),
    productSummary: z
      .string()
      .describe("What they build/sell and who it's for"),
    signals: z
      .array(z.string())
      .describe("Funding, notable customers, scale, mission, recent news"),
    pageLinks: z
      .array(
        z.object({
          url: z.string(),
          kind: z.enum([
            "about",
            "careers",
            "blog",
            "engineering",
            "product",
            "team",
            "other",
          ]),
        }),
      )
      .describe("Internal links worth visiting"),
  }),
);

// If oneLiner and productSummary are empty — wrong site or parked domain
// Skip to synthesis with job description and profile only
// The payload is under `.data` in v4
if (!homepageData.data.oneLiner && !homepageData.data.productSummary) {
  await stagehand.close();
  // proceed to synthesis with empty companyResearch
}

// Step 2 — Sub-page extraction (max 3, prefer about/blog/engineering/product over careers)
const subPageData = await stagehand.extract(
  "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
  z.object({
    keyPoints: z.array(z.string()),
    technologies: z
      .array(z.string())
      .describe("Specific languages, frameworks, tools, platforms"),
    valuesOrCulture: z
      .array(z.string())
      .describe("Stated values, working style, team norms"),
    notable: z
      .array(z.string())
      .describe("Customers, funding, scale, projects, awards"),
  }),
);

// Step 3 — synthesis with AI_MODEL via lib/ai.ts (after browser closes)
// Feed three data sources: company research + job from DB + profile from DB
const systemPrompt = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

const userPrompt = `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Matched skills (already computed): ${job.matched_skills.join(", ")}
Missing skills (already computed): ${job.missing_skills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.work_experience)}`;

const response = await openai.chat.completions.create({
  model: AI_MODEL,
  response_format: jsonSchemaFormat("company_dossier", DOSSIER_SCHEMA),
  temperature: 0.4,
  max_completion_tokens: AI_MAX_COMPLETION_TOKENS_RESEARCH,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
});
```

**Dossier fields:**

| Field           | Type     | Purpose                                             |
| --------------- | -------- | --------------------------------------------------- |
| companyOverview | string   | What the company does                               |
| techStack       | string[] | Technologies they use                               |
| culture         | string[] | Values and working style                            |
| whyThisRole     | string   | Why this role exists                                |
| yourEdge        | string[] | Specific links between THIS candidate and this role |
| gapsToAddress   | string[] | Missing skills reframed as strategy                 |
| smartQuestions  | string[] | Questions that show real research                   |
| interviewPrep   | string[] | Topics to prepare for this role                     |
| sources         | string[] | Pages the company info came from                    |

**Rules:**

- Always use `extract()` with a Zod schema — never parse raw HTML or use regex
- Always wrap every `act()` and `extract()` in try/catch
- Always call `await stagehand.close()` when done — ends the Browserbase session
- Model is always `AI_MODEL` from `lib/ai.ts` — never `gpt-4o`, which this account cannot reach
- Temperature is `0.4` for synthesis — grounded but flexible enough to make real connections
- Max 3 sub-pages — never exceed this on free plan
- Always close session in finally block — never leave sessions open even if research fails
- Job description and profile always come from DB — never re-fetch via browser
- If browser research returns empty — still run synthesis with job + profile only
- yourEdge, gapsToAddress, and smartQuestions are the most valuable fields — never skip them

## Groq (OpenAI-compatible)

All AI calls go to **Groq**, not OpenAI. The OpenAI account ran out of credits (every call returned `429 You have no credits remaining`), so the app was moved to Groq's OpenAI-compatible endpoint. The `openai` SDK is still the client — only the base URL, key and model change, so no second library.

**Never construct the client inline.** Use `lib/ai.ts`:

```typescript
import { AI_MODEL, aiObject, AI_STRING, AI_STRING_ARRAY, createAIClient, jsonSchemaFormat } from "@/lib/ai";

const SCHEMA = aiObject({
  matchScore: { type: "integer", minimum: 0, maximum: 100 },
  matchReason: AI_STRING,
  matchedSkills: AI_STRING_ARRAY,
});

const openai = createAIClient();
const response = await openai.chat.completions.create({
  model: AI_MODEL,
  response_format: jsonSchemaFormat("job_match", SCHEMA),
  temperature: 0.3,
  max_completion_tokens: AI_MAX_COMPLETION_TOKENS,
  messages: [
    { role: "system", content: "You score how well a candidate matches a job posting." },
    { role: "user", content: `Your prompt here` },
  ],
});

const result = JSON.parse(response.choices[0].message.content!);
```

**Model:** always `AI_MODEL` from `lib/ai.ts` (`openai/gpt-oss-20b`) — the cheapest text model this Groq account can reach that supports structured output. Never hardcode a model string, and never reintroduce `gpt-4o` or `gpt-5.4-nano`.

**Temperature settings:**

- `0.3` — matching, scoring, extraction, research synthesis — deterministic results
- `0.7` — resume generation — natural variation

**Max completion tokens** — `gpt-oss-20b` is a reasoning model, and its hidden reasoning tokens are billed against this budget alongside the visible JSON, so every figure is several times what the same prompt needed on GPT-4o:

- Job matching + scoring: `800` (`AI_MAX_COMPLETION_TOKENS`) — a 300 budget left only ~30 tokens of headroom
- Profile extraction from resume: `2000`
- Resume generation: `2500`

**Rules:**

- Always pass `max_completion_tokens`, never the legacy `max_tokens`
- **Always use `jsonSchemaFormat()`, not `response_format: { type: 'json_object' }`.** `json_object` only *asks* for JSON; the model can still emit malformed output, which Groq rejects with `400 json_validate_failed` — observed intermittently on the resume-generation prompt. A `json_schema` constrains decoding, so the shape is guaranteed. Strict mode requires every property to appear in `required` and `additionalProperties: false`, which is what `aiObject()` does for you.
- **Include `""` in every enum** in a schema, so the model can answer "not determinable" rather than being forced to guess a real value.
- **Never trust a numeric score's scale.** Models answer `0.75` on a 0-100 scale often enough that `clampScore()` in `agent/matcher.ts` normalises a fractional 0-1 value back to 0-100. State the scale in the prompt *and* normalise on the way in.
- Always parse `response.choices[0].message.content` as string — even with a schema it returns a string
- Always validate parsed JSON before using — wrap in try/catch
- Match threshold is always `MATCH_THRESHOLD` from `lib/utils.ts` — never hardcode 70
- Company research synthesis must always return a complete dossier — never return empty even if browser research failed

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

```typescript
// lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // manual pageview tracking
    });
  }
}

// Capture event client-side
posthog.capture("job_found", {
  userId,
  source: "search",
  matchScore: score,
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1, // send immediately
    flushInterval: 0, // no batching — Next.js functions are short-lived
  });

// Always use and shutdown in the same function
const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "company_researched",
  properties: { userId, jobId, company },
});
await posthog.shutdown(); // required — ensures event is sent
```

### PostHog is write-only in this project

**Nothing reads events back from PostHog.** The dashboard charts (Feature 17)
were specified as "PostHog Data", but all three plot columns that already exist
in the `jobs` table — `found_at`, `match_score`, and `company_researched_at` —
so they are built from InsForge instead. That decision buys three things:
the charts provably agree with the stat cards above them (which read InsForge),
there is no read credential to hold, and no PostHog outage or ad-blocker can
empty a chart.

Reading back would require the **Query API** — `POST /api/projects/{id}/query/`
with a personal `phx_` key, which is a different credential from the public
`phc_` ingest key and cannot be `NEXT_PUBLIC_`. `posthog-node` has no query
method at all. `POSTHOG_PERSONAL_API_KEY` and `POSTHOG_PROJECT_ID` (492786) are
present in `.env.local` but **unused** — they exist only so this can be
revisited without re-provisioning.

Capture is unaffected: all four events in `code-standards.md` still fire.

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

### Resume PDF Generation

```typescript
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, fontWeight: 'bold' },
  text: { fontSize: 10 },
})

const ResumePDF = ({ profile }: { profile: Profile }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>{profile.fullName}</Text>
        <Text style={styles.text}>{profile.email}</Text>
      </View>
    </Page>
  </Document>
)

// Generate buffer
const buffer = await renderToBuffer(<ResumePDF profile={profile} />)

// Upload directly to InsForge Storage
await insforge.storage
  .from('resumes')
  .upload(`${userId}/resume.pdf`, buffer, {
    contentType: 'application/pdf',
    upsert: true
  })
```

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `renderToStream` or `PDFDownloadLink`
- PDF generation only in `app/api/resume/` routes
- Generated buffer uploaded directly to InsForge Storage — never written to disk
- Always save public URL to DB after upload

---

## pdf-parse

**Check first:** Check AGENTS.md for an installed pdf-parse skill.

**Version note:** this project is on `pdf-parse` v2, which replaced the old `pdf(buffer)` default-export function with a `PDFParse` class (`getText()`, `getInfo()`, etc.). Do not use the v1 pattern.

### Extract Text from Uploaded Resume

```typescript
import { PDFParse } from "pdf-parse";

// In an API route — e.g. downloading the resume from storage server-side
const parser = new PDFParse({ data: buffer }); // buffer: Buffer | Uint8Array
const result = await parser.getText();
await parser.destroy();
const extractedText = result.text; // raw text content

// Send to GPT-5.4 nano for structured extraction
```

**Rules:**

- Server-side only — never import in client components
- `result.text` is raw unformatted text — GPT-5.4 nano handles the structure extraction
- Always call `parser.destroy()` after use
- Always handle parse errors — some PDFs are image-based and return empty text
- If `result.text` is empty or very short — return error to user: "Could not extract text from this PDF. Please try a different file."

---

## recharts

Installed: `recharts@3.10.1`. Used only by the three dashboard charts.

### Project rules

- **Every chart is a `"use client"` component.** `ResponsiveContainer` measures
  the DOM, so it renders nothing on the server. Wrap it in `ChartCard`
  (`components/dashboard/ChartCard.tsx`), which stays a server component — the
  same shell/island split `CompanyResearch` uses for `ResearchButton`.
- **Colours are `var(--color-*)` strings, never hex.** recharts sets SVG
  presentation attributes (`fill`, `stroke`, tick `fill`) rather than classes,
  and SVG attributes accept `var()`. This is how the "no hardcoded hex" rule
  is satisfied inside a chart.
- **All shared styling lives in `lib/chartTheme.ts`** — `CHART_TICK`,
  `CHART_GRID_COLOR`, `CHART_GRID_DASH`, `CHART_MARGIN`. Never re-declare tick
  or grid styling inside a chart component.
- The chart's height comes from its container (`ResponsiveContainer` is
  `width="100%" height="100%"`), so the parent must have a resolved height —
  `ChartCard` gives it `min-h-[280px] flex-1`.

### Canonical axis/grid setup (matches `dashboard.png`)

```tsx
<CartesianGrid vertical={false} strokeDasharray={CHART_GRID_DASH} stroke={CHART_GRID_COLOR} />
<XAxis dataKey="label" tickLine={false} axisLine={false} tick={CHART_TICK} tickMargin={12} />
<YAxis tickLine={false} axisLine={false} tick={CHART_TICK} width={40}
       domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
```

`domain` and `ticks` are always explicit — recharts' auto-ticks do not produce
the mock's 0/25/50/75/100 (or 0/3/6/9/12) scales.

### Bars and areas

```tsx
<Bar dataKey="value" fill="var(--color-info)" radius={[4, 4, 0, 0]} maxBarSize={56} />
```

```tsx
<defs>
  <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
  </linearGradient>
</defs>
<Area type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={3}
      fill={`url(#${GRADIENT_ID})`} dot={false} activeDot={false} />
```

- **`type="monotone"`, never `"natural"`.** `natural` was used while the chart
  was on mock data, because the mock's curve overshoots between points. Real
  data killed it: a week with one spike (9 jobs on Friday, 0 every other day —
  the live table exactly) makes the natural spline **undershoot below zero**,
  drawing negative job counts. `monotone` cannot overshoot, and on
  well-spread data the two are visually identical. Any chart plotting counts
  must use `monotone`.
- **Axes are computed, never hardcoded.** `niceAxis(max)` in `lib/chartTheme.ts`
  returns four intervals up to a round step, reproducing the design's
  `0/3/6/9/12` and `0/25/50/75/100` exactly while scaling to whatever the data
  actually holds. Hardcoded domains were mock-fitted and clip real data.
- `maxBarSize={56}` plus `barCategoryGap` is what controls bar width. Without
  `maxBarSize`, a narrow card with five categories renders hairline bars.
- **No `<Legend>`** anywhere — one series per chart, so the card title already
  names it.
- **`<Tooltip>` on every chart, always with custom `content`.** The design has
  none, but hover is how a reader gets an exact figure off a smoothed curve;
  this was added at the developer's request. **Never ship recharts' default
  content** — it renders the raw dataKey in its own inline styles ("count : 30"),
  which ignores every design token. Pass `ChartTooltip`
  (`components/dashboard/ChartTooltip.tsx`) through a render function so the
  props stay typed:

```tsx
<Tooltip
  cursor={CHART_BAR_CURSOR}          // or CHART_LINE_CURSOR on the area chart
  content={(props) => (
    <ChartTooltip
      active={props.active} label={props.label} payload={props.payload}
      unit={{ one: "job", many: "jobs" }} tone="success"
    />
  )}
/>
```

  `unit` takes both grammatical forms — a single `"jobs"` renders "1 jobs" on
  any day with one event. `tone` indexes `CHART_TONE_COLOR` in
  `lib/chartTheme.ts`, the same map the series fill reads, so the tooltip
  figure can never be a different colour from the bar it describes.
- The area chart also needs `activeDot` (accent fill, `--color-surface` ring) —
  with `dot={false}` there is otherwise nothing marking which point is being
  read.
