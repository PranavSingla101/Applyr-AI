import { Check, Sparkles, X } from "lucide-react";
import type { JobDetail } from "@/lib/jobs";

type Props = {
  job: JobDetail;
};

const CARD_CLASSES =
  "rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]";

const SECTION_LABEL_CLASSES =
  "text-xs font-medium uppercase tracking-wide text-text-secondary";

export function MatchScore({ job }: Props) {
  const hasSkills = job.matchedSkills.length > 0 || job.missingSkills.length > 0;

  return (
    <>
      {job.matchReason ? (
        <section className={CARD_CLASSES}>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-light text-success-darker">
              <Sparkles className="h-4 w-4" />
            </span>
            <h2 className={SECTION_LABEL_CLASSES}>AI Match Reasoning</h2>
          </div>
          <p className="mt-5 text-sm leading-6 text-text-primary">{job.matchReason}</p>
        </section>
      ) : null}

      {hasSkills ? (
        <section className={CARD_CLASSES}>
          <h2 className={SECTION_LABEL_CLASSES}>Required Skills vs Your Profile</h2>

          {job.matchedSkills.length > 0 ? (
            <div className="mt-5 flex flex-col gap-2">
              <span className="text-sm text-text-secondary">You have</span>
              <ul className="flex flex-wrap gap-2">
                {job.matchedSkills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full bg-success-lightest px-3 py-1 text-sm font-medium text-success-foreground"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {job.missingSkills.length > 0 ? (
            <div className="mt-5 flex flex-col gap-2">
              <span className="text-sm text-text-secondary">Gap skills</span>
              <ul className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-1.5 rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent"
                  >
                    <X className="h-3.5 w-3.5" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
