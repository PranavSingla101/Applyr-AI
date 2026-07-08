"use client";

import { useRef, useState } from "react";
import { Eye, FileText, Sparkles, UploadCloud } from "lucide-react";

type Props = {
  fileName: string | null;
  resumeUrl?: string | null;
  resumeViewHref?: string | null;
  onFileSelect: (file: File) => void;
  onGenerateResume?: () => void;
  isUploading?: boolean;
  uploadError?: string | null;
  canExtract?: boolean;
  onExtract?: () => void;
  isExtracting?: boolean;
  extractError?: string | null;
  isGenerating?: boolean;
  generateError?: string | null;
  generatedResumeViewHref?: string | null;
};

export function ResumeUpload({
  fileName,
  resumeUrl,
  resumeViewHref,
  onFileSelect,
  onGenerateResume,
  isUploading,
  uploadError,
  canExtract,
  onExtract,
  isExtracting,
  extractError,
  isGenerating,
  generateError,
  generatedResumeViewHref,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="text-sm text-text-secondary mt-1">
        Upload an existing resume to auto-fill the profile, or generate a new tailored one from
        your details below.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`mt-5 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 px-6 text-center cursor-pointer transition-colors ${
          isDragging ? "border-accent bg-accent-muted" : "border-border-muted bg-surface-secondary"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface border border-border">
          <UploadCloud className="h-5 w-5 text-accent" />
        </div>
        <p className="text-sm font-semibold text-text-primary">
          {isUploading ? "Uploading…" : (fileName ?? "Click to upload or drag and drop")}
        </p>
        <p className="text-xs text-text-muted">PDF formatting only. Maximum file size 5MB.</p>
        {uploadError ? <p className="text-xs text-error">{uploadError}</p> : null}
        <div className="mt-1 flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            Select Resume
          </button>
          {resumeUrl && resumeViewHref ? (
            <a
              href={resumeViewHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View Current Resume
            </a>
          ) : null}
          {canExtract ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExtract?.();
              }}
              disabled={isExtracting}
              className="flex items-center gap-1.5 bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-4 w-4" />
              {isExtracting ? "Extracting…" : "Extract from Resume"}
            </button>
          ) : null}
        </div>
        {extractError ? <p className="mt-2 text-xs text-error">{extractError}</p> : null}
      </div>

      <div className="mt-5 pt-5 border-t border-border flex items-center justify-between gap-4">
        <p className="text-sm text-text-secondary">
          Need a fresh document based on the fields below?
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {generatedResumeViewHref ? (
            <a
              href={generatedResumeViewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-surface border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View Generated Resume
            </a>
          ) : (
            <span className="flex items-center gap-1.5 bg-surface-secondary border border-border text-text-muted px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed">
              <Eye className="h-4 w-4" />
              View Generated Resume
            </span>
          )}
          <button
            type="button"
            onClick={onGenerateResume}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? "Generating…" : "Generate Resume from Profile"}
          </button>
        </div>
      </div>
      {generateError ? <p className="mt-2 text-xs text-error text-right">{generateError}</p> : null}
    </div>
  );
}
