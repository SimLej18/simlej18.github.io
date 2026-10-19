<script lang="ts">
    let { index, title, label }: { index: number; title: string; label?: string } = $props();
</script>

<header class="mb-8">
    <p class="font-mono text-sm tracking-widest text-accent uppercase">
        {String(index + 1).padStart(2, "0")} — {title}
    </p>
    <div class="mt-2 h-1 w-16 rounded-full bg-primary"></div>
    {#if label}<p class="mt-4 opacity-70">{label}</p>{/if}
</header>
