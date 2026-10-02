<script lang="ts">
    import SectionTitle from "../comps/SectionTitle.svelte";

    let { index }: { index: number } = $props();
</script>

<div class="max-w-4xl">
    <SectionTitle {index} title="About"/>
    <div class="flex gap-12 items-start">
        <div class="avatar avatar-placeholder shrink-0">
            <div class="mask mask-squircle w-40 bg-primary text-primary-content">
                <span class="text-4xl font-mono">SL</span>
            </div>
        </div>
        <div class="space-y-4 text-lg">
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus
                ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
            </p>
            <p>
                Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum
                lacinia arcu eget nulla.
            </p>
        </div>
    </div>
    <div class="stats shadow mt-10 bg-base-200">
        <div class="stat">
            <div class="stat-title">Lorem</div>
            <div class="stat-value text-accent-content">12</div>
            <div class="stat-desc">ipsum dolor</div>
        </div>
        <div class="stat">
            <div class="stat-title">Sit amet</div>
            <div class="stat-value text-accent-content">34</div>
            <div class="stat-desc">consectetur</div>
        </div>
        <div class="stat">
            <div class="stat-title">Adipiscing</div>
            <div class="stat-value text-accent-content">5</div>
            <div class="stat-desc">elit sed do</div>
        </div>
    </div>
</div>
