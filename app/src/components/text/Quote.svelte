<script>
    export let quote;
    export let attribution;
</script>

<figure class='quote-wrapper col-text'>
  <blockquote class='quote'>
  {#each quote as q}
    <p>{@html q.p}</p>
  {/each}
   <cite class="cite"> &mdash;{@html attribution}</cite> 
  </blockquote>
</figure>

<style>
    .quote { 
        margin: 2rem -3rem;
        padding: 2rem 3rem 3rem 3rem;
        background-color: #00000088;
     }
     .quote p { 
        font-size: 1.25rem;
        line-height: 1.8;
    }
     .cite {
        font-family: 'Bitter', serif;
        font-size: 1.25rem;
        line-height: 1.8;
        padding: 2rem 6rem 2rem 0;
     }
     .quote p, .cite {
      color: #FFFFFFCC;
     }
</style>