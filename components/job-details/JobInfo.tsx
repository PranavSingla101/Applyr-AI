import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { matchScoreBadgeClass, type JobDetail } from "@/lib/jobs";

type Props = {
  job: JobDetail;
};

const CARD_CLASSES =
  "rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]";

type InfoCard = {
  label: string;
  value: string;
  icon: typeof DollarSign;
  iconClasses: string;
};

export function JobInfo({ job }: Props) {
  const cards: InfoCard[] = [
    {
      label: "Salary Est.",
      value: job.salaryEstimate,
      icon: DollarSign,
      iconClasses: "bg-success-light text-success-darker",
    },
    {
      label: "Location",
      value: job.location,
      icon: MapPin,
      iconClasses: "bg-info-light text-info-dark",
    },
    {
      label: "Job Type",
      value: job.jobType,
      icon: Briefcase,
      iconClasses: "bg-accent-light text-accent",
    },
    {
      label: "Date Found",
      value: job.dateFound,
      icon: Calendar,
      iconClasses: "bg-surface-secondary text-text-secondary",
    },
  ];

  return (
    <>
      <section className={CARD_CLASSES}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary">
              <Building2 className="h-6 w-6 text-text-secondary" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[30px] font-bold leading-tight text-text-primary">
                {job.role}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-text-secondary">{job.company}</span>
                <span className="text-text-muted">&middot;</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${matchScoreBadgeClass(job.matchScore)}`}
                >
                  {job.matchScore}% Match Score
                </span>
              </div>
            </div>
          </div>

          {job.applyUrl ? (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center justify-center gap-2 self-start rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary md:self-auto"
            >
              <ExternalLink className="h-4 w-4" />
              View Job Post
            </a>
          ) : null}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconClasses}`}
            >
              <card.icon className="h-4 w-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-text-primary">
                {card.value}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {card.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
