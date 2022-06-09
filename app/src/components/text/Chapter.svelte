<script>
    import Video from '../multimedia/Video.svelte'
    export let src;
    export let id;
    export let chapter;
    export let header;

    const layout = '';
    let pos, element;
    const audible = false;

    $:if (element) chapter[id] = {pos: element.offsetTop, id: element.id};

</script>

<div class='chapter-wrapper'>
    <section class='full chapter' {id} bind:this={element}>
        <img class="full" src="img/{src}.gif" alt="" />
        <div class='header-wrapper'><h2 class='col-text'>{@html header}</h2></div>
    </section>
</div>

<style> 
  .header-wrapper {
      position:absolute;
      bottom:0;
      width: 100%;
  }
  .chapter-wrapper {
    height: 35vh;
    padding-bottom:3rem;
  }
  .short {
    height: 20vh!important;
    margin-bottom:1.5rem;
  }
  .full {
    height: 35vh;
  }
  img {
      position:absolute;
      top:0;
      object-fit: contain;
  }
</style>