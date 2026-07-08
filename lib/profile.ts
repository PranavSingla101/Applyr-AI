export type WorkExperienceEntry = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type EducationEntry = {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
};

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  workExperience: WorkExperienceEntry[];
  education: EducationEntry;
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
};

function isRoleComplete(role: WorkExperienceEntry) {
  const endDateOk = role.currentlyWorking || role.endDate.trim().length > 0;
  return (
    role.company.trim().length > 0 &&
    role.title.trim().length > 0 &&
    role.startDate.trim().length > 0 &&
    endDateOk &&
    role.responsibilities.trim().length > 0
  );
}

export function computeCompletion(values: ProfileFormValues) {
  const missing: string[] = [];

  if (!values.fullName.trim()) missing.push("Full Name");
  if (!values.phone.trim()) missing.push("Phone");
  if (!values.location.trim()) missing.push("Location");
  if (!values.linkedinUrl.trim()) missing.push("LinkedIn URL");
  if (!values.portfolioUrl.trim()) missing.push("Portfolio / GitHub");
  if (!values.workAuthorization.trim()) missing.push("Work Authorization");

  if (!values.currentTitle.trim()) missing.push("Current Job Title");
  if (!values.experienceLevel.trim()) missing.push("Experience Level");
  if (!values.yearsExperience.trim()) missing.push("Years of Experience");
  if (values.skills.length === 0) missing.push("Skills");

  if (values.workExperience.length === 0) {
    missing.push("Work Experience");
  } else if (!values.workExperience.every(isRoleComplete)) {
    missing.push("Work Experience");
  }

  if (
    !values.education.degree.trim() ||
    !values.education.fieldOfStudy.trim() ||
    !values.education.institution.trim() ||
    !values.education.graduationYear.trim()
  ) {
    missing.push("Education");
  }

  if (!values.jobTitlesSeeking.trim()) missing.push("Job Titles Seeking");
  if (!values.remotePreference.trim()) missing.push("Remote Preference");

  const totalFields = 13;
  const filledFields = totalFields - missing.length;
  const percentage = Math.max(0, Math.min(100, Math.round((filledFields / totalFields) * 100)));

  return { percentage, missingFields: missing, isComplete: missing.length === 0 };
}

export function splitToArray(value: string) {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export const SCALAR_FIELDS = [
  "fullName",
  "phone",
  "location",
  "linkedinUrl",
  "portfolioUrl",
  "workAuthorization",
  "currentTitle",
  "experienceLevel",
  "yearsExperience",
  "jobTitlesSeeking",
  "remotePreference",
  "salaryExpectation",
  "preferredLocations",
] as const satisfies readonly (keyof ProfileFormValues)[];

export type ScalarProfileField = (typeof SCALAR_FIELDS)[number];

const ARRAY_FIELDS = ["skills", "industries"] as const satisfies readonly (keyof ProfileFormValues)[];

/**
 * Merges resume-extracted data into the current form values without clobbering
 * anything the user already typed — only currently-blank fields are filled.
 * workExperience/education are merged as whole blocks rather than field-by-field
 * to avoid stitching mismatched roles/degrees together.
 */
export function mergeExtractedProfile(
  current: ProfileFormValues,
  extracted: Partial<ProfileFormValues>,
): ProfileFormValues {
  const merged: ProfileFormValues = { ...current };

  for (const field of SCALAR_FIELDS) {
    const extractedValue = extracted[field];
    if (!current[field]?.trim() && typeof extractedValue === "string" && extractedValue.trim()) {
      (merged[field] as string) = extractedValue;
    }
  }

  for (const field of ARRAY_FIELDS) {
    const extractedValue = extracted[field];
    if (current[field].length === 0 && Array.isArray(extractedValue) && extractedValue.length > 0) {
      const deduped = new Set(
        extractedValue.filter((v): v is string => typeof v === "string" && v.trim().length > 0),
      );
      (merged[field] as string[]) = Array.from(deduped);
    }
  }

  if (current.workExperience.length === 0 && Array.isArray(extracted.workExperience) && extracted.workExperience.length > 0) {
    merged.workExperience = extracted.workExperience.slice(0, 3).map((role) => ({
      company: role?.company ?? "",
      title: role?.title ?? "",
      startDate: role?.startDate ?? "",
      endDate: role?.endDate ?? "",
      currentlyWorking: Boolean(role?.currentlyWorking),
      responsibilities: role?.responsibilities ?? "",
    }));
  }

  const currentEducationEmpty =
    !current.education.degree.trim() &&
    !current.education.fieldOfStudy.trim() &&
    !current.education.institution.trim() &&
    !current.education.graduationYear.trim();

  if (currentEducationEmpty && extracted.education) {
    merged.education = {
      degree: extracted.education.degree ?? "",
      fieldOfStudy: extracted.education.fieldOfStudy ?? "",
      institution: extracted.education.institution ?? "",
      graduationYear: extracted.education.graduationYear ?? "",
    };
  }

  return merged;
}

/**
 * Finds scalar fields where the user already typed something but the resume
 * extraction disagrees — these are surfaced as suggestion bubbles the user
 * can accept or dismiss, rather than silently overwritten (mergeExtractedProfile
 * already handles the blank-field case).
 */
export function diffExtractedProfile(
  current: ProfileFormValues,
  extracted: Partial<ProfileFormValues>,
): Partial<Record<ScalarProfileField, string>> {
  const conflicts: Partial<Record<ScalarProfileField, string>> = {};

  for (const field of SCALAR_FIELDS) {
    const currentValue = current[field]?.trim() ?? "";
    const extractedValue = extracted[field];
    if (
      currentValue &&
      typeof extractedValue === "string" &&
      extractedValue.trim() &&
      extractedValue.trim() !== currentValue
    ) {
      conflicts[field] = extractedValue.trim();
    }
  }

  return conflicts;
}
