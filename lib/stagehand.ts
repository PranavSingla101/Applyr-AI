import { browserbase, Stagehand } from "@browserbasehq/stagehand";

/**
 * Two minutes is enough for a homepage plus three sub-pages, and the free plan
 * allows one session at a time — so a session left running blocks the next one.
 */
const SESSION_TIMEOUT_SECONDS = 120;

/**
 * Gemini drives the browser, not the Groq model the rest of the app uses.
 * Stagehand sends a whole page tree per extraction (~9k tokens for one
 * homepage), and this Groq account's free tier caps at 8k tokens *per minute*
 * across every call — so page extraction returned `413 Request too large` on the
 * first real site. Gemini is one of Stagehand's five built-in providers, so it
 * needs no bring-your-own-LLM callback at all.
 *
 * `gpt-oss-20b` via `groqGenerate` remains correct for our own prompts, where we
 * control the payload size. Synthesis still runs on it.
 */
// `gemini-2.5-flash` is refused for keys created after its deprecation
// ("no longer available to new users"); the API names 3.6-flash as its successor.
const BROWSER_MODEL = "google/gemini-3.6-flash" as const;

/** True when browser research is configured — see `createResearchStagehand`. */
export function canBrowse(): boolean {
  return Boolean(process.env.GOOGLE_API_KEY);
}

/**
 * Opens one Browserbase session driven by Stagehand. The caller owns closing it
 * — always from a `finally`, never on the happy path only.
 *
 * Throws when `GOOGLE_API_KEY` is missing rather than silently falling back to a
 * model that cannot read a page: research still produces a dossier from the job
 * posting, and saying so beats a browser that always half-fails.
 */
export async function createResearchStagehand(): Promise<Stagehand> {
  if (!canBrowse()) {
    throw new Error("GOOGLE_API_KEY is not set — browser research is unavailable");
  }

  const browser = await browserbase.launch({
    apiKey: process.env.BROWSERBASE_API_KEY!,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    // Browserbase's own SDK names the session lifetime `api_timeout`, not
    // `timeout` — the latter is silently ignored and the session would run on
    // the project default.
    api_timeout: SESSION_TIMEOUT_SECONDS,
  });

  return Stagehand.create({
    browser,
    model: { modelName: BROWSER_MODEL, apiKey: process.env.GOOGLE_API_KEY! },
    logging: { level: "off" },
  });
}
