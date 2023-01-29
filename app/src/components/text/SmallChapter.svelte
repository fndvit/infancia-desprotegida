<script>
    import Text from './Text.svelte';
    export let text;
    export let header;
    export let list;

</script>
    <section class='full chapter'>
        <h2 class='col-text'>{@html header}</h2>
    </section>
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
  .full {
    margin-top: 2rem;
    padding-bottom:3rem;
    height:auto;
  }
</style>