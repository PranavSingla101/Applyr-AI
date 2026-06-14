import Image from "next/image";
import Link from "next/link";

export function Navbar() {
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
          />
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-dark hover:text-accent transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/find-jobs"
            className="text-sm font-medium text-text-dark hover:text-accent transition-colors"
          >
            Find Jobs
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-text-dark hover:text-accent transition-colors"
          >
            Profile
          </Link>
        </nav>

        <Link
          href="/login"
          className="bg-text-primary text-accent-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
