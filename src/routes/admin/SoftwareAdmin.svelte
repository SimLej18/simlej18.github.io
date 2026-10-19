<script lang="ts">
    import { onMount } from "svelte";
    import {
        STATUSES, defaultTags, fetchGitHubRepo, fetchGitHubRepos, isOwnRepo, shortName, type SoftwareEntry
    } from "$lib/software";

    let entries: SoftwareEntry[] = $state([]);
    // Flags from the last GitHub refresh, not saved
    let added = $state(new Set<string>());
    let missing = $state(new Set<string>());
    let dirty = $state(false);
    let busy = $state(false);
    let message = $state("");
    let newRepo = $state("");

    const API = "/admin/software";

    onMount(async () => {
        entries = await (await fetch(API)).json();
    });

    async function run(action: () => Promise<string>) {
        busy = true;
        try {
            message = await action();
        } catch (e) {
            message = `Error: ${e instanceof Error ? e.message : e}`;
        } finally {
            busy = false;
        }
    }

    // Updates the GitHub snapshot of known repos and appends new repos of GITHUB_USER as unlisted.
    // Repos of other owners are only those added by hand. Repos gone from GitHub are kept and
    // flagged, to be removed by hand.
    const refresh = () => run(async () => {
        const repos = await fetchGitHubRepos();
        const own = repos.size;
        for (const e of entries.filter(e => !isOwnRepo(e.repo))) {
            const github = await fetchGitHubRepo(e.repo);
            if (github) repos.set(e.repo, github);
        }
        for (const e of entries) {
            const github = repos.get(e.repo);
            if (github) e.github = github;
        }
        const known = new Set(entries.map(e => e.repo));
        const fresh = [...repos].filter(([repo]) => !known.has(repo));
        entries.push(...fresh.map(([repo, github]) => ({ repo, status: "unlisted" as const, github })));
        added = new Set(fresh.map(([repo]) => repo));
        missing = new Set(entries.filter(e => !repos.has(e.repo)).map(e => e.repo));
        dirty = true;
        return `${own} own repos on GitHub, ${added.size} new, ${missing.size} missing`;
    });

    // Accepts "owner/name" or a GitHub URL
    const addRepo = () => run(async () => {
        const repo = newRepo.trim().replace(/^(https?:\/\/)?(www\.)?github\.com\//, "").replace(/(\.git)?\/?$/, "");
        if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error(`"${newRepo}" is not owner/name or a GitHub URL`);
        if (entries.some(e => e.repo.toLowerCase() === repo.toLowerCase())) throw new Error(`${repo} is already listed`);
        const github = await fetchGitHubRepo(repo);
        if (!github) throw new Error(`${repo} not found on GitHub`);
        entries.push({ repo, status: "unlisted", github });
        added = new Set([...added, repo]);
        newRepo = "";
        dirty = true;
        return `Added ${repo}`;
    });

    const save = () => run(async () => {
        const res = await fetch(API, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entries),
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        dirty = false;
        return "Saved to src/lib/data/software.json";
    });

    function edit(e: SoftwareEntry, apply: (e: SoftwareEntry) => void) {
        apply(e);
        dirty = true;
    }

    // Empty override fields fall back to the GitHub values
    function setText(e: SoftwareEntry, field: "name" | "description", value: string) {
        edit(e, e => { e[field] = value.trim() || undefined; });
    }

    function setTags(e: SoftwareEntry, value: string) {
        const tags = value.split(",").map(t => t.trim()).filter(Boolean);
        edit(e, e => { e.tags = tags.length ? tags : undefined; });
    }

    function move(i: number, offset: number) {
        const j = i + offset;
        [entries[i], entries[j]] = [entries[j], entries[i]];
        dirty = true;
    }

    function remove(i: number) {
        entries.splice(i, 1);
        dirty = true;
    }
</script>

<section>
    <div class="mb-6 flex items-center gap-4">
        <h2 class="font-mono text-2xl font-bold">Software</h2>
        <button class="btn btn-sm" disabled={busy} onclick={refresh}>Refresh from GitHub</button>
        <button class="btn btn-sm btn-primary" disabled={busy || !dirty} onclick={save}>Save</button>
        {#if dirty}<span class="badge badge-warning">Unsaved changes</span>{/if}
        <form class="join" onsubmit={ev => { ev.preventDefault(); addRepo(); }}>
            <input class="join-item input input-sm w-64" placeholder="owner/name or GitHub URL" bind:value={newRepo}/>
            <button class="join-item btn btn-sm" disabled={busy || !newRepo.trim()}>Add repo</button>
        </form>
        <span class="text-sm opacity-70">{message}</span>
    </div>

    <table class="table">
        <thead>
            <tr><th></th><th>Repo</th><th>Status</th><th>Name</th><th>Description</th><th>Tags</th><th></th></tr>
        </thead>
        <tbody>
            {#each entries as e, i (e.repo)}
                <tr class:opacity-50={e.status === "unlisted"}>
                    <td class="whitespace-nowrap">
                        <button class="btn btn-ghost btn-xs" aria-label="Move up" disabled={i === 0}
                                onclick={() => move(i, -1)}>↑</button>
                        <button class="btn btn-ghost btn-xs" aria-label="Move down" disabled={i === entries.length - 1}
                                onclick={() => move(i, 1)}>↓</button>
                    </td>
                    <td>
                        <a class="link font-mono" href={e.github.url} target="_blank" rel="noopener">{e.repo}</a>
                        <div class="mt-1 flex flex-wrap gap-1">
                            {#if added.has(e.repo)}<span class="badge badge-info badge-xs">new</span>{/if}
                            {#if missing.has(e.repo)}<span class="badge badge-error badge-xs">not on GitHub</span>{/if}
                            {#if e.github.fork}<span class="badge badge-xs">fork</span>{/if}
                            {#if e.github.archived}<span class="badge badge-xs">archived</span>{/if}
                            <span class="badge badge-ghost badge-xs">★ {e.github.stars}</span>
                        </div>
                    </td>
                    <td>
                        <div class="join">
                            {#each STATUSES as s}
                                <input class="join-item btn btn-xs" type="radio" name="status-{e.repo}" aria-label={s}
                                       checked={e.status === s} onchange={() => edit(e, e => { e.status = s; })}/>
                            {/each}
                        </div>
                    </td>
                    <td>
                        <input class="input input-sm w-36" placeholder={shortName(e.repo)} value={e.name ?? ""}
                               onchange={ev => setText(e, "name", ev.currentTarget.value)}/>
                    </td>
                    <td>
                        <textarea class="textarea textarea-sm w-72" rows="2" placeholder={e.github.description ?? ""}
                                  value={e.description ?? ""}
                                  onchange={ev => setText(e, "description", ev.currentTarget.value)}></textarea>
                    </td>
                    <td>
                        <input class="input input-sm w-44" placeholder={defaultTags(e.github).join(", ")}
                               value={e.tags?.join(", ") ?? ""}
                               onchange={ev => setTags(e, ev.currentTarget.value)}/>
                    </td>
                    <td>
                        {#if missing.has(e.repo)}
                            <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(i)}>Remove</button>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
