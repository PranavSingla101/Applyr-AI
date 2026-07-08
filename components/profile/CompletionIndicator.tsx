import { AlertCircle } from "lucide-react";

type Props = {
  percentage: number;
  missingFields: string[];
};

export function CompletionIndicator({ percentage, missingFields }: Props) {
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between gap-6">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <AlertCircle className="h-5 w-5 text-error" />
          <h2 className="text-base font-semibold text-text-primary">Profile needs attention</h2>
        </div>
        <p className="text-sm text-text-secondary max-w-md">
          Complete the missing fields to improve your chance of getting tailored matches and
          generating quality resumes.
        </p>
        {missingFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {missingFields.map((field) => (
              <span
                key={field}
                className="px-2.5 py-1 rounded-full bg-error/10 text-error text-xs font-semibold uppercase tracking-wide"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            className="stroke-error/15"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-error"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-text-primary">{percentage}%</span>
        </div>
      </div>
    </div>
  );
}
