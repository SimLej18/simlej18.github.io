<script lang="ts">
    import type { Snippet } from "svelte";

    let { id, active = true, children }: { id?: string; active?: boolean; children?: Snippet } = $props();
</script>

<div {id} class="h-screen bg-base-100 grid items-center snap-start px-16 py-16">
    <div class="transition-all duration-700 ease-out {active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}">
        {@render children?.()}
    </div>
</div>
