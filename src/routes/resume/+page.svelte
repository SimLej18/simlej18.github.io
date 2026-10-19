<script lang="ts">
    import { onMount, tick } from "svelte";
    import GPViz from "../../comps/GPViz.svelte";
    import Authors from "../../comps/Authors.svelte";
    import { contactLinks } from "$lib/contact-links";
    import { timeline, emphasised } from "$lib/timeline";
    import { misc } from "$lib/misc";
    import { included as publications } from "$lib/publications-data";
    import { included as talks } from "$lib/talks-data";
    import { featured as software } from "$lib/software-data";

    // One A4 page, sized in cqw (1cqw = 1% of the sheet width) so the screen and print layouts are identical.
    // The PDF is exported from `/resume?static` by scripts/export_resume_pdf.py: the GP is frozen on its first frame.
    const PDF = "/Simon_Lejoly_resume.pdf";
    // Printed in the PDF, which has no other way back to the animated page
    const ONLINE = "https://simlej18.github.io/resume";

    let sheet: HTMLElement;
    let paused = $state(false);
    let ready = $state(false);
    let gpWidth = $state(0);
    let gpHeight = $state(0);
    // Every heading marked `data-anchor` is an observation point of the GP, in the same order as on the main page.
    // Misc has none: it shares its row with Software, and two values at one height would pinch the samples.
    let anchorYs = $state<number[]>([]);
    const VALUES = [1.6, 2.4, 1.2, 2.0, 2.7, 1.4, 2.2];
    const points = $derived(anchorYs.map((y, i) => ({ x: y, y: (i % 2 === 0 ? -1 : 1) * VALUES[i % VALUES.length] })));

    function measure() {
        const top = sheet.getBoundingClientRect().top;
        anchorYs = [...sheet.querySelectorAll("[data-anchor]")].map(el => {
            const r = el.getBoundingClientRect();
            return r.top + r.height / 2 - top;
        });
    }

    onMount(() => {
        paused = new URLSearchParams(location.search).has("static");
        // After the static layout is applied and the fonts are in: both move the headings
        tick().then(() => document.fonts.ready).then(() => {
            measure();
            ready = true;
        });
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    });
</script>

<svelte:head><title>Simon Lejoly — Resume</title></svelte:head>

<div class="desk" class:static={paused}>
    <nav class="toolbar">
        <a class="btn btn-ghost btn-sm font-mono" href="/">← Website</a>
        <a class="btn btn-primary btn-sm" href={PDF} download>PDF version</a>
    </nav>

    <article bind:this={sheet} class="sheet" data-ready={ready || undefined}><div class="page">
        <aside class="gp text-accent-content" bind:clientWidth={gpWidth} bind:clientHeight={gpHeight}>
            {#if gpHeight > 0}
                <GPViz nSamples={10} resolution={Math.ceil(gpHeight / 6)} variance={1} lengthScale={gpHeight / 12}
                       width={gpWidth} height={gpHeight} {points} {paused} vertical showPoints={false}/>
            {/if}
            {#each points as p, i (i)}
                <span class="dot" style:top="{p.x}px" style:left="{gpWidth / 2 + p.y * gpWidth / 10}px"></span>
            {/each}
        </aside>

        <div class="content">
            <header>
                <div class="photo" style="background-image: url('/profile.jpg')"></div>
                <div>
                    <h1 data-anchor>Simon Lejoly</h1>
                    <p class="tagline">PhD student in Machine Learning · University of Namur</p>
                    <ul class="links">
                        {#each contactLinks as l (l.label)}
                            <li><a href={l.href}>{l.href.startsWith("mailto:") ? l.href.slice(7) : l.label}</a></li>
                        {/each}
                    </ul>
                </div>
            </header>

            <section>
                <h2 data-anchor>About</h2>
                <p class="lead">
                    I'm a PhD student working on <mark>probabilistic machine learning</mark>. I build models that know what they don't know,
                    write the software that makes them <em>fast</em>, and create <em>fancy animations</em> to make them
                    easy to understand. Currently focused on probabilistic models for <em>planetary science</em> data.
                </p>
            </section>

            <section>
                <h2 data-anchor>Education</h2>
                <ol class="entries">
                    {#each timeline as e (e.when)}
                        <li>
                            <time>{e.when}</time>
                            <div>
                                <b>{e.what}</b> · <i>{e.where}</i>
                                <p>{#each emphasised(e.text) as part, j (j)}{#if j % 2}<em>{part}</em>{:else}{part}{/if}{/each}</p>
                            </div>
                        </li>
                    {/each}
                </ol>
            </section>

            <section>
                <h2 data-anchor>Publications</h2>
                <ol class="entries">
                    {#each publications as p (p.slug)}
                        <li>
                            <time>{p.year}</time>
                            <div>
                                <a href={p.url || p.href}><b>{p.title}</b></a>
                                <p><Authors authors={p.authors}/> — <i>{p.venue}</i></p>
                            </div>
                        </li>
                    {/each}
                </ol>
            </section>

            <section>
                <h2 data-anchor>Talks & posters</h2>
                <ol class="entries">
                    {#each talks as t (t.slug)}
                        <li>
                            <time>{t.date || t.kind}</time>
                            <p><a href={t.href}><b>{t.title}</b></a> — <i>{t.venue}</i>{#if t.date} · {t.kind}{/if}</p>
                        </li>
                    {/each}
                </ol>
            </section>

            <div class="columns">
            <section>
                <h2 data-anchor>Software</h2>
                <ul class="software">
                    {#each software as s (s.url)}
                        <li>
                            <a href={s.url}><b>{s.name}</b></a>{#if s.stars} <span class="stars">★ {s.stars}</span>{/if}
                            <p>{s.description}</p>
                        </li>
                    {/each}
                </ul>
            </section>

            <section>
                <h2>Misc</h2>
                <ul class="misc">
                    {#each misc as m (m.title)}
                        <li>{m.icon} <b>{m.title}</b> — {m.text}</li>
                    {/each}
                </ul>
            </section>
            </div>

            <footer>
                <a class="screen-only" href={PDF}>Static PDF version</a>
                <a class="print-only" href={ONLINE}>Animated version: {ONLINE.replace("https://", "")}</a>
            </footer>
        </div>
    </div></article>
</div>

<style>
    .desk {
        min-height: 100vh;
        padding: 1rem 16px 3rem;
        background: var(--color-base-200);
    }
    .toolbar {
        display: flex;
        justify-content: space-between;
        max-width: 210mm;
        margin: 0 auto 1rem;
    }
    .sheet {
        container-type: inline-size;
        position: relative;
        width: min(100%, 210mm);
        aspect-ratio: 210 / 297;
        margin: 0 auto;
        overflow: hidden;
        background: var(--color-base-100);
        box-shadow: 0 0.5rem 2rem rgb(0 0 0 / 0.15);
    }
    /* Inner page: its cqw sizes resolve against the sheet, unlike the sheet's own */
    .page {
        height: 100%;
        display: grid;
        grid-template-columns: 14cqw 1fr;
        font-size: 1.4cqw;
        line-height: 1.3;
    }
    /* The PDF export renders the screen layout at print size, so the GP is drawn at its final pixel size */
    .static .sheet { width: 210mm; }

    @page { size: A4; margin: 0; }
    @media print {
        .desk { min-height: 0; padding: 0; background: none; }
        .toolbar, .screen-only { display: none; }
        .sheet { width: 210mm; height: 297mm; box-shadow: none; }
    }
    @media screen { .print-only { display: none; } }

    .gp { position: relative; }
    .dot {
        position: absolute;
        width: 1.6cqw;
        aspect-ratio: 1;
        translate: -50% -50%;
        border-radius: 50%;
        border: 0.35cqw solid var(--color-accent-content);
        background: var(--color-primary);
    }

    .content {
        display: flex;
        flex-direction: column;
        gap: 1.8cqw;
        padding: 4cqw 4.5cqw 2.5cqw 4cqw;
        min-width: 0;
    }

    header {
        display: flex;
        align-items: center;
        gap: 3.5cqw;
    }
    .photo {
        flex-shrink: 0;
        width: 13cqw;
        aspect-ratio: 1;
        border-radius: 30%;
        background-size: cover;
        background-position: center;
    }
    h1 {
        font-size: 5.2cqw;
        line-height: 1.1;
    }
    .tagline {
        margin-top: 0.6cqw;
        font-size: 1.9cqw;
        font-weight: 600;
        color: var(--color-accent-content);
    }
    .links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4cqw 1.8cqw;
        margin-top: 1.2cqw;
        font-family: var(--font-mono);
        font-size: 1.3cqw;
    }
    .links a:hover, .entries a:hover, .software a:hover { text-decoration: underline; }

    h2 {
        display: inline-block;
        margin-bottom: 0.8cqw;
        font-family: var(--font-mono);
        font-size: 1.4cqw;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        border-bottom: 0.45cqw solid var(--color-primary);
    }

    b { color: var(--color-accent-content); }
    .lead mark {
        background: none;
        color: var(--color-accent-content);
        font-weight: 700;
        text-decoration: underline 0.6cqw var(--color-primary);
        text-underline-offset: 0.3cqw;
    }

    .entries { display: flex; flex-direction: column; gap: 0.5cqw; }
    .entries li {
        display: grid;
        grid-template-columns: 10cqw 1fr;
        gap: 1.5cqw;
    }
    time {
        padding-top: 0.15cqw;
        font-family: var(--font-mono);
        font-size: 1.25cqw;
    }
    .entries p, .software p { font-size: 1.2cqw; }
    .entries li > p { font-size: inherit; }

    .columns {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 4cqw;
    }
    .software { display: flex; flex-direction: column; gap: 0.5cqw; }
    .software b { font-family: var(--font-mono); }
    .stars { font-family: var(--font-mono); font-size: 1.2cqw; }

    .misc { display: flex; flex-direction: column; gap: 0.5cqw; font-size: 1.2cqw; }

    footer {
        margin-top: auto;
        font-family: var(--font-mono);
        font-size: 1.2cqw;
        text-align: right;
    }
</style>
