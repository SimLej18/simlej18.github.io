<script lang="ts">
    // Same props as the other sections; the hero has no numbered title.
    let {}: { index: number } = $props();
</script>

<div class="max-w-3xl">
    <p class="font-mono text-accent mb-4">Hello, I'm Simon —</p>
    <p class="text-6xl font-bold leading-tight text-accent-content">
        Lorem ipsum dolor sit amet, <span class="underline decoration-primary decoration-8 underline-offset-4">consectetur</span>
        adipiscing elit.
    </p>
    <p class="mt-8 text-lg max-w-xl">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
        exercitation ullamco laboris.
    </p>
    <div class="mt-10 flex gap-4">
        <a class="btn btn-primary" href="/resume">One-page resume</a>
        <span class="btn btn-ghost pointer-events-none font-mono">scroll ↓</span>
    </div>
</div>
