<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const items = [
        { icon: "♪", title: "Lorem", text: "Ipsum dolor sit amet." },
        { icon: "⛰", title: "Consectetur", text: "Adipiscing elit sed do." },
        { icon: "✎", title: "Eiusmod", text: "Tempor incididunt ut labore." },
        { icon: "☕", title: "Magna", text: "Aliqua ut enim ad minim." },
        { icon: "♞", title: "Veniam", text: "Quis nostrud exercitation." },
        { icon: "✈", title: "Ullamco", text: "Laboris nisi ut aliquip." },
    ];
</script>

<div class="max-w-4xl">
    <SectionTitle {index} title="Misc"/>
    <div class="grid grid-cols-3 gap-4">
        {#each items as it}
            <div class="p-5 rounded-box bg-base-200 hover:bg-primary transition-colors">
                <div class="text-3xl">{it.icon}</div>
                <div class="mt-2 font-bold text-accent-content">{it.title}</div>
                <div class="text-sm">{it.text}</div>
            </div>
        {/each}
    </div>
</div>
