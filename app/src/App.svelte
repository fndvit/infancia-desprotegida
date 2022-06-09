<script>
  import Intro from "./components/multimedia/Intro.svelte";
  import Text from "./components/text/Text.svelte";
  import Chapter from "./components/text/Chapter.svelte";
  import ChapterVideo from "./components/multimedia/ChapterVideo.svelte";
  import InterviewVideo from "./components/multimedia/InterviewVideo.svelte";
  import Notes from "./components/text/Notes.svelte";
  import Quote from "./components/text/Quote.svelte";
  import SpiralViolence from "./components/SpiralViolence.svelte";
  import Network from "./components/charts/Network.svelte";
  import Credits from "./components/text/Credits.svelte";
  import Grid from "./components/multimedia/Grid.svelte";
  import LineChart from "./components/LineChart.svelte";

  export let content, meta;

  let y;

  let chapter = {};

  $: currentChapter = Object.values(chapter).findIndex((d) => d.pos > y + 200);
  $: currentChapterId =
    currentChapter === -1
      ? Object.values(chapter).length - 1
      : currentChapter <= 1
      ? 0
      : currentChapter - 1;
  $: bg = Object.values(chapter)[currentChapterId]
    ? Object.values(chapter)[currentChapterId].id
    : "miedo";

  const components = {
    intro: Intro,
    text: Text,
    video: InterviewVideo,
    linechart: LineChart,
    chapter: Chapter,
    "chapter-video": ChapterVideo,
    notes: Notes,
    quote: Quote,
    network: Network,
    grid: Grid,
    "spiral-violence": SpiralViolence,
    credits: Credits
  };


</script>

<svelte:window bind:scrollY={y} />
<main>
  <article class={bg}>
    {#each content as block}
      {#if components[block.type]}
        <svelte:component
          this={components[block.type]}
          {...block}
          bind:chapter
        />
      {:else}
        <div>Ups, falta el component '{block.type}'</div>
      {/if}
    {/each}
  </article>
</main>

<style>
  :global(.por) {
    background-color: #252426;
    color: #f9f9f9;
  }
  :global(.oblit) {
    background-color: #749ed3;
    color: #252426;
  }
  :global(.violencia) {
    background-color: #cf4266;
    color: #000000;
  }
  :global(.resiliencia) {
    background-color: #f5d886;
    color: #252426;
  }
  :global(.ara) {
    background-color: #f3f3f3;
    color: #252426;
  }
</style>
