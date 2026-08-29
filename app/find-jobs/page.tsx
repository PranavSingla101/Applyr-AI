import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { JobFilterBar } from "@/components/find-jobs/JobFilterBar";
import { JobSearchControls } from "@/components/find-jobs/JobSearchControls";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { createInsforgeServer } from "@/lib/insforge-server";
import {
  JOBS_PER_PAGE,
  parseJobsQuery,
  toJob,
  type JobRow,
} from "@/lib/jobs";
import { MATCH_THRESHOLD } from "@/lib/utils";

/** PostgREST `or` values are comma separated and quotable — keep both out of the pattern. */
function escapeSearchTerm(term: string): string {
  return term.replace(/["\\,()]/g, " ");
}

export default async function FindJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const jobsQuery = parseJobsQuery(await searchParams);

  let query = insforge.database
    .from("jobs")
    .select("id, company, title, match_score, salary, found_at", {
      count: "exact",
    })
    .eq("user_id", user.id);

  if (jobsQuery.matchFilter === "high") {
    query = query.gte("match_score", MATCH_THRESHOLD);
  } else if (jobsQuery.matchFilter === "low") {
    query = query.lt("match_score", MATCH_THRESHOLD);
  }

  if (jobsQuery.search) {
    const pattern = `%${escapeSearchTerm(jobsQuery.search)}%`;
    query = query.or(`company.ilike."${pattern}",title.ilike."${pattern}"`);
  }

  if (jobsQuery.sort === "match_score") {
    query = query
      .order("match_score", { ascending: false })
      .order("found_at", { ascending: false });
  } else {
    query = query.order("found_at", { ascending: jobsQuery.sort === "oldest" });
  }
  // Every job from one search shares a found_at, and scores tie constantly, so
  // without a unique final key Postgres is free to return tied rows in any
  // order — which makes the sort look inert and, worse, lets a row repeat on
  // one page and vanish from another as `range()` walks an unstable ordering.
  query = query.order("id", { ascending: true });

  const from = (jobsQuery.page - 1) * JOBS_PER_PAGE;
  const { data: rows, count } = await query.range(from, from + JOBS_PER_PAGE - 1);

  const totalResults = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalResults / JOBS_PER_PAGE));
  const now = new Date();
  const jobs = ((rows ?? []) as JobRow[]).map((row) => toJob(row, now));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-8 py-8">
          <JobSearchControls />
          <JobFilterBar query={jobsQuery} />
          <JobsTable
            jobs={jobs}
            firstResult={totalResults === 0 ? 0 : from + 1}
            lastResult={from + jobs.length}
            totalResults={totalResults}
            totalPages={totalPages}
            currentPage={jobsQuery.page}
            query={jobsQuery}
          />
        </div>
      </main>
    </div>
  );
}
