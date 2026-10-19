<script lang="ts">
    import type { Project } from "$lib/software";

    let { project }: { project: Project } = $props();
</script>

<a href={project.url} target="_blank" rel="noopener"
   class="card bg-base-200 hover:-translate-y-1 hover:shadow-xl transition-all">
    <div class="card-body">
        <div class="flex items-start justify-between gap-4">
            <h3 class="card-title font-mono text-accent-content">{project.name}</h3>
            <!-- GitHub has no link that stars a repo: this opens the repo like the rest of the card -->
            <span class="group/star flex shrink-0 items-center gap-1 font-mono text-sm">
                <span class="hidden group-hover/star:inline">Star on GitHub</span>
                <span class="transition-colors group-hover/star:text-warning">★</span>
                {project.stars}
            </span>
        </div>
        <p>{project.description}</p>
        <div class="card-actions mt-2">
            {#each project.tags as t}<span class="badge badge-primary badge-sm">{t}</span>{/each}
        </div>
    </div>
</a>
