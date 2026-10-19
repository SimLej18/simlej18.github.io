<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import { contactLinks } from "$lib/contact-links";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Contact"/>
    <p class="text-5xl font-bold leading-tight text-accent-content">
        Got an idea? <span class="underline decoration-primary decoration-8 underline-offset-4">Let's talk.</span>
    </p>
    <p class="mt-6 text-lg max-w-xl">
        I'm always happy to discuss research, software or teaching opportunities. Pick your favourite channel below.
    </p>
    <div class="mt-10 flex flex-wrap gap-4">
        {#each contactLinks as l}
            <a class="btn btn-outline btn-accent" href={l.href}>{l.label}</a>
        {/each}
    </div>
</div>
