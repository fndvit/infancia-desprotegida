<script>
  import { Canvas } from "svelte-canvas";
  import MiniVideo from "./MiniVideo.svelte";

  export let data;
  export let width;
  export let height;

  let video, currentTime;

</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video
  src="./video/por.mp4"
  bind:this={video}
  bind:currentTime
  height={60}
  autoplay
  loop
/>

<Canvas
  {width}
  {height}
  style="cursor: pointer"
>
  {#each data as d, i}
    <MiniVideo x={d.x} y={d.y} size={d.r} {video} {currentTime} />
  {/each}
</Canvas>

<style>
  video {
    position: absolute;
    left: -1000px;
  }
</style>
