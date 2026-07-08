"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { computeCompletion, splitToArray, type ProfileFormValues } from "@/lib/profile";

const DEFAULT_COVER_LETTER_TONE = "formal";

type SaveProfileResult =
  | { success: true; percentage: number; missingFields: string[]; resumeUrl?: string }
  | { success: false; error: string };

export async function saveProfile(
  values: ProfileFormValues,
  resumeFile: File | null,
): Promise<SaveProfileResult> {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  let resumePdfUrl: string | undefined;
  let resumePdfKey: string | undefined;

  if (resumeFile) {
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(`${user.id}/resume.pdf`, resumeFile);

    if (uploadError || !uploadData) {
      return { success: false, error: uploadError?.message ?? "Resume upload failed" };
    }

    resumePdfUrl = uploadData.url;
    resumePdfKey = uploadData.key;
  }

  const { percentage, missingFields, isComplete } = computeCompletion(values);

  const row = {
    full_name: values.fullName,
    email: user.email,
    phone: values.phone,
    location: values.location,
    current_title: values.currentTitle,
    experience_level: values.experienceLevel,
    years_experience: values.yearsExperience ? Number(values.yearsExperience) : null,
    skills: values.skills,
    industries: values.industries,
    work_experience: values.workExperience,
    education: values.education,
    job_titles_seeking: splitToArray(values.jobTitlesSeeking),
    remote_preference: values.remotePreference,
    preferred_locations: splitToArray(values.preferredLocations),
    salary_expectation: values.salaryExpectation || null,
    cover_letter_tone: DEFAULT_COVER_LETTER_TONE,
    linkedin_url: values.linkedinUrl,
    portfolio_url: values.portfolioUrl,
    work_authorization: values.workAuthorization,
    is_complete: isComplete,
    ...(resumePdfUrl ? { resume_pdf_url: resumePdfUrl, resume_pdf_key: resumePdfKey } : {}),
  };

  const { error: upsertError } = await insforge.database
    .from("profiles")
    .upsert([{ id: user.id, ...row }], { onConflict: "id" });

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  revalidatePath("/profile");

  return { success: true, percentage, missingFields, resumeUrl: resumePdfUrl };
}

type SaveResumeResult =
  | { success: true; resumeUrl: string }
  | { success: false; error: string };

export async function saveResume(resumeFile: File): Promise<SaveResumeResult> {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { data: uploadData, error: uploadError } = await insforge.storage
    .from("resumes")
    .upload(`${user.id}/resume.pdf`, resumeFile);

  if (uploadError || !uploadData) {
    return { success: false, error: uploadError?.message ?? "Resume upload failed" };
  }

  const { error: upsertError } = await insforge.database
    .from("profiles")
    .upsert(
      [{ id: user.id, email: user.email, resume_pdf_url: uploadData.url, resume_pdf_key: uploadData.key }],
      { onConflict: "id" },
    );

  if (upsertError) {
    return { success: false, error: upsertError.message };
  }

  revalidatePath("/profile");

  return { success: true, resumeUrl: uploadData.url };
}
