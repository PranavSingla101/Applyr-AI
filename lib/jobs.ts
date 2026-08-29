export type Job = {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salaryEstimate: string;
  dateFound: string;
};

export type MatchFilter = "all" | "high" | "low";

export type JobSort = "match_score" | "newest" | "oldest";

export const MATCH_FILTER_OPTIONS: { value: MatchFilter; label: string }[] = [
  { value: "all", label: "All Matches" },
  { value: "high", label: "High Match" },
  { value: "low", label: "Low Match" },
];

export const JOB_SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "match_score", label: "Match Score" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

/**
 * Bands come from `ui-rules.md`, the one internally consistent spec: its hex
 * values map exactly onto the success/info/warning tokens. They intentionally
 * differ from the delivered mock, which renders 88% and 85% blue.
 */
export function matchScoreBarClass(score: number): string {
  if (score >= 80) {
    return "bg-success";
  }
  if (score >= 60) {
    return "bg-info";
  }
  return "bg-warning";
}

/** A `jobs` row as read from InsForge for the jobs table. */
export type JobRow = {
  id: string;
  company: string | null;
  title: string | null;
  match_score: number | null;
  salary: string | null;
  found_at: string | null;
};

/** Renders a timestamp as the design's relative "2 hours ago" / "Yesterday" text. */
export function formatDateFound(foundAt: string | null, now: Date = new Date()): string {
  if (!foundAt) {
    return "Unknown";
  }
  const then = new Date(foundAt);
  if (Number.isNaN(then.getTime())) {
    return "Unknown";
  }

  const minutes = Math.floor((now.getTime() - then.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? "" : "s"} ago`;
}

/** Maps a DB row to the display shape the jobs table renders. */
export function toJob(row: JobRow, now?: Date): Job {
  return {
    id: row.id,
    company: row.company ?? "Unknown",
    role: row.title ?? "Untitled role",
    matchScore: row.match_score ?? 0,
    salaryEstimate: row.salary ?? "Not listed",
    dateFound: formatDateFound(row.found_at, now),
  };
}

/** Rows rendered per page of the jobs table. */
export const JOBS_PER_PAGE = 20;

/** The filter, sort and pagination state the jobs table is rendered from. */
export type JobsQuery = {
  search: string;
  matchFilter: MatchFilter;
  sort: JobSort;
  page: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Reads the jobs table state out of the URL, falling back to the defaults. */
export function parseJobsQuery(params: RawSearchParams): JobsQuery {
  const matchValue = firstValue(params.match);
  const sortValue = firstValue(params.sort);
  const pageValue = Number.parseInt(firstValue(params.page), 10);

  return {
    search: firstValue(params.q).trim(),
    matchFilter: MATCH_FILTER_OPTIONS.some((option) => option.value === matchValue)
      ? (matchValue as MatchFilter)
      : "all",
    sort: JOB_SORT_OPTIONS.some((option) => option.value === sortValue)
      ? (sortValue as JobSort)
      : "match_score",
    page: Number.isFinite(pageValue) && pageValue > 1 ? pageValue : 1,
  };
}

/**
 * Serialises a jobs query back into a query string, omitting defaults so the
 * unfiltered table sits on a clean `/find-jobs` URL.
 */
export function jobsQueryToSearchParams(query: JobsQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.matchFilter !== "all") params.set("match", query.matchFilter);
  if (query.sort !== "match_score") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  return params.toString();
}

/**
 * Badge colour for the match score pill on the job details header. Uses the
 * same bands as `matchScoreBarClass()` so a job never reads green in one place
 * and blue in another.
 */
export function matchScoreBadgeClass(score: number): string {
  if (score >= 80) {
    return "bg-success-lightest text-success-foreground";
  }
  if (score >= 60) {
    return "bg-info-lightest text-info-foreground";
  }
  return "bg-warning/10 text-warning";
}

/** The dossier shape written to `jobs.company_research` by the research agent. */
export type CompanyResearch = {
  companyOverview?: string;
  techStack?: string[];
  culture?: string[];
  whyThisRole?: string;
  yourEdge?: string[];
  gapsToAddress?: string[];
  smartQuestions?: string[];
  interviewPrep?: string[];
  sources?: string[];
};

/** A `jobs` row as read from InsForge for the job details page. */
export type JobDetailRow = {
  id: string;
  company: string | null;
  title: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  source_url: string | null;
  external_apply_url: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: CompanyResearch | null;
  found_at: string | null;
};

/** The display shape the job details page renders. */
export type JobDetail = {
  id: string;
  company: string;
  role: string;
  location: string;
  salaryEstimate: string;
  jobType: string;
  description: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
  applyUrl: string | null;
  research: CompanyResearch | null;
  dateFound: string;
};

/** The design renders an em dash wherever Adzuna gave us nothing. */
export const EMPTY_FIELD = "—";

const JOB_TYPE_LABELS: Record<string, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contract: "Contract",
};

/** Adzuna's `contract_type` values are lowercase slugs — title-case them. */
export function formatJobType(jobType: string | null): string {
  if (!jobType) {
    return EMPTY_FIELD;
  }
  return JOB_TYPE_LABELS[jobType.toLowerCase()] ?? jobType;
}

function toDisplayArray(value: string[] | null): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim().length > 0);
}

/** Maps a DB row to the display shape the job details page renders. */
export function toJobDetail(row: JobDetailRow, now?: Date): JobDetail {
  return {
    id: row.id,
    company: row.company ?? "Unknown",
    role: row.title ?? "Untitled role",
    location: row.location ?? EMPTY_FIELD,
    salaryEstimate: row.salary ?? EMPTY_FIELD,
    jobType: formatJobType(row.job_type),
    description: row.about_role ?? "",
    matchScore: row.match_score ?? 0,
    matchReason: row.match_reason ?? "",
    matchedSkills: toDisplayArray(row.matched_skills),
    missingSkills: toDisplayArray(row.missing_skills),
    applyUrl: row.external_apply_url ?? row.source_url ?? null,
    research: row.company_research ?? null,
    dateFound: formatDateFound(row.found_at, now),
  };
}
