<script lang="ts">
    import { Matrix, CholeskyDecomposition } from "ml-matrix";

    let { width, height, length_scale, variance, resolution, frames, startFrame, points = [], vertical = false }: {
        width: number; height: number;
        length_scale: number; variance: number; resolution: number; frames: number; startFrame: number;
        points?: { x: number; y: number; noise: number }[];
        vertical?: boolean;  // input axis runs top→bottom, values spread left/right
    } = $props();

    // Prior samples use random Fourier features (Rahimi & Recht): f(x) = φ(x)·w with w ~ N(0, I)
    // approximates the RBF kernel and is evaluated anywhere in O(N_FEATURES), without a Cholesky
    // of the grid covariance — so long axes, fine resolutions and many samples stay cheap.
    const N_FEATURES = 200;

    let curFrame = $state(startFrame);

    export function nextFrame() {
        curFrame = (curFrame + 1) % frames;
    }

    function sampleNormal(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    const axisLen = $derived(vertical ? height : width);
    const xs = $derived(
        Array.from({ length: resolution }, (_, i) => i * axisLen / (resolution - 1))
    );

    const omegas = $derived(Array.from({ length: N_FEATURES }, () => sampleNormal() / length_scale));
    const phases = Array.from({ length: N_FEATURES }, () => Math.random() * 2 * Math.PI);
    // The animation walks along w(θ) = cos θ·u + sin θ·t, which is N(0, I) for every θ
    const u = Array.from({ length: N_FEATURES }, sampleNormal);
    const t = Array.from({ length: N_FEATURES }, sampleNormal);
    const amp = $derived(Math.sqrt(2 * variance / N_FEATURES));

    // [φ(x)·u, φ(x)·t]
    function features(x: number): [number, number] {
        let fu = 0, ft = 0;
        for (let j = 0; j < N_FEATURES; j++) {
            const c = Math.cos(omegas[j] * x + phases[j]);
            fu += c * u[j];
            ft += c * t[j];
        }
        return [amp * fu, amp * ft];
    }

    const gridFeatures = $derived(xs.map(features));  // precomputed, constant across frames

    function kernel(a: number, b: number): number {
        const d = (a - b) / length_scale;
        return variance * Math.exp(-0.5 * d * d);
    }

    // Pathwise conditioning (Matheron's rule): f_post(x) = f(x) + k(x, X)·(K_XX + Σ)⁻¹·(y − f(X)).
    // The observation-noise draw ε is left out, so while Σ is large the samples hug the points
    // slightly more than the exact posterior; as Σ decays to ~0 this becomes exact.
    const sample = $derived((() => {
        const angle = curFrame * 2 * Math.PI / (frames - 1);
        const cos_a = Math.cos(angle);
        const sin_a = Math.sin(angle);
        const prior = gridFeatures.map(([fu, ft]) => cos_a * fu + sin_a * ft);
        if (points.length === 0) return prior;

        const n = points.length;
        const K_obs = new Matrix(n, n);
        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                K_obs.set(i, j, kernel(points[i].x, points[j].x) + (i === j ? points[i].noise : 0));
        const residuals = Matrix.columnVector(points.map(p => {
            const [fu, ft] = features(p.x);
            return p.y - (cos_a * fu + sin_a * ft);
        }));
        const alpha = new CholeskyDecomposition(K_obs).solve(residuals).getColumn(0);
        return prior.map((f, i) => f + points.reduce((s, p, j) => s + kernel(xs[i], p.x) * alpha[j], 0));
    })());

    const pathD = $derived((() => {
        if (width === 0 || height === 0) return '';
        if (vertical) {
            const cx = width / 2;
            const scale = width / 10;
            return sample.map((y, i) => `${i === 0 ? 'M' : 'L'} ${cx + y * scale} ${xs[i]}`).join(' ');
        }
        const cy = height / 2;
        const scale = height / 10;
        return sample.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${cy - y * scale}`).join(' ');
    })());
</script>

<path d={pathD} fill="none" stroke="currentColor" stroke-width="1.5"/>
