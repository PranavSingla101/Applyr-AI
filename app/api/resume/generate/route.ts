import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";
import type { EducationEntry, WorkExperienceEntry } from "@/lib/profile";

const GENERATION_JSON_SHAPE = `{
  "summary": string,
  "workExperience": [
    { "bullets": string[] }
  ]
}`;

type GeneratedContent = {
  summary: string;
  workExperience: { bullets: string[] }[];
};

export async function POST() {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData } = await insforge.auth.getCurrentUser();
    const user = userData?.user;

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select(
        "full_name, email, phone, location, linkedin_url, portfolio_url, current_title, experience_level, years_experience, skills, work_experience, education",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Please save your profile before generating a resume." },
        { status: 400 },
      );
    }

    const workExperience = (profile.work_experience ?? []) as WorkExperienceEntry[];
    const education = (profile.education ?? {
      degree: "",
      fieldOfStudy: "",
      institution: "",
      graduationYear: "",
    }) as EducationEntry;
    const hasCompleteRole = workExperience.some(
      (role) => role.company?.trim() && role.title?.trim(),
    );

    if (!profile.full_name?.trim() || !hasCompleteRole) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Add your name and at least one work experience entry (company + title) before generating a resume.",
        },
        { status: 400 },
      );
    }

    const skills = (profile.skills ?? []) as string[];

    let generated: GeneratedContent;
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const response = await openai.chat.completions.create({
        model: "gpt-5.4-nano",
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_completion_tokens: 1000,
        messages: [
          {
            role: "system",
            content: `You are a professional resume writer. Given a candidate's profile, write a concise professional summary and, for each work experience entry given (in the same order), write 3-5 concrete, achievement-oriented bullet points based on the raw responsibilities text provided. Ground everything in the given information — never invent employers, titles, or accomplishments not implied by the input. Return only valid JSON matching exactly this shape, with no extra keys:\n${GENERATION_JSON_SHAPE}`,
          },
          {
            role: "user",
            content: JSON.stringify({
              currentTitle: profile.current_title,
              experienceLevel: profile.experience_level,
              yearsExperience: profile.years_experience,
              skills,
              workExperience: workExperience.map((role) => ({
                title: role.title,
                company: role.company,
                responsibilities: role.responsibilities,
              })),
            }),
          },
        ],
      });

      generated = JSON.parse(response.choices[0].message.content!);
    } catch (err) {
      console.error("[resume/generate] GPT-5.4 nano generation failed:", err);
      return NextResponse.json(
        { success: false, error: "Failed to generate resume content." },
        { status: 502 },
      );
    }

    const roleBullets = workExperience.map((_, index) => generated.workExperience[index]?.bullets ?? []);

    // ResumeDocument's root element is <Document>, but createElement(ResumeDocument, ...)
    // is typed by ResumeDocument's own props, not DocumentProps — renderToBuffer requires
    // the latter, so the cast bridges react-pdf's type constraint to our wrapper component.
    const resumeElement = createElement(ResumeDocument, {
      fullName: profile.full_name,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      linkedinUrl: profile.linkedin_url ?? "",
      portfolioUrl: profile.portfolio_url ?? "",
      summary: generated.summary ?? "",
      workExperience: workExperience.map((role, index) => ({
        ...role,
        bullets: roleBullets[index],
      })),
      education,
      skills,
    }) as ReactElement<DocumentProps>;

    const buffer = await renderToBuffer(resumeElement);

    const pdfBlob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    const { data: uploadData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(`${user.id}/generated-resume.pdf`, pdfBlob);

    if (uploadError || !uploadData) {
      return NextResponse.json(
        { success: false, error: uploadError?.message ?? "Failed to upload generated resume." },
        { status: 500 },
      );
    }

    const { error: updateError } = await insforge.database
      .from("profiles")
      .update({
        generated_resume_pdf_url: uploadData.url,
        generated_resume_pdf_key: uploadData.key,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    revalidatePath("/profile");

    return NextResponse.json({ success: true, data: { generatedResumeUrl: uploadData.url } });
  } catch (error) {
    console.error("[resume/generate]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
