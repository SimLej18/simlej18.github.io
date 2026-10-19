import data from "$lib/data/talks.json";
import { byDate, toTalk, type TalkEntry } from "$lib/talks";

const entries = [...(data as TalkEntry[])].sort(byDate);

export const featured = entries.filter(e => e.status === "featured").map(toTalk);
// The /talks page lists featured talks too
export const included = entries.filter(e => e.status !== "unlisted").map(toTalk);
