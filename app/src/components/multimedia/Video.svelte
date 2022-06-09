<script>
  import { fade } from 'svelte/transition';

  export let audible;
  export let src;
  export let video;
  export let captions;
  export let time;
  export let active;
  export let duration;
  export let layout;
  export let controls = 'controls';
  export let index;
  export let id;
  export let paused;

  let width, play = false;
  $: vidSize = (width < 80)
    ? 'xl'
    : (width < 640)
    ? 's'
    : (width < 1280)
    ? 'm'
    : (width < 1920)
    ? 'l'
    : 'm';

  const handlePlay = () => {
    time = 0;
    play = true;
    index = id;
    video.muted = false;
    video.loop = false;
  }

  $:if(paused) {
    play = false;
    if (video) {
      video.pause();
      video.muted = true;
      video.loop = true;
    }
  }

</script>
<div class='{layout}' bind:clientWidth={width}>
<video
  bind:currentTime={time}
  bind:duration
  bind:this = {video}
  preload='auto'
  poster='img/{src}.jpg'
  src='video/{src}_{vidSize}.mp4'
  muted = {active && play ? false : 'muted'}
  autoplay=true
  playsinline=true
  loop=true
  controls={audible && play ? controls : false}
  >
  {#if captions}
  <track kind="captions" label="Catalan" srclang="ca" src={captions} default>
  {/if}
</video>

{#if !play && audible}
<div class="sound" transition:fade on:click="{() => handlePlay()}"></div>
{/if}
</div>
<style>
  .sound {
    pointer-events: all;
    position: absolute;
    right: 10px;
    width: 100%;
    height: 100%;
    background-size: 64px 64px;
    background-position: center center;
    padding: 0;
    background-repeat: no-repeat;
    top: 0;
    filter: drop-shadow(1px 1px 9px rgba(0, 0, 0, 0.2));
    transition: opacity 1s;
    background-image: url("data:image/svg+xml,%3C!-- Generator: Adobe Illustrator 21.0.1, SVG Export Plug-In --%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:a='http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/' x='0px' y='0px' width='18px' height='17.5px' viewBox='0 0 18 17.5' style='enable-background:new 0 0 18 17.5;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23ffffff;%7D%0A%3C/style%3E%3Cdefs%3E%3C/defs%3E%3Cpath class='st0' d='M0,5.8v6h4l5,5v-16l-5,5H0z M13.5,8.8c0-1.8-1-3.3-2.5-4v8.1C12.5,12.1,13.5,10.5,13.5,8.8z M11,0v2.1 c2.9,0.9,5,3.5,5,6.7s-2.1,5.9-5,6.7v2.1c4-0.9,7-4.5,7-8.8S15,0.9,11,0z'/%3E%3C/svg%3E%0A");
  }
</style>