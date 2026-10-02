<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    // TODO: real links
    const links = [
        { label: "Email", href: "#top" },
        { label: "GitHub", href: "#top" },
        { label: "LinkedIn", href: "#top" },
        { label: "Scholar", href: "#top" },
    ];
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Contact"/>
    <p class="text-5xl font-bold leading-tight text-accent-content">
        Lorem ipsum dolor? <span class="underline decoration-primary decoration-8 underline-offset-4">Sit amet.</span>
    </p>
    <p class="mt-6 text-lg max-w-xl">
        Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
    <div class="mt-10 flex flex-wrap gap-4">
        {#each links as l}
            <a class="btn btn-outline btn-accent" href={l.href}>{l.label}</a>
        {/each}
    </div>
</div>
