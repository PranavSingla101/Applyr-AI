import { Building2 } from "lucide-react";
import Link from "next/link";
import { MatchScoreBar } from "@/components/find-jobs/MatchScoreBar";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import type { Job, JobsQuery } from "@/lib/jobs";

type Props = {
  jobs: Job[];
  firstResult: number;
  lastResult: number;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  query: JobsQuery;
};

const HEADER_CLASSES =
  "px-6 py-4 text-left text-xs font-medium uppercase tracking-wide text-text-secondary";

export function JobsTable({
  jobs,
  firstResult,
  lastResult,
  totalResults,
  totalPages,
  currentPage,
  query,
}: Props) {
  const isFiltered = query.search !== "" || query.matchFilter !== "all";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
          <Building2 className="h-5 w-5 text-text-muted" />
          <p className="text-sm text-text-muted">
            {isFiltered
              ? "No jobs match these filters — try clearing them."
              : "No jobs yet — run a search above to discover matching roles."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[27%]" />
                <col className="w-[18%]" />
                <col className="w-[17%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-surface-secondary">
                <tr className="border-b border-border">
                  <th scope="col" className={HEADER_CLASSES}>
                    Company
                  </th>
                  <th scope="col" className={HEADER_CLASSES}>
                    Role
                  </th>
                  <th scope="col" className={HEADER_CLASSES}>
                    Match Score
                  </th>
                  <th scope="col" className={HEADER_CLASSES}>
                    Salary Est.
                  </th>
                  <th scope="col" className={HEADER_CLASSES}>
                    Date Found
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-secondary"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-secondary">
                          <Building2 className="h-4 w-4 text-text-secondary" />
                        </span>
                        <Link
                          href={`/find-jobs/${job.id}`}
                          className="text-sm font-semibold text-text-primary transition-colors hover:text-accent"
                        >
                          {job.company}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/find-jobs/${job.id}`}
                        className="text-sm font-medium text-text-primary transition-colors hover:text-accent"
                      >
                        {job.role}
                      </Link>
                    </td>
                    <td className="px-6 py-5">
                      <MatchScoreBar score={job.matchScore} />
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-text-primary">
                      {job.salaryEstimate}
                    </td>
                    <td className="px-6 py-5 text-sm text-text-secondary">
                      {job.dateFound}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <JobsPagination
            firstResult={firstResult}
            lastResult={lastResult}
            totalResults={totalResults}
            totalPages={totalPages}
            currentPage={currentPage}
            query={query}
          />
        </>
      )}
    </section>
  );
}
