<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const items: { icon: string; title: string; text: string; href?: string }[] = [
        { icon: "🎤", title: "MT180", text: "National finalist of “My Thesis in 180 Seconds”.", href: "https://www.youtube.com/watch?v=wZAahRIVm8g" },
        { icon: "⛺", title: "BACV trainer", text: "I train future holiday camp leaders." },
        { icon: "🥁", title: "Drums", text: "I slam sticks on stuff." },
        { icon: "🎮", title: "E-sport", text: "I organised e-sport tournaments." },
        { icon: "♞", title: "Half decent at Chess", text: "1350 Elo in blitz." },
        { icon: "☕", title: "Coffee", text: "Certified coffee enthusiast." },
    ];
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
