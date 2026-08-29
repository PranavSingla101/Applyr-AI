import { matchScoreBarClass } from "@/lib/jobs";

type Props = {
  score: number;
};

export function MatchScoreBar({ score }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-border-light">
        <div
          className={`h-full rounded-full ${matchScoreBarClass(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-text-primary">{score}%</span>
    </div>
  );
}
