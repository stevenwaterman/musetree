<script>
  import Track from "./track/Track.svelte";
  import Options from "./Options.svelte";
  import { audio } from "./track/audio.js";
</script>

<style>
  .columns {
    display: flex;
    flex-direction: row;
  }
</style>

<main>
  <div class="columns">
    <Track />
    <Options />
  </div>
</main>
