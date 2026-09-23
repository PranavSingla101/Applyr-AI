"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { ArrowRight } from "lucide-react";

const STEPS = ["Build your profile", "Upload your resume", "Get matched to jobs"];

export function BottomCTA() {
  return (
    <section id="get-started" className="scroll-mt-24 w-full bg-surface">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-overlay px-6 py-16 sm:px-12 sm:py-24">
          {/* Dot grid + ambient glows */}
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(var(--color-text-slate)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="pointer-events-none absolute -top-48 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent opacity-40 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-56 -right-24 h-[380px] w-[380px] rounded-full bg-info opacity-20 blur-[140px]" />

          <div className="relative flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-text-slate bg-text-black px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-surface">Ready when you are</span>
            </div>

            <h2 className="mt-6 max-w-2xl text-[32px] font-semibold leading-[40px] tracking-tight text-surface sm:text-[44px] sm:leading-[52px]">
              Your next job search can feel a lot less overwhelming
            </h2>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-muted">
              Set up your profile, upload your resume, and start finding jobs that
              actually fit you — in minutes.
            </p>

            <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/login"
                onClick={() => posthog.capture("bottom_cta_clicked", { cta_text: "Get Started" })}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-[0px_8px_24px_-6px_var(--color-accent)] transition-colors hover:bg-accent-dark sm:w-auto"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                onClick={() => posthog.capture("bottom_cta_clicked", { cta_text: "Find Your First Match" })}
                className="inline-flex w-full items-center justify-center rounded-md border border-text-slate bg-text-black px-6 py-3 text-sm font-medium text-surface transition-colors hover:border-text-slate-medium sm:w-auto"
              >
                Find Your First Match
              </Link>
            </div>

            <ol className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
              {STEPS.map((step, index) => (
                <li key={step} className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-text-slate bg-text-black text-xs font-medium text-surface">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
