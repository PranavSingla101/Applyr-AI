import { Activity } from "lucide-react";
import { activityDotClasses, type ActivityEntry } from "@/lib/dashboard";

type Props = {
  entries: ActivityEntry[];
};

export function RecentActivity({ entries }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="px-6 py-5">
        <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border px-6 py-16 text-center">
          <Activity className="h-5 w-5 text-text-muted" />
          <p className="text-sm text-text-muted">
            No activity yet — run a job search to get started.
          </p>
        </div>
      ) : (
        <ul className="flex-1 border-t border-border px-6 py-6">
          {entries.map((entry, index) => {
            const { ring, dot } = activityDotClasses(entry.tone);
            const isLast = index === entries.length - 1;

            return (
              <li key={entry.id} className="flex gap-4 pb-10 last:pb-0">
                {/* Timeline rail: a short stub above every dot, and a run down
                    to the next one for every entry except the last. */}
                <div className="flex w-4 shrink-0 flex-col items-center">
                  <span className="h-2 w-px bg-border" />
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${ring}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                  </span>
                  {isLast ? null : <span className="w-px flex-1 bg-border" />}
                </div>

                <div className="pt-0.5">
                  <p className="text-sm font-medium text-text-primary">{entry.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{entry.timestamp}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
