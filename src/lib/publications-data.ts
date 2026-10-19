import data from "$lib/data/publications.json";
import { byDate, toPublication, type PublicationEntry } from "$lib/publications";

const entries = [...(data as PublicationEntry[])].sort(byDate);

export const featured = entries.filter(e => e.status === "featured").map(toPublication);
// The /publications page lists featured publications too
export const included = entries.filter(e => e.status !== "unlisted").map(toPublication);
