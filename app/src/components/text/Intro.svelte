<script>
export let text;
export let header;
</script>
<section class='col-text'>
  {#if header}
  <h2>{@html header}</h2>
  {/if}
  {#if text}
  {#each text as p,i}
	  <p>{@html p.p}</p>
  {/each}
  {/if}
</section>

<style>

</style>