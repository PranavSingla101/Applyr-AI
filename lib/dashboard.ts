// Every panel on the dashboard reads real InsForge data. The three charts
// (Feature 17) are derived from the `jobs` table rather than from PostHog:
// `found_at`, `match_score` and `company_researched_at` already carry
// everything the charts plot, so the numbers provably agree with the stat
// cards above them. PostHog capture is untouched — it is simply not the read
// path for these charts.

import { EMPTY_FIELD, formatDateFound } from "@/lib/jobs";

export type TrendDirection = "up" | "down" | "flat";

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  /** Trend badge text ("+12%"). Null when there is nothing to compare against. */
  trend: string | null;
  trendDirection: TrendDirection | null;
  caption: string;
};

export type ActivityTone = "accent" | "info" | "success";

export type ActivityEntry = {
  id: string;
  title: string;
  timestamp: string;
  tone: ActivityTone;
};

export type ChartPoint = {
  label: string;
  value: number;
};

/** The two columns of a `jobs` row the stat cards are derived from. */
export type JobStatsRow = {
  match_score: number | null;
  found_at: string | null;
};

export type DashboardStatsInput = {
  /**
   * Exact count of the user's jobs, straight from PostgREST's `count: "exact"`.
   * Kept separate from `rows` so "Total Jobs Found" stays correct even when the
   * row sample below is capped.
   */
  totalJobs: number;
  /** Exact count of the user's jobs whose `company_research` is not null. */
  companiesResearched: number;
  /**
   * The user's jobs, capped at `JOB_STATS_ROW_LIMIT`. Averages and the weekly
   * windows are computed here because this project's PostgREST rejects
   * aggregate functions (`PGRST123: Use of aggregate functions is not allowed`),
   * so there is no `avg()` to push down to the database.
   */
  rows: JobStatsRow[];
};

/**
 * Ceiling on the rows pulled for the average and week-over-week windows. Two
 * integer-ish columns per row, so a full sample is a few KB. Past this the
 * counts stay exact and only the derived stats read from a sample.
 */
export const JOB_STATS_ROW_LIMIT = 5000;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function averageScore(rows: JobStatsRow[]): number | null {
  const scores = rows
    .map((row) => row.match_score)
    .filter((score): score is number => typeof score === "number");

  if (scores.length === 0) {
    return null;
  }

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/** Rows whose `found_at` falls in [now - endWeeksAgo weeks, now - startWeeksAgo weeks). */
function rowsInWindow(
  rows: JobStatsRow[],
  now: Date,
  startWeeksAgo: number,
  endWeeksAgo: number,
): JobStatsRow[] {
  const start = now.getTime() - startWeeksAgo * WEEK_MS;
  const end = now.getTime() - endWeeksAgo * WEEK_MS;

  return rows.filter((row) => {
    if (!row.found_at) {
      return false;
    }
    const found = new Date(row.found_at).getTime();
    return Number.isFinite(found) && found >= start && found < end;
  });
}

function direction(delta: number): TrendDirection {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

function formatTrend(delta: number): string {
  return `${delta > 0 ? "+" : ""}${delta}%`;
}

/**
 * Turns raw job rows into the four stat cards from `designs/dashboard.png`.
 * Pure — every date decision comes from `now`, so this is exercisable without
 * a database.
 */
export function buildDashboardStats(
  input: DashboardStatsInput,
  now: Date = new Date(),
): DashboardStat[] {
  const { totalJobs, companiesResearched, rows } = input;

  const thisWeek = rowsInWindow(rows, now, 1, 0);
  const lastWeek = rowsInWindow(rows, now, 2, 1);

  const avgAll = averageScore(rows);
  const avgThisWeek = averageScore(thisWeek);
  const avgLastWeek = averageScore(lastWeek);

  // Job count moves by percentage change; a match rate is already a
  // percentage, so it moves by percentage *points*.
  const jobsDelta =
    lastWeek.length > 0
      ? Math.round(((thisWeek.length - lastWeek.length) / lastWeek.length) * 100)
      : null;
  const matchDelta =
    avgThisWeek !== null && avgLastWeek !== null
      ? Math.round(avgThisWeek - avgLastWeek)
      : null;

  return [
    {
      id: "total-jobs-found",
      label: "Total Jobs Found",
      value: totalJobs.toString(),
      trend: jobsDelta === null ? null : formatTrend(jobsDelta),
      trendDirection: jobsDelta === null ? null : direction(jobsDelta),
      caption: jobsDelta === null ? "All time" : "vs last week",
    },
    {
      id: "avg-match-rate",
      label: "Avg. Match Rate",
      value: avgAll === null ? EMPTY_FIELD : `${Math.round(avgAll)}%`,
      trend: matchDelta === null ? null : formatTrend(matchDelta),
      trendDirection: matchDelta === null ? null : direction(matchDelta),
      caption: matchDelta === null ? "Across all jobs" : "vs last week",
    },
    {
      id: "companies-researched",
      label: "Companies Researched",
      value: companiesResearched.toString(),
      trend: null,
      trendDirection: null,
      caption: "Total researched",
    },
    {
      id: "jobs-this-week",
      label: "Jobs This Week",
      value: thisWeek.length.toString(),
      trend: null,
      trendDirection: null,
      caption: "New this week",
    },
  ];
}

/** Entries rendered in the Recent Activity card. The design shows five. */
export const RECENT_ACTIVITY_LIMIT = 5;

/** An `agent_runs` row, as far as the activity feed cares about it. */
export type AgentRunRow = {
  id: string;
  job_title_searched: string | null;
  jobs_found: number | null;
  completed_at: string | null;
  started_at: string | null;
};

/** A researched `jobs` row, as far as the activity feed cares about it. */
export type ResearchedJobRow = {
  id: string;
  company: string | null;
  company_researched_at: string | null;
  found_at: string | null;
};

export type RecentActivityInput = {
  runs: AgentRunRow[];
  researchedJobs: ResearchedJobRow[];
};

/** One merged entry, still carrying the raw instant it is sorted by. */
type DatedEntry = {
  entry: Omit<ActivityEntry, "timestamp">;
  at: number;
  iso: string | null;
};

function toInstant(iso: string | null): number | null {
  if (!iso) {
    return null;
  }
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function runEntry(run: AgentRunRow): DatedEntry | null {
  // A run's own clock: it finished when it finished, and only fall back to the
  // start time for a row whose completion was never stamped.
  const iso = run.completed_at ?? run.started_at;
  const at = toInstant(iso);
  if (at === null) {
    return null;
  }

  const count = run.jobs_found ?? 0;
  const jobsLabel = `${count} job${count === 1 ? "" : "s"}`;
  const title = run.job_title_searched?.trim()
    ? `Found ${jobsLabel} for ${run.job_title_searched.trim()}`
    : `Found ${jobsLabel}`;

  return {
    entry: { id: `run-${run.id}`, title, tone: "success" },
    at,
    iso,
  };
}

function researchEntry(job: ResearchedJobRow): DatedEntry | null {
  // Rows researched before `company_researched_at` existed have no recorded
  // time; `found_at` keeps them in the feed instead of dropping them, at the
  // cost of sorting them earlier than they happened.
  const iso = job.company_researched_at ?? job.found_at;
  const at = toInstant(iso);
  if (at === null) {
    return null;
  }

  const company = job.company?.trim() ? job.company.trim() : "a company";

  return {
    entry: { id: `research-${job.id}`, title: `Researched ${company}`, tone: "info" },
    at,
    iso,
  };
}

/**
 * Merges completed agent runs and researched companies into the single
 * time-ordered feed the design shows. Pure — `now` drives every relative
 * timestamp, so this is exercisable without a database.
 */
export function buildRecentActivity(
  input: RecentActivityInput,
  now: Date = new Date(),
): ActivityEntry[] {
  const dated: DatedEntry[] = [
    ...input.runs.map(runEntry),
    ...input.researchedJobs.map(researchEntry),
  ].filter((item): item is DatedEntry => item !== null);

  return dated
    .sort((a, b) => b.at - a.at)
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map(({ entry, iso }) => ({ ...entry, timestamp: formatDateFound(iso, now) }));
}

/** Days plotted by the two time-series charts. */
export const ACTIVITY_WINDOW_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** A row carrying one timestamp to bucket by day. */
type DatedRow = { at: string | null };

/**
 * Buckets timestamps into the last ACTIVITY_WINDOW_DAYS days, oldest first,
 * labelled by weekday. The window is rolling — the rightmost bar is today —
 * and every day is present even at zero, so the axis always shows a full week
 * rather than collapsing to the days that happen to have data.
 *
 * Days are cut in UTC, matching how the timestamps are stored.
 */
function rollingWeek(rows: DatedRow[], now: Date): ChartPoint[] {
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const firstDay = todayUtc - (ACTIVITY_WINDOW_DAYS - 1) * DAY_MS;

  const counts = new Array<number>(ACTIVITY_WINDOW_DAYS).fill(0);

  for (const row of rows) {
    if (!row.at) {
      continue;
    }
    const then = new Date(row.at);
    const ms = then.getTime();
    if (!Number.isFinite(ms)) {
      continue;
    }
    const dayUtc = Date.UTC(
      then.getUTCFullYear(),
      then.getUTCMonth(),
      then.getUTCDate(),
    );
    const index = Math.round((dayUtc - firstDay) / DAY_MS);
    if (index >= 0 && index < ACTIVITY_WINDOW_DAYS) {
      counts[index] += 1;
    }
  }

  return counts.map((value, index) => ({
    label: WEEKDAY_LABELS[new Date(firstDay + index * DAY_MS).getUTCDay()],
    value,
  }));
}

/**
 * Start of the rolling window, as an ISO string for a `.gte()` filter — the
 * midnight UTC that opens the oldest day `rollingWeek()` will plot.
 *
 * Lives here rather than in the page because reading the clock during render
 * trips React's purity rule; this keeps the impure call in plain module code.
 */
export function activityWindowStartISO(now: Date = new Date()): string {
  const start = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ) - (ACTIVITY_WINDOW_DAYS - 1) * DAY_MS;
  return new Date(start).toISOString();
}

/** Jobs discovered per day over the last week. */
export function buildJobsFoundOverTime(
  rows: JobStatsRow[],
  now: Date = new Date(),
): ChartPoint[] {
  return rollingWeek(
    rows.map((row) => ({ at: row.found_at })),
    now,
  );
}

/** Companies researched per day over the last week. */
export function buildCompanyResearchActivity(
  rows: ResearchedJobRow[],
  now: Date = new Date(),
): ChartPoint[] {
  return rollingWeek(
    rows.map((row) => ({ at: row.company_researched_at })),
    now,
  );
}

/**
 * The design's five buckets, except the lowest is "<60%" rather than "50-60%".
 * Real match scores run well below 50 — the live table has 15, 20 and 45 — and
 * the design's banding would have silently dropped them off the chart. Five
 * bars, as drawn; nothing discarded.
 */
const MATCH_SCORE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "<60%", min: Number.NEGATIVE_INFINITY, max: 60 },
  { label: "60-70%", min: 60, max: 70 },
  { label: "70-80%", min: 70, max: 80 },
  { label: "80-90%", min: 80, max: 90 },
  { label: "90-100%", min: 90, max: Number.POSITIVE_INFINITY },
];

/** How the user's job match scores are spread, over every scored job. */
export function buildMatchScoreDistribution(rows: JobStatsRow[]): ChartPoint[] {
  const counts = new Array<number>(MATCH_SCORE_BUCKETS.length).fill(0);

  for (const row of rows) {
    const score = row.match_score;
    if (typeof score !== "number") {
      continue;
    }
    const index = MATCH_SCORE_BUCKETS.findIndex(
      (bucket) => score >= bucket.min && score < bucket.max,
    );
    if (index !== -1) {
      counts[index] += 1;
    }
  }

  return MATCH_SCORE_BUCKETS.map((bucket, index) => ({
    label: bucket.label,
    value: counts[index],
  }));
}

/** True when a chart has nothing to plot and should render its empty state. */
export function isChartEmpty(points: ChartPoint[]): boolean {
  return points.every((point) => point.value === 0);
}

/**
 * Ring and inner-dot classes for an activity entry. The pairings come straight
 * from the Activity Dots table in `ui-tokens.md`.
 */
export function activityDotClasses(tone: ActivityTone): {
  ring: string;
  dot: string;
} {
  if (tone === "info") {
    return { ring: "bg-info-light", dot: "bg-info" };
  }
  if (tone === "success") {
    return { ring: "bg-success-light", dot: "bg-success-alt" };
  }
  return { ring: "bg-accent-light", dot: "bg-accent" };
}
