// Types and helpers only: importing talks.json here would make the admin page reload on save
import { STATUSES, type Status } from "$lib/software";

export { STATUSES, type Status };

export const KINDS = ["Talk", "Keynote", "Poster"] as const;
export type Kind = (typeof KINDS)[number];

// Files found in static/talks by the admin scan, with the media generated next to them
export interface ScannedFile {
    file: string;        // path under static/talks, e.g. "EPSC_26/EPSC_26_SLejoly.html"
    thumbnail: string;   // still image: last frame of the slide video, or first page of a PDF
    preview?: string;    // first-slide video, decks only
    pdf?: string;        // static version of an HTML poster: the PDF next to it with the same name
    slide?: number;      // 1-based slide the media come from, decks only (slide 1 is often blank)
}

export const SLUG = /^[\w-]+$/;

// One talk or poster. Displayed newest first.
export interface TalkEntry extends ScannedFile {
    slug: string;        // its page is /talks/<slug>/
    status: Status;
    kind: Kind;
    title: string;
    venue: string;
    date: string;        // "YYYY-MM", empty if unknown
    description: string; // short text shown above the embedded deck or poster, blank lines split paragraphs
}

// Default slug: the folder holding the file in static/talks, or the file name for a file at its root
export function defaultSlug(file: string): string {
    const [first, ...rest] = file.split("/");
    return (rest.length ? first : first.replace(/\.[^.]+$/, "")).replace(/[^\w-]/g, "-");
}

export interface Talk {
    slug: string;
    title: string;
    venue: string;
    date: string;        // display form, e.g. "Mar 2026"
    kind: Kind;
    description: string;
    href: string;        // the talk's page
    url: string;         // the deck or poster itself
    pdf?: string;        // static version of an HTML poster
    isPoster: boolean;
    thumbnail: string;
    preview?: string;
}

const url = (path: string) => `/talks/${path.split("/").map(encodeURIComponent).join("/")}`;

function formatDate(date: string): string {
    if (!date) return "";
    const [year, month] = date.split("-").map(Number);
    return new Date(year, month - 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function toTalk(e: TalkEntry): Talk {
    return {
        slug: e.slug,
        title: e.title,
        venue: e.venue,
        date: formatDate(e.date),
        kind: e.kind,
        description: e.description,
        href: `/talks/${e.slug}/`,
        url: url(e.file),
        pdf: e.pdf && url(e.pdf),
        isPoster: e.kind === "Poster",
        thumbnail: url(e.thumbnail),
        preview: e.preview && url(e.preview),
    };
}

// Newest first, undated last
export const byDate = (a: TalkEntry, b: TalkEntry) => (b.date || "0").localeCompare(a.date || "0");
