<script lang="ts">
    // Same props as the other sections; the hero has no numbered title.
    let {}: { index: number } = $props();
</script>

<div class="max-w-3xl">
    <p class="font-mono text-accent mb-4">Hello, I'm Simon —</p>
    <p class="text-6xl font-bold leading-tight text-accent-content">
        Those wiggly lines? <span class="underline decoration-primary decoration-8 underline-offset-4">Gaussian processes.</span>
        That's my thing.
    </p>
    <p class="mt-8 text-lg max-w-xl">
        I'm a <strong>PhD student in Machine Learning at UNamur</strong>. I build models that know what they don't know, write the
        software that makes them <em>fast</em>, and create <em>fancy animations</em> to make them easy to understand.
    </p>
    <p class="mt-4 text-lg max-w-xl">
        I am also interested in <em>deep learning</em> and applications of machine learning for <em>planetary science</em>.
    </p>
    <div class="mt-10 flex gap-4">
        <a class="btn btn-primary" href="/resume">One-page resume</a>
        <span class="btn btn-ghost pointer-events-none font-mono">scroll ↓</span>
    </div>
</div>
