"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { insforge } from "@/lib/insforge-client";

export function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await insforge.auth.getCurrentUser();
      setIsAuthenticated(data?.user !== null);
    };
    
    checkAuth();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await insforge.auth.signOut();
      setIsAuthenticated(false);
      window.location.href = "/";
    } catch (err) {
      console.error("[Navbar/signOut]", err);
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Find Jobs", href: "/find-jobs" },
    { name: "Profile", href: "/profile" },
  ];

  // While checking auth, read the cookie synchronously to avoid flickering
  const hasTokenCookie = typeof document !== "undefined" && document.cookie.includes("insforge_access_token");
  const showAuthLinks = isAuthenticated !== null ? isAuthenticated : hasTokenCookie;

  return (
    <header className="w-full bg-surface border-b border-border sticky top-0 z-50">
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
