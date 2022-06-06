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
    <section class='full chapter' {id} bind:this={element}>
        <Video
            {src}
            {captions}
            {layout}
            controls = ''
            scroll = false
        />
        <h2 class='col-text {id}'>{@html header}</h2>
    </section>
</div>

<style>
    .chapter-wrapper {
        height: 50vh;
    }
    h2 {
        margin-top: -20vh;
    }
  .header { 
      height: calc(50vh - 4rem);
      position:absolute;
      margin: 1rem 0 4rem -.5rem;
      padding: .5rem;

  }
  .full {
        height: calc(50vh - 2rem);
  }
</style>