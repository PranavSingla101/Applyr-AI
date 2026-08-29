import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import { createInsforgeServer } from "@/lib/insforge-server";
import { computeCompletion, profileRowToValues, type ProfileRow } from "@/lib/profile";

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

  // The InsForge client returns rows untyped; ProfileRow is the narrow shape
  // the form actually reads, and every field on it is optional and nullable.
  const values = profileRowToValues((profile ?? null) as ProfileRow | null);

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
