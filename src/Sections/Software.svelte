<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import SoftwareCard from "../comps/SoftwareCard.svelte";
    import { featured } from "$lib/software-data";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-4xl">
    <SectionTitle {index} title="Software" label="I'm not gonna lie, I like coding. It got me into computer science and now makes my most important scientific contributions."/>
    <div class="grid grid-cols-2 gap-6">
        {#each featured as project}
            <SoftwareCard {project}/>
        {/each}
    </div>
    <a href="/software" class="link link-hover mt-6 inline-block font-mono text-sm">All projects →</a>
</div>
