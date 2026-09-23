"use client";

import Image from "next/image";
import dashboardShot from "@/public/Dashboard-updated.png";
import Link from "next/link";
import posthog from "posthog-js";
import { ArrowRight, Building2, Check } from "lucide-react";
import { MatchScoreBar } from "@/components/find-jobs/MatchScoreBar";

const TRUST_POINTS = [
  "Sign in with Google or GitHub",
  "Live listings from Adzuna",
  "Company research in one click",
];

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-surface">
      {/* Pastel glow + faded dot grid behind the copy */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[8%] h-[460px] w-[560px] rounded-full bg-accent-light blur-[110px]" />
        <div className="absolute -top-16 right-[6%] h-[420px] w-[600px] rounded-full bg-info-light blur-[110px]" />
        <div className="absolute top-40 left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-accent opacity-10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 pt-20 sm:px-8 sm:pt-28 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-surface border border-accent-light rounded-full pl-1 pr-3 py-1 mb-8 shadow-[0px_1px_2px_rgba(16,24,40,0.05)]">
          <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
            New
          </span>
          <span className="text-xs font-medium text-text-dark">
            AI-powered job search, scoring &amp; research
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-4xl text-[40px] leading-[44px] sm:text-[60px] sm:leading-[64px] lg:text-[72px] lg:leading-[76px] font-bold tracking-[-0.035em] text-text-primary">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-text-secondary">
          Find jobs that fit your skills, get AI match scores, research
          companies in seconds, and apply — all from one dashboard.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/login"
            onClick={() => posthog.capture("hero_cta_clicked", { cta_text: "Get Started" })}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-text-primary px-6 py-3 text-sm font-medium text-accent-foreground shadow-[0px_8px_20px_-6px_rgba(16,24,40,0.45)] transition-opacity hover:opacity-90 sm:w-auto"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            onClick={() => posthog.capture("hero_cta_clicked", { cta_text: "Find Your First Match" })}
            className="inline-flex w-full items-center justify-center rounded-md border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary shadow-[0px_1px_2px_rgba(16,24,40,0.05)] transition-colors hover:bg-surface-secondary sm:w-auto"
          >
            Find Your First Match
          </Link>
        </div>

        {/* Trust row */}
        <ul className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-2 text-sm text-text-secondary">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-lightest">
                <Check className="h-3 w-3 text-success-darker" strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>

        {/* Dashboard screenshot with floating detail cards */}
        <div className="relative mt-16 w-full max-w-5xl">
          <div className="pointer-events-none absolute inset-x-12 -top-6 bottom-0 rounded-full bg-accent opacity-20 blur-[90px]" />

          <div className="relative rounded-t-2xl border border-b-0 border-border bg-surface-secondary p-2 pb-0 shadow-[0px_24px_60px_-12px_rgba(16,24,40,0.25)]">
            <div className="overflow-hidden rounded-t-xl border border-b-0 border-border">
              <Image
                src={dashboardShot}
                alt="Applyr dashboard"
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="w-full h-auto"
                preload
              />
            </div>
          </div>

          <div className="absolute -left-20 top-28 hidden w-[260px] rounded-2xl border border-border bg-surface p-4 text-left shadow-[0px_16px_40px_-12px_rgba(16,24,40,0.3)] xl:block">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-text-secondary">Match score</p>
              <span className="rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
                High Match
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-text-primary">Senior Frontend Engineer</p>
            <p className="text-xs text-text-muted">Lumen Labs · Remote</p>
            <div className="mt-3">
              <MatchScoreBar score={92} />
            </div>
          </div>

          <div className="absolute -right-16 top-64 hidden w-[240px] rounded-2xl border border-border bg-surface p-4 text-left shadow-[0px_16px_40px_-12px_rgba(16,24,40,0.3)] xl:block">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-info-lightest">
                <Building2 className="h-4 w-4 text-info-dark" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Stripe researched</p>
                <p className="text-xs text-text-muted">Just now</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Tech stack", "Culture", "Interview prep"].map((tag) => (
                <span key={tag} className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
