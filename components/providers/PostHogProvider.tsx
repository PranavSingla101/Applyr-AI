"use client";

import { useEffect } from "react";
import { initPostHog } from "@/lib/posthog-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize in production or if keys are configured
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      initPostHog();
    }
  }, []);

  return <>{children}</>;
}
