<script>
    import IntersectionObserver from 'svelte-intersection-observer';
    import Video from './Video.svelte'
    export let src;
    export let id;
    export let captions;
    export let color;

    const layout = 'cover';
    const audible = false;

    let element;
    let intersecting;

    $:color = intersecting && element.id;

</script>

<IntersectionObserver {element} bind:intersecting threshold=.7>
<section class='full chapter' {id} bind:this={element}>
    <Video
        {src}
        {captions}
        {layout}
        controls = ''
        scroll = false
        {audible}
    />
</section>
</IntersectionObserver>