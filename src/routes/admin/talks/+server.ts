import { dev } from "$app/environment";
import { error, json } from "@sveltejs/kit";
import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { promisify } from "node:util";
import { KINDS, SLUG, STATUSES, type ScannedFile, type TalkEntry } from "$lib/talks";
import type { RequestHandler } from "./$types";

export const prerender = false;

const FILE = "src/lib/data/talks.json";
const ROOT = "static/talks";
const THUMB = ".thumb.webp";
const PREVIEW = ".preview.mp4";
// A uniform frame (blank slide) compresses to about 1 KB in WebP, a slide with content to tens of KB
const BLANK_BYTES = 4000;
// Slides tried when looking for the first non-blank one
const MAX_AUTO_SLIDE = 10;

const run = promisify(execFile);

export const GET: RequestHandler = async () => {
    if (!dev) error(404);
    return json(JSON.parse(await readFile(FILE, "utf8")));
};

export const PUT: RequestHandler = async ({ request, url }) => {
    guard(request, url);
    const body: unknown = await request.json();
    if (!Array.isArray(body) || !body.every(isEntry)) error(400, "Invalid talk entries");
    const slugs = body.map(e => e.slug);
    const duplicate = slugs.find((slug, i) => slugs.indexOf(slug) !== i);
    if (duplicate) error(400, `Slug "${duplicate}" is used twice`);
    await writeFile(FILE, JSON.stringify(body, null, 2) + "\n");
    return new Response(null, { status: 204 });
};

// Without a body: lists the decks and posters in static/talks, generating the media of those that have none.
// With { file, slide }: regenerates the media of one deck from that slide (1-based).
export const POST: RequestHandler = async ({ request, url }) => {
    guard(request, url);
    const text = await request.text();
    if (text) {
        const { file, slide } = JSON.parse(text) as { file?: unknown; slide?: unknown };
        if (typeof file !== "string" || !file.endsWith(".html") || !(await listFiles()).includes(file)) error(400, "Unknown deck");
        if (!Number.isInteger(slide) || (slide as number) < 1) error(400, "Invalid slide");
        return json(await generate(file, slide as number));
    }
    const scanned: ScannedFile[] = [];
    for (const file of await listFiles()) {
        const media = mediaPaths(file);
        scanned.push(await exists(media.thumbnail) ? await existing(file) : await generate(file));
    }
    return json(scanned);
};

function guard(request: Request, url: URL) {
    if (!dev) error(404);
    // Only the admin page itself may write to the repo
    if (request.headers.get("origin") !== url.origin) error(403);
}

// Decks and posters, as paths under ROOT, excluding the generated media and the PDFs of HTML posters
async function listFiles(): Promise<string[]> {
    const entries = (await readdir(ROOT, { recursive: true })).map(p => p.split("\\").join("/"));
    const html = new Set(entries.filter(p => /\.html$/i.test(p)));
    return entries
        .filter(p => html.has(p) || (/\.pdf$/i.test(p) && !html.has(companionHtml(p))))
        .sort();
}

// An HTML poster comes with its static version: the PDF next to it with the same name
const companionPdf = (file: string) => file.replace(/\.[^.]+$/, ".pdf");
const companionHtml = (pdf: string) => pdf.replace(/\.[^.]+$/, ".html");

function mediaPaths(file: string) {
    const stem = file.replace(/\.[^.]+$/, "");
    return { thumbnail: stem + THUMB, preview: stem + PREVIEW };
}

const abs = (path: string) => join(ROOT, path);

async function exists(path: string): Promise<boolean> {
    return stat(abs(path)).then(() => true, () => false);
}

// Media already generated: the slide used is not recorded on disk, talks.json keeps it
async function existing(file: string): Promise<ScannedFile> {
    const { thumbnail, preview } = mediaPaths(file);
    const pdf = companionPdf(file);
    return {
        file, thumbnail,
        ...(await exists(preview) ? { preview } : {}),
        ...(file !== pdf && await exists(pdf) ? { pdf } : {}),
    };
}

async function generate(file: string, slide?: number): Promise<ScannedFile> {
    const { thumbnail, preview } = mediaPaths(file);
    if (file.toLowerCase().endsWith(".pdf")) {
        await pdfThumbnail(abs(file), abs(thumbnail));
        return { file, thumbnail };
    }
    const pdf = companionPdf(file);
    if (await exists(pdf)) {
        await pdfThumbnail(abs(pdf), abs(thumbnail));
        return { file, thumbnail, pdf };
    }
    const html = await readFile(abs(file), "utf8");
    const videos = [...html.matchAll(/data-background-video="([^"]+)"/g)].map(m => m[1]);
    if (videos.length === 0) error(422, `${file} has no slide video, nor a PDF next to it if it is a poster`);
    const tried = slide ? [slide] : Array.from({ length: Math.min(MAX_AUTO_SLIDE, videos.length) }, (_, i) => i + 1);
    for (const n of tried) {
        if (n > videos.length) error(400, `${file} has ${videos.length} slides`);
        await writeFile(abs(preview), await videoBytes(videos[n - 1], dirname(abs(file))));
        await lastFrame(abs(preview), abs(thumbnail));
        if (slide || (await stat(abs(thumbnail))).size > BLANK_BYTES) return { file, thumbnail, preview, slide: n };
    }
    // Every slide tried is blank: keep the last one, the slide number can be set from the admin page
    return { file, thumbnail, preview, slide: tried.at(-1) };
}

// Self-contained decks inline their videos as data URIs, the others reference files next to the deck
async function videoBytes(src: string, deckDir: string): Promise<Buffer> {
    if (src.startsWith("data:")) return Buffer.from(src.slice(src.indexOf(",") + 1), "base64");
    return readFile(join(deckDir, ...posix.normalize(decodeURI(src)).split("/")));
}

async function lastFrame(video: string, out: string) {
    await run("ffmpeg", ["-v", "error", "-y", "-sseof", "-0.05", "-i", video, "-frames:v", "1", "-update", "1",
                         "-vf", "scale=960:-2", out]);
}

// sips (macOS) renders the first page of the PDF, ffmpeg resizes it
async function pdfThumbnail(pdf: string, out: string) {
    const dir = await mkdtemp(join(tmpdir(), "talk-"));
    try {
        const png = join(dir, "page.png");
        await run("sips", ["-s", "format", "png", pdf, "--out", png]);
        await run("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf", "scale=960:-2", out]);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

function isEntry(e: unknown): e is TalkEntry {
    if (typeof e !== "object" || e === null) return false;
    const o = e as Record<string, unknown>;
    return typeof o.file === "string"
        && typeof o.slug === "string" && SLUG.test(o.slug)
        && typeof o.description === "string"
        && typeof o.thumbnail === "string"
        && (o.preview === undefined || typeof o.preview === "string")
        && (o.pdf === undefined || typeof o.pdf === "string")
        && (o.slide === undefined || Number.isInteger(o.slide))
        && STATUSES.includes(o.status as never)
        && KINDS.includes(o.kind as never)
        && typeof o.title === "string"
        && typeof o.venue === "string"
        && typeof o.date === "string" && /^(\d{4}-\d{2})?$/.test(o.date);
}
