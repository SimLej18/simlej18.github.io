<script lang="ts">
    import GPViz from "../../comps/GPViz.svelte";

    const nSamples = 100;
    const resolution = 100;
    const variance = 1.;

    let containerWidth = $state(0);
    let containerHeight = $state(0);
</script>

<div class="p-16 h-screen">  <!-- Fills the whole page with padding -->
    <div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight} class="bg-base-200 h-full">  <!-- container for the whole GP visualisation -->
        <GPViz {nSamples} {resolution} {variance} width={containerWidth} height={containerHeight}/>
    </div>
</div>