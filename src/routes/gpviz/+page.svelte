<script lang="ts">
    import GPViz from "../../comps/GPViz.svelte";

    const nSamples = 3;
    const resolution = 100;
    const variance = 1.;

    let containerWidth = $state(0);
    let containerHeight = $state(0);

    let midPointActive = $state(false);
    const points = $derived(
        midPointActive && containerWidth > 0
            ? [{ x: containerWidth / 2, y: 1.5 }]
            : []
    );
</script>

<div class="p-16 h-screen">  <!-- Fills the whole page with padding -->
    <div bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}
         class="bg-base-200 h-full relative">  <!-- container for the whole GP visualisation -->
        <GPViz {nSamples} {resolution} {variance} width={containerWidth} height={containerHeight} {points}/>
        <button class="btn btn-sm btn-primary absolute top-4 right-4"
                onclick={() => midPointActive = !midPointActive}>
            {midPointActive ? "Remove point" : "Add midpoint"}
        </button>
    </div>
</div>