<script lang="ts">
    import PublicationItem from "../../comps/PublicationItem.svelte";
    import { included } from "$lib/publications-data";
</script>

<svelte:head><title>Publications — Simon Lejoly</title></svelte:head>

<main class="mx-auto max-w-4xl px-16 py-16">
    <a href="/" class="link link-hover font-mono text-sm">← Home</a>
    <h1 class="mt-8 mb-8 font-mono text-3xl font-bold">Publications</h1>
    <ol class="space-y-6">
        {#each included as publication (publication.slug)}
            <li><PublicationItem {publication}/></li>
        {/each}
    </ol>
</main>
