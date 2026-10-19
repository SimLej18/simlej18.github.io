import { error } from "@sveltejs/kit";
import { included } from "$lib/talks-data";
import type { EntryGenerator, PageLoad } from "./$types";

// Unlisted talks get no page
export const entries: EntryGenerator = () => included.map(t => ({ slug: t.slug }));

export const load: PageLoad = ({ params }) => {
    const talk = included.find(t => t.slug === params.slug);
    if (!talk) error(404);
    return { talk };
};
