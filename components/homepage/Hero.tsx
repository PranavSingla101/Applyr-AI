"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

export function Hero() {
  return (
    <section className="w-full bg-surface">
      <div className="max-w-[1440px] mx-auto px-8 pt-20 pb-0 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-accent-muted border border-accent-light rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="text-xs font-medium text-accent">
            AI-Powered Job Search
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold leading-tight text-text-primary max-w-3xl">
          Job hunting is hard.
          <br />
          Your tools shouldn&apos;t be.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base font-medium text-text-secondary max-w-xl leading-relaxed">
          Find jobs that fit your skills, get AI match scores, research
          companies in seconds, and apply — all from one dashboard.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/login"
            onClick={() => posthog.capture("hero_cta_clicked", { cta_text: "Get Started" })}
            className="bg-text-primary text-accent-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            onClick={() => posthog.capture("hero_cta_clicked", { cta_text: "Find Your First Match" })}
            className="bg-surface border border-border text-text-primary px-5 py-2.5 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors"
          >
            Find Your First Match
          </Link>
        </div>

        {/* Dashboard screenshot */}
        <div className="mt-12 w-full max-w-5xl rounded-2xl border border-border shadow-[0px_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
          <Image
            src="/Dashboard-updated.png"
            alt="Applyr dashboard"
            width={1200}
            height={720}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
