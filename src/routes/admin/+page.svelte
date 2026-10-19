<script lang="ts">
    import { onMount } from "svelte";
    import SoftwareAdmin from "./SoftwareAdmin.svelte";
    import TalksAdmin from "./TalksAdmin.svelte";
    import PublicationsAdmin from "./PublicationsAdmin.svelte";

    const tabs = [
        { id: "software", label: "Software", component: SoftwareAdmin },
        { id: "talks", label: "Talks", component: TalksAdmin },
        { id: "publications", label: "Publications", component: PublicationsAdmin },
    ];

    // Active tab is kept in the URL hash, so it survives reloads
    let active = $state(tabs[0].id);

    function syncFromHash() {
        const id = location.hash.slice(1);
        if (tabs.some(t => t.id === id)) active = id;
    }

    onMount(() => {
        syncFromHash();
        window.addEventListener("hashchange", syncFromHash);
        return () => window.removeEventListener("hashchange", syncFromHash);
    });
</script>

<svelte:head><title>Admin</title></svelte:head>

<main class="mx-auto max-w-6xl space-y-8 p-8">
    <div role="tablist" class="tabs tabs-border">
        {#each tabs as tab (tab.id)}
            <a role="tab" href="#{tab.id}" class="tab" class:tab-active={active === tab.id}
               aria-selected={active === tab.id}>{tab.label}</a>
        {/each}
    </div>

    <!-- All tabs stay mounted so unsaved edits survive switching tabs -->
    {#each tabs as tab (tab.id)}
        <div role="tabpanel" hidden={active !== tab.id}>
            <tab.component/>
        </div>
    {/each}
</main>
