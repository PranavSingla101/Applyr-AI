import { z } from "zod";
import {
  AI_MAX_COMPLETION_TOKENS_RESEARCH,
  AI_MODEL,
  AI_STRING,
  AI_STRING_ARRAY,
  aiObject,
  createAIClient,
  jsonSchemaFormat,
} from "@/lib/ai";
import { canBrowse, createResearchStagehand } from "@/lib/stagehand";
import {
  fallbackHomepageUrl,
  homepageFromLandedUrl,
  redirectUrlFor,
  selectSubPages,
  toCompanyLinks,
} from "./company-url";
import type {
  CompanyLink,
  CompanyResearchDossier,
  CompanyResearchInput,
  HomepageExtract,
  ResearchJob,
  ScoringProfile,
  SubPageExtract,
} from "./types";

const homepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z
    .array(z.string())
    .describe("Funding, notable customers, scale, mission, recent news"),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z
    .array(z.string())
    .describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms"),
  notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards"),
});

const HOMEPAGE_INSTRUCTION =
  "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches).";

const SUB_PAGE_INSTRUCTION =
  "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.";

const SYNTHESIS_SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent
  funding, customers, headcount, or facts. If research was thin, infer carefully from
  the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this
  company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
  and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
  of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON.`;

const DOSSIER_SCHEMA = aiObject({
  companyOverview: AI_STRING,
  techStack: AI_STRING_ARRAY,
  culture: AI_STRING_ARRAY,
  whyThisRole: AI_STRING,
  yourEdge: AI_STRING_ARRAY,
  gapsToAddress: AI_STRING_ARRAY,
  smartQuestions: AI_STRING_ARRAY,
  interviewPrep: AI_STRING_ARRAY,
  sources: AI_STRING_ARRAY,
});

/** A logging sink the caller provides — the agent never touches the DB itself. */
export type ResearchLogger = (
  message: string,
  level: "info" | "success" | "warning" | "error",
) => Promise<void>;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Visits the company's own website in one Browserbase session. Every browser
 * call is contained: a failure degrades the research rather than failing the
 * run, and the session is always closed.
 */
export async function browseCompany(
  target: { redirectUrl: string | null; fallbackUrl: string | null },
  log: ResearchLogger,
): Promise<CompanyResearchInput> {
  const result: CompanyResearchInput = { homepage: null, subPages: [], sources: [] };
  let stagehand: Awaited<ReturnType<typeof createResearchStagehand>> | null = null;

  try {
    stagehand = await createResearchStagehand();
    const page = await stagehand.browser.context.activePage();

    if (!page) {
      await log("The browser opened without a page — using the job posting only.", "warning");
      return result;
    }

    // Follow the aggregator's tracking hop from inside the browser — a
    // server-side fetch gets a 403 from Adzuna regardless of headers.
    let homepageUrl: string | null = null;
    if (target.redirectUrl) {
      try {
        await page.goto(target.redirectUrl);
        homepageUrl = homepageFromLandedUrl(await page.url());
      } catch (err) {
        console.error("[agent/research] redirect resolution failed:", err);
      }
    }

    if (!homepageUrl) {
      homepageUrl = target.fallbackUrl;
    }

    if (!homepageUrl) {
      await log("Could not work out the company's website — using the job posting only.", "warning");
      return result;
    }

    let homepage: HomepageExtract;
    try {
      await page.goto(homepageUrl);
      const extracted = await stagehand.extract(HOMEPAGE_INSTRUCTION, homepageSchema);
      homepage = extracted.data;
      result.homepage = homepage;
      result.sources.push(homepageUrl);
    } catch (err) {
      console.error("[agent/research] homepage extraction failed:", err);
      await log(`Could not read ${homepageUrl}.`, "warning");
      return result;
    }

    // No name and no product means a parked domain or the wrong site entirely —
    // there is nothing worth spending three more page loads on.
    if (!homepage.oneLiner && !homepage.productSummary) {
      await log(`${homepageUrl} had no usable company content.`, "warning");
      result.homepage = null;
      result.sources = [];
      return result;
    }

    // Real hrefs come from the snapshot's urlMap — see `toCompanyLinks`.
    let links: CompanyLink[] = [];
    try {
      const snapshot = await page.snapshot();
      links = toCompanyLinks(Object.values(snapshot.urlMap), homepageUrl);
    } catch (err) {
      console.error("[agent/research] link extraction failed:", err);
    }

    const subPages = selectSubPages(links, homepageUrl);

    for (const url of subPages) {
      try {
        await page.goto(url);
        const extracted = await stagehand.extract(SUB_PAGE_INSTRUCTION, subPageSchema);
        const subPage: SubPageExtract = extracted.data;
        result.subPages.push(subPage);
        result.sources.push(url);
      } catch (err) {
        console.error(`[agent/research] sub-page extraction failed for ${url}:`, err);
        await log(`Skipped ${url} — could not read it.`, "warning");
      }
    }

    return result;
  } catch (err) {
    console.error("[agent/research] browser session failed:", err);
    await log("Browser research failed — building the dossier from the job posting.", "warning");
    return result;
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (err) {
        console.error("[agent/research] session close failed:", err);
      }
    }
  }
}

/**
 * Fuses the three data sources into the dossier. Runs after the browser closes
 * so no Browserbase session is held open across a slow model call.
 */
export async function synthesiseDossier(
  research: CompanyResearchInput,
  job: ResearchJob,
  profile: ScoringProfile,
): Promise<CompanyResearchDossier> {
  const openai = createAIClient();

  const userPrompt = `COMPANY RESEARCH (from their website):
${
    research.homepage
      ? JSON.stringify({ homepage: research.homepage, pages: research.subPages })
      : "None — the company website could not be read. Infer carefully from the job posting and say what is inferred."
  }

JOB POSTING:
Title: ${job.title ?? "Unknown"}
Company: ${job.company ?? "Unknown"}
Description: ${job.about_role ?? "Not provided"}
Matched skills (already computed): ${toStringArray(job.matched_skills).join(", ") || "none"}
Missing skills (already computed): ${toStringArray(job.missing_skills).join(", ") || "none"}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Unknown"}
Experience: ${profile.years_experience ?? "unknown"} years, level ${profile.experience_level ?? "unknown"}
Skills: ${toStringArray(profile.skills).join(", ") || "none listed"}
Work history: ${JSON.stringify(profile.work_experience ?? [])}`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    response_format: jsonSchemaFormat("company_dossier", DOSSIER_SCHEMA),
    temperature: 0.4,
    max_completion_tokens: AI_MAX_COMPLETION_TOKENS_RESEARCH,
    messages: [
      { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content ?? "{}") as Record<
    string,
    unknown
  >;

  return {
    companyOverview: toText(parsed.companyOverview),
    techStack: toStringArray(parsed.techStack),
    culture: toStringArray(parsed.culture),
    whyThisRole: toText(parsed.whyThisRole),
    yourEdge: toStringArray(parsed.yourEdge),
    gapsToAddress: toStringArray(parsed.gapsToAddress),
    smartQuestions: toStringArray(parsed.smartQuestions),
    interviewPrep: toStringArray(parsed.interviewPrep),
    // The model is asked for sources but the pages we actually opened are a
    // fact, not a generation — trust the crawl over the write-up.
    sources: research.sources.length > 0 ? research.sources : toStringArray(parsed.sources),
  };
}

/**
 * Full research run: resolve the homepage, browse it, synthesise the dossier.
 * Always returns a dossier — browser failure degrades to job + profile alone.
 */
export async function researchCompany(
  job: ResearchJob,
  profile: ScoringProfile,
  log: ResearchLogger,
): Promise<{ dossier: CompanyResearchDossier; browsed: boolean }> {
  let research: CompanyResearchInput = { homepage: null, subPages: [], sources: [] };

  if (!canBrowse()) {
    await log(
      "Browser research is not configured — building the briefing from the job posting and your profile.",
      "warning",
    );
  } else {
    await log(`Researching ${job.company ?? "the company"}.`, "info");
    research = await browseCompany(
      { redirectUrl: redirectUrlFor(job), fallbackUrl: fallbackHomepageUrl(job) },
      log,
    );
  }

  const dossier = await synthesiseDossier(research, job, profile);

  return { dossier, browsed: research.homepage !== null };
}
