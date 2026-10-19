<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import TalkStack from "../comps/TalkStack.svelte";
    import { featured } from "$lib/talks-data";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-3xl">
    <SectionTitle {index} title="Talks" label="I focus my talks on illustration-first narratives, with neat animations, targeted to specific audiences."/>
    <TalkStack talks={featured}/>
    <a href="/talks/" class="link link-hover mt-10 inline-block font-mono text-sm">All talks & posters →</a>
</div>
