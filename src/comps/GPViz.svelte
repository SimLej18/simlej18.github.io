<script lang="ts">
    import { onMount, untrack } from "svelte";
    import GPSample from "./GPSample.svelte";

    let { nSamples, resolution, variance, width, height, points = [] }: {
        nSamples: number; resolution: number; variance: number;
        width: number; height: number;
        points?: { x: number; y: number }[];
    } = $props();

    const NOISE_INIT = 100;
    const NOISE_MIN = 0.01;
    const NOISE_DECAY = 0.80;

    let displayedPoints = $state<{ x: number; y: number; noise: number }[]>([]);

    // Reconcile incoming target points → add any missing ones with high noise
    $effect(() => {
        const targets = points.map(p => ({ x: p.x, y: p.y }));
        untrack(() => {
            for (const t of targets) {
                if (!displayedPoints.some(d => d.x === t.x && d.y === t.y)) {
                    displayedPoints.push({ x: t.x, y: t.y, noise: NOISE_INIT });
                }
            }
        });
    });

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
                // Update noise per displayed point: decay if still targeted, ramp up + drop if not
                for (let i = displayedPoints.length - 1; i >= 0; i--) {
                    const p = displayedPoints[i];
                    const stillTargeted = points.some(t => t.x === p.x && t.y === p.y);
                    if (stillTargeted) {
                        if (p.noise > NOISE_MIN) p.noise = Math.max(NOISE_MIN, p.noise * NOISE_DECAY);
                    } else {
                        p.noise = p.noise / NOISE_DECAY;
                        if (p.noise >= NOISE_INIT) displayedPoints.splice(i, 1);
                    }
                }
                gpSamples.forEach(s => s?.nextFrame());
                last = now;
            }
            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    });

    const logRange = Math.log(NOISE_INIT) - Math.log(NOISE_MIN);
</script>

<svg width="100%" height="100%">
    <!-- Dashed line at y == 0 -->
    <line x1="0" y1="50%" x2="100%" y2="50%"
          stroke="currentColor" stroke-dasharray="8 4" stroke-width="1" opacity="0.4"/>
    {#each sampleParams as params, i}
        <GPSample bind:this={gpSamples[i]} {width} {height}
                  length_scale={params.length_scale} {variance} {resolution}
                  frames={params.frames} startFrame={params.startFrame} points={displayedPoints}/>
    {/each}
    {#each displayedPoints as p}
        <circle cx={p.x} cy={height / 2 - p.y * height / 10} r="6"
                class="fill-primary" stroke="white" stroke-width="2"
                opacity={Math.max(0, Math.min(1, (Math.log(NOISE_INIT) - Math.log(p.noise)) / logRange))}/>
    {/each}
</svg>