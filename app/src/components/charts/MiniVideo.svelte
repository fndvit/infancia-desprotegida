<script>
  import { Layer } from "svelte-canvas";

  export let x = 0;
  export let y = 0;
  export let size = 1;
  export let currentTime;
  export let video;

  $: render = ({ context }) => {
    currentTime;
    context.drawImage(video, x, y, size, size);
  };
</script>

{#if video}
  <Layer {render} />
{/if}
