import Image from "next/image";

type FeatureBullet = {
  title: string;
  description: string;
};

const managementFeatures: FeatureBullet[] = [
  {
    title: "Find Jobs that Actually Fit You",
    description:
      "Enter a job title and location. Applyr searches Adzuna and scores every result against your profile — so you know which roles to prioritize.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "One click researches the company's website, tech stack, and culture. You arrive at every conversation already knowing what matters.",
  },
  {
    title: "Keep Track of Every Application",
    description:
      "Your dashboard shows every job found, every match score, and every company researched. No spreadsheets needed.",
  },
];

const confidenceFeatures: FeatureBullet[] = [
  {
    title: "Your Edge, Spelled Out",
    description:
      "See exactly which of your skills match the role and how to frame the gaps honestly. Talking points that signal you did your homework.",
  },
  {
    title: "Interview Prep Built In",
    description:
      "Smart questions to ask and topics to prepare — grounded in real research from the company's own pages, not generic advice.",
  },
];

export function Features() {
  return (
    <section className="w-full bg-background">
      <div className="max-w-[1440px] mx-auto px-8 py-24 flex flex-col gap-32">
        {/* Feature 1 — text left, image right */}
        <div className="grid grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div>
              <span className="text-xs font-medium text-accent uppercase tracking-widest">
                Job Discovery
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-snug text-text-primary">
                Manage Your Job Search
                <br />
                With Ease
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {managementFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border shadow-[0px_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
            <Image
              src="/images/jobs-lists.png"
              alt="Jobs list with AI match scores"
              width={700}
              height={480}
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Feature 2 — image left, text right */}
        <div className="grid grid-cols-2 gap-16 items-center">
          <div className="rounded-2xl border border-border shadow-[0px_4px_24px_rgba(0,0,0,0.08)] overflow-hidden">
            <Image
              src="/images/agnet-log.png"
              alt="AI agent researching companies"
              width={700}
              height={480}
              className="w-full h-auto"
            />
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <span className="text-xs font-medium text-accent uppercase tracking-widest">
                Company Research
              </span>
              <h2 className="mt-3 text-3xl font-bold leading-snug text-text-primary">
                Apply With More Confidence,
                <br />
                Every Time
              </h2>
              <p className="mt-4 text-sm font-medium text-text-secondary leading-relaxed">
                Before you click apply, Applyr hands you a complete briefing —
                company overview, tech stack, culture signals, why this role
                exists, and the questions that show you've done your homework.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {confidenceFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm font-medium text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
