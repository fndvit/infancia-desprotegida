<script>
    import IntersectionObserver from 'svelte-intersection-observer';
    import Video from './Video.svelte'
    export let src;
    export let id;
    export let captions;

    const layout = 'wide';

    let element;
    let intersecting;

</script>

<IntersectionObserver {element} bind:intersecting threshold=.5>
<section class='wide interview {intersecting ? 'visible' : 'invisible'}' {id} bind:this={element}>
    <Video
        {src}
        {captions}
        {layout}
        controls = 'controls'
        scroll = false
    />
</section>
</IntersectionObserver>

<style>
    .interview { transition: opacity .5s; }
    .visible { opacity: 1; }
    .invisible { opacity: 0; }
</style>