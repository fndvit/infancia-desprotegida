<script>
  import Scatter from "./charts/Scatter.svelte";
  import Scroller from "@sveltejs/svelte-scroller";
  import { scaleLinear } from "d3-scale";

  export let text;

  let dots = text.map((d,i) => i === 0 ? 4 : d.data / 100);
  let range = text.map((d) => d.range);

  let width, height;
  let progress = 0;

  let scaleRadius = scaleLinear().domain(dots).range(range);

  let scaleNumber = scaleLinear()
    .domain([...new Array(dots.length)].map((d, i) => i / (dots.length - 1)))
    .range(dots);

  $: n = progress < 0 ? 4 : Math.floor(scaleNumber(progress));

  $: data = [...new Array(n)].map((d, i) => {
    const z = Math.sqrt(i / n);
    const theta = i * 2.4;
    const x = width / 2 + (z * Math.cos(theta) * width * .8) / 2;
    const y = height / 2 + (z * Math.sin(theta) * height * .8) / 2;
    const r = scaleRadius(n);
    return { x: x, y: y, r: r };
  });

</script>
<svelte:window bind:innerHeight={height} bind:innerWidth={width} />
<div class="graphic-wrapper">
  <Scroller bind:progress>
    <div
      class="graphic"
      slot="background"
    >
        <Scatter {width} {height} {data} />
    </div>
    <div slot="foreground">
      {#each text as p}
        <section class="col-text">
          <p class="narrow number">{Number(p.data).toLocaleString('de-DE')}</p>
          <p class="narrow">{p.p}</p>
        </section>
      {/each}
    </div>
  </Scroller>
</div>

<style>
  .graphic-wrapper {
    padding-bottom: 10rem;
  }
  section {
    padding-top:30vh;
    height: 100vh;
  }
  .graphic {
    height: 100vh;
    width: 100%;
  }
  p {
    width: 50%;
    max-width: 24rem;
    margin: 0;
    font-size: 1.5rem;
    padding-top:0;
  }
  .number {
    font-family: montserrat, serif;
    font-weight: 100;
    font-size: 3rem;
    margin-bottom: 0;
    padding-bottom:0;
  }
</style>
