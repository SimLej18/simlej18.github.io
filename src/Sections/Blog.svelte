<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Blog"/>
    <p>Well, this site only started existing not so long ago, so I didn't take the time to write some thoughts yet. But be sure that once I do, you will find them here!</p>
</div>
