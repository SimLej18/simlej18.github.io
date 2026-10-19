<script lang="ts">
    import { onMount } from "svelte";
    import { KINDS, SLUG, STATUSES, byDate, defaultSlug, type ScannedFile, type TalkEntry } from "$lib/talks";

    let entries: TalkEntry[] = $state([]);
    // Flags from the last scan, not saved
    let added = $state(new Set<string>());
    let missing = $state(new Set<string>());
    let dirty = $state(false);
    let busy = $state(false);
    let message = $state("");
    // Bumped when media are regenerated, so the browser reloads the thumbnails
    let version = $state(Date.now());

    const API = "/admin/talks";

    onMount(async () => {
        entries = (await (await fetch(API)).json() as TalkEntry[]).sort(byDate);
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

    async function post(body?: object): Promise<unknown> {
        const res = await fetch(API, { method: "POST", body: body && JSON.stringify(body) });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        return res.json();
    }

    function applyMedia(e: TalkEntry, s: ScannedFile) {
        e.thumbnail = s.thumbnail;
        e.preview = s.preview;
        e.pdf = s.pdf;
        // A scan of already generated media does not know the slide: keep the saved one
        if (s.slide) e.slide = s.slide;
    }

    // Lists static/talks: new files are appended as unlisted, files gone from disk are kept and
    // flagged, to be removed by hand. Media are generated only for files that have none.
    const scan = () => run(async () => {
        const scanned = await post() as ScannedFile[];
        const known = new Map(entries.map(e => [e.file, e]));
        const fresh: TalkEntry[] = [];
        for (const s of scanned) {
            const e = known.get(s.file);
            if (e) applyMedia(e, s);
            else fresh.push({
                ...s,
                slug: defaultSlug(s.file),
                status: "unlisted",
                kind: s.pdf || s.file.toLowerCase().endsWith(".pdf") ? "Poster" : "Talk",
                title: s.file.split("/")[0],
                venue: "",
                date: "",
                description: "",
            });
        }
        entries.push(...fresh);
        added = new Set(fresh.map(e => e.file));
        missing = new Set(entries.filter(e => !scanned.some(s => s.file === e.file)).map(e => e.file));
        version = Date.now();
        dirty = true;
        return `${scanned.length} files in static/talks, ${added.size} new, ${missing.size} missing`;
    });

    const regenerate = (e: TalkEntry, slide: number) => run(async () => {
        applyMedia(e, await post({ file: e.file, slide }) as ScannedFile);
        version = Date.now();
        dirty = true;
        return `${e.file}: media from slide ${slide}`;
    });

    const save = () => run(async () => {
        const res = await fetch(API, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entries),
        });
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        dirty = false;
        return "Saved to src/lib/data/talks.json";
    });

    function edit(e: TalkEntry, apply: (e: TalkEntry) => void) {
        apply(e);
        dirty = true;
    }

    function remove(i: number) {
        entries.splice(i, 1);
        dirty = true;
    }
</script>

<section>
    <div class="mb-6 flex items-center gap-4">
        <h2 class="font-mono text-2xl font-bold">Talks</h2>
        <button class="btn btn-sm" disabled={busy} onclick={scan}>Scan static/talks</button>
        <button class="btn btn-sm btn-primary" disabled={busy || !dirty} onclick={save}>Save</button>
        {#if dirty}<span class="badge badge-warning">Unsaved changes</span>{/if}
        {#if busy}<span class="loading loading-spinner loading-sm"></span>{/if}
        <span class="text-sm opacity-70">{message}</span>
    </div>

    <table class="table">
        <thead>
            <tr><th>Preview</th><th>File / Slug</th><th>Status</th><th>Kind</th><th>Title / Venue / Description</th><th>Date</th><th></th></tr>
        </thead>
        <tbody>
            {#each entries as e, i (e.file)}
                <tr class:opacity-50={e.status === "unlisted"}>
                    <td>
                        <img class="w-40 rounded" src="/talks/{e.thumbnail}?v={version}" alt=""/>
                        {#if e.preview}
                            <form class="join mt-1" onsubmit={ev => {
                                ev.preventDefault();
                                regenerate(e, Number(new FormData(ev.currentTarget).get("slide")));
                            }}>
                                <input class="join-item input input-xs w-16" type="number" min="1" name="slide"
                                       aria-label="Slide" value={e.slide ?? 1}/>
                                <button class="join-item btn btn-xs" disabled={busy}>Use slide</button>
                            </form>
                        {/if}
                    </td>
                    <td>
                        <a class="link font-mono text-xs" href="/talks/{e.file}" target="_blank" rel="noopener">{e.file}</a>
                        <input class="input input-sm mt-1 w-40 font-mono" class:input-error={!SLUG.test(e.slug)}
                               aria-label="Slug" value={e.slug}
                               onchange={ev => edit(e, e => { e.slug = ev.currentTarget.value.trim(); })}/>
                        <div class="mt-1 flex flex-wrap gap-1">
                            {#if added.has(e.file)}<span class="badge badge-info badge-xs">new</span>{/if}
                            {#if missing.has(e.file)}<span class="badge badge-error badge-xs">not on disk</span>{/if}
                        </div>
                    </td>
                    <td>
                        <div class="join">
                            {#each STATUSES as s}
                                <input class="join-item btn btn-xs" type="radio" name="talk-status-{e.file}" aria-label={s}
                                       checked={e.status === s} onchange={() => edit(e, e => { e.status = s; })}/>
                            {/each}
                        </div>
                    </td>
                    <td>
                        <select class="select select-sm w-28" value={e.kind}
                                onchange={ev => edit(e, e => { e.kind = ev.currentTarget.value as TalkEntry["kind"]; })}>
                            {#each KINDS as k}<option>{k}</option>{/each}
                        </select>
                    </td>
                    <td class="space-y-1">
                        <input class="input input-sm w-72" placeholder="Title" value={e.title}
                               onchange={ev => edit(e, e => { e.title = ev.currentTarget.value.trim(); })}/>
                        <input class="input input-sm w-72" placeholder="Venue" value={e.venue}
                               onchange={ev => edit(e, e => { e.venue = ev.currentTarget.value.trim(); })}/>
                        <textarea class="textarea textarea-sm w-72" rows="3" placeholder="Short description"
                                  value={e.description}
                                  onchange={ev => edit(e, e => { e.description = ev.currentTarget.value.trim(); })}></textarea>
                    </td>
                    <td>
                        <input class="input input-sm w-36" type="month" value={e.date}
                               onchange={ev => edit(e, e => { e.date = ev.currentTarget.value; })}/>
                    </td>
                    <td>
                        {#if missing.has(e.file)}
                            <button class="btn btn-ghost btn-xs text-error" onclick={() => remove(i)}>Remove</button>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</section>
