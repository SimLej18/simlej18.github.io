<script lang="ts">
    import { onMount } from "svelte";
    import {
        SLUG, STATUSES, byDate, defaultSlug, fetchCsl, parseDoi, type Override, type PublicationEntry
    } from "$lib/publications";

    let entries: PublicationEntry[] = $state([]);
    // Flags from the last add or refresh, not saved
    let added = $state(new Set<PublicationEntry>());
    let missing = $state(new Set<string>());
    let dirty = $state(false);
    let busy = $state(false);
    let message = $state("");
    let newDoi = $state("");

    const API = "/admin/publications";

    onMount(async () => {
        entries = (await (await fetch(API)).json() as PublicationEntry[]).sort(byDate);
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

    function append(e: PublicationEntry) {
        e.slug = defaultSlug(e) || "untitled";
        entries.push(e);
        added = new Set([...added, entries.at(-1)!]);
        dirty = true;
    }

    // Updates the DOI snapshots. Overrides are kept. DOIs no longer registered are flagged.
    const refresh = () => run(async () => {
        const gone: string[] = [];
        for (const e of entries.filter(e => e.doi)) {
            const csl = await fetchCsl(e.doi!);
            if (csl) e.csl = csl;
            else gone.push(e.doi!);
        }
        missing = new Set(gone);
        dirty = true;
        return `${entries.filter(e => e.doi).length} DOIs refreshed, ${missing.size} not found`;
    });

    const addDoi = () => run(async () => {
        const doi = parseDoi(newDoi);
        if (!doi) throw new Error(`"${newDoi}" holds no DOI`);
        if (entries.some(e => e.doi === doi)) throw new Error(`${doi} is already listed`);
        const csl = await fetchCsl(doi);
        if (!csl) throw new Error(`${doi} is not registered`);
        append({ slug: "", status: "unlisted", doi, csl, notes: "", links: [] });
        newDoi = "";
        return `Added ${csl.title}`;
    });

    function addManual() {
        append({ slug: "", status: "unlisted", title: "", authors: [], venue: "", date: "", notes: "", links: [] });
        message = "Added an entry without DOI: fill in its fields";
    }

    const save = () => run(async () => {
        const res = await fetch(API, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entries),
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        dirty = false;
        return "Saved to src/lib/data/publications.json";
    });

    function edit(e: PublicationEntry, apply: (e: PublicationEntry) => void) {
        apply(e);
        dirty = true;
    }

    // Empty override fields fall back to the DOI snapshot. Entries without a snapshot keep empty values.
    function setOverride(e: PublicationEntry, field: Override, value: string) {
        const v = value.trim();
        edit(e, e => {
            if (!v && e.csl) delete e[field];
            else if (field === "authors") e.authors = v.split(",").map(a => a.trim()).filter(Boolean);
            else e[field] = v;
        });
    }

    const snapshot = (e: PublicationEntry, field: Override) =>
        field === "authors" ? e.csl?.author.join(", ") ?? "" : e.csl?.[field] ?? "";

    const current = (e: PublicationEntry, field: Override) =>
        field === "authors" ? e.authors?.join(", ") ?? "" : e[field] ?? "";

    function remove(i: number) {
        entries.splice(i, 1);
        dirty = true;
    }
</script>

<section>
    <div class="mb-6 flex flex-wrap items-center gap-4">
        <h2 class="font-mono text-2xl font-bold">Publications</h2>
        <button class="btn btn-sm" disabled={busy} onclick={refresh}>Refresh DOIs</button>
        <button class="btn btn-sm btn-primary" disabled={busy || !dirty} onclick={save}>Save</button>
        {#if dirty}<span class="badge badge-warning">Unsaved changes</span>{/if}
        <form class="join" onsubmit={ev => { ev.preventDefault(); addDoi(); }}>
            <input class="join-item input input-sm w-64" placeholder="DOI or doi.org URL" bind:value={newDoi}/>
            <button class="join-item btn btn-sm" disabled={busy || !newDoi.trim()}>Add DOI</button>
        </form>
        <button class="btn btn-sm" disabled={busy} onclick={addManual}>Add without DOI</button>
        {#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
        <span class="text-sm opacity-70">{message}</span>
    </div>

    <p class="mb-4 text-sm opacity-70">Empty fields show the DOI metadata in grey; type in them to override it.</p>

    <table class="table">
        <thead>
            <tr><th>DOI / Slug</th><th>Status</th><th>Title / Authors / Venue / Date</th><th>Abstract / Notes</th><th>Links</th><th></th></tr>
        </thead>
        <tbody>
            {#each entries as e, i}
                <tr class="align-top" class:opacity-50={e.status === "unlisted"}>
                    <td>
                        {#if e.doi}
                            <a class="link font-mono text-xs break-all" href="https://doi.org/{e.doi}" target="_blank"
                               rel="noopener">{e.doi}</a>
                        {:else}
                            <span class="text-xs opacity-70">No DOI</span>
                        {/if}
                        <input class="input input-sm mt-1 w-44 font-mono" class:input-error={!SLUG.test(e.slug)}
                               aria-label="Slug" value={e.slug}
                               onchange={ev => edit(e, e => { e.slug = ev.currentTarget.value.trim(); })}/>
                        <div class="mt-1 flex flex-wrap gap-1">
                            {#if added.has(e)}<span class="badge badge-info badge-xs">new</span>{/if}
                            {#if e.doi && missing.has(e.doi)}<span class="badge badge-error badge-xs">DOI not found</span>{/if}
                            {#if e.csl?.type}<span class="badge badge-ghost badge-xs">{e.csl.type}</span>{/if}
                        </div>
                    </td>
                    <td>
                        <div class="join">
                            {#each STATUSES as s}
                                <input class="join-item btn btn-xs" type="radio" name="pub-status-{i}" aria-label={s}
                                       checked={e.status === s} onchange={() => edit(e, e => { e.status = s; })}/>
                            {/each}
                        </div>
                    </td>
                    <td class="space-y-1">
                        {#each [["title", "Title"], ["authors", "Authors, comma separated"], ["venue", "Venue"]] as [field, label]}
                            <input class="input input-sm w-80" aria-label={label}
                                   placeholder={snapshot(e, field as Override) || label} value={current(e, field as Override)}
                                   onchange={ev => setOverride(e, field as Override, ev.currentTarget.value)}/>
                        {/each}
                        <input class="input input-sm w-36 font-mono" aria-label="Date, YYYY or YYYY-MM"
                               class:input-error={!/^(\d{4}(-\d{2})?)?$/.test(current(e, "date"))}
                               placeholder={snapshot(e, "date") || "YYYY-MM"} value={current(e, "date")}
                               onchange={ev => setOverride(e, "date", ev.currentTarget.value)}/>
                    </td>
                    <td class="space-y-1">
                        <textarea class="textarea textarea-sm w-80" rows="4" aria-label="Abstract"
                                  placeholder={snapshot(e, "abstract") || "Abstract"} value={current(e, "abstract")}
                                  onchange={ev => setOverride(e, "abstract", ev.currentTarget.value)}></textarea>
                        <textarea class="textarea textarea-sm w-80" rows="2" placeholder="Notes, shown on the site"
                                  value={e.notes}
                                  onchange={ev => edit(e, e => { e.notes = ev.currentTarget.value.trim(); })}></textarea>
                    </td>
                    <td class="space-y-1">
                        {#each e.links as link, j}
                            <div class="join">
                                <input class="join-item input input-sm w-20" placeholder="Label" value={link.label}
                                       onchange={ev => edit(e, () => { link.label = ev.currentTarget.value.trim(); })}/>
                                <input class="join-item input input-sm w-48" placeholder="URL" value={link.url}
                                       onchange={ev => edit(e, () => { link.url = ev.currentTarget.value.trim(); })}/>
                                <button class="join-item btn btn-sm" aria-label="Remove link"
                                        onclick={() => edit(e, e => { e.links.splice(j, 1); })}>✕</button>
                            </div>
                        {/each}
                        <button class="btn btn-ghost btn-xs"
                                onclick={() => edit(e, e => { e.links.push({ label: "", url: "" }); })}>+ Link</button>
                    </td>
                    <td>
                        <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(i)}>Remove</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
