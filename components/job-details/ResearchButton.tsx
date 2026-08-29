"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Info, Loader2, Search, Sparkles } from "lucide-react";

type ResearchStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; message: string }
  // A dossier was still built and saved, but from the job posting alone — the
  // company's own website was never read. Green would overstate it.
  | { state: "partial"; message: string }
  | { state: "error"; message: string };

type Props = {
  jobId: string;
  /** Drives the label only — a dossier can always be rebuilt. */
  hasResearch: boolean;
};

export function ResearchButton({ jobId, hasResearch }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<ResearchStatus>({ state: "idle" });

  const isResearching = status.state === "loading";

  async function handleResearch() {
    if (isResearching) {
      return;
    }

    setStatus({ state: "loading" });

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setStatus({
          state: "error",
          message: payload?.error ?? "Company research failed. Please try again.",
        });
        return;
      }

      setStatus({
        state: payload.data.browsed ? "success" : "partial",
        message: payload.data.message,
      });
      // Re-renders the server component so the dossier appears in the card.
      router.refresh();
    } catch {
      setStatus({
        state: "error",
        message: "Company research failed. Please try again.",
      });
    }
  }

  return (
    // Capped width so a two-line status does not stretch across the card header
    // and crowd the title beside it.
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:max-w-md sm:items-end">
      <button
        type="button"
        onClick={handleResearch}
        disabled={isResearching}
        className="flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
      >
        {isResearching ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
        {isResearching
          ? "Researching..."
          : hasResearch
            ? "Re-research Company"
            : "Research Company"}
      </button>

      {status.state === "success" ? (
        <div className="flex w-full items-start gap-3 rounded-lg bg-success-lightest px-4 py-3.5 text-left">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success-darker" />
          <p className="text-sm font-medium text-success-darker">{status.message}</p>
        </div>
      ) : null}

      {status.state === "partial" ? (
        <div className="flex w-full items-start gap-3 rounded-lg bg-warning/10 px-4 py-3.5 text-left">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm font-medium text-warning">{status.message}</p>
        </div>
      ) : null}

      {status.state === "error" ? (
        <div className="flex w-full items-start gap-3 rounded-lg bg-error/10 px-4 py-3.5 text-left">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
          <p className="text-sm font-medium text-error">{status.message}</p>
        </div>
      ) : null}
    </div>
  );
}
