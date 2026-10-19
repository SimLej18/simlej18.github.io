<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";
    import { included as publications } from "$lib/publications-data";
    import { included as talks } from "$lib/talks-data";
    import { included as software } from "$lib/software-data";

    let { index }: { index: number } = $props();

    const posters = talks.filter(t => t.isPoster).length;
    const stats = [
        { title: "Publications", value: publications.length, desc: "papers & articles" },
        { title: "Talks & posters", value: talks.length, desc: `${talks.length - posters} talks, ${posters} posters` },
        { title: "Software", value: software.length, desc: "open-source projects" },
    ];
</script>

<div class="max-w-4xl">
    <SectionTitle {index} title="About"/>
    <div class="flex gap-12 items-start">
        <div class="avatar avatar-placeholder shrink-0">
            <div class="group mask mask-squircle relative w-40 bg-cover bg-center text-primary-content" style="background-image: url('/profile.jpg')">
                <!-- Primary-coloured fade over the photo, removed on hover to reveal it -->
                <div class="absolute inset-0 bg-primary opacity-60 transition-opacity group-hover:opacity-0"></div>
                <span class="relative text-4xl font-mono transition-opacity group-hover:opacity-0">SL</span>
            </div>
        </div>
        <div class="space-y-4 text-lg">
            <p>
                I'm Simon, a computer science researcher currently focused on probabilistic models applied to planetary
                science data. I like to learn and teach many things related to machine learning, algorithmics and applied
                linear algebra.
            </p>
            <p>
                If you landed here, chances are you saw one of my talks or posters! Then you might already know that I put
                special care into making what I learnt accessible to others with clear and illustrated narratives!
            </p>
        </div>
    </div>
    <div class="stats shadow mt-10 bg-base-200">
        {#each stats as st (st.title)}
            <div class="stat">
                <div class="stat-title">{st.title}</div>
                <div class="stat-value text-accent-content">{st.value}</div>
                <div class="stat-desc">{st.desc}</div>
            </div>
        {/each}
    </div>
</div>
