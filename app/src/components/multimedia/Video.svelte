<script>
  export let src;
  export let captions;
  export let time;
  export let duration;
  export let layout = 'wide';
  export let scroll = false;
  export let controls = 'controls';

  let width;
  $: desktop = (width > 768);

</script>

<svelte:window bind:innerWidth={width} />

{#if !scroll}
<video
  class={layout}
  preload='auto'
  poster='img/{src}.jpg'
  src='video/{desktop ? `${src}`:`${src}-mobile`}.mp4'
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
	src='video/{desktop ? `${src}`:`${src}-mobile`}.mp4'
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

