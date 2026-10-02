<script lang="ts">
    import Footer from "../comps/Footer.svelte";
    import SectionContainer from "../comps/SectionContainer.svelte";
    import GPViz from "../comps/GPViz.svelte";
    import Home from "../Sections/Home.svelte";
    import About from "../Sections/About.svelte";
    import Timeline from "../Sections/Timeline.svelte";
    import Software from "../Sections/Software.svelte";
    import Talks from "../Sections/Talks.svelte";
    import Publications from "../Sections/Publications.svelte";
    import Blog from "../Sections/Blog.svelte";
    import Misc from "../Sections/Misc.svelte";
    import Contact from "../Sections/Contact.svelte";

    import {onMount, type Component} from "svelte";

    // Section order and labels live here, so a FR/EN switch only has to swap this table.
    const sections: { id: string; label: string; component: Component<{ index: number }> }[] = [
        {id: "home", label: "Home", component: Home},
        {id: "about", label: "About", component: About},
        {id: "timeline", label: "Timeline", component: Timeline},
        {id: "software", label: "Software", component: Software},
        {id: "talks", label: "Talks", component: Talks},
        {id: "publications", label: "Publications", component: Publications},
        {id: "blog", label: "Blog", component: Blog},
        {id: "misc", label: "Misc", component: Misc},
        {id: "contact", label: "Contact", component: Contact},
    ];

    let contentWrapper: HTMLElement;
    let rightSection: HTMLElement;
    let scrollContainer: HTMLElement;
    let gpLayer: HTMLElement;

    let activeIndex = $state(0);
    let gpWidth = $state(0);
    let gpHeight = $state(0);

    // Each section owns an observation point on the GP layer. Hand-picked irregular gaps and
    // values keep the points from lining up; the tables wrap if sections are added.
    // Gaps are in units of PARALLAX screens: with PARALLAX × gap < 0.5 the previous and next
    // points stay in view around the current one, which sits mid-strip when snapped.
    const PARALLAX = 0.3;
    const GAPS = [1.05, 0.8, 1.1, 0.9, 1.0, 0.85, 1.1, 0.95];
    // Values lean toward the side where the section's content shows: even sections are in the
    // left column, odd ones in the right column.
    const VALUES = [1.6, 2.4, 1.2, 2.0, 2.7, 1.4, 2.2, 1.8, 2.5];
    // Anchor positions along the GP layer, in screen heights
    const anchorPositions = sections.map((_, i) =>
        0.5 + PARALLAX * Array.from({length: i}, (_, j) => GAPS[j % GAPS.length]).reduce((a, b) => a + b, 0));
    const anchors = sections.map((_, i) => ({
        position: anchorPositions[i],
        value: (i % 2 === 0 ? -1 : 1) * VALUES[i % VALUES.length],
    }));
    const gpLength = $derived(gpHeight * (anchorPositions[anchorPositions.length - 1] + 0.5));
    // Samples are conditioned on every section down to the current one: scrolling back up releases them
    const points = $derived(gpHeight > 0
        ? anchors.slice(0, activeIndex + 1).map(a => ({x: a.position * gpHeight, y: a.value}))
        : []);

    function update() {
        // Read sizes on every call so window resizes are handled
        const containerHeight = scrollContainer.clientHeight;
        const translateWidth = rightSection.offsetWidth;
        const scrollTop = scrollContainer.scrollTop;
        // Scroll position in sections, clamped so scrolling into the footer moves nothing
        const position = Math.min(scrollTop / containerHeight, sections.length - 1);
        // Moving from section i to section i + 1
        const i = Math.min(Math.floor(position), sections.length - 2);
        const progress = position - i;

        if (i % 2 === 0) {
            // Moving right
            contentWrapper.style.transform = `translateX(-${progress * translateWidth}px)`;
        } else {
            // Moving left
            contentWrapper.style.transform = `translateX(-${translateWidth - progress * translateWidth}px)`;
        }

        // Between two snapped sections, the GP layer moves from one anchor to the next so each
        // section's anchor sits mid-strip when that section is snapped
        const anchor = anchorPositions[i] + (anchorPositions[i + 1] - anchorPositions[i]) * progress;
        gpLayer.style.transform = `translateY(-${(anchor - 0.5) * containerHeight}px)`;

        activeIndex = Math.round(position);
    }

    onMount(() => {
        update();
        scrollContainer.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        // The user taking over the scroll interrupts a section jump
        scrollContainer.addEventListener('wheel', stopScrollAnimation, {passive: true});
        scrollContainer.addEventListener('touchstart', stopScrollAnimation, {passive: true});
        return () => {
            stopScrollAnimation();
            scrollContainer.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            scrollContainer.removeEventListener('wheel', stopScrollAnimation);
            scrollContainer.removeEventListener('touchstart', stopScrollAnimation);
        };
    });

    // Section jumps are animated by hand: native smooth scrolling is too fast, has no easing
    // control and is janky on Chrome.
    let scrollAnimation = 0;

    function stopScrollAnimation() {
        cancelAnimationFrame(scrollAnimation);
        scrollContainer.style.scrollSnapType = '';
    }

    function goTo(index: number) {
        stopScrollAnimation();
        const from = scrollContainer.scrollTop;
        const to = index * scrollContainer.clientHeight;
        const screens = Math.abs(to - from) / scrollContainer.clientHeight;
        const duration = Math.min(2500, 800 + 300 * screens);
        const start = performance.now();
        // Snapping would fight the per-frame scrollTop updates
        scrollContainer.style.scrollSnapType = 'none';

        function step(now: number) {
            const p = Math.min(1, (now - start) / duration);
            const eased = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;  // ease-in-out cubic
            scrollContainer.scrollTop = from + (to - from) * eased;
            if (p < 1) scrollAnimation = requestAnimationFrame(step);
            else scrollContainer.style.scrollSnapType = '';
        }
        scrollAnimation = requestAnimationFrame(step);
    }
</script>

<div bind:this={scrollContainer}
     class="flex flex-col overflow-x-hidden snap-y snap-mandatory h-screen overflow-y-scroll">
    <div bind:this={contentWrapper}
         class="flex flex-row w-5/3 transition-transform">
        <div class="flex flex-col w-2/3">
            <!-- Left section. Only even sections are filled, the others are spacers -->
            {#each sections as s, i}
                <SectionContainer id={i % 2 === 0 ? s.id : undefined} active={i === activeIndex}>
                    {#if i % 2 === 0}<s.component index={i}/>{/if}
                </SectionContainer>
            {/each}
        </div>
        <div bind:clientWidth={gpWidth} bind:clientHeight={gpHeight}
             class="sticky top-0 self-start h-screen overflow-hidden text-accent-content w-1/3">
            <!-- Central section. Always visible, alternately on the right and on the left -->
            <div bind:this={gpLayer} class="relative" style:height="{gpLength}px">
                <!-- Parallax layer, scrolled by update() -->
                <GPViz nSamples={16} resolution={Math.max(2, Math.ceil(gpLength / 8))} variance={1}
                       width={gpWidth} height={gpLength} {points} vertical showPoints={false}/>
                {#each anchors as a, i}
                    {@const active = i === activeIndex}
                    {@const conditioned = i <= activeIndex}
                    <button class="group absolute cursor-pointer focus-visible:outline-none"
                            style:top="{a.position * gpHeight}px" style:left="{gpWidth / 2 + a.value * gpWidth / 10}px"
                            aria-current={active ? "true" : undefined}
                            onclick={() => goTo(i)}>
                        <!-- O: free, ⊙: the samples are conditioned on it -->
                        <span class="absolute grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full
                                     border-2 border-accent-content bg-base-100 ring-accent group-focus-visible:ring-2">
                            <span class="size-1.5 rounded-full bg-accent-content transition-transform duration-500
                                         {conditioned ? 'scale-100' : 'scale-0'}"></span>
                        </span>
                        <span class="absolute -translate-y-1/2 whitespace-nowrap font-mono uppercase tracking-widest
                                     transition-all {a.value < 0 ? 'right-4' : 'left-4'}
                                     {active ? 'text-base font-bold opacity-100' : 'text-xs opacity-50 group-hover:opacity-100'}">
                            {sections[i].label}
                        </span>
                    </button>
                {/each}
            </div>
        </div>
        <div bind:this={rightSection} class="flex flex-col w-2/3">
            <!-- Right section. Only odd sections are filled, the others are spacers -->
            {#each sections as s, i}
                <SectionContainer id={i % 2 === 1 ? s.id : undefined} active={i === activeIndex}>
                    {#if i % 2 === 1}<s.component index={i}/>{/if}
                </SectionContainer>
            {/each}
        </div>
    </div>
    <Footer {sections} onNavigate={goTo}/>
</div>

<style>
    .transition-transform {
        transition: transform 50ms ease-out;
    }
</style>
