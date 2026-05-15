<script lang="ts">
    import { Matrix, CholeskyDecomposition } from "ml-matrix";

    let { width, height, length_scale, variance, resolution, frames, startFrame }: {
        width: number; height: number;
        length_scale: number; variance: number; resolution: number; frames: number; startFrame: number;
    } = $props();

    let curFrame = $state(startFrame);

    export function nextFrame() {
        curFrame = (curFrame + 1) % frames;
    }

    const xs = $derived(
        Array.from({ length: resolution }, (_, i) => i * width / (resolution - 1))
    );

    const K = $derived((() => {
        const m = new Matrix(resolution, resolution);
        for (let i = 0; i < resolution; i++)
            for (let j = 0; j < resolution; j++) {
                const d = (xs[i] - xs[j]) / length_scale;
                m.set(i, j, variance * Math.exp(-0.5 * d * d) + (i === j ? 1e-8 : 0));
            }
        return m;
    })());

    function sampleNormal(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    let us = $state(
        Matrix.columnVector(Array.from({ length: resolution }, sampleNormal))
    );
    const vs = $derived(
        Matrix.columnVector(Array.from({ length: resolution }, sampleNormal))
    );
    const ts = $derived((() => {  // ts = normalize(vs - (vs.T @ us / us.T @ us) * us)
        const proj = us.transpose().mmul(vs).get(0, 0) / us.transpose().mmul(us).get(0, 0);
        const t = vs.clone().sub(us.clone().mul(proj));
        const norm = Math.sqrt(t.getColumn(0).reduce((s, v) => s + v * v, 0));
        return t.mul(1 / norm);
    })());

    const L  = $derived(new CholeskyDecomposition(K).lowerTriangularMatrix);
    const Lu = $derived(L.mmul(us));  // precomputed, constant across frames
    const Lt = $derived(L.mmul(ts));  // precomputed, constant across frames

    const sample = $derived((() => {
        const angle = curFrame * 2 * Math.PI / (frames - 1);
        const cos_a = Math.cos(angle);
        const sin_a = Math.sin(angle);
        return Array.from({ length: resolution }, (_, i) => cos_a * Lu.get(i, 0) + sin_a * Lt.get(i, 0));
    })());

    const pathD = $derived((() => {
        if (width === 0 || height === 0) return '';
        const cy = height / 2;
        const scale = height / 10;
        return sample.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${cy - y * scale}`).join(' ');
    })());
</script>

<path d={pathD} fill="none" stroke="currentColor" stroke-width="1.5"/>