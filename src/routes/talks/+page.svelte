<script lang="ts">
    import { included } from "$lib/talks-data";
</script>

<svelte:head><title>Talks — Simon Lejoly</title></svelte:head>

<main class="mx-auto max-w-4xl px-16 py-16">
    <a href="/" class="link link-hover font-mono text-sm">← Home</a>
    <h1 class="mt-8 mb-8 font-mono text-3xl font-bold">Talks & posters</h1>
    <ul class="space-y-4">
        {#each included as t (t.url)}
            <li>
                <a href={t.href}
                   class="flex items-center gap-6 rounded-box bg-base-200 p-4 transition-all hover:-translate-y-1 hover:shadow-xl">
                    <img class="aspect-video w-40 shrink-0 rounded object-cover object-top" src={t.thumbnail} alt="" loading="lazy"/>
                    <div class="grow">
                        <div class="text-lg font-bold text-accent-content">{t.title}</div>
                        <div class="italic">{t.venue}</div>
                    </div>
                    <div class="flex shrink-0 flex-col items-end gap-2">
                        <span class="badge badge-outline">{t.kind}</span>
                        <span class="font-mono text-sm">{t.date}</span>
                    </div>
                </a>
            </li>
        {/each}
    </ul>
</main>
