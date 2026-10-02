<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const entries = [
        { when: "2024 — now", what: "Lorem ipsum position", where: "Dolor Institute", text: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt." },
        { when: "2021 — 2024", what: "Sit amet role", where: "Consectetur Labs", text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
        { when: "2019 — 2021", what: "Adipiscing degree", where: "University of Elit", text: "Duis aute irure dolor in reprehenderit in voluptate velit." },
        { when: "2016 — 2019", what: "Tempor studies", where: "Incididunt School", text: "Excepteur sint occaecat cupidatat non proident." },
    ];
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Timeline"/>
    <ul class="timeline timeline-vertical timeline-compact timeline-snap-icon">
        {#each entries as e, i}
            <li>
                {#if i > 0}<hr class="bg-primary"/>{/if}
                <div class="timeline-middle">
                    <div class="size-4 rounded-full border-2 border-accent {i === 0 ? 'bg-primary' : 'bg-base-100'}"></div>
                </div>
                <div class="timeline-end mb-8 ml-2">
                    <time class="font-mono text-sm">{e.when}</time>
                    <div class="text-xl font-bold text-accent-content">{e.what}</div>
                    <div class="italic">{e.where}</div>
                    <p class="mt-1">{e.text}</p>
                </div>
                {#if i < entries.length - 1}<hr class="bg-primary"/>{/if}
            </li>
        {/each}
    </ul>
</div>
