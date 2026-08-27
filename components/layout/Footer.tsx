import Image from "next/image";
import applyrLogo from "@/public/Applyr-AI-Logo.png";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border">
      <div className="max-w-[1440px] mx-auto px-6 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={applyrLogo}
            alt="Applyr AI"
            sizes="48px"
            className="h-10 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/find-jobs"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Profile
          </Link>
        </nav>

        <p className="text-sm text-text-muted">
          © {new Date().getFullYear()} Applyr. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
