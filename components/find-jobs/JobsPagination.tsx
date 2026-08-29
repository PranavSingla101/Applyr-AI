import Link from "next/link";
import { jobsQueryToSearchParams, type JobsQuery } from "@/lib/jobs";

type Props = {
  firstResult: number;
  lastResult: number;
  totalResults: number;
  totalPages: number;
  currentPage: number;
  query: JobsQuery;
};

type PageItem = number | "ellipsis";

const BUTTON_CLASSES =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary cursor-pointer";

const DISABLED_BUTTON_CLASSES =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-muted cursor-not-allowed";

const ACTIVE_PAGE_CLASSES =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-muted px-3 text-sm font-medium text-accent cursor-pointer";

function buildPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const window = [currentPage - 1, currentPage, currentPage + 1].filter(
    (page) => page > 1 && page < totalPages,
  );
  const pages = new Set<number>([1, ...window, totalPages]);
  const sorted = [...pages].sort((a, b) => a - b);

  const items: PageItem[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      items.push("ellipsis");
    }
    items.push(page);
  });

  return items;
}

export function JobsPagination({
  firstResult,
  lastResult,
  totalResults,
  totalPages,
  currentPage,
  query,
}: Props) {
  const items = buildPageItems(currentPage, totalPages);

  function pageHref(page: number): string {
    const params = jobsQueryToSearchParams({ ...query, page });
    return params ? `/find-jobs?${params}` : "/find-jobs";
  }

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex flex-col gap-4 border-t border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{firstResult}</span>{" "}
        to <span className="font-semibold text-text-primary">{lastResult}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalResults}</span>{" "}
        results
      </p>

      <nav aria-label="Jobs pagination" className="flex items-center gap-2">
        {isFirstPage ? (
          <span aria-disabled className={DISABLED_BUTTON_CLASSES}>
            Previous
          </span>
        ) : (
          <Link href={pageHref(currentPage - 1)} className={BUTTON_CLASSES}>
            Previous
          </Link>
        )}

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 min-w-9 items-center justify-center text-sm text-text-muted"
            >
              ...
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={
                item === currentPage ? ACTIVE_PAGE_CLASSES : BUTTON_CLASSES
              }
            >
              {item}
            </Link>
          ),
        )}

        {isLastPage ? (
          <span aria-disabled className={DISABLED_BUTTON_CLASSES}>
            Next
          </span>
        ) : (
          <Link href={pageHref(currentPage + 1)} className={BUTTON_CLASSES}>
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}
