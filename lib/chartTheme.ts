// Shared recharts styling for the dashboard charts. Recharts sets SVG
// presentation attributes rather than classes, so colours are passed as
// `var(--color-*)` references — never literal hex — per `ui-tokens.md`.

export const CHART_AXIS_COLOR = "var(--color-chart-axis)";
export const CHART_GRID_COLOR = "var(--color-border)";

export const CHART_TICK = {
  fill: CHART_AXIS_COLOR,
  fontSize: 12,
} as const;

export const CHART_GRID_DASH = "4 4";

/** Recharts needs explicit room for tick labels; the mock has no axis lines. */
export const CHART_MARGIN = { top: 8, right: 8, bottom: 0, left: 0 } as const;

/**
 * One colour per chart. The series and its tooltip read the same entry, so the
 * dot in the tooltip can never disagree with the bar it is describing.
 */
export type ChartTone = "accent" | "info" | "success";

export const CHART_TONE_COLOR: Record<ChartTone, string> = {
  accent: "var(--color-accent)",
  info: "var(--color-info)",
  success: "var(--color-success)",
};

/** Hover cursor behind a bar — a soft column, not recharts' default grey. */
export const CHART_BAR_CURSOR = { fill: "var(--color-surface-secondary)" } as const;

/** Hover cursor on the area chart — the vertical rule the design's grid implies. */
export const CHART_LINE_CURSOR = {
  stroke: CHART_GRID_COLOR,
  strokeWidth: 1,
} as const;

/**
 * The design's axes run 0/3/6/9/12 and 0/25/50/75/100 — four intervals up to a
 * round number. Real data cannot be hardcoded that way (a busy day would clip
 * the bars), so the same shape is computed: four intervals, each a "nice" step.
 */
const NICE_STEPS = [1, 2, 3, 5, 10, 15, 20, 25, 50, 100];
const AXIS_INTERVALS = 4;

export function niceAxis(maxValue: number): {
  domain: [number, number];
  ticks: number[];
} {
  const target = Math.max(maxValue, 1) / AXIS_INTERVALS;

  // Walk the nice steps at increasing powers of ten until one covers `target`.
  let step = NICE_STEPS[NICE_STEPS.length - 1];
  outer: for (let power = 0; power < 8; power += 1) {
    const scale = 10 ** power;
    for (const candidate of NICE_STEPS) {
      if (candidate * scale >= target) {
        step = candidate * scale;
        break outer;
      }
    }
  }

  const ticks = Array.from({ length: AXIS_INTERVALS + 1 }, (_, i) => i * step);
  return { domain: [0, ticks[ticks.length - 1]], ticks };
}
