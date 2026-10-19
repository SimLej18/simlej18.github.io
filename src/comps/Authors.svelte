<script lang="ts">
    import { isOwnName } from "$lib/publications";

    let { authors }: { authors: string[] } = $props();
</script>

{#each authors as author, i}{#if i}{", "}{/if}{#if isOwnName(author)}<strong>{author}</strong>{:else}{author}{/if}{/each}
