import type { AdzunaJob } from "./types";

const RESULTS_PER_PAGE = 10;

/**
 * Adzuna runs a separate API per country. The location box is free text, so
 * this is a keyword heuristic over the countries the project supports — not a
 * geocoder. Anything unrecognised falls back to 'us'.
 */
const COUNTRY_KEYWORDS: { country: string; terms: string[] }[] = [
  {
    country: "gb",
    terms: ["uk", "united kingdom", "england", "scotland", "wales", "london", "manchester", "birmingham", "edinburgh", "glasgow", "bristol", "leeds"],
  },
  {
    country: "au",
    terms: ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide", "canberra"],
  },
  {
    country: "ca",
    terms: ["canada", "toronto", "vancouver", "montreal", "ottawa", "calgary", "edmonton"],
  },
];

export function detectCountry(location: string): string {
  const haystack = location.toLowerCase();
  for (const { country, terms } of COUNTRY_KEYWORDS) {
    if (terms.some((term) => new RegExp(`\\b${term}\\b`).test(haystack))) {
      return country;
    }
  }
  return "us";
}

/** Formats Adzuna's numeric salary range as the "$160k - $200k" display string. */
export function formatSalary(job: AdzunaJob): string | null {
  const { salary_min: min, salary_max: max } = job;
  if (!min && !max) {
    return null;
  }
  const toK = (value: number) => `$${Math.round(value / 1000)}k`;
  if (min && max && min !== max) {
    return `${toK(min)} - ${toK(max)}`;
  }
  return toK((min ?? max)!);
}

export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs", // never search Adzuna without this filter
    results_per_page: String(RESULTS_PER_PAGE),
    "content-type": "application/json",
  });

  // Omit `where` entirely when no location was given — never send it empty.
  if (location.trim()) {
    params.set("where", location.trim());
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.results as AdzunaJob[]) ?? [];
}
