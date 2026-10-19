<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    // Newest first. `*...*` in `text` is emphasised.
    const entries = [
        { when: "2023 — now", what: "PhD in Machine Learning", icon: "🏛️", where: "HuMaLearn Lab — UNamur", text: "Explored the modeling capabilities of Gaussian processes on Venusian atmospheric data" },
        { when: "2021 — 2023", what: "Data Science Master", icon: "🏛️", where: "University of Namur", text: "Presented my master thesis on “Personalised Speech Compression using Deep Learning”" },
        { when: "2018 — 2021", what: "Computer Science Bachelor", icon: "🏛️", where: "University of Namur", text: "Finished my general informatics cursus with *great distinction*" },
        { when: "2000 — 2018", what: "Homeschooling", icon: "🏠", where: "Well... at home!", text: "Spent my childhood being curious and learning by myself (and with my parents)" },
    ];
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Timeline" label="That's my story, from birth all the way to what I am now."/>
    <ul class="timeline timeline-vertical timeline-compact timeline-snap-icon">
        {#each entries as e, i (e.when)}
            <li>
                {#if i > 0}<hr class="bg-primary"/>{/if}
                <div class="timeline-middle">
                    <div class="size-4 rounded-full border-2 border-accent {i === 0 ? 'bg-primary' : 'bg-base-100'}"></div>
                </div>
                <div class="timeline-end mb-8 ml-2">
                    <time class="font-mono text-sm">{e.when}</time>
                    <div class="text-xl font-bold text-accent-content">{e.what}</div>
                    <div>{e.icon} <span class="italic">{e.where}</span></div>
                    <p class="mt-1">{#each e.text.split("*") as part, j (j)}{#if j % 2}<em>{part}</em>{:else}{part}{/if}{/each}</p>
                </div>
                {#if i < entries.length - 1}<hr class="bg-primary"/>{/if}
            </li>
        {/each}
    </ul>
</div>
