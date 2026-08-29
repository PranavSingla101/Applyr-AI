import Link from "next/link";
import { AlertCircle } from "lucide-react";

type Props = {
  percentage: number;
  missingFields: string[];
};

export function ProfileBanner({ percentage, missingFields }: Props) {
  const missingLabel =
    missingFields.length === 1
      ? missingFields[0]
      : `${missingFields.length} sections`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-warning/20 bg-warning/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-text-primary">
            Your profile is {percentage}% complete
          </p>
          <p className="mt-1 text-xs text-text-secondary">
            Job matching gets sharper once {missingLabel} {missingFields.length === 1 ? "is" : "are"} filled in.
          </p>
        </div>
      </div>

      <Link
        href="/profile"
        className="shrink-0 rounded-md border border-border bg-surface px-4 py-2 text-center text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
      >
        Complete Profile
      </Link>
    </div>
  );
}
