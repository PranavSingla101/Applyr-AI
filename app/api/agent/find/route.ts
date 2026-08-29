import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { getPostHogClient, shutdownPostHog } from "@/lib/posthog-server";
import { logAgentEvent } from "@/lib/agent-logs";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { detectCountry, formatSalary, searchJobs } from "@/agent/adzuna";
import { scoreJob } from "@/agent/matcher";
import type { AdzunaJob, FindJobsResult, ScoringProfile } from "@/agent/types";

const PROFILE_FIELDS =
  "is_complete, current_title, experience_level, years_experience, skills, industries, work_experience, job_titles_seeking, preferred_locations, remote_preference";

function buildMessage(found: number, strongMatches: number, duplicates: number): string {
  if (found === 0) {
    return "No jobs found for that search. Try a different title or location.";
  }
  const base = `Found ${found} job${found === 1 ? "" : "s"} and saved ${strongMatches} strong match${strongMatches === 1 ? "" : "es"}.`;
  return duplicates > 0
    ? `${base} ${duplicates} already in your list.`
    : base;
}

export async function POST(request: Request) {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { jobTitle?: unknown; location?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";

  if (!jobTitle) {
    return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.is_complete) {
    return NextResponse.json(
      { error: "Complete your profile before searching for jobs." },
      { status: 400 },
    );
  }

  const scoringProfile = profile as ScoringProfile;
  const country = detectCountry(location);
  const posthog = getPostHogClient();

  posthog.capture({
    distinctId: user.id,
    event: "job_search_started",
    properties: { userId: user.id, jobTitle, location },
  });

  const { data: runRows, error: runError } = await insforge.database
    .from("agent_runs")
    .insert([
      {
        user_id: user.id,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location || null,
      },
    ])
    .select();

  const runId = runRows?.[0]?.id as string | undefined;

  if (runError || !runId) {
    await shutdownPostHog();
    return NextResponse.json(
      { error: runError?.message ?? "Could not start the search run" },
      { status: 500 },
    );
  }

  /** Marks the run failed, logs why, and returns the error response. */
  const failRun = async (message: string, status: number) => {
    await insforge.database
      .from("agent_runs")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", runId)
      .eq("user_id", user.id);
    await logAgentEvent(insforge, { runId, userId: user.id, message, level: "error" });
    await shutdownPostHog();
    return NextResponse.json({ error: message }, { status });
  };

  await logAgentEvent(insforge, {
    runId,
    userId: user.id,
    message: `Searching Adzuna (${country}) for "${jobTitle}"${location ? ` in ${location}` : ""}.`,
    level: "info",
  });

  let adzunaJobs: AdzunaJob[];
  try {
    adzunaJobs = await searchJobs(jobTitle, location, country);
  } catch (err) {
    console.error("[agent/find] Adzuna search failed:", err);
    return failRun("Job search failed. Please try again.", 502);
  }

  const found = adzunaJobs.length;

  // Skip anything already saved for this user before spending a scoring call.
  const sourceUrls = adzunaJobs.map((job) => job.redirect_url).filter(Boolean);
  let existingUrls = new Set<string>();

  if (sourceUrls.length > 0) {
    const { data: existing } = await insforge.database
      .from("jobs")
      .select("source_url")
      .eq("user_id", user.id)
      .in("source_url", sourceUrls);
    existingUrls = new Set(
      (existing ?? []).map((row: { source_url: string }) => row.source_url),
    );
  }

  const newJobs = adzunaJobs.filter((job) => !existingUrls.has(job.redirect_url));
  const duplicates = found - newJobs.length;

  // Score in parallel — one failed job is logged and skipped, never fatal.
  const scored = await Promise.allSettled(
    newJobs.map((job) => scoreJob(job, scoringProfile)),
  );

  const foundAt = new Date().toISOString();
  const rows = [];

  for (let i = 0; i < newJobs.length; i += 1) {
    const job = newJobs[i];
    const result = scored[i];

    if (result.status === "rejected") {
      console.error("[agent/find] scoring failed:", result.reason);
      await logAgentEvent(insforge, {
        runId,
        userId: user.id,
        message: `Could not score "${job.title}" at ${job.company?.display_name ?? "unknown company"} — skipped.`,
        level: "warning",
      });
      continue;
    }

    rows.push({
      user_id: user.id,
      run_id: runId,
      source: "search",
      source_url: job.redirect_url,
      external_apply_url: job.redirect_url,
      title: job.title,
      company: job.company?.display_name ?? "Unknown",
      location: job.location?.display_name ?? null,
      salary: formatSalary(job),
      job_type: job.contract_type ?? "fulltime",
      about_role: job.description,
      match_score: result.value.matchScore,
      match_reason: result.value.matchReason,
      matched_skills: result.value.matchedSkills,
      missing_skills: result.value.missingSkills,
      found_at: foundAt,
    });
  }

  if (rows.length > 0) {
    const { error: insertError } = await insforge.database.from("jobs").insert(rows);
    if (insertError) {
      console.error("[agent/find] job insert failed:", insertError);
      return failRun("Found jobs but could not save them. Please try again.", 500);
    }
  }

  const strongMatches = rows.filter((row) => row.match_score >= MATCH_THRESHOLD).length;

  for (const row of rows) {
    posthog.capture({
      distinctId: user.id,
      event: "job_found",
      properties: {
        userId: user.id,
        source: "search",
        matchScore: row.match_score,
      },
    });
  }

  await insforge.database
    .from("agent_runs")
    .update({
      status: "completed",
      jobs_found: found,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", user.id);

  const message = buildMessage(found, strongMatches, duplicates);

  await logAgentEvent(insforge, {
    runId,
    userId: user.id,
    message,
    level: "success",
  });

  await shutdownPostHog();
  revalidatePath("/find-jobs");

  const result: FindJobsResult = {
    runId,
    found,
    saved: rows.length,
    strongMatches,
    duplicates,
    message,
  };

  return NextResponse.json({ data: result });
}
