<script>
export let award;
export let date;
export let byline;
export let update;
</script>
<div class='credits col-text'>
    <p class="byline">{@html byline}</p>
    <p class="byline small">{@html date}</p>
    <p class="byline small">{@html award}</p>
</div>

<style>
  .credits {
    margin-bottom: 4rem;
  }
  .byline {
    font-family: 'Montserrat', serif;
    font-weight: bold;
    font-size: .9rem;
    margin-top:0;
    margin-bottom: 0;
  }
  .small {
    font-size: .85rem;
    font-weight: 300;
  }
</style>