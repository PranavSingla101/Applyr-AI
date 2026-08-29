import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { getPostHogClient, shutdownPostHog } from "@/lib/posthog-server";
import { logAgentEvent } from "@/lib/agent-logs";
import { researchCompany, type ResearchLogger } from "@/agent/research";
import type { ResearchJob, ResearchResult, ScoringProfile } from "@/agent/types";

const JOB_FIELDS =
  "id, run_id, title, company, about_role, source_url, external_apply_url, matched_skills, missing_skills";

const PROFILE_FIELDS =
  "is_complete, current_title, experience_level, years_experience, skills, industries, work_experience, job_titles_seeking, preferred_locations, remote_preference";

export async function POST(request: Request) {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { jobId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";

  if (!jobId) {
    return NextResponse.json({ error: "Job id is required" }, { status: 400 });
  }

  // Scoping to the current user is what makes a guessed id a 404 rather than a
  // read of someone else's job — never look a job up by id alone.
  const { data: jobRows } = await insforge.database
    .from("jobs")
    .select(JOB_FIELDS)
    .eq("user_id", user.id)
    .eq("id", jobId)
    .limit(1);

  const job = (jobRows ?? [])[0] as ResearchJob | undefined;

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_complete) {
    return NextResponse.json(
      { error: "Complete your profile before researching a company." },
      { status: 400 },
    );
  }

  // agent_logs.run_id references agent_runs, so research reuses the run that
  // found the job. A job with no run has nowhere to log to — the run still
  // happens, it is just not narrated.
  const runId = job.run_id;
  const log: ResearchLogger = async (message, level) => {
    if (!runId) {
      return;
    }
    await logAgentEvent(insforge, {
      runId,
      userId: user.id,
      jobId: job.id,
      message,
      level,
    });
  };

  const posthog = getPostHogClient();

  let dossier;
  let browsed: boolean;
  try {
    ({ dossier, browsed } = await researchCompany(job, profile as ScoringProfile, log));
  } catch (err) {
    console.error("[agent/research] research failed:", err);
    await log("Company research failed. Please try again.", "error");
    await shutdownPostHog();
    return NextResponse.json(
      { error: "Company research failed. Please try again." },
      { status: 502 },
    );
  }

  const { error: updateError } = await insforge.database
    .from("jobs")
    // company_researched_at is what orders this dossier in the dashboard's
    // Recent Activity feed — found_at is when the job appeared, not when it
    // was researched. Re-researching moves the entry, which is correct.
    .update({ company_research: dossier, company_researched_at: new Date().toISOString() })
    .eq("id", job.id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("[agent/research] dossier save failed:", updateError);
    await log("Built the dossier but could not save it.", "error");
    await shutdownPostHog();
    return NextResponse.json(
      { error: "Built the research but could not save it. Please try again." },
      { status: 500 },
    );
  }

  posthog.capture({
    distinctId: user.id,
    event: "company_researched",
    properties: { userId: user.id, jobId: job.id, company: job.company ?? "Unknown" },
  });

  const message = browsed
    ? `Researched ${job.company ?? "the company"} across ${dossier.sources.length} page${dossier.sources.length === 1 ? "" : "s"}.`
    : `Could not reach ${job.company ?? "the company"}'s website — built the briefing from the job posting and your profile.`;

  await log(message, browsed ? "success" : "warning");
  await shutdownPostHog();
  revalidatePath(`/find-jobs/${job.id}`);

  const result: ResearchResult = {
    jobId: job.id,
    company: job.company ?? "Unknown",
    browsed,
    sources: dossier.sources,
    message,
  };

  return NextResponse.json({ data: result });
}
