import type { DashboardStat, TrendDirection } from "@/lib/dashboard";

type Props = {
  stats: DashboardStat[];
};

/**
 * A falling stat rendered in the design's green badge would read as good news,
 * so `down` gets the error pair and `flat` a neutral one. Green stays reserved
 * for an actual improvement.
 */
function trendBadgeClass(trendDirection: TrendDirection): string {
  if (trendDirection === "down") {
    return "bg-error/10 text-error";
  }
  if (trendDirection === "flat") {
    return "bg-surface-secondary text-text-secondary";
  }
  return "bg-success-lightest text-success-darker";
}

export function StatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
        >
          <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
          <p className="mt-2 text-[30px] font-semibold leading-9 text-text-primary">
            {stat.value}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {stat.trend && stat.trendDirection ? (
              <span
                className={`rounded-sm px-2 py-0.5 text-xs font-medium ${trendBadgeClass(stat.trendDirection)}`}
              >
                {stat.trend}
              </span>
            ) : null}
            <span className="text-xs text-text-muted">{stat.caption}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
