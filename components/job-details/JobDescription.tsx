import { FileText } from "lucide-react";

type Props = {
  description: string;
};

export function JobDescription({ description }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-text-secondary">
          <FileText className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold text-text-primary">Job Description</h2>
      </div>
      {description ? (
        <p className="mt-5 whitespace-pre-line text-sm leading-6 text-text-primary">
          {description}
        </p>
      ) : (
        <p className="mt-5 text-sm text-text-muted">
          No description was included with this listing.
        </p>
      )}
    </section>
  );
}
