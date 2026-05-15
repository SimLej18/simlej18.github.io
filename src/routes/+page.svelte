<script lang="ts">
    import Navbar from "../comps/Navbar.svelte";
    import SectionContainer from "../comps/SectionContainer.svelte";
    import Placeholder from "../Sections/Placeholder.svelte";
    import Empty from "../Sections/Empty.svelte";

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
        scrollContainer.addEventListener('scroll', (e) => {
            const scrollTop = scrollContainer.scrollTop;
            const currentSection = Math.floor(scrollTop / containerHeight) + 1;

            const progress = (scrollTop % containerHeight) / containerHeight;

            if (currentSection % 2 === 1) {
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

    function next() {
        //FIXME: on Chrome the scroll is not smooth
        const containerHeight = scrollContainer.clientHeight;
        const scrollTop = scrollContainer.scrollTop;
        const nextSection = Math.floor(scrollTop / containerHeight) + 2;
        console.log(nextSection)
        scrollContainer.scrollTo({
            top: (nextSection - 1) * containerHeight,
            behavior: 'smooth'
        });
    }
</script>

<Navbar/>
<div bind:this={scrollContainer}
     class="flex flex-col overflow-x-hidden snap-y snap-mandatory h-screen overflow-y-scroll">
    <div bind:this={contentWrapper}
         class="flex flex-row w-5/3 transition-transform">
        <div bind:this={leftSection} class="flex flex-col w-2/3">
            <!-- Left section. Only odd childs will be visible-->
            <SectionContainer id="section-1">
                <Placeholder nb="1"/>
            </SectionContainer>
            <SectionContainer>
            </SectionContainer>
            <SectionContainer id="section-3">
                <Placeholder nb="3"/>
            </SectionContainer>
        </div>
        <div class="h-full bg-base-200 w-1/3">  <!-- TODO: bg-base-100 -->
            <!-- Central section. Always visible -->
        </div>
        <div bind:this={rightSection} class="flex flex-col w-2/3">
            <!-- Right section. Only even childs will be visible-->
            <SectionContainer>
            </SectionContainer>
            <SectionContainer id="section-2">
                <Placeholder nb="2"/>
            </SectionContainer>
            <SectionContainer>
            </SectionContainer>
        </div>
    </div>
</div>
<div class="fixed bottom-0 w-screen flex flex-row justify-around p-8">
    <button class="btn btn-error" onclick={next}>Next</button>
</div>

<style>
    .transition-transform {
        transition: transform 50ms ease-out;
    }
</style>