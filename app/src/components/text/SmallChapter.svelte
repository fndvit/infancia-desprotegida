<script>
    import Text from './Text.svelte';
    export let text;
    export let header;
    export let list;

</script>

<div class='chapter-wrapper'>
    <section class='full chapter'>
        <div class='header-wrapper'><h2 class='col-text'>{@html header}</h2></div>
    </section>
</div>
<Text 
{text}
dropcap = false
/>
<ul class="col-text">
{#each list as li}
<li>{@html li}</li>
{/each}
</ul>

<style> 
  h2 {
    font-size: 4rem;
  }
  .header-wrapper {
      position:absolute;
      bottom:0;
      width: 100%;
  }
  .chapter-wrapper {
    height: 35vh;
    padding-bottom:3rem;
  }
  .full {
    height: 35vh;
  }
</style>