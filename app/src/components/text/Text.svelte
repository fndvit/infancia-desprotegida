<script>
export let text;
export let list;
export let header;
export let dropcap = true;
</script>
<div class='col-text'>
  {#if header}
  <h3>{@html header}</h3>
  {/if}

  {#if text}
  {#each text as p,i}
      <p class='{i === 0 && dropcap === true ? 'has-dropcap' : ''}'>{@html p.p}</p>
  {/each}
  {/if}

  {#if list}
    <ul>
      {#each list as li}
      <li>{@html li}</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .has-dropcap:first-letter {
	  font-weight:300;
    float: left;
    font-size: 5rem;
    line-height: 0.65;
    margin: -.07rem 0.1em 0.5rem -1.2rem;
  }
</style>