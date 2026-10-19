<script lang="ts">
    import Authors from "../../../comps/Authors.svelte";
    import { paragraphs } from "$lib/publications";

    let { data } = $props();
    const p = $derived(data.publication);
    // The publisher's page first, then the links added by hand
    const links = $derived([...(p.url ? [{ label: p.doi ? `DOI ${p.doi}` : "Publisher", url: p.url }] : []), ...p.links]);
</script>

<svelte:head><title>{p.title} — Simon Lejoly</title></svelte:head>

<main class="mx-auto max-w-4xl px-16 py-16">
    <a href="/publications" class="link link-hover font-mono text-sm">← All publications</a>
    <header class="mt-8 mb-6">
        <h1 class="font-mono text-3xl font-bold text-accent-content">{p.title}</h1>
        <p class="mt-3"><Authors authors={p.authors}/></p>
        <p class="mt-1 font-mono text-sm"><span class="italic">{p.venue}</span>{#if p.year} · {p.year}{/if}</p>
    </header>

    {#if links.length}
        <div class="mb-8 flex flex-wrap gap-2">
            {#each links as link}
                <a href={link.url} target="_blank" rel="noopener" class="btn btn-sm btn-outline">{link.label} ↗</a>
            {/each}
        </div>
    {/if}

    {#each paragraphs(p.notes) as para}<p class="mb-4 max-w-3xl">{para}</p>{/each}

    {#if p.abstract}
        <h2 class="mt-10 mb-4 font-mono text-sm tracking-widest text-accent uppercase">Abstract</h2>
        {#each paragraphs(p.abstract) as para}<p class="mb-4 max-w-3xl text-justify">{para}</p>{/each}
    {/if}
</main>
