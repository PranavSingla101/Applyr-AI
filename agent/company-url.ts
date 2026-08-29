import type { CompanyLink, ResearchJob, SubPageKind } from "./types";

/** The free plan allows a handful of pages per session — this is the ceiling. */
const MAX_SUB_PAGES = 3;

/**
 * Careers pages are mostly boilerplate benefits copy; the pages that tell a
 * candidate something real come first, and careers is the fallback.
 */
const SUB_PAGE_PRIORITY: SubPageKind[] = [
  "about",
  "engineering",
  "blog",
  "product",
  "team",
  "careers",
  "other",
];

/**
 * Hosts whose registrable domain is three labels, not two — without these,
 * `jobs.example.co.uk` would be stripped to the meaningless `co.uk`.
 */
const MULTI_PART_TLDS = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.au",
  "net.au",
  "org.au",
  "co.nz",
  "co.za",
  "com.br",
  "co.in",
  "co.jp",
]);

/** Reduces `jobs.stripe.com` to `stripe.com` so we land on the employer, not their ATS. */
export function rootDomain(hostname: string): string {
  const labels = hostname.replace(/^www\./i, "").split(".");
  if (labels.length <= 2) {
    return labels.join(".");
  }
  const lastTwo = labels.slice(-2).join(".");
  return MULTI_PART_TLDS.has(lastTwo)
    ? labels.slice(-3).join(".")
    : lastTwo;
}

/** Best-effort slug of a company name, for the fallback URL. */
function companySlug(company: string): string {
  return company
    // Repeated so "Acme Corp Inc." loses both suffixes, not just the last one.
    .replace(/(\s*\b(Inc|LLC|Ltd|Limited|Corp|Corporation|Co|GmbH|PLC)\b\.?\s*,?\s*)+$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * The guessed homepage, used when the redirect chain cannot be resolved.
 * A guess, not a fact — `https://www.{slug}.com` is right for US-style company
 * names and wrong for everyone else.
 */
export function fallbackHomepageUrl(job: ResearchJob): string | null {
  return job.company ? `https://www.${companySlug(job.company)}.com` : null;
}

/** The tracking URL the browser should follow to find the employer's real site. */
export function redirectUrlFor(job: ResearchJob): string | null {
  return job.external_apply_url ?? job.source_url;
}

/**
 * Turns the URL the browser actually landed on into the employer's homepage.
 * Returns null while still on the aggregator — the chain never got there.
 *
 * Resolution has to happen *in the browser*: Adzuna answers a server-side
 * `fetch` with 403 no matter what headers it carries (bot protection on
 * datacenter IPs), so the redirect chain is only followable from a real browser.
 */
export function homepageFromLandedUrl(landedUrl: string): string | null {
  let resolved: URL;
  try {
    resolved = new URL(landedUrl);
  } catch {
    return null;
  }

  if (/adzuna\./i.test(resolved.hostname)) {
    return null;
  }

  return `https://${rootDomain(resolved.hostname)}`;
}

/**
 * Classifies a link by its own URL rather than asking the model to. Stagehand
 * returns internal element ids in place of hrefs when a schema asks it for a
 * "url", so the links come from the DOM — and once we have the href, a keyword
 * match is both cheaper and steadier than a model's guess.
 */
export function classifyLink(url: string): SubPageKind {
  const path = url.toLowerCase();
  if (/\/(about|company|who-we-are|our-story|mission)(\/|$|\?|#)/.test(path)) return "about";
  if (/\/(engineering|developers?|tech|技術|docs?)(\/|$|\?|#)/.test(path)) return "engineering";
  if (/\/(blog|news|insights|articles?)(\/|$|\?|#)/.test(path)) return "blog";
  if (/\/(products?|platform|solutions?|features?|services?)(\/|$|\?|#)/.test(path)) return "product";
  if (/\/(team|people|leadership|founders?)(\/|$|\?|#)/.test(path)) return "team";
  if (/\/(careers?|jobs?|hiring|join-us)(\/|$|\?|#)/.test(path)) return "careers";
  return "other";
}

/**
 * Turns the URLs in a page snapshot into classified, same-origin candidates.
 *
 * The URLs come from `page.snapshot().urlMap`, not from the model: asked for a
 * "url" in an extract schema, Stagehand answers with its own element ids
 * ("0-1819"), which are keys into that map rather than links. `Locator.innerHtml()`
 * is not an alternative — it throws "extension world not ready" on a fresh page.
 */
export function toCompanyLinks(urls: string[], baseUrl: string): CompanyLink[] {
  const links: CompanyLink[] = [];
  const seen = new Set<string>();
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return links;
  }

  for (const href of urls) {
    let absolute: string;
    try {
      const resolved = new URL(href, baseUrl);
      // Off-site links are someone else's website, not research on this company.
      if (resolved.hostname !== base.hostname) {
        continue;
      }
      resolved.hash = "";
      absolute = resolved.toString().replace(/\/$/, "");
    } catch {
      continue;
    }

    // Sign-up and login pages are the same boilerplate on every site.
    if (/\/(sign-in|sign-up|login|signup|register|privacy|terms|legal)(\/|$)/i.test(absolute)) {
      continue;
    }

    // A campaign-tagged link is a marketing CTA, and the same page usually also
    // appears untagged — keeping it wastes one of only three page visits.
    if (/[?&]utm_/i.test(absolute)) {
      continue;
    }

    if (absolute === baseUrl.replace(/\/$/, "") || seen.has(absolute)) {
      continue;
    }

    seen.add(absolute);
    links.push({ url: absolute, kind: classifyLink(absolute) });
  }

  return links;
}

/**
 * Picks up to three sub-pages — one per kind before taking a second of any kind,
 * so a site whose nav is mostly blog posts still yields breadth (an about page
 * and a product page) rather than three articles about the same customer.
 */
export function selectSubPages(links: CompanyLink[], homepageUrl: string): string[] {
  const seen = new Set<string>([homepageUrl.replace(/\/$/, "")]);
  const selected: string[] = [];

  for (let round = 0; round < MAX_SUB_PAGES; round += 1) {
    for (const kind of SUB_PAGE_PRIORITY) {
      if (selected.length >= MAX_SUB_PAGES) {
        return selected;
      }

      const next = links.find((link) => link.kind === kind && !seen.has(link.url));
      if (!next) {
        continue;
      }

      seen.add(next.url);
      selected.push(next.url);
    }
  }

  return selected;
}
