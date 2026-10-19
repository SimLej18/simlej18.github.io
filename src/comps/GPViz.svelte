<script lang="ts">
    import { untrack } from "svelte";
    import GPSample from "./GPSample.svelte";

    let { nSamples, resolution, variance, width, height, points = [], vertical = false, showPoints = true, paused = false, lengthScale = 200 }: {
        nSamples: number; resolution: number; variance: number;
        width: number; height: number;
        points?: { x: number; y: number }[];  // x: px along the input axis, y: value
        vertical?: boolean;
        showPoints?: boolean;  // draw the observed points, or leave markers to the caller
        paused?: boolean;  // freeze on the current frame, with points conditioned at once (static exports)
        lengthScale?: number;  // px along the input axis, each sample draws within ±12.5%
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
                    displayedPoints.push({ x: t.x, y: t.y, noise: paused ? NOISE_MIN : NOISE_INIT });
                }
            }
        });
    });

    const sampleParams = Array.from({ length: nSamples }, () => {
        const frames = Math.round(400 + Math.random() * 100);
        return {
            length_scale: lengthScale * (0.875 + Math.random() * 0.25),
            frames,
            startFrame: Math.floor(Math.random() * frames),
        };
    });

    let gpSamples: ({ nextFrame: () => void } | null)[] = [];

    $effect(() => {
        if (paused) {
            untrack(() => displayedPoints.forEach(p => p.noise = NOISE_MIN));
            return;
        }
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
    {#each sampleParams as params, i}
        <GPSample bind:this={gpSamples[i]} {width} {height}
                  length_scale={params.length_scale} {variance} {resolution}
                  frames={params.frames} startFrame={params.startFrame} points={displayedPoints} {vertical}/>
    {/each}
    {#each showPoints ? displayedPoints : [] as p}
        <circle cx={vertical ? width / 2 + p.y * width / 10 : p.x}
                cy={vertical ? p.x : height / 2 - p.y * height / 10} r="6"
                class="fill-primary" stroke="white" stroke-width="2"
                opacity={Math.max(0, Math.min(1, (Math.log(NOISE_INIT) - Math.log(p.noise)) / logRange))}/>
    {/each}
</svg>