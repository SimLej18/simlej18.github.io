<script lang="ts">
    let { data } = $props();
    const talk = $derived(data.talk);
    const paragraphs = $derived(talk.description.split(/\n\s*\n/).filter(Boolean));
</script>

<svelte:head><title>{talk.title} — Simon Lejoly</title></svelte:head>

<main class="mx-auto max-w-5xl px-16 py-16">
    <a href="/talks/" class="link link-hover font-mono text-sm">← All talks & posters</a>
    <header class="mt-8 mb-6">
        <div class="flex items-center gap-3 font-mono text-sm">
            <span class="badge badge-outline">{talk.kind}</span>
            <span>{talk.date}</span>
        </div>
        <h1 class="mt-3 font-mono text-3xl font-bold text-accent-content">{talk.title}</h1>
        <p class="mt-2 italic">{talk.venue}</p>
    </header>
    {#each paragraphs as p}<p class="mb-4 max-w-3xl">{p}</p>{/each}

    <div class="mt-8 mb-3 flex justify-end gap-6">
        <a href={talk.url} target="_blank" rel="noopener" class="link link-hover font-mono text-sm">
            Open {talk.isPoster ? "poster" : "slides"} full page ↗
        </a>
        {#if talk.pdf}
            <a href={talk.pdf} download class="link link-hover font-mono text-sm">Download PDF ↓</a>
        {/if}
    </div>
    <!-- Decks are 16:9; posters are A-series portrait (1:√2) -->
    <iframe class="w-full rounded-box bg-base-200 shadow-xl {talk.isPoster ? 'aspect-[1/1.414]' : 'aspect-video'}"
            src={talk.url} title={talk.title} allow="fullscreen; autoplay" allowfullscreen loading="lazy"></iframe>
</main>
