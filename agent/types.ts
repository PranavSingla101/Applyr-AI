/**
 * Agent-specific types. Nothing here imports from components/ or actions/.
 */

/** Raw job result as returned by the Adzuna search API. */
export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not the full posting
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: "0" | "1";
  contract_type?: string;
  created: string;
  category?: { tag: string; label: string };
};

/** GPT-4o's assessment of one job against one profile. */
export type ScoredJob = {
  matchScore: number; // 0-100
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

/** The profile fields scoring actually needs — a narrow read of the profiles row. */
export type ScoringProfile = {
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: unknown;
  job_titles_seeking: string[] | null;
  preferred_locations: string[] | null;
  remote_preference: string | null;
};

/** What POST /api/agent/find returns to the client. */
export type FindJobsResult = {
  runId: string;
  found: number; // total jobs Adzuna returned
  saved: number; // newly written to the jobs table
  strongMatches: number; // saved jobs at or above MATCH_THRESHOLD
  duplicates: number; // already in the table for this user — skipped before scoring
  message: string;
};

export type AgentLogLevel = "info" | "success" | "warning" | "error";

/** What the homepage pass pulls off a company's own site. */
export type HomepageExtract = {
  oneLiner: string;
  productSummary: string;
  signals: string[];
};

/** An internal link found in the page's own HTML, classified by its href. */
export type CompanyLink = { url: string; kind: SubPageKind };

export type SubPageKind =
  | "about"
  | "careers"
  | "blog"
  | "engineering"
  | "product"
  | "team"
  | "other";

/** What each sub-page pass pulls. */
export type SubPageExtract = {
  keyPoints: string[];
  technologies: string[];
  valuesOrCulture: string[];
  notable: string[];
};

/** Everything the browser gathered, before synthesis turns it into a dossier. */
export type CompanyResearchInput = {
  homepage: HomepageExtract | null;
  subPages: SubPageExtract[];
  sources: string[];
};

/** The 9-field dossier written to `jobs.company_research`. */
export type CompanyResearchDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

/** The job fields research reads — a narrow read of the jobs row. */
export type ResearchJob = {
  id: string;
  run_id: string | null;
  title: string | null;
  company: string | null;
  about_role: string | null;
  source_url: string | null;
  external_apply_url: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
};

/** What POST /api/agent/research returns to the client. */
export type ResearchResult = {
  jobId: string;
  company: string;
  browsed: boolean; // false when the dossier came from job + profile alone
  sources: string[];
  message: string;
};
