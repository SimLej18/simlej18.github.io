<script lang="ts">
    import SoftwareCard from "../../comps/SoftwareCard.svelte";
    import { included } from "$lib/software-data";
</script>

<svelte:head><title>Software — Simon Lejoly</title></svelte:head>

<main class="mx-auto max-w-4xl px-16 py-16">
    <a href="/" class="link link-hover font-mono text-sm">← Home</a>
    <h1 class="mt-8 mb-8 font-mono text-3xl font-bold">Software</h1>
    <div class="flex flex-col gap-6">
        {#each included as project}
            <SoftwareCard {project}/>
        {/each}
    </div>
</main>
