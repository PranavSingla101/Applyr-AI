import {
  BookOpen,
  Building2,
  Compass,
  Layers,
  Link2,
  MessageCircleQuestion,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ResearchButton } from "@/components/job-details/ResearchButton";
import type { CompanyResearch as CompanyResearchDossier } from "@/lib/jobs";

type Props = {
  jobId: string;
  company: string;
  research: CompanyResearchDossier | null;
};

/**
 * Tones are deliberately few. `ui-rules.md` keeps colour out of card surfaces,
 * so it lives in the icon chip alone: green marks what the candidate already has
 * going for them, blue what they should ask, purple everything else.
 */
type Tone = "accent" | "success" | "info";

const TONE_CHIP: Record<Tone, string> = {
  accent: "bg-accent-muted text-accent",
  success: "bg-success-light text-success-darker",
  info: "bg-info-light text-info-dark",
};

const SECTION_LABEL_CLASSES =
  "text-xs font-medium uppercase tracking-wide text-text-secondary";

type Section = {
  title: string;
  icon: LucideIcon;
  tone: Tone;
  items: string[];
};

function SectionPanel({ title, icon: Icon, tone, items }: Section) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface-secondary p-5">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${TONE_CHIP[tone]}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-6 text-text-dark">
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompanyResearch({ jobId, company, research }: Props) {
  // Only sections with content become panels — an empty "Culture" heading with
  // nothing under it reads as a bug, not as an absence.
  const sections: Section[] = research
    ? (
        [
          { title: "Your Edge", icon: Sparkles, tone: "success", items: research.yourEdge },
          {
            title: "Gaps to Address",
            icon: TrendingUp,
            tone: "accent",
            items: research.gapsToAddress,
          },
          {
            title: "Smart Questions",
            icon: MessageCircleQuestion,
            tone: "info",
            items: research.smartQuestions,
          },
          {
            title: "Interview Prep",
            icon: BookOpen,
            tone: "accent",
            items: research.interviewPrep,
          },
          { title: "Culture", icon: Users, tone: "accent", items: research.culture },
        ] satisfies { title: string; icon: LucideIcon; tone: Tone; items?: string[] }[]
      )
        .filter((section): section is Section => Boolean(section.items?.length))
    : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-muted text-accent">
            <Building2 className="h-4 w-4" />
          </span>
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>
        <ResearchButton jobId={jobId} hasResearch={research !== null} />
      </div>

      <div className="border-t border-border px-6 py-8">
        {research ? (
          <div className="flex flex-col gap-8">
            {research.companyOverview ? (
              <div className="flex flex-col gap-2">
                <h3 className={SECTION_LABEL_CLASSES}>Overview</h3>
                <p className="text-base leading-7 text-text-primary">
                  {research.companyOverview}
                </p>
              </div>
            ) : null}

            {research.whyThisRole ? (
              <div className="flex gap-3 rounded-xl border border-border bg-accent-muted p-5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Compass className="h-3.5 w-3.5" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Why This Role
                  </h3>
                  <p className="text-sm leading-6 text-text-dark">
                    {research.whyThisRole}
                  </p>
                </div>
              </div>
            ) : null}

            {research.techStack && research.techStack.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-text-secondary" />
                  <h3 className={SECTION_LABEL_CLASSES}>Tech Stack</h3>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {research.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {sections.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {sections.map((section, index) => (
                  <div
                    key={section.title}
                    // An odd number of panels would otherwise leave a hole in the
                    // last row — the final panel spans both columns instead.
                    className={
                      sections.length % 2 === 1 && index === sections.length - 1
                        ? "lg:col-span-2"
                        : undefined
                    }
                  >
                    <SectionPanel {...section} />
                  </div>
                ))}
              </div>
            ) : null}

            {research.sources && research.sources.length > 0 ? (
              <div className="flex flex-col gap-3 border-t border-border pt-6">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3.5 w-3.5 text-text-secondary" />
                  <h3 className={SECTION_LABEL_CLASSES}>Sources</h3>
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {research.sources.map((source) => {
                    const isLink = /^https?:\/\//i.test(source);
                    return (
                      <li key={source} className="max-w-full">
                        {isLink ? (
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-xs text-text-muted underline-offset-2 hover:text-accent hover:underline"
                          >
                            {source.replace(/^https?:\/\//i, "")}
                          </a>
                        ) : (
                          // Synthesis-only runs cite the job posting and profile,
                          // which are not URLs — rendering them as dead links lies.
                          <span className="block truncate text-xs text-text-muted">
                            {source}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary">
              <Building2 className="h-5 w-5 text-text-muted" />
            </span>
            <p className="text-sm font-medium text-text-primary">No research yet</p>
            <p className="max-w-sm text-sm text-text-muted">
              Click &ldquo;Research Company&rdquo; to let the AI browse {company}&apos;s
              public pages and build a dossier.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
