"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  CHART_GRID_COLOR,
  CHART_GRID_DASH,
  CHART_LINE_CURSOR,
  CHART_MARGIN,
  CHART_TICK,
  niceAxis,
} from "@/lib/chartTheme";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import type { ChartPoint } from "@/lib/dashboard";

type Props = {
  data: ChartPoint[];
};

const GRADIENT_ID = "jobs-found-over-time-fill";

export function JobsFoundChart({ data }: Props) {
  const axis = niceAxis(Math.max(...data.map((point) => point.value)));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
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
          cursor={CHART_LINE_CURSOR}
          content={(props) => (
            <ChartTooltip
              active={props.active}
              label={props.label}
              payload={props.payload}
              unit={{ one: "job", many: "jobs" }}
              tone="accent"
            />
          )}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-accent)"
          strokeWidth={3}
          fill={`url(#${GRADIENT_ID})`}
          dot={false}
          activeDot={{
            r: 5,
            fill: "var(--color-accent)",
            stroke: "var(--color-surface)",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
