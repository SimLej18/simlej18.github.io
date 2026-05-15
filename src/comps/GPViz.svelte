<script lang="ts">
    import { onMount } from "svelte";
    import GPSample from "./GPSample.svelte";

    let { nSamples, resolution, variance, width, height }: {
        nSamples: number; resolution: number; variance: number;
        width: number; height: number;
    } = $props();

    const sampleParams = Array.from({ length: nSamples }, () => {
        const frames = Math.round(400 + Math.random() * 100);
        return {
            length_scale: 175 + Math.random() * 50,
            frames,
            startFrame: Math.floor(Math.random() * frames),
        };
    });

    let gpSamples: ({ nextFrame: () => void } | null)[] = [];

    onMount(() => {
        let rafId: number;
        let last = 0;
        function tick(now: number) {
            if (now - last >= 1000 / 60) {
                gpSamples.forEach(s => s?.nextFrame());
                last = now;
            }
            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    });
</script>

<svg width="100%" height="100%">
    <!-- Dashed line at y == 0 -->
    <line x1="0" y1="50%" x2="100%" y2="50%"
          stroke="currentColor" stroke-dasharray="8 4" stroke-width="1" opacity="0.4"/>
    {#each sampleParams as params, i}
        <GPSample bind:this={gpSamples[i]} {width} {height}
                  length_scale={params.length_scale} {variance} {resolution}
                  frames={params.frames} startFrame={params.startFrame}/>
    {/each}
</svg>