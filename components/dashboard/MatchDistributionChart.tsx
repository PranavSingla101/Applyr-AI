"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CHART_BAR_CURSOR,
  CHART_GRID_COLOR,
  CHART_GRID_DASH,
  CHART_MARGIN,
  CHART_TICK,
  niceAxis,
} from "@/lib/chartTheme";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import type { ChartPoint } from "@/lib/dashboard";

type Props = {
  data: ChartPoint[];
};

export function MatchDistributionChart({ data }: Props) {
  const axis = niceAxis(Math.max(...data.map((point) => point.value)));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={CHART_MARGIN} barCategoryGap="25%">
        <CartesianGrid
          vertical={false}
          strokeDasharray={CHART_GRID_DASH}
          stroke={CHART_GRID_COLOR}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={CHART_TICK}
          tickMargin={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={CHART_TICK}
          width={40}
          domain={axis.domain}
          ticks={axis.ticks}
        />
        <Tooltip
          cursor={CHART_BAR_CURSOR}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              label={props.label}
              payload={props.payload}
              unit={{ one: "job", many: "jobs" }}
              tone="success"
            />
          )}
        />
        <Bar dataKey="value" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={56} />
      </BarChart>
    </ResponsiveContainer>
  );
}
