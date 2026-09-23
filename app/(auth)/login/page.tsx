"use client";

import { Suspense, useState, type ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Gauge,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MatchScoreBar } from "@/components/find-jobs/MatchScoreBar";
import { activityDotClasses, type ActivityTone } from "@/lib/dashboard";
import { Logo } from "@/components/layout/Logo";

type Provider = "google" | "github";

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg className="h-5 w-5 shrink-0 fill-current text-text-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const PROVIDERS: { id: Provider; label: string; Icon: ComponentType }[] = [
  { id: "google", label: "Continue with Google", Icon: GoogleIcon },
  { id: "github", label: "Continue with GitHub", Icon: GithubIcon },
];

// Illustrative agent feed for the showcase panel — static copy, not user data.
const PREVIEW_ACTIVITY: { title: string; meta: string; tone: ActivityTone }[] = [
  { title: "Found 24 new roles for you", meta: "Job discovery · just now", tone: "success" },
  { title: "Scored 18 matches above 70%", meta: "AI match scoring · 1m ago", tone: "accent" },
  { title: "Researched Lumen Labs", meta: "Company research · 3m ago", tone: "info" },
];

const FEATURES = [
  { label: "Job discovery", Icon: Search },
  { label: "AI match scores", Icon: Gauge },
  { label: "Company research", Icon: Building2 },
];

/**
 * The callback route redirects here with provider/SDK error codes. Those are
 * logged server-side; the user only ever sees a readable sentence.
 */
function loginErrorMessage(code: string): string {
  if (code === "access_denied") {
    return "Sign-in was cancelled. Choose a provider to try again.";
  }
  return "We couldn't sign you in. Please try again.";
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState<Provider | null>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    urlError ? loginErrorMessage(urlError) : null
  );

  const handleLogin = (provider: Provider) => {
    setLoading(provider);
    setError(null);
    posthog.capture("login_provider_selected", { provider });
    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
    const url = `/api/auth/login?provider=${provider}&redirectTo=${encodeURIComponent(redirectTo)}`;
    window.location.assign(url);
  };

  return (
    <main className="min-h-screen w-full bg-surface grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Left column — auth form */}
      <section className="flex flex-col px-6 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Logo preload />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-[380px]">
            <div className="inline-flex items-center gap-2 bg-accent-muted border border-accent-light rounded-full px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">AI job-hunting agent</span>
            </div>

            <h1 className="text-[32px] leading-[40px] font-semibold tracking-tight text-text-primary">
              Welcome to Applyr
            </h1>
            <p className="mt-2 text-[15px] leading-6 text-text-secondary">
              Sign in to pick up where your agent left off, or create an account in one click.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-lg border border-error bg-error-light px-3.5 py-3 text-[13px] leading-5 text-error"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-8 space-y-3">
              {PROVIDERS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleLogin(id)}
                  disabled={loading !== null}
                  className="group relative w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface text-[14px] font-medium text-text-primary shadow-[0px_1px_2px_rgba(16,24,40,0.05)] hover:border-border-muted hover:bg-surface-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {loading === id ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-text-secondary" />
                  ) : (
                    <Icon />
                  )}
                  {loading === id ? "Redirecting…" : label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured with OAuth by InsForge
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface-secondary p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-light">
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">New to Applyr?</p>
                <p className="mt-0.5 text-[13px] leading-5 text-text-secondary">
                  We&apos;ll set up your account and walk you through your profile so
                  your matches are accurate from day one.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-text-muted">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </section>

      {/* Right column — product showcase */}
      <aside className="hidden lg:block p-3">
        <div className="relative h-full min-h-[680px] overflow-hidden rounded-3xl bg-overlay flex flex-col justify-between p-12 xl:p-14">
          {/* Dot grid + ambient glows */}
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(var(--color-text-slate)_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="pointer-events-none absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full bg-accent opacity-30 blur-[140px]" />
          <div className="pointer-events-none absolute -bottom-48 -left-24 h-[420px] w-[420px] rounded-full bg-info opacity-20 blur-[140px]" />

          <div className="relative inline-flex w-fit items-center gap-2 rounded-full border border-text-slate bg-text-black px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-xs font-medium text-surface">Agent is working while you sleep</span>
          </div>

          {/* Mock product cards */}
          <div className="relative mx-auto w-full max-w-[460px] py-10">
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0px_24px_60px_-12px_rgba(0,0,0,0.55)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-light text-sm font-semibold text-accent">
                    LL
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Senior Frontend Engineer</p>
                    <p className="text-xs text-text-muted">Lumen Labs · Remote · $150k–$180k</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
                  High Match
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">Match score</span>
                <MatchScoreBar score={92} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["React", "TypeScript", "Next.js"].map((skill) => (
                  <span key={skill} className="rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
                    {skill}
                  </span>
                ))}
                <span className="rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
                  GraphQL
                </span>
              </div>
            </div>

            <div className="relative -mt-4 ml-auto -mr-6 w-[300px] rounded-2xl border border-border bg-surface p-4 shadow-[0px_24px_60px_-12px_rgba(0,0,0,0.55)]">
              <p className="mb-3 text-xs font-medium text-text-secondary">Agent activity</p>
              <ul className="space-y-3">
                {PREVIEW_ACTIVITY.map((entry) => {
                  const { ring, dot } = activityDotClasses(entry.tone);
                  return (
                    <li key={entry.title} className="flex items-start gap-3">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${ring}`}>
                        <span className={`h-2 w-2 rounded-full ${dot}`} />
                      </span>
                      <div>
                        <p className="text-[13px] font-medium leading-5 text-text-primary">{entry.title}</p>
                        <p className="text-xs text-text-muted">{entry.meta}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative">
            <h2 className="max-w-[440px] text-[34px] font-semibold leading-[42px] tracking-tight text-surface">
              Let the agent do the busywork. You focus on the interviews.
            </h2>
            <p className="mt-4 max-w-[440px] text-[15px] leading-6 text-text-muted">
              Applyr finds roles that fit, scores every match against your profile, and
              researches the company before you apply.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              {FEATURES.map(({ label, Icon }) => (
                <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-surface">
                  <Icon className="h-4 w-4 text-accent" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
