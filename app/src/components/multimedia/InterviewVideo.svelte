<script>
    import IntersectionObserver from 'svelte-intersection-observer';
    import Scroller from "@sveltejs/svelte-scroller";
    import Video from './Video.svelte'
    export let src;
    export let id;
    export let captions;
    export let size;
    export let header;

    const layout = (size === 'small') ? 'col-text' : 'cover';
    const section = (size === 'small') ? 'col-text' : 'chapter';
    const audible = true;

    let element, index = 0, offset;
    let intersecting;

</script>

<IntersectionObserver {element} bind:intersecting threshold=.5>
    {#if size === 'small'}
    <section class='{section} interview {intersecting ? 'visible' : 'invisible'}' {id} bind:this={element}>
        <h4 class="title">{header}</h4>
        <Video
            {src}
            {captions}
            {layout}
            controls = 'controls'
            scroll = false
            active={intersecting}
            {audible}
        />
    </section>
    {:else}
    <Scroller bind:index bind:offset threshold=.3>
            <div class="not-interactive" slot="foreground" {id} bind:this={element}>
                <section class="not-interactive long-text col-text"><p class="not-interactive">{header}</p></section>
            </div>
            <div class="full" slot="background">
                <Video
                    {src}
                    {captions}
                    {layout}
                    controls = 'controls'
                    scroll = false
                    active={intersecting}
                    {audible}
                />
            </div>
    </Scroller>
    {/if}

</IntersectionObserver>

<style>
    :global(.background-container,svelte-scroller-background-container) {
        pointer-events: all!important;
    }
    :global(svelte-scroller-foreground) {
        pointer-events: none!important;
    }
    p {
        padding: 2rem;
        margin: 0;
        font-size: 1.5rem;
        background-color: #252426AA;
        color:#fff;
    }

    .not-interactive {
        pointer-events: none;
    }
    .interactive {
        pointer-events: all;
    }
    .long-text {
        height: 100vh!important;
        padding-top: 90vh!important;
    }
    .title {
        position: absolute;
        margin: 0;
        padding:0;
        padding-left:1rem;
        padding-top:1rem;
        width: calc(100% - 1rem);
        height: 6rem;
        color: #fff;
        background: linear-gradient(180deg, rgba(37,36,38,.7) 0%, rgba(37,36,38,0) 70%);
    }
    .interview {
        transition: opacity .5s;
        padding-top: 3rem;
        padding-bottom: 3rem;
    }
    .visible { opacity: 1; }
    .invisible { opacity: 0; }
</style>