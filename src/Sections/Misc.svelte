<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import { misc as items } from "$lib/misc";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-4xl">
    <SectionTitle {index} title="Misc"/>
    <div class="grid grid-cols-3 gap-4">
        {#each items as it}
            <svelte:element this={it.href ? "a" : "div"} href={it.href} target={it.href && "_blank"} rel={it.href && "noopener"} class="block p-5 rounded-box bg-base-200 hover:bg-primary transition-colors">
                <div class="text-3xl">{it.icon}</div>
                <div class="mt-2 font-bold text-accent-content">{it.title}</div>
                <div class="text-sm">{it.text}</div>
            </svelte:element>
        {/each}
    </div>
</div>
