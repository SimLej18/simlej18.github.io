<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const pubs = [
        { authors: "S. Lejoly, L. Ipsum, D. Sit", title: "Lorem ipsum dolor sit amet consectetur", venue: "Journal of Adipiscing", year: 2026 },
        { authors: "A. Elit, S. Lejoly", title: "Sed do eiusmod tempor incididunt", venue: "Proc. Labore Conference", year: 2025 },
        { authors: "S. Lejoly", title: "Ut enim ad minim veniam quis nostrud", venue: "arXiv preprint", year: 2024 },
    ];
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Publications"/>
    <ol class="space-y-6">
        {#each pubs as p}
            <li class="border-l-4 border-primary pl-5">
                <div class="text-lg font-bold text-accent-content">{p.title}</div>
                <div>{p.authors}</div>
                <div class="font-mono text-sm mt-1"><span class="italic">{p.venue}</span> · {p.year}</div>
            </li>
        {/each}
    </ol>
</div>
