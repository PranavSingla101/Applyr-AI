"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

const ShieldIcon = () => (
  <svg className="h-3.5 w-3.5 text-accent" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1.333L2 4v4c0 3.317 2.547 6.413 6 7.333C11.453 14.413 14 11.317 14 8V4L8 1.333z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
    <path d="M5.5 8l1.75 1.75L10.5 6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlDetail = searchParams.get("detail");
  const [error, setError] = useState<string | null>(
    urlError ? (urlDetail ? `${urlError}: ${urlDetail}` : urlError) : null
  );

  const handleLogin = (provider: "google" | "github") => {
    setLoading(provider);
    setError(null);
    posthog.capture("login_provider_selected", { provider });
    const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
    const url = `/api/auth/login?provider=${provider}&redirectTo=${encodeURIComponent(redirectTo)}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="w-full bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/Applyr-AI-Logo.png"
              alt="Applyr AI"
              width={100}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Dashboard", "Find Jobs", "Profile"].map((name) => (
              <Link
                key={name}
                href={`/${name.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-text-dark hover:text-accent transition-colors"
              >
                {name}
              </Link>
            ))}
          </nav>

          <Link
            href="/login"
            className="bg-text-primary text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start for free
          </Link>
        </div>
      </header>

      {/* Page body */}
      <div className="flex-1 flex items-center justify-center p-6">
      {/* Floating card panel */}
      <div className="w-full max-w-[960px] flex rounded-2xl border border-border overflow-hidden shadow-[0px_4px_32px_rgba(0,0,0,0.08)]">

        {/* Left panel — marketing copy */}
        <div className="hidden lg:flex flex-1 flex-col bg-background relative overflow-hidden p-10">
          {/* Ambient glow */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] left-[-15%] w-[400px] h-[400px] bg-info/6 blur-[100px] rounded-full pointer-events-none" />

          {/* Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-[12px] font-medium text-text-secondary shadow-sm">
              <ShieldIcon />
              OAuth secured by InsForge
            </div>
          </div>

          {/* Headline + body */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h1 className="text-[52px] leading-[1.1] font-bold text-text-primary tracking-tight">
              Sign in and let the agent prep your next application.
            </h1>
            <p className="mt-5 text-[15px] leading-[26px] text-text-secondary">
              Connect with Google or GitHub to start building your profile, matching jobs, and creating tailored application materials.
            </p>
          </div>

          {/* Footnote */}
          <p className="relative z-10 text-[13px] text-text-muted">
            New users are routed to profile setup after sign-in.
          </p>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-border" />

        {/* Right panel — auth form */}
        <div className="w-full lg:w-[400px] bg-surface flex flex-col items-center justify-center p-10">
          <div className="w-full max-w-[300px]">
            <p className="text-[13px] text-text-secondary mb-1">Welcome to</p>
            <h2 className="text-[30px] font-bold text-text-primary tracking-tight mb-1.5">Applyr</h2>
            <p className="text-[14px] text-text-secondary mb-8">
              Choose your preferred provider to continue.
            </p>

            {error && (
              <div className="mb-5 p-3.5 bg-error/10 border border-error/20 text-error rounded-lg text-[13px] text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => handleLogin("google")}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg bg-surface text-[14px] font-medium text-text-primary hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 cursor-pointer"
              >
                <GoogleIcon />
                {loading === "google" ? "Connecting…" : "Continue with Google"}
              </button>

              <button
                onClick={() => handleLogin("github")}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg bg-surface text-[14px] font-medium text-text-primary hover:bg-surface-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50 cursor-pointer"
              >
                <GithubIcon />
                {loading === "github" ? "Connecting…" : "Continue with GitHub"}
              </button>
            </div>

            <p className="mt-8 text-[12px] text-text-muted text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
