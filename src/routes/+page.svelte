<script lang="ts">
    import Navbar from "../comps/Navbar.svelte";
    import {onMount} from "svelte";

    let contentWrapper: HTMLElement;
    let leftSection: HTMLElement;
    let rightSection: HTMLElement;
    let scrollContainer: HTMLElement;

    onMount(() => {
        // Retrieve container height (same as window height in this case)
        const containerHeight = scrollContainer.clientHeight;

        // Calculate the width to translate
        const translateWidth = rightSection.offsetWidth;

        // Handle scroll events on the container instead of window
        scrollContainer.addEventListener('scroll', () => {
            const scrollTop = scrollContainer.scrollTop;
            const currentSection = Math.floor(scrollTop / containerHeight);
            const progress = (scrollTop % containerHeight) / containerHeight;

            if (currentSection % 2 === 0) {
                // Moving right
                const translateX = progress * translateWidth;
                contentWrapper.style.transform = `translateX(-${translateX}px)`;
            } else {
                // Moving left
                const translateX = translateWidth - (progress * translateWidth);
                contentWrapper.style.transform = `translateX(-${translateX}px)`;
            }
        });
    });
</script>

<Navbar/>
<div
        bind:this={scrollContainer}
        class="flex flex-col overflow-x-hidden snap-y snap-mandatory h-screen overflow-y-scroll"
>
    <div
            bind:this={contentWrapper}
            class="flex flex-row w-5/3 transition-transform"
    >
        <div bind:this={leftSection} class="flex flex-col w-2/3">
            <!-- Left section. Only odd childs will be visible-->
            <div class="h-screen bg-base-200 grid items-center snap-start">
                <h2>Section 1</h2>
            </div>
            <div class="h-screen bg-base-300 grid items-center snap-start">
            </div>
            <div class="h-screen bg-base-200 grid items-center snap-start">
                <h2>Section 3</h2>
            </div>
        </div>
        <div class="h-full bg-base-100 w-1/3">
            <!-- Central section. Always visible -->
        </div>
        <div bind:this={rightSection} class="flex flex-col w-2/3">
            <!-- Right section. Only even childs will be visible-->
            <div class="h-screen bg-base-300 grid items-center snap-start">
            </div>
            <div class="h-screen bg-base-200 grid items-center snap-start">
                <h2>Section 2</h2>
            </div>
            <div class="h-screen bg-base-300 grid items-center snap-start">
            </div>
        </div>
    </div>
</div>
<div class="fixed bottom-0 w-screen flex flex-row justify-around p-8">
    <div class="btn btn-error">Next</div>
</div>

<style>
    .transition-transform {
        transition: transform 50ms ease-out;
    }
</style>