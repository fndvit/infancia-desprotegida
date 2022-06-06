<script>
  export let src;
  export let captions;
  export let time;
  export let duration;
  export let layout;
  export let scroll = false;
  export let controls = 'controls';

  let width;
  $: vidSize = (width < 854)
    ? 's'
    : (width < 1280)
    ? 'm'
    : (width < 1920)
    ? 'l'
    : 'xl';

</script>

<svelte:window bind:innerWidth={width} />
<!-- <div class="sound enablesound" style="opacity: 1;"></div> -->
{#if !scroll}
<video
  class={layout}
  preload='auto'
  poster='img/{src}.jpg'
  src='video/{src}_{vidSize}.mp4'
  muted
  autoplay=true
  playsinline=true
  loop=true
  {controls}
  >
  {#if captions}
  <track kind="captions" label="Catalan" srclang="ca" src={captions} default>
  {/if}
</video>

{:else}
<video
  bind:currentTime = {time}
  bind:duration = {duration}
  preload='auto'
  class={layout}
	poster='img/{src}.jpg'
  src='video/{src}_{vidSize}.mp4'
  muted
	autoplay=false
  playsinline=true
  loop=false
  {controls}
  >
  {#if captions}
  <track kind="captions" label="Catalan" srclang="ca" src={captions} default>
  {/if}
</video>
{/if}

<style>
  .enablesound {
    background-image: url("data:image/svg+xml,%3C!-- Generator: Adobe Illustrator 21.0.1, SVG Export Plug-In --%3E%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:a='http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/' x='0px' y='0px' width='18px' height='17.5px' viewBox='0 0 18 17.5' style='enable-background:new 0 0 18 17.5;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23ffffff;%7D%0A%3C/style%3E%3Cdefs%3E%3C/defs%3E%3Cpath class='st0' d='M0,5.8v6h4l5,5v-16l-5,5H0z M13.5,8.8c0-1.8-1-3.3-2.5-4v8.1C12.5,12.1,13.5,10.5,13.5,8.8z M11,0v2.1 c2.9,0.9,5,3.5,5,6.7s-2.1,5.9-5,6.7v2.1c4-0.9,7-4.5,7-8.8S15,0.9,11,0z'/%3E%3C/svg%3E%0A");
  }
  .sound {
    position: absolute;
    right: 10px;
    width: 100%;
    height: 100%;
    background-size: 64px 64px;
    background-position: center center;
    padding: 0;
    background-repeat: no-repeat;
    top: 0;
    opacity: .6;
    filter: drop-shadow(1px 1px 9px rgba(0, 0, 0, 0.2));
    transition: opacity 1s;
  }
</style>