"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import applyrLogo from "@/public/Applyr-AI-Logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSessionUser } from "@/lib/insforge-client";
import posthog from "posthog-js";

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

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Find Jobs", href: "/find-jobs" },
    { name: "Profile", href: "/profile" },
  ];

  const showAuthLinks = isAuthenticated === true;

  return (
    <header className="w-full bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={applyrLogo}
            alt="Applyr AI"
            sizes="48px"
            className="h-10 w-auto"
            preload
          />
        </Link>

        {showAuthLinks && (
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? "text-accent"
                      : "text-text-dark hover:text-accent"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {showAuthLinks ? (
            <button
              onClick={handleSignOut}
              className="border border-border text-text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => posthog.capture("navbar_get_started_clicked")}
              className="bg-text-primary text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
