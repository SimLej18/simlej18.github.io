<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const posts = [
        { title: "Lorem ipsum: dolor sit amet", date: "2026-08-14", excerpt: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore." },
        { title: "Sed do eiusmod tempor", date: "2026-05-02", excerpt: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip." },
        { title: "Duis aute irure dolor", date: "2026-01-20", excerpt: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
    ];
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Blog"/>
    <div class="space-y-8">
        {#each posts as p}
            <article class="group">
                <time class="font-mono text-sm">{p.date}</time>
                <h3 class="text-2xl font-bold text-accent-content group-hover:underline decoration-primary decoration-4">{p.title}</h3>
                <p class="mt-1">{p.excerpt}</p>
            </article>
        {/each}
    </div>
</div>
