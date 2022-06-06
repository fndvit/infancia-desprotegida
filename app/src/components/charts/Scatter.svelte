<script>
  import { Canvas } from "svelte-canvas";
  import { Delaunay } from "d3-delaunay";
  import MiniVideo from "./MiniVideo.svelte";

  export let data;
  export let width;
  export let height;

  let video, currentTime;

  let picked = null,
    click = false;

  $: delaunay = Delaunay.from(
    data,
    (d) => d.x,
    (d) => d.y
  );

  $: console.log(video);
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
  on:mousemove={({ offsetX: x, offsetY: y }) => (picked = delaunay.find(x, y))}
  on:mouseout={() => (picked = null)}
  on:mousedown={() => (click = true)}
  on:mouseup={() => (click = false)}
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
