import { dev } from "$app/environment";
import { error, json } from "@sveltejs/kit";
import { readFile, writeFile } from "node:fs/promises";
import { STATUSES, type SoftwareEntry } from "$lib/software";
import type { RequestHandler } from "./$types";

export const prerender = false;

const FILE = "src/lib/data/software.json";

export const GET: RequestHandler = async () => {
    if (!dev) error(404);
    return json(JSON.parse(await readFile(FILE, "utf8")));
};

export const PUT: RequestHandler = async ({ request, url }) => {
    if (!dev) error(404);
    // Only the admin page itself may write to the repo
    if (request.headers.get("origin") !== url.origin) error(403);
    const body: unknown = await request.json();
    if (!Array.isArray(body) || !body.every(isEntry)) error(400, "Invalid software entries");
    await writeFile(FILE, JSON.stringify(body, null, 2) + "\n");
    return new Response(null, { status: 204 });
};

function isEntry(e: unknown): e is SoftwareEntry {
    if (typeof e !== "object" || e === null) return false;
    const o = e as Record<string, unknown>;
    const optionalString = (v: unknown) => v === undefined || typeof v === "string";
    return typeof o.repo === "string"
        && STATUSES.includes(o.status as never)
        && optionalString(o.name)
        && optionalString(o.description)
        && (o.tags === undefined || (Array.isArray(o.tags) && o.tags.every(t => typeof t === "string")))
        && typeof o.github === "object" && o.github !== null
        && typeof (o.github as Record<string, unknown>).url === "string";
}
