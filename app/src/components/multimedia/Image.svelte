<script>
  export let src;
  export let alt;
  export let size;
  export let format;

  let width;
  $: imgSize = (width < 960)
    ? 's'
    : 'l';

</script>
<div bind:clientWidth={width}>
<img
  src='img/{src}_{imgSize}.{format}'
  alt={alt}
  />
</div>
<style>
    div {
      width:90%;
      height: auto;
      margin: 0 auto
    }
    img {
        vertical-align: middle;
        width:100%;
    }
</style>