"use client";

import Link from "next/link";
import posthog from "posthog-js";

export function BottomCTA() {
  return (
    <section
      className="w-full"
      style={{
        background:
          "linear-gradient(135deg, var(--color-accent) 0%, var(--color-overlay) 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-8 py-24 flex flex-col items-center text-center gap-6">
        {/* Logo mark */}
        <p className="text-xl font-bold text-white mb-2">Applyr AI</p>

        <h2 className="text-4xl font-bold leading-tight text-white max-w-xl">
          Your next job search can feel a lot less overwhelming
        </h2>

        <p className="text-base font-medium text-white/70 max-w-md leading-relaxed">
          Set up your profile, upload your resume, and start finding jobs that
          actually fit you — in minutes.
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Link
            href="/login"
            onClick={() => posthog.capture("bottom_cta_clicked", { cta_text: "Get Started" })}
            className="bg-white text-text-primary px-5 py-2.5 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            onClick={() => posthog.capture("bottom_cta_clicked", { cta_text: "Find Your First Match" })}
            className="bg-white/10 text-white border border-white/20 px-5 py-2.5 rounded-md text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Find Your First Match
          </Link>
        </div>
      </div>
    </section>
  );
}
