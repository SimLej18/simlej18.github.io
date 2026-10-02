<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const talks = [
        { title: "Lorem ipsum dolor sit amet", venue: "Consectetur Conf", date: "Mar 2026", kind: "Keynote" },
        { title: "Sed do eiusmod tempor", venue: "Adipiscing Meetup", date: "Nov 2025", kind: "Talk" },
        { title: "Ut enim ad minim veniam", venue: "Elit Workshop", date: "Jun 2025", kind: "Poster" },
    ];
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Talks"/>
    <ul class="space-y-4">
        {#each talks as t}
            <li class="flex items-center gap-6 p-5 rounded-box bg-base-200">
                <div class="font-mono text-sm w-20 shrink-0">{t.date}</div>
                <div class="grow">
                    <div class="text-lg font-bold text-accent-content">{t.title}</div>
                    <div class="italic">{t.venue}</div>
                </div>
                <span class="badge badge-outline">{t.kind}</span>
            </li>
        {/each}
    </ul>
</div>
