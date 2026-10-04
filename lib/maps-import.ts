import "server-only";

/**
 * Turns a Google Maps / Business Profile link into shop details by running
 * Apify's Google Maps Scraper (compass/crawler-google-places). Needs APIFY_API_TOKEN.
 * Typical cost is well under $0.01 per import (one place, details + up to 6 images, no reviews).
 */

const ACTOR = "compass~crawler-google-places";
const MAX_PHOTOS = 6;

export type ImportedPlace = {
  placeId: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  rating: number | null;
  reviewCount: number | null;
  businessType: string;
  mapsUrl: string;
  website: string | null;
  summary: string | null;
  photos: { uri: string; author: string | null; authorUri: string | null }[];
};

export class ImportError extends Error {}

// ── Link handling ───────────────────────────────────────────────────────────

/** Only Google's own hosts are accepted, so the scraper can't be pointed at arbitrary sites. */
function isGoogleHost(host: string) {
  return (
    /(^|\.)google\.[a-z.]{2,6}$/.test(host) ||
    ["maps.app.goo.gl", "goo.gl", "g.page", "g.co", "share.google"].includes(host)
  );
}

/** Checks the pasted text is a Google Maps / Business Profile link (no network calls). */
function parseLink(input: string): URL {
  let url: URL;
  try {
    const raw = input.trim();
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    throw new ImportError("That doesn't look like a link. Copy it from the Share button in Google Maps.");
  }
  if (!isGoogleHost(url.hostname)) throw new ImportError("Please paste a Google Maps or Google Business Profile link.");
  return url;
}

/** The link goes to the scraper as a Start URL ("search by URL"); it resolves short links itself. */
function actorInput(url: URL) {
  return {
    startUrls: [{ url: url.href }],
    language: "en",
    maxCrawledPlacesPerSearch: 1,
    scrapePlaceDetailPage: true, // needed for opening hours
    maxImages: MAX_PHOTOS,
    scrapeImageAuthors: false,
    maxReviews: 0,
    scrapeContacts: false,
    scrapeDirectories: false,
    includeWebResults: false,
    maximumLeadsEnrichmentRecords: 0,
    enableCompetitorAnalysis: false,
  };
}

// ── Apify ───────────────────────────────────────────────────────────────────

type ScrapedPlace = {
  title?: string;
  description?: string | null;
  categoryName?: string | null;
  categories?: string[];
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  website?: string | null;
  totalScore?: number | null;
  reviewsCount?: number | null;
  placeId?: string;
  url?: string;
  permanentlyClosed?: boolean;
  openingHours?: { day: string; hours: string }[];
  imageUrl?: string | null;
  imageUrls?: string[];
  images?: { imageUrl: string; authorName?: string | null; authorUrl?: string | null }[];
};

async function runScraper(input: object): Promise<ScrapedPlace | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new ImportError("Google import isn't set up yet (APIFY_API_TOKEN is missing).");

  // run-sync waits for the run and returns its dataset items in one call.
  const res = await fetch(`https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?timeout=150&clean=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
    cache: "no-store",
    signal: AbortSignal.timeout(170_000),
  }).catch((e: unknown) => {
    if (e instanceof Error && e.name === "TimeoutError") throw new ImportError("Google took too long to answer. Please try again.");
    throw e;
  });

  if (res.status === 408) throw new ImportError("Google took too long to answer. Please try again.");
  if (!res.ok) {
    console.error("Apify error", res.status, await res.text());
    throw new ImportError("We couldn't read that Google listing right now. Please try again in a minute.");
  }
  const items = (await res.json()) as ScrapedPlace[];
  return items.find((i) => i.title) ?? null;
}

// ── Mapping to our shape ────────────────────────────────────────────────────

const TYPE_MAP: [RegExp, string][] = [
  [/beauty|hair|nail|spa|salon|barber|makeup|parlou?r/, "salon"],
  [/school|tutor|coaching|education|academy|institute|classes/, "tuition"],
  [/restaurant|cafe|café|bakery|food|meal|dhaba|sweet|caterer|bar\b/, "restaurant"],
  [/clothing|shoe|jewel|boutique|tailor|fashion|saree|garment/, "boutique"],
  [/doctor|dentist|clinic|hospital|physio|pharmacy|health|medical|diagnostic/, "clinic"],
];

function businessType(p: ScrapedPlace) {
  const cats = [p.categoryName, ...(p.categories ?? [])].filter(Boolean).join(" ").toLowerCase();
  return TYPE_MAP.find(([re]) => re.test(cats))?.[1] ?? "services";
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** [{day:"Monday", hours:"10 AM to 8 PM"}, ...] -> "Mon–Sat 10 am – 8 pm, Sun closed" */
export function summariseHours(rows: { day: string; hours: string }[] | undefined) {
  if (!rows?.length) return "";
  const byDay = new Map(rows.map((r) => [r.day, r.hours]));
  const times = DAYS.map((d) =>
    (byDay.get(d) ?? "closed")
      .replace(/\s+to\s+/gi, " – ")
      .replace(/:00/g, "")
      .replace(/\s?([AP])M/g, (_, x: string) => ` ${x.toLowerCase()}m`)
      .replace(/[  ]/g, " ")
      .replace(/^Closed$/i, "closed")
      .replace(/Open 24 hours/i, "open 24 hours"),
  );
  const groups: { from: number; to: number; time: string }[] = [];
  times.forEach((time, i) => {
    const last = groups.at(-1);
    if (last && last.time === time) last.to = i;
    else groups.push({ from: i, to: i, time });
  });
  return groups.map((g) => `${DAYS[g.from].slice(0, 3)}${g.to > g.from ? `–${DAYS[g.to].slice(0, 3)}` : ""} ${g.time}`).join(", ");
}

/** Google photo URLs carry their size in the suffix; ask for a large version. */
function largePhoto(uri: string) {
  return uri.replace(/=w\d+-h\d+[^/]*$/, "=w1600-h1200-k-no");
}

export async function importPlaceFromLink(link: string): Promise<ImportedPlace> {
  const url = parseLink(link);
  const p = await runScraper(actorInput(url));
  if (!p?.title) {
    throw new ImportError("We couldn't find a shop in that link. Open your shop in Google Maps, tap Share, and copy that link.");
  }
  if (p.permanentlyClosed) throw new ImportError("Google lists this shop as permanently closed.");

  const photoList = p.images?.length
    ? p.images.map((i) => ({ uri: i.imageUrl, author: i.authorName ?? null, authorUri: i.authorUrl ?? null }))
    : (p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : [])).map((uri) => ({ uri, author: null, authorUri: null }));

  const address = (p.address ?? "").replace(/,\s*India$/, "");
  return {
    placeId: p.placeId ?? "",
    name: p.title,
    city: p.city || address.split(",").at(-2)?.replace(/\d+/g, "").trim() || "",
    address,
    phone: p.phone ?? "",
    hours: summariseHours(p.openingHours),
    rating: p.totalScore ?? null,
    reviewCount: p.reviewsCount ?? null,
    businessType: businessType(p),
    mapsUrl: p.url ?? url.href,
    website: p.website ?? null,
    summary: p.description ?? null,
    photos: photoList
      .filter((ph) => ph.uri?.startsWith("https://"))
      .slice(0, MAX_PHOTOS)
      .map((ph) => ({ ...ph, uri: largePhoto(ph.uri) })),
  };
}
