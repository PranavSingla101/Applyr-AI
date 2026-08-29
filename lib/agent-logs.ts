import type { createInsforgeServer } from "@/lib/insforge-server";
import type { AgentLogLevel } from "@/agent/types";

type InsforgeServer = Awaited<ReturnType<typeof createInsforgeServer>>;

/**
 * Writes one row to agent_logs. Logging is best-effort observability — a failed
 * log write is reported to the console but never propagated, so it can't take
 * down the run it was only meant to describe.
 */
export async function logAgentEvent(
  insforge: InsforgeServer,
  entry: {
    runId: string;
    userId: string;
    message: string;
    level: AgentLogLevel;
    jobId?: string | null;
  },
): Promise<void> {
  try {
    const { error } = await insforge.database.from("agent_logs").insert([
      {
        run_id: entry.runId,
        user_id: entry.userId,
        message: entry.message,
        level: entry.level,
        job_id: entry.jobId ?? null,
      },
    ]);
    if (error) {
      console.error("[agent-logs] write failed:", error.message);
    }
  } catch (err) {
    console.error("[agent-logs] write threw:", err);
  }
}
