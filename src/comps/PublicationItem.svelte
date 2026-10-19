<script lang="ts">
    import Authors from "./Authors.svelte";
    import type { Publication } from "$lib/publications";

    let { publication: p }: { publication: Publication } = $props();
</script>

<a href={p.href} class="block border-l-4 border-primary pl-5 transition-transform hover:translate-x-1">
    <div class="text-lg font-bold text-accent-content">{p.title}</div>
    <div><Authors authors={p.authors}/></div>
    <div class="mt-1 font-mono text-sm"><span class="italic">{p.venue}</span>{#if p.year} · {p.year}{/if}</div>
</a>
