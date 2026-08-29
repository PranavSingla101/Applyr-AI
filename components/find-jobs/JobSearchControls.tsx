"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Search, Sparkles } from "lucide-react";

type SearchStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function JobSearchControls() {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<SearchStatus>({ state: "idle" });

  const isSearching = status.state === "loading";

  async function handleFindJobs() {
    if (!jobTitle.trim() || isSearching) {
      return;
    }

    setStatus({ state: "loading" });

    try {
      const response = await fetch("/api/agent/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, location }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setStatus({
          state: "error",
          message: payload?.error ?? "Job search failed. Please try again.",
        });
        return;
      }

      setStatus({ state: "success", message: payload.data.message });
      // Re-renders the server component so the new rows appear in the table.
      router.refresh();
    } catch {
      setStatus({ state: "error", message: "Job search failed. Please try again." });
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <label
            htmlFor="job-title"
            className="text-xs font-semibold uppercase tracking-wide text-text-dark"
          >
            Job Title
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleFindJobs();
              }}
              disabled={isSearching}
              placeholder="Frontend Engineer"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label
            htmlFor="job-location"
            className="text-xs font-semibold uppercase tracking-wide text-text-dark"
          >
            Location
          </label>
          <input
            id="job-location"
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleFindJobs();
            }}
            disabled={isSearching}
            placeholder="Remote, New York..."
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="button"
          onClick={handleFindJobs}
          disabled={isSearching || !jobTitle.trim()}
          className="flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {isSearching ? "Searching..." : "Find Jobs"}
        </button>
      </div>

      {status.state === "loading" ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface-secondary px-4 py-3.5">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-secondary" />
          <p className="text-sm font-medium text-text-secondary">
            Searching and scoring jobs against your profile...
          </p>
        </div>
      ) : null}

      {status.state === "success" ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-success-lightest px-4 py-3.5">
          <Sparkles className="h-4 w-4 shrink-0 text-success-darker" />
          <p className="text-sm font-medium text-success-darker">{status.message}</p>
        </div>
      ) : null}

      {status.state === "error" ? (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-error/10 px-4 py-3.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-error" />
          <p className="text-sm font-medium text-error">{status.message}</p>
        </div>
      ) : null}
    </section>
  );
}
