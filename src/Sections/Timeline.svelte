<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import { timeline as entries, emphasised } from "$lib/timeline";

    let { index }: { index: number } = $props();
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
                    <p class="mt-1">{#each emphasised(e.text) as part, j (j)}{#if j % 2}<em>{part}</em>{:else}{part}{/if}{/each}</p>
                </div>
                {#if i < entries.length - 1}<hr class="bg-primary"/>{/if}
            </li>
        {/each}
    </ul>
</div>
