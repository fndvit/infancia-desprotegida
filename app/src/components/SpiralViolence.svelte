<script>
  import Scatter from "./charts/Scatter.svelte";
  import Scroller from "@sveltejs/svelte-scroller";
  import { scaleLinear } from "d3-scale";

  export let text;

  let dots = text.map((d) => d.data / 100);
  let range = text.map((d) => d.range);

  let width, height;
  let progress = 0;

  console.log([...new Array(dots.length)].map((d, i) => i / (dots.length - 1)));

  let scaleRadius = scaleLinear().domain(dots).range(range);

  let scaleNumber = scaleLinear()
    .domain([...new Array(dots.length)].map((d, i) => i / (dots.length - 1)))
    .range(dots);

  $: n = progress < 0 ? 4 : Math.floor(scaleNumber(progress));

  $: data = [...new Array(n)].map((d, i) => {
    const z = Math.sqrt(i / n);
    const theta = i * 2.4;
    const x = width / 2 + (z * Math.cos(theta) * height) / 2;
    const y = height / 2 + (z * Math.sin(theta) * height) / 2;
    const r = scaleRadius(n);
    return { x: x, y: y, r: r };
  });
</script>

<div>
  <Scroller bind:progress>
    <div
      class="graphic"
      slot="background"
      bind:clientHeight={height}
      bind:clientWidth={width}
    >
      {#if height}
        <Scatter {width} {height} {data} />
      {/if}
    </div>
    <div slot="foreground">
      {#each text as p}
        <section>
          <p class="narrow">{p.p}</p>
        </section>
      {/each}
    </div>
  </Scroller>
</div>

<style>
  section {
    height: 100vh;
  }
  .graphic {
    height: 100vh;
    width: 100vw;
  }
  p {
    width: 50%;
    max-width: 24rem;
    padding: 1rem;
    margin: 0;
    font-size: 1.5rem;
  }
</style>
