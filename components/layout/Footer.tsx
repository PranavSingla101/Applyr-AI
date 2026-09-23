import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { APP_LINKS, MARKETING_LINKS } from "@/lib/navigation";

const LINK_GROUPS = [
  { title: "Product", links: APP_LINKS },
  { title: "Explore", links: MARKETING_LINKS },
  {
    title: "Account",
    links: [
      { name: "Sign in", href: "/login" },
      { name: "Create account", href: "/login" },
    ],
  },
];

const POWERED_BY = ["Adzuna job data", "InsForge auth", "Browserbase research"];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-surface">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
              Your AI job-hunting agent. Find roles that fit, see how well you
              match, and research every company before you apply.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-text-muted">Powered by</span>
              {POWERED_BY.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-secondary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-text-primary">{group.title}</p>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Applyr. All rights reserved.
          </p>
          <a
            href="#"
            className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Back to top
            <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the page edge, closes the page. */}
      <div aria-hidden className="pointer-events-none select-none -mb-[5vw] text-center">
        <span className="block text-[22vw] font-bold leading-[0.8] tracking-[-0.06em] bg-gradient-to-b from-border to-transparent bg-clip-text text-transparent">
          Applyr
        </span>
      </div>
    </footer>
  );
}
