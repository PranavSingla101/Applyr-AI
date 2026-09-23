import Image from "next/image";
import Link from "next/link";
import applyrMark from "@/public/applyr-mark.png";

type Props = {
  /** Preload the mark when the logo is above the fold (navbar). */
  preload?: boolean;
  /** Wordmark color on dark surfaces. */
  tone?: "light" | "dark";
};

/**
 * Brand lockup: the transparent "A" mark cut from Applyr-AI-Logo.png plus a live
 * text wordmark, so it stays crisp at 32px and works on any background.
 */
export function Logo({ preload = false, tone = "dark" }: Props) {
  return (
    <Link href="/" aria-label="Applyr AI home" className="inline-flex items-center gap-2">
      <Image
        src={applyrMark}
        alt=""
        sizes="40px"
        className="h-7 w-auto"
        preload={preload}
      />
      <span
        className={`text-[19px] font-bold leading-7 tracking-tight ${
          tone === "light" ? "text-surface" : "text-text-darkest"
        }`}
      >
        Applyr<span className="text-accent"> AI</span>
      </span>
    </Link>
  );
}
