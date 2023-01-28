<script>
import Scroller from "@sveltejs/svelte-scroller";
import Photo from "./Photo.svelte";

export let parts;

let index = 0;
let offset, time, duration, video;

$:fade = (index % 2 && offset < .1)
  ? 'in'
  : (index % 2 && offset > .9)
  ? 'out'
  : '';

$:active =  (index % 2 && index < 6);

const layout = 'cover absolute';
let audible = true;

$:src = (index < parts.length - 2) ? parts[index].video : parts[parts.length - 1].video;
$:poster = (index < parts.length - 2) ? parts[index].poster : parts[parts.length - 1].poster;

const boldFirst = (text) => {
  const [first, ...rest] = text.split(' ');
  return `<strong>${first}</strong> ${rest.join(' ')}`;
};

let height, play = false;
  $: vidSize = (height < 640)
    ? 'm'
    : (height < 720)
    ? 'l'
    : 'xl';

  const handlePlay = () => {
    play = !play;
    if (play) {
      time = 0;
      video.muted = false;
      video.loop = false;
    }
    
  }

$:muted = (active && play) ? false : 'muted';
let vh;
$:top = 16/vh;

</script>
<svelte:window bind:innerHeight={vh}/>

<Scroller bind:index bind:offset threshold=.3 top={top}>
  <div class="chapter interactive" slot="background" bind:clientHeight={height}>
      <div class="full absolute">
        <Photo
            src={poster}
            {layout}
        />
      </div>
      <div class="full absolute">
        <video
          bind:currentTime={time}
          bind:duration
          bind:this = {video}
          class='{layout} {fade}'
          preload='auto'
          poster='img/{src}.jpg'
          src='video/{src}_{vidSize}.mp4'
          {muted}
          autoplay=true
          playsinline=true
          loop=true
          controls={false}
          >
        </video>
      </div>
  </div>
  <div class={play ? 'not-interactive' : 'interactive'} slot="foreground">
    {#each parts as p,i}
    {#if p.p === 'Infància (des)protegida'}
      <section class="full title">
        <h1>{@html boldFirst(p.p)}</h1>
      </section>
      {:else}
      <section class="{play ? 'not-interactive' : 'interactive'} col-text">
        <div class="annotation">
          {#if i%2 === 0 || i > 5}
          <p class="intro">{@html p.p}</p>
          {:else}
          <p class="intro pointer" on:click="{() => handlePlay()}">
            {#if index % 2}
            <div class="sound"></div>
            {/if}
            {@html p.p}
          </p>
          {/if}
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
  .not-interactive {
    pointer-events: none;
  }
  .interactive {
    pointer-events: all;
  }
  .pointer { 
    cursor: pointer;
  }
  .sound {
    float: left;
    pointer-events: all;
    width: 32px;
    height: 32px;
    background-size: 32px 32px;
    background-position: center center;
    margin-top: 4px;
    padding: 0;
    padding-left: 2rem;
    background-repeat: no-repeat;
    filter: drop-shadow(1px 1px 9px rgba(0, 0, 0, 0.2));
    transition: opacity 1s;
    background-image: url("data:image/svg+xml,%3C!-- Generator: Adobe Illustrator 21.0.1, SVG Export Plug-In --%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:a='http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/' x='0px' y='0px' width='18px' height='17.5px' viewBox='0 0 18 17.5' style='enable-background:new 0 0 18 17.5;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23ffffff;%7D%0A%3C/style%3E%3Cdefs%3E%3C/defs%3E%3Cpath class='st0' d='M0,5.8v6h4l5,5v-16l-5,5H0z M13.5,8.8c0-1.8-1-3.3-2.5-4v8.1C12.5,12.1,13.5,10.5,13.5,8.8z M11,0v2.1 c2.9,0.9,5,3.5,5,6.7s-2.1,5.9-5,6.7v2.1c4-0.9,7-4.5,7-8.8S15,0.9,11,0z'/%3E%3C/svg%3E%0A");
  }
  p {
    padding: 2rem;
    margin: 0;
    font-size: 1.3rem;
  }
  @media screen and (min-width: 48rem) {
    p {
    padding: 2rem;
    margin: 0;
    font-size: 1.5rem;
  }
  }
  .intro {
    background-color: #252426AA;
  }
  .title {
    background: linear-gradient(180deg, rgba(37,36,38,0) 0%, rgba(37,36,38,1) 70%);
  }
  .annotation {
    padding-top: 50vh;
    position: relative;
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
  :global(.respecte) {
    font-size: 1.25rem;
    font-style: italic;
  }
</style>