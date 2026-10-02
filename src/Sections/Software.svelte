<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();

    const projects = [
        { name: "lorem-ipsum", desc: "Dolor sit amet, consectetur adipiscing elit.", tags: ["Python", "JAX"] },
        { name: "dolor.js", desc: "Sed do eiusmod tempor incididunt ut labore.", tags: ["TypeScript", "Svelte"] },
        { name: "sit-amet", desc: "Ut enim ad minim veniam, quis nostrud.", tags: ["Rust"] },
        { name: "consectetur", desc: "Duis aute irure dolor in reprehenderit.", tags: ["Python", "PyTorch"] },
    ];
</script>

<div class="max-w-4xl">
    <SectionTitle {index} title="Software"/>
    <div class="grid grid-cols-2 gap-6">
        {#each projects as p}
            <div class="card bg-base-200 hover:-translate-y-1 hover:shadow-xl transition-all">
                <div class="card-body">
                    <h3 class="card-title font-mono text-accent-content">{p.name}</h3>
                    <p>{p.desc}</p>
                    <div class="card-actions mt-2">
                        {#each p.tags as t}<span class="badge badge-primary badge-sm">{t}</span>{/each}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>
