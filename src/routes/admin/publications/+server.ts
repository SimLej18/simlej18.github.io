import { dev } from "$app/environment";
import { error, json } from "@sveltejs/kit";
import { readFile, writeFile } from "node:fs/promises";
import { SLUG, STATUSES, type PublicationEntry } from "$lib/publications";
import type { RequestHandler } from "./$types";

export const prerender = false;

const FILE = "src/lib/data/publications.json";

export const GET: RequestHandler = async () => {
    if (!dev) error(404);
    return json(JSON.parse(await readFile(FILE, "utf8")));
};

export const PUT: RequestHandler = async ({ request, url }) => {
    if (!dev) error(404);
    // Only the admin page itself may write to the repo
    if (request.headers.get("origin") !== url.origin) error(403);
    const body: unknown = await request.json();
    if (!Array.isArray(body) || !body.every(isEntry)) error(400, "Invalid publication entries");
    for (const key of ["slug", "doi"] as const) {
        const values: string[] = body.map(e => e[key]).filter(v => v !== undefined);
        const duplicate = values.find((v, i) => values.indexOf(v) !== i);
        if (duplicate) error(400, `${key} "${duplicate}" is used twice`);
    }
    await writeFile(FILE, JSON.stringify(body, null, 2) + "\n");
    return new Response(null, { status: 204 });
};

const isString = (v: unknown): v is string => typeof v === "string";
const optionalString = (v: unknown) => v === undefined || isString(v);
const isStrings = (v: unknown) => Array.isArray(v) && v.every(isString);
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function isCsl(c: unknown): boolean {
    return isRecord(c)
        && ["type", "title", "venue", "date", "abstract", "url"].every(k => isString(c[k]))
        && isStrings(c.author);
}

function isEntry(e: unknown): e is PublicationEntry {
    if (!isRecord(e)) return false;
    return isString(e.slug) && SLUG.test(e.slug)
        && STATUSES.includes(e.status as never)
        && optionalString(e.doi)
        && (e.csl === undefined || isCsl(e.csl))
        && optionalString(e.title)
        && (e.authors === undefined || isStrings(e.authors))
        && optionalString(e.venue)
        && (e.date === undefined || (isString(e.date) && /^\d{4}(-\d{2})?$/.test(e.date)))
        && optionalString(e.abstract)
        && isString(e.notes)
        && Array.isArray(e.links) && e.links.every(l => isRecord(l) && isString(l.label) && isString(l.url));
}
