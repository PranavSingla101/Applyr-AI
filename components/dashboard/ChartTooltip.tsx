"use client";

import type { TooltipContentProps } from "recharts";
import { CHART_TONE_COLOR, type ChartTone } from "@/lib/chartTheme";

type Props = Pick<TooltipContentProps<number, string>, "active" | "label" | "payload"> & {
  /** Noun for the plotted value, in both forms — "1 job", "9 jobs". */
  unit: { one: string; many: string };
  tone: ChartTone;
};

/**
 * Hover card for all three charts. Recharts' default content renders the raw
 * dataKey ("count : 30") in its own inline styles, which neither reads well nor
 * respects the design tokens — this replaces it entirely.
 */
export function ChartTooltip({ active, label, payload, unit, tone }: Props) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0].value;
  if (typeof value !== "number") {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1.5 text-sm">
        <span className="font-semibold" style={{ color: CHART_TONE_COLOR[tone] }}>
          {value}
        </span>
        <span className="text-text-secondary">
          {value === 1 ? unit.one : unit.many}
        </span>
      </p>
    </div>
  );
}
