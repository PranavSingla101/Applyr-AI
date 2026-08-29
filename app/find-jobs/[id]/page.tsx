import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import { JobDescription } from "@/components/job-details/JobDescription";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";
import { toJobDetail, type JobDetailRow } from "@/lib/jobs";

const JOB_COLUMNS =
  "id, company, title, location, salary, job_type, about_role, source_url, external_apply_url, match_score, match_reason, matched_skills, missing_skills, company_research, found_at";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  const user = data?.user ?? null;

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  const { data: rows } = await insforge.database
    .from("jobs")
    .select(JOB_COLUMNS)
    // Scoping to the current user is what makes a guessed id a 404 rather than
    // another user's job — never look a job up by id alone.
    .eq("user_id", user.id)
    .eq("id", id)
    .limit(1);

  const row = (rows ?? [])[0] as JobDetailRow | undefined;

  if (!row) {
    notFound();
  }

  const job = toJobDetail(row);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-8">
          <Link
            href="/find-jobs"
            className="flex w-fit items-center gap-1.5 text-sm font-medium text-text-dark transition-colors hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          <JobInfo job={job} />
          <MatchScore job={job} />
          <JobDescription description={job.description} />
          <CompanyResearch jobId={job.id} company={job.company} research={job.research} />
          <JobActions job={job} />
        </div>
      </main>
    </div>
  );
}
