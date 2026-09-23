"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  LayoutGrid,
  LogOut,
  Search,
  UserRound,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { getSessionUser } from "@/lib/insforge-client";
import posthog from "posthog-js";
import { Logo } from "@/components/layout/Logo";
import { MARKETING_LINKS } from "@/lib/navigation";

const APP_NAV = [
  { name: "Dashboard", href: "/dashboard", Icon: LayoutGrid },
  { name: "Find Jobs", href: "/find-jobs", Icon: Search },
  { name: "Profile", href: "/profile", Icon: UserRound },
];


function subscribeToAuthChanges(onStoreChange: () => void): () => void {
  window.addEventListener("applyr-auth-changed", onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("applyr-auth-changed", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getAuthSnapshot(): boolean {
  return getSessionUser() !== null;
}

function getServerAuthSnapshot(): boolean {
  return false;
}

export function Navbar() {
  const pathname = usePathname();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthChanges,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );

  useEffect(() => {
    const user = getSessionUser();
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
      });
    }
  }, [isAuthenticated, pathname]);

  const handleSignOut = async () => {
    try {
      posthog.capture("user_signed_out");
      posthog.reset();
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Sign out request failed");
      }
      window.dispatchEvent(new Event("applyr-auth-changed"));
      window.location.href = "/";
    } catch (err) {
      posthog.captureException(err);
      console.error("[Navbar/signOut]", err);
    }
  };

  const showAuthLinks = isAuthenticated === true;

  return (
    <header className="w-full sticky top-0 z-50 border-b border-border bg-[color:color-mix(in_srgb,var(--color-surface)_85%,transparent)] backdrop-blur-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center">
          <Logo preload />
        </div>

        {showAuthLinks ? (
          <nav className="flex items-center gap-1">
            {APP_NAV.map(({ name, href, Icon }) => {
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={name}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-accent"
                      : "text-text-dark hover:text-accent hover:bg-surface-secondary"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{name}</span>
                </Link>
              );
            })}
          </nav>
        ) : (
          // Logged-out visitors get homepage section anchors instead of app
          // links they can't open yet.
          <nav className="hidden md:flex items-center gap-1">
            {MARKETING_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-text-dark hover:text-text-primary hover:bg-surface-secondary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="col-start-3 flex items-center justify-end gap-2">
          {showAuthLinks ? (
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="inline-flex items-center gap-2 border border-border text-text-primary px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0 sm:hidden" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-md px-3 py-2 text-sm font-medium text-text-dark hover:text-text-primary hover:bg-surface-secondary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                onClick={() => posthog.capture("navbar_get_started_clicked")}
                className="group inline-flex items-center gap-1.5 bg-text-primary text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
