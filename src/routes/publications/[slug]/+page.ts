import { error } from "@sveltejs/kit";
import { included } from "$lib/publications-data";
import type { EntryGenerator, PageLoad } from "./$types";

// Without any publication there is no page to prerender, which adapter-static reports as an error
export const prerender = included.length > 0;

// Unlisted publications get no page
export const entries: EntryGenerator = () => included.map(p => ({ slug: p.slug }));

export const load: PageLoad = ({ params }) => {
    const publication = included.find(p => p.slug === params.slug);
    if (!publication) error(404);
    return { publication };
};
