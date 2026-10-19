<script lang="ts">
    import { contactLinks } from "$lib/contact-links";

    let { sections, onNavigate }: {
        sections: { label: string }[];
        onNavigate: (index: number) => void;
    } = $props();

    const external = [
        { label: "One-page resume", href: "/resume" },
        ...contactLinks,
    ];
</script>

<footer class="relative z-10 snap-end bg-base-100">
    <!-- Fades the GP and content out instead of cutting them above the footer -->
    <div class="pointer-events-none absolute bottom-full h-12 w-full bg-linear-to-t from-base-100 to-transparent"></div>
    <div class="flex flex-row justify-between gap-16 px-16 pt-4 pb-12">
        <div>
            <p class="font-mono text-xl font-bold text-accent-content">Simon Lejoly</p>
            <p class="mt-2 text-sm">© {new Date().getFullYear()} · Lorem ipsum dolor sit amet</p>
        </div>
        <nav class="flex gap-16">
            <div>
                <p class="font-mono text-xs uppercase tracking-widest mb-3">Sections</p>
                <ul class="grid grid-cols-3 gap-x-8 gap-y-1">
                    {#each sections as s, i}
                        <li><button class="link link-hover" onclick={() => onNavigate(i)}>{s.label}</button></li>
                    {/each}
                </ul>
            </div>
            <div>
                <p class="font-mono text-xs uppercase tracking-widest mb-3">Elsewhere</p>
                <ul class="space-y-1">
                    {#each external as l}
                        <li><a class="link link-hover" href={l.href}>{l.label}</a></li>
                    {/each}
                </ul>
            </div>
        </nav>
    </div>
</footer>
