<script>
    import IntersectionObserver from 'svelte-intersection-observer';
    import Video from './Video.svelte'
    export let videos;
    export let id;

    const layout = 'mini grid-item';
    const section = 'wide grid';
    const audible = true;

    let vids = [];
    let active = true;

</script>

    <section class='{section} visible' {id}>
        {#each videos as v,i}
        <div class="{layout}">
            <h4 class="title">{v.header}</h4>
            <Video
                bind:this={vids[i]}
                src={v.src}
                captions={v.captions}
                controls = 'controls'
                scroll = false
                {audible}
                {active}
            />
        </div>
        {/each}
    </section>

<style>
    :global(.background-container,svelte-scroller-background-container) {
        pointer-events: all!important;
    }
    :global(svelte-scroller-foreground) {
        pointer-events: none!important;
    }
    .interactive {
        pointer-events: all;
    }
    .title {
        position: absolute;
        top: 0;
        z-index: 10;
        margin: 0;
        padding:0;
        padding-left:1rem;
        padding-top:1rem;
        width: calc(100% - 1rem);
        height: 6rem;
        color: #fff;
        background: linear-gradient(180deg, rgba(37,36,38,.7) 0%, rgba(37,36,38,0) 70%);
    }
    .grid-item {
        transition: opacity .5s;
        display: inline-block;
        position: relative;
        margin-bottom: 1rem;
        margin-left: 1rem;
    }
    .visible { opacity: 1; }
    .invisible { opacity: 0; }
    .grid {
        padding:3rem 0;
    }
</style>