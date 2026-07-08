"use client";

import { useEffect, useRef, useState } from "react";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { saveProfile, saveResume } from "@/actions/profile";
import {
  diffExtractedProfile,
  mergeExtractedProfile,
  type ProfileFormValues,
  type ScalarProfileField,
} from "@/lib/profile";

type Props = {
  email: string;
  initialValues: ProfileFormValues;
  initialResumeFileName: string | null;
  initialResumeUrl: string | null;
  initialGeneratedResumeUrl: string | null;
  initialPercentage: number;
  initialMissingFields: string[];
};

export function ProfilePageClient({
  email,
  initialValues,
  initialResumeFileName,
  initialResumeUrl,
  initialGeneratedResumeUrl,
  initialPercentage,
  initialMissingFields,
}: Props) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [resumeFileName, setResumeFileName] = useState<string | null>(initialResumeFileName);
  const [resumeUrl, setResumeUrl] = useState<string | null>(initialResumeUrl);
  const [generatedResumeUrl, setGeneratedResumeUrl] = useState<string | null>(initialGeneratedResumeUrl);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [missingFields, setMissingFields] = useState(initialMissingFields);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Partial<Record<ScalarProfileField, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const localPreviewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) URL.revokeObjectURL(localPreviewUrlRef.current);
    };
  }, []);

  const handleChange = (patch: Partial<ProfileFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }));

    const editedFields = Object.keys(patch) as ScalarProfileField[];
    setSuggestions((prev) => {
      if (!editedFields.some((field) => field in prev)) return prev;
      const next = { ...prev };
      for (const field of editedFields) delete next[field];
      return next;
    });
  };

  const persistValues = async (next: ProfileFormValues) => {
    const result = await saveProfile(next, null);
    if (!result.success) {
      setExtractError(result.error ?? "Extracted, but failed to save the profile.");
      return;
    }
    setPercentage(result.percentage);
    setMissingFields(result.missingFields);
  };

  const handleAcceptSuggestion = async (field: ScalarProfileField) => {
    const suggestedValue = suggestions[field];
    if (suggestedValue === undefined) return;

    const next = { ...values, [field]: suggestedValue };
    setValues(next);

    setSuggestions((prev) => {
      const rest = { ...prev };
      delete rest[field];
      return rest;
    });

    await persistValues(next);
  };

  const handleDismissSuggestion = (field: ScalarProfileField) => {
    setSuggestions((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFileSelect = async (file: File) => {
    if (localPreviewUrlRef.current) URL.revokeObjectURL(localPreviewUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    localPreviewUrlRef.current = previewUrl;

    setResumeFileName(file.name);
    setLocalPreviewUrl(previewUrl);
    setResumeError(null);
    setIsUploadingResume(true);

    const result = await saveResume(file);
    setIsUploadingResume(false);

    if (!result.success) {
      setResumeError(result.error ?? "Failed to upload resume");
      return;
    }

    setResumeUrl(result.resumeUrl);
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch("/api/resume/extract", { method: "POST" });
      const body = await response.json();

      if (!response.ok) {
        setExtractError(body.error ?? "Failed to extract profile data from this resume.");
        return;
      }

      const extracted = body.data as Partial<ProfileFormValues>;
      const merged = mergeExtractedProfile(values, extracted);

      setValues(merged);
      setSuggestions(diffExtractedProfile(merged, extracted));

      await persistValues(merged);
    } catch {
      setExtractError("Failed to extract profile data from this resume.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetch("/api/resume/generate", { method: "POST" });
      const body = await response.json();

      if (!body.success) {
        setGenerateError(body.error ?? "Failed to generate resume.");
        return;
      }

      setGeneratedResumeUrl(body.data.generatedResumeUrl);
    } catch {
      setGenerateError("Failed to generate resume.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const result = await saveProfile(values, null);
    setIsSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save profile");
      return;
    }

    setPercentage(result.percentage);
    setMissingFields(result.missingFields);
  };

  return (
    <>
      <CompletionIndicator percentage={percentage} missingFields={missingFields} />
      <ResumeUpload
        fileName={resumeFileName}
        resumeUrl={localPreviewUrl ?? resumeUrl}
        resumeViewHref={localPreviewUrl ?? (resumeUrl ? "/api/resume" : null)}
        onFileSelect={handleFileSelect}
        isUploading={isUploadingResume}
        uploadError={resumeError}
        canExtract={Boolean(resumeUrl)}
        onExtract={handleExtract}
        isExtracting={isExtracting}
        extractError={extractError}
        onGenerateResume={handleGenerateResume}
        isGenerating={isGenerating}
        generateError={generateError}
        generatedResumeViewHref={generatedResumeUrl ? "/api/resume/generated" : null}
      />
      <ProfileForm
        email={email}
        values={values}
        onChange={handleChange}
        onSave={handleSave}
        isSaving={isSaving}
        error={error}
        suggestions={suggestions}
        onAcceptSuggestion={handleAcceptSuggestion}
        onDismissSuggestion={handleDismissSuggestion}
      />
    </>
  );
}
