import data from "$lib/data/software.json";
import { toProject, type SoftwareEntry } from "$lib/software";

const entries = data as SoftwareEntry[];

export const featured = entries.filter(e => e.status === "featured").map(toProject);
// The /software page lists featured projects too
export const included = entries.filter(e => e.status !== "unlisted").map(toProject);
