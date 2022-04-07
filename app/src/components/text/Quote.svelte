<script>
    export let quote;
    export let attribution;
</script>

<figure class='quote-wrapper wide'>
  <blockquote class='quote'>
  {#each quote as q}
    <p>{@html q.p}</p>
  {/each}
  </blockquote>
  <figcaption class='cite'>
    &mdash;<cite>{@html attribution}</cite> 
  </figcaption>
</figure>

<style>
    .quote-wrapper {
        background-color: #00000088;
        margin: 3rem auto;
        float: right;
        margin: 2rem 6rem;
        max-width: 30rem;
    }
    .quote { 
        margin: 0;
        padding: 2rem 3rem 0 3rem;
     }
     .quote p { 
        font-weight: 800;
        font-size: 1.5rem;
        line-height: 1.6;
        color: #FFFFFFCC;
    }
     .cite {
        font-family: 'Bitter', serif;
        text-align: right;
        font-size: 1.35rem;
        padding: 0 6rem 2rem 0;
     }
</style>