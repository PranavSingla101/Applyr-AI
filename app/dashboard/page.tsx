import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchDistributionChart } from "@/components/dashboard/MatchDistributionChart";
import { ProfileBanner } from "@/components/dashboard/ProfileBanner";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { createInsforgeServer } from "@/lib/insforge-server";
import { computeCompletion, profileRowToValues, type ProfileRow } from "@/lib/profile";
import {
  activityWindowStartISO,
  buildCompanyResearchActivity,
  buildDashboardStats,
  buildJobsFoundOverTime,
  buildMatchScoreDistribution,
  buildRecentActivity,
  isChartEmpty,
  JOB_STATS_ROW_LIMIT,
  RECENT_ACTIVITY_LIMIT,
  type AgentRunRow,
  type JobStatsRow,
  type ResearchedJobRow,
} from "@/lib/dashboard";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();

  // The InsForge client returns rows untyped; ProfileRow is the narrow shape
  // the completion check actually reads.
  const completion = computeCompletion(
    profileRowToValues((profile ?? null) as ProfileRow | null),
  );

  // The charts plot the same rows the cards count, so a bar can never disagree
  // with the number above it. Only the research-activity window needs its own
  // read — it is selected by company_researched_at, which is unrelated to the
  // found_at ordering the stats sample uses.
  const windowStart = activityWindowStartISO();

  // Five queries, all scoped to this user. The first carries the exact total
  // in its count *and* the rows the averages and two of the charts need; the
  // second is a head-only count, so it transfers no rows at all. Two feed
  // Recent Activity — taking the newest RECENT_ACTIVITY_LIMIT from each side is
  // enough, since an entry outside its own table's top N cannot be in the
  // merged top N either — and the last feeds the research chart.
  const [
    jobsResult,
    researchedResult,
    runsResult,
    researchFeedResult,
    researchWindowResult,
  ] = await Promise.all([
    insforge.database
      .from("jobs")
      .select("match_score, found_at", { count: "exact" })
      .eq("user_id", user.id)
      .order("found_at", { ascending: false })
      .limit(JOB_STATS_ROW_LIMIT),
    insforge.database
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("company_research", "is", null),
    insforge.database
      .from("agent_runs")
      .select("id, job_title_searched, jobs_found, completed_at, started_at")
      .eq("user_id", user.id)
      .eq("status", "completed")
      // Postgres sorts NULLs first on DESC, so without nullsFirst:false a row
      // with no timestamp would outrank every real one and take a slot.
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(RECENT_ACTIVITY_LIMIT),
    insforge.database
      .from("jobs")
      .select("id, company, company_researched_at, found_at")
      .eq("user_id", user.id)
      .not("company_research", "is", null)
      .order("company_researched_at", { ascending: false, nullsFirst: false })
      .limit(RECENT_ACTIVITY_LIMIT),
    insforge.database
      .from("jobs")
      .select("company_researched_at")
      .eq("user_id", user.id)
      .gte("company_researched_at", windowStart),
  ]);

  const stats = buildDashboardStats({
    totalJobs: jobsResult.count ?? 0,
    companiesResearched: researchedResult.count ?? 0,
    rows: (jobsResult.data ?? []) as JobStatsRow[],
  });

  const activity = buildRecentActivity({
    runs: (runsResult.data ?? []) as AgentRunRow[],
    researchedJobs: (researchFeedResult.data ?? []) as ResearchedJobRow[],
  });

  const statsRows = (jobsResult.data ?? []) as JobStatsRow[];
  const jobsFoundOverTime = buildJobsFoundOverTime(statsRows);
  const matchScoreDistribution = buildMatchScoreDistribution(statsRows);
  const companyResearchActivity = buildCompanyResearchActivity(
    (researchWindowResult.data ?? []) as ResearchedJobRow[],
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-8 py-8">
          {completion.isComplete ? null : (
            <ProfileBanner
              percentage={completion.percentage}
              missingFields={completion.missingFields}
            />
          )}

          <StatsBar stats={stats} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivity entries={activity} />
            <ChartCard
              title="Company Research Activity"
              isEmpty={isChartEmpty(companyResearchActivity)}
              emptyMessage="No companies researched this week — open a job and run Research Company."
            >
              <CompanyResearchChart data={companyResearchActivity} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ChartCard
                title="Jobs Found Over Time"
                isEmpty={isChartEmpty(jobsFoundOverTime)}
                emptyMessage="No jobs found this week — run a search to start tracking."
              >
                <JobsFoundChart data={jobsFoundOverTime} />
              </ChartCard>
            </div>
            <ChartCard
              title="Match Score Distribution"
              isEmpty={isChartEmpty(matchScoreDistribution)}
              emptyMessage="No scored jobs yet — run a search to see how you match."
            >
              <MatchDistributionChart data={matchScoreDistribution} />
            </ChartCard>
          </div>
        </div>
      </main>
    </div>
  );
}
