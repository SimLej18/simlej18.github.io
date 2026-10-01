<script lang="ts">
    import { Matrix, CholeskyDecomposition } from "ml-matrix";

    let { width, height, length_scale, variance, resolution, frames, startFrame, points = [] }: {
        width: number; height: number;
        length_scale: number; variance: number; resolution: number; frames: number; startFrame: number;
        points?: { x: number; y: number; noise: number }[];
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

    const posterior = $derived((() => {
        if (points.length === 0) {
            return { K_eff: K, mu: new Array(resolution).fill(0) };
        }
        const n = points.length;
        const K_obs = new Matrix(n, n);
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++) {
                const d = (points[i].x - points[j].x) / length_scale;
                K_obs.set(i, j, variance * Math.exp(-0.5 * d * d) + (i === j ? points[i].noise : 0));
            }
        const K_cross = new Matrix(resolution, n);
        for (let i = 0; i < resolution; i++)
            for (let j = 0; j < n; j++) {
                const d = (xs[i] - points[j].x) / length_scale;
                K_cross.set(i, j, variance * Math.exp(-0.5 * d * d));
            }
        const cholObs = new CholeskyDecomposition(K_obs);
        const y = Matrix.columnVector(points.map(p => p.y));
        const alpha = cholObs.solve(y);
        const mu = K_cross.mmul(alpha).getColumn(0);
        const K_eff = K.clone().sub(K_cross.mmul(cholObs.solve(K_cross.transpose())));
        // Symmetrize to avoid float drift breaking Cholesky symmetry check
        for (let i = 0; i < resolution; i++)
            for (let j = i + 1; j < resolution; j++) {
                const avg = 0.5 * (K_eff.get(i, j) + K_eff.get(j, i));
                K_eff.set(i, j, avg);
                K_eff.set(j, i, avg);
            }
        for (let i = 0; i < resolution; i++) K_eff.set(i, i, K_eff.get(i, i) + 1e-8);
        return { K_eff, mu };
    })());

    const L  = $derived(new CholeskyDecomposition(posterior.K_eff).lowerTriangularMatrix);
    const Lu = $derived(L.mmul(us));  // precomputed, constant across frames
    const Lt = $derived(L.mmul(ts));  // precomputed, constant across frames

    const sample = $derived((() => {
        const angle = curFrame * 2 * Math.PI / (frames - 1);
        const cos_a = Math.cos(angle);
        const sin_a = Math.sin(angle);
        const mu = posterior.mu;
        return Array.from({ length: resolution }, (_, i) => mu[i] + cos_a * Lu.get(i, 0) + sin_a * Lt.get(i, 0));
    })());

    const pathD = $derived((() => {
        if (width === 0 || height === 0) return '';
        const cy = height / 2;
        const scale = height / 10;
        return sample.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${cy - y * scale}`).join(' ');
    })());
</script>

<path d={pathD} fill="none" stroke="currentColor" stroke-width="1.5"/>