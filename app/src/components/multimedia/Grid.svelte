<script>
    import { fade } from 'svelte/transition';
    export let videoList;
    export let id;

    const layout = 'mini grid-item';
    const section = 'wide grid';
    const audible = true;
    let width, time, captions;

    $:vids = [];
    let active = true;

    $: vidSize = (width < 80)
    ? 'xl'
    : (width < 640)
    ? 's'
    : (width < 1280)
    ? 'm'
    : (width < 1920)
    ? 'l'
    : 'm';

    const handleGridPlay = (e) => {
        let video = e.target;
        vids.forEach(v => {
            v.muted = true;
            v.loop = true;
            v.controls = false;
        })

        video.muted = false;
        video.loop = false;
        video.controls = 'controls'
        video.currentTime = 0;
        video.play()
        console.log(video)
    }

    

</script>

    <section class='{section} visible' {id}>
        {#each videoList as v,i}
        <div class="{layout}">
            <h4 class="title">{v.header}</h4>
            <div bind:clientWidth={width}>
                <video
                  bind:this = {vids[i]}
                  preload='auto'
                  poster='img/{v.src}.jpg'
                  src='video/{v.src}_{vidSize}.mp4'
                  muted = 'muted'
                  autoplay=true
                  playsinline=true
                  loop=true
                  controls=false
                  on:click|preventDefault={handleGridPlay}
                  >
                  {#if captions}
                  <track kind="captions" label="Catalan" srclang="ca" src={captions} default>
                  {/if}
                </video>
                
                <!-- <div class="sound" transition:fade></div> -->
                </div>
        </div>
        {/each}
    </section>

<style>
    .sound {
      pointer-events: none;
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
    :global(.background-container,svelte-scroller-background-container) {
        pointer-events: all!important;
    }
    :global(svelte-scroller-foreground) {
        pointer-events: none!important;
    }
    .interactive {
        pointer-events: all;
    }
    .title {
        position: absolute;
        pointer-events: none;
        top: 0;
        z-index: 10;
        margin: 0;
        padding:0;
        padding-left:1rem;
        padding-top:1rem;
        width: calc(100% - 1rem);
        height: 6rem;
        color: #fff;
        background: linear-gradient(180deg, rgba(37,36,38,.7) 0%, rgba(37,36,38,0) 70%);
    }
    .grid-item {
        transition: opacity .5s;
        display: inline-block;
        position: relative;
        margin-bottom: 1rem;
        margin-left: 1rem;
    }
    .visible { opacity: 1; }
    .invisible { opacity: 0; }
    .grid {
        padding:3rem 0;
    }
</style>