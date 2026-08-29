import {
  AI_MAX_COMPLETION_TOKENS,
  AI_MODEL,
  AI_STRING,
  AI_STRING_ARRAY,
  aiObject,
  createAIClient,
  jsonSchemaFormat,
} from "@/lib/ai";
import type { AdzunaJob, ScoredJob, ScoringProfile } from "./types";

const SYSTEM_PROMPT = `You score how well a candidate matches a job posting. Return only valid JSON matching exactly this shape, with no extra keys:
{
  "matchScore": number (integer 0-100),
  "matchReason": string (one paragraph explaining the score, referencing the candidate's actual experience),
  "matchedSkills": string[] (skills the candidate has that this job requires),
  "missingSkills": string[] (skills this job requires that the candidate lacks)
}
matchScore must be a whole number on a 0-100 scale (for example 87), never a fraction or a 0-1 ratio.
Score on the evidence given. The job description is a short snippet, so judge on title, seniority, and the skills it does mention rather than assuming unstated requirements. Never invent skills the candidate did not list.`;

const MATCH_SCHEMA = aiObject({
  matchScore: { type: "integer", minimum: 0, maximum: 100 },
  matchReason: AI_STRING,
  matchedSkills: AI_STRING_ARRAY,
  missingSkills: AI_STRING_ARRAY,
});

function clampScore(value: unknown): number {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return 0;
  }
  // Models periodically answer on a 0-1 ratio despite the prompt; a fractional
  // value in that range is a ratio, not a genuine score of "less than 1 in 100".
  const scaled = raw > 0 && raw <= 1 && !Number.isInteger(raw) ? raw * 100 : raw;
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export async function scoreJob(
  job: AdzunaJob,
  profile: ScoringProfile,
): Promise<ScoredJob> {
  const openai = createAIClient();

  const userPrompt = `JOB POSTING:
Title: ${job.title}
Company: ${job.company?.display_name ?? "Unknown"}
Location: ${job.location?.display_name ?? "Unspecified"}
Contract type: ${job.contract_type ?? "unspecified"}
Description snippet: ${job.description}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not specified"}
Experience: ${profile.years_experience ?? "unknown"} years, level ${profile.experience_level ?? "unspecified"}
Skills: ${(profile.skills ?? []).join(", ") || "None listed"}
Industries: ${(profile.industries ?? []).join(", ") || "None listed"}
Seeking roles: ${(profile.job_titles_seeking ?? []).join(", ") || "Not specified"}
Preferred locations: ${(profile.preferred_locations ?? []).join(", ") || "Not specified"}
Remote preference: ${profile.remote_preference ?? "Not specified"}
Work history: ${JSON.stringify(profile.work_experience ?? [])}`;

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    response_format: jsonSchemaFormat("job_match", MATCH_SCHEMA),
    temperature: 0.3,
    max_completion_tokens: AI_MAX_COMPLETION_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("The scoring model returned an empty response");
  }

  const parsed = JSON.parse(content);

  return {
    matchScore: clampScore(parsed.matchScore),
    matchReason: typeof parsed.matchReason === "string" ? parsed.matchReason : "",
    matchedSkills: toStringArray(parsed.matchedSkills),
    missingSkills: toStringArray(parsed.missingSkills),
  };
}
