<script>
    import Video from '../multimedia/Video.svelte'
    export let src;
    export let id;
    export let chapter;
    export let captions;
    export let header;

    const layout = 'cover';
    let pos, element;

    $:if (element) chapter[id] = {pos: element.offsetTop, id: element.id};

</script>

<div class='chapter-wrapper'>
    <section class='full chapter sticky' {id} bind:this={element}>
        <Video
            {src}
            {captions}
            {layout}
            controls = ''
            scroll = false
        />
    </section>
    <section class='col-text'>
        <h2 class='header {id}'>{@html header}</h2>
    </section>
</div>

<style>
  .header { 
      height: calc(100vh - 4rem);
      position:relative;
      margin: 1rem 0 4rem -.5rem;
      padding: .5rem;
  }
  .sticky {
      position: sticky;
      top: 0;
  }
</style>