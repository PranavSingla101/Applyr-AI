import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
import { createInsforgeServer } from "@/lib/insforge-server";

const MIN_EXTRACTED_TEXT_LENGTH = 50;

const PROFILE_JSON_SHAPE = `{
  "fullName": string,
  "phone": string,
  "location": string,
  "linkedinUrl": string,
  "portfolioUrl": string,
  "workAuthorization": "citizen" | "permanent_resident" | "visa_required" | "",
  "currentTitle": string,
  "experienceLevel": "junior" | "mid" | "senior" | "lead" | "",
  "yearsExperience": string,
  "skills": string[],
  "industries": string[],
  "workExperience": [
    {
      "company": string,
      "title": string,
      "startDate": string (format "YYYY-MM"),
      "endDate": string (format "YYYY-MM", empty if currentlyWorking),
      "currentlyWorking": boolean,
      "responsibilities": string
    }
  ] (max 3, most recent first),
  "education": {
    "degree": "high_school" | "associate" | "bachelor" | "master" | "phd" | "other" | "",
    "fieldOfStudy": string,
    "institution": string,
    "graduationYear": string
  },
  "jobTitlesSeeking": string,
  "remotePreference": "remote" | "onsite" | "hybrid" | "any" | "",
  "salaryExpectation": string,
  "preferredLocations": string
}`;

export async function POST() {
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
    return NextResponse.json({ error: "No resume uploaded yet" }, { status: 404 });
  }

  const { data: blob, error: downloadError } = await insforge.storage
    .from("resumes")
    .download(resumeKey);

  if (downloadError || !blob) {
    return NextResponse.json({ error: downloadError?.message ?? "Resume not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await blob.arrayBuffer());

  let extractedText: string;
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();
    extractedText = result.text ?? "";
  } catch (err) {
    console.error("[resume/extract] pdf-parse failed:", err);
    return NextResponse.json(
      { error: "Could not extract text from this PDF. Please try a different file." },
      { status: 422 },
    );
  }

  if (extractedText.trim().length < MIN_EXTRACTED_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "Could not extract text from this PDF. Please try a different file." },
      { status: 422 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: "gpt-5.4-nano",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You extract structured job-applicant profile data from resume text. Return only valid JSON matching exactly this shape, with no extra keys:\n${PROFILE_JSON_SHAPE}\nLeave any field you cannot confidently determine as an empty string, empty array, or false — never guess.`,
        },
        {
          role: "user",
          content: extractedText,
        },
      ],
    });

    const parsed = JSON.parse(response.choices[0].message.content!);
    return NextResponse.json({ data: parsed });
  } catch (err) {
    console.error("[resume/extract] GPT-5.4 nano extraction failed:", err);
    return NextResponse.json({ error: "Failed to extract profile data from this resume." }, { status: 502 });
  }
}
