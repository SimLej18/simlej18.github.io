<script lang="ts">
    import type { Talk } from "$lib/talks";

    let { talks }: { talks: Talk[] } = $props();

    // Deterministic pseudo-random in [-1, 1] from a string, so the pile looks loose but is stable across builds
    function jitter(seed: string): number {
        let h = 2166136261;
        for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
        return ((h >>> 0) / 0xffffffff) * 2 - 1;
    }

    // Resting pose in the pile, and the pose a hovered card slides out to. Cards are loosely fanned from
    // left (bottom card) to right (top card), with some jitter; a hovered card slides further out on its side,
    // those in the middle slide up.
    function poses(talk: Talk, i: number) {
        const spread = talks.length === 1 ? 0 : (i / (talks.length - 1)) * 2 - 1;
        const tilt = spread * 8 + jitter(talk.url) * 6;
        const rest = `translate(${spread * 14 + jitter(talk.url + "x") * 5}%, ${jitter(talk.url + "y") * 7}%) rotate(${tilt}deg)`;
        // The card sits in the tilted slot: undo the tilt so the slid-out card is (almost) straight
        const out = `translate(${spread * 45}%, ${-8 - (1 - Math.abs(spread)) * 22}%) rotate(${spread * 3 - tilt}deg) scale(1.04)`;
        return `--rest: ${rest}; --out: ${out}`;
    }

    // Shows the poster again instead of where the video stopped (also aborts a pending play(), hence the catch on play())
    function stop(video: HTMLVideoElement | null) {
        if (!video) return;
        video.pause();
        video.load();
    }
</script>

<!-- All cards share one grid cell, so the pile is as tall as a card; the padding leaves room for the fan -->
<div class="mx-auto grid w-full max-w-md place-items-center py-12">
    {#each talks as talk, i (talk.url)}
        <!-- The wrapper keeps the resting pose so the hover is not lost while the card slides out from under the cursor -->
        <a href={talk.href} class="pile-slot col-start-1 row-start-1 w-64 hover:z-10"
           style={poses(talk, i)}
           onmouseenter={e => e.currentTarget.querySelector("video")?.play().catch(() => {})}
           onmouseleave={e => stop(e.currentTarget.querySelector("video"))}>
            <div class="pile-card overflow-hidden rounded-box bg-base-100 shadow-xl ring-1 ring-base-300">
                {#if talk.preview}
                    <video class="aspect-video w-full object-cover" src={talk.preview}
                           poster={talk.thumbnail} muted playsinline preload="none"></video>
                {:else}
                    <img class="aspect-video w-full object-cover object-top" src={talk.thumbnail} alt=""/>
                {/if}
                <div class="px-3 py-2">
                    <div class="truncate text-sm font-bold text-accent-content">{talk.title}</div>
                    <div class="flex justify-between gap-3 text-xs">
                        <span class="truncate italic">{talk.venue}</span>
                        <span class="shrink-0 font-mono">{talk.date}</span>
                    </div>
                </div>
            </div>
        </a>
    {/each}
</div>

<style>
    .pile-slot {
        transform: var(--rest);
    }

    .pile-card {
        transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 500ms;
    }

    .pile-slot:hover .pile-card,
    .pile-slot:focus-visible .pile-card {
        transform: var(--out);
    }

    @media (prefers-reduced-motion: reduce) {
        .pile-card {
            transition: none;
        }
    }
</style>
