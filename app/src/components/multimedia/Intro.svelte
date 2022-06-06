<script>
import Scroller from "@sveltejs/svelte-scroller";
import Video from './Video.svelte'
import Photo from "./Photo.svelte";

export let parts;

let index = 0;
let offset;

$:fade = (index % 2 && offset < .3)
  ? 'in'
  : (index % 2 && offset > .7)
  ? 'out'
  : '';

const layout = 'cover absolute';

$:src = (index < parts.length - 2) ? parts[index].video : parts[parts.length - 1].video;
$:poster = (index < parts.length - 2) ? parts[index].poster : parts[parts.length - 1].poster;

const boldFirst = (text) => {
  const [first, ...rest] = text.split(' ');
  return `<strong>${first}</strong> ${rest.join(' ')}`;
};

</script>
<Scroller bind:index bind:offset threshold=0>
  <div class="chapter" slot="background">
      <div class="full absolute">
        <Photo
            src={poster}
            {layout}
        />
      </div>
      <div class="full absolute">
        <Video
            {src}
            layout = '{layout} {fade}'
            controls = ''
            scroll = false
        />
      </div>
  </div>
  <div slot="foreground">
    {#each parts as p}
    {#if p.p === 'Infància (des)protegida'}
      <section class="full title">
        <h1>{@html boldFirst(p.p)}</h1>
      </section>
      {:else}
      <section class="col-text">
        <div class="annotation">
        <p class="intro">{p.p}</p>
        </div>
      </section>
      {/if}
    {/each}
  </div>
</Scroller>
<style>
  section {
    height: 100vh;
  }
  p {
    padding: 2rem;
    margin: 0;
    font-size: 1.5rem;
  }
  h1 {
    padding:6rem;
  }
  .intro {
    background-color: #252426AA;
  }
  .title {
    background: linear-gradient(180deg, rgba(37,36,38,0) 0%, rgba(37,36,38,1) 70%);
  }
  .annotation {
    padding-top: 50vh;
  }
  :global(.in) {
    opacity: 1;
  }
  :global(.out) {
    opacity: 0;
  }
  .full {
    transition: opacity 1s;
  }
  :global(.absolute) {
    position: absolute;
    top: 0;
  }
</style>