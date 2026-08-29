import type { JobDetail } from "@/lib/jobs";

type Props = {
  job: JobDetail;
};

export function JobActions({ job }: Props) {
  if (!job.applyUrl) {
    return (
      <span className="flex w-full items-center justify-center rounded-lg bg-surface-secondary px-6 py-4 text-sm font-medium text-text-muted">
        No apply link available for this listing
      </span>
    );
  }

  return (
    <a
      href={job.applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center rounded-lg bg-accent px-6 py-4 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
    >
      Apply Now at {job.company}
    </a>
  );
}
