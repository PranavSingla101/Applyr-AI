import Image from "next/image";

export function Testimonial() {
  return (
    <section className="w-full bg-surface border-y border-border">
      <div className="max-w-[1440px] mx-auto px-8 py-24 flex flex-col items-center text-center">
        <p className="text-2xl font-semibold text-text-primary max-w-2xl leading-relaxed">
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open
          my dashboard to see interviews waiting. It feels like cheating. Had 3
          offers on the table simultaneously.&rdquo;
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Image
            src="/images/user-icon.png"
            alt="Alex M."
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-text-primary">Alex M.</p>
            <p className="text-sm font-medium text-text-muted">
              Senior Frontend Engineer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
