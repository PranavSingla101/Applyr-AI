import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { createInsforgeServer } from "@/lib/insforge-server";
import { computeCompletion, type ProfileFormValues } from "@/lib/profile";

const EMPTY_VALUES: ProfileFormValues = {
  fullName: "",
  phone: "",
  location: "",
  linkedinUrl: "",
  portfolioUrl: "",
  workAuthorization: "citizen",
  currentTitle: "",
  experienceLevel: "junior",
  yearsExperience: "",
  skills: [],
  industries: [],
  workExperience: [],
  education: { degree: "high_school", fieldOfStudy: "", institution: "", graduationYear: "" },
  jobTitlesSeeking: "",
  remotePreference: "any",
  salaryExpectation: "",
  preferredLocations: "",
};

export default async function ProfilePage() {
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

  const values: ProfileFormValues = profile
    ? {
        fullName: profile.full_name ?? "",
        phone: profile.phone ?? "",
        location: profile.location ?? "",
        linkedinUrl: profile.linkedin_url ?? "",
        portfolioUrl: profile.portfolio_url ?? "",
        workAuthorization: profile.work_authorization ?? "citizen",
        currentTitle: profile.current_title ?? "",
        experienceLevel: profile.experience_level ?? "junior",
        yearsExperience: profile.years_experience?.toString() ?? "",
        skills: profile.skills ?? [],
        industries: profile.industries ?? [],
        workExperience: profile.work_experience ?? [],
        education: profile.education ?? {
          degree: "high_school",
          fieldOfStudy: "",
          institution: "",
          graduationYear: "",
        },
        jobTitlesSeeking: (profile.job_titles_seeking ?? []).join(", "),
        remotePreference: profile.remote_preference ?? "any",
        salaryExpectation: profile.salary_expectation ?? "",
        preferredLocations: (profile.preferred_locations ?? []).join(", "),
      }
    : EMPTY_VALUES;

  const { percentage, missingFields } = computeCompletion(values);
  const resumeFileName = profile?.resume_pdf_url ? "resume.pdf" : null;
  const resumeUrl = profile?.resume_pdf_url ?? null;
  const generatedResumeUrl = profile?.generated_resume_pdf_url ?? null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
          <ProfilePageClient
            email={user.email ?? ""}
            initialValues={values}
            initialResumeFileName={resumeFileName}
            initialResumeUrl={resumeUrl}
            initialGeneratedResumeUrl={generatedResumeUrl}
            initialPercentage={percentage}
            initialMissingFields={missingFields}
          />
        </div>
      </main>
    </div>
  );
}
