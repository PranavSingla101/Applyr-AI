import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET() {
  const insforge = await createInsforgeServer();
  const { data: userData } = await insforge.auth.getCurrentUser();
  const user = userData?.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await insforge.database
    .from("profiles")
    .select("resume_pdf_key")
    .eq("id", user.id)
    .maybeSingle();

  const resumeKey = profile?.resume_pdf_key;

  if (!resumeKey) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const { data: blob, error } = await insforge.storage
    .from("resumes")
    .download(resumeKey);

  if (error || !blob) {
    return NextResponse.json({ error: error?.message ?? "Resume not found" }, { status: 404 });
  }

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=\"resume.pdf\"",
    },
  });
}
