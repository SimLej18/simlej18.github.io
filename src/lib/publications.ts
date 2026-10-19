// Types and helpers only: importing publications.json here would make the admin page reload on save
import { STATUSES, type Status } from "$lib/software";

export { STATUSES, type Status };

export const SLUG = /^[\w-]+$/;
// Family name highlighted in author lists
export const OWN_NAME = "Lejoly";

// The CSL-JSON fields kept from doi.org. CSL-JSON is what doi.org returns for any registration agency
// (Crossref, DataCite, mEDRA...), see https://citeproc-js.readthedocs.io/en/latest/csl-json/markup.html
export interface Csl {
    type: string;               // e.g. "article-journal", "paper-conference", "article" (preprint)
    title: string;
    author: string[];           // display names, e.g. "S. Lejoly"
    venue: string;              // journal or proceedings, publisher when there is none (arXiv, Zenodo)
    date: string;               // "YYYY-MM" or "YYYY"
    abstract: string;           // plain text, blank lines split paragraphs; empty when not deposited
    url: string;
}

export interface Link {
    label: string;
    url: string;
}

// One publication. Displayed newest first.
// Entries with a DOI keep a snapshot of its metadata, refreshed from the admin page; the override fields
// replace the snapshot values when set. Entries without a DOI are typed by hand in the override fields.
export interface PublicationEntry {
    slug: string;        // its page is /publications/<slug>
    status: Status;
    doi?: string;        // e.g. "10.48550/arXiv.1706.03762"
    csl?: Csl;
    title?: string;
    authors?: string[];
    venue?: string;
    date?: string;       // "YYYY-MM" or "YYYY"
    abstract?: string;
    notes: string;       // public note shown above the abstract, blank lines split paragraphs
    links: Link[];
}

export const OVERRIDES = ["title", "authors", "venue", "date", "abstract"] as const;
export type Override = (typeof OVERRIDES)[number];

export interface Publication {
    slug: string;
    title: string;
    authors: string[];
    venue: string;
    year: string;
    abstract: string;
    notes: string;
    href: string;        // the publication's page
    url: string;         // the publisher's page: doi.org, or the snapshot URL
    doi?: string;
    links: Link[];
}

// Values shown for an entry: overrides first, then the DOI snapshot
export function resolved(e: PublicationEntry): Required<Pick<PublicationEntry, Override>> {
    return {
        title: e.title ?? e.csl?.title ?? "",
        authors: e.authors ?? e.csl?.author ?? [],
        venue: e.venue ?? e.csl?.venue ?? "",
        date: e.date ?? e.csl?.date ?? "",
        abstract: e.abstract ?? e.csl?.abstract ?? "",
    };
}

export function toPublication(e: PublicationEntry): Publication {
    const r = resolved(e);
    return {
        slug: e.slug,
        title: r.title,
        authors: r.authors,
        venue: r.venue,
        year: r.date.slice(0, 4),
        abstract: r.abstract,
        notes: e.notes,
        href: `/publications/${e.slug}`,
        url: e.doi ? `https://doi.org/${e.doi}` : e.csl?.url ?? "",
        doi: e.doi,
        links: e.links,
    };
}

// Newest first, undated last
export const byDate = (a: PublicationEntry, b: PublicationEntry) =>
    (resolved(b).date || "0").localeCompare(resolved(a).date || "0");

export const isOwnName = (author: string) => author.includes(OWN_NAME);

export const paragraphs = (text: string) => text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);

// Default slug: first author's family name, year and first word of the title, e.g. "vaswani-2017-attention"
export function defaultSlug(e: PublicationEntry): string {
    const r = resolved(e);
    const words = [r.authors[0]?.split(" ").at(-1), r.date.slice(0, 4), r.title.split(/\s+/)[0]];
    return words
        .filter(Boolean)
        .join("-")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^\w-]/g, "");
}

// Accepts a bare DOI, "doi:..." or a doi.org URL. DOIs are case-insensitive: stored lower case.
export function parseDoi(input: string): string | null {
    const match = decodeURIComponent(input.trim()).match(/\b10\.\d{4,}(\.\d+)*\/\S+/);
    return match ? match[0].toLowerCase() : null;
}

// Raw CSL-JSON, as doi.org returns it
interface CslName {
    family?: string;
    given?: string;
    literal?: string;
}

interface RawCsl {
    type?: string;
    title?: string | string[];
    author?: CslName[];
    "container-title"?: string | string[];
    "event-title"?: string;
    publisher?: string;
    issued?: { "date-parts"?: (number | string)[][] };
    abstract?: string;
    URL?: string;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// "Simon Pierre" "Lejoly" → "S. P. Lejoly"
function displayName(n: CslName): string {
    if (n.literal) return n.literal;
    const initials = (n.given ?? "").split(/[\s.]+/).filter(Boolean).map(g => g.split("-").map(p => `${p[0]}.`).join("-"));
    return [...initials, n.family ?? ""].join(" ").trim();
}

function dateOf(issued: RawCsl["issued"]): string {
    const [year, month] = issued?.["date-parts"]?.[0] ?? [];
    if (!year) return "";
    return month ? `${year}-${String(month).padStart(2, "0")}` : String(year);
}

// Titles and abstracts may hold markup: JATS (<jats:p>, <jats:italic>...) from Crossref, HTML from others
function plainText(markup: string): string {
    const html = markup
        .replace(/<(jats:)?title\b[^>]*>.*?<\/(jats:)?title>/gis, "")
        .replace(/<\/?(jats:)?p\b[^>]*>/gi, "\n\n");
    const text = new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";
    return paragraphs(text).map(p => p.replace(/\s+/g, " ")).join("\n\n");
}

function toCsl(raw: RawCsl): Csl {
    return {
        type: raw.type ?? "",
        title: plainText(first(raw.title)),
        author: (raw.author ?? []).map(displayName),
        venue: plainText(first(raw["container-title"]) || raw["event-title"] || raw.publisher || ""),
        date: dateOf(raw.issued),
        abstract: plainText(raw.abstract ?? ""),
        url: raw.URL ?? "",
    };
}

// DOI content negotiation, made from the browser (doi.org and the agencies allow CORS).
// Null if the DOI is not registered.
export async function fetchCsl(doi: string): Promise<Csl | null> {
    const path = doi.split("/").map(encodeURIComponent).join("/");
    const res = await fetch(`https://doi.org/${path}`, { headers: { Accept: "application/vnd.citationstyles.csl+json" } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`doi.org: ${res.status} ${res.statusText}`);
    return toCsl(await res.json());
}
