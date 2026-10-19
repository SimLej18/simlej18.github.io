<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import PublicationItem from "../comps/PublicationItem.svelte";
    import { featured } from "$lib/publications-data";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Publications" label="Most of what I've worked on or helped writing, spanning various fields of ML"/>
    <ol class="space-y-6">
        {#each featured as publication (publication.slug)}
            <li><PublicationItem {publication}/></li>
        {/each}
    </ol>
    <a href="/publications" class="link link-hover mt-10 inline-block font-mono text-sm">All publications →</a>
</div>
