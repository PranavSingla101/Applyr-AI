import type { ReactNode } from "react";
import { ChartColumnIncreasing } from "lucide-react";

type Props = {
  title: string;
  /** When true the chart is replaced by `emptyMessage` — see `isChartEmpty()`. */
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
};

/**
 * Shared shell for the three dashboard charts. Server component on purpose —
 * only the chart it wraps is `"use client"`, so the card title and padding
 * never ship to the browser.
 */
export function ChartCard({ title, isEmpty = false, emptyMessage, children }: Props) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      <div className="mt-6 min-h-[280px] flex-1">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <ChartColumnIncreasing className="h-5 w-5 text-text-muted" />
            <p className="max-w-xs text-sm text-text-muted">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
