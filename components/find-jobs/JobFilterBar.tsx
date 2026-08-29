"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import {
  JOB_SORT_OPTIONS,
  MATCH_FILTER_OPTIONS,
  jobsQueryToSearchParams,
  type JobSort,
  type JobsQuery,
  type MatchFilter,
} from "@/lib/jobs";

type Props = {
  query: JobsQuery;
};

const SELECT_CLASSES =
  "appearance-none rounded-lg border border-border bg-surface py-2.5 pl-4 pr-9 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer";

/** Typing should not fire a request per keystroke. */
const SEARCH_DEBOUNCE_MS = 300;

export function JobFilterBar({ query }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(query.search);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(next: Partial<JobsQuery>) {
    // Any change to the result set puts the reader back on page one.
    const params = jobsQueryToSearchParams({ ...query, page: 1, ...next });
    router.replace(params ? `/find-jobs?${params}` : "/find-jobs");
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      if (value.trim() !== query.search) {
        navigate({ search: value.trim() });
      }
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <section className="rounded-2xl border border-border bg-surface px-6 py-4 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Filter by company or role..."
            aria-label="Filter by company or role"
            className="w-full border-0 bg-transparent py-2 pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-border md:block" />

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={query.matchFilter}
              onChange={(event) =>
                navigate({ matchFilter: event.target.value as MatchFilter })
              }
              aria-label="Match filter"
              className={SELECT_CLASSES}
            >
              {MATCH_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </div>

          <div className="relative">
            <select
              value={query.sort}
              onChange={(event) =>
                navigate({ sort: event.target.value as JobSort })
              }
              aria-label="Sort jobs"
              className={SELECT_CLASSES}
            >
              {JOB_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          </div>
        </div>
      </div>
    </section>
  );
}
